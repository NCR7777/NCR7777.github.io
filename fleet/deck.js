// Fleet deck ("Block Transporter Choice"): the strings and charts of this briefing.
// Paging, language, notes, contents, glossary, layout and the PDF link come from ../shared/deck-core.js (README.md).
(() => {
'use strict';
const D = window.DATA;
const { LI, $, el, frame, fitH, anim, spread, lin, yTitle, swatches, hover, fmt } = Deck;

// ---------- strings used inside charts: [zh, en, ko] ----------
const T = {
  title: ['分段运输车选型', 'Block Transporter Choice', '블록 트랜스포터 선정'],
  mx1: ['270 t + 1 台重车', '270 t + 1 heavy', '270 t + 대형 1대'],
  mx2: ['270 t + 2 台重车', '270 t + 2 heavy', '270 t + 대형 2대'],
  M1: ['Jiang 实测', 'Jiang', 'Jiang 실측'],
  M2: ['偏轻', 'Light-skewed', '경량 편중'],
  M3: ['均匀', 'Uniform', '균일'],
  M4: ['特别重', 'Extra heavy', '초중량'],
  M5: ['Roh–Cha', 'Roh–Cha', 'Roh–Cha'],
  M6: ['Liu', 'Liu', 'Liu'],
  H1: ['短', 'short', '짧음'],
  H2: ['随重', 'mass-dep.', '중량비례'],
  H3: ['长', 'long', '긺'],
  H1l: ['短装卸', 'short handling', '짧은 적재·하역'],
  H2l: ['随重量变化的装卸', 'mass-dependent handling', '중량 비례 적재·하역'],
  H3l: ['长装载', 'long loading', '긴 적재'],
  'D-emp': ['常规', 'standard', '기준'],
  'D-tight': ['紧', 'tight', '촉박'],
  'D-empl': ['常规交期', 'standard due dates', '기준 납기'],
  'D-tightl': ['紧交期', 'tight due dates', '촉박한 납기'],
  pX: ['额定载重（t）', 'Rated capacity (t)', '정격 용량 (t)'],
  pY: ['单价（百万元，不含税）', 'Unit price (CNY million, ex VAT)', '단가 (백만 위안, 부가세 제외)'],
  mcny: ['百万元', 'M CNY', '백만 위안'],
  capX: ['吨级（t）', 'Size (t)', '크기 (t)'],
  capY: ['人时 / 天', 'labor-hours / day', '인시 / 일'],
  crew: ['一组人：4 人 × 16 h = 64', 'One crew: 4 × 16 h = 64', '작업 인원: 4명 × 16시간 = 64'],
  capTxt: ['车价与工资之比为 {r} 时，最贵的 550 t 车每天的购车成本为 {v} 人时，仍低于一组人一天的 64 人时。所以少用一台车省下的钱，比把一台车换大一档多花的钱更多。', 'At a vehicle-to-wage ratio of {r}, the dearest unit, 550 t, costs {v} labor-hours a day to buy, still below one crew’s 64 labor-hours a day. So one vehicle fewer saves more than moving up a size costs.', '차량 가격 대 임금 비가 {r}일 때 가장 비싼 550 t의 하루 구매 비용은 {v}인시로, 한 조의 하루 64인시보다 낮다. 따라서 한 대를 덜 쓰면 아끼는 돈이 한 등급 큰 차로 바꾸는 데 드는 돈보다 크다.'],
  work: ['需求 × {k}', 'Demand × {k}', '수요 × {k}'],
  cheapest: ['最省', 'cheapest', '최저'],
  above: ['比最省贵（%）', 'Above the cheapest (%)', '최저 대비 추가 (%)'],
  greedy: ['贪心', 'Greedy', '탐욕'],
  cp0: ['仅构造', 'Constr.', '구성만'],
  single: ['786 次迭代', '786 it.', '786회'],
  final: ['最终', 'Final', '최종'],
  shiftEnd: ['16 h 班次结束', '16-h shift ends', '16시간 교대 종료'],
  gEmpty: ['空驶', 'Empty travel', '공차 주행'],
  gSingle: ['单独搬运', 'Carried alone', '단독 운반'],
  gCoupled: ['拼载搬运（含对接）', 'Coupled (incl. joining)', '결합 운반 (결합 포함)'],
  gWait: ['等队友', 'Waiting for team', '팀원 대기'],
  gLate: ['迟到（红框）', 'Late', '지연 (빨간 테두리)'],
  gTitle: ['{f} × {k} 台', '{f} × {k} vehicles', '{f} × {k}대'],
  gTip: ['分段 #{id} · {m} t · {team}<br>可搬 {r} · 交期 {d} · 完成 {c}', 'Block #{id} · {m} t · {team}<br>ready {r} · due {d} · done {c}', '블록 #{id} · {m} t · {team}<br>준비 {r} · 납기 {d} · 완료 {c}'],
  alone: ['单独运', 'alone', '단독'],
  teamOf: ['{n} 台拼载', '{n} coupled', '{n}대 결합'],
  onTime: ['准时', 'on time', '정시'],
  lateBy: ['晚 {m} min', '{m} min late', '{m}분 지연'],
  hrs: ['时间（h）', 'Hours', '시간 (h)'],
  cVeh: ['台数', 'Vehicles', '대수'],
  cOn: ['当天准时', 'On time that day', '당일 정시'],
  cCoup: ['拼载的分段', 'Blocks coupled', '결합 운반 블록'],
  cWork: ['车辆工作时间（车·时）', 'Vehicle work (vehicle-h)', '차량 작업 시간 (차량·시)'],
  cEmpty: ['· 其中空驶', '· empty travel', '· 그중 공차 주행'],
  cSync: ['· 其中等队友', '· waiting for team', '· 그중 팀원 대기'],
  cLate: ['最晚一块的延误（min）', 'Latest block’s delay (min)', '가장 늦은 블록의 지연 (분)'],
  cP: ['车队价格（折合 270 t 车台数）', 'Fleet price (in 270 t units)', '차량군 가격 (270 t 대수 환산)'],
  cCost: ['每天成本（折合人时）', 'Daily cost (labor-hours)', '하루 비용 (인시 환산)'],
  M1d: ['Jiang et al. (2021) 三组算例的 68 个重量，有放回抽样', '68 masses from the three instances of Jiang et al. (2021), resampled', 'Jiang et al. (2021) 세 인스턴스의 중량 68개 재표본'],
  M2d: ['90% 为 100–300 t（Park &amp; Seo 2012），10% 为 300–500 t（设定）', '90% at 100–300 t (Park &amp; Seo 2012), 10% at 300–500 t (assumed)', '90%는 100–300 t (Park &amp; Seo 2012), 10%는 300–500 t (설정)'],
  M3d: ['100–500 t 均匀（Kweon et al. 2026 公开实例的规则）', 'Uniform 100–500 t (the rule of the public instances of Kweon et al. 2026)', '100–500 t 균일 (Kweon et al. 2026 공개 인스턴스 규칙)'],
  M4d: ['偏轻分布加 10% 的 500–800 t 尾部：有的块超过所有吨级（设定，压力测试）', 'Light-skewed plus a 10% tail at 500–800 t: some blocks exceed every tier (assumed, a stress test)', '경량 편중 + 500–800 t 꼬리 10%: 일부 블록은 모든 등급 초과 (설정, 압력 시험)'],
  M5d: ['Roh &amp; Cha (2011) 表 2 的 10 个分段重量，有放回抽样', 'The ten block masses of Roh &amp; Cha (2011) Table 2, resampled', 'Roh &amp; Cha (2011) 표 2의 블록 중량 10개 재표본'],
  M6d: ['Liu et al. (2022) 一周 50 块分段的重量，有放回抽样', 'The 50 block masses of one week in Liu et al. (2022), resampled', 'Liu et al. (2022) 1주일 블록 50개의 중량 재표본'],
  lateLbl: ['{k} 台（设上限需 {k1} 台）· {n} 块晚到超过 4 h', '{k} units ({k1} with limit) · {n} blocks > 4 h late', '{k}대 (상한 시 {k1}대) · 4시간 초과 {n}개'],
  lateAx: ['30 天里最晚一块的延误（h）', 'Largest delay over 30 days (h)', '30일 중 최대 지연 (h)'],
  capLine: ['120 min 上限', '120-min limit', '120분 상한'],
  e7Ax: ['重分段（350–540 t）占比', 'Share of heavy blocks (350–540 t)', '무거운 블록(350–540 t) 비율'],
  e7Tip: ['重分段占 {p}% · {fleet} · 拼载 {c}%', 'heavy share {p}% · {fleet} · {c}% coupled', '무거운 블록 {p}% · {fleet} · 결합 {c}%'],
  e7Le: ['300 t：重分段都拼载', '300 t: couples every heavy block', '300 t: 무거운 블록 모두 결합'],
  e7Mx: ['270 t 轻车 + 1 或 2 台 550 t', '270 t units + one or two 550 t', '270 t 경형 + 550 t 1–2대'],
  e7Big: ['550 t：每块都单独运', '550 t: carries every block alone', '550 t: 모든 블록 단독 운반'],
  ktTier: ['能单运全部分段', 'carries all alone', '모두 단독 운반'],
  ktNone: ['无车能单运：9% 的块 > 550 t', 'no size carries all: 9% > 550 t', '단독 운반 등급 없음: 9% > 550 t'],
  occX: ['拼载的分段比例（%）', 'Blocks carried by a coupled team (%)', '결합 운반 블록 비율 (%)'],
  occY: ['每天车辆工作时间，比单运车队多（%）', 'Vehicle-hours per day above the single-carry fleet (%)', '하루 차량 시간, 단독 운반 차량군 대비 (%)'],
  occFit: ['每多拼 1 个百分点，车辆时间 +{b}%', '+{b}% vehicle-hours per point coupled', '결합 1%p당 차량 시간 +{b}%'],
  e7Num: ['次比较中，最省车队拼载 ≤ 1/10。例外是轻车配 2 台重车（拼载 19.6%），出现在重分段占 35%、装卸随重量变化、按“一组人开一整个拼载队”计人工时。', 'comparisons where the cheapest fleet couples at most one block in ten. The exception is light units with two heavy units (19.6% coupled), at a 35% heavy share with mass-dependent handling and one crew per coupled team.', '건의 비교에서 최저비용 차량군의 결합은 1/10 이하다. 예외는 경형에 대형 2대를 더한 혼합 (결합 19.6%)으로, 무거운 블록 35%, 중량 비례 적재·하역, 결합 팀당 한 조로 계산할 때 나타난다.'],
  pPw: ['折线拟合', 'Two-segment fit', '꺾은선 적합'],
  pAffMain: ['直线拟合（主）', 'Straight-line fit (main)', '직선 적합 (주)'],
  pRange: ['研究范围 200–550 t', 'studied range 200–550 t', '연구 범위 200–550 t'],
  exFinal: ['本研究方法', 'This study’s method', '본 연구 방법'],
  exSingle: ['只搜索一次', 'A single search run', '탐색 1회'],
  exCp0: ['只做初始排班', 'Initial schedule only', '초기 배차만'],
  exGreedy: ['简单派车规则', 'Simple dispatch rule', '단순 배차 규칙'],
  exEq: ['等于证明的最小台数', 'equals the proven minimum', '증명된 최소 대수와 같음'],
  exP1: ['多 1 台', 'one too many', '1대 많음'],
  exP2: ['多 2 台以上', 'two or more too many', '2대 이상 많음'],
  exNone: ['找不到达标台数', 'no qualifying count', '충족 대수 없음'],
  exX: ['有证明最小台数的 56 个车队', 'The 56 fleets with a proven minimum count', '최소 대수가 증명된 차량군 56개'],
  frY: ['与原 30 天选出同一最省车队的决策（%）', 'Decisions with the same least-cost fleet as on the original days (%)', '원래 30일과 같은 최저비용 차량군인 결정 (%)'],
  frAll: ['全部 1,260 个决策', 'all 1,260 decisions', '전체 1,260개 결정'],
  ktTip: ['{q} t：{v} 台', '{q} t: {v} vehicles', '{q} t: {v}대'],
};
const t = k => T[k][LI[Deck.lang]];

// tier colors as in the figures of the paper
const COL = { 200: '#f0f0f0', 250: '#d9d9d9', 270: '#c6dbef', 300: '#a9c8e1', 325: '#56b4b8', 380: '#4388b5',
  425: '#183a63', 500: '#91679d', 550: '#cc6d24', MX1: '#b9d7bf', MX2: '#42835a' };
const DARK = new Set(['325', '380', '425', '500', '550', 'MX2']);
const FAMS = ['200', '250', '270', '300', '325', '380', '425', '500', '550', 'MX1', 'MX2'];
const famName = f => f === 'MX1' ? t('mx1') : f === 'MX2' ? t('mx2') : f + ' t';
const cellName = c => { const [m, h, d] = c.split('_'); return `${t(m)} · ${t(h + 'l')} · ${t(d + 'l')}`; };

// ---------- charts ----------
const pQ = q => D.affine[0] + D.affine[1] * q;   // CNY million, ex VAT

function drawPrice() {
  const W = 540, H = fitH('cPrice', 540, 380), m = { l: 58, r: 16, t: 14, b: 50 };
  const s = frame('cPrice', W, H, 'Transporter price against capacity');
  const x = lin(0, 650, m.l, W - m.r), y = lin(0, 5, H - m.b, m.t);
  const g = el('g', { class: 'grid' }, s);
  for (let v = 1; v <= 5; v++) el('line', { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v) }, g);
  const ax = el('g', { class: 'axis' }, s);
  el('line', { x1: m.l, x2: W - m.r, y1: y(0), y2: y(0) }, ax);
  for (let v = 0; v <= 600; v += 100) {
    el('line', { x1: x(v), x2: x(v), y1: y(0), y2: y(0) + 5 }, ax);
    el('text', { x: x(v), y: y(0) + 20, 'text-anchor': 'middle' }, s, v);
  }
  for (let v = 0; v <= 5; v++) el('text', { x: m.l - 8, y: y(v) + 4, 'text-anchor': 'end' }, s, v);
  el('text', { x: (m.l + W - m.r) / 2, y: H - 8, 'text-anchor': 'middle' }, s, t('pX'));
  yTitle(s, 14, (m.t + H - m.b) / 2, t('pY'));
  // studied range, the affine (main) and the piecewise fit to all 33 notices, as in Fig. 2(a) of the paper
  el('rect', { x: x(200), y: m.t, width: x(550) - x(200), height: y(0) - m.t, style: 'fill:var(--steel-soft);opacity:.7' }, s);
  el('text', { x: x(375), y: y(0.22), 'text-anchor': 'middle', style: 'font-size:12px;fill:var(--steel)' }, s, t('pRange'));
  const [b0, b1, b2, brk] = D.pcurve.pw, pwQ = q => b0 + b1 * q + b2 * Math.max(0, q - brk);
  anim(el('path', { d: `M${x(90)} ${y(pQ(90))}L${x(600)} ${y(pQ(600))}`, pathLength: 1, style: 'fill:none;stroke:var(--amber);stroke-width:2.5' }, s), 'a-draw', .8);
  anim(el('path', { d: [90, brk, 600].map((q, i) => `${i ? 'L' : 'M'}${x(q)} ${y(pwQ(q))}`).join(''), style: 'fill:none;stroke:var(--ink2);stroke-width:1.8;stroke-dasharray:6 4' }, s), 'a-fade', 1.1);
  anim(el('line', { x1: x(20), x2: x(48), y1: y(4.6), y2: y(4.6), style: 'stroke:var(--amber);stroke-width:2.5' }, s), 'a-fade', 1);
  anim(el('text', { x: x(56), y: y(4.6) + 4, class: 't-strong' }, s, t('pAffMain')), 'a-fade', 1);
  anim(el('line', { x1: x(20), x2: x(48), y1: y(4.2), y2: y(4.2), style: 'stroke:var(--ink2);stroke-width:1.8;stroke-dasharray:6 4' }, s), 'a-fade', 1.1);
  anim(el('text', { x: x(56), y: y(4.2) + 4 }, s, t('pPw')), 'a-fade', 1.1);
  for (const [k, [q, p, n]] of D.price.entries()) {
    const c = el('circle', { cx: x(q), cy: y(p), r: 4.5 + (n - 1) * 1.6, style: 'fill:var(--steel);fill-opacity:.45;stroke:var(--steel);stroke-width:1.2' }, s);
    anim(c, 'a-pop', .25 + .5 * spread(k));
    hover(c, () => `${q} t · ${p.toFixed(2)} ${t('mcny')}${n > 1 ? ` · ×${n}` : ''}`);
  }
}

function drawCap() {
  const r = +$('rCap').value;
  $('rCapV').value = r.toFixed(1);
  const W = 540, H = fitH('cCap', 540, 300), m = { l: 50, r: 12, t: 18, b: 42 };
  const s = frame('cCap', W, H, 'Daily capital cost per tier against crew cost');
  const tiers = [200, 250, 270, 300, 325, 380, 425, 500, 550];
  const vals = tiers.map(q => r * pQ(q) / D.p270);
  const y = lin(0, 72, H - m.b, m.t), band = (W - m.l - m.r) / tiers.length;
  const g = el('g', { class: 'grid' }, s);
  for (const v of [20, 40, 60]) el('line', { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v) }, g);
  for (const v of [0, 20, 40, 60]) el('text', { x: m.l - 8, y: y(v) + 4, 'text-anchor': 'end' }, s, v);
  el('line', { x1: m.l, x2: W - m.r, y1: y(0), y2: y(0), style: 'stroke:var(--ink3)' }, s);
  tiers.forEach((q, i) => {
    const x0 = m.l + i * band + band * 0.17, bw = band * 0.66, v = vals[i];
    anim(el('rect', { x: x0, y: y(v), width: bw, height: y(0) - y(v), style: `fill:${v > 64 ? 'var(--oxide)' : 'var(--steel)'}` }, s), 'a-y', .3 + i * .05);
    anim(el('text', { x: x0 + bw / 2, y: y(v) - 5, 'text-anchor': 'middle', class: 't-strong' }, s, v.toFixed(0)), 'a-fade', .6 + i * .05);
    el('text', { x: x0 + bw / 2, y: y(0) + 17, 'text-anchor': 'middle' }, s, q);
  });
  anim(el('line', { x1: m.l, x2: W - m.r, y1: y(64), y2: y(64), style: 'stroke:var(--oxide);stroke-width:2;stroke-dasharray:7 5' }, s), 'a-fade', 1.1);
  anim(el('text', { x: m.l + 4, y: y(64) - 7, class: 't-ox' }, s, t('crew')), 'a-fade', 1.1);
  el('text', { x: (m.l + W - m.r) / 2, y: H - 4, 'text-anchor': 'middle' }, s, t('capX'));
  yTitle(s, 14, (m.t + H - m.b) / 2, t('capY'));
  $('capTxt').textContent = fmt(t('capTxt'), { r: r.toFixed(1), v: vals[8].toFixed(0) });
}

