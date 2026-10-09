// Capacity-interval deck: the strings and charts of this briefing (chart code follows thesis/deck.js).
// Paging, language, notes, contents, glossary, layout and the PDF link come from ../shared/deck-core.js (README.md).
(() => {
'use strict';
const D = window.DATA;
const { LI, $, el, frame, fitH, anim, spread, lin, yTitle, swatches, hover, fmt } = Deck;

// ---------- strings used inside charts and tables: [zh, en, ko] ----------
const T = {
  title: ['运力区间 · 分项汇报', 'Capacity Interval', '운송 능력 구간 · 세부 보고'],
  yupu: ['玉浦', 'Okpo', '옥포'], yantai: ['烟台', 'Yantai', '옌타이'],
  free: ['自由流', 'Free flow', '자유류'], reserve: ['整条路径预约', 'Whole-route reservation', '전체 경로 예약'],
  segment: ['逐段申请（参照规则·瞬移疏解）', 'Segment request (reference rule, teleport clearing)', '구간별 요청 (참조 규칙·순간 이동 해소)'],
  segShort: ['逐段申请（参照规则·瞬移疏解）', 'Segment request (reference rule, teleport)', '구간별 요청 (참조 규칙·순간 이동)'],
  K: ['车队规模 K（台）', 'Fleet size K (vehicles)', '차량군 규모 K (대)'],
  thr: ['日吞吐（任务 / 16 h）', 'Daily throughput (tasks / 16 h)', '일일 처리량 (작업 / 16시간)'],
  // flag figure
  flagLbl: ['运力区间：车队规模与日吞吐', 'Capacity interval: fleet size against daily throughput', '운송 능력 구간: 차량군 규모와 일일 처리량'],
  t1t: ['上沿 T1′', 'Ceiling T1′', '상한 T1′'], floor: ['下沿：预约平台', 'Floor: reservation plateau', '하한: 예약 평탄 구간'],
  band: ['运力区间', 'Capacity interval', '운송 능력 구간'],
  t1tLg: ['上沿 T1′（只约束占路模型）', 'Ceiling T1′ (bounds occupancy models only)', '상한 T1′ (점유 모형만 제약)'],
  freeOut: ['自由流 K = 150：{v} ↑', 'free flow at K = 150: {v} ↑', '자유류 K = 150: {v} ↑'],
  ptTip: ['{yard} · {m}<br>K = {k}：{v} 个/日（种子范围 {lo}–{hi}）', '{yard} · {m}<br>K = {k}: {v} a day (seeds {lo}–{hi})', '{yard} · {m}<br>K = {k}: 하루 {v}건 (시드 범위 {lo}–{hi})'],
  rdInt: ['运力区间（个/日）：下沿是整条路径预约的平台（K = 100–150 均值），上沿是 T1′（10 个种子均值，种子间 {a}–{b}）', 'Capacity interval (a day): the floor is the reservation plateau (mean of K = 100–150), the ceiling T1′ (mean of 10 seeds, {a}–{b} across seeds)', '운송 능력 구간 (하루): 하한은 예약 평탄 구간 (K = 100–150 평균), 상한은 T1′ (시드 10개 평균, 시드 간 {a}–{b})'],
  rdShare: ['下沿只到上沿的这一比例：差距来自交通规则，编排把下沿往上推', 'The floor reaches only this share of the ceiling: the gap is the traffic rule, which orchestration aims to close', '하한은 상한의 이 비율뿐: 차이는 통행 규칙에서 오며 편성이 좁힐 몫'],
  rdSeg: ['逐段申请的平台（参照规则·瞬移疏解，只作参照）', 'Segment-request plateau (reference rule with teleport clearing, for reference only)', '구간별 요청의 평탄 구간 (참조 규칙·순간 이동 해소, 참조용)'],
  rdKstar: ['约束区起点 K*(20%){r}', 'Network-bound from K*(20%){r}', '제약 구간 시작 K*(20%){r}'],
  rdKr: ['，区间 {a}–{b}', ', range {a}–{b}', ', 구간 {a}–{b}'],
  // marginal ratio
  margLbl: ['每多一台车的吞吐占自由流的比例', 'Gain from one more vehicle as a share of free flow', '한 대 추가 효과의 자유류 대비 비율'],
  margY: ['边际比（占路 ÷ 自由流）', 'Marginal ratio (occupancy ÷ free flow)', '한계 비율 (점유 ÷ 자유류)'],
  theta: ['θ = 20%', 'θ = 20%', 'θ = 20%'],
  margTip: ['{yard} · K = {k}：{v}%', '{yard} · K = {k}: {v}%', '{yard} · K = {k}: {v}%'],
  // work zone
  zoneLbl: ['工作区图预览：日任务量与所需车数（玉浦）', 'Work-zone preview: daily volume against vehicles needed (Okpo)', '작업 영역도 미리보기: 일일 작업량과 필요 차량 (옥포)'],
  zoneX: ['日任务量（个 / 16 h）', 'Daily task volume (tasks / 16 h)', '일일 작업량 (작업 / 16시간)'],
  zoneY: ['所需车数（台）', 'Vehicles needed', '필요 차량 수 (대)'],
  zoneYard: ['全厂口径 300–600', 'whole-yard 300–600', '전체 기준 300–600'],
  zoneFleet: ['现实车队 30–40 台', 'real fleets 30–40', '현실 차량군 30–40대'],
  zoneK: ['K*(20%) ≈ {k}', 'K*(20%) ≈ {k}', 'K*(20%) ≈ {k}'],
  zoneSub: ['4 台车子集', '4-transporter subset', '4대 부분집합'],
  zoneOut: ['> 150', '> 150', '> 150'],
  zonePrev: ['预览（近似）', 'preview (approx.)', '미리보기 (근사)'],
  zoneTip: ['{m}<br>每天 {d} 个：{k} 台', '{m}<br>{d} a day: {k} vehicles', '{m}<br>하루 {d}건: {k}대'],
  // productivity
  prodLbl: ['每台车每天完成的任务数', 'Tasks per vehicle per day', '차량당 하루 작업 수'],
  prodX: ['个 / 车 · 日', 'tasks per vehicle-day', '작업 / 차량·일'],
  pYim: ['Yim 2008 · 97 / 4', 'Yim 2008 · 97 / 4', 'Yim 2008 · 97 / 4'],
  pShen: ['Shen 2018 · 600 / 30', 'Shen 2018 · 600 / 30', 'Shen 2018 · 600 / 30'],
  pHeo: ['Heo 2013 · 126 / 7（苏比克）', 'Heo 2013 · 126 / 7 (Subic)', 'Heo 2013 · 126 / 7 (수빅)'],
  pFree: ['模型 · 自由流', 'Model · free flow', '모형 · 자유류'], pRes: ['模型 · 整条路径预约', 'Model · reservation', '모형 · 전체 경로 예약'],
  pSeg: ['模型 · 逐段（参照规则·瞬移疏解）', 'Model · segment (ref. rule, teleport)', '모형 · 구간별 (참조 규칙·순간 이동)'],
  pHc: ['模型单车上限 H/c̄ = {v}', 'model ceiling H/c̄ = {v}', '모형 상한 H/c̄ = {v}'],
  pField: ['现场锚点', 'Field anchors', '현장 기준점'], pModel: ['模型（玉浦，K = 30）', 'Model (Okpo, K = 30)', '모형 (옥포, K = 30)'],
  // service-time gap
  gapLbl: ['服务时间差 Δ(K)：整条路径预约减自由流', 'Service-time gap Δ(K): whole-route reservation minus free flow', '서비스 시간 차 Δ(K): 전체 경로 예약 − 자유류'],
  gapY: ['Δ(K)（分钟）', 'Δ(K) (minutes)', 'Δ(K) (분)'],
  gapFit: ['拟合 Δ ∝ K^α', 'fit Δ ∝ K^α', '적합 Δ ∝ K^α'],
  gapTip: ['{yard} · K = {k}：Δ = {v} min', '{yard} · K = {k}: Δ = {v} min', '{yard} · K = {k}: Δ = {v}분'],
  // density
  denLbl: ['日任务量占 T1′ 的比例', 'Daily volume as a share of T1′', '일일 작업량의 T1′ 대비 비율'],
  denX: ['日任务量 / T1′', 'daily volume / T1′', '일일 작업량 / T1′'],
  denRow: ['{yard} · 每天 {d} 个', '{yard} · {d} a day', '{yard} · 하루 {d}건'],
  denLine: ['预约平台 ≈ T1′ 的 {v}%（两厂）', 'reservation plateau ≈ {v}% of T1′ (both yards)', '예약 평탄 구간 ≈ T1′의 {v}% (두 곳)'],
  denYt: ['烟台（全厂口径）', 'Yantai (whole yard)', '옌타이 (전체 기준)'], denSub: ['玉浦 · 4 台车子集', 'Okpo · 4-transporter subset', '옥포 · 4대 부분집합'],
  denWy: ['玉浦 · 全厂口径', 'Okpo · whole yard', '옥포 · 전체 기준'],
  // tables
  tRoads: ['道路（条 / km）', 'Roads (count / km)', '도로 (개 / km)'], tJun: ['路口资源', 'Junction resources', '교차로 자원'],
  tStops: ['停靠点', 'Stops', '정차 지점'],
  tDem: ['对照日任务量：常规 / 高峰', 'Comparison volume: regular / peak', '비교 작업량: 평상 / 피크'],
  tBind: ['T1′ 取紧的要素（种子数）', 'Where T1′ binds (seeds)', 'T1′이 걸리는 요소 (시드 수)'],
  bindY: ['道路161 坞前 5/10，道路010-6 4/10', 'dock road 161 5/10, road 010-6 4/10', '도크 앞 도로161 5/10, 도로010-6 4/10'],
  bindT: ['建筑014 的两个门 9/10', 'the two doors of building 014 9/10', '건물014의 두 출입구 9/10'],
  pvD: ['日任务量（个 / 16 h）', 'Tasks a day (16 h)', '하루 작업 (16시간)'],
  pvSub: ['（4 台车子集·高峰）', ' (4-transporter subset, peak)', ' (4대 부분집합·피크)'],
  pvSeg: ['逐段申请<br>（参照规则·瞬移疏解）', 'Segment request<br>(reference rule, teleport)', '구간별 요청<br>(참조 규칙·순간 이동)'],
  pvOut: ['> 150（K = 150 时 {v}）', '> 150 ({v} at K = 150)', '> 150 (K = 150에서 {v})'],
  rtD: ['日任务量', 'Tasks a day', '하루 작업'], rtRatio: ['预约 ÷ 自由流', 'Reservation ÷ free flow', '예약 ÷ 자유류'],
};
const t = k => T[k][LI[Deck.lang]];
const MC = { free: 'var(--steel)', reserve: 'var(--oxide)', segment: 'var(--amber)' };
const YC = { yupu: 'var(--steel)', yantai: 'var(--amber)' };
const MODELS = ['free', 'reserve', 'segment'];
const DASH = { free: '', reserve: '', segment: 'stroke-dasharray:7 4;' };
const f0 = v => Math.round(v).toLocaleString('en-US');
function niceStep(top) { const p = 10 ** Math.floor(Math.log10(top)) / 10; return [1, 2, 2.5, 5, 10, 20, 25, 50].map(k => k * p).find(s => top / s <= 6); }
function axes(s, x, y, xt, yt, W, H, m, fx = v => v, fy = v => v) {
  const g = el('g', { class: 'grid' }, s), a = el('g', { class: 'axis' }, s);
  yt.forEach(v => { el('line', { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v) }, g); el('text', { x: m.l - 8, y: y(v) + 4, 'text-anchor': 'end' }, s, fy(v)); });
  xt.forEach(v => el('text', { x: x(v), y: H - m.b + 17, 'text-anchor': 'middle' }, s, fx(v)));
  el('path', { d: `M${m.l} ${m.t}V${H - m.b}H${W - m.r}` }, a);
}
const range = (a, b, st) => { const r = []; for (let v = a; v <= b + 1e-9; v += st) r.push(+v.toFixed(6)); return r; };
const pathOf = pts => pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('');
const clipTo = (s, id, m, W, H) => { el('rect', { x: m.l, y: m.t, width: W - m.l - m.r, height: H - m.t - m.b }, el('clipPath', { id }, el('defs', {}, s))); return el('g', { 'clip-path': `url(#${id})` }, s); };
const cell = r => (r == null ? null : r[0] === r[1] ? `${r[1]}` : `${r[0]}–${r[1]}`);

// ---------- the capacity interval on the flag figure ----------
let fYard = 'yupu';
function drawFlag() {
  const F = D.flag[fYard], C = F.saturated, lo = F.plateau.reserve, hi = F.T1t[0];
  const W = 560, H = fitH('cFlag', W, 380), m = { l: 60, r: 16, t: 14, b: 46 };
  const s = frame('cFlag', W, H, t('flagLbl'));
  const top0 = 1.3 * hi, st = niceStep(top0), yTop = Math.ceil(top0 / st) * st;
  const x = lin(0, 150, m.l, W - m.r), y = lin(0, yTop, H - m.b, m.t);
  anim(el('rect', { x: m.l, y: y(hi), width: W - m.l - m.r, height: y(lo) - y(hi), style: 'fill:var(--good-soft)' }, s), 'a-fade', .1);
  axes(s, x, y, range(0, 150, 25), range(0, yTop, st), W, H, m, v => v, f0);
  el('text', { x: (m.l + W - m.r) / 2, y: H - 6, 'text-anchor': 'middle' }, s, t('K'));
  yTitle(s, 14, (m.t + H - m.b) / 2, t('thr'));
  el('path', { d: `M${m.l} ${y(hi)}H${W - m.r}`, style: 'stroke:var(--good);stroke-width:2;stroke-dasharray:8 5' }, s);
  el('path', { d: `M${m.l} ${y(lo)}H${W - m.r}`, style: 'stroke:var(--oxide);stroke-width:1.2;stroke-dasharray:3 4' }, s);
  el('text', { x: m.l + 8, y: y(hi) - 7, style: 'fill:var(--good);font-weight:600' }, s, `${t('t1t')} = ${f0(hi)}`);
  anim(el('text', { x: W - m.r - 8, y: y(0.62 * hi + 0.38 * lo) + 5, 'text-anchor': 'end', style: 'fill:var(--good);font-weight:700;font-size:15px' }, s, `${t('band')} [${f0(lo)}, ${f0(hi)}]`), 'a-fade', 1.2);
  const g = clipTo(s, 'clipFlag', m, W, H);
  MODELS.forEach((md, i) => {
    const pts = C.K.map((k, j) => [k, ...C[md][j]]);
    el('path', { d: pathOf(pts.map(p => [x(p[0]), y(p[3])])) + pathOf(pts.slice().reverse().map(p => [x(p[0]), y(p[2])])).replace('M', 'L') + 'Z', style: `fill:${MC[md]};opacity:.13` }, g);
    anim(el('path', { d: pathOf(pts.map(p => [x(p[0]), y(p[1])])), pathLength: 1, style: `stroke:${MC[md]};stroke-width:2.6;fill:none;stroke-linejoin:round;${DASH[md]}` }, g), md === 'segment' ? 'a-fade' : 'a-draw', .25 + .25 * i);
    pts.forEach((p, j) => {
      if (p[0] > 40 && p[0] % 10) return;   // thin the K = 45–150 grid for hover targets
      if (p[0] < 5 && p[0] !== 1) return;
      const c = anim(el('circle', { cx: x(p[0]), cy: y(p[1]), r: 2.8, style: `fill:${MC[md]};stroke:var(--paper);stroke-width:1` }, g), 'a-pop', .9 + .3 * spread(j));
      hover(c, () => fmt(t('ptTip'), { yard: t(fYard), m: t(md), k: p[0], v: p[1].toFixed(1), lo: p[2].toFixed(0), hi: p[3].toFixed(0) }));
    });
  });
  el('text', { x: W - m.r - 8, y: y(lo) + 17, 'text-anchor': 'end', style: 'fill:var(--oxide);font-weight:600' }, s, `${t('floor')} = ${f0(lo)}`);
  const last = C.free[C.free.length - 1][0];
  if (last > yTop) {   // label where the free-flow line leaves the frame, on its left
    const j = C.free.findIndex(v => v[0] > yTop), kx = C.K[j - 1] + (yTop - C.free[j - 1][0]) * (C.K[j] - C.K[j - 1]) / (C.free[j][0] - C.free[j - 1][0]);
    el('text', { x: x(kx) - 22, y: m.t + 14, 'text-anchor': 'end', style: 'fill:var(--steel);font-weight:600;font-size:12px' }, s, fmt(t('freeOut'), { v: f0(last) }));
  }
  swatches('lgFlag', [[MC.free, t('free')], [MC.reserve, t('reserve')], [MC.segment, t('segment')], ['var(--good-soft)', t('band'), 'border:1px solid var(--good)'], ['var(--good)', t('t1tLg'), 'height:2px;border:0']]);
  const stat = (num, p) => `<div class="stat"><span class="num">${num}</span><p>${p}</p></div>`;
  const [ks, ka, kb] = F.Kstar20;
  $('flagRead').innerHTML =
    stat(`[${f0(lo)}, ${f0(hi)}]`, fmt(t('rdInt'), { a: f0(F.T1t[1]), b: f0(F.T1t[2]) }))
    + stat(`${Math.round(100 * lo / hi)}%`, t('rdShare'))
    + stat(`${f0(F.plateau.segment)}<small>${Math.round(100 * F.plateau.segment / hi)}%</small>`, t('rdSeg'))
    + stat(`K ≈ ${ks}`, fmt(t('rdKstar'), { r: ka !== kb ? fmt(t('rdKr'), { a: ka, b: kb }) : '' }));
  document.querySelectorAll('#flagYard button').forEach(b => b.setAttribute('aria-pressed', b.dataset.v === fYard));
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
    anim(el('text', { x: x(ks) + (i ? -10 : 10), y: y(r) + (i ? 26 : -12), 'text-anchor': i ? 'end' : 'start', style: `fill:${YC[yd]};font-weight:700;font-size:13px` }, s, `${t(yd)} K* ≈ ${ks}`), 'a-fade', 1.5);
  });
  swatches('lgMarg', [[YC.yupu, t('yupu')], [YC.yantai, t('yantai')], ['var(--oxide)', t('theta'), 'height:2px;border:0']]);
}

