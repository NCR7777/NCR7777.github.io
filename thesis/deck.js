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
  free: ['自由流', 'Free flow', '자유류'], reserve: ['整条路径预约', 'Whole-route reservation', '전체 경로 예약'], segment: ['逐段申请', 'Segment request', '구간별 요청'],
  K: ['车队规模 K（台）', 'Fleet size K (vehicles)', '차량군 규모 K (대)'],
  thr: ['日吞吐（任务 / 16 h）', 'Daily throughput (tasks / 16 h)', '일일 처리량 (작업 / 16시간)'],
  // concept figure
  cY: ['日吞吐', 'Daily throughput', '일일 처리량'], cX: ['车队规模 K', 'Fleet size K', '차량군 규모 K'],
  cFree: ['自由流 = 车队上界', 'Free flow = fleet bound', '자유류 = 차량군 상한'], cT1: ['路网上界 T1', 'Network bound T1', '도로망 상한 T1'],
  cT1up: ['改造后的路网上界', 'Network bound after the upgrade', '개조 후 도로망 상한'],
  cOcc: ['占路模型', 'Occupancy model', '점유 모형'], cUp: ['改造后：平台抬高、拐点右移', 'After an upgrade: higher plateau, later turn', '개조 후: 평탄 구간 상승, 꺾임 이동'],
  cLin: ['线性段', 'linear', '선형'], cPlat: ['平台：路网约束区', 'plateau: network-bound', '평탄: 도로망 제약'], cJam: ['拥塞阈值', 'jamming threshold', '정체 임계값'],
  cSchem: ['示意，非数据', 'schematic, not data', '개념도, 데이터 아님'],
  // flag figure
  flagLbl: ['车队规模与日吞吐', 'Fleet size against daily throughput', '차량군 규모와 일일 처리량'],
  t1t: ['T1′ 路网上界', 'T1′ network bound', 'T1′ 도로망 상한'], t1tNote: ['只约束占路模型', 'occupancy models only', '점유 모형만'],
  demand: ['需求 {d}', 'demand {d}', '수요 {d}'],
  freeOut: ['自由流 K = 150：{v} ↑', 'free flow at K = 150: {v} ↑', '자유류 K = 150: {v} ↑'],
  ptTip: ['{yard} · {m}<br>K = {k}：{v} 个/日（种子范围 {lo}–{hi}）', '{yard} · {m}<br>K = {k}: {v} a day (seeds {lo}–{hi})', '{yard} · {m}<br>K = {k}: 하루 {v}건 (시드 범위 {lo}–{hi})'],
  rdPlat: ['饱和平台：预约 / 逐段（个/日，K = 100–150 均值）', 'Saturated plateau: reservation / segment (a day, mean of K = 100–150)', '포화 평탄: 예약 / 구간별 (하루, K = 100–150 평균)'],
  rdT1: ['收紧后的路网上界 T1′（个/日；收紧前 T1 = {t1}）', 'Tightened network bound T1′ (a day; T1 = {t1} before tightening)', '강화한 도로망 상한 T1′ (하루, 강화 전 T1 = {t1})'],
  rdShare: ['预约平台只到 T1′ 的这一比例：其余差距来自调度规则，是第 4 章要挣回的部分', 'The reservation plateau reaches only this share of T1′: the rest is the scheduling rule, which chapter 4 aims to win back', '예약 평탄 구간은 T1′의 이 비율뿐: 나머지는 스케줄링 규칙 몫으로 4장이 되찾을 부분'],
  rdKstar: ['路网约束区起点（边际比首次 < 20%；区间 {a}–{b}）', 'Network-bound from here (marginal ratio first below 20%; range {a}–{b})', '도로망 제약 시작 (한계 비율이 처음 20% 미만, 구간 {a}–{b})'],
  rdKpk: ['高峰所需车数：自由流 → 整条路径预约（逐段申请 {s}）', 'Vehicles needed at peak: free flow → reservation (segment request {s})', '피크 필요 차량: 자유류 → 예약 (구간별 요청 {s})'],
  rdKreg: ['常规日所需车数：自由流 → 整条路径预约', 'Vehicles needed on a regular day: free flow → reservation', '평상일 필요 차량: 자유류 → 예약'],
  rdDem: ['高峰日需求（运输任务 / 16 h，常规日的 2 倍）', 'Peak-day demand (tasks / 16 h, twice a regular day)', '피크일 수요 (작업 / 16시간, 평상일의 2배)'],
  // marginal ratio
  margLbl: ['每多一台车的吞吐占自由流的比例', 'Gain from one more vehicle as a share of free flow', '한 대 추가 효과의 자유류 대비 비율'],
  margY: ['边际比（占路 ÷ 自由流）', 'Marginal ratio (occupancy ÷ free flow)', '한계 비율 (점유 ÷ 자유류)'],
  theta: ['θ = 20%', 'θ = 20%', 'θ = 20%'],
  margTip: ['{yard} · K = {k}：{v}%', '{yard} · K = {k}: {v}%', '{yard} · K = {k}: {v}%'],
  // crane utilisation
  rhoLbl: ['吊车利用率与全厂饱和平台', 'Crane utilisation against the yard plateau', '크레인 이용률과 전체 평탄 구간'],
  rhoX: ['吊车利用率 ρ', 'Crane utilisation ρ', '크레인 이용률 ρ'],
  rhoY: ['饱和平台（基础情景 = 100%）', 'Saturated plateau (base scenario = 100%)', '포화 평탄 (기본 시나리오 = 100%)'],
  rhoWork: ['★ 现行工作点', '★ current working point', '★ 현 작업점'],
  rhoThY: ['玉浦 ≈ 0.85', 'Okpo ≈ 0.85', '옥포 ≈ 0.85'], rhoThT: ['烟台 ≈ 0.6–0.7', 'Yantai ≈ 0.6–0.7', '옌타이 ≈ 0.6–0.7'],
  rhoTip: ['{yard} · {m}<br>ρ = {r}（搭载 {n} 个/日）<br>平台 = 基础的 {v}%；K = 150 时坞前停靠路段被占 {b}%', '{yard} · {m}<br>ρ = {r} ({n} erections a day)<br>plateau = {v}% of base; dock road busy {b}% at K = 150', '{yard} · {m}<br>ρ = {r} (하루 탑재 {n}건)<br>평탄 = 기본의 {v}%, K = 150에서 도크 정차 구간 점유 {b}%'],
  // tables
  tYard: ['', '', ''], tRoads: ['道路（条 / km）', 'Roads (count / km)', '도로 (개 / km)'], tJun: ['路口资源', 'Junction resources', '교차로 자원'],
  tAcc: ['入口', 'Entrances', '출입구'], tStops: ['停靠点', 'Stops', '정차 지점'], tCyc: ['独立环路数', 'Independent cycles', '독립 순환 수'],
  tDem: ['日任务量：常规 / 高峰', 'Tasks a day: regular / peak', '하루 작업: 평상 / 피크'],
  cPlatR: ['饱和平台：整条路径预约', 'Plateau, whole-route reservation', '평탄 구간: 전체 경로 예약'], cPlatS: ['饱和平台：逐段申请', 'Plateau, segment request', '평탄 구간: 구간별 요청'],
  cT1t: ['路网上界 T1′', 'Network bound T1′', '도로망 상한 T1′'], cShare: ['预约平台 ÷ T1′', 'Reservation plateau ÷ T1′', '예약 평탄 ÷ T1′'],
  cKstar: ['路网约束区起点 K*', 'Network-bound from K*', '도로망 제약 시작 K*'], cKpk: ['高峰所需车数（自由流 → 预约）', 'Vehicles at peak (free flow → reservation)', '피크 필요 차량 (자유류 → 예약)'],
  cBind: ['T1′ 取紧的资源', 'Where T1′ binds', 'T1′이 걸리는 자원'], bindY: ['坞前停靠路段', 'a dock stopping road', '도크 앞 정차 구간'], bindT: ['单门车间的门口', 'the door of a single-door shop', '문이 하나인 공장 출입구'],
  cRho: ['吊车工作点 ρ（搭载 / 日）', 'Crane working point ρ (erections a day)', '크레인 작업점 ρ (하루 탑재)'],
};
const t = k => T[k][LI[Deck.lang]];
const MC = { free: 'var(--steel)', reserve: 'var(--oxide)', segment: 'var(--amber)' };
const YC = { yupu: 'var(--steel)', yantai: 'var(--amber)' };
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
  const W = 560, H = fitH('cConcept', W, 380), m = { l: 34, r: 14, t: 14, b: 34 };
  const s = frame('cConcept', W, H, t('cOcc'));
  const x = lin(0, 10, m.l, W - m.r), y = lin(0, 10, H - m.b, m.t);
  el('path', { d: `M${m.l} ${m.t}V${H - m.b}H${W - m.r}`, style: 'stroke:var(--ink3);fill:none' }, s);
  el('text', { x: W - m.r, y: H - m.b + 22, 'text-anchor': 'end' }, s, t('cX'));
  yTitle(s, m.l - 14, (m.t + H - m.b) / 2, t('cY'));
  // bounds
  anim(el('path', { d: `M${x(0)} ${y(0)}L${x(9.4)} ${y(9.4)}`, pathLength: 1, style: 'stroke:var(--steel);stroke-width:2.5;fill:none' }, s), 'a-draw', .2);
  anim(el('text', { x: x(7.7), y: y(9.3), 'text-anchor': 'end', style: 'fill:var(--steel);font-weight:600' }, s, t('cFree')), 'a-fade', .8);
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
  lbl(5.9, 3.45, 'cPlat', 1.1, 'var(--oxide)');
  el('path', { d: `M${x(6.9)} ${y(4.25)}V${y(0)}`, style: 'stroke:var(--ink3);stroke-dasharray:2 3' }, s);
  lbl(7.7, 0.55, 'cJam', 1.2);
  el('text', { x: m.l + 8, y: m.t + 12, style: 'fill:var(--ink3);font-size:11.5px;font-style:italic' }, s, t('cSchem'));
  swatches('lgConcept', [['var(--steel)', t('cFree')], ['var(--oxide)', t('cOcc')], ['var(--good)', t('cUp')]]);
}

