"""Write data.js for the dock-mouth deck.

Sources (read only), thesis-core at the reviewed commit a882742, read with `git show` so the working tree (unreviewed T27
changes) is never used:
  - the T22 summary results/t22_report_3287d62c7916/: t22_rho_k.csv (drop against crane utilisation at each fleet size,
    thresholds), t22_rho.csv (crane-hour use, starvation and dock road held at K = 150), t22_interval.csv (capacity
    intervals), t22_diag2.csv (teleports counted by task);
  - the T22 main-scenario batches 656e2da75368 (Okpo) and 930e637e0658 (Yantai) for safe release, and the reused T18 / T20
    batches a0ab16fceb94 + 49d2383872e7 (Okpo) and b82aa19b22af (Yantai) for reservation and the reference rule;
  - the T20 summary for the Okpo reservation plateau unrounded (627.45; the T22 tables round it to 627.5, the report to 628);
  - T21 t21_p6.csv / t21_span.csv for the numbers typed on the crane slide.
THESIS_CORE overrides the path.

  python dock/make_data.py
"""
import csv
import io
import json
import os
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
REPO = Path(os.environ.get('THESIS_CORE') or ROOT / '30_研究' / 'thesis-core')
COMMIT = 'a882742'
T22 = 'results/t22_report_3287d62c7916'
T21 = 'results/t21_report_9eb8bf099d3a'
YARDS = ('yupu', 'yantai')
GRAN = ('whole', 'stops')


def show(path):
    return subprocess.run(['git', '-C', str(REPO), 'show', f'{COMMIT}:{path}'], capture_output=True, check=True).stdout.decode('utf-8-sig')


def rows(path):
    return list(csv.DictReader(io.StringIO(show(path))))


r4 = lambda v: round(float(v), 4)

# ---------- drop against crane utilisation, read at each K (T22 §3.1) ----------
rhok = {y: {} for y in YARDS}
for r in rows(f'{T22}/t22_rho_k.csv'):
    y, g, m, k = r['key'].split('|')
    rhok[y].setdefault(k, {})[f'{g}|{m}'] = {
        'thr': r4(r['thr10']) if r['thr10'] else None, 'thrOk': r['thr10_steady'] == 'True',
        'drop': r4(r['drop_top_all']),   # change at the top rho level (0.99), %, as in the T22 report §3.1 tables
        'pts': [[p['rho'], round(p['rel'], 2), int(p['steady'])] for p in json.loads(r['points'])]}
th = lambda y, k, gm: round(rhok[y][str(k)][gm]['thr'], 2)
# the readings quoted on the slides (T22 report §0, §3.1-3.2)
assert [th('yupu', k, 'whole|segment_safe') for k in (20, 150)] == [0.98, 0.59]
assert [th('yantai', k, 'whole|segment_safe') for k in (20, 150)] == [0.93, 0.38]
assert (th('yupu', 40, 'whole|segment_safe'), th('yupu', 40, 'stops|segment_safe')) == (0.83, 0.96)
assert (th('yantai', 60, 'whole|segment_safe'), th('yantai', 60, 'stops|segment_safe')) == (0.56, 0.70)
assert all(rhok[y][k][f'{g}|reserve']['thr'] is None for y in YARDS for k in rhok[y] for g in GRAN)
assert round(min(rhok['yupu'][k][f'{g}|reserve']['drop'] for k in rhok['yupu'] for g in GRAN), 1) == -1.7

# ---------- crane-hour use, starvation, dock road held: saturated K = 150, 8 days (T22 §3.3) ----------
crane = {y: {} for y in YARDS}
for r in rows(f'{T22}/t22_rho.csv'):
    if not r['scen'].endswith('_o14'):
        crane[r['yard']].setdefault(r['combo'], []).append([r4(r['rho']), r4(r['crane_util']), r4(r['starve']), r4(r['starve_blk']), r4(r['dock0_busy'])])
for v in (v for c in crane.values() for v in c.values()):
    v.sort()
top = lambda y, gm, i: round(100 * crane[y][gm][-1][i])
assert [top('yupu', f'{g}|segment_safe', 1) for g in GRAN] == [83, 87] and [top('yantai', f'{g}|segment_safe', 1) for g in GRAN] == [74, 76]
assert [top(y, 'whole|reserve', 1) for y in YARDS] == [96, 97]
assert (top('yupu', 'whole|segment', 4), top('yupu', 'stops|segment', 4)) == (81, 65)

# ---------- teleports counted by task: reference rule, whole road, K = 150 (T22 §3.4) ----------
tele = {y: [] for y in YARDS}
for r in rows(f'{T22}/t22_diag2.csv'):
    if r['kind'] == 'teleport':
        assert r['same_as_stored'] == 'True'
        tele[r['yard']].append([r['scen'].removesuffix('_8d'), r4(r['p6_done_per_day']), r4(r['share_ever']), r4(r['share_2plus']), int(r['times_max'])])

