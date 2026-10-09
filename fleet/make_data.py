"""Write data.js for the fleet deck from the R25 result files of the MY-B repository (paper03), with the logic of
paper/figs/make_r25_figures.py. The environment variable PAPER03 overrides the repository path.

  conda activate paper; python fleet/make_data.py
"""
import csv, json, os, sys
from pathlib import Path
ROOT = Path(os.environ.get('PAPER03') or Path(__file__).resolve().parents[2] / '00..小论文' / 'Path Planing and Scheduling' / 'paper03')
RES = ROOT / 'research_R25' / 'results'
sys.path.insert(0, str(ROOT / 'research_R25' / 'code'))
import r25_costs as C

rcsv = lambda p: list(csv.DictReader(open(p, encoding='utf-8-sig')))
MS = ['M1', 'M2', 'M3', 'M4', 'M5', 'M6']; HS = ['H1', 'H2', 'H3']; DS = ['D-emp', 'D-tight']
cells = ['%s_%s_%s' % (m, h, d) for m in MS for h in HS for d in DS]
rs = C.main_r()
fl = {(r['cell'], r['family']): r for r in rcsv(RES / 'R4_fleets.csv')}
dec = [x for x in rcsv(RES / 'R4_decisions_main.csv') if x['model'] == 'affine']
a1 = {(x['cell'], x['labour'], round(float(x['r']), 6)): float(x['support']) for x in rcsv(RES / 'A1_decisions.csv') if x['model'] == 'affine'}
a2 = {(x['cell'], x['labour'], round(float(x['r']), 6)): x['grade'] for x in rcsv(RES / 'A2_decisions.csv') if x['model'] == 'affine'}

heat = {}
for lab in ('shift_h', 'crew_team_h'):
    w = {(x['cell'], round(float(x['r']), 6)): x['winner'] for x in dec if x['labour'] == lab}
    rows = []
    for c in cells:
        row = []
        for r in rs:
            k = round(r, 6); f = w[c, k]
            row.append([f, round(100 * float(fl[c, f]['coop_share'])),
                        int(a1.get((c, lab, k), 1.0) < 0.8), int(a2.get((c, lab, k)) == 'weak')])
        rows.append(row)
    heat[lab] = rows

mech = json.loads((RES / 'C1_numbers.json').read_text(encoding='utf8'))
P = C.proxy(('affine',)); rm = rs[4]
cost = {k: rm * P(C.caps(k[0], k[1], int(v['K_final']))) + 64 * int(v['K_final']) for k, v in fl.items()}
best = {c: min(v for k, v in cost.items() if k[0] == c) for c in cells}
scatter = [[k[1], round(100 * mech['per_series']['%s_%s' % k]['coop_service_share'], 1),
            round(100 * (cost[k] / best[k[0]] - 1), 1), int(fl[k]['K_final']), k[0]] for k in fl]

price = [[int(x['capacity_t']), round(float(x['unit_price_CNY_ex_VAT']) / 1e6, 3), int(x['quantity'])]
         for x in rcsv(RES / 'S1_price_sources.csv')]

lv = rcsv(RES / 'R4_R7_levels.csv'); kf = {x['series']: int(x['K_final']) for x in lv}
stack = {}
for lev in ('greedy', 'cp0', 'cp100', 'cp300', 'single', 'final'):
    dk = [int(x['K_' + lev]) - kf[x['series']] for x in lv]
    stack[lev] = [sum(d == 0 for d in dk), sum(d == 1 for d in dk), sum(d >= 2 for d in dk)]

lr = rcsv(RES / 'R4_loadrule.csv')
load = {due: [[x, sum(int(r['d']) == x for r in lr if r['cell'].endswith(due) and r['d'] not in ('', 'None'))] for x in range(-1, 6)]
        for due in DS}

sc = rcsv(RES / 'C1_scratch.csv')
case = {k: {x['type']: [int(x['K']), float(x['capital_proxy']), x['needs_after_shift'] == 'True'] for x in sc if x['k'] == k} for k in ('6', '8')}