function drawCase() {
  const r = +$('rCase').value;
  $('rCaseV').value = r.toFixed(1);
  const W = 640, H = fitH('cCase', 640, 430, 0.87), top = 50, rh = Math.max(26, Math.min(44, (H - 86) / 11)), bx = 124, bw = 140, dom = 200;
  const s = frame('cCase', W, H, 'Second yard: cost above the cheapest fleet');
  ['6', '8'].forEach((k, p) => {
    const x0 = p * 328, rows = FAMS.map(f => { const [K, cp] = D.case[k][f]; return { f, K, cost: r * cp + 40 * K }; });
    const best = Math.min(...rows.map(o => o.cost));
    el('text', { x: x0, y: 16, class: 't-title' }, s, fmt(t('work'), { k }));
    el('text', { x: x0 + 104, y: 38, 'text-anchor': 'middle', style: 'font-size:11px;fill:var(--ink3)' }, s, t('cVeh'));
    const g = el('g', { class: 'grid' }, s);
    for (let v = 0; v <= dom; v += 50) {
      el('line', { x1: x0 + bx + v * bw / dom, x2: x0 + bx + v * bw / dom, y1: top - 6, y2: top + rh * 11 }, g);
      el('text', { x: x0 + bx + v * bw / dom, y: top + rh * 11 + 16, 'text-anchor': 'middle', style: 'font-size:11px' }, s, v);
    }
    rows.forEach((o, i) => {
      const y = top + i * rh, pct = 100 * (o.cost / best - 1), win = pct < 1e-9;
      el('text', { x: x0 + 86, y: y + rh / 2 + 4, 'text-anchor': 'end', class: win ? 't-strong' : '' }, s, famName(o.f));
      el('text', { x: x0 + 104, y: y + rh / 2 + 4, 'text-anchor': 'middle', style: 'font-family:var(--mono);font-size:12px' }, s, o.K);
      if (!win) anim(el('rect', { x: x0 + bx, y: y + 6, width: Math.min(pct, dom) * bw / dom, height: rh - 12, fill: COL[o.f], style: 'stroke:var(--ink3);stroke-width:.6' }, s), 'a-x', .3 + i * .04);
      anim(el('text', { x: x0 + bx + (win ? 0 : Math.min(pct, dom) * bw / dom) + 5, y: y + rh / 2 + 4, class: win ? 't-strong' : '', style: win ? 'fill:var(--good)' : 'font-size:11.5px' }, s,
        win ? '★ ' + t('cheapest') : '+' + (pct < 10 ? pct.toFixed(1) : pct.toFixed(0)) + '%'), 'a-fade', .6 + i * .04);
    });
    el('text', { x: x0 + bx + bw / 2, y: H - 4, 'text-anchor': 'middle', style: 'font-size:11.5px' }, s, t('above'));
  });
}



