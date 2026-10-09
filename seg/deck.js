// Segmentation deck ("Cross-Site Segmentation"): the strings and charts of this briefing.
// Paging, language, notes, contents, glossary, layout and the PDF link come from ../shared/deck-core.js (README.md).
(() => {
'use strict';
const D = window.DATA;
const { LI, $, el, frame, fitH, anim, spread, lin, yTitle, swatches, hover, fmt } = Deck;

// ---------- strings used inside charts: [zh, en, ko] ----------
const T = {
  title: ['跨船厂语义分割 · 论文汇报', 'Cross-Site Segmentation', '조선소 간 의미 분할 · 논문 보고'],
  unet: ['U-Net', 'U-Net', 'U-Net'], deeplab: ['DeepLabV3+', 'DeepLabV3+', 'DeepLabV3+'], d2ls: ['D2LS', 'D2LS', 'D2LS'], urbanssf: ['UrbanSSF-L', 'UrbanSSF-L', 'UrbanSSF-L'],
  segformer: ['SegFormer-B2', 'SegFormer-B2', 'SegFormer-B2'], bnd: ['B2 + 边界', 'B2 + Boundary', 'B2 + 경계'], reg: ['B2 + 区域', 'B2 + Region', 'B2 + 영역'],
  fixed: ['B2 + 边界 + 区域（固定随机原型）', 'B2 + Bnd + Reg (fixed-random)', 'B2 + 경계 + 영역 (고정 무작위)'], proposed: ['B2 + 边界 + 区域（本文）', 'B2 + Boundary + Region (ours)', 'B2 + 경계 + 영역 (제안)'],
  ext: ['外部方法', 'External methods', '외부 방법'], ctl: ['SegFormer-B2 受控变体', 'SegFormer-B2 controlled variants', 'SegFormer-B2 통제 변형'],
  Hanwha: ['韩华', 'Hanwha', '한화'], Hyundai: ['现代三湖', 'Hyundai', '현대삼호'], Jiangsu: ['江苏新时代', 'Jiangsu', '장쑤'], Samsung: ['三星巨济', 'Samsung', '삼성'], Yangzijiang: ['扬子江', 'Yangzijiang', '양쯔장'],
  'CIMC Raffles': ['中集来福士（烟台）', 'CIMC Raffles', 'CIMC 래플스'], 'CMIC Weihai': ['招商工业（威海）', 'CMIC Weihai', '초상공업 웨이하이'], 'Hanwha Ocean': ['韩华海洋（巨济）', 'Hanwha Ocean', '한화오션'],
  'Hudong Zhonghua': ['沪东中华', 'Hudong Zhonghua', '후둥중화'], 'Hyundai Samho': ['现代三湖', 'Hyundai Samho', '현대삼호'], 'Jiangsu New Times': ['江苏新时代', 'Jiangsu New Times', '장쑤 뉴타임스'],
  'Samsung Geoje': ['三星重工巨济', 'Samsung Geoje', '삼성중공업 거제'], 'Yangzijiang Shipbuilding': ['扬子江船业', 'Yangzijiang Shipbuilding', '양쯔장 조선'],
  Background: ['背景', 'Background', '배경'], Road: ['道路', 'Road', '도로'], 'Yard open area': ['堆场开阔区', 'Yard open area', '야드 개방 구역'], 'Production building': ['生产厂房', 'Production building', '생산 건물'],
  // dataset
  patches: ['影像块数（512 × 512）', 'Patches (512 × 512)', '패치 수 (512 × 512)'], testYard: ['留出测试厂（轮流）', 'Held-out test yard (in turn)', '미학습 시험 조선소 (차례로)'], trainYard: ['只参与训练', 'Training only', '학습에만'],
  yardTip: ['{y}<br>{n} 块 · {a} km²', '{y}<br>{n} patches · {a} km²', '{y}<br>패치 {n}개 · {a} km²'], classTitle: ['四类像素占比', 'Pixel share of the four classes', '네 클래스의 픽셀 비율'],
  splitTest: ['测试厂', 'Test yard', '시험 조선소'], splitVal: ['验证厂', 'Validation yard', '검증 조선소'], splitN: ['训练 / 验证 / 测试 块数', 'Train / val / test patches', '학습 / 검증 / 시험 패치'],
  // main comparison
  metric: [['mIoU', 'mIoU', 'mIoU'], ['fg_mIoU', 'fg_mIoU', 'fg_mIoU'], ['mDice', 'mDice', 'mDice']],
  mainTip: ['{m}<br>{k} = {v} ± {s}（15 次运行）', '{m}<br>{k} = {v} ± {s} (15 runs)', '{m}<br>{k} = {v} ± {s} (15회)'],
  rdGain: ['相对 SegFormer-B2 的 {k} 增益（+{p}%）', '{k} gain over SegFormer-B2 (+{p}%)', 'SegFormer-B2 대비 {k} 향상 (+{p}%)'],
  rdParts: ['只加边界 / 只加区域的 {k} 增益：两路各有贡献，联合最大', '{k} gain of boundary-only / region-only: each helps, the joint model most', '경계만 / 영역만의 {k} 향상: 각각 기여, 결합이 가장 큼'],
  rdA: ['分配 A 下联合模型同样第一：{k} {a} → {b}', 'First under assignment A too: {k} {a} → {b}', '배정 A에서도 1위: {k} {a} → {b}'],
  // class-wise
  cMethod: ['方法', 'Method', '방법'], building: ['厂房', 'Building', '건물'], road: ['道路', 'Road', '도로'], yard: ['堆场', 'Yard', '야드'], background: ['背景', 'Background', '배경'],
  // structure
  bfX: ['匹配容差（像素）', 'Matching tolerance (pixels)', '일치 허용 (픽셀)'], bfY: ['边界 F1', 'Boundary F1', '경계 F1'], bfTitle: ['边界 F1（越高越好）', 'Boundary F1 (higher is better)', '경계 F1 (높을수록 좋음)'],
  errTitle: ['碎片率与内部错误率（越低越好）', 'Fragmentation and interior error (lower is better)', '조각 비율과 내부 오류율 (낮을수록 좋음)'], scr: ['碎片率', 'Fragmentation', '조각 비율'], ier: ['内部错误率', 'Interior error', '내부 오류율'],
  structTip: ['{m}<br>{k}：{v}', '{m}<br>{k}: {v}', '{m}<br>{k}: {v}'],
  // per-site gains
  gainY: ['相对增益 Δ', 'Gain Δ', '향상 Δ'], asgA: ['分配 A', 'Assignment A', '배정 A'], asgB: ['分配 B', 'Assignment B', '배정 B'],
  gainTip: ['{s} · {a}<br>Δ{k} = +{v}', '{s} · {a}<br>Δ{k} = +{v}', '{s} · {a}<br>Δ{k} = +{v}'],
  pMean: ['船厂级平均 Δ', 'Site-level mean Δ', '조선소 수준 평균 Δ'], pCI: ['95% 区间', '95% interval', '95% 구간'], pPos: ['为正的船厂', 'Positive yards', '양수 조선소'], pD: ['效应量 d<sub>z</sub>', 'Effect size d<sub>z</sub>', '효과 크기 d<sub>z</sub>'],
  gainAll: ['10 / 10', '10 / 10', '10 / 10'], gainAllTxt: ['船厂 × 验证分配的比较，三项指标全部为正', 'site–assignment comparisons, all positive on all three metrics', '조선소 × 검증 배정 비교, 세 지표 모두 양수'],
  // site-wise
  siteY: ['fg_mIoU（三个种子均值 ± 标准差）', 'fg_mIoU (three-seed mean ± SD)', 'fg_mIoU (시드 3개 평균 ± 표준편차)'],
  siteTip: ['{m} · {s}<br>fg_mIoU = {v} ± {sd}', '{m} · {s}<br>fg_mIoU = {v} ± {sd}', '{m} · {s}<br>fg_mIoU = {v} ± {sd}'],
  rdSiteGain: ['五座船厂相对 SegFormer-B2 的 fg_mIoU 增益：{lo} 到 {hi}', 'fg_mIoU gain over SegFormer-B2 on the five yards: {lo} to {hi}', '다섯 조선소에서 SegFormer-B2 대비 fg_mIoU 향상: {lo}–{hi}'],
  rd120: ['120 轮：{k} {a} → {b}', '120 epochs: {k} {a} → {b}', '120에폭: {k} {a} → {b}'],
  // sensitivity
  sensX: ['mIoU（分配 A，15 次运行均值 ± 标准差）', 'mIoU (assignment A, mean ± SD of 15 runs)', 'mIoU (배정 A, 15회 평균 ± 표준편차)'], sensRef: ['参考', 'reference', '기준'],
  sensBase: ['SegFormer-B2（分配 A）', 'SegFormer-B2 (assignment A)', 'SegFormer-B2 (배정 A)'], sensFixed: ['固定随机原型（分配 A）', 'Fixed-random (assignment A)', '고정 무작위 (배정 A)'],
  sensAll: ['11 种配置全部高于基线', 'All 11 settings beat the baseline', '11개 설정 모두 기준보다 높음'],
  // cost
  costS: ['训练（s / 轮）', 'Training (s / epoch)', '학습 (초 / 에폭)'], costL: ['推理延迟（ms / 张）', 'Inference latency (ms / image)', '추론 지연 (ms / 영상)'],
  // graph
  gImp: ['相对 SegFormer-B2 的改善（%，向右为更好）', 'Improvement over SegFormer-B2 (%, right is better)', 'SegFormer-B2 대비 개선 (%, 오른쪽이 더 좋음)'],
  g0: ['长距离端点可达 ↑', 'Endpoint reachability ↑', '끝점 도달 ↑'], g1: ['局部起讫连通 ↑', 'Local OD success ↑', '국소 기종점 연결 ↑'], g2: ['局部断开 ↓', 'Disconnected OD ↓', '국소 단절 ↓'],
  g3: ['错误连通 ↓', 'False connectivity ↓', '잘못된 연결 ↓'], g4: ['路径长度误差 ↓', 'Path-length error ↓', '경로 길이 오차 ↓'],
  gTip: ['{m} · {g}<br>{b} → {v}（{p}）', '{m} · {g}<br>{b} → {v} ({p})', '{m} · {g}<br>{b} → {v} ({p})'],
};
const t = k => T[k][LI[Deck.lang]];
const tm = i => T.metric[i][LI[Deck.lang]];
const M9 = ['unet', 'deeplab', 'd2ls', 'urbanssf', 'segformer', 'bnd', 'reg', 'fixed', 'proposed'];
const M5 = ['segformer', 'bnd', 'reg', 'fixed', 'proposed'];
const MC = { unet: 'var(--ink3)', deeplab: 'var(--ink3)', d2ls: 'var(--ink3)', urbanssf: 'var(--ink3)', segformer: 'var(--steel)', bnd: 'var(--g-load)', reg: 'var(--good)', fixed: 'var(--oxide)', proposed: 'var(--amber)' };
const CC = { Background: 'var(--g-empty)', Road: 'var(--good)', 'Yard open area': 'var(--oxide)', 'Production building': 'var(--steel)' };
const TEST = new Set(D.splits.map(s => s[0]));
const f4 = v => v.toFixed(4);
const pathOf = pts => pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('');
const stat = (num, p) => `<div class="stat"><span class="num">${num}</span><p>${p}</p></div>`;
function xAxis(s, x, ticks, y0, fmtv) { ticks.forEach(v => { el('line', { x1: x(v), x2: x(v), y1: 10, y2: y0, class: 'gridv', style: 'stroke:var(--line)' }, s); el('text', { x: x(v), y: y0 + 16, 'text-anchor': 'middle' }, s, fmtv(v)); }); }
const range = (a, b, st) => { const r = []; for (let v = a; v <= b + 1e-9; v += st) r.push(+v.toFixed(6)); return r; };

// ---------- dataset ----------
function drawYards() {
  const ys = D.yards.slice().sort((a, b) => b[1] - a[1]);
  const W = 600, H = fitH('cYards', W, 360), m = { l: 170, r: 92, t: 6, b: 34 };
  const s = frame('cYards', W, H, t('patches'));
  const x = lin(0, 350, m.l, W - m.r), bh = (H - m.t - m.b) / ys.length;
  xAxis(s, x, [0, 100, 200, 300], H - m.b, v => v);
  el('text', { x: (m.l + W - m.r) / 2, y: H - 4, 'text-anchor': 'middle' }, s, t('patches'));
  ys.forEach(([y, n, a], i) => {
    const yy = m.t + i * bh, test = TEST.has(y);
    el('text', { x: m.l - 8, y: yy + bh / 2 + 4, 'text-anchor': 'end', class: test ? 't-strong' : '' }, s, t(y));
    const r = anim(el('rect', { x: m.l, y: yy + bh * 0.18, width: x(n) - m.l, height: bh * 0.64, rx: 2, style: `fill:${test ? 'var(--steel)' : 'var(--g-empty)'}` }, s), 'a-x', .2 + .06 * i);
    el('text', { x: x(n) + 6, y: yy + bh / 2 + 4, class: 'mono', style: 'font-size:11.5px;fill:var(--ink2)' }, s, `${n} · ${a.toFixed(2)} km²`);
    hover(r, () => fmt(t('yardTip'), { y: t(y), n, a: a.toFixed(4) }));
  });
  swatches('lgYards', [['var(--steel)', t('testYard')], ['var(--g-empty)', t('trainYard')]]);
}
function drawClass() {
  const W = 520, H = 84, s = frame('cClass', W, H, t('classTitle'));
  el('text', { x: 0, y: 13, class: 't-title' }, s, t('classTitle'));
  let x0 = 0;
  D.classes.forEach(([c, n, r], i) => {
    const w = r * W, g = el('g', {}, s);
    anim(el('rect', { x: x0, y: 22, width: w - 2, height: 22, style: `fill:${CC[c]}` }, g), 'a-fade', .3 + .1 * i);
    el('text', { x: x0 + 3, y: 60, style: 'font-size:12px' }, g, t(c));
    el('text', { x: x0 + 3, y: 76, class: 'mono', style: 'font-size:12px;fill:var(--ink)' }, g, (100 * r).toFixed(1) + '%');
    hover(g, () => `${t(c)}<br>${n.toLocaleString('en-US')} px · ${(100 * r).toFixed(2)}%`);
    x0 += w;
  });
}
function fillSplits() {
  $('splitTbl').innerHTML = `<thead><tr><th>${t('splitTest')}</th><th>${t('splitVal')}</th><th style="text-align:right">${t('splitN')}</th></tr></thead><tbody>`
    + D.splits.map(([te, va, a, b, c]) => `<tr><td style="font-family:var(--body)">${t(te)}</td><td>${t(va)}</td><td class="mono" style="text-align:right">${a} / ${b} / ${c}</td></tr>`).join('') + '</tbody>';
}

// ---------- main comparison: dot and whisker per method ----------
let mainK = 0;
function drawMain() {
  const W = 620, H = fitH('cMain', W, 380), m = { l: 210, r: 70, t: 8, b: 34 };
  const s = frame('cMain', W, H, tm(mainK));
  const vals = M9.map(k => D.main[k][mainK]);
  const lo = Math.floor(Math.min(...vals.map(v => v[0] - v[1])) * 20) / 20, hi = Math.ceil(Math.max(...vals.map(v => v[0] + v[1])) * 20) / 20;
  const x = lin(lo, hi, m.l, W - m.r), rh = (H - m.t - m.b) / M9.length;
  xAxis(s, x, range(lo, hi, 0.05), H - m.b, v => v.toFixed(2));
  el('text', { x: (m.l + W - m.r) / 2, y: H - 4, 'text-anchor': 'middle' }, s, `${tm(mainK)} (mean ± SD)`);
  const base = D.main.segformer[mainK][0];
  el('path', { d: `M${x(base)} ${m.t}V${H - m.b}`, style: 'stroke:var(--steel);stroke-dasharray:4 3;opacity:.7' }, s);
  M9.forEach((k, i) => {
    const [v, sd] = D.main[k][mainK], cy = m.t + (i + .5) * rh, me = k === 'proposed';
    if (i === 4) el('path', { d: `M${m.l - 200} ${m.t + i * rh}H${W - m.r}`, style: 'stroke:var(--line)' }, s);
    el('text', { x: m.l - 10, y: cy + 4, 'text-anchor': 'end', class: me ? 't-strong' : '', style: me ? 'fill:var(--amber)' : '' }, s, t(k));
    anim(el('path', { d: `M${x(v - sd)} ${cy}H${x(v + sd)}`, style: `stroke:${MC[k]};stroke-width:2;opacity:.55` }, s), 'a-fade', .3 + .05 * i);
    const c = anim(el('circle', { cx: x(v), cy, r: me ? 7 : 5, style: `fill:${MC[k]};stroke:var(--paper);stroke-width:1.5` }, s), 'a-pop', .4 + .06 * i);
    el('text', { x: W - 4, y: cy + 4, 'text-anchor': 'end', class: 'mono', style: `font-size:12px;${me ? 'fill:var(--amber);font-weight:600' : 'fill:var(--ink2)'}` }, s, v.toFixed(4));
    hover(c, () => fmt(t('mainTip'), { m: t(k), k: tm(mainK), v: f4(v), s: f4(sd) }));
  });
  const d = D.main.proposed[mainK][0] - base;
  $('mainRead').innerHTML = stat(`+${d.toFixed(4)}`, fmt(t('rdGain'), { k: tm(mainK), p: (100 * d / base).toFixed(2) }))
    + stat(`+${(D.main.bnd[mainK][0] - base).toFixed(4)} / +${(D.main.reg[mainK][0] - base).toFixed(4)}`, fmt(t('rdParts'), { k: tm(mainK) }))
    + stat(`${D.assignA.proposed[mainK].toFixed(4)}`, fmt(t('rdA'), { k: tm(mainK), a: D.assignA.segformer[mainK].toFixed(4), b: D.assignA.proposed[mainK].toFixed(4) }));
  document.querySelectorAll('#mainMet button').forEach(b => b.setAttribute('aria-pressed', +b.dataset.v === mainK));
}

// ---------- class-wise IoU: shaded table ----------
function fillClass() {
  const cols = ['background', 'building', 'road', 'yard', 'fg_mIoU', 'mIoU'];
  const mx = cols.map((_, j) => Math.max(...M9.map(k => D.classIoU[k][j]))), mn = cols.map((_, j) => Math.min(...M9.map(k => D.classIoU[k][j])));
  $('classTbl').innerHTML = `<thead><tr><th>${t('cMethod')}</th>${cols.map(c => `<th>${T[c] ? t(c) : c}</th>`).join('')}</tr></thead><tbody>`
    + M9.map(k => `<tr class="${k === 'proposed' ? 'me' : ''}"><td>${t(k)}</td>${D.classIoU[k].map((v, j) => {
      const a = Math.round(8 + 62 * (v - mn[j]) / (mx[j] - mn[j]));
      return `<td style="background:color-mix(in srgb, var(--amber-hi) ${a}%, transparent)">${v === mx[j] ? `<b>${f4(v)}</b>` : f4(v)}</td>`;
    }).join('')}</tr>`).join('') + '</tbody>';
}

// ---------- structural quality: BF1 by tolerance; fragmentation and interior error ----------
function drawStruct() {
  const W = 640, H = fitH('cStruct', W, 360), s = frame('cStruct', W, H, t('bfTitle'));
  // left: BF1 at 1, 2, 3 px
  const L = { l: 46, r: 360, t: 22, b: 40 }, x = lin(1, 3, L.l + 14, L.r - 14), y = lin(0.70, 0.79, H - L.b, L.t);
  el('text', { x: L.l, y: 13, class: 't-title' }, s, t('bfTitle'));
  range(0.70, 0.79, 0.03).forEach(v => { el('line', { x1: L.l, x2: L.r, y1: y(v), y2: y(v), style: 'stroke:var(--line)' }, s); el('text', { x: L.l - 6, y: y(v) + 4, 'text-anchor': 'end' }, s, v.toFixed(2)); });
  [1, 2, 3].forEach(v => el('text', { x: x(v), y: H - L.b + 16, 'text-anchor': 'middle' }, s, v + ' px'));
  el('text', { x: (L.l + L.r) / 2, y: H - 6, 'text-anchor': 'middle' }, s, t('bfX'));
  M5.forEach((k, i) => {
    const pts = [0, 1, 2].map(j => [x(j + 1), y(D.struct[k][j][0])]);
    anim(el('path', { d: pathOf(pts), pathLength: 1, style: `stroke:${MC[k]};stroke-width:${k === 'proposed' ? 3 : 1.8};fill:none` }, s), 'a-draw', .2 + .12 * i);
    pts.forEach((p, j) => { const c = el('circle', { cx: p[0], cy: p[1], r: k === 'proposed' ? 5 : 3.5, style: `fill:${MC[k]};stroke:var(--paper)` }, s); hover(c, () => fmt(t('structTip'), { m: t(k), k: `BF1@${j + 1}`, v: f4(D.struct[k][j][0]) })); });
  });
  // right: SCR and mean IER, lower is better
  const R = { l: 400, r: W - 10 }, xr = lin(0, 0.16, R.l + 70, R.r - 40);
  el('text', { x: R.l, y: 13, class: 't-title' }, s, t('errTitle'));
  [['scr', k => D.struct[k][3][0]], ['ier', k => D.ier[k][3]]].forEach(([lab, get], g) => {
    const y0 = 36 + g * (H - 70) / 2, bh = ((H - 70) / 2 - 22) / M5.length;
    el('text', { x: R.l, y: y0 + 2, style: 'font-weight:600;fill:var(--ink)' }, s, t(lab));
    M5.forEach((k, i) => {
      const v = get(k), yy = y0 + 8 + i * bh;
      const r = anim(el('rect', { x: xr(0), y: yy, width: xr(v) - xr(0), height: bh * 0.72, rx: 2, style: `fill:${MC[k]}` }, s), 'a-x', .3 + .05 * i + .2 * g);
      el('text', { x: xr(v) + 4, y: yy + bh * 0.62, class: 'mono', style: `font-size:11px;${k === 'proposed' ? 'fill:var(--amber);font-weight:600' : 'fill:var(--ink2)'}` }, s, f4(v));
      hover(r, () => fmt(t('structTip'), { m: t(k), k: t(lab), v: f4(v) }));
    });
  });
  swatches('lgStruct', M5.map(k => [MC[k], t(k)]));
}

// ---------- per-site gains (Tables 10, 11) and site-level paired statistics (Table 12) ----------
let gainCmp = 'base';
const MET_C = ['var(--steel)', 'var(--amber)', 'var(--good)'];
function drawGain() {
  const rows = gainCmp === 'base' ? D.gainBase : D.gainFixed;
  const W = 620, H = fitH('cGain', W, 360), m = { l: 70, r: 12, t: 12, b: 40 };
  const s = frame('cGain', W, H, t('gainY'));
  const yTop = 0.035, y = lin(0, yTop, H - m.b, m.t), gw = (W - m.l - m.r) / D.sites.length;
  range(0, yTop, 0.005).forEach(v => { el('line', { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v), style: `stroke:${v ? 'var(--line)' : 'var(--ink3)'}` }, s); el('text', { x: m.l - 6, y: y(v) + 4, 'text-anchor': 'end' }, s, v ? '+' + v.toFixed(3) : '0'); });
  yTitle(s, 14, (m.t + H - m.b) / 2, t('gainY'));
  D.sites.forEach((site, i) => {
    const cx = m.l + (i + .5) * gw;
    el('text', { x: cx, y: H - m.b + 18, 'text-anchor': 'middle', class: 't-strong' }, s, t(site));
    [0, 1, 2].forEach(k => ['A', 'B'].forEach((a, ai) => {
      const r = rows.find(r => r[0] === a && r[1] === site), v = r[2 + k], px = cx + (k - 1) * gw * 0.24 + (ai ? 7 : -7), py = y(v);
      const node = ai
        ? el('rect', { x: px - 4.5, y: py - 4.5, width: 9, height: 9, style: `fill:${MET_C[k]};stroke:var(--paper)` }, s)
        : el('circle', { cx: px, cy: py, r: 5, style: `fill:${MET_C[k]};stroke:var(--paper)` }, s);
      anim(node, 'a-pop', .3 + .4 * spread(i * 6 + k * 2 + ai));
      hover(node, () => fmt(t('gainTip'), { s: t(site), a: t(ai ? 'asgB' : 'asgA'), k: tm(k), v: v.toFixed(5) }));
    }));
  });
  swatches('lgGain', [[MET_C[0], 'mIoU'], [MET_C[1], 'fg_mIoU'], [MET_C[2], 'mDice'], ['var(--ink3)', `● ${t('asgA')}`, 'border-radius:50%'], ['var(--ink3)', `■ ${t('asgB')}`]]);
  const P = D.paired.slice(gainCmp === 'base' ? 0 : 3, gainCmp === 'base' ? 3 : 6);
  $('gainRead').innerHTML = stat(t('gainAll'), t('gainAllTxt'))
    + `<table class="mini"><thead><tr><th></th><th>${t('pMean')}</th><th>${t('pCI')}</th><th>${t('pPos')}</th><th>${t('pD')}</th></tr></thead><tbody>`
    + P.map(([k, mean, ci, pos, p, holm, dz]) => `<tr><td>${k}</td><td>+${mean.toFixed(5)}</td><td>[${ci[0].toFixed(5)}, ${ci[1].toFixed(5)}]</td><td>${pos}</td><td>${dz.toFixed(2)}</td></tr>`).join('') + '</tbody></table>';
  document.querySelectorAll('#gainCmp button').forEach(b => b.setAttribute('aria-pressed', b.dataset.v === gainCmp));
}

// ---------- site-wise fg_mIoU at 120 or 30 epochs ----------
let siteEp = '120';
function drawSite() {
  const S = siteEp === '120' ? D.site120 : D.site30, ms = Object.keys(S);
  const W = 620, H = fitH('cSite', W, 360), m = { l: 66, r: 16, t: 12, b: 40 };
  const s = frame('cSite', W, H, t('siteY'));
  const all = ms.flatMap(k => S[k].map(v => v[0]));
  const lo = Math.floor((Math.min(...all) - 0.02) * 20) / 20, hi = Math.ceil((Math.max(...all) + 0.01) * 20) / 20;
  const x = i => m.l + (i + .5) * (W - m.l - m.r) / 5, y = lin(lo, hi, H - m.b, m.t);
  range(lo, hi, 0.05).forEach(v => { el('line', { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v), style: 'stroke:var(--line)' }, s); el('text', { x: m.l - 6, y: y(v) + 4, 'text-anchor': 'end' }, s, v.toFixed(2)); });
  D.sites.forEach((site, i) => el('text', { x: x(i), y: H - m.b + 18, 'text-anchor': 'middle', class: 't-strong' }, s, t(site)));
  yTitle(s, 14, (m.t + H - m.b) / 2, t('siteY'));
  ms.forEach((k, j) => {
    const me = k === 'proposed', base = k === 'segformer', strong = me || base;
    const pts = S[k].map((v, i) => [x(i), y(v[0])]);
    if (strong) el('path', { d: pathOf(S[k].map((v, i) => [x(i), y(v[0] + v[1])])) + pathOf(S[k].map((v, i) => [x(i), y(v[0] - v[1])]).reverse()).replace('M', 'L') + 'Z', style: `fill:${MC[k]};opacity:.15` }, s);
    anim(el('path', { d: pathOf(pts), pathLength: 1, style: `stroke:${MC[k]};stroke-width:${me ? 3 : strong ? 2.2 : 1.2};fill:none;opacity:${strong ? 1 : .55}` }, s), 'a-draw', .2 + .08 * j);
    pts.forEach((p, i) => { const c = el('circle', { cx: p[0], cy: p[1], r: me ? 5 : strong ? 4 : 2.6, style: `fill:${MC[k]};stroke:var(--paper);opacity:${strong ? 1 : .7}` }, s); hover(c, () => fmt(t('siteTip'), { m: t(k), s: t(D.sites[i]), v: f4(S[k][i][0]), sd: f4(S[k][i][1]) })); });
  });
  swatches('lgSite', ms.filter(k => !['bnd', 'reg', 'fixed'].includes(k)).map(k => [MC[k], t(k)]));
  const g = S.proposed.map((v, i) => v[0] - S.segformer[i][0]);
  const E = D.e120;
  $('siteRead').innerHTML = stat(`+${Math.min(...g).toFixed(4)} – +${Math.max(...g).toFixed(4)}`, fmt(t('rdSiteGain'), { lo: '+' + Math.min(...g).toFixed(4), hi: '+' + Math.max(...g).toFixed(4) }))
    + [0, 1, 2].map(k => stat(`${E.proposed[k][0].toFixed(4)}`, fmt(t('rd120'), { k: tm(k), a: E.segformer[k][0].toFixed(4), b: E.proposed[k][0].toFixed(4) }))).join('');
  document.querySelectorAll('#siteEp button').forEach(b => b.setAttribute('aria-pressed', b.dataset.v === siteEp));
}