// ---------- H1: work-zone preview (Okpo) ----------
function drawZone() {
  const Z = D.zone, ks = D.flag.yupu.Kstar20[0];
  const W = 560, H = fitH('cZone', W, 380), m = { l: 52, r: 16, t: 14, b: 46 };
  const s = frame('cZone', W, H, t('zoneLbl'));
  const x = lin(0, 800, m.l, W - m.r), y = lin(0, 165, H - m.b, m.t);
  el('rect', { x: x(300), y: m.t, width: x(600) - x(300), height: H - m.b - m.t, style: 'fill:var(--steel-soft);opacity:.75' }, s);
  el('rect', { x: m.l, y: y(40), width: W - m.l - m.r, height: y(30) - y(40), style: 'fill:var(--amber-soft)' }, s);
  axes(s, x, y, range(0, 800, 100), range(0, 150, 25), W, H, m);
  el('text', { x: (m.l + W - m.r) / 2, y: H - 6, 'text-anchor': 'middle' }, s, t('zoneX'));
  yTitle(s, 14, (m.t + H - m.b) / 2, t('zoneY'));
  el('text', { x: x(450), y: m.t + 14, 'text-anchor': 'middle', style: 'fill:var(--steel);font-weight:600;font-size:12.5px' }, s, t('zoneYard'));
  el('text', { x: m.l + 8, y: y(35) + 4, style: 'fill:var(--amber);font-weight:600;font-size:12.5px' }, s, t('zoneFleet'));
  el('path', { d: `M${m.l} ${y(ks)}H${W - m.r}`, style: 'stroke:var(--ink2);stroke-width:1.4;stroke-dasharray:6 4' }, s);
  el('text', { x: m.l + 8, y: y(ks) - 6, style: 'fill:var(--ink);font-weight:600;font-size:12.5px' }, s, fmt(t('zoneK'), { k: ks }));
  [97, 194].forEach(d => el('path', { d: `M${x(d)} ${H - m.b}V${y(17)}`, style: 'stroke:var(--ink3);stroke-width:1.2;stroke-dasharray:2 3' }, s));
  el('text', { x: x(145), y: y(19), 'text-anchor': 'middle', style: 'fill:var(--ink3);font-size:12px' }, s, t('zoneSub'));
  el('text', { x: m.l + 8, y: m.t + 14, style: 'fill:var(--ink3);font-size:12px;font-style:italic' }, s, t('zonePrev'));
  const g = clipTo(s, 'clipZone', m, W, H);
  MODELS.forEach((md, i) => {
    const pts = Z.D.map((d, j) => [d, Z[md][j]]).filter(p => p[1] != null);
    anim(el('path', { d: pathOf(pts.map(([d, k]) => [x(d), y(k)])), pathLength: 1, style: `stroke:${MC[md]};stroke-width:2.6;fill:none;stroke-linejoin:round;${DASH[md]}` }, g), md === 'segment' ? 'a-fade' : 'a-draw', .3 + .25 * i);
    pts.forEach(([d, k], j) => {
      const c = anim(el('circle', { cx: x(d), cy: y(k), r: 2.8, style: `fill:${MC[md]};stroke:var(--paper);stroke-width:1` }, g), 'a-pop', .9 + .3 * spread(j));
      hover(c, () => fmt(t('zoneTip'), { m: t(md), d, k }));
    });
    if (pts.length < Z.D.length) {   // beyond K = 150
      const [d, k] = pts[pts.length - 1];
      el('path', { d: `M${x(d)} ${y(k) - 4}L${x(d) + 14} ${m.t + 6}M${x(d) + 7} ${m.t + 8}L${x(d) + 14} ${m.t + 6}L${x(d) + 15} ${m.t + 14}`, style: `stroke:${MC[md]};stroke-width:2;fill:none` }, s);
      el('text', { x: x(d) + 20, y: m.t + 30, style: `fill:${MC[md]};font-weight:700;font-size:12.5px` }, s, t('zoneOut'));
    }
  });
  swatches('lgZone', [[MC.free, t('free')], [MC.reserve, t('reserve')], [MC.segment, t('segShort')], ['var(--amber-soft)', t('zoneFleet')], ['var(--steel-soft)', t('zoneYard')]]);
}