// transporter move in four steps (static sketch)
function drawSpmt() {
  let g;
  const block = (x0, y) => el('rect', { x: x0 + 8, y, width: 134, height: 48, rx: 5, style: 'fill:var(--steel)' }, g);
  const supports = x0 => { for (const dx of [14, 124]) el('rect', { x: x0 + dx, y: 120, width: 12, height: 30, style: 'fill:var(--ink3)' }, g); };
  const vehicle = (x0, py) => {
    el('rect', { x: x0 + 34, y: py, width: 82, height: 8, rx: 2, style: 'fill:var(--amber-hi);stroke:var(--ink);stroke-width:.8' }, g);
    for (let w = 42; w <= 108; w += 13) el('circle', { cx: x0 + w, cy: 145, r: 5, style: 'fill:var(--ink)' }, g);
  };
  const arrow = (x1, y1, x2, y2) => {
    el('line', { x1, y1, x2, y2, style: 'stroke:var(--oxide);stroke-width:2.5' }, g);
    const a = Math.atan2(y2 - y1, x2 - x1), h = 7;
    el('path', { d: `M${x2} ${y2}L${x2 - h * Math.cos(a - .5)} ${y2 - h * Math.sin(a - .5)}L${x2 - h * Math.cos(a + .5)} ${y2 - h * Math.sin(a + .5)}Z`, style: 'fill:var(--oxide)' }, g);
  };
  [0, 163, 326, 489].forEach((x0, i) => {
    g = anim(el('g', {}, $('spmtSteps')), 'a-rise', .3 + i * .25);
    el('line', { x1: x0, x2: x0 + 150, y1: 150, y2: 150, style: 'stroke:var(--ink3)' }, g);
    el('text', { x: x0 + 75, y: 20, 'text-anchor': 'middle', style: 'fill:var(--ink);font:600 16px var(--d-en)' }, g, ['①', '②', '③', '④'][i]);
    if (i === 0) { supports(x0); block(x0, 72); vehicle(x0, 132); arrow(x0 + 4, 136, x0 + 30, 136); }
    if (i === 1) { supports(x0); block(x0, 62); vehicle(x0, 112); arrow(x0 + 75, 50, x0 + 75, 30); }
    if (i === 2) { block(x0, 62); vehicle(x0, 112); arrow(x0 + 110, 40, x0 + 146, 40); arrow(x0 + 4, 40, x0 + 40, 40); }
    if (i === 3) { supports(x0); block(x0, 72); vehicle(x0 + 26, 132); arrow(x0 + 118, 100, x0 + 148, 100); }
  });
}