kstar = {c: {f: int(fl[c, f]['K_final']) for (cc, f) in fl if cc == c} for c in cells}

# cost calculator: every fleet series of a condition at its K* (affine curve; labour-hours per day)
FAMS = ['200', '250', '270', '300', '325', '380', '425', '500', '550', 'MX1', 'MX2']
calc = {}
for c in cells:
    calc[c] = []
    for f in FAMS:
        v = fl.get((c, f))
        if v is None:
            continue
        K = int(v['K_final']); qs = C.caps(c, f, K)
        calc[c].append([f, K, round(P(qs), 4), 64 * K, round(float(v['crew_team_h']), 1), round(float(v['crew_veh_h']), 1),
                        round(100 * float(v['coop_share']), 1), max(qs)])
    for j, r in enumerate(rs):      # the calculator must reproduce the manuscript's winners (shift staffing)
        w = min(calc[c], key=lambda x: r * x[2] + x[3])[0]
        assert w == heat['shift_h'][cells.index(c)][j][0], (c, r, w)

# block masses of each mass scenario, pooled over the 30 days (seeds 101-130)
R4 = ROOT / 'research_R25' / 'R4'
spec = {s['name']: s for s in json.loads((R4 / 'series.json').read_text(encoding='utf8'))}
base = lambda cell, fam, seed: json.loads((R4 / spec['%s_%s' % (cell, fam)]['base'][str(seed)]).read_text(encoding='utf8'))
TIERS = [200, 250, 270, 300, 325, 380, 425, 500, 550]
masses = {}
for m in MS:
    ms = [t['mass'] for s in range(101, 131) for t in base('%s_H1_D-emp' % m, '550', s)['tasks']]
    masses[m] = dict(hist=[sum(lo <= x < lo + 50 for x in ms) for lo in range(0, 850, 50)], n=len(ms), lo=min(ms), hi=max(ms),
                     above={q: round(100 * sum(x > q for x in ms) / len(ms), 1) for q in TIERS})

# one real day, replayed from stored runs: uniform masses, short handling, baseline due dates, seed 101
sys.path.insert(0, str(ROOT / 'research_R25' / 'code_v4' / 'common'))
from core import Inst, evaluate                                     # noqa: E402
EX_CELL, EX_SEED = 'M3_H1_D-emp', 101


def replay(fam):
    name = '%s_%s' % (EX_CELL, fam); sp = spec[name]; K = int(fl[EX_CELL, fam]['K_final'])
    runs = [json.loads(p.read_text(encoding='utf8')) for p in sorted((R4 / 'runs' / name).glob('K%d_s%d_j*.json' % (K, EX_SEED)))]
    r = max((x for x in runs if x['n_over'] == 0), key=lambda x: x['on_time'])
    d = base(EX_CELL, fam, EX_SEED)
    d['vehicles'] = [dict(d['vehicles'][q], cap=cq) for q, cq in enumerate(C.caps(EX_CELL, fam, K))]
    d['tauE_start'] = d['tauE_start'][:K]
    d['meta'].update(objective_mode=sp['objective'], tmax_s=sp['tmax_s'], crew_team=None)
    inst = Inst(d)
    team = {int(i): tuple(v) for i, v in r['team'].items()}
    ev = evaluate(inst, r['order'], team, 0, detail=True)
    assert sum(ev['comp'][i] <= inst.due[i] for i in range(inst.n)) == r['on_time']
    veh = [[[i, ev['arrive'][i][k], ev['start'][i], ev['comp'][i], len(team[i])] for i in seq] for k, seq in enumerate(ev['seqs'])]
    return dict(fam=fam, K=K, on=r['on_time'], coop=ev['n_coop'], veh=veh, P=round(P(C.caps(EX_CELL, fam, K)), 4),
                hours=dict(work=round(ev['work'] / 3600, 1), empty=round(ev['empty'] / 3600, 1), sync=round(ev['sync'] / 3600, 2),
                           service=round(ev['service'] / 3600, 1)),
                late=max(0, max(ev['comp'][i] - inst.due[i] for i in range(inst.n))))