// ---------- parameter sensitivity under assignment A ----------
const SENS = ['R = 4', 'R = 8', 'R = 12', 'R = 16', 'R = 32', 'τ = 0.05', 'τ = 0.10', 'λ_b = 0.3', 'λ_b = 0.7', 'λ_r = 0.05', 'λ_r = 0.15'];
function drawSens() {
  const W = 600, H = fitH('cSens', W, 380), m = { l: 92, r: 70, t: 46, b: 40 };
  const s = frame('cSens', W, H, t('sensX'));
  const x = lin(0.64, 0.73, m.l, W - m.r), rh = (H - m.t - m.b) / SENS.length;
  xAxis(s, x, range(0.64, 0.73, 0.03), H - m.b, v => v.toFixed(2));
  el('text', { x: (m.l + W - m.r) / 2, y: H - 4, 'text-anchor': 'middle' }, s, t('sensX'));
  [[D.assignA.segformer[0], 'var(--steel)', t('sensBase')], [D.assignA.fixed[0], 'var(--oxide)', t('sensFixed')]].forEach(([v, c, lab], i) => {
    el('path', { d: `M${x(v)} ${m.t}V${H - m.b}`, style: `stroke:${c};stroke-dasharray:5 4` }, s);
    el('text', { x: x(v) + (i ? 4 : -4), y: 14 + 16 * i, 'text-anchor': i ? 'start' : 'end', style: `fill:${c};font-size:11.5px;font-weight:600` }, s, `${lab} ${v.toFixed(4)}`);
    el('path', { d: `M${x(v)} ${20 + 16 * i}V${m.t}`, style: `stroke:${c};stroke-dasharray:2 3` }, s);
  });
  D.sens.forEach((r, i) => {
    const [, v, sd] = r, cy = m.t + (i + .5) * rh, ref = i === 1;
    el('text', { x: m.l - 10, y: cy + 4, 'text-anchor': 'end', class: ref ? 't-strong' : '', style: ref ? 'fill:var(--amber)' : '' }, s, SENS[i].replace('_b', 'b').replace('_r', 'r') + (ref ? ` (${t('sensRef')})` : ''));
    anim(el('path', { d: `M${x(v - sd)} ${cy}H${x(v + sd)}`, style: `stroke:${ref ? 'var(--amber)' : 'var(--ink3)'};stroke-width:2;opacity:.5` }, s), 'a-fade', .3);
    const c = anim(el('circle', { cx: x(v), cy, r: ref ? 6 : 4.5, style: `fill:${ref ? 'var(--amber)' : 'var(--ink2)'};stroke:var(--paper)` }, s), 'a-pop', .4 + .05 * i);
    el('text', { x: x(v + sd) + 6, y: cy + 4, class: 'mono', style: 'font-size:11px;fill:var(--ink2)' }, s, v.toFixed(4));
    hover(c, () => `${SENS[i]}<br>mIoU = ${f4(v)} ± ${f4(sd)}`);
  });
}