// ---------- flag figure: fleet size against daily throughput ----------
let fYard = 'yupu', fLev = 'saturated';
function drawFlag() {
  const F = D.flag[fYard], C = F[fLev], sat = fLev === 'saturated';
  const W = 560, H = fitH('cFlag', W, 380), m = { l: 60, r: 16, t: 14, b: 46 };
  const s = frame('cFlag', W, H, t('flagLbl'));
  const kMax = sat ? 150 : 40;
  const top0 = sat ? 1.3 * F.T1t[2] : 1.2 * F.demand.peak, st = niceStep(top0), yTop = Math.ceil(top0 / st) * st;
  const x = lin(0, kMax, m.l, W - m.r), y = lin(0, yTop, H - m.b, m.t);
  axes(s, x, y, range(0, kMax, sat ? 25 : 5), range(0, yTop, st), W, H, m, v => v, f0);
  el('text', { x: (m.l + W - m.r) / 2, y: H - 6, 'text-anchor': 'middle' }, s, t('K'));
  yTitle(s, 14, (m.t + H - m.b) / 2, t('thr'));
  const clip = 'clipFlag';
  el('rect', { x: m.l, y: m.t, width: W - m.l - m.r, height: H - m.t - m.b }, el('clipPath', { id: clip }, el('defs', {}, s)));
  if (sat) {   // T1' with its seed range
    el('rect', { x: m.l, y: y(F.T1t[2]), width: W - m.l - m.r, height: y(F.T1t[1]) - y(F.T1t[2]), style: 'fill:var(--oxide-soft);opacity:.7' }, s);
    el('path', { d: `M${m.l} ${y(F.T1t[0])}H${W - m.r}`, style: 'stroke:var(--oxide);stroke-width:1.6;stroke-dasharray:7 4' }, s);
    el('text', { x: m.l + 8, y: y(F.T1t[2]) - 6, style: 'fill:var(--oxide);font-weight:600' }, s, `${t('t1t')} ${f0(F.T1t[0])} · ${t('t1tNote')}`);
  } else {
    el('path', { d: `M${m.l} ${y(F.demand.peak)}H${W - m.r}`, style: 'stroke:var(--ink3);stroke-width:1.2;stroke-dasharray:5 4' }, s);
    el('text', { x: W - m.r - 4, y: y(F.demand.peak) - 6, 'text-anchor': 'end', style: 'fill:var(--ink2)' }, s, fmt(t('demand'), { d: F.demand.peak }));
    MODELS.forEach((md, i) => {
      const k = F.Kreq.peak[md];
      anim(el('path', { d: `M${x(k)} ${y(F.demand.peak)}V${H - m.b}`, style: `stroke:${MC[md]};stroke-width:1.4;stroke-dasharray:3 3` }, s), 'a-fade', 1.2);
      anim(el('text', { x: x(k) + (md === 'free' ? -4 : 4), y: H - m.b - 8 - 14 * i, 'text-anchor': md === 'free' ? 'end' : 'start', style: `fill:${MC[md]};font-weight:600;font-size:12px` }, s, `K = ${k}`), 'a-fade', 1.3);
    });
  }
  const g = el('g', { 'clip-path': `url(#${clip})` }, s);
  MODELS.forEach((md, i) => {
    const pts = C.K.map((k, j) => [k, ...C[md][j]]).filter(p => p[0] <= kMax);
    el('path', { d: pathOf(pts.map(p => [x(p[0]), y(p[3])])) + pathOf(pts.slice().reverse().map(p => [x(p[0]), y(p[2])])).replace('M', 'L') + 'Z', style: `fill:${MC[md]};opacity:.14` }, g);
    anim(el('path', { d: pathOf(pts.map(p => [x(p[0]), y(p[1])])), pathLength: 1, style: `stroke:${MC[md]};stroke-width:2.6;fill:none;stroke-linejoin:round` }, g), 'a-draw', .25 + .25 * i);
    pts.forEach((p, j) => {
      if (sat && p[0] > 40 && p[0] % 10) return;   // thin the dense K = 45–150 grid for hover targets
      const c = anim(el('circle', { cx: x(p[0]), cy: y(p[1]), r: 3, style: `fill:${MC[md]};stroke:var(--paper);stroke-width:1` }, g), 'a-pop', .9 + .3 * spread(j));
      hover(c, () => fmt(t('ptTip'), { yard: t(fYard), m: t(md), k: p[0], v: p[1].toFixed(1), lo: p[2].toFixed(0), hi: p[3].toFixed(0) }));
    });
  });
  if (sat) {   // where free flow leaves the frame
    const last = C.free[C.free.length - 1][0];
    if (last > yTop) el('text', { x: W - m.r - 4, y: m.t + 14, 'text-anchor': 'end', style: 'fill:var(--steel);font-weight:600;font-size:12px' }, s, fmt(t('freeOut'), { v: f0(last) }));
  }
  swatches('lgFlag', MODELS.map(md => [MC[md], t(md)]).concat(sat ? [['var(--oxide-soft)', `${t('t1t')} (${t('t1tNote')})`, 'border:1px dashed var(--oxide)']] : []));
  // readings next to the chart
  const stat = (num, p) => `<div class="stat"><span class="num">${num}</span><p>${p}</p></div>`;
  $('flagRead').innerHTML = sat
    ? stat(`${f0(F.plateau.reserve)}<small>/ ${f0(F.plateau.segment)}</small>`, t('rdPlat'))
      + stat(f0(F.T1t[0]), fmt(t('rdT1'), { t1: f0(F.T1[0]) }))
      + stat(`${Math.round(100 * F.plateau.reserve / F.T1t[0])}%`, t('rdShare'))
      + stat(`K ≈ ${F.Kstar20[0]}`, fmt(t('rdKstar'), { a: F.Kstar20[1], b: F.Kstar20[2] }))
    : stat(`${F.Kreq.peak.free} → ${F.Kreq.peak.reserve}`, fmt(t('rdKpk'), { s: F.Kreq.peak.segment }))
      + stat(`${F.Kreq.regular.free} → ${F.Kreq.regular.reserve}`, t('rdKreg'))
      + stat(F.demand.peak, t('rdDem'));
  document.querySelectorAll('#flagYard button').forEach(b => b.setAttribute('aria-pressed', b.dataset.v === fYard));
  document.querySelectorAll('#flagLev button').forEach(b => b.setAttribute('aria-pressed', b.dataset.v === fLev));
}