function drawGantt() {
  const ex = D.example, tk = ex.tasks, W = 780, L = 70;
  const nRows = ex.fleets.reduce((a, f) => a + f.K, 0), fixed = 14 + ex.fleets.length * 26 + 34;
  const rowH = Math.max(15, Math.min(32, (fitH('cGantt', W, fixed + nRows * 19, 0.8, 2) - fixed) / nRows)), H = fixed + nRows * rowH;
  const s = frame('cGantt', W, H, 'Two real timetables for the same day');
  const x = lin(0, 19.5 * 3600, L, W - 8);
  let y0 = 4;
  const hm = v => `${Math.floor(v / 3600)}:${String(Math.round(v % 3600 / 60)).padStart(2, '0')}`;
  ex.fleets.forEach(f => {
    el('text', { x: 0, y: y0 + 14, class: 't-title' }, s, fmt(t('gTitle'), { f: famName(f.fam), k: f.K }));
    y0 += 22;
    f.veh.forEach((seq, k) => {
      const yy = y0 + k * rowH;
      el('text', { x: L - 8, y: yy + rowH / 2 + 4, 'text-anchor': 'end', style: 'font-size:11px;font-family:var(--mono)' }, s, 'V' + (k + 1));
      el('line', { x1: L, x2: W - 8, y1: yy + rowH - 1, y2: yy + rowH - 1, style: 'stroke:var(--line)' }, s);
      let prev = 0;
      for (const [i, a, st, c, n] of seq) {
        const [ms, rel, due] = tk[i], bh = rowH - 6, by = yy + 2;
        const at = v => .25 + 1.6 * v / (19.5 * 3600);
        if (a > prev) anim(el('rect', { x: x(prev), y: by + 3, width: Math.max(.5, x(a) - x(prev)), height: bh - 6, style: 'fill:var(--g-empty)' }, s), 'a-x', at(prev));
        const w0 = Math.max(a, rel);
        if (st > w0 + 1) anim(el('rect', { x: x(w0), y: by, width: x(st) - x(w0), height: bh, style: 'fill:var(--oxide-soft);stroke:var(--oxide);stroke-width:.6' }, s), 'a-x', at(w0));
        const late = c > due;
        const b = anim(el('rect', { x: x(st), y: by, width: Math.max(1, x(c) - x(st)), height: bh, rx: 1.5,
          style: `fill:${n > 1 ? 'var(--amber-hi)' : 'var(--steel)'};${late ? 'stroke:#e03131;stroke-width:1.6' : 'stroke:var(--paper);stroke-width:.5'}` }, s), 'a-x', at(st));
        hover(b, () => fmt(t('gTip'), { id: i + 1, m: ms, team: n > 1 ? fmt(t('teamOf'), { n }) : t('alone'), r: hm(rel), d: hm(due), c: hm(c) }) +
          ' · ' + (late ? fmt(t('lateBy'), { m: Math.round((c - due) / 60) }) : t('onTime')));
        prev = c;
      }
    });
    y0 += f.K * rowH + 6;
  });
  const ya = y0 + 4;
  el('line', { x1: L, x2: W - 8, y1: ya, y2: ya, style: 'stroke:var(--ink3)' }, s);
  for (let h = 0; h <= 18; h += 2) el('text', { x: x(h * 3600), y: ya + 16, 'text-anchor': 'middle', style: 'font-size:11px' }, s, h);
  el('text', { x: W - 8, y: ya + 30, 'text-anchor': 'end', style: 'font-size:11px' }, s, t('hrs'));
  el('line', { x1: x(16 * 3600), x2: x(16 * 3600), y1: 4, y2: ya, style: 'stroke:var(--ink3);stroke-dasharray:5 4' }, s);
  el('text', { x: x(16 * 3600) + 4, y: ya - 4, style: 'font-size:10.5px;fill:var(--ink3)' }, s, t('shiftEnd'));
  swatches('ganttLegend', [['var(--g-empty)', t('gEmpty')], ['var(--steel)', t('gSingle')], ['var(--amber-hi)', t('gCoupled')],
    ['var(--oxide-soft)', t('gWait'), 'border-color:var(--oxide)'], ['transparent', t('gLate'), 'border:2px solid #e03131']]);
  const [A, B] = ex.fleets, cost = f => (12.4 * f.P + 64 * f.K).toFixed(0);
  const rows = [['cVeh', f => f.K], ['cOn', f => f.on + ' / 97'], ['cCoup', f => f.coop], ['cWork', f => f.hours.work.toFixed(1)],
    ['cEmpty', f => f.hours.empty.toFixed(1)], ['cSync', f => f.hours.sync.toFixed(1)], ['cLate', f => Math.round(f.late / 60)],
    ['cP', f => f.P.toFixed(2)], ['cCost', f => cost(f)]];
  $('cmpTable').innerHTML = `<thead><tr><th></th><th style="text-transform:none">${famName(A.fam)} × ${A.K}</th><th style="text-transform:none">${famName(B.fam)} × ${B.K}</th></tr></thead><tbody>` +
    rows.map(([k, fn]) => `<tr><td style="font-family:var(--body);font-weight:400;white-space:normal">${t(k)}</td><td class="mono" style="white-space:nowrap">${fn(A)}</td><td class="mono" style="white-space:nowrap">${fn(B)}</td></tr>`).join('') + '</tbody>';
}

