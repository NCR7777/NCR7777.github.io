"""Write data.js for the traffic-orchestration deck (thesis chapter 4) from reviewed sources only.

- thesis-core at the reviewed commit a882742 (T17-T23), read with `git show`, never from the working tree (which holds
  unreviewed T27 changes). Everything that existed at 83c16bf is unchanged at a882742.
  * Saturated main-scenario curves, whole segments: Okpo T18 results/a0ab16fceb94 (K 5-40) + 49d2383872e7 (K 45-150),
    map rev 1824 (network identical to rev 1825); Yantai T20 results/b82aa19b22af (map r395, network identical to r396).
  * Safe release segment_safe and segmented dock roads (T22 batch main_safe): Okpo results/656e2da75368, Yantai
    results/930e637e0658 (scen main = whole segments, main_s = segmented at the stops); Okpo erection mix: T18
    f7ac88b60111 + dfb2758822ad (whole) and T22 erect_safe a1f485302418 (segmented).
  * T22 summary results/t22_report_3287d62c7916/ (t22_interval.csv, t22_anchor.csv, t22_demand.csv, t22_summary.json).
- Field fleet anchors (T24, full texts): literature library notes/occupancy_anchors_20261009.md section 1.8, read at the
  reviewed commit e483924.

THESIS_CORE and LIBRARY override the paths.   python orchestration/make_data.py
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
LIB = Path(os.environ.get('LIBRARY') or ROOT / '00..小论文' / 'Reference')
COMMIT, LIB_COMMIT = 'a882742', 'e483924'
FLAG = {'yupu': ['a0ab16fceb94', '49d2383872e7'], 'yantai': ['b82aa19b22af']}
SAFE = {'yupu': '656e2da75368', 'yantai': '930e637e0658'}
ERECT = ['f7ac88b60111', 'dfb2758822ad']
ERECT_SAFE = 'a1f485302418'
T22 = 'results/t22_report_3287d62c7916'
csv.field_size_limit(1 << 30)


def show(path, repo=REPO, commit=COMMIT):
    return subprocess.run(['git', '-C', str(repo), 'show', f'{commit}:{path}'], capture_output=True, check=True).stdout.decode('utf-8-sig')


def table(path):
    return list(csv.DictReader(io.StringIO(show(path))))


def curves(dirs, scen):
    return [r for d in dirs for r in table(f'results/{d}/curves.csv') if r['scen'] == scen and r['level'] == 'saturated']


def sel(rs, model):
    return sorted((r for r in rs if r['model'] == model), key=lambda r: int(r['K']))


def plateau(rs, model):                                            # mean throughput over the saturated K = 100-150
    return st.mean(float(r['throughput_mean']) for r in sel(rs, model) if 100 <= int(r['K']) <= 150)


def t1(dirs, scen):                                                # T1' per seed (10 seeds): mean, min, max
    v = [float(r['T1_tight_per_day']) for d in dirs for r in table(f'results/{d}/bounds.csv') if r['scen'] == scen]
    assert len(v) == 10, (dirs, scen, len(v))
    return [round(st.mean(v), 2), round(min(v), 1), round(max(v), 1)]


cfg = json.loads(show(f'results/{FLAG["yupu"][1]}/config.json'))['params']
DAY_S, RECOVER_S = cfg['day_s'], cfg['deadlock_recovery_s']      # 16-h day, 900 s teleport clearing
summ = json.loads(show(f'{T22}/t22_summary.json'))
ref = {r['block'] + ',' + r['rule']: r for r in table(f'{T22}/t22_interval.csv')}
out = {'source': {'repo': 'thesis-core', 'commit': COMMIT, 'day_h': DAY_S / 3600, 'recover_s': RECOVER_S}}

# ---------- capacity interval [best deadlock-free rule, T1'] (T22 section 4): plateaus as shares of T1' ----------
main = {y: curves(FLAG[y], 'main') for y in FLAG}
safe = {y: curves([SAFE[y]], 'main') for y in SAFE}
safe_s = {y: curves([SAFE[y]], 'main_s') for y in SAFE}
rows = []
for y, sec in (('yupu', 'whole'), ('yupu', 'stops'), ('yantai', 'whole')):
    if sec == 'whole':
        T = t1(FLAG[y][:1], 'main')
        p = {'reserve': plateau(main[y], 'reserve'), 'safe': plateau(safe[y], 'segment_safe'), 'segment': plateau(main[y], 'segment')}
    else:
        T = t1([SAFE[y]], 'main_s')
        p = {'reserve': plateau(safe_s[y], 'reserve'), 'safe': plateau(safe_s[y], 'segment_safe')}
    k = f'{y}|main,{sec}|'
    assert abs(T[0] - float(ref[k + 'reserve'][f'T1_{sec}'])) < 0.06, (y, sec, T)
    for m, v in p.items():                                         # same plateau as the reviewed T22 table (1 decimal there)
        assert abs(v - float(ref[k + {'safe': 'segment_safe'}.get(m, m)]['plateau'])) < 0.06, (y, sec, m, v)
    rows.append({'yard': y, 'sec': sec, 'T1t': T, 'plateau': {m: round(v, 2) for m, v in p.items()},
                 'share': {m: round(v / T[0], 4) for m, v in p.items()}})
assert round(rows[0]['plateau']['reserve']) == 627 and round(rows[0]['T1t'][0]) == 1720      # 627.45 shows as 627
out['interval'] = rows

# ---------- what segmenting the dock roads changes (T22 sections 3.5, 4): T1' against the reservation plateau ----------
er = curves(ERECT, 'erection')
er_s = curves([ERECT_SAFE], 'erection_s')
seg = {'main': {'T1': [rows[0]['T1t'][0], rows[1]['T1t'][0]], 'reserve': [rows[0]['plateau']['reserve'], rows[1]['plateau']['reserve']]},
       'erection': {'T1': [t1([ERECT_SAFE], 'erection')[0], t1([ERECT_SAFE], 'erection_s')[0]],
                    'reserve': [round(plateau(er, 'reserve'), 2), round(plateau(er_s, 'reserve'), 2)]}}
for b, v in seg.items():
    k = f'yupu|{b},'
    assert abs(v['T1'][0] - float(ref[k + 'whole|reserve']['T1_whole'])) < 0.06 and abs(v['T1'][1] - float(ref[k + 'whole|reserve']['T1_stops'])) < 0.06, (b, v)
    assert abs(v['reserve'][0] - float(ref[k + 'whole|reserve']['plateau'])) < 0.06 and abs(v['reserve'][1] - float(ref[k + 'stops|reserve']['plateau'])) < 0.06, (b, v)
gain = {b: [v['T1'][1] / v['T1'][0] - 1, v['reserve'][1] / v['reserve'][0] - 1] for b, v in seg.items()}
assert [round(100 * x, 1) for x in gain['main']] == [8.0, 0.3] and [round(100 * x, 1) for x in gain['erection']] == [76.5, 8.3], gain   # T22 §0.4 (+77% there is 76.49% rounded twice)
out['seg'] = seg

# ---------- saturated curves: safe release against reservation, the reference rule and free flow (T22 sections 2.1, 5) ----------
cur = {}
for y in FLAG:
    c = {m: [[int(r['K']), round(float(r['throughput_mean']), 2)] for r in sel(main[y], m)] for m in ('free', 'reserve', 'segment')}
    c['safe'] = [[int(r['K']), round(float(r['throughput_mean']), 2), round(float(r['throughput_lo']), 2), round(float(r['throughput_hi']), 2)]
                 for r in sel(safe[y], 'segment_safe')]
    top = max(c['safe'], key=lambda p: p[1])
    c['peak'], c['at150'] = top[:2], next(p[1] for p in c['safe'] if p[0] == 150)
    rs = summ['sat'][f'{y}|main']['rules']['whole|segment_safe']           # reviewed T22 readings
    assert top[0] == rs['K_at_max'] and abs(top[1] - rs['max']) < 0.06 and abs(c['at150'] - rs['at_150']) < 0.06, (y, top, rs)
    sh = summ['refusal'][f'{y}|main|main']                                  # waits that start with a criterion refusal
    c['refusal'] = [round(min(sh.values()), 4), round(max(sh.values()), 4)]
    c['T1t'] = rows[0 if y == 'yupu' else 2]['T1t'][0]
    cur[y] = c
assert cur['yupu']['peak'][0] == 31 and round(cur['yupu']['peak'][1]) == 279 and cur['yantai']['peak'][0] == 18 and round(cur['yantai']['peak'][1]) == 296
nv = summ['naive']['cases']
out['curve'] = cur
out['naive'] = {'checks': sum(c['checks'] for c in nv), 'mismatches': sum(c['mismatches'] for c in nv), 'deadlocks': sum(c['deadlocks'] for c in nv)}
assert out['naive'] == {'checks': 860291, 'mismatches': 0, 'deadlocks': 0}, out['naive']

# ---------- deadlocks of the reference rule (segment request, teleport clearing), saturated, per K ----------
dead = {}
for y in FLAG:
    dead[y] = [[int(r['K']), round(float(r['deadlocks_per_day_mean']), 1), round(float(r['deadlocks_per_day_lo']), 1),
                round(float(r['deadlocks_per_day_hi']), 1),
                round(float(r['deadlocks_per_day_mean']) * RECOVER_S / (int(r['K']) * DAY_S), 4)]   # vehicle-hours off the network, lower bound
               for r in sel(main[y], 'segment')]
okpo = [r for d in FLAG['yupu'] for r in table(f'results/{d}/curves.csv') if r['scen'] == 'main' and r['model'] == 'segment']
levels = {lev: round(st.median(float(r['deadlocks_per_day_mean']) for r in okpo if r['level'] == lev), 1) for lev in ('regular', 'peak')}
assert round(levels['regular']) == 26 and round(levels['peak']) == 83, levels      # 4-vehicle subset (Yim et al. 2008)
k100 = next(p for p in dead['yupu'] if p[0] == 100)
assert round(k100[1]) == 1911 and round(next(p for p in dead['yupu'] if p[0] == 150)[1]) == 2657, k100
out['deadlock'] = dead
out['deadLevels'] = levels

# ---------- per-vehicle productivity on Okpo and the cost of safety at K = 30 (T22 section 6.3) ----------
prod = {m: [[int(r['K']), round(float(r['throughput_mean']) / int(r['K']), 2)] for r in sel(main['yupu'], m)] for m in ('free', 'reserve', 'segment')}
prod['safe'] = [[int(r['K']), round(float(r['throughput_mean']) / int(r['K']), 2)] for r in sel(safe['yupu'], 'segment_safe')]
an = {(r['yard'], r['day_h'], r['model'], r['K']): r for r in table(f'{T22}/t22_anchor.csv')}
ff = an[('yupu', '16', 'free', '30')]
eff = {m: round(float(an[('yupu', '16', m, '30')]['per_truck']) / float(ff['per_truck']), 4) for m in ('reserve', 'segment', 'segment_safe')}
assert [round(100 * eff[m]) for m in ('reserve', 'segment', 'segment_safe')] == [61, 72, 46], eff      # T22 §6.3
out['prod'] = {**prod, 'ceiling': round(DAY_S / 60 / float(ff['total']), 2), 'cycle': float(ff['total']),
               'eff30': {'reserve': eff['reserve'], 'segment': eff['segment'], 'safe': eff['segment_safe']}}

# ---------- whole-yard vehicles needed on Okpo, whole segments, integer K (T22 section 6.1) ----------
dm = {(r['day_h'], r['demand'], r['model']): r for r in table(f'{T22}/t22_demand.csv') if r['yard'] == 'yupu' and r['section'] == 'whole'}
need = []
for h in ('16.0', '24.0'):
    for n in ('339', '500', '600', '678'):
        e = {'h': int(float(h)), 'n': int(n)}
        for m in ('free', 'reserve', 'segment', 'segment_safe'):
            r = dm[(h, n, m)]
            e[{'segment_safe': 'safe'}.get(m, m)] = int(r['K_req']) if r['K_req'].isdigit() else r['K_req']   # '>150', '>200' kept as text
            if m == 'segment_safe' and r['after_fail'] not in ('', '[]'):
                e['safe_fail'] = json.loads(r['after_fail'])                 # met at K_req, missed again just above
        need.append(e)
chk = {(e['h'], e['n']): e for e in need}
assert (chk[(16, 339)]['free'], chk[(16, 339)]['reserve'], chk[(24, 339)]['free'], chk[(24, 339)]['reserve']) == (17, 27, 12, 15)
assert (chk[(16, 600)]['free'], chk[(16, 600)]['reserve'], chk[(16, 600)]['segment'], chk[(24, 600)]['free'], chk[(24, 600)]['reserve'],
        chk[(24, 600)]['segment'], chk[(16, 678)]['reserve'], chk[(24, 678)]['reserve']) == (30, 88, 47, 20, 37, 27, 117, 46)
assert (chk[(24, 500)]['free'], chk[(24, 500)]['reserve']) == (17, 27)
lib = show('notes/occupancy_anchors_20261009.md', LIB, LIB_COMMIT)


def anchor(code):                                                  # | code | yard | daily moves | vehicles | per vehicle | hours | depth |
    c = [x.strip() for x in re.search(r'^\| %s \|(.+)$' % re.escape(code), lib, re.M).group(1).strip(' |').split('|')]
    return [int(re.sub(r'\D', '', c[1])), int(re.sub(r'\D', '', c[2])), c[4]]


anc = {'hhi': anchor('03-071'), 'shen': anchor('03-058')}
assert anc['hhi'][:2] == [500, 24] and anc['hhi'][2] == '24 h' and anc['shen'][:2] == [600, 30], anc
out['need'] = {'rows': need, 'kstar': summ['K_star']['yupu'], 'anchors': anc}

dst = Path(__file__).parent / 'data.js'
dst.write_text('// Generated by make_data.py from thesis-core %s and the literature library %s; do not edit by hand.\nwindow.DATA=%s;\n'
               % (COMMIT, LIB_COMMIT, json.dumps(out, ensure_ascii=False, separators=(',', ':'))), encoding='utf-8')
for r in rows:
    print(r['yard'], r['sec'], "T1'", r['T1t'], 'plateau', r['plateau'], 'share', r['share'])
print('segmenting (T1, reserve):', {b: [round(100 * x, 1) for x in g] for b, g in gain.items()})
print('safe release peak / at 150 / refusal:', {y: (c['peak'], c['at150'], c['refusal']) for y, c in cur.items()}, out['naive'])
print('deadlocks Okpo regular/peak (median over K)', levels, 'K=100', k100)
print('per vehicle eff at K=30', out['prod']['eff30'], 'ceiling', out['prod']['ceiling'])
print('vehicles needed', [(e['h'], e['n'], e['free'], e['segment'], e['reserve'], e['safe']) for e in need], 'anchors', anc)
print(dst, dst.stat().st_size, 'bytes')