// ---------- training and inference cost ----------
function drawCost() {
  const W = 1100, H = 230, s = frame('cCost', W, H, t('costS'));
  [['costS', k => D.train[k][2], 40], ['costL', k => D.deploy[k][0], 40]].forEach(([lab, get, top], g) => {
    const x0 = g * 560, x = lin(0, top, x0 + 250, x0 + 510), bh = 38;
    el('text', { x: x0, y: 16, class: 't-title', style: 'font-size:15px' }, s, t(lab));
    M5.forEach((k, i) => {
      const v = get(k), yy = 24 + i * bh;
      el('text', { x: x0 + 242, y: yy + 24, 'text-anchor': 'end', style: 'font-size:14px' }, s, t(k));
      anim(el('rect', { x: x(0), y: yy + 6, width: x(v) - x(0), height: bh - 12, rx: 2, style: `fill:${MC[k]}` }, s), 'a-x', .2 + .05 * i);
      el('text', { x: x(v) + 6, y: yy + 24, class: 'mono', style: 'font-size:14px;fill:var(--ink)' }, s, v.toFixed(2));
    });
  });
}

// ---------- road connectivity: improvement over SegFormer-B2 per metric ----------
function drawGraph() {
  const up = [true, true, false, false, false], ks = ['bnd', 'reg', 'fixed', 'proposed'];
  const W = 620, H = fitH('cGraph', W, 360), m = { l: 150, r: 50, t: 10, b: 40 };
  const s = frame('cGraph', W, H, t('gImp'));
  const imp = (k, j) => { const b = D.graph.segformer[j][0], v = D.graph[k][j][0]; return 100 * (up[j] ? v - b : b - v) / b; };
  const x = lin(-5, 30, m.l, W - m.r), gh = (H - m.t - m.b) / 5, bh = gh * 0.8 / ks.length;
  xAxis(s, x, [0, 10, 20, 30], H - m.b, v => (v > 0 ? '+' : '') + v + '%');
  el('path', { d: `M${x(0)} ${m.t}V${H - m.b}`, style: 'stroke:var(--ink3)' }, s);
  el('text', { x: (m.l + W - m.r) / 2, y: H - 4, 'text-anchor': 'middle' }, s, t('gImp'));
  [0, 1, 2, 3, 4].forEach(j => {
    const y0 = m.t + j * gh + gh * 0.1;
    el('text', { x: m.l - 10, y: y0 + gh * 0.45, 'text-anchor': 'end', class: 't-strong' }, s, t('g' + j));
    ks.forEach((k, i) => {
      const v = imp(k, j), yy = y0 + i * bh;
      const r = anim(el('rect', { x: Math.min(x(0), x(v)), y: yy, width: Math.abs(x(v) - x(0)), height: bh - 2, rx: 1.5, style: `fill:${MC[k]}` }, s), 'a-x', .2 + .04 * (j * 4 + i));
      if (k === 'proposed') el('text', { x: x(Math.max(v, 0)) + 4, y: yy + bh - 3, class: 'mono', style: 'font-size:11px;fill:var(--amber);font-weight:600' }, s, (v > 0 ? '+' : '') + v.toFixed(1) + '%');
      hover(r, () => fmt(t('gTip'), { m: t(k), g: t('g' + j), b: f4(D.graph.segformer[j][0]), v: f4(D.graph[k][j][0]), p: (v > 0 ? '+' : '') + v.toFixed(1) + '%' }));
    });
  });
  swatches('lgGraph', ks.map(k => [MC[k], t(k)]));
}

function init() {
  $('mainMet').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { mainK = +b.dataset.v; drawMain(); } });
  $('gainCmp').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { gainCmp = b.dataset.v; drawGain(); } });
  $('siteEp').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { siteEp = b.dataset.v; drawSite(); } });
}

Deck.start({
  strings: T,
  sections: { intro: ['导读', 'Overview', '개요'], bg: ['背景与难点', 'Background', '배경과 어려움'], data: ['数据与协议', 'Data and protocol', '데이터와 절차'],
    method: ['方法', 'Method', '방법'], res: ['主要结果', 'Main results', '주요 결과'], eng: ['机理与工程价值', 'Mechanism and value', '메커니즘과 가치'],
    qual: ['定性结果', 'Qualitative results', '정성 결과'], end: ['结论', 'Conclusions', '결론'], ref: ['参考文献', 'References', '참고문헌'] },
  draw: [drawYards, drawClass, fillSplits, drawMain, fillClass, drawStruct, drawGain, drawSite, drawSens, drawCost, drawGraph],
  init,
});
})();