# only mass, release and due are published: travel times of the main yard stay private (they reveal its layout)
ex_tasks = [[t['mass'], t['release'], t['due']] for t in base(EX_CELL, '500', EX_SEED)['tasks']]
example = dict(cell=EX_CELL, seed=EX_SEED, tasks=ex_tasks, fleets=[replay('500'), replay('270')])

# ---- later studies (R3 delay cap, E7 heavy-block share, B4 tier speeds, R4R overweight-only coupling): official result files ----
import re, statistics                                               # noqa: E402
from collections import Counter                                     # noqa: E402
import b4_liu_compare as B                                          # noqa: E402
R25 = ROOT / 'research_R25'
med = statistics.median

# R4R: price of overweight-only coupling
por = rcsv(RES / 'R4R_por.csv')
r4r_rows = rcsv(RES / 'R4R_fleets.csv')
por_grid = {c: [] for c in cells}
for x in por:
    if x['model'] == 'affine' and x['labour'] == 'shift_h':
        por_grid[x['cell']].append([round(100 * float(x['por']), 2), x['winner_flex'], x['winner_rigid']])
pv = [float(x['por']) for x in por]
por_all = dict(n=len(pv), pos=sum(v > 1e-12 for v in pv), neg=sum(v < -1e-12 for v in pv), neg_small=sum(-0.01 < v < -1e-12 for v in pv),
               neg_big=sum(v <= -0.01 for v in pv), neg_min=round(100 * min(pv), 1),
               big_cells=sorted({x['cell'] for x in por if float(x['por']) <= -0.01}), max=round(100 * max(pv), 2))
# extra-heavy, short, baseline: the overweight-only two-heavy mix qualifies with one transporter fewer than its flexible runs
m4 = [x for x in por if x['cell'] == 'M4_H1_D-emp' and x['labour'] in ('shift_h', 'shift_ot_h') and x['winner_flex'] == '550' and x['winner_rigid'] == 'MX2' and float(x['por']) < -1e-12]
assert len(m4) == 89, len(m4)                                        # manuscript, Section 5.4 "Search"
qualified_rigid = sorted(r['series'] for r in r4r_rows if r['K_final'] not in ('', 'None'))
assert por_all['n'] == 6480 and len(r4r_rows) == 72 and len(qualified_rigid) == 6

# B4: counts and decisions at manufacturer speeds (B4_summary.md table; B4_decisions.csv)
b4cols, b4k = None, []
for line in (RES / 'B4_summary.md').read_text(encoding='utf8').splitlines():
    cells_md = [c.strip() for c in line.strip().strip('|').split('|')]
    if cells_md[0] == 'condition' and b4cols is None:
        b4cols = cells_md
    elif b4cols and re.match(r'M\d_H\d_D-', cells_md[0]):
        for f, v in zip(b4cols[1:], cells_md[1:]):
            m = re.match(r'(\d+) -> (\d+)(?: \((R4|bound)\))?', v)
            if f in ('380', '425', '500', '550', 'MX1', 'MX2') and m:
                b4k.append([cells_md[0], f, int(m[1]), int(m[2]), m[3] or ''])
    elif b4cols and not line.startswith('|'):
        if b4k:
            break
b4d = rcsv(RES / 'B4_decisions.csv')
sh = [x for x in b4d if x['labour'] == 'shift_h']
b4dec = dict(n=len(b4d), changed=sum(x['winner_common'] != x['winner_tier'] for x in b4d), changed_opt=sum(x['winner_common'] != x['winner_tier_mix_opt'] for x in b4d),
             n_shift=len(sh), changed_shift=sum(x['winner_common'] != x['winner_tier'] for x in sh),
             shift_moves=Counter('%s %s>%s' % (x['cell'], x['winner_common'], x['winner_tier']) for x in sh if x['winner_common'] != x['winner_tier']),
             regret=round(100 * max(float(x['regret_common_winner']) for x in b4d), 1),
             roh_550=sum(x['winner_tier'] == '550' for x in b4d if x['cell'].startswith('M5')), roh_n=sum(x['cell'].startswith('M5') for x in b4d),
             liu_425=sum(x['winner_tier'] == '425' for x in b4d if x['cell'].startswith('M6')), liu_n=sum(x['cell'].startswith('M6') for x in b4d),
             le10=sum(float(x['coop_tier']) <= 0.1 + 1e-9 for x in b4d))
