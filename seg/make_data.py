"""Write data.js and assets/ for the segmentation deck from the published paper itself:
Na, Wang, Yao, Kim (2026), Structure-guided cross-site semantic segmentation of shipyard remote-sensing imagery,
Ocean Engineering 368, 128269 (library entry 01-013).

Numbers come from the tables of the paper's full-text Markdown, checked against the abstract; figures are the images
embedded in the published PDF. REFERENCE overrides the path of the literature library.

  conda activate paper; python seg/make_data.py
"""
import io
import json
import os
import re
from pathlib import Path

import fitz
from PIL import Image

REF = Path(os.environ.get('REFERENCE') or Path(__file__).resolve().parents[2] / '00..小论文' / 'Reference')
STEM = '01-013_2026_Na_Structure-guided-cross-site-semantic-segmentation'
MD = REF / 'markdown' / '01 遥感分割与数字孪生' / f'01-013_{STEM}' / f'{STEM}.md'
PDF = REF / 'papers' / '01_remote_sensing_digital_twin' / f'{STEM}.pdf'
OUT = Path(__file__).parent
md = MD.read_text(encoding='utf-8')

# ---------- tables ----------
def table(n):
    """Rows of Table n as lists of cleaned cell strings."""
    m = re.search(r'\nTable %d\s*\n' % n, md)
    html = md[m.end():].split('<table>', 1)[1].split('</table>', 1)[0]
    clean = lambda c: re.sub(r'\s+', '', re.sub(r'\\mathbf|\\mathrm|[${}]', '', c).replace('\\pm', '±'))
    return [[clean(c) for c in re.findall(r'<td[^>]*>(.*?)</td>', r, re.S)] for r in re.findall(r'<tr>(.*?)</tr>', html, re.S)]

PM = re.compile(r'([+-]?\d+\.\d+)±(\d+\.\d+)')
NUM = re.compile(r'[+-]?\d+(?:\.\d+)?')
def pm_rows(n, k):
    """Each body row's first k 'mean±sd' pairs, in row order."""
    out = [[[float(a), float(b)] for a, b in PM.findall('|'.join(r[1:]))][:k] for r in table(n)[1:]]
    assert all(len(r) == k for r in out), (n, out)
    return out
def num_rows(n, start, k):
    """Each body row's numbers from cell `start` on, first k of them."""
    out = [[float(x) for c in r[start:] for x in NUM.findall(re.sub(r'(?<=\d),(?=\d{3}\b)', '', c))][:k] for r in table(n)[1:]]
    assert all(len(r) == k for r in out), (n, out)
    return out

M9 = ['unet', 'deeplab', 'd2ls', 'urbanssf', 'segformer', 'bnd', 'reg', 'fixed', 'proposed']   # row order of Tables 5, 7, 18
M5 = ['segformer', 'bnd', 'reg', 'fixed', 'proposed']                                             # Tables 8, 9, 19, 20, 21
M6 = ['unet', 'deeplab', 'd2ls', 'urbanssf', 'segformer', 'proposed']                             # Tables 15, 17
SITES = ['Hanwha', 'Hyundai', 'Jiangsu', 'Samsung', 'Yangzijiang']
YARDS = ['CIMC Raffles', 'CMIC Weihai', 'Hanwha Ocean', 'Hudong Zhonghua', 'Hyundai Samho', 'Jiangsu New Times', 'Samsung Geoje', 'Yangzijiang Shipbuilding']
CLASSES = ['Background', 'Road', 'Yard open area', 'Production building']
name = lambda cell, names: next(x for x in names if x.replace(' ', '') == cell)   # cleaning drops spaces; match back to the paper's names

t1 = table(1)[1:-1]
yards = [[name(r[0], YARDS), int(r[-2]), float(r[-1])] for r in t1]
t2 = table(2)[1:-1]
classes = [[name(r[1], CLASSES), int(r[2].replace(',', '')), float(r[3])] for r in t2]
t3 = table(3)[1:]
splits = [[name(r[0], YARDS), name(r[1], YARDS), int(r[2]), int(r[3]), int(r[4])] for r in t3]

