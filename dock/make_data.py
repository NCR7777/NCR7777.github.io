"""Write data.js for the dock-mouth deck.

Sources (read only):
  - thesis-core results at the reviewed commit 83c16bf, read with `git show` so the unreviewed working tree (T22) is never
    used: the T21 summary (t21_rho.csv, t21_p6.csv, t21_span.csv), the T21 crane-utilisation batches 1b06c6d46f0d (Okpo)
    and 87d02d32bc13 (Yantai), and the Okpo main-scenario batches a0ab16fceb94 + 49d2383872e7 (deadlock counts);
  - the author's review of 2026-10-09 (00_总控/audit/response/占路运输全量审核意见与后续指导_20261009.md): the probe tables of
    appendix A, and the table of section 2.5, which is checked against the batches.
THESIS_CORE and GUIDANCE override the paths.

  python dock/make_data.py
"""
import csv
import io
import json
import os
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
REPO = Path(os.environ.get('THESIS_CORE') or ROOT / '30_研究' / 'thesis-core')
GUIDE = Path(os.environ.get('GUIDANCE') or ROOT / '00_总控' / 'audit' / 'response' / '占路运输全量审核意见与后续指导_20261009.md')
COMMIT = '83c16bf'
T21 = 'results/t21_report_9eb8bf099d3a'
RHO = {'yupu': '1b06c6d46f0d', 'yantai': '87d02d32bc13'}
MAIN = ['a0ab16fceb94', '49d2383872e7']          # Okpo main scenario: K 5-40, K 45-150
YARD = {'yupu': '玉浦', 'yantai': '烟台'}
RULE = {'占路·整条路径预约': 'reserve', '占路·逐段申请': 'segment'}


def show(path):
    return subprocess.run(['git', '-C', str(REPO), 'show', f'{COMMIT}:{path}'], capture_output=True, check=True).stdout.decode('utf-8-sig')


def rows(path):
    return list(csv.DictReader(io.StringIO(show(path))))


def steady(r):
    """The package's steady-state test for a saturated reading: mix shift <= 2% and daily trend within 5%."""
    return abs(float(r['mix_shift_mean'])) <= 0.02 and abs(float(r['drift_mean'])) <= 0.05


# ---------- the rho curve: plateau over K = 100-150 per crane load, T21 (in-span lifts), both rules ----------
t21 = rows(f'{T21}/t21_rho.csv')
t20 = json.loads(show('results/t20_report_c12289dfda9d/t20_summary.json'))
rho, base = {}, {}
for y, name in YARD.items():
    sel = [r for r in t21 if r['船厂'] == name and r['曲线'].startswith('T21') and not r['键'].endswith('_o14') and r['规则'] in RULE]
    b = {RULE[r['规则']]: float(r['饱和平台 K=100–150']) for r in t21 if r['船厂'] == name and r['曲线'] == '不受吊车约束' and r['键'] == 'main' and r['规则'] in RULE}
    b['T1t'] = float(next(r for r in t21 if r['船厂'] == name and r['曲线'] == '不受吊车约束' and r['键'] == 'main')['T1′（高峰日组合，含吊车行）'])
    # t21_rho.csv rounds the crane-free plateau to 0.1 (627.5); take it unrounded from the T20 summary so it reads 627 as in the other decks
    cmp = next(e for e in t20['cmp'][y] if e['scen'] == 'main')['sat']
    assert all(abs(cmp[m]['platform'] - b[m]) < 0.06 for m in ('reserve', 'segment')), (y, b, cmp)
    b.update({m: cmp[m]['platform'] for m in ('reserve', 'segment')})
    base[y] = {k: round(v, 2) for k, v in b.items()}
    pts = {}
    for r in sel:
        p = pts.setdefault(r['键'], {'key': r['键'], 'rho': round(float(r['ρ']), 3), 'n6': round(float(r['P6/日']), 2)})
        m = RULE[r['规则']]
        p[m] = {'plat': round(float(r['饱和平台 K=100–150']), 1),
                'rel': round(100 * (float(r['饱和平台 K=100–150']) / b[m] - 1), 1),
                'busy150': round(100 * float(r['饱和 K=150 坞停靠路段被占']), 1),
                'wait150': round(float(r['饱和 K=150 等吊车']), 0),
                'waitPeak': round(float(r['等吊车 min/日']), 0),
                'trend': round(100 * float(r['逐日趋势 K≥100']), 1),
                'unsteady': [int(k) for k in r['不稳态的 K'].split(';') if k],
                'margin': round(float(r['坞口裕度（P6 固定）']), 2)}
    rho[y] = sorted(pts.values(), key=lambda p: p['rho'])

