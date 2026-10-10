"""Write data.js for the bound deck (occupancy model and network bounds) from reviewed results only.

Results come from thesis-core with `git show a882742:<path>` (T22 and T23 merged, passed review 2026-10-10), never from the
working tree, which holds unreviewed work. Everything read here that existed at 83c16bf (T21) is unchanged at a882742.
THESIS_CORE overrides the repository path.

  python bound/make_data.py
"""
import collections
import csv
import io
import json
import os
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
REPO = Path(os.environ.get('THESIS_CORE') or ROOT / '30_研究' / 'thesis-core')
COMMIT = 'a882742'
BOUNDS = {'yupu': 'a0ab16fceb94', 'yantai': 'b82aa19b22af'}   # main-scenario batches: Okpo map rev 1824, Yantai rev 395
ERECTION = 'f7ac88b60111'                                     # Okpo erection mix (P6 15%)
RHO = {'yupu': '1b06c6d46f0d', 'yantai': '87d02d32bc13'}      # T21 crane-cadence batches: the case-by-case check of T1'
T18 = 'results/t18_report_d10b9015cd4d/t18_summary.json'
T21 = 'results/t21_report_9eb8bf099d3a/t21_summary.json'
T23 = {'yupu': '97d667d16273', 'yantai': 'e7f94238b96d'}      # T23 round-2 directories (system T1', T1'', prices, plateaus)
# T22 batches whose occupancy points are checked against the T1' of their own completed mix (T22 report section 8).
# The two diag directories recompute 410 of T21's points bit for bit, so the histogram leaves them out.
T22_CHECK = {'54f5e26030e2': 'yupu', '16d6dde8b72d': 'yantai', 'a1f485302418': 'yupu', '656e2da75368': 'yupu', '930e637e0658': 'yantai',
             'ef82da6bf286': 'yupu', 'dfcdaec9a1e5': 'yantai', 'c6b4a59a7a82': 'yupu', 'f1e5a9a4b943': 'yantai', '0fb7e9aefc36': 'yupu',
             'a79d535a75b3': 'yupu'}
T22_DIAG = ['92160f366872', '68d10629cef8']
# capacity interval (T22 section 4): plateau = mean saturated throughput over K = 100-150, 10 seeds; the whole road or sectioned
# at its stops. Per granularity: (directory, scenario) of reservation and the reference rule, then of safe release when elsewhere.
INTERVAL = {'yupu_main': {'whole': ('49d2383872e7', 'main', '656e2da75368', 'main'), 'stops': ('656e2da75368', 'main_s', None, None)},
            'yantai_main': {'whole': ('b82aa19b22af', 'main', '930e637e0658', 'main'), 'stops': ('930e637e0658', 'main_s', None, None)},
            'yupu_erection': {'whole': ('dfb2758822ad', 'erection', 'a1f485302418', 'erection'), 'stops': ('a1f485302418', 'erection_s', None, None)}}
SCENS = ['main', 'w+1.5', 'w-1.5', 'empty_excl', 'empty_free']
# binding resource -> chart group. Yantai's results give one name to 12 door nodes; rerunning the 83c16bf code found the nine
# "入口001节点" seeds at the two doors of building 014 (5 + 4) and the remaining seed at building 007's door
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


def r2(v):
    return round(float(v), 2)


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
plateau = round(m18['platform']['mean_K100_150'], 2)       # whole-route reservation, saturated, mean of K = 100-150 (627.45)

# ---------- case-by-case check of T1': throughput / T1' of the completed mix, T21 and T22 batches ----------
t21all = json.loads(show(T21))
t21 = t21all['T1_tight_check']
RHOS = {y: {e['scen']: e['rho'] for e in t21all['rho'][y]} for y in RHO}
hist = {'t21': [0] * 21, 't22': [0] * 21}             # bins of 0.05; bin 20 holds ratios >= 1
check, high = {}, collections.Counter()              # high: points with ratio >= 0.9, by whether the setting's crane load rho >= 0.92


def tally(key, yard, pts):
    rat = [float(r['throughput']) / float(r['T1_tight_mix']) for r in pts]
    for v in rat:
        hist[key][min(int(v * 20), 20)] += 1
    for r, v in zip(pts, rat):
        if v >= 0.9:
            s = r['scen'].replace('_8d', '')
            s = s[:-2] if s.endswith('_s') else s
            high['rho>=0.92' if RHOS[yard].get(s, 0) >= 0.92 else 'other'] += 1
    return rat