b4dec['shift_moves'] = dict(b4dec['shift_moves'])
assert (b4dec['changed'], b4dec['changed_opt'], b4dec['changed_shift'], b4dec['regret']) == (178, 114, 45, 18.6), b4dec
assert (b4dec['roh_550'], b4dec['liu_425'], b4dec['le10']) == (360, 350, 1054), b4dec

# Liu mixes (main 180-setting grid, as in the manuscript): common speeds and every mix member at 10/5 km/h
r4c, r3c, b4c = B.load(RES / 'R4_fleets.csv'), B.load(RES / 'R3_fleets.csv', prefix='T120_'), B.load(RES / 'B4_fleets.csv')
liu = {}
for setting in ('main', 'all_10_5'):
    cands = B.candidates(r4c, r3c, b4c, setting)
    rows = B.compare(cands, C.MAIN_MODELS, rs, C.LAB4)
    liu[setting] = dict(B.summarise(rows), winners=dict(Counter(x['winner'] for x in rows)))
assert liu['main']['l300_cheapest'] == 180 and liu['all_10_5']['l300_cheapest'] == 172, liu
cands = B.candidates(r4c, r3c, b4c, 'all_10_5')
b4rows = {(r['cell'], r['family']): r for r in rcsv(RES / 'B4_fleets.csv')}
Paff = C.proxy(('affine',))
r3t120 = {(r['cell'], r['family']): r for r in rcsv(RES / 'R3_fleets.csv') if r['series'].startswith('T120_')}
coop_of = lambda src, f: float((src.get((B.CELL, f)) or fl.get((B.CELL, f)))['coop_share'])
liu['main']['coop_max'] = round(100 * max(coop_of(r3t120, f) for f in liu['main']['winners']), 1)
liu['all_10_5']['coop_max'] = round(100 * max(coop_of(b4rows, f) for f in liu['all_10_5']['winners'] if f.startswith('L')), 1)
assert (liu['main']['coop_max'], liu['all_10_5']['coop_max']) == (2.1, 0.1), liu      # manuscript, Section 5.1
liu_table = [[f, v['K'], round(Paff(B.caps(f, v['K'], hv or 550)), 4), 64 * v['K'], round(v['crew_team_h'], 1), round(v['crew_veh_h'], 1),
              round(100 * float((b4rows.get((B.CELL, f)) or fl.get((B.CELL, f)) or {}).get('coop_share') or 0), 1), hv]
             for f, (v, hv) in sorted(cands.items())]

# R3: delay-cap axis under shift staffing (45 settings per scenario and cap), and the fleets that qualified with one fewer uncapped
r3g = [x for x in rcsv(RES / 'R3_grid.csv') if x['labour'] == 'shift_h']
LEVELS = ['inf', '480', '240', '120', '60', '30']
r3 = {}
for c in ('M1_H1_D-emp', 'M3_H1_D-emp', 'M6_H1_D-emp'):
    r3[c] = []
    for lev in LEVELS:
        g = [x for x in r3g if x['cell'] == c and x['level'] == lev]
        assert len(g) == 45 and len({x['winner'] for x in g}) == 1, (c, lev)
        cv = [100 * float(x['cost_vs_inf']) for x in g]
        r3[c].append([lev, g[0]['winner'], int(g[0]['K']), g[0]['fleet'], round(100 * float(g[0]['coop']), 1),
                      round(med(cv), 2), round(min(cv), 2), round(max(cv), 2)])
late_blocks = [[x['cell'], x['family'], int(x['K_uncapped']), int(x['K_120']), round(100 * float(x['coupled_share']), 1), float(x['max_delay_h']),
                int(x['late_over_4h']), int(x['late_over_4h_coupled'])] for x in rcsv(RES / 'R3_late_blocks.csv')]
