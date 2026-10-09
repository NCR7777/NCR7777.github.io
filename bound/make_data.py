"""Write data.js for the bound deck (occupancy model and network bounds) from reviewed results only.

Results come from thesis-core with `git show 83c16bf:<path>` (T21, passed review 2026-10-09), never from the working tree.
The robustness probe exists only in the author's review (appendix A), so its two tables are parsed from that Markdown file.
THESIS_CORE and GUIDANCE override the two paths.

  python bound/make_data.py
"""
import collections
import csv
import io
import json
import os
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
REPO = Path(os.environ.get('THESIS_CORE') or ROOT / '30_研究' / 'thesis-core')
GUIDANCE = Path(os.environ.get('GUIDANCE') or ROOT / '00_总控' / 'audit' / 'response' / '占路运输全量审核意见与后续指导_20261009.md')
COMMIT = '83c16bf'
BOUNDS = {'yupu': 'a0ab16fceb94', 'yantai': 'b82aa19b22af'}   # main-scenario batches: Okpo map rev 1824, Yantai rev 395
ERECTION = 'f7ac88b60111'                                     # Okpo erection mix (P6 15%)
RHO = {'yupu': '1b06c6d46f0d', 'yantai': '87d02d32bc13'}      # T21 crane-cadence batches: the case-by-case check of T1'
T18 = 'results/t18_report_d10b9015cd4d/t18_summary.json'
T21 = 'results/t21_report_9eb8bf099d3a/t21_summary.json'
SCENS = ['main', 'w+1.5', 'w-1.5', 'empty_excl', 'empty_free']
# binding resource -> chart group. Yantai's results give one name to 12 door nodes; the project control reran the 83c16bf code
# and found the nine "入口001节点" seeds at the two doors of building 014 (5 + 4) and the remaining seed at building 007's door
# (00_总控/tasks.md, 2026-10-09), which the counts below check.
BIND = {'道路161（W=9.0，1095 m）': 'r161', '道路010-6（W=12.0，168 m）': 'r010', '道路026（W=18.0，348 m）': 'r026',
        '路口 入口001节点': 'b014', '路口 入口004节点': 'b007'}
csv.field_size_limit(1 << 30)


def show(path):
    return subprocess.run(['git', '-C', str(REPO), 'show', f'{COMMIT}:{path}'], capture_output=True, check=True).stdout.decode('utf-8-sig')


def rows(path):
    return list(csv.DictReader(io.StringIO(show(path))))


def mean(v):
    return sum(v) / len(v)


# ---------- per-seed T1 and T1' (main scenario), and the sensitivity scenarios ----------
seeds, sens = {}, {}
for y, d in BOUNDS.items():
    b = rows(f'results/{d}/bounds.csv')
    seeds[y] = [{'seed': int(r['seed']), 'T1': round(float(r['T1_network_per_day']), 1), 'T1t': round(float(r['T1_tight_per_day']), 1),
                 'bind': BIND[r['tight_binding_1']], 'price': round(float(r['tight_price_1_per_h']), 1)} for r in b if r['scen'] == 'main']
    assert len(seeds[y]) == 10, (y, len(seeds[y]))
    sens[y] = {}
    for sc in SCENS:
        sel = [r for r in b if r['scen'] == sc]
        t1, t1t = [float(r['T1_network_per_day']) for r in sel], [float(r['T1_tight_per_day']) for r in sel]
        sens[y][sc] = {'T1': round(mean(t1)), 'T1t': round(mean(t1t)), 'lo': round(min(t1t)), 'hi': round(max(t1t)),
                       'cycle': round(mean([float(r['cycle_min']) for r in sel]), 1)}
assert collections.Counter(s['bind'] for s in seeds['yantai']) == {'b014': 9, 'b007': 1}
er = [r for r in rows(f'results/{ERECTION}/bounds.csv') if r['scen'] == 'erection']
erection = {'T1': round(mean([float(r['T1_network_per_day']) for r in er])), 'T1t': round(mean([float(r['T1_tight_per_day']) for r in er])),
            'cycle': round(mean([float(r['cycle_min']) for r in er]), 1), 'n161': sum(r['tight_binding_1'].startswith('道路161') for r in er)}

# T18 summary: binding resources and dual prices, the reservation plateau; must agree with the bounds files
t18 = json.loads(show(T18))
m18 = t18['T1']['main']
assert abs(m18['T1t'] - mean([s['T1t'] for s in seeds['yupu']])) < 0.1 and abs(m18['T1'] - mean([s['T1'] for s in seeds['yupu']])) < 0.1
assert abs(t18['T1']['erection']['T1t'] - erection['T1t']) < 0.5
H = 960   # minutes in a 16-h working day; vehicles per extra hour = price / (H / cycle)
prices = {'main': [[k, v['seeds'], round(v['price_per_h'], 1), round(v['price_per_h'] / (H / sens['yupu']['main']['cycle']), 1)]
                   for k, v in sorted(m18['binding_T1t'].items(), key=lambda kv: -kv[1]['seeds'])],
          'erection': [[k, v['seeds'], round(v['price_per_h'], 1), round(v['price_per_h'] / (H / erection['cycle']), 1)]
                       for k, v in t18['T1']['erection']['binding_T1t'].items()]}