D = {
  'yards': yards, 'classes': classes, 'splits': splits,
  'main': dict(zip(M9, pm_rows(5, 3))),                                       # mIoU, fg_mIoU, mDice (mean, sd)
  'assignA': dict(zip(M5, num_rows(6, 1, 3))),
  'classIoU': dict(zip(M9, num_rows(7, 1, 6))),                               # background, building, road, yard, fg_mIoU, mIoU
  'struct': dict(zip(M5, pm_rows(8, 4))),                                     # BF1@1, @2, @3, SCR
  'ier': dict(zip(M5, num_rows(9, 1, 6))),                                    # building, road, yard, mean, BG-error, FG-confusion
  'gainBase': [[r[0], r[1]] + [float(x) for x in r[2:5]] for r in table(10)[1:]],
  'gainFixed': [[r[0], r[1]] + [float(x) for x in r[2:5]] for r in table(11)[1:]],
  'paired': [[r[1], float(r[2]), [float(x) for x in NUM.findall(r[3])], r[4], float(r[5]), float(r[6]), float(r[7])] for r in table(12)[1:]],
  'sens': num_rows(13, 1, 7),                                                 # n, mIoU, sd, fg, sd, mDice, sd
  'proto': [[float(x) for x in NUM.findall('|'.join(r[1:]))] for r in table(14)[1:]],
  'e120': dict(zip(M6, pm_rows(15, 4))),                                      # mIoU, fg_mIoU, mDice, h/run
  'site120': dict(zip(M6, pm_rows(17, 5))),
  'site30': dict(zip(M9, pm_rows(18, 5))),
  'train': dict(zip(M5, num_rows(19, 1, 5))),                                 # aux params, params (M), s/epoch, h/run, 15 runs (h)
  'deploy': dict(zip(M5, num_rows(20, 1, 6))),                                # latency, sd, img/s, memory, params, FLOPs
  'graph': dict(zip(M5, pm_rows(21, 5))),                                     # reachability, local OD, disconnected, false conn., path error
  'sites': SITES,
}
assert D['train']['proposed'][0] == 364165 and len(yards) == 8 and sum(y[1] for y in yards) == 988 and abs(sum(y[2] for y in yards) - 23.3098) < 1e-3
assert sum(c[1] for c in classes) == 988 * 512 * 512
assert [len(D['gainBase']), len(D['gainFixed']), len(D['paired']), len(D['sens']), len(D['proto'])] == [10, 10, 6, 11, 2]
assert all(v > 0 for r in D['gainBase'] + D['gainFixed'] for v in r[2:])
# the abstract's numbers must match the tables
ab = md.split('## A B S T R A C T', 1)[1].split('## 1.', 1)[0]
for want, got in [('0.6793 to 0.6907', (D['main']['segformer'][0][0], D['main']['proposed'][0][0])),
                  ('0.6763 to 0.6889', (D['main']['segformer'][1][0], D['main']['proposed'][1][0])),
                  ('0.8053 to 0.8129', (D['main']['segformer'][2][0], D['main']['proposed'][2][0])),
                  ('0.7190 to 0.7393', (D['struct']['segformer'][0][0], D['struct']['proposed'][0][0])),
                  ('0.0775 to 0.0631', (D['struct']['segformer'][3][0], D['struct']['proposed'][3][0]))]:
    assert want in ab and want == '%.4f to %.4f' % got, (want, got)
assert '27.35 million parameters and 92.1 billion' in ab and D['deploy']['proposed'][4:] == [27.35, 92.1]

(OUT / 'data.js').write_text('// Generated by make_data.py from the tables of Na et al. (2026), Ocean Engineering 368, 128269; do not edit by hand.\n'
                             'window.DATA=%s;\n' % json.dumps(D, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')

# ---------- figures: the images embedded in the published PDF, in figure order ----------
USED = {1, 2, 4, 5, 6, 10, 11, 12}      # Figs. 3, 7, 8 and 9 are redrawn from the tables as charts
(OUT / 'assets').mkdir(exist_ok=True)
doc, seen, k = fitz.open(PDF), set(), 0
for page in doc:
    for x in page.get_images(full=True):
        if x[0] in seen:
            continue
        seen.add(x[0])
        im = doc.extract_image(x[0])
        if im['width'] < 500:            # journal logos on the first page
            continue
        k += 1
        if k not in USED:
            continue
        img = Image.open(io.BytesIO(im['image'])).convert('RGB')
        img.thumbnail((1600, 1600))
        img.save(OUT / 'assets' / ('fig%02d.jpg' % k), quality=84, optimize=True, progressive=True)
assert k == 12, k
print('data.js', (OUT / 'data.js').stat().st_size, 'bytes; figures', k, '; main', D['main']['proposed'], '; sens rows', len(D['sens']))