// ---------- H1: marginal ratio against fleet size, both yards ----------
function drawMarg() {
  const W = 560, H = fitH('cMarg', W, 380), m = { l: 56, r: 16, t: 14, b: 46 };
  const s = frame('cMarg', W, H, t('margLbl'));
  const x = lin(0, 140, m.l, W - m.r), y = lin(0, 0.7, H - m.b, m.t);
  axes(s, x, y, range(0, 140, 20), range(0, 0.7, 0.1), W, H, m, v => v, v => Math.round(100 * v) + '%');
  el('text', { x: (m.l + W - m.r) / 2, y: H - 6, 'text-anchor': 'middle' }, s, t('K'));
  yTitle(s, 14, (m.t + H - m.b) / 2, t('margY'));
  el('path', { d: `M${m.l} ${y(0.2)}H${W - m.r}`, style: 'stroke:var(--oxide);stroke-width:1.5;stroke-dasharray:6 4' }, s);
  el('text', { x: W - m.r - 4, y: y(0.2) - 6, 'text-anchor': 'end', style: 'fill:var(--oxide);font-weight:600' }, s, t('theta'));
  ['yupu', 'yantai'].forEach((yd, i) => {
    const F = D.flag[yd], pts = F.marg;
    anim(el('path', { d: pathOf(pts.map(([k, r]) => [x(k), y(r)])), pathLength: 1, style: `stroke:${YC[yd]};stroke-width:2.6;fill:none` }, s), 'a-draw', .25 + .3 * i);
    pts.forEach(([k, r], j) => {
      const c = anim(el('circle', { cx: x(k), cy: y(r), r: 3, style: `fill:${YC[yd]};stroke:var(--paper);stroke-width:1` }, s), 'a-pop', .8 + .3 * spread(j));
      hover(c, () => fmt(t('margTip'), { yard: t(yd), k, v: (100 * r).toFixed(1) }));
    });
    const ks = F.Kstar20[0], r = (pts.find(p => p[0] === ks) || [ks, 0.2])[1];
    anim(el('circle', { cx: x(ks), cy: y(r), r: 7, style: `fill:none;stroke:${YC[yd]};stroke-width:2.2` }, s), 'a-pop', 1.4);
    anim(el('text', { x: x(ks) + 10, y: y(r) + (i ? 24 : -12), style: `fill:${YC[yd]};font-weight:700;font-size:13px` }, s, `${t(yd)} K* ≈ ${ks}`), 'a-fade', 1.5);
  });
  swatches('lgMarg', [[YC.yupu, t('yupu')], [YC.yantai, t('yantai')], ['var(--oxide)', t('theta'), 'height:2px;border:0']]);
}

