"""Write data.js for the capacity-interval deck from reviewed thesis-core results and the author's guidance document.

thesis-core results are read with `git show 83c16bf:<path>` (T17–T21, reviewed), never from the working tree, which holds
unreviewed T22 changes. THESIS_CORE overrides the repository path.
The preview of required vehicles at whole-yard task volumes is computed here from the saturated Okpo curves exactly as in
the guidance (00_总控/audit/response/占路运输全量审核意见与后续指导_20261009.md, §2.1: smallest K whose mean saturated
throughput reaches 99% of the daily volume) and checked against the table printed there. The per-vehicle anchors
(97 / 4, 600 / 30, 126 / 7) exist only in that document and are parsed from it.

  python capacity/make_data.py
"""
import csv
import io
import json
import math
import os
import re
import subprocess
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]                                   # 00.博士课题
REPO = Path(os.environ.get('THESIS_CORE') or ROOT / '30_研究' / 'thesis-core')
GUIDE = ROOT / '00_总控' / 'audit' / 'response' / '占路运输全量审核意见与后续指导_20261009.md'
COMMIT = '83c16bf'
MODELS = ['free', 'reserve', 'segment']
FLAG = {'yupu': ['a0ab16fceb94', '49d2383872e7'],   # Okpo map rev 1824, MY-B task mix: K 5–40 step 1, K 45–150 step 5
        'yantai': ['b82aa19b22af']}                 # Yantai map rev 395: K 1–40 step 1, K 45–150 step 5
DEMAND = {'yupu': {'regular': 97, 'peak': 194}, 'yantai': {'regular': 23, 'peak': 46}}   # tasks per 16-h day, checked below
T18 = 'results/t18_report_d10b9015cd4d/t18_summary.json'
T19 = 'results/t19_compare_c963b53c1dde/t19_summary.json'
T20 = 'results/t20_report_c12289dfda9d/t20_summary.json'
PREVIEW_D = [194, 300, 400, 600, 800]                    # rows of the guidance table (§2.1)
WHOLE_YARD = [300, 450, 600]                             # T22 regular levels


def show(path):
    return subprocess.run(['git', '-C', str(REPO), 'show', f'{COMMIT}:{path}'], capture_output=True, check=True).stdout.decode('utf-8-sig')


def curves(yard):
    rows = [r for d in FLAG[yard] for r in csv.DictReader(io.StringIO(show(f'results/{d}/curves.csv'))) if r['scen'] == 'main']
    out = {}
    for lev in ('regular', 'peak', 'saturated'):
        sel = [r for r in rows if r['level'] == lev]
        Ks = sorted({int(r['K']) for r in sel})
        get = {(r['model'], int(r['K'])): r for r in sel}
        assert all((m, k) in get for m in MODELS for k in Ks), (yard, lev)
        out[lev] = {'K': Ks, **{m: [[round(float(get[m, k][f'throughput_{s}']), 1) for s in ('mean', 'lo', 'hi')] for k in Ks] for m in MODELS}}
        if lev == 'saturated':   # service-time gap (whole-route reservation minus free flow), minutes, as in t17_flag.py:593
            out['gap'] = [[k, round(float(get['reserve', k]['flow_mean_mean']) - float(get['free', k]['flow_mean_mean']), 2)] for k in Ks if 5 <= k <= 40]
    return out


def bounds(yard):
    rows = [r for r in csv.DictReader(io.StringIO(show(f'results/{FLAG[yard][0]}/bounds.csv'))) if r['scen'] == 'main']
    t1t = [float(r['T1_tight_per_day']) for r in rows]
    cyc = [float(r['cycle_min']) for r in rows]
    return {'T1t': [round(sum(t1t) / len(t1t), 1), round(min(t1t), 1), round(max(t1t), 1)], 'cycle': round(sum(cyc) / len(cyc), 2)}


def required(sat, model, d):
    """Smallest grid K with mean saturated throughput >= 99% of d, as [lo, hi] (lo < hi where the grid skips), or None."""
    Ks, v = sat['K'], [x[0] for x in sat[model]]
    for i, k in enumerate(Ks):
        if v[i] >= 0.99 * d:
            prev = Ks[i - 1] if i else 0
            return [prev + 1 if k - prev > 1 else k, k]
    return None


t18, t19, t20 = (json.loads(show(p)) for p in (T18, T19, T20))
h1 = {'yupu': t18['H1']['main|reserve'], 'yantai': t20['change']['r395']['H1']['main|reserve']}
summ = {y: json.loads(show(f'results/{FLAG[y][0]}/summary.json'))['findings'] for y in FLAG}
topo = {'yupu': t19['yards']['yupu']['topology'], 'yantai': t20['change']['r395']['topology']}
flag = {}
for y in FLAG:
    c, b = curves(y), bounds(y)
    for lev in ('regular', 'peak'):   # with enough vehicles, free flow serves exactly the demand
        assert abs(c[lev]['free'][-1][0] - DEMAND[y][lev]) < 0.5, (y, lev, c[lev]['free'][-1])
    plateau = {m: round(next(e for e in t20['cmp'][y] if e['scen'] == 'main')['sat'][m]['platform'], 2) for m in ('reserve', 'segment')}   # 2 dp: 627.45 must show as 627
    flag[y] = {**c, **b, 'demand': DEMAND[y],
               'Kreq': {lev: {m: summ[y]['K_required'][f'main|{m}|{lev}'] for m in MODELS} for lev in ('regular', 'peak')},
               'Kstar20': [h1[y]['K_star_20'], *h1[y]['K_star_20_ci']], 'Kstar10': [h1[y]['K_star_10'], *h1[y]['K_star_10_ci']],
               'marg': [[x['K'], round(x['ratio'], 3)] for x in h1[y]['marginal']],
               'plateau': plateau,
               'alpha_summary': round(summ[y]['service_gap']['main|reserve']['alpha'], 2),
               'topo': {k: (round(v, 1) if isinstance(v, float) else v) for k, v in topo[y].items() if k in ('roads', 'km', 'junction_res', 'access', 'stops', 'cyclomatic')}}
    # alpha: log-log least-squares slope of the gap over K = 5–40, the method of t17_flag.py:595, for both yards alike.
    # Okpo's batch spans exactly K = 5–40, so it must reproduce the reviewed summary; Yantai's summary fits K = 2–150.
    pts = [(math.log(k), math.log(v)) for k, v in c['gap'] if v > 0]
    mx, my = sum(p[0] for p in pts) / len(pts), sum(p[1] for p in pts) / len(pts)
    a = sum((p[0] - mx) * (p[1] - my) for p in pts) / sum((p[0] - mx) ** 2 for p in pts)
    flag[y]['alpha'], flag[y]['coef'] = round(a, 2), round(math.exp(my - a * mx), 4)   # fitted gap = coef * K^alpha
