"""Write data.js for the traffic-orchestration deck (thesis chapter 4) from reviewed sources only.

- thesis-core results at the reviewed commit 83c16bf (T17-T21), read with `git show`, never from the working tree
  (which holds unreviewed T22 changes). Main scenarios: Okpo results/a0ab16fceb94 (K 5-40) + 49d2383872e7 (K 45-150),
  MY-B task mix, map rev 1824 (road network identical to rev 1825, T21 report section 1.2); Yantai results/b82aa19b22af,
  map rev 395 (identical network to rev 396). Resources are whole segments (one resource per road).
- Two tables that exist only in the author's guidance of 2026-10-09
  (00_总控/audit/response/占路运输全量审核意见与后续指导_20261009.md): the reviewer's probe on road 161 (appendix A,
  main-scenario table) and the per-vehicle field anchors (section 3, question 1).

THESIS_CORE and GUIDANCE override the paths.   python orchestration/make_data.py
"""
import csv
import io
import json
import os
import re
import statistics as st
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]                     # 00.博士课题
REPO = Path(os.environ.get('THESIS_CORE') or ROOT / '30_研究' / 'thesis-core')
GUIDE = Path(os.environ.get('GUIDANCE') or ROOT / '00_总控' / 'audit' / 'response' / '占路运输全量审核意见与后续指导_20261009.md')
COMMIT = '83c16bf'
FLAG = {'yupu': ['a0ab16fceb94', '49d2383872e7'], 'yantai': ['b82aa19b22af']}
T20 = 'results/t20_report_c12289dfda9d/t20_summary.json'
csv.field_size_limit(1 << 30)


def show(path):
    return subprocess.run(['git', '-C', str(REPO), 'show', f'{COMMIT}:{path}'], capture_output=True, check=True).stdout.decode('utf-8-sig')


def rows(yard):
    return [r for d in FLAG[yard] for r in csv.DictReader(io.StringIO(show(f'results/{d}/curves.csv'))) if r['scen'] == 'main']


def sel(rs, model, level):
    return sorted((r for r in rs if r['model'] == model and r['level'] == level), key=lambda r: int(r['K']))


cfg = json.loads(show(f'results/{FLAG["yupu"][1]}/config.json'))['params']
DAY_S, RECOVER_S = cfg['day_s'], cfg['deadlock_recovery_s']      # 16-h day, 900 s teleport clearing
t20 = json.loads(show(T20))
out = {'source': {'repo': 'thesis-core', 'commit': COMMIT, 'day_h': DAY_S / 3600, 'recover_s': RECOVER_S}}

# ---------- capacity interval: plateau (mean of saturated K = 100-150) against T1' (mean of 10 seeds) ----------
interval = {}
for y in FLAG:
    rs = rows(y)
    b = [r for r in csv.DictReader(io.StringIO(show(f'results/{FLAG[y][0]}/bounds.csv'))) if r['scen'] == 'main']
    t1t = [float(r['T1_tight_per_day']) for r in b]
    plat = {m: st.mean(float(r['throughput_mean']) for r in sel(rs, m, 'saturated') if 100 <= int(r['K']) <= 150) for m in ('reserve', 'segment')}
    ref = next(e for e in t20['cmp'][y] if e['scen'] == 'main')['sat']
    for m in plat:                                                 # same plateau as the reviewed T20 summary
        assert abs(plat[m] - ref[m]['platform']) < 0.05, (y, m, plat[m], ref[m]['platform'])
    interval[y] = {'T1t': [round(st.mean(t1t), 1), round(min(t1t), 1), round(max(t1t), 1)],
                   'T1': round(st.mean(float(r['T1_network_per_day']) for r in b), 1),
                   'plateau': {m: round(v, 2) for m, v in plat.items()},              # 2 decimals: no double rounding (627.45 shows as 627)
                   'share': {m: round(v / st.mean(t1t), 4) for m, v in plat.items()},
                   'cycle_min': round(st.mean(float(r['cycle_min']) for r in b), 2)}
assert abs(interval['yupu']['T1t'][0] - 1720) < 1, interval['yupu']['T1t']   # guidance 0.1: 1,720 reproduced per seed
out['interval'] = interval

