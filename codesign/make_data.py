"""Write data.js for the fleet–network co-design deck (thesis chapter 5).

Sources, all read-only:
  1. thesis-core at the reviewed commit a882742, read with `git show` (never the working tree, which holds unreviewed
     T27 changes):
     - T22 capacity intervals: the curves.csv of the saturated batches T22 §4 names (plateau = mean throughput over
       K = 100–150, T1′ = 10-seed mean), checked against results/t22_report_3287d62c7916/t22_interval.csv;
     - T22 vehicles needed at whole-yard volume: t22_demand.csv and t22_summary.json (K* interval); the two field
       anchors are parsed from the source table of docs/T22_report.md (§13, T24 full-text quotes);
     - T23 (results/97d667d16273 Okpo, results/e7f94238b96d Yantai): system.csv, prices.csv (two columns: shortest-path
       dispatch T1′, re-routing allowed T1″), platform.csv, route_free.csv, readout.csv. Each vehicle's daily capacity
       H/c̄ comes from the fleet bound K·H/c̄ in the curves.csv of the batch platform.csv names for that scenario.
  2. The 3-seed probe of the author's review of 9 Oct 2026, appendix A (00_总控/audit/response/
     占路运输全量审核意见与后续指导_20261009.md), kept only as history for widening and passing bays, which T22 did not rerun.
THESIS_CORE and CONTROL override the repository paths.

  python codesign/make_data.py
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
CONTROL = Path(os.environ.get('CONTROL') or ROOT / '00_总控')
GUIDE = CONTROL / 'audit' / 'response' / '占路运输全量审核意见与后续指导_20261009.md'
COMMIT = 'a882742'
T22R = 'results/t22_report_3287d62c7916'
T23D = {'yupu': 'results/97d667d16273', 'yantai': 'results/e7f94238b96d'}


def show(path):
    return subprocess.run(['git', '-C', str(REPO), 'show', f'{COMMIT}:{path}'], capture_output=True, check=True).stdout.decode('utf-8-sig')


def rows(path):
    return list(csv.DictReader(io.StringIO(show(path))))


num = lambda s: float(s.replace(',', ''))
pct = lambda new, old: 100 * (new - old) / old
fl = lambda s: float(s) if s not in ('', None) else None

# ---------- 1. T22 capacity intervals (T22 §4; saturated batches, 10 seeds) ----------
IVL = {   # key: (batch, scen, model)
    'yupu|main|whole': ('49d2383872e7', 'main', 'reserve'), 'yupu|main|stops': ('656e2da75368', 'main_s', 'reserve'),
    'yupu|erection|whole': ('dfb2758822ad', 'erection', 'reserve'), 'yupu|erection|stops': ('a1f485302418', 'erection_s', 'reserve'),
    'yantai|main|whole': ('b82aa19b22af', 'main', 'reserve'), 'yantai|main|stops': ('930e637e0658', 'main_s', 'reserve'),
}
ivl = {}
for key, (batch, scen, model) in IVL.items():
    cur = [r for r in rows(f'results/{batch}/curves.csv') if r['scen'] == scen and r['model'] == model and r['level'] == 'saturated']
    pl = [float(r['throughput_mean']) for r in cur if 100 <= int(r['K']) <= 150]
    t1 = {float(r['T1_tight']) for r in cur}
    assert len(pl) == 11 and len(t1) == 1, (key, len(pl), t1)
    ivl[key] = {'plateau': round(sum(pl) / len(pl), 2), 'T1': round(t1.pop(), 2)}
    ivl[key]['ratio'] = round(ivl[key]['plateau'] / ivl[key]['T1'], 4)
# the same numbers as the T22 summary table (one decimal there)
for r in rows(f'{T22R}/t22_interval.csv'):
    sec, model = r['rule'].split('|')
    key = f"{r['block']}|{sec}"
    if model == 'reserve' and key in ivl:
        assert abs(ivl[key]['plateau'] - float(r['plateau'])) <= 0.051, (key, ivl[key], r['plateau'])
        assert abs(ivl[key]['T1'] - float(r['T1_whole' if sec == 'whole' else 'T1_stops'])) <= 0.051, (key, r)
assert round(ivl['yupu|main|whole']['plateau']) == 627   # 627.45: shown as 627 (the T22 report's 628 rounds twice)
# 10-seed range and the noise-free system T1′ (T23 system.csv) for the whole-road rows
for yard, scens in (('yupu', ('main', 'erection')), ('yantai', ('main',))):
    sysr = {r['scen']: r for r in rows(f'{T23D[yard]}/system.csv')}
    for s in scens:
        r, k = sysr[s], f'{yard}|{s}|whole'
        assert abs(float(r['ref_mean']) - ivl[k]['T1']) < 0.01, (k, r['ref_mean'])
        ivl[k].update(lo=round(float(r['ref_min']), 2), hi=round(float(r['ref_max']), 2), sys=round(float(r['T1_system']), 2))
seg = {}
for s in ('main', 'erection'):
    w, st = ivl[f'yupu|{s}|whole'], ivl[f'yupu|{s}|stops']
    seg[s] = {'dT1': round(pct(st['T1'], w['T1']), 4), 'dPl': round(pct(st['plateau'], w['plateau']), 4)}
# T22 report §0 item 4 and §4: main +8% / +0.3%; erection +77% (76.49 before rounding) / +8.3%; ratio 0.87 → 0.53, main 0.34–0.36
assert round(seg['main']['dT1']) == 8 and round(seg['main']['dPl'], 1) == 0.3, seg
assert round(seg['erection']['dT1'], 1) == 76.5 and round(seg['erection']['dPl'], 1) == 8.3, seg
assert round(ivl['yupu|erection|whole']['ratio'], 2) == 0.87 and round(ivl['yupu|erection|stops']['ratio'], 2) == 0.53
assert round(ivl['yupu|main|stops']['ratio'], 2) == 0.34 and round(ivl['yupu|main|whole']['ratio'], 2) == 0.36

# ---------- 2. T22 vehicles needed at whole-yard volume (T22 §6; integer K, 10 seeds, whole road) ----------
kreq = {(r['section'], float(r['day_h']), r['model'], int(r['demand'])): r['K_req']
        for r in rows(f'{T22R}/t22_demand.csv') if r['yard'] == 'yupu'}
LEVELS = [(339, 16), (339, 24), (500, 24), (600, 16), (600, 24), (678, 16), (678, 24)]
need = [{'n': n, 'h': h, **{m: int(kreq[('whole', float(h), m, n)]) for m in ('free', 'reserve', 'segment')}} for n, h in LEVELS]
# the segmented dock road differs by at most one vehicle in these cells
assert all(abs(int(kreq[('stops', float(h), m, n)]) - int(kreq[('whole', float(h), m, n)])) <= 1
           for n, h in LEVELS for m in ('free', 'reserve', 'segment'))
nd = {(d['n'], d['h']): d for d in need}
assert (nd[339, 16]['free'], nd[339, 24]['free'], nd[339, 16]['reserve'], nd[339, 24]['reserve']) == (17, 12, 27, 15)
assert (nd[600, 16]['free'], nd[600, 24]['free'], nd[600, 16]['reserve'], nd[600, 24]['reserve']) == (30, 20, 88, 37)
assert (nd[600, 16]['segment'], nd[600, 24]['segment'], nd[678, 16]['reserve'], nd[678, 24]['reserve']) == (47, 27, 117, 46)
assert (nd[500, 24]['free'], nd[500, 24]['reserve']) == (17, 27)
kstar = json.loads(show(f'{T22R}/t22_summary.json'))['K_star']['yupu']
assert kstar == [50, 60], kstar
rep = show('docs/T22_report.md')
m = re.search(r'(\d+)대의 트랜스포터를 이용하여, 하루 (\d+)시간동안 약 (\d+)여개', rep)
hhi = {'veh': int(m.group(1)), 'h': int(m.group(2)), 'n': int(m.group(3))}
shen = {'n': int(re.search(r'about (\d+) blocks need to be transported daily', rep).group(1)),
        'veh': int(re.search(r'possess about (\d+) transporters', rep).group(1)), 'h': 24}   # shift not stated; read at 24 h (T22 §6.2)
assert hhi == {'veh': 24, 'h': 24, 'n': 500} and shen['n'] == 600 and shen['veh'] == 30
# both field fleets lie between free flow and reservation under a 24 h day (T22 §0 item 6)
assert nd[500, 24]['free'] < hhi['veh'] < nd[500, 24]['reserve'] and nd[600, 24]['free'] < shen['veh'] < nd[600, 24]['reserve']
anchors = [{'name': 'hhi', **hhi}, {'name': 'shen', **shen}]

# ---------- 3. T23: dual prices in vehicles (two columns), plateau / bound, route slack ----------
SCEN = ('main', 'erection', 'crane')


def per_vehicle(src):
    """H/c̄ of the batch and scenario a platform.csv row names (`<batch>:<scen>`): fleet bound ÷ K, the same at every K."""
    batch, scen = src.split(':')
    v = {round(float(r['fleet_bound']) / int(r['K']), 6) for r in rows(f'results/{batch}/curves.csv')
         if r['scen'] == scen and r['fleet_bound'] not in ('', 'nan')}
    assert len(v) == 1, (src, v)
    return v.pop()


def short(name):
    """'道路161（W=9.0，1095 m）' -> '161'; an entrance node -> 'gate'."""
    m = re.match(r'道路(\S+?)（W=', name)
    return m.group(1) if m else 'gate'


rates, slack = [], []
for yard in ('yupu', 'yantai'):
    plat = {(r['scen'], r['model']): r for r in rows(f'{T23D[yard]}/platform.csv')}
    price = rows(f'{T23D[yard]}/prices.csv')
    rf = {r['scen']: r for r in rows(f'{T23D[yard]}/route_free.csv')}
    ro = {r['scen']: r for r in rows(f'{T23D[yard]}/readout.csv')}
    for s in SCEN:
        hc = per_vehicle(plat[s, 'reserve']['src'])
        for r in price:
            p1, p2 = float(r['T1′_price']), float(r['T1″_price'])
            if r['scen'] != s or (p1 <= 0 and p2 <= 0):
                continue
            rates.append({'yard': yard, 'scen': s, 'res': short(r['name']), 'w': fl(r['W']) if r['type'] == '路段' else None,
                          'len': fl(r['L']), 'p1': round(p1, 2), 'p2': round(p2, 2), 'v1': round(p1 / hc, 2), 'v2': round(p2 / hc, 2),
                          'd1': round(float(r['T1′_d10']), 2), 'd2': round(float(r['T1″_d10']), 2),
                          'f1': round(float(r['T1′_d10_first']), 2), 'perVeh': round(hc, 2),
                          'w1a': fl(r.get('T1′_w1')), 'w1b': fl(r.get('T1″_w1')),
                          'mix': round(float(plat[s, 'reserve']['ratio_mix']), 4), 'sys': round(float(plat[s, 'reserve']['ratio_sys']), 4),
                          'mixRef': round(float(plat[s, 'segment']['ratio_mix']), 4)})
        f, o = rf[s], ro[s]
        slack.append({'yard': yard, 'scen': s, 'T1': round(float(f['T1_system']), 2), 'T1pp': round(float(f['T1pp']), 2),
                      'lo': max(0, round(100 * float(f['margin_lo_rel']), 4)), 'hi': max(0, round(100 * float(f['margin_hi_rel']), 4)),
                      'res': short(o['name']), 'pass': round(100 * float(o['pass_share']), 4),
                      'alt': round(100 * fl(o['alt_slack']), 1) if fl(o['alt_slack']) is not None else None,
                      'extra': round(fl(o['alt_extra_m'])) if fl(o['alt_extra_m']) is not None else None})
R = {(r['yard'], r['scen'], r['res']): r for r in rates}
# T23 §0, §4.3: road 161 in the erection mix ≈ 1.8 vehicles per extra hour a day; crane cadence: 010-6 only in the T1′ column,
# 013-7 only in the T1″ column; Yantai: entrance A of building 014 binds in main and crane cadence, road 007 in the erection mix
assert len(rates) == 7, [(r['yard'], r['scen'], r['res']) for r in rates]
assert round(R['yupu', 'erection', '161']['v1'], 1) == 1.8 and round(R['yupu', 'erection', '161']['v2'], 1) == 1.9
assert R['yupu', 'crane', '010-6']['p2'] == 0 and R['yupu', 'crane', '013-7']['p1'] == 0
assert round(R['yupu', 'crane', '010-6']['d1']) == 198 and round(R['yupu', 'crane', '010-6']['w1a'], 1) == 187.5
assert R['yupu', 'main', '161']['w1a'] == 0 and round(R['yantai', 'erection', '007']['w1a']) == 127
assert round(R['yantai', 'main', 'gate']['d1'], 1) == 2.3 and round(R['yantai', 'main', 'gate']['f1']) == 144
assert round(100 * R['yupu', 'erection', '161']['mix']) == 86 and round(100 * R['yupu', 'erection', '161']['mixRef']) == 92
others = [r['mix'] for r in rates if not (r['yard'] == 'yupu' and r['scen'] in ('erection', 'crane'))]
assert (round(100 * min(others)), round(100 * max(others))) == (36, 45), others   # T23 review §4: the other scenarios, reservation 36–45 %
S = {(s['yard'], s['scen']): s for s in slack}
assert (round(S['yupu', 'crane']['lo'], 1), round(S['yupu', 'crane']['hi'], 1)) == (45.4, 48.4)
assert (round(S['yupu', 'main']['lo'], 1), round(S['yupu', 'main']['hi'], 1)) == (3.7, 5.3)
assert (round(S['yupu', 'erection']['lo'], 1), round(S['yantai', 'erection']['lo'], 1)) == (5.1, 7.9)
assert S['yantai', 'main']['hi'] == 0 and S['yantai', 'crane']['hi'] == 0
assert round(S['yupu', 'crane']['pass']) == 97 and S['yupu', 'crane']['res'] == '010-6'


# ---------- 4. the 3-seed probe (review appendix A): history for widening and passing bays ----------
def table_after(text, heading):
    lines = text[text.index(heading):].splitlines()[1:]
    start = next(i for i, l in enumerate(lines) if l.startswith('|'))
    out = []
    for l in lines[start + 2:]:
        if not l.startswith('|'):
            break
        out.append([c.strip() for c in l.strip('|').split('|')])
    return out


guide = GUIDE.read_text(encoding='utf-8')
appA = guide[guide.index('## 附录 A'):guide.index('## 附录 B')]
ere = {r[0]: num(r[3]) for r in table_after(appA, '**搭载组合**')}   # reservation, K = 100, 3 seeds
probe = {'w12': round(pct(ere['w12'], ere['现模型']), 4), 'sect': round(pct(ere['sect'], ere['现模型']), 4),
         'bay': round(pct(ere['sect_bay'], ere['sect']), 4)}
assert round(probe['w12'], 1) == 4.1 and round(probe['sect'], 1) == 9.5 and round(probe['bay'], 1) == -0.2, probe   # review: +10% / +4% (rounded twice)

DATA = {'source': {'repo': 'thesis-core', 'commit': COMMIT, 't22': T22R, 't23': T23D, 'probe': GUIDE.name + ' 附录 A'},
        'ivl': ivl, 'seg': seg, 'need': need, 'kstar': kstar, 'anchors': anchors, 'rates': rates, 'slack': slack, 'probe': probe}
out = Path(__file__).parent / 'data.js'
out.write_text('// Generated by make_data.py from thesis-core %s (T22, T23) and the 2026-10-09 review (appendix A); do not edit by hand.\n'
               'window.DATA=%s;\n' % (COMMIT, json.dumps(DATA, ensure_ascii=False, separators=(',', ':'))), encoding='utf-8')
print(json.dumps({'ivl': ivl, 'seg': seg}, ensure_ascii=False))
print('need', need)
for r in rates:
    print(r['yard'], r['scen'], r['res'], r['p1'], r['p2'], r['v1'], r['v2'], r['perVeh'], r['mix'], r['sys'], r['d1'], r['f1'], r['w1a'])
for s in slack:
    print(s)
print('probe', probe)
print(out, out.stat().st_size, 'bytes')
