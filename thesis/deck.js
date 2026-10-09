// Thesis deck ("Road-Occupying Transport"): the strings and charts of this briefing.
// Paging, language, notes, contents, glossary, layout and the PDF link come from ../shared/deck-core.js (README.md).
(() => {
'use strict';
const D = window.DATA;
const { LI, $, el, frame, fitH, anim, spread, lin, yTitle, swatches, hover, fmt } = Deck;

// ---------- strings used inside charts: [zh, en, ko] ----------
const T = {
  title: ['占路运输 · 博士论文汇报', 'Road-Occupying Transport', '점유 운송 · 박사 논문 보고'],
  yupu: ['玉浦', 'Okpo', '옥포'], yantai: ['烟台', 'Yantai', '옌타이'],
  free: ['自由流', 'Free flow', '자유류'], reserve: ['整条路径预约', 'Whole-route reservation', '전체 경로 예약'],
  segment: ['逐段申请（参照规则，瞬移疏解）', 'Segment request (reference rule, teleport clearing)', '구간별 요청 (참조 규칙, 순간 이동 해소)'],
  segShort: ['逐段申请（参照规则）', 'Segment request (reference)', '구간별 요청 (참조)'],
  K: ['车队规模 K（台）', 'Fleet size K (vehicles)', '차량군 규모 K (대)'],
  thr: ['日吞吐（任务 / 16 h）', 'Daily throughput (tasks / 16 h)', '일일 처리량 (작업 / 16시간)'],
  // concept figure
  cY: ['日吞吐', 'Daily throughput', '일일 처리량'], cX: ['车队规模 K', 'Fleet size K', '차량군 규모 K'],
  cFree: ['自由流 = 车队上界', 'Free flow = fleet bound', '자유류 = 차량군 상한'], cT1: ['路网上界 T1′', 'Network bound T1′', '도로망 상한 T1′'],
  cT1up: ['改造后的路网上界', 'Network bound after the upgrade', '개조 후 도로망 상한'],
  cOcc: ['占路模型', 'Occupancy model', '점유 모형'], cUp: ['改造后：平台抬高、拐点右移', 'After an upgrade: higher plateau, later turn', '개조 후: 평탄 구간 상승, 꺾임 이동'],
  cBand: ['运力区间：上沿由路网定，下沿由编排定', 'Capacity interval: network sets the top, orchestration the bottom', '운송 능력 구간: 상한은 도로망, 하한은 편성'],
  cBandS: ['运力区间', 'capacity interval', '운송 능력 구간'],
  cLin: ['线性段', 'linear', '선형'], cPlat: ['平台：路网约束区', 'plateau: network-bound', '평탄: 도로망 제약'], cJam: ['拥塞阈值', 'jamming threshold', '정체 임계값'],
  cSchem: ['示意，非数据', 'schematic, not data', '개념도, 데이터 아님'],
  // flag figure
  flagLbl: ['车队规模与日吞吐', 'Fleet size against daily throughput', '차량군 규모와 일일 처리량'],
  t1t: ['T1′ 路网上界', 'T1′ network bound', 'T1′ 도로망 상한'],
  band: ['运力区间 [{a}, {b}]', 'capacity interval [{a}, {b}]', '운송 능력 구간 [{a}, {b}]'],
  freeOut: ['自由流 K = 150：{v} ↑', 'free flow at K = 150: {v} ↑', '자유류 K = 150: {v} ↑'],
  ptTip: ['{yard} · {m}<br>K = {k}：{v} 个/日（种子范围 {lo}–{hi}）', '{yard} · {m}<br>K = {k}: {v} a day (seeds {lo}–{hi})', '{yard} · {m}<br>K = {k}: 하루 {v}건 (시드 범위 {lo}–{hi})'],
  rdBand: ['运力区间（个/日）：下沿为整条路径预约的饱和平台（K = 100–150 均值），上沿为 T1′', 'Capacity interval (a day): lower edge the whole-route reservation plateau (mean of K = 100–150), upper edge T1′', '운송 능력 구간 (하루): 하한은 전체 경로 예약 포화 평탄 (K = 100–150 평균), 상한은 T1′'],
  rdShare: ['下沿只到上沿的这一比例：其余差距由编排决定，是第 4 章要挣回的部分', 'The lower edge reaches only this share of the upper: orchestration decides the rest, which chapter 4 aims to win back', '하한은 상한의 이 비율뿐: 나머지는 편성이 정하며 4장이 되찾을 부분'],
  rdKstar: ['路网约束区起点（边际比首次 < 20%；区间 {a}–{b}）', 'Network-bound from here (marginal ratio first below 20%; range {a}–{b})', '도로망 제약 시작 (한계 비율이 처음 20% 미만, 구간 {a}–{b})'],
};
const t = k => T[k][LI[Deck.lang]];
const MC = { free: 'var(--steel)', reserve: 'var(--oxide)', segment: 'var(--amber)' };
const MODELS = ['free', 'reserve', 'segment'];
const f0 = v => Math.round(v).toLocaleString('en-US');
function niceStep(top) { const p = 10 ** Math.floor(Math.log10(top)); return [1, 2, 2.5, 5, 10].map(k => k * p).find(s => top / s <= 6); }
function axes(s, x, y, xt, yt, W, H, m, fx = v => v, fy = v => v) {
  const g = el('g', { class: 'grid' }, s), a = el('g', { class: 'axis' }, s);
  yt.forEach(v => { el('line', { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v) }, g); el('text', { x: m.l - 8, y: y(v) + 4, 'text-anchor': 'end' }, s, fy(v)); });
  xt.forEach(v => el('text', { x: x(v), y: H - m.b + 17, 'text-anchor': 'middle' }, s, fx(v)));
  el('path', { d: `M${m.l} ${m.t}V${H - m.b}H${W - m.r}` }, a);
}
const range = (a, b, st) => { const r = []; for (let v = a; v <= b + 1e-9; v += st) r.push(+v.toFixed(6)); return r; };
const pathOf = pts => pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('');

// ---------- the five claims: schematic of the signature figure ----------
function drawConcept() {
  const W = 480, H = fitH('cConcept', W, 330), m = { l: 34, r: 14, t: 14, b: 34 };
  const s = frame('cConcept', W, H, t('cOcc'));
  const x = lin(0, 10, m.l, W - m.r), y = lin(0, 10, H - m.b, m.t);
  el('path', { d: `M${m.l} ${m.t}V${H - m.b}H${W - m.r}`, style: 'stroke:var(--ink3);fill:none' }, s);
  el('text', { x: W - m.r, y: H - m.b + 22, 'text-anchor': 'end' }, s, t('cX'));
  yTitle(s, m.l - 14, (m.t + H - m.b) / 2, t('cY'));
  // bounds
  anim(el('path', { d: `M${x(0)} ${y(0)}L${x(9.4)} ${y(9.4)}`, pathLength: 1, style: 'stroke:var(--steel);stroke-width:2.5;fill:none' }, s), 'a-draw', .2);
  anim(el('text', { x: x(7.7), y: y(9.3), 'text-anchor': 'end', style: 'fill:var(--steel);font-weight:600' }, s, t('cFree')), 'a-fade', .8);
  // capacity interval: from the best deadlock-free rule's plateau up to T1'
  anim(el('rect', { x: x(0), y: y(5), width: x(10) - x(0), height: y(4.1) - y(5), style: 'fill:var(--amber-soft);opacity:.9' }, s), 'a-fade', 1.6);
  anim(el('text', { x: m.l + 8, y: (y(5) + y(4.1)) / 2 + 4, style: 'fill:var(--amber);font-weight:600;font-size:12.5px' }, s, t('cBandS')), 'a-fade', 1.7);
  el('path', { d: `M${x(0)} ${y(5)}H${x(10)}`, style: 'stroke:var(--oxide);stroke-width:1.6;stroke-dasharray:6 4;fill:none' }, s);
  el('text', { x: m.l + 8, y: y(5) - 6, style: 'fill:var(--oxide);font-weight:600' }, s, t('cT1'));
  el('text', { x: m.l + 8, y: y(6.6) - 6, style: 'fill:var(--good);font-size:12px' }, s, t('cT1up'));
  // occupancy trapezoid, then the upgraded one
  const occ = [[0, 0], [3.2, 3.0], [4.3, 3.9], [5.2, 4.1], [6.6, 4.1], [7.6, 3.5], [9.6, 1.9]];
  anim(el('path', { d: pathOf(occ.map(([a, b]) => [x(a), y(b)])), pathLength: 1, style: 'stroke:var(--oxide);stroke-width:3;fill:none;stroke-linejoin:round' }, s), 'a-draw', .5);
  el('path', { d: `M${x(0)} ${y(6.6)}H${x(10)}`, style: 'stroke:var(--good);stroke-width:1.2;stroke-dasharray:3 4;fill:none;opacity:.8' }, s);
  const up = [[3.2, 3.0], [4.6, 4.3], [5.9, 5.3], [6.9, 5.4], [8.4, 5.4], [9.3, 4.8], [10, 4.2]];
  anim(el('path', { d: pathOf(up.map(([a, b]) => [x(a), y(b)])), pathLength: 1, style: 'stroke:var(--good);stroke-width:2.4;fill:none;stroke-dasharray:7 4' }, s), 'a-fade', 1.3);
  anim(el('text', { x: x(9.9), y: y(5.4) - 10, 'text-anchor': 'end', style: 'fill:var(--good);font-weight:600;font-size:12.5px' }, s, t('cUp')), 'a-fade', 1.5);
  // phases
  const lbl = (xx, yy, k, d, c = 'var(--ink2)') => anim(el('text', { x: x(xx), y: y(yy), 'text-anchor': 'middle', style: `fill:${c};font-size:12.5px` }, s, t(k)), 'a-fade', d);
  lbl(1.9, 0.9, 'cLin', 1);
  lbl(5.3, 3.45, 'cPlat', 1.1, 'var(--oxide)');
  el('path', { d: `M${x(6.9)} ${y(4.25)}V${y(0)}`, style: 'stroke:var(--ink3);stroke-dasharray:2 3' }, s);
  lbl(7.7, 0.55, 'cJam', 1.2);
  el('text', { x: m.l + 8, y: m.t + 12, style: 'fill:var(--ink3);font-size:11.5px;font-style:italic' }, s, t('cSchem'));
  swatches('lgConcept', [['var(--steel)', t('cFree')], ['var(--oxide)', t('cOcc')], ['var(--amber-soft)', t('cBand'), 'border:1px solid var(--amber)']]);
}

// ---------- flag figure: fleet size against daily throughput, saturated demand ----------
let fYard = 'yupu';
const DASH = { free: '', reserve: '', segment: 'stroke-dasharray:7 4;' };
function drawFlag() {
  const F = D.flag[fYard], C = F.saturated, lo = F.plateau.reserve, hi = F.T1t[0];
  const W = 560, H = fitH('cFlag', W, 380), m = { l: 60, r: 16, t: 14, b: 46 };
  const s = frame('cFlag', W, H, t('flagLbl'));
  const kMax = 150, top0 = 1.3 * F.T1t[2], st = niceStep(top0), yTop = Math.ceil(top0 / st) * st;
  const x = lin(0, kMax, m.l, W - m.r), y = lin(0, yTop, H - m.b, m.t);
  axes(s, x, y, range(0, kMax, 25), range(0, yTop, st), W, H, m, v => v, f0);
  el('text', { x: (m.l + W - m.r) / 2, y: H - 6, 'text-anchor': 'middle' }, s, t('K'));
  yTitle(s, 14, (m.t + H - m.b) / 2, t('thr'));
  const clip = 'clipFlag';
  el('rect', { x: m.l, y: m.t, width: W - m.l - m.r, height: H - m.t - m.b }, el('clipPath', { id: clip }, el('defs', {}, s)));
  // the capacity interval [reservation plateau, T1']
  anim(el('rect', { x: m.l, y: y(hi), width: W - m.l - m.r, height: y(lo) - y(hi), style: 'fill:var(--amber-soft);opacity:.85' }, s), 'a-fade', .1);
  el('path', { d: `M${m.l} ${y(hi)}H${W - m.r}`, style: 'stroke:var(--oxide);stroke-width:1.6;stroke-dasharray:7 4' }, s);
  el('text', { x: m.l + 8, y: y(hi) - 6, style: 'fill:var(--oxide);font-weight:600' }, s, `${t('t1t')} ${f0(hi)}`);
  el('text', { x: W - m.r - 6, y: y(hi) + 18, 'text-anchor': 'end', style: 'fill:var(--amber);font-weight:700;font-size:13px' }, s, fmt(t('band'), { a: f0(lo), b: f0(hi) }));
  const g = el('g', { 'clip-path': `url(#${clip})` }, s);
  MODELS.forEach((md, i) => {
    const pts = C.K.map((k, j) => [k, ...C[md][j]]).filter(p => p[0] <= kMax);
    el('path', { d: pathOf(pts.map(p => [x(p[0]), y(p[3])])) + pathOf(pts.slice().reverse().map(p => [x(p[0]), y(p[2])])).replace('M', 'L') + 'Z', style: `fill:${MC[md]};opacity:${md === 'segment' ? .08 : .14}` }, g);
    anim(el('path', { d: pathOf(pts.map(p => [x(p[0]), y(p[1])])), pathLength: 1, style: `stroke:${MC[md]};stroke-width:${md === 'segment' ? 2 : 2.6};fill:none;stroke-linejoin:round;${DASH[md]}` }, g), DASH[md] ? 'a-fade' : 'a-draw', .25 + .25 * i);
    pts.forEach((p, j) => {
      if (p[0] > 40 && p[0] % 10) return;   // thin the dense K = 45–150 grid for hover targets
      const c = anim(el('circle', { cx: x(p[0]), cy: y(p[1]), r: md === 'segment' ? 2.4 : 3, style: `fill:${MC[md]};stroke:var(--paper);stroke-width:1` }, g), 'a-pop', .9 + .3 * spread(j));
      hover(c, () => fmt(t('ptTip'), { yard: t(fYard), m: t(md), k: p[0], v: p[1].toFixed(1), lo: p[2].toFixed(0), hi: p[3].toFixed(0) }));
    });
  });
  const last = C.free[C.free.length - 1][0];   // where free flow leaves the frame
  if (last > yTop) el('text', { x: W - m.r - 4, y: m.t + 14, 'text-anchor': 'end', style: 'fill:var(--steel);font-weight:600;font-size:12px' }, s, fmt(t('freeOut'), { v: f0(last) }));
  swatches('lgFlag', [[MC.free, t('free')], [MC.reserve, t('reserve')], [MC.segment, t('segShort'), 'height:2px;border:0'], ['var(--amber-soft)', t('cBandS'), 'border:1px solid var(--amber)']]);
  const stat = (num, p) => `<div class="stat"><span class="num">${num}</span><p>${p}</p></div>`;
  $('flagRead').innerHTML = stat(`${f0(lo)}–${f0(hi)}`, t('rdBand'))
    + stat(`${Math.round(100 * lo / hi)}%`, t('rdShare'))
    + stat(`K ≈ ${F.Kstar20[0]}`, fmt(t('rdKstar'), { a: F.Kstar20[1], b: F.Kstar20[2] }));
  document.querySelectorAll('#flagYard button').forEach(b => b.setAttribute('aria-pressed', b.dataset.v === fYard));
}

function init() {
  $('flagYard').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { fYard = b.dataset.v; drawFlag(); } });
}

Deck.start({
  strings: T,
  sections: { intro: ['导读', 'Overview', '개요'], bg: ['背景与前提', 'Background', '배경과 전제'], q: ['问题与论断', 'Question and claims', '질문과 논제'],
    model: ['模型与定理', 'Model and theorems', '모형과 정리'], map: ['研究地图', 'Research map', '연구 지도'], res: ['已有结果', 'Results so far', '지금까지의 결과'],
    plan: ['论文与期刊', 'Papers and venues', '논문과 학술지'], status: ['进度与计划', 'Progress and plan', '진행과 계획'], end: ['已有工作', 'Earlier work', '기존 연구'], ref: ['参考文献', 'References', '참고문헌'] },
  draw: [drawConcept, drawFlag],
  init,
});
})();
