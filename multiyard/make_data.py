"""Write data.js for the multi-yard deck (thesis chapter 6, C5 / H6) from reviewed sources only.

- thesis-core results at the reviewed commit 83c16bf (T17–T21), read with `git show`, never from the working tree:
  Okpo main batch a0ab16fceb94 (bounds.csv), T18 summary (K*, plateau), T19 summary (topology),
  Yantai main batch b82aa19b22af (bounds.csv), T20 summary (K*, plateau, topology, door load, task-volume derivation),
  T20 r383 -> r395 table (building 014 before and after its second door).
- The author's review of 2026-10-09 (00_总控/audit/response/占路运输全量审核意见与后续指导_20261009.md):
  appendix A probe on road 161 (T1′ whole road vs. blocks at its stops) and the public whole-yard scale (§0.2).
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
COMMIT = '83c16bf'
GUIDE = CTRL / 'audit' / 'response' / '占路运输全量审核意见与后续指导_20261009.md'
YARDLIST = CTRL / '船厂清单.md'
BATCH = {'yupu': 'a0ab16fceb94', 'yantai': 'b82aa19b22af'}   # main flag batches (reviews/T18.md, T20.md); networks unchanged in T21
SUBSET = (97, 194)   # Okpo task stream of the flag runs: "4 台车子集（Yim 2008）", checked against free flow below


def show(path):
    return subprocess.run(['git', '-C', str(REPO), 'show', f'{COMMIT}:{path}'], capture_output=True, check=True).stdout.decode('utf-8-sig')


def bounds(yard):
    """T1, T1′ (mean, min, max over 10 seeds), mean cycle time, and the T1′ binding resource per seed, main scenario."""
    rows = [r for r in csv.DictReader(io.StringIO(show(f'results/{BATCH[yard]}/bounds.csv'))) if r['scen'] == 'main']
    assert len(rows) == 10, (yard, len(rows))
    stat = lambda col: [round(sum(float(r[col]) for r in rows) / 10, 1), round(min(float(r[col]) for r in rows), 1), round(max(float(r[col]) for r in rows), 1)]
    bind = {}
    for r in rows:
        bind[r['tight_binding_1']] = bind.get(r['tight_binding_1'], 0) + 1
    return {'T1': stat('T1_network_per_day'), 'T1t': stat('T1_tight_per_day'), 'cycle': stat('cycle_min')[0],
            'bind': sorted(bind.items(), key=lambda kv: -kv[1])}


def free_last(yard, level):
    rows = [r for r in csv.DictReader(io.StringIO(show(f'results/{BATCH[yard]}/curves.csv')))
            if r['scen'] == 'main' and r['model'] == 'free' and r['level'] == level]
    return float(max(rows, key=lambda r: int(r['K']))['throughput_mean'])


t18 = json.loads(show('results/t18_report_d10b9015cd4d/t18_summary.json'))
t19 = json.loads(show('results/t19_compare_c963b53c1dde/t19_summary.json'))
t20 = json.loads(show('results/t20_report_c12289dfda9d/t20_summary.json'))
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
# cross-checks against the reports' own summaries
assert abs(yards['yupu']['T1t'][0] - t18['T1']['main']['T1t']) < 0.1
assert abs(yards['yantai']['T1t'][0] - t20['change']['r395']['bounds']['main']['T1t']) < 0.1
assert abs(yards['yupu']['plateau']['reserve'] - t18['H1']['main|reserve']['platform']['mean']) < 0.1
assert abs(yards['yantai']['plateau']['reserve'] - t20['change']['r395']['bounds']['main']['reserve_platform']) < 0.1

# task volumes per 16-h day: Okpo = the 4-transporter subset; Yantai = public steel use folded (t20_demand.csv, main row)
dem = [r for r in csv.DictReader(io.StringIO(show('results/t20_report_c12289dfda9d/t20_demand.csv'))) if r['main'] == 'True']
assert len(dem) == 1
yt = round(float(dem[0]['per_day']))
yards['yantai']['demand'] = [yt, 2 * yt]
yards['yantai']['demandSrc'] = {'block_t': float(dem[0]['block_t']), 'moves': float(dem[0]['moves']), 'per_day': round(float(dem[0]['per_day']), 2)}
yards['yupu']['demand'] = list(SUBSET)
for y in BATCH:   # with enough vehicles free flow serves exactly the demand of the batch
    for lev, d in zip(('regular', 'peak'), yards[y]['demand']):
        assert abs(free_last(y, lev) - d) < 0.5, (y, lev, free_last(y, lev), d)
# building 014's load (each of its two doors carries this share of all tasks) and its door bound
door = t20['change']['r395']['door_analytic']
yards['yantai']['door'] = {'share': round(door['share'], 4), 'occ_s': round(door['occ_mean_s'], 1), 'bound': round(door['bound'], 1)}

# building 014 with one door (map r383) -> two doors (r393 / r395)
r383 = {row[0]: row[1:] for row in csv.reader(io.StringIO(show('results/t20_report_c12289dfda9d/t20_r383_r395.csv')))}
lead = lambda s: float(re.match(r'[\d,]+(?:\.\d+)?', s).group(0).replace(',', ''))
k = next(x for x in r383 if x.startswith('T1′·实体等概率'))
yards['yantai']['oneDoor'] = {'T1t': lead(r383[k][0]), 'plateau': lead(r383['预约平台（K = 100–150 平均）'][0])}
assert round(lead(r383[k][2])) == round(yards['yantai']['T1t'][0]), (r383[k], yards['yantai']['T1t'])

# leave-one-out with two yards: predict each yard's reservation plateau from the other's plateau / T1′
ratio = {y: yards[y]['plateau']['reserve'] / yards[y]['T1t'][0] for y in BATCH}
loo = {}
for y, other in (('yupu', 'yantai'), ('yantai', 'yupu')):
    pred = ratio[other] * yards[y]['T1t'][0]
    loo[y] = {'ratio': round(ratio[y], 4), 'pred': round(pred, 1), 'err': round(pred / yards[y]['plateau']['reserve'] - 1, 4)}

# the author's review: whole-yard scale and the road-161 probe (appendix A, T1′ over 10 seeds)
guide = GUIDE.read_text(encoding='utf-8')
whole = [int(x) for x in re.search(r'全厂量级是每天 (\d+)–(\d+) 个', guide).groups()]
appA = guide.split('## 附录 A', 1)[1].split('## 附录 B', 1)[0]
def probe(section, col):
    """First numeric column `col` of each variant row in the appendix-A table under the bold heading `section`."""
    tbl = appA.split(f'**{section}**', 1)[1].split('\n\n', 2)[1]
    out = {}
    for line in tbl.splitlines():
        cells = [c.strip() for c in line.strip('|').split('|')]
        if cells[0] in ('现模型', 'w12', 'sect', 'sect_bay'):
            out[cells[0]] = float(cells[col].replace(',', ''))
    return out
probe_main, probe_ere = probe('主情景', 1), probe('搭载组合', 1)
assert probe_main['现模型'] == round(yards['yupu']['T1t'][0]), (probe_main, yards['yupu']['T1t'])

# OSM roads inside each yard (the yard list, Overpass 2026-10-09); key = English name column
osm = {}
for line in YARDLIST.read_text(encoding='utf-8').splitlines():
    m = re.search(r'OSM (\d+) 条', line)
    if m and line.startswith('|'):
        cells = [c.strip() for c in line.strip('|').split('|')]
        osm[cells[1].split('（')[0].strip()] = int(m.group(1))
assert osm['Hanwha Ocean Okpo Shipyard'] == 31 and len(osm) == 8, osm

DATA = {'source': {'repo': 'thesis-core', 'commit': COMMIT}, 'yards': yards, 'loo': loo, 'wholeYard': whole,
        'probe': {'main': probe_main, 'erection': probe_ere}, 'osm': osm}
out = Path(__file__).parent / 'data.js'
out.write_text('// Generated by make_data.py from thesis-core %s, the review of 2026-10-09 and the yard list; do not edit by hand.\nwindow.DATA=%s;\n'
               % (COMMIT, json.dumps(DATA, ensure_ascii=False, separators=(',', ':'))), encoding='utf-8')
for y in BATCH:
    v = yards[y]
    print(y, "T1′", v['T1t'], 'T1', v['T1'], 'plateau', v['plateau'], 'K*', v['Kstar20'], 'demand', v['demand'], 'bind', v['bind'], 'topo', v['topo'], 'dockEntry', v['dockEntry'])
print('yantai one door', yards['yantai']['oneDoor'], 'door', yards['yantai']['door'], 'demandSrc', yards['yantai']['demandSrc'])
print('loo', loo)
print('whole-yard', whole, 'probe', probe_main, probe_ere)
print('osm', osm)
print(out, out.stat().st_size, 'bytes')