for y, d in RHO.items():
    pts = [r for r in rows(f'results/{d}/points.csv') if r['model'] != 'free']
    rat = tally('t21', y, pts)
    assert len(rat) == t21[y]['points'] and abs(max(rat) - t21[y]['max_ratio']) < 1e-9 and t21[y]['over_strict'] == 0, y
    check[y] = {'n': len(rat), 'max': round(max(rat), 3), 'over': sum(v > 1 for v in rat), 'at': t21[y]['max_at']}
t22n, t22max, t22at, t22over = 0, 0, None, 0
for d, y in T22_CHECK.items():
    # points of the no-clearing switch complete nothing in the window and are not checked (T22 report section 8)
    pts = [r for r in rows(f'results/{d}/points.csv')
           if r['model'] != 'free' and r['T1_tight_mix'] and float(r['T1_tight_mix']) > 0 and float(r['completed'] or 0) > 0]
    rat = tally('t22', y, pts)
    t22n += len(rat)
    t22over += sum(v > 1 for v in rat)
    i = max(range(len(rat)), key=rat.__getitem__)
    if rat[i] > t22max:
        t22max, t22at = rat[i], {'dir': d, 'yard': y, 'scen': pts[i]['scen'], 'model': pts[i]['model'], 'K': int(pts[i]['K'])}
diag = sum(len([r for r in rows(f'results/{d}/points.csv') if r['model'] != 'free']) for d in T22_DIAG)
# T22 report section 8: 18,041 points in round 1 and 22,116 in round 2 (5,740 in both) -> 34,417, of which 410 recompute T21's
assert t22n + diag == 34417 and diag == 410 and t22over == 0, (t22n, diag, t22over)
check['t22'] = {'n': t22n, 'max': round(t22max, 3), 'over': t22over, 'at': t22at, 'diag': diag}
assert hist['t21'][20] == hist['t22'][20] == 0

# ---------- T23: system T1', convergence, route-free T1'' and route slack, binding-resource readings, plateau / bound, prices ----------
system, conv, route, readout, platform, rate = {}, {}, {}, {}, {}, []
for y, d in T23.items():
    system[y] = [{'scen': r['scen'], 'sys': r2(r['T1_system']), 'mean': r2(r['ref_mean']), 'min': r2(r['ref_min']), 'max': r2(r['ref_max']),
                  'top': r['top1'], 'price': r2(r['top1_price'])} for r in rows(f'results/{d}/system.csv')]
    conv[y] = {}
    for r in rows(f'results/{d}/convergence.csv'):
        conv[y].setdefault(r['scen'], []).append({'N': int(r['N']), 'min': r2(r['min']), 'max': r2(r['max']), 'mean': r2(r['mean']),
                                                  'hz': r2(r['hmean_z']), 'rel': round(float(r['mean_abs_rel']), 4)})
    route[y] = [{'scen': r['scen'], 'sys': r2(r['T1_system']), 'R': r2(r['R']), 'pp': r2(r['T1pp']), 'feas': r2(r['feasible']),
                 'lo': round(float(r['margin_lo_rel']), 6), 'hi': round(float(r['margin_hi_rel']), 6), 'detour': round(float(r['detour_share']), 4),
                 'top': r['top1']} for r in rows(f'results/{d}/route_free.csv')]
    readout[y] = [{'scen': r['scen'], 'name': r['name'], 'type': r['type'], 'flow': r2(r['flow_on']), 'pass': round(float(r['pass_share']), 4),
                   'alt': round(float(r['alt_slack']), 3) if r['alt_slack'] else None, 'altm': round(float(r['alt_extra_m'])) if r['alt_extra_m'] else None}
                  for r in rows(f'results/{d}/readout.csv')]
    platform[y] = [{'scen': r['scen'], 'model': r['model'], 'plat': r2(r['platform']), 'mix': round(float(r['ratio_mix']), 4),
                    'sys': round(float(r['ratio_sys']), 4), 'pp': round(float(r['ratio_T1pp']), 4)} for r in rows(f'results/{d}/platform.csv')]
    for r in rows(f'results/{d}/prices.csv'):
        if r['rank'] == '1' or (r['scen'] == 'crane' and r['name'].startswith('道路013-7')):   # rows quoted on the slide
            w = lambda k: r2(r[k]) if r[k] else None
            rate.append({'yard': y, 'scen': r['scen'], 'rank': int(r['rank']), 'name': r['name'] + (f"［{r['facility']}］" if r['facility'] else ''), 'type': r['type'],
                         'a': [w('T1′_price'), w('T1′_d10_first'), w('T1′_d10'), w('T1′_w1')],
                         'b': [w('T1″_price'), w('T1″_d10_first'), w('T1″_d10'), w('T1″_w1')]})
    for s, rf in zip(system[y], route[y]):           # the system values must agree across the T23 files
        assert s['scen'] == rf['scen'] and abs(s['sys'] - rf['sys']) < 0.01