# ---------- capacity intervals [best deadlock-free rule, T1'] (T22 §4) ----------
iv = {}
for r in rows(f'{T22}/t22_interval.csv'):
    if r['rule'].split('|')[1] in ('free', 'norec'):
        continue
    e = iv.setdefault(r['block'], {'T1|whole': float(r['T1_whole']), 'T1|stops': float(r['T1_stops'])})
    e[r['rule']] = {'plat': float(r['plateau']), 'max': float(r['max']), 'Kmax': int(r['K_at_max']), 'at150': float(r['at_150'])}
# the T22 tables round the Okpo reservation plateau to 627.5; take it unrounded from the T20 summary (627.45 -> 627)
t20 = json.loads(show('results/t20_report_c12289dfda9d/t20_summary.json'))
raw = next(e for e in t20['cmp']['yupu'] if e['scen'] == 'main')['sat']['reserve']['platform']
assert abs(raw - iv['yupu|main']['whole|reserve']['plat']) < 0.06, raw
iv['yupu|main']['whole|reserve']['plat'] = raw
ery = iv['yupu|erection']
assert [round(v) for v in (ery['whole|reserve']['plat'], ery['T1|whole'], ery['stops|reserve']['plat'], ery['T1|stops'])] == [611, 703, 662, 1241]


# ---------- H2: saturated throughput against fleet size, main scenario (T22 §5) ----------
def curve(d, scen, model):
    sel = (r for r in rows(f'results/{d}/curves.csv') if r['level'] == 'saturated' and r['scen'] == scen and r['model'] == model)
    return [[int(r['K']), round(float(r['throughput_mean']), 1)] for r in sel]


SRC = {'yupu': {'reserve': [('a0ab16fceb94', 'main', 'reserve'), ('49d2383872e7', 'main', 'reserve')],
                'segment': [('a0ab16fceb94', 'main', 'segment'), ('49d2383872e7', 'main', 'segment')],
                'safe': [('656e2da75368', 'main', 'segment_safe')], 'safeS': [('656e2da75368', 'main_s', 'segment_safe')]},
       'yantai': {'reserve': [('b82aa19b22af', 'main', 'reserve')], 'segment': [('b82aa19b22af', 'main', 'segment')],
                  'safe': [('930e637e0658', 'main', 'segment_safe')], 'safeS': [('930e637e0658', 'main_s', 'segment_safe')]}}
h2 = {y: {m: sorted(p for s in src for p in curve(*s)) for m, src in d.items()} for y, d in SRC.items()}
for y, d in h2.items():   # the curves must give the T22 tables: peak, K at the peak, value at K = 150
    for m, rule in (('safe', 'whole|segment_safe'), ('safeS', 'stops|segment_safe'), ('reserve', 'whole|reserve'), ('segment', 'whole|segment')):
        e, c = iv[f'{y}|main'][rule], dict(d[m])
        k = max(c, key=c.get)
        assert (k, round(c[k], 1), round(c[150], 1)) == (e['Kmax'], e['max'], e['at150']), (y, m, k, c[k], c[150], e)

# ---------- the crane slide (T21, unchanged at a882742): three cranes at Okpo, rho 0.88, in-span share 12.5% ----------
span = rows(f'{T21}/t21_span.csv')
assert sum(n for _, n in {(r['dock'], int(r['cranes'])) for r in span if r['yard'] == '玉浦'}) == 3
assert round(100 * sum(float(r['p6_share']) for r in span if r['yard'] == '玉浦' and r['cls_05'] == '跨内'), 1) == 12.5
assert round(float(next(r for r in rows(f'{T21}/t21_p6.csv') if r['main'] == 'True')['rho']), 2) == 0.88

DATA = {'source': {'repo': 'thesis-core', 'commit': COMMIT}, 'rhok': rhok, 'crane': crane, 'tele': tele, 'iv': iv, 'h2': h2}
out = Path(__file__).parent / 'data.js'
out.write_text('// Generated by make_data.py from thesis-core %s (T22 report and batches; T18, T20, T21 reused); do not edit by hand.\n'
               'window.DATA=%s;\n' % (COMMIT, json.dumps(DATA, ensure_ascii=False, separators=(',', ':'))), encoding='utf-8')
for y in YARDS:
    print(y, 'thresholds', {k: {gm: v['thr'] for gm, v in d.items()} for k, d in rhok[y].items()})
    print(y, 'crane use at the top rho', {gm: v[-1][1] for gm, v in crane[y].items()})
    print(y, 'teleported share', [t[2] for t in tele[y]])
print('intervals', {b: {k: (v if isinstance(v, float) else v['plat']) for k, v in e.items()} for b, e in iv.items()})
print(out, out.stat().st_size, 'bytes')
