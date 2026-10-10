"""Write data.js for the capacity-interval deck from reviewed thesis-core results.

thesis-core is read only at the reviewed commit a882742 with `git show a882742:<path>` (T17–T23 results; T22 and T23
passed review on 2026-10-10), never from the working tree, which holds unreviewed T27 changes. THESIS_CORE overrides the
repository path. Plateaus are kept unrounded until display (Okpo's reservation plateau 627.45 is shown as 627).
The field anchors (97 / 4, 126 / 7, 600 / 30, 500 / 24) are parsed from the T22 report §6.3, which quotes the T24 full-text
checks (Reference/notes/occupancy_anchors_20261009.md).

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
COMMIT = 'a882742'
FLAG = {'yupu': ['a0ab16fceb94', '49d2383872e7'],   # T18, Okpo: free / reservation / reference rule, K 5–40 step 1, 45–150 step 5
        'yantai': ['b82aa19b22af']}                 # T20, Yantai: K 1–40 step 1, 45–150 step 5
SAFE = {'yupu': '656e2da75368', 'yantai': '930e637e0658'}   # T22 main_safe: safe release (whole, segmented), reservation segmented
ERECT = {'whole': ['f7ac88b60111', 'dfb2758822ad'], 'safe': 'a1f485302418'}   # Okpo erection mix: T18 and T22 erect_safe
T23 = {'yupu': '97d667d16273', 'yantai': 'e7f94238b96d'}
T22R = 'results/t22_report_3287d62c7916'
T18 = 'results/t18_report_d10b9015cd4d/t18_summary.json'
T19 = 'results/t19_compare_c963b53c1dde/t19_summary.json'
T20 = 'results/t20_report_c12289dfda9d/t20_summary.json'


def show(path):
    return subprocess.run(['git', '-C', str(REPO), 'show', f'{COMMIT}:{path}'], capture_output=True, check=True).stdout.decode('utf-8-sig')


def table(path):
    return list(csv.DictReader(io.StringIO(show(path))))


def sat_curve(dirs, scen, model):
    """Saturated throughput by K as {K: (mean, lo, hi)}."""
    out = {}
    for d in dirs:
        for r in table(f'results/{d}/curves.csv'):
            if r['scen'] == scen and r['model'] == model and r['level'] == 'saturated':
                out[int(r['K'])] = tuple(float(r[f'throughput_{s}']) for s in ('mean', 'lo', 'hi'))
    assert out, (dirs, scen, model)
    return out


def plateau(c):
    """Mean saturated throughput over K = 100–150 (the plateau of T20 / T22), unrounded."""
    ks = [k for k in c if 100 <= k <= 150]
    assert len(ks) == 11, ks
    return sum(c[k][0] for k in ks) / len(ks)


def t1(d, scen):
    v = [float(r['T1_tight_per_day']) for r in table(f'results/{d}/bounds.csv') if r['scen'] == scen]
    assert len(v) == 10, (d, scen)
    return [sum(v) / len(v), min(v), max(v)]


# ---------- saturated curves of the flag figure (four rules) ----------
t18, t19, t20 = (json.loads(show(p)) for p in (T18, T19, T20))
h1old = {'yupu': t18['H1']['main|reserve'], 'yantai': t20['change']['r395']['H1']['main|reserve']}
summ = {y: json.loads(show(f'results/{FLAG[y][0]}/summary.json'))['findings'] for y in FLAG}
topo = {'yupu': t19['yards']['yupu']['topology'], 'yantai': t20['change']['r395']['topology']}
flag = {}
for y in FLAG:
    cur = {'free': sat_curve(FLAG[y], 'main', 'free'), 'reserve': sat_curve(FLAG[y], 'main', 'reserve'),
           'segment': sat_curve(FLAG[y], 'main', 'segment'), 'safe': sat_curve([SAFE[y]], 'main', 'segment_safe')}
    Ks = sorted(cur['reserve'])
    assert all(sorted(c) == Ks for c in cur.values()), y
    # service-time gap (whole-route reservation minus free flow), minutes, as in t17_flag.py:593
    flow = {(r['model'], int(r['K'])): float(r['flow_mean_mean']) for d in FLAG[y] for r in table(f'results/{d}/curves.csv')
            if r['scen'] == 'main' and r['level'] == 'saturated'}
    gap = [[k, round(flow['reserve', k] - flow['free', k], 2)] for k in Ks if 5 <= k <= 40]
    pl = {m: plateau(c) for m, c in cur.items() if m != 'free'}
    sf = cur['safe']
    kmax = max(sf, key=lambda k: sf[k][0])
    flag[y] = {'K': Ks, **{m: [[round(v, 1) for v in cur[m][k]] for k in Ks] for m in cur},
               'T1t': [round(v, 2) for v in t1(FLAG[y][0], 'main')],
               'plateau': {m: round(v, 2) for m, v in pl.items()},
               'safeMax': [kmax, round(sf[kmax][0], 1), round(sf[150][0], 1)],
               'demand': {'regular': {'yupu': 97, 'yantai': 23}[y], 'peak': {'yupu': 194, 'yantai': 46}[y]},
               'Kreq_small': {m: [summ[y]['K_required'][f'main|{m}|{lev}'] for lev in ('regular', 'peak')] for m in ('free', 'reserve', 'segment')},
               'Kstar20': [h1old[y]['K_star_20'], *h1old[y]['K_star_20_ci']],
               'marg': [[x['K'], round(x['ratio'], 3)] for x in h1old[y]['marginal']],
               'alpha_summary': round(summ[y]['service_gap']['main|reserve']['alpha'], 2), 'gap': gap,
               'topo': {k: (round(v, 1) if isinstance(v, float) else v) for k, v in topo[y].items() if k in ('roads', 'km', 'junction_res', 'access', 'stops', 'cyclomatic')}}
    # alpha: log-log least-squares slope of the gap over K = 5–40 (t17_flag.py:595), both yards alike
    pts = [(math.log(k), math.log(v)) for k, v in gap if v > 0]
    mx, my = sum(p[0] for p in pts) / len(pts), sum(p[1] for p in pts) / len(pts)
    a = sum((p[0] - mx) * (p[1] - my) for p in pts) / sum((p[0] - mx) ** 2 for p in pts)
    flag[y]['alpha'], flag[y]['coef'] = round(a, 2), round(math.exp(my - a * mx), 4)
assert flag['yupu']['alpha'] == flag['yupu']['alpha_summary']
assert abs(flag['yupu']['plateau']['reserve'] - 627.4545) < 0.01 and round(flag['yupu']['plateau']['reserve']) == 627

# ---------- the capacity interval by resource granularity and task mix (T22 §4, t22_interval.csv) ----------
erect = {'whole_res': sat_curve(ERECT['whole'], 'erection', 'reserve'), 'whole_ref': sat_curve(ERECT['whole'], 'erection', 'segment'),
         'whole_safe': sat_curve([ERECT['safe']], 'erection', 'segment_safe'), 'stops_res': sat_curve([ERECT['safe']], 'erection_s', 'reserve'),
         'stops_safe': sat_curve([ERECT['safe']], 'erection_s', 'segment_safe'), 'stops_ref': sat_curve([ERECT['safe']], 'erection_s', 'segment')}


def case(key, T1, res, safe, ref):
    km = max(safe, key=lambda k: safe[k][0])
    return {'key': key, 'T1': round(T1, 2), 'lower': round(plateau(res), 2), 'safe': round(plateau(safe), 2),
            'safeMax': [km, round(safe[km][0], 1)], 'ref': round(plateau(ref), 2) if ref else None}


interval = [
    case('yupu|main|whole', t1(FLAG['yupu'][0], 'main')[0], sat_curve(FLAG['yupu'], 'main', 'reserve'), sat_curve([SAFE['yupu']], 'main', 'segment_safe'), sat_curve(FLAG['yupu'], 'main', 'segment')),
    case('yupu|main|stops', t1(SAFE['yupu'], 'main_s')[0], sat_curve([SAFE['yupu']], 'main_s', 'reserve'), sat_curve([SAFE['yupu']], 'main_s', 'segment_safe'), None),
    case('yantai|main|whole', t1(FLAG['yantai'][0], 'main')[0], sat_curve(FLAG['yantai'], 'main', 'reserve'), sat_curve([SAFE['yantai']], 'main', 'segment_safe'), sat_curve(FLAG['yantai'], 'main', 'segment')),
    case('yantai|main|stops', t1(SAFE['yantai'], 'main_s')[0], sat_curve([SAFE['yantai']], 'main_s', 'reserve'), sat_curve([SAFE['yantai']], 'main_s', 'segment_safe'), None),
    case('yupu|erection|whole', t1(ERECT['safe'], 'erection')[0], erect['whole_res'], erect['whole_safe'], erect['whole_ref']),
    case('yupu|erection|stops', t1(ERECT['safe'], 'erection_s')[0], erect['stops_res'], erect['stops_safe'], erect['stops_ref']),
]
iv = {(r['block'], r['rule']): r for r in table(f'{T22R}/t22_interval.csv')}
for c in interval:   # agree with the reviewed T22 table (1 decimal)
    y, s, g = c['key'].split('|')
    r = iv[(f'{y}|{s}', f'{g}|reserve')]
    assert abs(c['lower'] - float(r['plateau'])) < 0.06 and abs(c['T1'] - float(r['T1_whole' if g == 'whole' else 'T1_stops'])) < 0.06, (c, r)
    assert abs(c['safe'] - float(iv[(f'{y}|{s}', f'{g}|segment_safe')]['plateau'])) < 0.06, c

# ---------- T23: system T1′, route-free T1″, route slack, plateau / bound ----------
bounds23 = {}
for y, d in T23.items():
    sysr = {r['scen']: r for r in table(f'results/{d}/system.csv')}
    rf = {r['scen']: r for r in table(f'results/{d}/route_free.csv')}
    pf = {(r['scen'], r['model']): r for r in table(f'results/{d}/platform.csv')}
    bounds23[y] = {s: {'sys': round(float(sysr[s]['T1_system']), 1), 'seeds': [round(float(sysr[s]['ref_min'])), round(float(sysr[s]['ref_max']))],
                       'T1pp': round(float(rf[s]['T1pp']), 1), 'lo': round(100 * float(rf[s]['margin_lo_rel']), 1) + 0.0, 'hi': round(100 * float(rf[s]['margin_hi_rel']), 1) + 0.0,
                       'ratio': {m: [round(100 * float(pf[s, m]['ratio_mix'])), round(100 * float(pf[s, m]['ratio_sys']))] for m in ('reserve', 'segment')}}
                   for s in ('main', 'erection', 'crane')}
assert round(bounds23['yupu']['main']['sys']) == 1736 and bounds23['yupu']['crane']['lo'] == 45.4

# ---------- whole-yard vehicles needed (T22 §6, integer K) and the H1 test (T22 §7) ----------
verdict = {'成立': 'Y', '起点附近': 'near', '不成立': 'N'}
h1 = {(r['yard'], r['section'], int(float(r['day_h'])), r['model'], int(r['demand'])): verdict[r['verdict']] for r in table(f'{T22R}/t22_h1.csv')}
demand = {}
for r in table(f'{T22R}/t22_demand.csv'):
    sec = 'whole' if r['section'] == 'whole' else 'stops'
    key = f"{r['yard']}|{sec}|{int(float(r['day_h']))}"
    k = r['K_req']
    cell = {'k': int(k) if k.isdigit() else k.replace('>', '> '), 'v': h1[(r['yard'], r['section'], int(float(r['day_h'])), r['model'], int(r['demand']))],
            'dag': r['after_fail'] not in ('', '[]')}
    if not k.isdigit():
        cell['best'] = [int(r['K_best']), round(float(r['thr_best']))]
    demand.setdefault(key, {}).setdefault(int(r['demand']), {})[r['model']] = cell
ks = json.loads(show(f'{T22R}/t22_summary.json'))['K_star']
for day in (16, 24):   # the work-zone slide says segmented roads change reservation's vehicles needed by at most 1
    for d, c in demand[f'yupu|whole|{day}'].items():
        w, g = c['reserve']['k'], demand[f'yupu|stops|{day}'][d]['reserve']['k']
        assert w == g or (isinstance(w, int) and isinstance(g, int) and abs(w - g) <= 1), (day, d, w, g)
assert demand['yupu|whole|16'][339]['reserve']['k'] == 27 and demand['yupu|whole|24'][600]['reserve']['k'] == 37 and demand['yupu|whole|16'][678]['reserve']['k'] == 117

# ---------- dock mouth: rho at which throughput first drops 10%, by K (T22 §3.1, t22_rho_k.csv) ----------
rhok = {}
for r in table(f'{T22R}/t22_rho_k.csv'):
    y, sec, m, K = r['key'].split('|')
    rhok.setdefault(f'{y}|{sec}|{m}', []).append([int(K), round(float(r['thr10']), 2) if r['thr10'] else None, r['thr10_steady'] == 'True',
                                                  round(min(float(r['min_rel']), 0), 1) if r['min_rel'] else None])
assert rhok['yupu|whole|segment_safe'][1][1] == 0.83 and rhok['yupu|stops|segment_safe'][1][1] == 0.96

# ---------- external anchors: per-vehicle output (T22 §6.3, t22_anchor.csv) ----------
anchor = [[r['yard'], int(r['day_h']), r['model'], int(r['K']), float(r['per_truck']), float(r['empty']), float(r['loaded']), float(r['wait']), float(r['total'])]
          for r in table(f'{T22R}/t22_anchor.csv')]
rep = show('docs/T22_report.md')
sec63 = rep[rep.index('### 6.3'):rep.index('## 7.')]
m1 = re.search(r'Yim 等 2008：(\d+) 个 / (\d+) 台', sec63)
m2 = re.search(r'苏比克：(\d+) 个 / (\d+) 台（(\d+) 主车', sec63)
m3 = re.search(r'Shen 等 2018：约 (\d+) 个 / 约 (\d+) 台', sec63)
m4 = re.search(r'现代重工 03-071：约 (\d+) 次 / (\d+) 台，24 h', sec63)
field = {'yim': [int(m1[1]), int(m1[2]), 16], 'heo': [int(m2[1]), int(m2[2]), int(m2[3])], 'shen': [int(m3[1]), int(m3[2]), None], 'hhi': [int(m4[1]), int(m4[2]), 24]}
assert field == {'yim': [97, 4, 16], 'heo': [126, 7, 5], 'shen': [600, 30, None], 'hhi': [500, 24, 24]}, field

# ---------- density criterion: daily volume / T1′ (the interval's ceiling) ----------
density = {'yantai': [[d, round(100 * d / flag['yantai']['T1t'][0], 1)] for d in (23, 46)],
           'yupu': [[d, round(100 * d / flag['yupu']['T1t'][0], 1)] for d in (339, 678)],
           'korea': [[d, round(100 * d / flag['yupu']['T1t'][0], 1)] for d in (500, 600)]}

DATA = {'source': {'repo': 'thesis-core', 'commit': COMMIT}, 'flag': flag, 'interval': interval, 'bounds23': bounds23,
        'demand': demand, 'Kstar': ks, 'rhok': rhok, 'anchor': anchor, 'field': field, 'density': density}
out = HERE / 'data.js'
out.write_text('// Generated by make_data.py from thesis-core %s (T17–T23, reviewed); do not edit by hand.\nwindow.DATA=%s;\n'
               % (COMMIT, json.dumps(DATA, ensure_ascii=False, separators=(',', ':'))), encoding='utf-8')
for y in FLAG:
    F = flag[y]
    print(y, "T1'", F['T1t'], 'plateau', F['plateau'], 'share %.1f%%' % (100 * F['plateau']['reserve'] / F['T1t'][0]), 'safe max', F['safeMax'],
          'K*20', F['Kstar20'], 'alpha', F['alpha'], 'gap40', F['gap'][-1])
for c in interval:
    print('interval', c['key'], '[%.2f, %.2f]' % (c['lower'], c['T1']), 'ratio %.2f' % (c['lower'] / c['T1']), 'safe', c['safe'], c['safeMax'], 'ref', c['ref'])
print('T23', json.dumps(bounds23, ensure_ascii=False))
print('K*', ks, 'field', field, 'density', density)
print(out, out.stat().st_size, 'bytes')