// composition of a fleet of K units, e.g. "1 × 500 t + 4 × 270 t"
const liuName = (f, K, hv) => {
  const m = /^L(\d+)_H(\d+)x(\d)$/.exec(f), caps = [];
  const add = (q, n) => { for (let k = 0; k < n; k++) caps.push(q); };
  if (m) { add(m[2], +m[3]); add(m[1], K - m[3]); }
  else if (f === 'MX1' || f === 'MX2') { const h = +f[2]; add(hv, h); add(270, K - h); }
  else add(f, K);
  return fleetStr(caps.join(' '));
};

// "270 270 270 270 500" -> "1 × 500 t + 4 × 270 t"
function fleetStr(sp) {
  const n = {};
  sp.split(' ').forEach(q => { n[q] = (n[q] || 0) + 1; });
  return Object.keys(n).sort((a, b) => b - a).map(q => `${n[q]} × ${q} t`).join(' + ');
}
const SC = { 'M1_H1_D-emp': 'M1', 'M3_H1_D-emp': 'M3', 'M6_H1_D-emp': 'M6' };
const SC_COL = { M1: 'var(--steel)', M3: 'var(--oxide)', M6: 'var(--good)' };

// Finding 2a: fleets that qualify with one vehicle fewer without a cap, one bar per distinct fleet
function drawLate() {
  const seen = new Set(), rows = [];
  D.late.late_blocks.forEach(([c, f, k, k1, cp, mx, n4, n4c]) => {
    const name = liuName(f, k, c.startsWith('M6') ? 425 : 500), key = c + name;
    if (!seen.has(key)) { seen.add(key); rows.push({ c, name, k, k1, cp, mx, n4 }); }
  });
  const W = 640, top = 8, bot = 44, H = fitH('cLate', W, top + rows.length * 56 + bot, 0.8, 1.6), rh = (H - top - bot) / rows.length;
  const s = frame('cLate', W, H, 'Largest delay of fleets that qualify only without a cap');
  const L = 300, x = lin(0, 20, L, W - 40);
  const g = el('g', { class: 'grid' }, s);
  for (const v of [0, 4, 8, 12, 16, 20]) { el('line', { x1: x(v), x2: x(v), y1: top, y2: H - bot + 4 }, g); el('text', { x: x(v), y: H - bot + 20, 'text-anchor': 'middle' }, s, v); }
  el('text', { x: (L + W - 40) / 2, y: H - 6, 'text-anchor': 'middle' }, s, t('lateAx'));
  rows.forEach((o, i) => {
    const y = top + i * rh;
    el('text', { x: 0, y: y + rh * 0.42, class: 't-strong', style: 'font-size:13px' }, s, `${t(SC[o.c])} · ${o.name}`);
    el('text', { x: 0, y: y + rh * 0.42 + 17, style: 'font-size:11.5px' }, s, fmt(t('lateLbl'), { k: o.k, k1: o.k1, n: o.n4 }));
    anim(el('rect', { x: L, y: y + rh * 0.2, width: x(o.mx) - L, height: rh * 0.5, rx: 2, style: `fill:${SC_COL[SC[o.c]]};opacity:.85` }, s), 'a-x', .3 + i * .12);
    anim(el('text', { x: x(o.mx) + 6, y: y + rh * 0.45 + 5, class: 't-strong' }, s, o.mx.toFixed(1) + ' h'), 'a-fade', .75 + i * .12);
  });
  el('line', { x1: x(2), x2: x(2), y1: top, y2: H - bot, style: 'stroke:var(--amber);stroke-width:2;stroke-dasharray:5 4' }, s);
  el('text', { x: x(2) + 4, y: top + 10, style: 'font-size:11px;fill:var(--amber);font-weight:600' }, s, t('capLine'));
}

