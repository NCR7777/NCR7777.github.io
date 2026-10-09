// Multi-yard deck (thesis chapter 6, C5 / H6): the strings and charts of this briefing.
// Paging, language, notes, contents, glossary, layout and the PDF link come from ../shared/deck-core.js (README.md).
(() => {
'use strict';
const D = window.DATA, Y = D.yards;
const { LI, $, el, frame, fitH, anim, spread, lin, yTitle, swatches, hover, fmt } = Deck;

// ---------- strings used inside charts and tables: [zh, en, ko] ----------
const T = {
  title: ['多船厂检验 · 分项研究', 'Multi-Yard Test', '다수 조선소 검증 · 세부 연구'],
  yupu: ['玉浦', 'Okpo', '옥포'], yantai: ['烟台', 'Yantai', '옌타이'],
  // two-points table
  tMap: ['地图版本（路网同前一版）', 'Map version (same network as the previous one)', '지도 버전 (도로망은 이전 판과 동일)'],
  mapY: ['派生图 rev 1825', 'derived map rev 1825', '파생 지도 rev 1825'], mapT: ['r396', 'r396', 'r396'],
  tNet: ['路网：道路 / 中心线', 'Network: roads / centreline', '도로망: 도로 / 중심선'],
  tT1t: ['T1′（个/日；10 个种子 [最小, 最大]）', 'T1′ (a day; 10 seeds [min, max])', 'T1′ (하루; 시드 10개 [최소, 최대])'],
  tInt: ['运力区间 [预约平台, T1′]', 'Capacity interval [reservation plateau, T1′]', '운송 능력 구간 [예약 평탄, T1′]'],
  tShare: ['预约平台 ÷ T1′', 'Reservation plateau ÷ T1′', '예약 평탄 ÷ T1′'],
  tK: ['K*(20%)（区间）', 'K*(20%) (range)', 'K*(20%) (구간)'],
  tBind: ['T1′ 取紧要素（种子数）', 'Where T1′ binds (seeds)', 'T1′ 구속 요소 (시드 수)'],
  road: ['道路', 'road ', '도로 '],
  bindT: ['建筑014 的两个门 ×{a} · 建筑007 的一个门 ×{b}', "building 014's two doors ×{a} · a door of building 007 ×{b}", '건물014의 두 문 ×{a} · 건물007의 문 하나 ×{b}'],
  tCat: ['类别', 'Type', '유형'], catY: ['坞前单车道型', 'dock-road single-lane', '도크 앞 단일 차로형'], catT: ['门口型', 'door type', '출입문형'],
  tDens: ['日任务量 ÷ T1′', 'Daily tasks ÷ T1′', '하루 작업량 ÷ T1′'],
  densY: ['4 台车子集 {a}–{b}；全厂口径待 T22', '4-transporter subset {a}–{b}; whole-yard caliber awaits T22', '트랜스포터 4대 부분집합 {a}–{b}, 전체 조선소 기준은 T22 대기'],
  densT: ['{a}–{b}（常规–高峰）', '{a}–{b} (regular–peak)', '{a}–{b} (평상–피크)'],
  // topology table
  tRoads: ['道路 / 中心线', 'Roads / centreline', '도로 / 중심선'], tJun: ['路口资源 / 入口 / 停靠点', 'Junctions / entrances / stops', '교차로 / 출입구 / 정차 지점'],
  tCyc: ['独立环路 μ / meshedness α', 'Independent cycles μ / meshedness α', '독립 순환 μ / meshedness α'],
  tCut: ['坞向瓶颈断面（路宽之和）', 'Dock-bound minimum cut (sum of widths)', '도크 방향 최소 절단 (도로 폭 합)'],
  tEntry: ['坞口入口度（最大）', 'Dock entry degree (max)', '도크 입구 차수 (최대)'],
  oT1t: ['→ T1′（个/日）', '→ T1′ (a day)', '→ T1′ (하루)'], oBind: ['→ 取紧要素', '→ binding element', '→ 구속 요소'],
  oK: ['→ K*(20%)', '→ K*(20%)', '→ K*(20%)'], oPlat: ['→ 预约平台（个/日）', '→ reservation plateau (a day)', '→ 예약 평탄 (하루)'],
  // density chart
  dLbl: ['日任务量与路网上界之比', 'Daily tasks as a share of the network bound', '하루 작업량과 도로망 상한의 비'],
  dX: ['日任务量 ÷ T1′', 'Daily tasks ÷ T1′', '하루 작업량 ÷ T1′'],
  dYr: ['烟台 · 常规 {d}/日', 'Yantai · regular {d}/day', '옌타이 · 평상 {d}/일'], dYp: ['烟台 · 高峰 {d}/日', 'Yantai · peak {d}/day', '옌타이 · 피크 {d}/일'],
  dOr: ['玉浦 · 子集 {d}/日', 'Okpo · subset {d}/day', '옥포 · 부분집합 {d}/일'], dOp: ['玉浦 · 子集 {d}/日', 'Okpo · subset {d}/day', '옥포 · 부분집합 {d}/일'],
  dOw: ['全厂公开量级 {a}–{b}/日', 'Whole-yard scale {a}–{b}/day', '전체 조선소 공개 규모 {a}–{b}/일'],
  dSub: ['4 台车子集（Yim 2008），仅作对照', '4-transporter subset (Yim 2008), comparison only', '트랜스포터 4대 부분집합 (Yim 2008), 비교용'],
  dWhole: ['韩国大型厂公开量级，非玉浦本厂；玉浦口径待 T22', 'public scale of large Korean yards, not Okpo itself; Okpo awaits T22', '한국 대형 조선소 공개 규모, 옥포 자체 아님, 옥포 기준은 T22 대기'],
  dTip: ['{n}：{d} 个/日 ÷ T1′ {t} = {v}', '{n}: {d} a day ÷ T1′ {t} = {v}', '{n}: 하루 {d}건 ÷ T1′ {t} = {v}'],
  // LOO chart
  lLbl: ['路网上界与预约平台', 'Network bound against reservation plateau', '도로망 상한과 예약 평탄 구간'],
  lX: ['T1′ 路网上界（个/日）', 'T1′ network bound (a day)', 'T1′ 도로망 상한 (하루)'], lY: ['预约平台（个/日）', 'Reservation plateau (a day)', '예약 평탄 (하루)'],
  lEq: ['平台 = T1′：上界取紧', 'plateau = T1′: the bound binds', '평탄 = T1′: 상한이 구속'],
  lRatio: ['{y}的比例 {r}', '{y} ratio {r}', '{y} 비율 {r}'],
  lOne: ['烟台 · 单门设定（r383）', 'Yantai, one door (r383)', '옌타이 · 문 하나 (r383)'],
  lDoor: ['补上第二个门', 'second door added', '두 번째 문 추가'],
  lPred: ['留一法预测', 'leave-one-out prediction', '하나 빼기 예측'],
  lTip: ['{y}：T1′ {t}，平台 {p}，比例 {r}', '{y}: T1′ {t}, plateau {p}, ratio {r}', '{y}: T1′ {t}, 평탄 {p}, 비율 {r}'],
  lTipP: ['用{o}的比例预测{y}：{p}（实际 {a}，{e}）', '{y} predicted from the {o} ratio: {p} (actual {a}, {e})', '{o} 비율로 예측한 {y}: {p} (실제 {a}, {e})'],
  lTip1: ['单门设定：T1′ {t}，平台 {p}，比例 {r}', 'one-door setting: T1′ {t}, plateau {p}, ratio {r}', '문 하나 설정: T1′ {t}, 평탄 {p}, 비율 {r}'],
  sShare: ['预约平台 ÷ T1′：玉浦 / 烟台', 'Reservation plateau ÷ T1′: Okpo / Yantai', '예약 평탄 ÷ T1′: 옥포 / 옌타이'],
  sErr: ['用一厂的比例预测另一厂平台的误差（两点留一法）', 'Error when one yard\'s ratio predicts the other\'s plateau (two-point leave-one-out)', '한 조선소의 비율로 다른 조선소 평탄을 예측한 오차 (두 점 하나 빼기)'],
  sDoor: ['烟台补上建筑014 第二个门前后：T1′ {a} → {b}，平台 {c} → {d}', 'Yantai before and after building 014\'s second door: T1′ {a} → {b}, plateau {c} → {d}', '옌타이 건물014 두 번째 문 추가 전후: T1′ {a} → {b}, 평탄 {c} → {d}'],
  // review chart
  rLbl: ['关键要素复核前后的 T1′', 'T1′ before and after the key-element review', '핵심 요소 검토 전후의 T1′'],
  rX: ['T1′（个/日，10 个种子均值）', 'T1′ (a day, mean of 10 seeds)', 'T1′ (하루, 시드 10개 평균)'],
  rYm: ['玉浦 · 主情景', 'Okpo · main mix', '옥포 · 주 시나리오'], rYe: ['玉浦 · 搭载组合（P6 15%）', 'Okpo · erection mix (P6 15%)', '옥포 · 탑재 조합 (P6 15%)'],
  rT: ['烟台 · 主情景', 'Yantai · main mix', '옌타이 · 주 시나리오'],
  rBef: ['复核前：道路161 整段一个资源', 'before: road 161 as one resource', '검토 전: 도로161 전체가 자원 하나'],
  rAft: ['复核后：按停靠点分段闭塞（探针）', 'after: blocks split at its stops (probe)', '검토 후: 정차 지점별 분할 폐색 (탐침)'],
  rBefT: ['复核前：建筑014 一个门（r383）', 'before: building 014 with one door (r383)', '검토 전: 건물014 문 하나 (r383)'],
  rAftT: ['复核后：两个门（r395，与影像相符）', 'after: two doors (r395, as on imagery)', '검토 후: 문 두 개 (r395, 영상과 일치)'],
  rTip: ['{c}：{a} → {b}（{p}）', '{c}: {a} → {b} ({p})', '{c}: {a} → {b} ({p})'],
  before: ['复核前', 'before review', '검토 전'], after: ['复核后', 'after review', '검토 후'],
  // OSM chart
  oLbl: ['OSM 中已有的厂内道路', 'Yard roads already in OSM', 'OSM에 이미 있는 조선소 내 도로'],
  oX: ['OSM 厂内道路（条，2026-10-09）', 'OSM roads inside the yard (count, 9 Oct 2026)', 'OSM 조선소 내 도로 (개, 2026-10-09)'],
  oOkpo: ['玉浦：OSM {a} 条，我们标了 {b} 条', 'Okpo: {a} in OSM, {b} in our map', '옥포: OSM {a}개, 우리 지도 {b}개'],
  oTip: ['{n}：{v} 条', '{n}: {v} roads', '{n}: {v}개'],
};
const t = k => T[k][LI[Deck.lang]];
const f0 = v => Math.round(v).toLocaleString('en-US');
const pct = v => (v < 0.1 ? (100 * v).toFixed(1) : Math.round(100 * v)) + '%';
const C = { yupu: 'var(--steel)', yantai: 'var(--amber)' };
// yard names for the OSM chart, keyed by the English names in the yard list
const NAME = {
  'Hanwha Ocean Okpo Shipyard': ['韩华海洋玉浦', 'Hanwha Ocean Okpo', '한화오션 옥포'],
  "Chantiers de l'Atlantique": ['大西洋船厂', "Chantiers de l'Atlantique", '아틀랑티크 조선소'],
  'Meyer Werft, Papenburg': ['迈尔帕彭堡', 'Meyer Werft Papenburg', '마이어 파펜부르크'],
  'Philly Shipyard': ['费城船厂', 'Philly Shipyard', '필리 조선소'],
  'Samsung Heavy Industries, Geoje Shipyard': ['三星重工巨济', 'Samsung Heavy Geoje', '삼성중공업 거제'],
  'Oshima Shipbuilding': ['大岛造船', 'Oshima Shipbuilding', '오시마 조선'],
  'Namura Shipbuilding, Imari Works': ['名村伊万里', 'Namura Imari', '나무라 이마리'],
  'HD Hyundai Samho Heavy Industries': ['现代三湖', 'HD Hyundai Samho', 'HD현대삼호'],
};
const nm = k => NAME[k][LI[Deck.lang]];
function niceStep(top) { const p = 10 ** Math.floor(Math.log10(top)); return [1, 2, 2.5, 5, 10].map(k => k * p).find(s => top / s <= 6); }
const range = (a, b, st) => { const r = []; for (let v = a; v <= b + 1e-9; v += st) r.push(+v.toFixed(6)); return r; };
const txt = (s, x, y, str, style = '', anchor = 'start') => el('text', { x, y, 'text-anchor': anchor, style }, s, str);
const HALO = ';paint-order:stroke;stroke:var(--paper);stroke-width:4px;stroke-linejoin:round';

// ---------- daily tasks against T1′ (H1's density criterion), both yards ----------
function drawDensity() {
  const W = 470, H = fitH('cDens', W, 330, 0.8, 1.4), m = { l: 178, r: 54, t: 8, b: 40 };
  const s = frame('cDens', W, H, t('dLbl'));
  const x = lin(0, 0.4, m.l, W - m.r);
  const ty = Y.yupu.T1t[0], tt = Y.yantai.T1t[0], [w0, w1] = D.wholeYard;
  const rows = [
    { k: 'dYr', d: Y.yantai.demand[0], tb: tt, c: C.yantai, n: t('yantai') },
    { k: 'dYp', d: Y.yantai.demand[1], tb: tt, c: C.yantai, n: t('yantai') },
    { k: 'dOr', d: Y.yupu.demand[0], tb: ty, c: C.yupu, n: t('yupu'), sub: 1 },
    { k: 'dOp', d: Y.yupu.demand[1], tb: ty, c: C.yupu, n: t('yupu'), sub: 1 },
    { k: 'dOw', d: [w0, w1], tb: ty, c: C.yupu, n: t('yupu'), whole: 1 },
  ];
  const band = (H - m.t - m.b) / rows.length, bh = Math.min(22, band * 0.5);
  const g = el('g', { class: 'grid' }, s);
  range(0, 0.4, 0.1).forEach(v => { el('line', { x1: x(v), x2: x(v), y1: m.t, y2: H - m.b }, g); txt(s, x(v), H - m.b + 16, Math.round(100 * v) + '%', '', 'middle'); });
  txt(s, (m.l + W - m.r) / 2, H - 6, t('dX'), '', 'middle');
  rows.forEach((r, i) => {
    const cy = m.t + band * (i + 0.5), lo = (r.whole ? r.d[0] : r.d) / r.tb, hi = (r.whole ? r.d[1] : r.d) / r.tb;
    txt(s, m.l - 8, cy + 4, r.whole ? fmt(t(r.k), { a: r.d[0], b: r.d[1] }) : fmt(t(r.k), { d: r.d }), 'fill:var(--ink)', 'end');
    const x0 = r.whole ? x(lo) : x(0);
    const bar = anim(el('rect', { x: x0, y: cy - bh / 2, width: Math.max(2, x(hi) - x0), height: bh, rx: 2,
      style: r.whole ? `fill:url(#hatch);stroke:${r.c};stroke-width:1.4;stroke-dasharray:4 3` : `fill:${r.c};opacity:${r.sub ? 0.45 : 0.9}` }, s), 'a-fade', 0.2 + 0.12 * i);
    txt(s, x(hi) + 6, cy + 4, r.whole ? `${pct(lo)}–${pct(hi)}` : pct(hi), `fill:${r.c};font-weight:600`);
    hover(bar, () => r.whole ? `${fmt(t(r.k), { a: r.d[0], b: r.d[1] })}<br>${t('dWhole')}` : fmt(t('dTip'), { n: r.n, d: r.d, t: f0(r.tb), v: pct(hi) }) + (r.sub ? `<br>${t('dSub')}` : ''));
  });
  el('path', { d: `M${m.l} ${m.t}V${H - m.b}`, style: 'stroke:var(--ink3)' }, s);
  swatches('lgDens', [[C.yantai, t('yantai')], [C.yupu, `${t('yupu')} · ${t('dSub')}`, 'opacity:.45'], ['url(#hatch)', t('dWhole'), 'border:1px dashed var(--steel);background:repeating-linear-gradient(45deg,transparent 0 3px,var(--ink3) 3px 4px)']]);
}

// ---------- leave-one-out on two yards: T1′ against the reservation plateau ----------
function drawLoo() {
  const W = 620, H = fitH('cLoo', W, 400), m = { l: 62, r: 18, t: 14, b: 46 };
  const s = frame('cLoo', W, H, t('lLbl'));
  const x = lin(0, 2000, m.l, W - m.r), y = lin(0, 800, H - m.b, m.t);
  const g = el('g', { class: 'grid' }, s), a = el('g', { class: 'axis' }, s);
  range(0, 800, 200).forEach(v => { el('line', { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v) }, g); txt(s, m.l - 8, y(v) + 4, f0(v), '', 'end'); });
  range(0, 2000, 500).forEach(v => txt(s, x(v), H - m.b + 17, f0(v), '', 'middle'));
  el('path', { d: `M${m.l} ${m.t}V${H - m.b}H${W - m.r}` }, a);
  txt(s, (m.l + W - m.r) / 2, H - 6, t('lX'), '', 'middle');
  yTitle(s, 14, (m.t + H - m.b) / 2, t('lY'));
  const clip = 'clipLoo';
  el('rect', { x: m.l, y: m.t, width: W - m.l - m.r, height: H - m.t - m.b }, el('clipPath', { id: clip }, el('defs', {}, s)));
  const cg = el('g', { 'clip-path': `url(#${clip})` }, s);
  // plateau = T1′ (the bound binds): the upper edge of the capacity interval
  el('path', { d: `M${x(0)} ${y(0)}L${x(800)} ${y(800)}`, style: 'stroke:var(--oxide);stroke-width:1.4;stroke-dasharray:2 4;fill:none' }, cg);
  txt(s, x(640) + 8, y(640) + 4, t('lEq'), 'fill:var(--oxide);font-size:12.5px' + HALO);
  // each yard's ratio as a ray from the origin
  ['yupu', 'yantai'].forEach((yd, i) => {
    const r = D.loo[yd].ratio;
    anim(el('path', { d: `M${x(0)} ${y(0)}L${x(2000)} ${y(2000 * r)}`, pathLength: 1, style: `stroke:${C[yd]};stroke-width:1.6;stroke-dasharray:7 5;fill:none;opacity:.8` }, cg), 'a-draw', 0.2 + 0.2 * i);
  });
  const ry = y(1900 * D.loo.yupu.ratio);
  txt(s, x(1990), ry - 32, fmt(t('lRatio'), { y: t('yupu'), r: pct(D.loo.yupu.ratio) }), `fill:${C.yupu};font-weight:600;font-size:12.5px`, 'end');
  txt(s, x(1990), ry - 14, fmt(t('lRatio'), { y: t('yantai'), r: pct(D.loo.yantai.ratio) }), `fill:${C.yantai};font-weight:600;font-size:12.5px`, 'end');
  // Yantai with one door at building 014, and the move once the second door is in
  const one = Y.yantai.oneDoor, yt = Y.yantai;
  const p1 = [x(one.T1t), y(one.plateau)], p2 = [x(yt.T1t[0]), y(yt.plateau.reserve)];
  anim(el('path', { d: `M${p1[0] + 9} ${p1[1]}L${p2[0] - 12} ${p2[1]}`, style: 'stroke:var(--amber);stroke-width:1.4;fill:none;marker-end:url(#arLoo)' }, s), 'a-fade', 1.1);
  const mk = el('marker', { id: 'arLoo', viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, el('defs', {}, s));
  el('path', { d: 'M0 0L10 5L0 10Z', style: 'fill:var(--amber)' }, mk);
  txt(s, (p1[0] + p2[0]) / 2 + 10, p1[1] - 12, t('lDoor'), 'fill:var(--amber);font-size:12.5px' + HALO, 'middle');
  const c1 = anim(el('circle', { cx: p1[0], cy: p1[1], r: 6, style: 'fill:var(--paper);stroke:var(--amber);stroke-width:2' }, s), 'a-pop', 0.9);
  txt(s, p1[0] + 4, p1[1] + 24, t('lOne'), 'fill:var(--ink2);font-size:12.5px' + HALO, 'middle');
  hover(c1, () => fmt(t('lTip1'), { t: f0(one.T1t), p: f0(one.plateau), r: pct(one.plateau / one.T1t) }));
  // the two yards and their leave-one-out predictions
  [['yupu', 'yantai'], ['yantai', 'yupu']].forEach(([yd, other], i) => {
    const v = Y[yd], L = D.loo[yd], cx = x(v.T1t[0]);
    const pd = anim(el('path', { d: `M${cx} ${y(L.pred) - 9}L${cx + 9} ${y(L.pred)}L${cx} ${y(L.pred) + 9}L${cx - 9} ${y(L.pred)}Z`, style: `fill:none;stroke:var(--ink);stroke-width:1.4` }, s), 'a-pop', 1.3 + 0.1 * i);
    hover(pd, () => fmt(t('lTipP'), { y: t(yd), o: t(other), p: f0(L.pred), a: f0(v.plateau.reserve), e: (L.err > 0 ? '+' : '') + (100 * L.err).toFixed(1) + '%' }));
    const c = anim(el('circle', { cx, cy: y(v.plateau.reserve), r: 6.5, style: `fill:${C[yd]};stroke:var(--paper);stroke-width:1.5` }, s), 'a-pop', 0.9 + 0.2 * i);
    hover(c, () => fmt(t('lTip'), { y: t(yd), t: f0(v.T1t[0]), p: f0(v.plateau.reserve), r: pct(L.ratio) }));
    txt(s, cx + 12, y(v.plateau.reserve) + 24, t(yd), `fill:${C[yd]};font-weight:700;font-size:14px` + HALO);
  });
  swatches('lgLoo', [[C.yupu, t('yupu')], [C.yantai, t('yantai')], ['transparent', `◇ ${t('lPred')}`, 'width:0;border:0'], ['transparent', `○ ${t('lOne')}`, 'width:0;border:0']]);
  $('looRead').innerHTML = [
    [`${pct(D.loo.yupu.ratio)}<small>/ ${pct(D.loo.yantai.ratio)}</small>`, t('sShare')],
    [`±${(100 * Math.max(Math.abs(D.loo.yupu.err), Math.abs(D.loo.yantai.err))).toFixed(1)}%`, t('sErr')],
    [`${pct(one.plateau / one.T1t)} → ${pct(D.loo.yantai.ratio)}`, fmt(t('sDoor'), { a: f0(one.T1t), b: f0(yt.T1t[0]), c: f0(one.plateau), d: f0(yt.plateau.reserve) })],
  ].map(([n, p]) => `<div class="stat"><span class="num">${n}</span><p>${p}</p></div>`).join('');
}

// ---------- T1′ before and after the key-element review ----------
function drawReview() {
  const W = 560, H = fitH('cRev', W, 380, 0.85, 1.4), m = { l: 14, r: 64, t: 6, b: 40 };
  const s = frame('cRev', W, H, t('rLbl'));
  const x = lin(0, 2000, m.l, W - m.r);
  const P = D.probe, one = Y.yantai.oneDoor;
  const rows = [
    { k: 'rYm', a: P.main['现模型'], b: P.main.sect, la: 'rBef', lb: 'rAft', c: C.yupu },
    { k: 'rYe', a: P.erection['现模型'], b: P.erection.sect, la: 'rBef', lb: 'rAft', c: C.yupu },
    { k: 'rT', a: one.T1t, b: Y.yantai.T1t[0], la: 'rBefT', lb: 'rAftT', c: C.yantai },
  ];
  const g = el('g', { class: 'grid' }, s);
  range(0, 2000, 500).forEach(v => { el('line', { x1: x(v), x2: x(v), y1: m.t, y2: H - m.b }, g); txt(s, x(v), H - m.b + 16, f0(v), '', 'middle'); });
  txt(s, (m.l + W - m.r) / 2, H - 6, t('rX'), '', 'middle');
  const band = (H - m.t - m.b) / rows.length, bh = 17;
  rows.forEach((r, i) => {
    const top = m.t + band * i + Math.max(0, (band - 98) / 2);
    txt(s, m.l, top + 14, t(r.k), 'fill:var(--ink);font-weight:600;font-size:13.5px');
    const y1 = top + 23, y2 = y1 + bh + 5;
    const b0 = anim(el('rect', { x: x(0), y: y1, width: x(r.a) - x(0), height: bh, rx: 2, style: 'fill:var(--line)' }, s), 'a-fade', 0.2 + 0.1 * i);
    txt(s, x(r.a) + 6, y1 + bh - 3, f0(r.a), 'fill:var(--ink2)');
    const b1 = anim(el('rect', { x: x(0), y: y2, width: x(r.b) - x(0), height: bh, rx: 2, style: `fill:${r.c}` }, s), 'a-fade', 0.6 + 0.12 * i);
    txt(s, x(r.b) + 6, y2 + bh - 3, `${f0(r.b)}  +${Math.round(100 * (r.b / r.a - 1))}%`, `fill:${r.c};font-weight:700`);
    txt(s, x(0) + 2, y2 + bh + 16, t(r.la), 'fill:var(--ink2);font-size:12.5px');
    txt(s, x(0) + 2, y2 + bh + 32, t(r.lb), `fill:${r.c};font-size:12.5px`);
    [b0, b1].forEach(b => hover(b, () => fmt(t('rTip'), { c: t(r.k), a: f0(r.a), b: f0(r.b), p: `+${Math.round(100 * (r.b / r.a - 1))}%` })));
  });
  swatches('lgRev', [['var(--line)', t('before')], [C.yupu, `${t('after')} · ${t('yupu')}`], [C.yantai, `${t('after')} · ${t('yantai')}`]]);
}

// ---------- OSM roads per yard ----------
function drawOsm() {
  const W = 540, H = fitH('cOsm', W, 290, 0.8, 1.3), m = { l: 150, r: 46, t: 6, b: 38 };
  const s = frame('cOsm', W, H, t('oLbl'));
  const rows = Object.entries(D.osm).sort((p, q) => q[1] - p[1]);
  const x = lin(0, 300, m.l, W - m.r), band = (H - m.t - m.b) / rows.length, bh = Math.min(15, band * 0.62);
  const g = el('g', { class: 'grid' }, s);
  range(0, 300, 100).forEach(v => { el('line', { x1: x(v), x2: x(v), y1: m.t, y2: H - m.b }, g); txt(s, x(v), H - m.b + 15, v, '', 'middle'); });
  txt(s, (m.l + W - m.r) / 2, H - 5, t('oX'), '', 'middle');
  rows.forEach(([k, v], i) => {
    const cy = m.t + band * (i + 0.5), ok = k.startsWith('Hanwha');
    txt(s, m.l - 8, cy + 4, nm(k), `fill:var(--ink)${ok ? ';font-weight:700' : ''}`, 'end');
    const b = anim(el('rect', { x: x(0), y: cy - bh / 2, width: Math.max(2, x(v) - x(0)), height: bh, rx: 2, style: `fill:${ok ? 'var(--good)' : 'var(--steel)'}` }, s), 'a-fade', 0.15 + 0.06 * spread(i));
    txt(s, x(v) + 6, cy + 4, v, 'fill:var(--ink2)');
    hover(b, () => fmt(t('oTip'), { n: nm(k), v }));
    if (ok) txt(s, x(v) + 34, cy + 4, fmt(t('oOkpo'), { a: v, b: Y.yupu.topo.roads }), 'fill:var(--good);font-weight:600;font-size:12.5px');
  });
}

// ---------- tables filled from the data ----------
function fillTables() {
  const yards = ['yupu', 'yantai'];
  const head = `<thead><tr><th></th>${yards.map(y => `<th>${t(y)}</th>`).join('')}</tr></thead>`;
  const row = (k, f, cls = 'mono') => `<tr><td>${t(k)}</td>${yards.map(y => `<td class="${cls}">${f(Y[y], y)}</td>`).join('')}</tr>`;
  const bindY = f => f.bind.map(([n, c]) => `${n.replace(/^道路/, t('road')).replace(/（.*$/, '')} ×${c}`).join(' · ');
  const bindT = f => fmt(t('bindT'), { a: f.bind[0][1], b: f.bind[1][1] });
  $('twoTbl').innerHTML = head + '<tbody>' + [
    row('tMap', (f, y) => t(y === 'yupu' ? 'mapY' : 'mapT'), ''),
    row('tNet', f => `${f.topo.roads} / ${f.topo.km.toFixed(1)} km`),
    row('tT1t', f => `${f0(f.T1t[0])} [${f0(f.T1t[1])}, ${f0(f.T1t[2])}]`),
    row('tInt', f => `[${f0(f.plateau.reserve)}, ${f0(f.T1t[0])}]`),
    row('tShare', f => pct(f.plateau.reserve / f.T1t[0])),
    row('tK', f => `${f.Kstar20[0]} (${f.Kstar20[1]}–${f.Kstar20[2]})`),
    row('tBind', (f, y) => y === 'yupu' ? bindY(f) : bindT(f), ''),
    row('tCat', (f, y) => `<b>${t(y === 'yupu' ? 'catY' : 'catT')}</b>`, ''),
    row('tDens', (f, y) => y === 'yupu' ? fmt(t('densY'), { a: pct(f.demand[0] / f.T1t[0]), b: pct(f.demand[1] / f.T1t[0]) }) : fmt(t('densT'), { a: pct(f.demand[0] / f.T1t[0]), b: pct(f.demand[1] / f.T1t[0]) }), ''),
  ].join('') + '</tbody>';
  $('topoTbl').innerHTML = head + '<tbody>' + [
    row('tRoads', f => `${f.topo.roads} / ${f.topo.km.toFixed(1)} km`),
    row('tJun', f => `${f.topo.junction_res} / ${f.topo.access} / ${f.topo.stops}`),
    row('tCyc', f => `${f.topo.cyclomatic} / ${f.topo.meshedness.toFixed(3)}`),
    row('tCut', f => `${f0(f.topo.dock_cut_width_m)} m`),
    row('tEntry', f => f.dockEntry),
  ].join('') + [
    row('oT1t', f => f0(f.T1t[0])),
    row('oBind', (f, y) => t(y === 'yupu' ? 'catY' : 'catT'), ''),
    row('oK', f => f.Kstar20[0]),
    row('oPlat', f => f0(f.plateau.reserve)),
  ].map(r => r.replace('<tr>', '<tr class="out">')).join('') + '</tbody>';
}

Deck.start({
  strings: T,
  sections: { intro: ['导读', 'Overview', '개요'], q: ['问题与定位', 'Question and position', '질문과 위치'], method: ['预测与检验', 'Predictor and test', '예측과 검증'],
    res: ['头两个数据点', 'First two data points', '첫 두 데이터 점'], review: ['关键要素复核', 'Key-element review', '핵심 요소 검토'],
    yards: ['选厂', 'Yard selection', '조선소 선정'], data: ['开源数据', 'Open data', '공개 데이터'], plan: ['计划与进度', 'Plan and status', '계획과 진행'],
    pub: ['发表', 'Publication', '발표'], ref: ['参考文献', 'References', '참고문헌'], end: ['结束', 'Close', '마무리'] },
  draw: [drawDensity, drawLoo, drawReview, drawOsm, fillTables],
});
})();