// ---------- external anchors: tasks per vehicle-day ----------
function drawProd() {
  const P = D.prod, A = Object.fromEntries(D.anchors.map(([k, n, v]) => [k, n / v]));
  const rows = [['pYim', A.yim, 'var(--amber-hi)'], ['pShen', A.shen, 'var(--amber-hi)'], ['pHeo', A.heo, 'var(--amber-hi)'],
    ['pFree', P.free, MC.free], ['pSeg', P.segment, MC.segment], ['pRes', P.reserve, MC.reserve]];
  const W = 560, H = fitH('cProd', W, 360), m = { l: 236, r: 40, t: 34, b: 40 };
  const s = frame('cProd', W, H, t('prodLbl'));
  const x = lin(0, 28, m.l, W - m.r), band = (H - m.t - m.b) / (rows.length + 0.6), bh = Math.min(26, band * 0.62);
  axes(s, x, v => v, range(0, 28, 4), [], W, H, m);
  range(4, 28, 4).forEach(v => el('line', { x1: x(v), x2: x(v), y1: m.t, y2: H - m.b, style: 'stroke:var(--line)' }, s));
  el('text', { x: (m.l + W - m.r) / 2, y: H - 6, 'text-anchor': 'middle' }, s, t('prodX'));
  rows.forEach(([k, v, c], i) => {
    const yy = m.t + band * (i + 0.5 + (i >= 3 ? 0.6 : 0));
    el('text', { x: m.l - 8, y: yy + 4, 'text-anchor': 'end', style: `fill:var(--ink);font-size:12.5px;${i >= 3 ? 'font-weight:600' : ''}` }, s, t(k));
    const r = anim(el('rect', { x: m.l, y: yy - bh / 2, width: x(v) - m.l, height: bh, rx: 2, style: `fill:${c};${k === 'pSeg' ? 'opacity:.75' : ''}` }, s), 'a-x', .3 + .08 * i);
    hover(r, () => `${t(k)}: ${v.toFixed(1)}`);
    el('text', { x: x(v) + 6, y: yy + 4, style: 'fill:var(--ink);font-weight:600;font-family:var(--mono)' }, s, v.toFixed(1));
  });
  el('text', { x: 4, y: m.t - 10, style: 'fill:var(--amber);font-size:12px;font-weight:600' }, s, t('pField'));
  el('text', { x: 4, y: m.t + band * 3.6 - 2, style: 'fill:var(--steel);font-size:12px;font-weight:600' }, s, t('pModel'));
  el('path', { d: `M${x(D.Hc)} ${m.t - 4}V${H - m.b}`, style: 'stroke:var(--ink);stroke-width:1.5;stroke-dasharray:5 4' }, s);
  el('text', { x: x(D.Hc) - 4, y: m.t - 10, 'text-anchor': 'end', style: 'fill:var(--ink);font-weight:600;font-size:12px' }, s, fmt(t('pHc'), { v: D.Hc.toFixed(1) }));
  swatches('lgProd', [['var(--amber-hi)', t('pField')], [MC.free, t('free')], [MC.reserve, t('reserve')], [MC.segment, t('segShort')]]);
}