// heavy-block share: cheapest fleet by p, short and mass-dependent handling
function drawE7() {
  const E = D.late.e7, ps = E.H1.map(x => x[0]), W = 660, top = 30, L = 120, cw = (W - L) / ps.length;
  const H = fitH('cE7', W, 300, 0.8, 1.6), rh = (H - top - 46) / 2;
  const s = frame('cE7', W, H, 'Cheapest fleet by heavy-block share');
  const lab = f => f === 'MX1' ? '+1 × 550' : f === 'MX2' ? '+2 × 550' : f + ' t';
  ps.forEach((p, j) => el('text', { x: L + j * cw + cw / 2, y: 18, 'text-anchor': 'middle', class: 't-strong' }, s, Math.round(100 * p) + '%'));
  ['H1', 'H2'].forEach((hk, i) => {
    const y = top + i * rh;
    // the row label wraps onto two lines when it is wider than its column
    const rl = el('text', { x: 0, y: y + rh / 2 + 4, class: 't-strong', style: 'font-size:13px' }, s, t(hk + 'l')), words = t(hk + 'l');
    if (rl.getComputedTextLength() > L - 10 && words.lastIndexOf(' ') > 0) {
      rl.textContent = '';
      [words.slice(0, words.lastIndexOf(' ')), words.slice(words.lastIndexOf(' ') + 1)].forEach((w, n) => el('tspan', { x: 0, dy: n ? 16 : -8 }, rl, w));
    }
    E[hk].forEach(([p, f, c], j) => {
      const g = anim(el('g', {}, s), 'a-pop', .3 + j * .1 + i * .05), x0 = L + j * cw;
      el('rect', { x: x0 + 3, y: y + 6, width: cw - 6, height: rh - 12, rx: 6, fill: COL[f], style: 'stroke:var(--ink3);stroke-width:.6' }, g);
      el('text', { x: x0 + cw / 2, y: y + rh / 2, 'text-anchor': 'middle', style: `font-family:var(--mono);font-size:12.5px;font-weight:600;fill:${DARK.has(f) ? '#fff' : '#1b1b1b'}` }, g, lab(f));
      el('text', { x: x0 + cw / 2, y: y + rh / 2 + 17, 'text-anchor': 'middle', style: `font-size:11px;fill:${DARK.has(f) ? '#fff' : '#333'}` }, g, c + '%');
      hover(g, () => fmt(t('e7Tip'), { p: Math.round(100 * p), fleet: f === 'MX1' || f === 'MX2' ? fleetStr(Array(f === 'MX1' ? 1 : 2).fill('550').join(' ') + ' 270') + '…' : f + ' t', c }));
    });
  });
  el('text', { x: L + (W - L) / 2, y: H - 8, 'text-anchor': 'middle' }, s, t('e7Ax'));
  swatches('e7Legend', [[COL['300'], t('e7Le')], [COL.MX2, t('e7Mx')], [COL['550'], t('e7Big')]]);
  const [a, n] = D.late.e7_le10;
  $('e7Num').innerHTML = `${a.toLocaleString('en-US')} / ${n.toLocaleString('en-US')}<small>${t('e7Num')}</small>`;
}