assert len(late_blocks) == 8 and min(x[5] for x in late_blocks) == 13.1 and max(x[5] for x in late_blocks) == 18.8

# E7: cheapest fleet by heavy-block share (affine, shift staffing; the same at all nine r)
e7 = rcsv(RES / 'E7_decisions.csv')
e7f = {(r['cell'], r['family']): r for r in rcsv(RES / 'E7_fleets.csv')}
e7w = {}
for x in e7:
    if x['model'] == 'affine' and x['labour'] == 'shift_h':
        e7w.setdefault((x['handling'], x['p']), set()).add(x['winner'])
assert all(len(v) == 1 for v in e7w.values())
E7P = ['0.0', '0.02', '0.05', '0.1', '0.2', '0.35', '0.5']
e7_rows = {h: [[p, next(iter(e7w[h, p])), round(100 * float(e7f[('E7p%.2f_%s_D-emp' % (float(p), h)), next(iter(e7w[h, p]))]['coop_share']), 1)]
               for p in E7P] for h in ('H1', 'H2')}
e7_le10 = sum(float(e7f[('E7p%.2f_%s_D-emp' % (float(x['p']), x['handling'])), x['winner']]['coop_share']) <= 0.1 + 1e-9 for x in e7)
assert len(e7) == 2520 and e7_le10 == 2502, e7_le10

# E5: one assumed parameter changed at a time (four conditions, five reference fleets). Per changed level: settings whose
# cheapest fleet changed under shift staffing (of 180), the largest coupled share of the shift-staffing winners, and over all
# four labour measures the settings with a cheapest fleet and those whose cheapest fleet couples at most one block in ten
e5 = []
for x in rcsv(RES / 'E5_levels.csv'):
    if x['level'] == 'base':
        continue
    if not e5 or e5[-1][:2] != [x['factor'], x['value']]:
        e5.append([x['factor'], x['value'], 0, 0.0, 0, 0, 0])
    row = e5[-1]
    row[6] += 1
    if x['winner']:
        row[4] += 1
        row[5] += float(x['coop_share']) <= 0.1 + 1e-12
        if x['labour'] == 'shift_h':
            row[2] += x['winner'] != x['base_winner']
            row[3] = max(row[3], round(100 * float(x['coop_share']), 1))
e5d = {(f, v): r for f, v, *r in e5}
assert [e5d[k][0] for k in [('coupling time (min)', v) for v in ('0', '20', '30', '40')]] == [77, 0, 0, 0]          # manuscript, Section 5.5
assert [e5d[k][0] for k in [('handling factor', v) for v in ('0.5', '0.67', '1.5', '2.0')]] == [77, 12, 13, 13]
assert [e5d[k][0] for k in [('speed factor', v) for v in ('0.75', '0.5', 'Liu 50/30 m/min')]] == [89, 45, 45]
assert e5d[('coupling time (min)', '0')][1] == 12.5 and max(r[1] for k, r in e5d.items() if k[1] != '0' or k[0] != 'coupling time (min)') == 5.4
assert round(100 * e5d[('coupling time (min)', '0')][3] / 720) == 89
assert round(100 * min(r[3] / r[2] for k, r in e5d.items() if k != ('coupling time (min)', '0'))) == 92
# A2: the claim "the cheapest fleet couples at most one block in ten" if coupling fleets near their boundary had one transporter fewer
sb = json.loads((RES / 'search_bound.json').read_text(encoding='utf8'))
sbound = {k: [round(100 * sb[k]['share'], 1), round(100 * sb[k]['share_outside_extra_heavy'], 1)] for k in ('reported', 'weak_or_medium_minus_one', 'all_minus_one')}
assert sbound == {'reported': [90.8, 99.4], 'weak_or_medium_minus_one': [86.9, 98.9], 'all_minus_one': [68.8, 80.9]}, sbound   # manuscript, Section 5.5

progress, stamps = {}, []
for st in ('S2', 'S4'):                                             # S4 starts after S2; no progress.json until then
    pf = R25 / st / 'progress.json'
    if pf.exists():
        pj = json.loads(pf.read_text(encoding='utf8'))
        progress[st] = [pj['series_done'], pj['series'], pj['done_runs'], pj['est_total_runs']]
        stamps.append(pj['updated'])