// ---------- dock mouth: crane utilisation against the saturated plateau ----------
function drawRho() {
  const W = 560, H = fitH('cRho', W, 380), m = { l: 56, r: 16, t: 14, b: 46 };
  const s = frame('cRho', W, H, t('rhoLbl'));
  const x = lin(0, 1, m.l, W - m.r), y = lin(0, 110, H - m.b, m.t);
  axes(s, x, y, range(0, 1, 0.2), range(0, 100, 20), W, H, m, v => v.toFixed(1), v => v + '%');
  el('text', { x: (m.l + W - m.r) / 2, y: H - 6, 'text-anchor': 'middle' }, s, t('rhoX'));
  yTitle(s, 14, (m.t + H - m.b) / 2, t('rhoY'));
  // thresholds as decided in H1 (Okpo about 0.85, Yantai about 0.6–0.7)
  el('rect', { x: x(0.6), y: m.t, width: x(0.7) - x(0.6), height: H - m.b - m.t, style: 'fill:var(--amber-soft);opacity:.8' }, s);
  el('path', { d: `M${x(0.85)} ${m.t}V${H - m.b}`, style: 'stroke:var(--steel);stroke-dasharray:3 3' }, s);
  el('text', { x: x(0.65), y: m.t + 14, 'text-anchor': 'middle', style: 'fill:var(--amber);font-weight:600;font-size:12px' }, s, t('rhoThT'));
  el('text', { x: x(0.85) - 4, y: m.t + 30, 'text-anchor': 'end', style: 'fill:var(--steel);font-weight:600;font-size:12px' }, s, t('rhoThY'));
  el('path', { d: `M${m.l} ${y(100)}H${W - m.r}`, style: 'stroke:var(--ink3);stroke-width:1' }, s);
  ['yupu', 'yantai'].forEach((yd, i) => {
    [['segment', 4, ''], ['reserve', 3, '6 4']].forEach(([md, col, dash], k) => {
      const pts = D.rho[yd];
      anim(el('path', { d: pathOf(pts.map(p => [x(p[1]), y(p[col])])), pathLength: 1, style: `stroke:${YC[yd]};stroke-width:${md === 'segment' ? 2.8 : 1.8};fill:none;${dash ? `stroke-dasharray:${dash};opacity:.75` : ''}` }, s), dash ? 'a-fade' : 'a-draw', .3 + .3 * i + .2 * k);
      pts.forEach((p, j) => {
        const main = p[0] === 'crane', cx = x(p[1]), cy = y(p[col]);
        const c = main
          ? el('path', { d: `M${cx} ${cy - 9}L${cx + 2.6} ${cy - 3}L${cx + 9} ${cy - 2.8}L${cx + 4} ${cy + 1.6}L${cx + 5.6} ${cy + 8}L${cx} ${cy + 4.4}L${cx - 5.6} ${cy + 8}L${cx - 4} ${cy + 1.6}L${cx - 9} ${cy - 2.8}L${cx - 2.6} ${cy - 3}Z`, style: `fill:${YC[yd]};stroke:var(--ink);stroke-width:.8` }, s)
          : el('circle', { cx, cy, r: md === 'segment' ? 3.4 : 2.6, style: `fill:${YC[yd]};stroke:var(--paper);stroke-width:1` }, s);
        anim(c, 'a-pop', .9 + .3 * spread(j + 3 * i));
        hover(c, () => fmt(t('rhoTip'), { yard: t(yd), m: t(md), r: p[1].toFixed(2), n: p[2], v: p[col].toFixed(1), b: p[5].toFixed(0) }));
      });
    });
  });
  swatches('lgRho', [[YC.yupu, `${t('yupu')} · ${t('segment')}`], [YC.yantai, `${t('yantai')} · ${t('segment')}`], ['var(--ink3)', `--- ${t('reserve')}`, 'opacity:0;width:0;border:0'], ['transparent', t('rhoWork'), 'width:0;border:0']]);
}