# ---------- saturated throughput against fleet size, per crane load (H2: when the decline appears) ----------
curves = {}
for y, d in RHO.items():
    cr = [r for r in rows(f'results/{d}/curves.csv') if r['level'] == 'saturated']
    out = {}
    for sc in sorted({r['scen'] for r in cr}):
        key = sc.removesuffix('_8d')
        if key.endswith('_o14'):
            continue
        p = next(q for q in rho[y] if q['key'] == key)
        c = {'key': key, 'rho': p['rho']}
        for m in ('reserve', 'segment'):
            sel = sorted((r for r in cr if r['scen'] == sc and r['model'] == m), key=lambda r: int(r['K']))
            c['K'] = [int(r['K']) for r in sel]
            c[m] = [[round(float(r['throughput_mean']), 1), int(steady(r)), round(100 * float(r['drift_mean']), 1)] for r in sel]
            # the summary's list of unsteady K (K >= 100) must follow from the same test
            assert [k for k, v in zip(c['K'], c[m]) if k >= 100 and not v[1]] == p[m]['unsteady'], (y, key, m)
            # deadlock-free off-road waiting: throughput rises with every added step of vehicles (quoted on the H2 slide)
            if m == 'reserve':
                assert all(b[0] > a[0] for a, b in zip(c[m], c[m][1:])), (y, key)
        out[key] = c
    curves[y] = sorted(out.values(), key=lambda c: c['rho'])

# ---------- in-span lifts: same crane load (13 a day), T20 (all erections by road) against T21 ----------
def t21row(name, curve, key, rule):
    return next(r for r in t21 if r['船厂'] == name and r['曲线'].startswith(curve) and r['键'] == key and r['规则'] == rule)
lift = {}
for rule, m in RULE.items():
    a, b = t21row('玉浦', 'T20', 'crane', rule), t21row('玉浦', 'T21', 'rho13', rule)
    lift[m] = {'wait': [round(float(a['等吊车 min/日']), 1), round(float(b['等吊车 min/日']), 1)],
               'busy': [round(100 * float(a['坞停靠路段被占（高峰）']), 1), round(100 * float(b['坞停靠路段被占（高峰）']), 1)],
               'plat': [round(float(a['饱和平台 K=100–150']), 1), round(float(b['饱和平台 K=100–150']), 1)]}

# ---------- cranes, erection rate, in-span share ----------
span = rows(f'{T21}/t21_span.csv')
cranes = {y: sorted({(r['dock'].split('·')[1], int(r['cranes'])) for r in span if r['yard'] == name}) for y, name in YARD.items()}
inspan = {y: round(sum(float(r['p6_share']) for r in span if r['yard'] == name and r['cls_05'] == '跨内'), 4) for y, name in YARD.items()}
p6 = [{'ships': int(r['ships']), 'units': int(r['units']), 'p6': float(r['p6_per_day']), 'rho': float(r['rho']), 'main': r['main'] == 'True'}
      for r in rows(f'{T21}/t21_p6.csv')]
n_okpo = sum(n for _, n in cranes['yupu'])
assert n_okpo == 3 and sum(n for _, n in cranes['yantai']) == 3
for q in p6:   # rho = P6 a day x 190 min / (cranes x 960 min)
    assert abs(q['p6'] * 190 / (n_okpo * 960) - q['rho']) < 0.002, q