v1log = R25 / 'V1' / 'exact_run.log'                                # one line per finished series of the exact arm (70 series)
progress['V1'] = [None, 'v1Exact', sum(x.startswith('V1_') for x in v1log.read_text(encoding='utf8').splitlines()), 70]
stamps.append(v1log.stat().st_mtime)
late = dict(por_grid=[por_grid[c] for c in cells], por_all=por_all, m4=len(m4), rigid=dict(series=len(r4r_rows), qualified=qualified_rigid),
            liu=dict(main=liu['main'], all_10_5=liu['all_10_5'], table=liu_table), b4k=b4k, b4dec=b4dec,
            r3=r3, late_blocks=late_blocks, e7=e7_rows, e7_le10=[e7_le10, len(e7)], e5=e5, sbound=sbound, progress=progress,
            asof=__import__('time').strftime('%Y-%m-%d %H:%M', __import__('time').localtime(max(stamps))))

# ---- OE manuscript (paper/oe): data of Figs 3, 5, 7 and 8, same definitions as paper/oe/scripts ----
import math                                                         # noqa: E402
import numpy as np                                                  # noqa: E402
# Fig. 3: smallest tier that carries every block of a mass scenario alone (None: some block exceeds every tier)
sct = {m: next((q for q in TIERS if q >= masses[m]['hi']), None) for m in MS}
# Fig. 5a: transporter-hours per day relative to the 550 t fleet of the same condition, outside M4 (fig3.py)
vh = {k: float(v['crew_veh_h']) / 4 for k, v in fl.items()}
occ = [[k[1], round(100 * float(fl[k]['coop_share']), 2), round(100 * (vh[k] / vh[k[0], '550'] - 1), 2), k[0]]
       for k in fl if not k[0].startswith('M4')]
ox, oy = np.array([o[1] for o in occ]), np.array([o[2] for o in occ])
occ_fit = [float(v) for v in np.polyfit(ox, oy, 1)] + [float(np.corrcoef(ox, oy)[0, 1])]
occ_hi = float(np.mean([1 + o[2] / 100 for o in occ if o[1] >= 60]))
sync = sorted(mech['per_series']['%s_%s' % k]['sync_share'] for k in fl)
# Fig. 5b: transporters beyond the input-only workload rule, (K* - K_rho) / K*, by coupled share and due dates
BINS = [(-0.01, 0.0001, '0'), (0.0001, 0.1, '0–10'), (0.1, 0.3, '10–30'), (0.3, 0.6, '30–60'), (0.6, 1.0, '60–100')]
lrv = [x for x in lr if x['d'] not in ('', 'None')]
lrr = [(x['cell'].split('_')[2], float(fl[x['cell'], x['family']]['coop_share']), int(x['d']) / int(x['K_star'])) for x in lrv]
slack = {}
for due in DS:
    slack[due] = []
    for lo, hi, lab in BINS:
        v = [d for du, cs, d in lrr if du == due and lo < cs <= hi]
        sem = statistics.stdev(v) / math.sqrt(len(v))
        slack[due].append([lab, round(100 * statistics.mean(v), 2), round(196 * sem, 2), len(v)])
krho = dict(exact=sum(int(x['d']) == 0 for x in lrv), within1=sum(abs(int(x['d'])) <= 1 for x in lrv), n=len(lrv), rows=len(lr))
# Fig. 7: share of settings won by a fleet coupling at most 10%, as r runs from 0.5 to 5,000 labour-hours (fig6.py)
fl4 = C.load(RES / 'R4_fleets.csv')
brs = np.exp(np.linspace(math.log(0.5), math.log(5000), 300))
brec, bm4 = [], []
for c in cells:
    fams = [f for (cc, f) in fl4 if cc == c]
    for m in C.MAIN_MODELS:
        Pm = C.proxy(m); cap = np.array([Pm(C.caps(c, f, fl4[c, f]['K'])) for f in fams])
        sc = np.array([float(fl[c, f]['coop_share']) <= 0.1 + 1e-12 for f in fams])
        for lab in C.LAB4:
            L = np.array([C.labour(fl4[c, f], lab, fl4[c, f]['K']) for f in fams])
            brec.append(sc[(np.outer(brs, cap) + L).argmin(1)]); bm4.append(c.startswith('M4'))