// ---------- figures of the paper ----------
const TQ = [200, 250, 270, 300, 325, 380, 425, 500, 550];
const HCOL = { H1: 'var(--steel)', H2: 'var(--ink3)', H3: 'var(--g-empty)' };

// Fig. 3: transporters needed by capacity tier, baseline due dates; dashed: smallest tier that carries every block alone
function drawKt() {
  const W = 660, H = fitH('cKt', W, 420, 0.85, 1.3), pw = W / 3, ph = H / 2;
  const s = frame('cKt', W, H, 'Transporters needed by capacity tier');
  ['M1', 'M2', 'M3', 'M4', 'M5', 'M6'].forEach((m, k) => {
    const x0 = (k % 3) * pw, y0 = Math.floor(k / 3) * ph, L = x0 + 30, R = x0 + pw - 12, T0 = y0 + 26, B = y0 + ph - 30;
    const ks = ['H1', 'H2', 'H3'].flatMap(h => TQ.map(q => D.kstar[`${m}_${h}_D-emp`][q]).filter(v => v));
    const top = Math.ceil(Math.max(...ks) / 6) * 6, x = lin(200, 550, L, R), y = lin(0, top, B, T0), g = el('g', { class: 'grid' }, s);
    for (const v of [0, top / 2, top]) { el('line', { x1: L, x2: R, y1: y(v), y2: y(v) }, g); if (v) el('text', { x: L - 6, y: y(v) + 4, 'text-anchor': 'end', style: 'font-size:11px' }, s, v); }
    for (const q of [200, 300, 425, 550]) el('text', { x: x(q), y: B + 16, 'text-anchor': 'middle', style: 'font-size:11px' }, s, q);
    el('text', { x: x0 + 4, y: y0 + 14, class: 't-strong', style: 'font-size:12.5px' }, s, t(m));
    const sc = D.oe.sct[m];
    if (sc) {
      el('line', { x1: x(sc), x2: x(sc), y1: T0 - 4, y2: B, style: 'stroke:var(--ink2);stroke-width:1.2;stroke-dasharray:4 3' }, s);
      el('text', { x: x(sc) - 4, y: T0 + 6, 'text-anchor': 'end', style: 'font-size:10.5px;fill:var(--ink2)' }, s, t('ktTier'));
    } else el('text', { x: R, y: T0 + 6, 'text-anchor': 'end', style: 'font-size:10.5px;fill:var(--oxide)' }, s, t('ktNone'));
    ['H3', 'H2', 'H1'].forEach((h, j) => {
      const c = `${m}_${h}_D-emp`, pts = TQ.filter(q => D.kstar[c][q]).map(q => [q, D.kstar[c][q]]);
      anim(el('path', { d: pts.map(([q, v], i) => `${i ? 'L' : 'M'}${x(q)} ${y(v)}`).join(''), pathLength: 1, style: `fill:none;stroke:${HCOL[h]};stroke-width:${h === 'H1' ? 2.4 : 1.6}` }, s), 'a-draw', .3 + k * .08 + j * .1);
      pts.forEach(([q, v]) => hover(anim(el('circle', { cx: x(q), cy: y(v), r: h === 'H1' ? 3.6 : 2.8, style: `fill:${HCOL[h]};stroke:var(--paper);stroke-width:1` }, s), 'a-pop', .5 + k * .08 + j * .1),
        () => `${t(m)} · ${t(h + 'l')}<br>${fmt(t('ktTip'), { q, v })}`));
    });
  });
  swatches('ktLegend', ['H1', 'H2', 'H3'].map(h => [HCOL[h], t(h + 'l')]));
}

// Fig. 5a: transporter-hours per day against the share of coupled blocks (330 series outside the extra-heavy scenario)
function drawOcc() {
  const W = 600, H = fitH('cOcc', W, 390), m = { l: 56, r: 14, t: 10, b: 46 }, [b, a, r] = D.oe.occ_fit;
  const s = frame('cOcc', W, H, 'Transporter-hours against the share of coupled blocks');
  const x = lin(0, 100, m.l, W - m.r), y = lin(-10, 240, H - m.b, m.t), g = el('g', { class: 'grid' }, s);
  for (let v = 0; v <= 200; v += 50) { el('line', { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v) }, g); el('text', { x: m.l - 8, y: y(v) + 4, 'text-anchor': 'end' }, s, v); }
  for (let v = 0; v <= 100; v += 20) { el('line', { x1: x(v), x2: x(v), y1: m.t, y2: H - m.b }, g); el('text', { x: x(v), y: H - m.b + 18, 'text-anchor': 'middle' }, s, v); }
  el('text', { x: (m.l + W - m.r) / 2, y: H - 6, 'text-anchor': 'middle' }, s, t('occX'));
  yTitle(s, 14, (m.t + H - m.b) / 2, t('occY'));
  D.oe.occ.forEach(([f, cx, cy, cell], k) => hover(anim(el('circle', { cx: x(cx), cy: y(cy), r: 4.2, fill: COL[f], style: 'stroke:var(--ink);stroke-opacity:.5;stroke-width:.7' }, s), 'a-pop', .25 + .8 * spread(k)),
    () => `<b>${famName(f)}</b><br>${cellName(cell)}<br>${t('occX')}: ${cx.toFixed(1)}%<br>${t('occY')}: ${cy >= 0 ? '+' : ''}${cy.toFixed(1)}%`));
  anim(el('path', { d: `M${x(0)} ${y(a)}L${x(100)} ${y(a + 100 * b)}`, pathLength: 1, style: 'fill:none;stroke:var(--oxide);stroke-width:2.4' }, s), 'a-draw', 1.1);
  anim(el('text', { x: x(58), y: y(18), class: 't-strong', style: 'fill:var(--oxide);font-size:13px' }, s, fmt(t('occFit'), { b: b.toFixed(1), r: r.toFixed(2) })), 'a-fade', 1.5);
  swatches('occLegend', FAMS.map(f => [COL[f], famName(f)]));
}