// ---------- tables filled from the data ----------
function fillTables() {
  const Y = ['yupu', 'yantai'], F = D.flag, tri = Deck.tri;
  const row = (k, f) => `<tr><td>${t(k)}</td>${Y.map(y => `<td class="mono">${f(F[y], y)}</td>`).join('')}</tr>`;
  const head = `<thead><tr><th></th>${Y.map(y => `<th>${t(y)}</th>`).join('')}</tr></thead>`;
  $('topoTbl').innerHTML = head + '<tbody>' + [
    row('tRoads', f => `${f.topo.roads} / ${f.topo.km}`), row('tJun', f => f.topo.junction_res), row('tAcc', f => f.topo.access),
    row('tStops', f => f.topo.stops), row('tCyc', f => f.topo.cyclomatic), row('tDem', f => `${f.demand.regular} / ${f.demand.peak}`),
  ].join('') + '</tbody>';
  const crane = y => D.rho[y].find(p => p[0] === 'crane');
  $('cmpTbl').innerHTML = head + '<tbody>' + [
    row('tRoads', f => `${f.topo.roads} / ${f.topo.km} km`), row('cPlatR', f => f0(f.plateau.reserve)), row('cPlatS', f => f0(f.plateau.segment)),
    row('cT1t', f => f0(f.T1t[0])), row('cShare', f => Math.round(100 * f.plateau.reserve / f.T1t[0]) + '%'),
    row('cKstar', f => `≈ ${f.Kstar20[0]}`), row('cKpk', f => `${f.Kreq.peak.free} → ${f.Kreq.peak.reserve}`),
    row('cBind', (f, y) => t(y === 'yupu' ? 'bindY' : 'bindT')), row('cRho', (f, y) => `${crane(y)[1].toFixed(2)} (${crane(y)[2]})`),
  ].join('') + '</tbody>';
  void tri;
}

function init() {
  $('flagYard').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { fYard = b.dataset.v; drawFlag(); } });
  $('flagLev').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { fLev = b.dataset.v; drawFlag(); } });
}

Deck.start({
  strings: T,
  sections: { intro: ['导读', 'Overview', '개요'], bg: ['背景与前提', 'Background', '배경과 전제'], q: ['问题与论断', 'Question and claims', '질문과 논제'],
    model: ['模型与理论', 'Model and theory', '모형과 이론'], plan: ['架构与方法', 'Plan and methods', '구성과 방법'], res: ['立旗实验', 'Flag experiment', '깃발 실험'],
    data: ['数据', 'Data', '데이터'], status: ['进度与计划', 'Progress and plan', '진행과 계획'], end: ['讨论', 'Discussion', '논의'], ref: ['参考文献', 'References', '참고문헌'] },
  draw: [drawConcept, drawFlag, drawMarg, drawRho, fillTables],
  init,
});
})();