// ---------- H3: service-time gap against fleet size ----------
function drawGap() {
  const W = 560, H = fitH('cGap', W, 380), m = { l: 52, r: 16, t: 14, b: 46 };
  const s = frame('cGap', W, H, t('gapLbl'));
  const x = lin(0, 40, m.l, W - m.r), y = lin(0, 70, H - m.b, m.t);
  axes(s, x, y, range(0, 40, 5), range(0, 70, 10), W, H, m);
  el('text', { x: (m.l + W - m.r) / 2, y: H - 6, 'text-anchor': 'middle' }, s, t('K'));
  yTitle(s, 14, (m.t + H - m.b) / 2, t('gapY'));
  ['yupu', 'yantai'].forEach((yd, i) => {
    const F = D.flag[yd], fit = range(5, 40, 0.5).map(k => [x(k), y(F.coef * k ** F.alpha)]);
    anim(el('path', { d: pathOf(fit), pathLength: 1, style: `stroke:${YC[yd]};stroke-width:1.6;fill:none;stroke-dasharray:6 4` }, s), 'a-fade', .9 + .2 * i);
    F.gap.forEach(([k, v], j) => {
      const c = anim(el('circle', { cx: x(k), cy: y(v), r: 3.2, style: `fill:${YC[yd]};stroke:var(--paper);stroke-width:1` }, s), 'a-pop', .3 + .5 * spread(j) + .2 * i);
      hover(c, () => fmt(t('gapTip'), { yard: t(yd), k, v: v.toFixed(1) }));
    });
    anim(el('text', { x: x(6), y: y(i ? 60 : 53), style: `fill:${YC[yd]};font-weight:700;font-size:15px` }, s, `${t(yd)} α = ${F.alpha.toFixed(2)}`), 'a-fade', 1.3);
  });
  swatches('lgGap', [[YC.yupu, t('yupu')], [YC.yantai, t('yantai')], ['var(--ink3)', `--- ${t('gapFit')}`, 'opacity:0;width:0;border:0']]);
}

