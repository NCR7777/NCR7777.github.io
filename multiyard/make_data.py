"""Write data.js for the multi-yard deck (thesis chapter 6, C5 / H6) from reviewed sources only.

- thesis-core at the reviewed commit a882742 (T17–T23; T18–T21 files unchanged since 83c16bf), read with `git show`,
  never from the working tree:
  Okpo main batch a0ab16fceb94 (bounds.csv), T18 summary (K*, plateau), T19 summary (topology),
  Yantai main batch b82aa19b22af (bounds.csv), T20 summary (K*, plateau, topology, door load, task volume, vehicles needed),
  T20 r383 -> r395 table (building 014 before and after its second door);
  T22 summary results/t22_report_3287d62c7916 (t22_demand.csv, t22_summary.json: saturation, thresholds by K, K*),
  T22 main_safe / erect_safe batches 656e2da75368, a1f485302418 (plateaus with blocks, from points.csv),
  docs/T22_report.md (T24 anchors quoted there: Okpo yearly range, field fleets, public whole-yard scale);
  T23 dirs 97d667d16273 (Okpo), e7f94238b96d (Yantai): system.csv, route_free.csv, readout.csv, platform.csv.
- The yard list (00_总控/船厂清单.md): OSM road counts per yard (Overpass, 2026-10-09).
THESIS_CORE and CONTROL override the two repository paths.

  python multiyard/make_data.py
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
CTRL = Path(os.environ.get('CONTROL') or ROOT / '00_总控')
COMMIT = 'a882742'
YARDLIST = CTRL / '船厂清单.md'
BATCH = {'yupu': 'a0ab16fceb94', 'yantai': 'b82aa19b22af'}   # main flag batches (reviews/T18.md, T20.md); networks unchanged in T21
T22 = 'results/t22_report_3287d62c7916'
T23 = {'yupu': 'results/97d667d16273', 'yantai': 'results/e7f94238b96d'}
SAFE = {'main': 'results/656e2da75368', 'erection': 'results/a1f485302418'}   # T22 main_safe (Okpo) and erect_safe


def show(path):
    return subprocess.run(['git', '-C', str(REPO), 'show', f'{COMMIT}:{path}'], capture_output=True, check=True).stdout.decode('utf-8-sig')


def rows(path):
    return list(csv.DictReader(io.StringIO(show(path))))


def bounds(yard):
    """T1, T1′ (mean, min, max over 10 seeds) and the T1′ binding resource per seed, main scenario."""
    rs = [r for r in rows(f'results/{BATCH[yard]}/bounds.csv') if r['scen'] == 'main']
    assert len(rs) == 10, (yard, len(rs))
    stat = lambda col: [round(sum(float(r[col]) for r in rs) / 10, 2), round(min(float(r[col]) for r in rs), 2), round(max(float(r[col]) for r in rs), 2)]
    bind = {}
    for r in rs:
        bind[r['tight_binding_1']] = bind.get(r['tight_binding_1'], 0) + 1
    return {'T1': stat('T1_network_per_day'), 'T1t': stat('T1_tight_per_day'), 'bind': sorted(bind.items(), key=lambda kv: -kv[1])}


t18 = json.loads(show('results/t18_report_d10b9015cd4d/t18_summary.json'))
t19 = json.loads(show('results/t19_compare_c963b53c1dde/t19_summary.json'))
t20 = json.loads(show('results/t20_report_c12289dfda9d/t20_summary.json'))
t22 = json.loads(show(f'{T22}/t22_summary.json'))
TOPO = ('roads', 'km', 'junction_res', 'access', 'stops', 'cyclomatic', 'meshedness', 'dock_cut_width_m')

yards = {}
for y in BATCH:
    b = bounds(y)
    h1 = t18['H1']['main|reserve'] if y == 'yupu' else t20['change']['r395']['H1']['main|reserve']
    plat = next(e for e in t20['cmp'][y] if e['scen'] == 'main')['sat']
    topo = t19['yards']['yupu']['topology'] if y == 'yupu' else t20['change']['r395']['topology']
    yards[y] = {**b,
                'plateau': {'reserve': round(plat['reserve']['platform'], 2)},
                'Kstar20': [h1['K_star_20'], *h1['K_star_20_ci']],
                'topo': {k: round(topo[k], 3) if isinstance(topo[k], float) else topo[k] for k in TOPO},
                'dockEntry': max(topo['dock_entry_degree'].values())}
assert abs(yards['yupu']['T1t'][0] - t18['T1']['main']['T1t']) < 0.1
assert abs(yards['yantai']['T1t'][0] - t20['change']['r395']['bounds']['main']['T1t']) < 0.1
assert abs(yards['yupu']['plateau']['reserve'] - t18['H1']['main|reserve']['platform']['mean']) < 0.1
assert abs(yards['yantai']['plateau']['reserve'] - t20['change']['r395']['bounds']['main']['reserve_platform']) < 0.1
assert [yards[y]['Kstar20'][1:] for y in BATCH] == [t22['K_star'][y] for y in BATCH], t22['K_star']

# T23: system T1′ (no sampling noise), route-free T1″ and the route slack, binding-resource readout, plateau ratios
SCENS = ('main', 'erection', 'crane')
for y in BATCH:
    sysr = {r['scen']: r for r in rows(f'{T23[y]}/system.csv')}
    rf = {r['scen']: r for r in rows(f'{T23[y]}/route_free.csv')}
    ro = {r['scen']: r for r in rows(f'{T23[y]}/readout.csv')}
    pf = {(r['scen'], r['model']): r for r in rows(f'{T23[y]}/platform.csv')}
    assert abs(float(sysr['main']['ref_mean']) - yards[y]['T1t'][0]) < 0.01, (y, sysr['main']['ref_mean'])
    assert abs(float(pf['main', 'reserve']['platform']) - yards[y]['plateau']['reserve']) < 0.01
    yards[y]['T1sys'] = {s: round(float(sysr[s]['T1_system']), 2) for s in SCENS}
    yards[y]['sysTop'] = sysr['main']['top1']
    yards[y]['slack'] = [{'scen': s, 'name': ro[s]['name'], 'type': ro[s]['type'], 'flow': round(float(ro[s]['flow_on']), 1),
                          'pass': round(float(ro[s]['pass_share']), 6),
                          'alt': round(float(ro[s]['alt_slack']), 3) if ro[s]['alt_slack'] else None,
                          'extra': round(float(ro[s]['alt_extra_m'])) if ro[s]['alt_extra_m'] else None,
                          'lo': max(0.0, round(float(rf[s]['margin_lo_rel']), 6)), 'hi': max(0.0, round(float(rf[s]['margin_hi_rel']), 6))} for s in SCENS]
    yards[y]['ratioMix'] = {s: round(float(pf[s, 'reserve']['ratio_mix']), 4) for s in ('main', 'erection')}
assert round(yards['yupu']['T1sys']['main']) == 1736 and round(yards['yantai']['T1sys']['main']) == 1298

# T22: capacity interval [best deadlock-free rule (= whole-route reservation), T1′]; Okpo with the dock road in blocks
sat = t22['sat']
def plateau(path, scen):
    """Mean throughput of whole-route reservation over K = 100–150 (10 seeds), kept at 2 decimals."""
    pts = [float(r['throughput']) for r in rows(f'{path}/points.csv') if r['scen'] == scen and r['model'] == 'reserve' and 100 <= int(r['K']) <= 150]
    assert len(pts) == 110, (path, scen, len(pts))
    return round(sum(pts) / len(pts), 2)
iv = {'main': {'T1': sat['yupu|main']['T1_whole'], 'T1s': sat['yupu|main']['T1_stops'], 'lo': yards['yupu']['plateau']['reserve'], 'los': plateau(SAFE['main'], 'main_s')},
      'erection': {'T1': sat['yupu|erection']['T1_whole'], 'T1s': sat['yupu|erection']['T1_stops'],
                   'lo': round(float(next(r for r in rows(f'{T23["yupu"]}/platform.csv') if r['scen'] == 'erection' and r['model'] == 'reserve')['platform']), 2),
                   'los': plateau(SAFE['erection'], 'erection_s')}}
for k, v in iv.items():
    blk = sat[f'yupu|{k}']['lower']
    assert abs(v['lo'] - blk['whole']) < 0.06 and abs(v['los'] - blk['stops']) < 0.06, (k, v, blk)
assert abs(iv['main']['T1'] - yards['yupu']['T1t'][0]) < 0.06
yards['yupu']['interval'] = iv
yards['yantai']['interval'] = {'main': {'T1': sat['yantai|main']['T1_whole'], 'lo': yards['yantai']['plateau']['reserve']}}

# T22: dock-mouth threshold (rho where the drop first reaches 10 %) by K; safe release without teleport, whole road and blocks
KS = (20, 40, 60, 100, 150)
thr = {}
for y in BATCH:
    thr[y] = {}
    for sec in ('whole', 'stops'):
        e = [t22['rho_k'][f'{y}|{sec}|segment_safe|{k}'] for k in KS]   # thr10 None = the drop never reached 10 %
        thr[y][f'safe|{sec}'] = [[k, None if x['thr10'] is None else round(x['thr10'], 4), x['thr10_steady']] for k, x in zip(KS, e)]
        thr[y][f'reserve|{sec}'] = round(min(t22['rho_k'][f'{y}|{sec}|reserve|{k}']['min_rel'] for k in KS), 2)
assert [round(v, 2) for _, v, _ in thr['yupu']['safe|whole']][::4] == [0.98, 0.59] and [round(v, 2) for _, v, _ in thr['yantai']['safe|whole']][::4] == [0.93, 0.38]
assert round(thr['yupu']['safe|stops'][1][1], 2) == 0.96 and thr['yupu']['safe|whole'][1][2] is True

# vehicles needed at whole-yard volumes (T22 §6, integer K); Okpo's own volume from T24 (same folding as Yantai)
dem = rows(f'{T22}/t22_demand.csv')
def need(day, model, n, yard='yupu'):
    r = [r for r in dem if r['yard'] == yard and r['scen'] == f'd{day}' and r['section'] == 'whole' and r['model'] == model and r['demand'] == str(n)]
    assert len(r) == 1, (yard, day, model, n)
    return int(r[0]['K_req'])
rep = show('docs/T22_report.md')
own, peak = 339, 678
assert f'同法 {own}' in rep and str(peak) in rep
yearly = [int(x) for x in re.search(r'年际 (\d+)–(\d+)', rep).groups()]
whole = [int(x) for x in re.search(r'未点名船厂的文献（每天 (\d+)–(\d+) 个）', rep).groups()]
hhi = [int(x) for x in re.search(r'现代重工（约 (\d+) 次/日、(\d+) 台、24 h）', rep).groups()]
shen = [int(x) for x in re.search(r'Shen 等 2018，未点名、班次未写）：每天约 (\d+) 个、约 (\d+) 台', rep).groups()]
dem20 = [r for r in rows('results/t20_report_c12289dfda9d/t20_demand.csv') if r['main'] == 'True']
assert len(dem20) == 1
yt = round(float(dem20[0]['per_day']))
kr = t20['change']['r395']['K_required']
H1 = [   # one row per case: yard, daily tasks, working day, vehicles needed under free flow and whole-route reservation
    {'k': 'hYo', 'yard': 'yantai', 'n': yt, 'day': 16, 'free': kr['regular|free'], 'res': kr['regular|reserve']},
    {'k': 'hYp', 'yard': 'yantai', 'n': 2 * yt, 'day': 16, 'free': kr['peak|free'], 'res': kr['peak|reserve']},
    {'k': 'hYw', 'yard': 'yantai', 'n': 450, 'day': 16, 'free': need(16, 'free', 450, 'yantai'), 'res': need(16, 'reserve', 450, 'yantai')},
    {'k': 'hOo', 'yard': 'yupu', 'n': own, 'day': 16, 'free': need(16, 'free', own), 'res': need(16, 'reserve', own)},
    {'k': 'hOo', 'yard': 'yupu', 'n': own, 'day': 24, 'free': need(24, 'free', own), 'res': need(24, 'reserve', own)},
    {'k': 'hOp', 'yard': 'yupu', 'n': peak, 'day': 16, 'free': need(16, 'free', peak), 'res': need(16, 'reserve', peak)},
    {'k': 'hOp', 'yard': 'yupu', 'n': peak, 'day': 24, 'free': need(24, 'free', peak), 'res': need(24, 'reserve', peak)},
    {'k': 'hH', 'yard': 'yupu', 'n': hhi[0], 'day': 24, 'free': need(24, 'free', hhi[0]), 'res': need(24, 'reserve', hhi[0]), 'field': hhi[1]},
    {'k': 'hS', 'yard': 'yupu', 'n': shen[0], 'day': 24, 'free': need(24, 'free', shen[0]), 'res': need(24, 'reserve', shen[0]), 'field': shen[1]},
]
assert [(r['free'], r['res']) for r in H1] == [(1, 1), (2, 2), (16, 69), (17, 27), (12, 15), (34, 117), (23, 46), (17, 27), (20, 37)], H1
yards['yantai']['demand'] = [yt, 2 * yt]
yards['yupu']['demand'] = [own, peak]

# building 014's load and its door bound; building 014 with one door (map r383) -> two doors (r393 / r395)
door = t20['change']['r395']['door_analytic']
yards['yantai']['door'] = {'share': round(door['share'], 4), 'occ_s': round(door['occ_mean_s'], 1), 'bound': round(door['bound'], 1)}
r383 = {row[0]: row[1:] for row in csv.reader(io.StringIO(show('results/t20_report_c12289dfda9d/t20_r383_r395.csv')))}
lead = lambda s: float(re.match(r'[\d,]+(?:\.\d+)?', s).group(0).replace(',', ''))
k = next(x for x in r383 if x.startswith('T1′·实体等概率'))
yards['yantai']['oneDoor'] = {'T1t': lead(r383[k][0]), 'plateau': lead(r383['预约平台（K = 100–150 平均）'][0])}
assert round(lead(r383[k][2])) == round(yards['yantai']['T1t'][0]), (r383[k], yards['yantai']['T1t'])

# leave-one-out with two yards: predict each yard's reservation plateau from the other's plateau / T1′.
# Predictor = system T1′ (T23, no sampling noise); the 10-seed sampled mean is kept for comparison.
def loo(key):
    ratio = {y: yards[y]['plateau']['reserve'] / key(y) for y in BATCH}
    out = {}
    for y, other in (('yupu', 'yantai'), ('yantai', 'yupu')):
        pred = ratio[other] * key(y)
        out[y] = {'ratio': round(ratio[y], 4), 'pred': round(pred, 1), 'err': round(pred / yards[y]['plateau']['reserve'] - 1, 4)}
    return out
LOO = loo(lambda y: yards[y]['T1sys']['main'])
LOO_S = loo(lambda y: yards[y]['T1t'][0])

# OSM roads inside each yard (the yard list, Overpass 2026-10-09); key = English name column
osm = {}
for line in YARDLIST.read_text(encoding='utf-8').splitlines():
    m = re.search(r'OSM (\d+) 条', line)
    if m and line.startswith('|'):
        cells = [c.strip() for c in line.strip('|').split('|')]
        osm[cells[1].split('（')[0].strip()] = int(m.group(1))
assert osm['Hanwha Ocean Okpo Shipyard'] == 31 and len(osm) == 8, osm

DATA = {'source': {'repo': 'thesis-core', 'commit': COMMIT}, 'yards': yards, 'loo': LOO, 'looSample': LOO_S, 'wholeYard': whole,
        'yearly': yearly, 'h1': H1, 'thr': thr, 'osm': osm}
out = Path(__file__).parent / 'data.js'
out.write_text('// Generated by make_data.py from thesis-core %s and the yard list; do not edit by hand.\nwindow.DATA=%s;\n'
               % (COMMIT, json.dumps(DATA, ensure_ascii=False, separators=(',', ':'))), encoding='utf-8')
for y in BATCH:
    v = yards[y]
    print(y, "T1′", v['T1t'], 'sys', v['T1sys'], 'plateau', v['plateau'], 'K*', v['Kstar20'], 'demand', v['demand'], 'bind', v['bind'], 'top', v['sysTop'])
    print('  interval', v['interval'], 'ratioMix', v['ratioMix'])
    print('  slack', v['slack'])
    print('  thr', thr[y])
print('yantai one door', yards['yantai']['oneDoor'], 'door', yards['yantai']['door'])
print('loo sys', LOO, 'loo sampled', LOO_S)
print('h1', [(r['k'], r['n'], r['day'], r['free'], r['res'], r.get('field')) for r in H1])
print('whole-yard', whole, 'yearly', yearly, 'osm', osm)
print(out, out.stat().st_size, 'bytes')