plateau = round(m18['platform']['mean_K100_150'])          # whole-route reservation, saturated, mean of K = 100-150
t18check = {k: [v['points'], round(v['max_ratio'], 3), v['over_strict']] for k, v in t18['T1_tight_check'].items()}

# ---------- case-by-case check of T1' on the T21 batches: throughput / T1' of the completed mix ----------
t21all = json.loads(show(T21))
t21 = t21all['T1_tight_check']
hist, check, high = {}, {}, collections.Counter()   # high: points with ratio >= 0.9, by whether the scenario's crane load rho >= 0.92
for y, d in RHO.items():
    pts = [r for r in rows(f'results/{d}/points.csv') if r['model'] != 'free']
    rat = [float(r['throughput']) / float(r['T1_tight_mix']) for r in pts]
    assert len(rat) == t21[y]['points'] and abs(max(rat) - t21[y]['max_ratio']) < 1e-9 and t21[y]['over_strict'] == 0, y
    h = collections.Counter(min(int(v * 20), 20) for v in rat)   # bins of 0.05; bin 20 holds ratios >= 1
    hist[y] = [h.get(i, 0) for i in range(21)]
    check[y] = {'n': len(rat), 'max': round(max(rat), 3), 'over': sum(v > 1 for v in rat), 'at': t21[y]['max_at']}
    rho = {e['scen']: e['rho'] for e in t21all['rho'][y]}
    for r, v in zip(pts, rat):
        if v >= 0.9:
            high['rho>=0.92' if rho[r['scen'].replace('_8d', '')] >= 0.92 else 'rho<0.92'] += 1
assert hist['yupu'][20] == hist['yantai'][20] == 0

# ---------- author's review, appendix A: the road-161 probe (T1' over 10 seeds; simulations over 3 seeds) ----------
app = GUIDANCE.read_text(encoding='utf-8').split('## 附录 A')[1].split('## 附录 B')[0]
num = lambda s: float(s.replace(',', ''))


def table_after(label):
    part = app.split(label, 1)[1]
    lines = [l for l in part.splitlines() if l.startswith('|')]
    out = []
    for l in lines[2:]:                       # skip the header and the separator
        c = [x.strip() for x in l.strip('|').split('|')]
        out.append(c)
        if len(out) == 4:
            break
    return out


VAR = {'现模型': 'base', 'w12': 'w12', 'sect': 'sect', 'sect_bay': 'bay'}
_prev = []


def binding(txt):
    """'道路161 5 次，道路010-6 4 次' / '道路161（10/10）' / '道路161 的坞前 50 m 段（10/10）' / '同上' -> [[road, seeds, dock piece], ...]"""
    global _prev
    if txt != '同上':
        _prev = [[r, int(a or b), bool(d)] for r, d, a, b in re.findall(r'道路([\d-]+)( 的坞前 50 m 段)?(?:（(\d+)/10）| (\d+) 次)', txt)]
        assert _prev, txt
    return _prev
robust = {'main': [], 'erection': []}
for c in table_after('**主情景**'):
    r60, r120 = (num(x) for x in c[3].split('/'))
    robust['main'].append({'v': VAR[c[0]], 'T1t': num(c[1]), 'bind': binding(c[2]), 'res': r120, 'res60': r60})
for c in table_after('**搭载组合**'):
    robust['erection'].append({'v': VAR[c[0]], 'T1t': num(c[1]), 'bind': binding(c[2]), 'res': num(c[3])})
assert [r['T1t'] for r in robust['main']] == [1720, 1805, 1857, 1857], robust['main']
assert [r['T1t'] for r in robust['erection']] == [703, 786, 1241, 1241], robust['erection']
assert robust['main'][0]['T1t'] == round(mean([s['T1t'] for s in seeds['yupu']])) and robust['erection'][0]['T1t'] == erection['T1t']

DATA = {'source': {'repo': 'thesis-core', 'commit': COMMIT, 'guidance': GUIDANCE.name}, 'seeds': seeds, 'sens': sens, 'erection': erection,
        'prices': prices, 'plateau': plateau, 't18check': t18check, 'hist': hist, 'check': check, 'high': [sum(high.values()), high['rho>=0.92']], 'robust': robust}
out = Path(__file__).parent / 'data.js'
out.write_text('// Generated by make_data.py from thesis-core %s and the author\'s review (appendix A); do not edit by hand.\nwindow.DATA=%s;\n'
               % (COMMIT, json.dumps(DATA, ensure_ascii=False, separators=(',', ':'))), encoding='utf-8')
for y in seeds:
    print(y, 'T1', round(mean([s['T1'] for s in seeds[y]])), "T1'", round(mean([s['T1t'] for s in seeds[y]])),
          'range', min(s['T1t'] for s in seeds[y]), max(s['T1t'] for s in seeds[y]), collections.Counter(s['bind'] for s in seeds[y]))
print('sens', sens)
print('erection', erection, 'prices', prices, 'plateau', plateau)
print('check', {y: {k: v for k, v in c.items() if k != 'at'} for y, c in check.items()}, 'total', sum(c['n'] for c in check.values()))
print('max at', check['yupu']['at'])
print('ratio >= 0.9:', dict(high))
print('hist', hist)
print('robust', robust)
print('t18check', t18check)
print(out, out.stat().st_size, 'bytes')