# ---------- deadlocks of the reference rule (segment request, teleport clearing), saturated, per K ----------
dead = {}
for y in FLAG:
    dead[y] = [[int(r['K']), round(float(r['deadlocks_per_day_mean']), 1), round(float(r['deadlocks_per_day_lo']), 1),
                round(float(r['deadlocks_per_day_hi']), 1),
                round(float(r['deadlocks_per_day_mean']) * RECOVER_S / (int(r['K']) * DAY_S), 4)]   # vehicle-hours off the network, lower bound
               for r in sel(rows(y), 'segment', 'saturated')]
okpo = rows('yupu')
levels = {lev: round(st.median(float(r['deadlocks_per_day_mean']) for r in sel(okpo, 'segment', lev)), 1) for lev in ('regular', 'peak')}
assert round(levels['regular']) == 26 and round(levels['peak']) == 83, levels      # guidance 2.2: 26 and 83 a day
k100 = next(p for p in dead['yupu'] if p[0] == 100)
assert round(k100[1]) == 1911 and round(next(p for p in dead['yupu'] if p[0] == 150)[1]) == 2657, k100
out['deadlock'] = dead
out['deadLevels'] = levels                                       # Okpo, median over the K grid, 4-vehicle-subset task volumes

# ---------- per-vehicle productivity on Okpo (saturated): tasks per vehicle per 16-h day ----------
prod = {m: [[int(r['K']), round(float(r['throughput_mean']) / int(r['K']), 2)] for r in sel(okpo, m, 'saturated')]
        for m in ('free', 'reserve', 'segment')}
md = GUIDE.read_text(encoding='utf-8')
m = re.search(r'Yim 2008：(\d+) / (\d+)；Shen 2018：(\d+) / (\d+)；Heo 2013 苏比克：(\d+) / (\d+)', md)
a = [int(x) for x in m.groups()]
anchors = [['Yim 2008', a[0], a[1]], ['Shen 2018', a[2], a[3]], ['Heo 2013', a[4], a[5]]]
out['prod'] = {**prod, 'ceiling': round(DAY_S / 60 / interval['yupu']['cycle_min'], 2), 'anchors': anchors}

# ---------- reviewer's probe on road 161, main scenario (guidance appendix A) ----------
blk = md.split('**主情景**（MY-B 流向组合；饱和；4 天，计第 2–4 天）：', 1)[1].split('\n\n', 2)[1]
num = lambda s: int(s.replace(',', ''))
probe = {}
for line in blk.splitlines():
    c = [x.strip() for x in line.strip('|').split('|')]
    if c[0] in ('现模型', 'w12', 'sect', 'sect_bay'):
        probe[c[0]] = {'T1t': num(c[1]), 'reserve': [num(x) for x in c[3].split('/')], 'segment': [num(x) for x in c[4].split('/')]}
assert list(probe) == ['现模型', 'w12', 'sect', 'sect_bay'] and probe['现模型']['T1t'] == 1720, probe
base = probe.pop('现模型')
out['probe'] = {'base': base, 'variants': [[k, v] for k, v in probe.items()]}

dst = Path(__file__).parent / 'data.js'
dst.write_text('// Generated by make_data.py from thesis-core %s and the author\'s guidance of 2026-10-09; do not edit by hand.\nwindow.DATA=%s;\n'
               % (COMMIT, json.dumps(out, ensure_ascii=False, separators=(',', ':'))), encoding='utf-8')
for y, v in interval.items():
    print(y, "T1'", v['T1t'], 'T1', v['T1'], 'plateau', v['plateau'], 'share', v['share'], 'cycle', v['cycle_min'])
print('deadlocks Okpo regular/peak (median over K)', levels, 'K=100', k100, 'Yantai K=100', next(p for p in dead['yantai'] if p[0] == 100))
print('per vehicle at K=30', {m: next(p[1] for p in prod[m] if p[0] == 30) for m in prod}, 'ceiling', out['prod']['ceiling'], 'anchors', anchors)
print('probe', base, probe)
print(dst, dst.stat().st_size, 'bytes')