// exact benchmark: each method's count of the 56 fleets with a proven minimum on single-batch slices
function drawExact() {
  const E = D.oe.exact, rows = [['final', 'exFinal'], ['single', 'exSingle'], ['cp0', 'exCp0'], ['greedy', 'exGreedy']];
  const cols = ['var(--steel)', 'var(--amber)', 'var(--oxide)', 'var(--g-empty)'], keys = ['exEq', 'exP1', 'exP2', 'exNone'];
  const W = 600, H = fitH('cExact', W, 250, 0.8, 1.3), L = 150, R = W - 14, top = 8, bh = (H - top - 40) / rows.length;
  const s = frame('cExact', W, H, 'Counts against the proven minimum'), x = lin(0, 56, L, R), g = el('g', { class: 'grid' }, s);
  for (const v of [0, 14, 28, 42, 56]) { el('line', { x1: x(v), x2: x(v), y1: top, y2: H - 34 }, g); el('text', { x: x(v), y: H - 18, 'text-anchor': 'middle', style: 'font-size:11px' }, s, v); }
  rows.forEach(([k, lab], i) => {
    const y0 = top + i * bh + bh * 0.18, h = bh * 0.64;
    el('text', { x: L - 10, y: y0 + h / 2 + 5, 'text-anchor': 'end', class: 't-strong', style: 'font-size:13px' }, s, t(lab));
    let acc = 0;
    E[k].forEach((v, j) => {
      if (!v) return;
      const r = anim(el('rect', { x: x(acc), y: y0, width: x(acc + v) - x(acc), height: h, style: `fill:${cols[j]}` }, s), 'a-x', .3 + i * .15 + j * .08);
      hover(r, () => `${t(lab)}: ${t(keys[j])} · ${v} / 56`);
      if (x(acc + v) - x(acc) > 22) el('text', { x: (x(acc) + x(acc + v)) / 2, y: y0 + h / 2 + 5, 'text-anchor': 'middle', style: `font-size:12px;font-weight:600;fill:${j === 1 ? 'var(--ink)' : '#fff'}` }, s, v);
      acc += v;
    });
  });
  el('text', { x: (L + R) / 2, y: H - 2, 'text-anchor': 'middle', style: 'font-size:11.5px' }, s, t('exX'));
  swatches('exLegend', keys.map((k, j) => [cols[j], t(k)]));
}

// fresh days: share of each condition's 180 decisions whose least-cost fleet is the same as on the original days
function drawFresh() {
  const F = D.oe.fresh, cells = Object.keys(F), W = 600, H = fitH('cFresh', W, 300, 0.8, 1.3), L = 230, R = W - 50, top = 6, bh = (H - top - 44) / cells.length;
  const s = frame('cFresh', W, H, 'Same least-cost fleet on fresh days'), x = lin(0, 100, L, R), g = el('g', { class: 'grid' }, s);
  for (let v = 0; v <= 100; v += 25) { el('line', { x1: x(v), x2: x(v), y1: top, y2: H - 38 }, g); el('text', { x: x(v), y: H - 22, 'text-anchor': 'middle', style: 'font-size:11px' }, s, v); }
  cells.forEach((c, i) => {
    const [mm, h] = c.split('_'), y0 = top + i * bh + bh * 0.2, bhh = bh * 0.6;
    el('text', { x: L - 10, y: y0 + bhh / 2 + 5, 'text-anchor': 'end', style: 'font-size:12.5px' }, s, `${t(mm)} · ${t(h + 'l')}`);
    anim(el('rect', { x: L, y: y0, width: x(F[c]) - L, height: bhh, style: `fill:${mm === 'M4' ? 'var(--g-empty)' : 'var(--steel)'}` }, s), 'a-x', .3 + i * .08);
    el('text', { x: x(F[c]) + 6, y: y0 + bhh / 2 + 5, class: 't-strong', style: 'font-size:12px' }, s, F[c].toFixed(1) + '%');
  });
  el('line', { x1: x(86.5), x2: x(86.5), y1: top, y2: H - 38, style: 'stroke:var(--oxide);stroke-width:1.6;stroke-dasharray:5 4' }, s);
  el('text', { x: x(86.5) - 4, y: H - 40, 'text-anchor': 'end', style: 'font-size:11px;fill:var(--oxide)' }, s, `${t('frAll')}: 86.5%`);
  el('text', { x: (L + R) / 2, y: H - 4, 'text-anchor': 'middle', style: 'font-size:11.5px' }, s, t('frY'));
}


// controls of this deck, wired once after the shared shell is built
function init() {
  $('rCap').addEventListener('input', drawCap);
  $('rCase').addEventListener('input', drawCase);
  drawSpmt();
}

Deck.start({
  strings: T,
  sections: { intro: ['概览', 'Overview', '개요'], bg: ['问题', 'The problem', '문제'], method: ['做法', 'Approach', '방법'],
    res: ['发现', 'Findings', '결과'], why: ['原因', 'Why', '이유'], rel: ['可靠性', 'Reliability', '신뢰성'],
    end: ['建议与结论', 'Advice and conclusions', '권고와 결론'], ref: ['参考文献', 'References', '참고문헌'] },
  draw: [drawPrice, drawCap, drawCase, drawGantt, drawLate, drawE7, drawKt, drawOcc, drawExact, drawFresh],
  init,
});
})();