// ---------- H1: density criterion, daily volume / T1' ----------
function drawDen() {
  const Dn = D.density, share = 100 * D.flag.yupu.plateau.reserve / D.flag.yupu.T1t[0];
  const rows = [...Dn.yantai.map(([d, v]) => ['yantai', d, v, 'var(--amber)']), ...Dn.yupu.map(([d, v]) => ['yupu', d, v, d < 300 ? 'var(--ink3)' : 'var(--steel)'])];
  const W = 560, H = fitH('cDen', W, 380), m = { l: 150, r: 40, t: 30, b: 40 };
  const s = frame('cDen', W, H, t('denLbl'));
  const x = lin(0, 40, m.l, W - m.r), gap = 0.7, band = (H - m.t - m.b) / (rows.length + 2 * gap), bh = Math.min(24, band * 0.62);
  axes(s, x, v => v, range(0, 40, 10), [], W, H, m, v => v + '%');
  range(10, 40, 10).forEach(v => el('line', { x1: x(v), x2: x(v), y1: m.t, y2: H - m.b, style: 'stroke:var(--line)' }, s));
  el('text', { x: (m.l + W - m.r) / 2, y: H - 6, 'text-anchor': 'middle' }, s, t('denX'));
  let yy = m.t, prev = null;
  rows.forEach(([yd, d, v, c], i) => {
    const grp = yd === 'yantai' ? 'denYt' : d < 300 ? 'denSub' : 'denWy';
    if (grp !== prev) { if (prev) yy += band * gap; el('text', { x: m.l + 4, y: yy + band * 0.5 - bh / 2 - 4, style: `fill:${c};font-size:12px;font-weight:600` }, s, t(grp)); prev = grp; }
    const cy = yy + band * 0.5 + 6;
    el('text', { x: m.l - 8, y: cy + 4, 'text-anchor': 'end', style: 'fill:var(--ink);font-size:12.5px' }, s, fmt(t('denRow'), { yard: t(yd), d }));
    const r = anim(el('rect', { x: m.l, y: cy - bh / 2, width: Math.max(1, x(v) - m.l), height: bh, rx: 2, style: `fill:${c}` }, s), 'a-x', .3 + .08 * i);
    hover(r, () => `${fmt(t('denRow'), { yard: t(yd), d })}: ${v.toFixed(1)}%`);
    const inside = v > 25;   // long bars carry their value inside, clear of the plateau line
    el('text', { x: inside ? x(v) - 6 : x(v) + 6, y: cy + 4, 'text-anchor': inside ? 'end' : 'start', style: `fill:${inside ? 'var(--paper)' : 'var(--ink)'};font-weight:600;font-family:var(--mono)` }, s, v.toFixed(1) + '%');
    yy += band;
  });
  el('path', { d: `M${x(share)} ${m.t - 6}V${H - m.b}`, style: 'stroke:var(--oxide);stroke-width:1.6;stroke-dasharray:6 4' }, s);
  el('text', { x: x(share) + 4, y: m.t - 12, 'text-anchor': 'end', style: 'fill:var(--oxide);font-weight:600;font-size:12px' }, s, fmt(t('denLine'), { v: Math.round(share) }));
  swatches('lgDen', [['var(--amber)', t('denYt')], ['var(--ink3)', t('denSub')], ['var(--steel)', t('denWy')], ['var(--oxide)', fmt(t('denLine'), { v: Math.round(share) }), 'height:2px;border:0']]);
}