brec, bm4 = np.array(brec), np.array(bm4)
brk = dict(r=[round(float(x), 3) for x in brs[::3]], ex=[round(float(x), 2) for x in 100 * brec[~bm4].mean(0)[::3]],
           all=[round(float(x), 2) for x in 100 * brec.mean(0)[::3]])
# Fig. 8: on-time share under +-50 % handling noise at K* to K*+3, one line per fleet type; nominal winner (shift, affine)
x1s, x1d = rcsv(RES / 'X1_series.csv'), rcsv(RES / 'X1_decisions.csv')
X1C = ['M1_H1_D-emp', 'M5_H1_D-emp', 'M6_H1_D-emp', 'M1_H2_D-emp', 'M5_H2_D-emp', 'M6_H2_D-emp']
robust = []
for c in X1C:
    nom = Counter(x['winner_nominal'] for x in x1d if x['cell'] == c and x['labour'] == 'shift_h' and x['model'] == 'affine').most_common(1)[0][0]
    lines = [[x['family'], [round(100 * float(x['pert_K+%d' % d]), 2) if x.get('pert_K+%d' % d) else None for d in range(4)],
              int(x['K_star']), x['K_rob']] for x in x1s if x['cell'] == c]   # K_rob '>K' when not reached by K*+3
    robust.append(dict(cell=c, nominal=nom, lines=lines))
oe = dict(sct=sct, occ=occ, occ_fit=[round(v, 4) for v in occ_fit], occ_hi=round(occ_hi, 3),
          sync=[round(100 * statistics.median(sync), 3), round(100 * max(sync), 3), len(sync)], slack=slack, krho=krho,
          brk=brk, robust=robust)
print('oe check: slope %.3f r %.3f n %d | 60-100%%: %.2fx | sync median %.3f%% max %.3f%% | K_rho %s | brk ex@5.1 %.1f @30 %.1f @5000 %.1f'
      % (occ_fit[0], occ_fit[2], len(occ), occ_hi, *oe['sync'][:2], krho,
         100 * brec[~bm4].mean(0)[np.argmin(abs(brs - 5.1))], 100 * brec[~bm4].mean(0)[np.argmin(abs(brs - 30))], 100 * brec[~bm4].mean(0)[-1]))

# ---- manuscript of 2026-10-03: decomposition, crew-team envelope, exact benchmark, fresh days, outages, matched mixes ----
# Fig. 5b: extra transporter-hours of each lighter fleet over the covering tier, split into coupled occupancy and waiting.
# Main fleets outside the heavy-tail profile that couple more than 1% of blocks and work more than the covering tier.
vt = [x for x in rcsv(RES / 'S6_vt_pairs.csv') if not x['cell'].startswith('M4') and (x['cell'], x['family']) in fl
      and float(x['coup_block_share']) > 0.01 and float(x['d_work_h']) > 0]
decomp = [[x['family'], x['cell'], round(float(x['d_work_h']), 2), round(float(x['coup_excess_h']), 2), round(float(x['d_sync_h']), 2)] for x in vt]
dshare = sorted(float(x['coup_excess_h']) / float(x['d_work_h']) for x in vt)
dsync = sorted(float(x['d_sync_h']) / float(x['d_work_h']) for x in vt)
dstats = [len(vt), round(100 * statistics.median(dshare), 1), round(100 * statistics.median(dsync), 1)]
assert dstats == [266, 89.8, 2.1], dstats                                         # verified on the 384 main fleets
# Fig. 5d: crew-team hours alone, outside the heavy-tail profile (dashed line of the manuscript figure)
team = np.array([lab == 'crew_team_h' for c in cells for m in C.MAIN_MODELS for lab in C.LAB4])
brk['team'] = [round(float(x), 2) for x in 100 * brec[(~bm4) & team].mean(0)[::3]]
# exact benchmark on single-batch slices: count of each method against the proven minimum (56 fleets)
vk = [x for x in rcsv(RES / 'V1_kstar.csv') if x['exact'] == 'True']
exact = {m: [sum(x['d_' + m] == str(d) for x in vk) for d in (0, 1)] + [sum(x['d_' + m] not in ('', '0', '1') for x in vk), sum(x['d_' + m] == '' for x in vk)]
         for m in ('final', 'single', 'cp0', 'greedy')}