assert flag['yupu']['alpha'] == flag['yupu']['alpha_summary'], (flag['yupu']['alpha'], flag['yupu']['alpha_summary'])
assert abs(flag['yupu']['T1t'][0] - t18['T1']['main']['T1t']) < 0.1, (flag['yupu']['T1t'], t18['T1']['main']['T1t'])
assert abs(flag['yupu']['plateau']['reserve'] - h1['yupu']['platform']['mean_K100_150']) < 0.1

# preview of required vehicles at whole-yard volumes (Okpo, saturated curves), checked against the guidance table
sat = flag['yupu']['saturated']
preview = {m: [required(sat, m, d) for d in PREVIEW_D] for m in MODELS}
guide = GUIDE.read_text(encoding='utf-8')


def cell(r):
    return '—' if r is None else (str(r[0]) if r[0] == r[1] else f'{r[0]}–{r[1]}')


table = {int(m.group(1)): [re.sub(r'（.*?）', '', g).strip() for g in m.groups()[1:]]
         for m in re.finditer(r'^\| (\d+)(?:（现高峰）)? \| ([^|]+) \| ([^|]+) \| ([^|]+) \|$', guide, re.M)}
for i, d in enumerate(PREVIEW_D):
    mine = [cell(preview['free'][i]), cell(preview['segment'][i]), cell(preview['reserve'][i])]
    want = [w if not w.startswith('>') else '—' for w in table[d]]
    assert mine == want, (d, mine, table[d])
res150 = sat['reserve'][-1][0]
assert sat['K'][-1] == 150 and preview['reserve'][-1] is None and abs(res150 - 654) < 1, res150

# the work-zone preview: the same reading on a grid of daily volumes
zone = {'D': list(range(100, 801, 25))}
for m in MODELS:
    zone[m] = [(lambda r: r and r[1])(required(sat, m, d)) for d in zone['D']]

# per-vehicle productivity: model at K = 30 (saturated) against the anchors of the guidance (§2.1)
k30 = sat['K'].index(30)
prod = {m: round(sat[m][k30][0] / 30, 1) for m in MODELS}
m = re.search(r'每台车每天 18–24 个：(\d+) / (\d+)；(\d+) / (\d+)；苏比克 (\d+) / (\d+)', guide)
anchors = [['yim', int(m.group(1)), int(m.group(2))], ['shen', int(m.group(3)), int(m.group(4))], ['heo', int(m.group(5)), int(m.group(6))]]
assert re.search(r'模型的单车上限 H/c̄ ≈ 23\.7 个/日（c̄ ≈ 40\.5 min）', guide)
hc = round(960 / flag['yupu']['cycle'], 1)
assert abs(hc - 23.7) < 0.1 and abs(prod['free'] - 19.9) < 0.15, (hc, prod)

# density criterion: daily volume / T1'
density = {'yupu': [[d, round(100 * d / flag['yupu']['T1t'][0], 1)] for d in [97, 194] + WHOLE_YARD],
           'yantai': [[d, round(100 * d / flag['yantai']['T1t'][0], 1)] for d in (23, 46)]}

DATA = {'source': {'repo': 'thesis-core', 'commit': COMMIT, 'guide': GUIDE.name}, 'flag': flag, 'preview': {'D': PREVIEW_D, 'res150': round(res150), **preview},
        'zone': zone, 'prod': prod, 'anchors': anchors, 'Hc': hc, 'density': density}
out = HERE / 'data.js'
out.write_text('// Generated by make_data.py from thesis-core %s (T17–T21) and the guidance of 2026-10-09; do not edit by hand.\nwindow.DATA=%s;\n'
               % (COMMIT, json.dumps(DATA, ensure_ascii=False, separators=(',', ':'))), encoding='utf-8')
for y in FLAG:
    F = flag[y]
    print(y, "T1'", F['T1t'], 'plateau', F['plateau'], 'share %.0f%%' % (100 * F['plateau']['reserve'] / F['T1t'][0]), 'K*20', F['Kstar20'],
          'Kreq', F['Kreq'], 'alpha', F['alpha'], F['alpha_summary'], 'cycle', F['cycle'], 'gap40', F['gap'][-1])
print('preview', {m: [cell(r) for r in preview[m]] for m in MODELS}, 'reserve at K=150', round(res150))
print('prod', prod, 'H/c', hc, 'anchors', anchors, 'density', density)
print(out, out.stat().st_size, 'bytes')