assert [round(r['sys']) for r in system['yupu']] == [1736, 697, 1794] and [round(r['sys']) for r in system['yantai']] == [1298, 1110, 1225]
assert [round(100 * r['lo'], 1) for r in route['yupu']] == [3.7, 5.1, 45.4] and [round(100 * r['hi'], 1) for r in route['yupu']] == [5.3, 5.2, 48.4]
assert round(100 * route['yantai'][1]['lo'], 1) == 7.9 and round(100 * route['yantai'][1]['hi'], 1) == 8.1

# ---------- T22: capacity interval [best deadlock-free rule, T1'] by resource granularity ----------
interval, plats = {}, {}


def plat(d, scen, model):
    if (d, scen, model) not in plats:
        v = [float(r['throughput']) for r in rows(f'results/{d}/points.csv')
             if r['level'] == 'saturated' and r['scen'] == scen and r['model'] == model and 100 <= int(r['K']) <= 150]
        assert len(v) == 110, (d, scen, model, len(v))
        plats[(d, scen, model)] = round(mean(v), 2)
    return plats[(d, scen, model)]


iv_csv = {(r['block'], r['rule']): r for r in rows('results/t22_report_3287d62c7916/t22_interval.csv')}
for blk, gran in INTERVAL.items():
    interval[blk] = {}
    key = blk.replace('_', '|')
    for g, (d, sc, dsafe, scsafe) in gran.items():
        bnd = json.loads(show(f'results/{dsafe or d}/summary.json'))['bounds']
        t1 = mean([v['network_tight'] for k, v in bnd.items() if k.split('|')[0] == (scsafe or sc)])
        res, safe = plat(d, sc, 'reserve'), plat(dsafe or d, scsafe or sc, 'segment_safe')
        seg = plat(d, sc, 'segment') if (key, f'{g}|segment') in iv_csv else None
        sm = iv_csv[(key, f'{g}|segment_safe')]
        interval[blk][g] = {'T1': r2(t1), 'res': res, 'safe': safe, 'safeMax': float(sm['max']), 'safeK': int(sm['K_at_max']), 'seg': seg}
        for rule, v in (('reserve', res), ('segment_safe', safe), ('segment', seg)):   # t22_interval.csv keeps one decimal
            if v is not None:
                assert abs(float(iv_csv[(key, f'{g}|{rule}')]['plateau']) - v) < 0.051, (blk, g, rule, v)
        assert abs(float(iv_csv[(key, f'{g}|reserve')]['T1_' + g]) - t1) < 0.051, (blk, g, t1)
assert abs(interval['yupu_main']['whole']['res'] - plateau) < 0.01 and round(interval['yupu_main']['whole']['res']) == 627

DATA = {'source': {'repo': 'thesis-core', 'commit': COMMIT}, 'seeds': seeds, 'sens': sens, 'erection': erection, 'prices': prices, 'plateau': plateau,
        'hist': hist, 'check': check, 'high': [sum(high.values()), high['rho>=0.92']], 'system': system, 'conv': conv, 'route': route,
        'readout': readout, 'platform': platform, 'rate': rate, 'interval': interval}
out = Path(__file__).parent / 'data.js'
out.write_text('// Generated by make_data.py from thesis-core %s; do not edit by hand.\nwindow.DATA=%s;\n'
               % (COMMIT, json.dumps(DATA, ensure_ascii=False, separators=(',', ':'))), encoding='utf-8')
for y in seeds:
    print(y, 'T1', round(mean([s['T1'] for s in seeds[y]])), "T1'", round(mean([s['T1t'] for s in seeds[y]])),
          'range', min(s['T1t'] for s in seeds[y]), max(s['T1t'] for s in seeds[y]), collections.Counter(s['bind'] for s in seeds[y]))
print('erection', erection, 'prices', prices, 'plateau', plateau)
print('check', {k: {a: b for a, b in c.items() if a != 'at'} for k, c in check.items()}, 'T22 max at', check['t22']['at'])
print('ratio >= 0.9:', dict(high), 'hist', hist)
for k in ('system', 'route', 'readout', 'platform', 'rate', 'interval'):
    print(k, DATA[k])
print(out, out.stat().st_size, 'bytes')