assert len(vk) == 56 and exact['final'] == [54, 2, 0, 0] and exact['cp0'][0] == 45 and exact['greedy'][:2] == [6, 35], exact
# fresh days: same winner per condition and the change in K* of the 42 contending fleets
s2 = rcsv(RES / 'S2_decisions.csv')
fresh = {c: round(100 * sum(x['same'] == 'True' for x in s2 if x['cell'] == c) / sum(x['cell'] == c for x in s2), 1) for c in sorted({x['cell'] for x in s2})}
s2f = rcsv(RES / 'S2_fleets.csv')
fresh_dk = Counter(int(x['K_final']) - int(x['K_start']) for x in s2f)   # K_start: the count found on the original days
assert round(100 * sum(x['same'] == 'True' for x in s2) / len(s2), 1) == 86.5 and len(s2f) == 42 and fresh_dk == {0: 39, -1: 2, 1: 1}, fresh
# one unit out of service: on-time share with the worst single unit out (any unit, or the heavy unit of a mix)
s7a = {(x['cell'], x['family']): x for x in rcsv(RES / 'S7a_fleets.csv')}
outage = [[x['cell'], x['family'], int(x['heavy_units']), round(100 * float(x['outage_on']), 1), round(float(x['P_meet_q0.10']), 2),
           s7a.get((x['cell'], x['family']), {}).get('homogeneous_covering') == 'True'] for x in rcsv(RES / 'S7b_fleets.csv')]
one = [o[3] for o in outage if o[2] == 1 and not o[0].startswith('M4')]
cov = [o[3] for o in outage if o[5] and not o[0].startswith('M4')]
assert (min(one), max(one), min(cov), max(cov)) == (43.9, 63.5, 83.3, 87.3), (one, cov)
# light units plus covering heavy units in 13 further conditions: heavy count of the cheapest such mix vs the heavy-share rule
s4 = rcsv(RES / 'S4_decisions.csv')
mix13 = {c: [int(next(x['n_star'] for x in s4 if x['cell'] == c)), dict(Counter(int(x['n']) for x in s4 if x['cell'] == c))] for c in sorted({x['cell'] for x in s4})}
assert len(mix13) == 13 and round(100 * sum(x['ext_wins'] == 'True' for x in s4) / len(s4), 1) == 95.3
oe.update(decomp=decomp, dstats=dstats, exact=exact, fresh=fresh, fresh_dk={str(k): v for k, v in fresh_dk.items()}, outage=outage, mix13=mix13)
print('r3 check:', dstats, exact, fresh_dk, len(outage), len(mix13))

out = dict(r=[round(x, 1) for x in rs], cells=cells, heat=heat, scatter=scatter, price=price, stack=stack, load=load,
           case=case, kstar=kstar, calc=calc, masses=masses, example=example, late=late, affine=[0.574693, 0.006074747], p270=2.214875,
           summary={k: v for k, v in mech.items() if k != 'per_series'}, oe=oe)
(Path(__file__).parent / 'data.js').write_text('// Generated by make_data.py from research_R25/results; do not edit by hand.\n'
                                               'window.DATA=' + json.dumps(out, separators=(',', ':')) + ';\n', encoding='utf8')
# checks against the manuscript
assert stack['greedy'] == [88, 253, 43], stack['greedy']
assert abs(mech['winner_coop_le_10pct'] - 0.908) < 0.001
print('ok', len(scatter), len(price), sum(p[2] for p in price), stack, load)