// ---------- tables filled from the data ----------
function fillTables() {
  const Y = ['yupu', 'yantai'], F = D.flag;
  const row = (k, f) => `<tr><td>${t(k)}</td>${Y.map(y => `<td class="mono">${f(F[y], y)}</td>`).join('')}</tr>`;
  $('topoTbl').innerHTML = `<thead><tr><th></th>${Y.map(y => `<th>${t(y)}</th>`).join('')}</tr></thead><tbody>` + [
    row('tRoads', f => `${f.topo.roads} / ${f.topo.km}`), row('tJun', f => f.topo.junction_res),
    row('tStops', f => f.topo.stops), row('tDem', f => `${f.demand.regular} / ${f.demand.peak}`),
    `<tr><td>${t('tBind')}</td>${Y.map(y => `<td style="font-family:var(--body)">${t(y === 'yupu' ? 'bindY' : 'bindT')}</td>`).join('')}</tr>`,
  ].join('') + '</tbody>';
  const P = D.preview, out = fmt(t('pvOut'), { v: P.res150 });
  $('prevTbl').innerHTML = `<thead><tr><th>${t('pvD')}</th><th class="c">${t('free')}</th><th class="c">${t('pvSeg')}</th><th class="c">${t('reserve')}</th></tr></thead><tbody>`
    + P.D.map((d, i) => `<tr class="${d === 194 ? 'sub' : d === 600 ? 'hi' : ''}"><td>${d}${d === 194 ? `<span class="tiny">${t('pvSub')}</span>` : ''}</td>`
      + `<td class="mono c">${cell(P.free[i])}</td><td class="mono c refcol">${cell(P.segment[i])}</td><td class="mono c">${cell(P.reserve[i]) || out}</td></tr>`).join('') + '</tbody>';
  const ratio = (r, f) => { const a = (r[0] / f[1]).toFixed(1), b = (r[1] / f[1]).toFixed(1); return a === b ? a : `${a}–${b}`; };
  $('ratioTbl').innerHTML = `<thead><tr><th>${t('rtD')}</th><th class="c">${t('free')}</th><th class="c">${t('reserve')}</th><th class="c">${t('rtRatio')}</th></tr></thead><tbody>`
    + P.D.map((d, i) => P.reserve[i] && `<tr class="${d === 600 ? 'hi' : ''}"><td>${d}</td><td class="mono c">${cell(P.free[i])}</td><td class="mono c">${cell(P.reserve[i])}</td><td class="mono c"><b>${ratio(P.reserve[i], P.free[i])}</b></td></tr>`).filter(Boolean).join('') + '</tbody>';
}

function init() {
  $('flagYard').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { fYard = b.dataset.v; drawFlag(); } });
}

Deck.start({
  strings: T,
  sections: { intro: ['导读', 'Overview', '개요'], exp: ['立旗实验', 'Flag experiment', '깃발 실험'], c1: ['运力区间 C1、C2', 'Capacity interval C1, C2', '운송 능력 구간 C1, C2'],
    h1: ['路网约束区 H1', 'Network-bound regime H1', '도로망 제약 구간 H1'], anchor: ['外部锚点', 'External anchors', '외부 기준점'], h3: ['自由流误差 H3', 'Free-flow error H3', '자유류 오차 H3'],
    status: ['进度与计划', 'Progress and plan', '진행과 계획'], pub: ['论文与期刊', 'Paper and journals', '논문과 학술지'], ref: ['参考文献', 'References', '참고문헌'], end: ['链接', 'Links', '링크'] },
  draw: [drawFlag, drawMarg, drawZone, drawProd, drawGap, drawDen, fillTables],
  init,
});
})();
