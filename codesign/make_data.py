"""Write data.js for the fleet–network co-design deck (thesis chapter 5).

Two sources, both read-only:
  1. The author's review of 9 Oct 2026, appendix A (the reviewer's probe on Okpo's dock road 161):
     00_总控/audit/response/占路运输全量审核意见与后续指导_20261009.md. The two tables "主情景" and "搭载组合" are parsed
     from the Markdown; the numbers exist only in that document (bounds 10 seeds, simulations 3 seeds; a prototype).
  2. thesis-core at the reviewed commit 83c16bf, read with `git show` (never the working tree):
     results/t18_report_d10b9015cd4d/t18_summary.json (T1′, reservation plateau, binding resources and dual prices) and
     curves.csv of the batches it names (fleet bound K·H/c̄, giving each vehicle's daily capacity H/c̄).
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
COMMIT = '83c16bf'
T18 = 'results/t18_report_d10b9015cd4d/t18_summary.json'
VARIANTS = ['现模型', 'w12', 'sect', 'sect_bay']


def show(path):
    return subprocess.run(['git', '-C', str(REPO), 'show', f'{COMMIT}:{path}'], capture_output=True, check=True).stdout.decode('utf-8-sig')


def table_after(text, heading):
    """Rows of the first Markdown table after the line that starts with `heading`, as lists of cell strings."""
    lines = text[text.index(heading):].splitlines()[1:]
    start = next(i for i, l in enumerate(lines) if l.startswith('|'))
    rows = []
    for l in lines[start + 2:]:   # skip header and separator
        if not l.startswith('|'):
            break
        rows.append([c.strip() for c in l.strip('|').split('|')])
    return rows


num = lambda s: float(s.replace(',', ''))
pair = lambda s: [num(x) for x in s.split('/')]
pct = lambda new, old: round(100 * (new - old) / old, 1)

# ---------- 1. appendix A of the review ----------
guide = GUIDE.read_text(encoding='utf-8')
appA = guide[guide.index('## 附录 A'):guide.index('## 附录 B')]
main_rows = {r[0]: r for r in table_after(appA, '**主情景**')}
ere_rows = {r[0]: r for r in table_after(appA, '**搭载组合**')}
assert list(main_rows) == VARIANTS and list(ere_rows) == VARIANTS, (list(main_rows), list(ere_rows))
main = {'T1t': [num(main_rows[v][1]) for v in VARIANTS],
        'res60': [pair(main_rows[v][3])[0] for v in VARIANTS], 'res120': [pair(main_rows[v][3])[1] for v in VARIANTS],
        'seg60': [pair(main_rows[v][4])[0] for v in VARIANTS], 'seg120': [pair(main_rows[v][4])[1] for v in VARIANTS]}
ere = {'T1t': [num(ere_rows[v][1]) for v in VARIANTS], 'res': [num(ere_rows[v][3]) for v in VARIANTS],
       'seg': [num(ere_rows[v][4]) for v in VARIANTS], 'dl': [num(ere_rows[v][5]) for v in VARIANTS]}
for d in (main, ere):   # change against the current model (whole dock road as one resource), in per cent
    d['chg'] = {k: [pct(x, d[k][0]) for x in d[k][1:]] for k in list(d) if k != 'dl'}

# the review's own reading of these tables (§0.2 (c), §2.3) must follow from them
mres = main['chg']['res60'] + main['chg']['res120']
assert (min(mres), max(mres)) == (0.2, 2.4), mres                       # "预约 … +0.2% 至 +2.4%"
assert (round(min(main['chg']['T1t'])), round(max(main['chg']['T1t']))) == (5, 8), main['chg']['T1t']   # "T1′ 变 +5% 至 +8%"
mseg = main['chg']['seg60'] + main['chg']['seg120']
assert round(min(mseg)) == 0 and round(max(mseg)) == 4, mseg            # "逐段变 0 至 +4%"
w12, sect, bay = 0, 1, 2   # positions in the 'chg' lists (the baseline is left out there)
assert round(ere['chg']['res'][sect]) == 10 and round(ere['chg']['seg'][sect]) == 47   # 分段闭塞：预约 +10%，逐段 +47%
assert round(ere['chg']['res'][w12]) == 4 and round(ere['chg']['seg'][w12]) == 0       # 加宽：+4% 和 0
assert ere['chg']['res'][bay] <= ere['chg']['res'][sect] and ere['chg']['seg'][bay] <= ere['chg']['seg'][sect]   # 会车点：在分段之外没有再增加
assert abs(ere['chg']['T1t'][sect] - 77) < 0.6, ere['chg']['T1t']                       # 附录 A 读法第 2 条："T1′ +77%"

# ---------- 2. thesis-core 83c16bf: bounds, plateaus and dual prices (T18) ----------
t18 = json.loads(show(T18))
BATCH = {'main': (t18['inputs']['main'], 'main'), 'erection': (t18['inputs']['erection'], 'erection')}


def per_vehicle(batch, scen):
    """H/c̄: one vehicle's daily capacity, from the fleet bound K·H/c̄ of the batch's curves (same for every K)."""
    rows = [r for r in csv.DictReader(io.StringIO(show(f'results/{batch}/curves.csv'))) if r['scen'] == scen]
    v = {round(float(r['fleet_bound']) / int(r['K']), 6) for r in rows}
    assert len(v) == 1, v
    return v.pop()


def resource(name):
    m = re.match(r'(.+?)（W=([\d.]+)，(\d+) m）', name)
    return {'id': m.group(1).replace('道路', ''), 'w': float(m.group(2)), 'len': int(m.group(3))}


bounds = {}
for key, (batch, scen) in BATCH.items():
    e, hc = t18['T1'][key], per_vehicle(batch, scen)
    bind = sorted(({**resource(n), 'seeds': b['seeds'], 'price': round(b['price_per_h'], 1), 'veh': round(b['price_per_h'] / hc, 1)}
                   for n, b in e['binding_T1t'].items()), key=lambda b: -b['seeds'])
    bounds[key] = {'T1t': [round(e['T1t'], 2), round(e['T1t_lo'], 2), round(e['T1t_hi'], 2)],
                   'plateau': round(e['platform']['mean_K100_150'], 2), 'perVeh': round(hc, 1),
                   'ratio': round(e['platform']['mean_K100_150'] / e['T1t'], 4), 'bind': bind}
# the probe's baseline is T18's bound, reproduced seed by seed (appendix A, "复现核对")
assert round(bounds['main']['T1t'][0]) == main['T1t'][0] and round(bounds['erection']['T1t'][0]) == ere['T1t'][0]
# T18 report §2.2: road 161 in the erection mix ≈ 1.8 vehicles per extra hour a day; main scenario 4.2
assert bounds['erection']['bind'][0]['id'] == '161' and bounds['erection']['bind'][0]['veh'] == 1.8, bounds['erection']['bind']
assert bounds['main']['bind'][0]['id'] == '161' and bounds['main']['bind'][0]['veh'] == 4.2, bounds['main']['bind']
assert round(100 * bounds['main']['ratio']) == 36, bounds['main']['ratio']   # review §2.3: reservation plateau 627 = 36% of T1′

DATA = {'source': {'review': GUIDE.name + ' 附录 A', 'repo': 'thesis-core', 'commit': COMMIT, 't18': T18},
        'variants': VARIANTS, 'probe': {'main': main, 'erection': ere}, 'bounds': bounds}
out = Path(__file__).parent / 'data.js'
out.write_text('// Generated by make_data.py from the 2026-10-09 review (appendix A) and thesis-core %s (T18); do not edit by hand.\n'
               'window.DATA=%s;\n' % (COMMIT, json.dumps(DATA, ensure_ascii=False, separators=(',', ':'))), encoding='utf-8')
print('main chg', main['chg'])
print('erection chg', ere['chg'])
print('bounds', json.dumps(bounds, ensure_ascii=False))
print(out, out.stat().st_size, 'bytes')