# ---------- teleport clearing: deadlocks a day under segment request, Okpo main scenario ----------
mc = [r for d in MAIN for r in rows(f'results/{d}/curves.csv') if r['scen'] == 'main' and r['model'] == 'segment']
dl = lambda lev, K: round(float(next(r for r in mc if r['level'] == lev and int(r['K']) == K)['deadlocks_per_day_mean']), 1)
dead = {'regular': [40, dl('regular', 40)], 'peak': [150, dl('peak', 150)], 'sat100': [100, dl('saturated', 100)], 'sat150': [150, dl('saturated', 150)]}
assert [round(v[1]) for v in dead.values()] == [26, 83, 1911, 2657], dead   # as quoted in the review, section 2.2
dead['offnet100'] = round(dead['sat100'][1] * 900 / 3600)                     # vehicle-hours a day off the network at K = 100 (at least)
dead['offshare100'] = round(100 * dead['offnet100'] / (100 * 16))

# ---------- the author's probe (review, appendix A) and the table of section 2.5 ----------
md = GUIDE.read_text(encoding='utf-8')
num = lambda s: [float(x.replace(',', '')) for x in re.findall(r'[−-]?\d[\d,]*(?:\.\d+)?', s.replace('−', '-'))]


def mdtable(after):
    """Body rows of the first Markdown table after the line that starts with `after`."""
    tail = md[md.index(after):]
    block = []
    for l in tail.split('\n')[1:]:
        if l.startswith('|'):
            block.append(l)
        elif block:
            break
    return [[c.strip() for c in l.strip('|').split('|')] for l in block[2:]]


VAR = ['现模型', 'w12', 'sect', 'sect_bay']
ere = {r[0]: r for r in mdtable('**搭载组合**（P6 15%；饱和；K = 100；4 天）')}
crn = {r[0]: r for r in mdtable('**吊车节拍**（P6 = 14.67 个/日')}
probe = {'vars': VAR,
         'T1t': [num(ere[v][1])[0] for v in VAR], 'res': [num(ere[v][3])[0] for v in VAR], 'seg': [num(ere[v][4])[0] for v in VAR],
         'dl': [num(ere[v][5])[0] for v in VAR],
         'r97': {'seg': [num(crn[v][1])[0] for v in VAR], 'trend': [num(crn[v][2]) for v in VAR], 'dl': [num(crn[v][3])[0] for v in VAR],
                 'res': [(num(crn[v][4]) or [None])[0] for v in VAR]}}
assert probe['T1t'] == [703, 786, 1241, 1241] and probe['res'][0] == 582 and probe['seg'][2] == 959, probe

sec25 = mdtable('**坞口出现的下降：**')
want = {('玉浦', 'p6hi'): (num(sec25[0][2])[:3], [100, 120, 150]), ('玉浦', 'rho15'): (num(sec25[1][2])[:2], [100, 150]),
        ('烟台', 'rho14'): (num(sec25[2][2])[:2], [40, 150]), ('烟台', 'rho15'): (num(sec25[3][2])[:2], [40, 150])}
for (name, key), (vals, Ks) in want.items():
    y = 'yupu' if name == '玉浦' else 'yantai'
    c = next(c for c in curves[y] if c['key'] == key)
    got = [int(c['segment'][c['K'].index(k)][0] + 0.5) for k in Ks]   # half up, as the review rounds
    assert got == vals, (name, key, got, vals)

DATA = {'source': {'repo': 'thesis-core', 'commit': COMMIT, 'review': GUIDE.name}, 'base': base, 'rho': rho, 'curves': curves,
        'lift': lift, 'cranes': cranes, 'inspan': inspan, 'p6': p6, 'dead': dead, 'probe': probe}
out = Path(__file__).parent / 'data.js'
out.write_text('// Generated by make_data.py from thesis-core %s (T20–T21) and the author\'s review of 2026-10-09; do not edit by hand.\n'
               'window.DATA=%s;\n' % (COMMIT, json.dumps(DATA, ensure_ascii=False, separators=(',', ':'))), encoding='utf-8')
for y in YARD:
    print(y, 'base', base[y], 'cranes', cranes[y], 'in-span', inspan[y])
    for p in rho[y]:
        print('  ρ %.2f  res %s (%+.1f%%)  seg %s (%+.1f%%) unsteady %s  busy150 %s/%s' % (p['rho'], p['reserve']['plat'], p['reserve']['rel'], p['segment']['plat'],
              p['segment']['rel'], p['segment']['unsteady'], p['reserve']['busy150'], p['segment']['busy150']))
print('lift', lift)
print('dead', dead)
print('probe', probe)
print(out, out.stat().st_size, 'bytes')
