// Traffic-orchestration deck (thesis chapter 4): the strings and charts of this briefing.
// Paging, language, notes, contents, glossary, layout and the PDF link come from ../shared/deck-core.js (README.md).
(() => {
'use strict';
const D = window.DATA;
const { LI, $, el, frame, fitH, anim, spread, lin, yTitle, swatches, hover, fmt } = Deck;

// ---------- strings used inside charts: [zh, en, ko] ----------
const T = {
  title: ['交通编排 · 分项研究', 'Traffic Orchestration', '교통 편성 · 세부 연구'],
  yupu: ['玉浦', 'Okpo', '옥포'], yantai: ['烟台', 'Yantai', '옌타이'],
  free: ['自由流', 'Free flow', '자유류'], reserve: ['整条路径预约', 'Whole-route reservation', '전체 경로 예약'],
  segment: ['逐段申请（参照规则，瞬移疏解）', 'Segment request (reference rule, teleport clearing)', '구간별 요청 (참조 규칙, 순간이동 해소)'],
  K: ['车队规模 K（台）', 'Fleet size K (vehicles)', '차량군 규모 K (대)'],
  perDay: ['个/日', 'a day', '건/일'],
  // interval
  intLbl: ['两座船厂的运力区间：平台占 T1′ 的比例', 'Capacity interval on two yards: plateau as a share of T1′', '두 조선소의 운송 능력 구간: T1′ 대비 평탄 구간'],
  intX: ['占路网上界 T1′ 的比例', 'Share of the network bound T1′', '도로망 상한 T1′ 대비 비율'],
  intRow: ['{yard} · T1′ = {t} 个/日', '{yard} · T1′ = {t} a day', '{yard} · T1′ = 하루 {t}건'],
  intGap: ['第 4 章要挣回的差距：T1′ 的 {p}', 'The gap chapter 4 aims to win back: {p} of T1′', '4장이 되찾을 차이: T1′의 {p}'],
  intTip: ['{yard} · {m}<br>平台 {v} 个/日 = T1′ 的 {p}<br>T1′ = {t}（10 个种子 {lo}–{hi}）', '{yard} · {m}<br>plateau {v} a day = {p} of T1′<br>T1′ = {t} (10 seeds {lo}–{hi})', '{yard} · {m}<br>평탄 하루 {v}건 = T1′의 {p}<br>T1′ = {t} (시드 10개 {lo}–{hi})'],
  lgT1: ['T1′ 路网上界', 'T1′ network bound', 'T1′ 도로망 상한'],
  lgRes: ['整条路径预约：无死锁，现在的下沿', 'Whole-route reservation: deadlock-free, today\'s lower edge', '전체 경로 예약: 무교착, 현재 하한'],
  rdRes: ['整条路径预约的平台 ÷ T1′（玉浦 / 烟台）：现在可用的无死锁下沿', 'Whole-route reservation plateau ÷ T1′ (Okpo / Yantai): today\'s deadlock-free lower edge', '전체 경로 예약 평탄 ÷ T1′ (옥포 / 옌타이): 현재 쓸 수 있는 무교착 하한'],
  rdSeg: ['逐段申请（参照规则，瞬移疏解）÷ T1′：依赖瞬移，不能当下沿', 'Segment request (reference rule, teleport clearing) ÷ T1′: it relies on teleporting, so it cannot be the lower edge', '구간별 요청 (참조 규칙, 순간이동 해소) ÷ T1′: 순간이동에 기대므로 하한이 될 수 없음'],
  rdInt: ['玉浦的区间（个/日）。第 4 章把下沿往上推，第 3 章的加强上界（T23）把上沿往下压', 'Okpo\'s interval (a day). Chapter 4 pushes the lower edge up; chapter 3\'s tighter bounds (T23) press the upper edge down', '옥포의 구간 (건/일). 4장은 하한을 올리고, 3장의 강화 상한 (T23)은 상한을 내린다'],
  // probe
  probeLbl: ['三种道路改动后的变化（相对现模型）', 'Change after three road changes (relative to the current model)', '세 가지 도로 개조 후 변화 (현 모형 대비)'],
  probeY: ['相对现模型的变化', 'Change from the current model', '현 모형 대비 변화'],
  vW12: ['改宽到 12 m', 'Widen to 12 m', '12 m로 확폭'], vSect: ['按停靠点分段闭塞', 'Blocks at the stops', '정차 지점별 분할 폐색'], vBay: ['分段 + 两处会车点', 'Blocks + two bays', '분할 + 대피 구간 2곳'],
  mT1: ['T1′（10 个种子）', 'T1′ (10 seeds)', 'T1′ (시드 10개)'], mR60: ['预约吞吐 K = 60', 'Reservation, K = 60', '예약 처리량 K = 60'], mR120: ['预约吞吐 K = 120', 'Reservation, K = 120', '예약 처리량 K = 120'],
  probeTip: ['{v} · {m}<br>{a} → {b}（{d}）', '{v} · {m}<br>{a} → {b} ({d})', '{v} · {m}<br>{a} → {b} ({d})'],
  // deadlocks
  deadLbl: ['逐段申请（参照规则）每天的死锁次数', 'Deadlocks a day under segment request (reference rule)', '구간별 요청 (참조 규칙)의 하루 교착 수'],
  deadY: ['每天死锁（次，饱和档）', 'Deadlocks a day (saturated)', '하루 교착 (회, 포화)'],
  deadMark: ['K = 100：每天 {v} 次', 'K = 100: {v} a day', 'K = 100: 하루 {v}회'],
  deadMark2: ['约 {s} 的车·时被移出路网', 'about {s} of vehicle-hours off the network', '차량·시간 약 {s}가 도로망 밖'],
  deadTip: ['{yard} · K = {k}<br>每天 {v} 次死锁（种子 {lo}–{hi}）<br>被瞬移出路网的车·时 ≥ {s}', '{yard} · K = {k}<br>{v} deadlocks a day (seeds {lo}–{hi})<br>vehicle-hours teleported off ≥ {s}', '{yard} · K = {k}<br>하루 교착 {v}회 (시드 {lo}–{hi})<br>순간이동으로 빠진 차량·시간 ≥ {s}'],
  rdLev: ['玉浦常规日 / 高峰日每天的死锁（97 / 194 个/日，即 4 台车子集，Yim 2008，只作对照）', 'Okpo deadlocks a day on a regular / peak day (97 / 194 tasks, the 4-vehicle subset of Yim 2008, for comparison only)', '옥포 평상일 / 피크일 하루 교착 (97 / 194건, Yim 2008의 4대 부분집합, 비교용)'],
  rdSat: ['饱和档 K = 100 / 150 每天的死锁', 'Deadlocks a day at saturation, K = 100 / 150', '포화, K = 100 / 150의 하루 교착'],
  rdShare: ['K = 100 时至少被瞬移出路网的车·时（{a} / {b} 车·时）', 'Vehicle-hours teleported off the network at K = 100, at least ({a} / {b})', 'K = 100에서 최소한 순간이동으로 빠진 차량·시간 ({a} / {b})'],
  // productivity
  prodLbl: ['玉浦每台车每天完成的任务', 'Tasks per vehicle per day on Okpo', '옥포 차량당 하루 작업'],
  prodY: ['每台车每天的任务（个）', 'Tasks per vehicle per day', '차량당 하루 작업 (건)'],
  band: ['现场锚点 18–24（未按周期时间归一）', 'Field anchors 18–24 (not normalised by cycle time)', '현장 기준점 18–24 (주기 시간 정규화 전)'],
  ceil: ['模型单车上限 H/c̄ = {v}', 'Model per-vehicle ceiling H/c̄ = {v}', '모형 차량당 상한 H/c̄ = {v}'],
  fleetBand: ['现实车队 30–40 台', 'Real fleets 30–40', '실제 차량군 30–40대'],
  anchorTip: ['{n}：{a} 个 ÷ {b} 台 = {v} 个/台·日', '{n}: {a} tasks ÷ {b} vehicles = {v} per vehicle-day', '{n}: {a}건 ÷ {b}대 = 차량당 하루 {v}건'],
  prodTip: ['{m} · K = {k}<br>每台车每天 {v} 个', '{m} · K = {k}<br>{v} tasks per vehicle per day', '{m} · K = {k}<br>차량당 하루 {v}건'],
  lgAnchor: ['公开锚点', 'Public anchors', '공개 기준점'],
  rdProd: ['玉浦 K = 30 时每台车每天：整条路径预约 {r} 个，逐段申请（参照规则，瞬移疏解）{s}，自由流 {f}；现场锚点 {a}–{b} 个', 'Per vehicle per day on Okpo at K = 30: whole-route reservation {r}, segment request (reference rule, teleport clearing) {s}, free flow {f}; field anchors {a}–{b}', '옥포 K = 30의 차량당 하루: 전체 경로 예약 {r}건, 구간별 요청 (참조 규칙, 순간이동 해소) {s}, 자유류 {f}, 현장 기준점 {a}–{b}건'],
};
const t = k => T[k][LI[Deck.lang]];
const YC = { yupu: 'var(--steel)', yantai: 'var(--amber)' };
const MC = { free: 'var(--steel)', reserve: 'var(--oxide)', segment: 'var(--amber)' };
const f0 = v => Math.round(v).toLocaleString('en-US');
const f1 = v => v.toFixed(1);
const pct = v => Math.round(100 * v) + '%';
const sgn = v => (v >= 0 ? '+' : '−') + Math.abs(100 * v).toFixed(1) + '%';
const range = (a, b, st) => { const r = []; for (let v = a; v <= b + 1e-9; v += st) r.push(+v.toFixed(6)); return r; };
const pathOf = pts => pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('');
const stat = (num, p) => `<div class="stat"><span class="num">${num}</span><p>${p}</p></div>`;
function axes(s, x, y, xt, yt, W, H, m, fx = v => v, fy = v => v) {
  const g = el('g', { class: 'grid' }, s), a = el('g', { class: 'axis' }, s);
  yt.forEach(v => { el('line', { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v) }, g); el('text', { x: m.l - 8, y: y(v) + 4, 'text-anchor': 'end' }, s, fy(v)); });
  xt.forEach(v => el('text', { x: x(v), y: H - m.b + 17, 'text-anchor': 'middle' }, s, fx(v)));
  el('path', { d: `M${m.l} ${m.t}V${H - m.b}H${W - m.r}` }, a);
}

// ---------- the capacity interval: plateau as a share of T1' ----------
function drawInt() {
  const I = D.interval, W = 600, H = fitH('cInt', W, 340), m = { l: 14, r: 26, t: 8, b: 44 };
  const s = frame('cInt', W, H, t('intLbl'));
  const x = lin(0, 1, m.l, W - m.r);
  const g = el('g', { class: 'grid' }, s);
  [0, .25, .5, .75, 1].forEach(v => { el('line', { x1: x(v), x2: x(v), y1: m.t, y2: H - m.b }, g); el('text', { x: x(v), y: H - m.b + 18, 'text-anchor': 'middle' }, s, pct(v)); });
  el('text', { x: (m.l + W - m.r) / 2, y: H - 8, 'text-anchor': 'middle' }, s, t('intX'));
  const rowH = (H - m.t - m.b) / 2;
  ['yupu', 'yantai'].forEach((yd, i) => {
    const Y = I[yd], y0 = m.t + i * rowH + Math.max(0, (rowH - 116) / 2), bh = 38, by = y0 + 26;
    el('text', { x: m.l, y: y0 + 16, class: 't-strong', style: 'font-size:14px' }, s, fmt(t('intRow'), { yard: t(yd), t: f0(Y.T1t[0]) }));
    el('rect', { x: x(0), y: by, width: x(1) - x(0), height: bh, style: 'fill:var(--panel)' }, s);
    const sr = Y.share.reserve, ss = Y.share.segment;
    const seg = anim(el('rect', { x: x(sr), y: by, width: x(ss) - x(sr), height: bh, style: 'fill:var(--amber-hi);fill-opacity:.45' }, s), 'a-x', .7 + .2 * i);
    anim(el('rect', { x: x(sr), y: by, width: x(ss) - x(sr), height: bh, style: 'fill:url(#hatch);pointer-events:none' }, s), 'a-x', .7 + .2 * i);
    const res = anim(el('rect', { x: x(0), y: by, width: x(sr) - x(0), height: bh, style: 'fill:var(--oxide)' }, s), 'a-x', .3 + .2 * i);
    el('path', { d: `M${x(1)} ${by - 8}V${by + bh + 8}`, style: 'stroke:var(--oxide);stroke-width:2;stroke-dasharray:5 3' }, s);
    el('text', { x: x(sr) - 7, y: by + bh / 2 + 5, 'text-anchor': 'end', style: 'fill:#fff;font-weight:600;font-size:14px' }, s, `${pct(sr)} · ${f0(Y.plateau.reserve)}`);
    el('text', { x: x(ss) + 7, y: by + bh / 2 + 5, style: 'fill:var(--amber);font-weight:600;font-size:13px' }, s, `${pct(ss)} · ${f0(Y.plateau.segment)}`);
    // the gap chapter 4 aims to win back
    const gy = by + bh + 16;
    anim(el('path', { d: `M${x(sr) + 1} ${gy - 6}V${gy}H${x(1) - 1}V${gy - 6}`, style: 'stroke:var(--ink2);stroke-width:1.4;fill:none' }, s), 'a-fade', 1.1);
    anim(el('text', { x: (x(sr) + x(1)) / 2, y: gy + 17, 'text-anchor': 'middle', style: 'fill:var(--ink);font-size:13px;font-weight:600' }, s, fmt(t('intGap'), { p: pct(1 - sr) })), 'a-fade', 1.2);
    const tip = md => () => fmt(t('intTip'), { yard: t(yd), m: t(md), v: f0(Y.plateau[md]), p: pct(Y.share[md]), t: f0(Y.T1t[0]), lo: f0(Y.T1t[1]), hi: f0(Y.T1t[2]) });
    hover(res, tip('reserve')); hover(seg, tip('segment'));
  });
  swatches('lgInt', [['var(--oxide)', t('lgRes')], ['var(--amber-hi)', t('segment'), 'opacity:.6'], ['transparent', t('lgT1'), 'border:2px dashed var(--oxide)']]);
  const Y = I.yupu, Tt = I.yantai;
  $('intRead').innerHTML = stat(`${pct(Y.share.reserve)}<small>/ ${pct(Tt.share.reserve)}</small>`, t('rdRes'))
    + stat(`${pct(Y.share.segment)}<small>/ ${pct(Tt.share.segment)}</small>`, t('rdSeg'))
    + stat(`${f0(Y.plateau.reserve)} → ${f0(Y.T1t[0])}`, t('rdInt'));
}

// ---------- probe: road changes move T1' but hardly the reservation rule ----------
function drawProbe() {
  const P = D.probe, b = P.base, W = 600, H = fitH('cProbe', W, 340), m = { l: 52, r: 12, t: 16, b: 50 };
  const s = frame('cProbe', W, H, t('probeLbl'));
  const x0 = m.l, gw = (W - m.l - m.r) / P.variants.length, y = lin(0, 0.1, H - m.b, m.t);
  axes(s, v => v, y, [], range(0, 0.1, 0.02), W, H, m, v => v, v => Math.round(100 * v) + '%');
  yTitle(s, 14, (m.t + H - m.b) / 2, t('probeY'));
  const MS = [['mT1', v => [b.T1t, v.T1t], 'var(--steel)', ''], ['mR60', v => [b.reserve[0], v.reserve[0]], 'var(--oxide)', 'fill-opacity:.55'], ['mR120', v => [b.reserve[1], v.reserve[1]], 'var(--oxide)', '']];
  const names = { w12: 'vW12', sect: 'vSect', sect_bay: 'vBay' }, bw = 34, gap = 8;
  P.variants.forEach(([k, v], i) => {
    const cx = x0 + gw * (i + .5), left = cx - (MS.length * bw + (MS.length - 1) * gap) / 2;
    el('text', { x: cx, y: H - m.b + 20, 'text-anchor': 'middle', class: 't-strong', style: 'font-size:13px' }, s, t(names[k]));
    MS.forEach(([mk, f, c, extra], j) => {
      const [a, bb] = f(v), d = bb / a - 1, bx = left + j * (bw + gap);
      const r = anim(el('rect', { x: bx, y: y(Math.max(d, 0)), width: bw, height: y(0) - y(Math.max(d, 0)), style: `fill:${c};${extra}` }, s), 'a-y', .3 + .12 * j + .2 * i);
      el('text', { x: bx + bw / 2, y: y(Math.max(d, 0)) - 6, 'text-anchor': 'middle', style: 'font-size:12px;fill:var(--ink);font-weight:600' }, s, sgn(d));
      hover(r, () => fmt(t('probeTip'), { v: t(names[k]), m: t(mk), a: f0(a), b: f0(bb), d: sgn(d) }));
    });
  });
  swatches('lgProbe', MS.map(([mk, , c, extra]) => [c, t(mk), extra.replace('fill-', '')]));
}

// ---------- deadlocks of the reference rule ----------
function drawDead() {
  const W = 600, H = fitH('cDead', W, 340), m = { l: 60, r: 14, t: 14, b: 46 };
  const s = frame('cDead', W, H, t('deadLbl'));
  const x = lin(0, 150, m.l, W - m.r), y = lin(0, 3000, H - m.b, m.t);
  axes(s, x, y, range(0, 150, 25), range(0, 3000, 500), W, H, m, v => v, f0);
  el('text', { x: (m.l + W - m.r) / 2, y: H - 6, 'text-anchor': 'middle' }, s, t('K'));
  yTitle(s, 14, (m.t + H - m.b) / 2, t('deadY'));
  ['yupu', 'yantai'].forEach((yd, i) => {
    const pts = D.deadlock[yd];
    el('path', { d: pathOf(pts.map(p => [x(p[0]), y(p[3])])) + pathOf(pts.slice().reverse().map(p => [x(p[0]), y(p[2])])).replace('M', 'L') + 'Z', style: `fill:${YC[yd]};opacity:.15` }, s);
    anim(el('path', { d: pathOf(pts.map(p => [x(p[0]), y(p[1])])), pathLength: 1, style: `stroke:${YC[yd]};stroke-width:2.6;fill:none;stroke-linejoin:round` }, s), 'a-draw', .25 + .3 * i);
    pts.forEach((p, j) => {
      if (p[0] > 40 ? p[0] % 10 : p[0] % 5) return;   // thin the dense grid for hover targets
      const c = anim(el('circle', { cx: x(p[0]), cy: y(p[1]), r: 3, style: `fill:${YC[yd]};stroke:var(--paper);stroke-width:1` }, s), 'a-pop', .9 + .3 * spread(j));
      hover(c, () => fmt(t('deadTip'), { yard: t(yd), k: p[0], v: f0(p[1]), lo: f0(p[2]), hi: f0(p[3]), s: pct(p[4]) }));
    });
  });
  const k = D.deadlock.yupu.find(p => p[0] === 100);
  anim(el('circle', { cx: x(100), cy: y(k[1]), r: 7, style: 'fill:none;stroke:var(--oxide);stroke-width:2.2' }, s), 'a-pop', 1.4);
  const lab = anim(el('text', { x: x(100) - 12, y: y(k[1]) - 32, 'text-anchor': 'end', style: 'fill:var(--oxide);font-weight:700;font-size:13px' }, s), 'a-fade', 1.5);
  el('tspan', { x: x(100) - 12 }, lab, fmt(t('deadMark'), { v: f0(k[1]) }));
  el('tspan', { x: x(100) - 12, dy: 17 }, lab, fmt(t('deadMark2'), { s: pct(k[4]) }));
  swatches('lgDead', [[YC.yupu, t('yupu')], [YC.yantai, t('yantai')]]);
  const L = D.deadLevels, k150 = D.deadlock.yupu.find(p => p[0] === 150);
  const vh = k[1] * D.source.recover_s / 3600, tot = 100 * D.source.day_h;
  $('deadRead').innerHTML = stat(`${f0(L.regular)}<small>/ ${f0(L.peak)}</small>`, t('rdLev'))
    + stat(`${f0(k[1])}<small>/ ${f0(k150[1])}</small>`, t('rdSat'))
    + stat(`≈ ${pct(k[4])}`, fmt(t('rdShare'), { a: f0(vh), b: f0(tot) }));
}

// ---------- per-vehicle productivity against field anchors ----------
function drawProd() {
  const P = D.prod, W = 600, H = fitH('cProd', W, 340), m = { l: 52, r: 14, t: 14, b: 46 };
  const s = frame('cProd', W, H, t('prodLbl'));
  const x = lin(0, 150, m.l, W - m.r), y = lin(0, 27, H - m.b, m.t);
  const A = P.anchors.map(([n, a, b]) => [n, a, b, a / b]), lo = Math.min(...A.map(a => a[3])), hi = Math.max(...A.map(a => a[3]));
  el('rect', { x: x(30), y: m.t, width: x(40) - x(30), height: H - m.b - m.t, style: 'fill:var(--ink3);opacity:.1' }, s);
  el('rect', { x: m.l, y: y(hi), width: W - m.r - m.l, height: y(lo) - y(hi), style: 'fill:var(--good-soft);opacity:.9' }, s);
  axes(s, x, y, range(0, 150, 25), range(0, 25, 5), W, H, m, v => v, v => v);
  el('text', { x: (m.l + W - m.r) / 2, y: H - 6, 'text-anchor': 'middle' }, s, t('K'));
  yTitle(s, 14, (m.t + H - m.b) / 2, t('prodY'));
  el('text', { x: x(35), y: m.t + 13, 'text-anchor': 'middle', style: 'fill:var(--ink2);font-size:12px;font-weight:600' }, s, t('fleetBand'));
  el('text', { x: W - m.r - 4, y: y(lo) - 6, 'text-anchor': 'end', style: 'fill:var(--good);font-size:12.5px;font-weight:600' }, s, t('band'));
  el('path', { d: `M${m.l} ${y(P.ceiling)}H${W - m.r}`, style: 'stroke:var(--ink2);stroke-width:1.4;stroke-dasharray:6 4' }, s);
  el('text', { x: W - m.r - 4, y: y(hi) - 6, 'text-anchor': 'end', style: 'fill:var(--ink2);font-size:12.5px' }, s, fmt(t('ceil'), { v: f1(P.ceiling) }));
  ['free', 'reserve', 'segment'].forEach((md, i) => {
    const pts = P[md];
    anim(el('path', { d: pathOf(pts.map(p => [x(p[0]), y(p[1])])), pathLength: 1, style: `stroke:${MC[md]};stroke-width:2.6;fill:none;stroke-linejoin:round` }, s), 'a-draw', .3 + .25 * i);
    pts.forEach((p, j) => {
      if (p[0] > 40 ? p[0] % 10 : p[0] % 5) return;
      const c = anim(el('circle', { cx: x(p[0]), cy: y(p[1]), r: 3, style: `fill:${MC[md]};stroke:var(--paper);stroke-width:1` }, s), 'a-pop', .9 + .3 * spread(j));
      hover(c, () => fmt(t('prodTip'), { m: t(md), k: p[0], v: f1(p[1]) }));
    });
  });
  const off = { 'Yim 2008': [8, -8, 'start'], 'Shen 2018': [0, -12, 'middle'], 'Heo 2013': [10, -5, 'start'] };
  A.forEach(([n, a, b, v], i) => {
    const cx = x(b), cy = y(v), [dx, dy, anc] = off[n] || [8, -8, 'start'];
    const d = anim(el('path', { d: `M${cx} ${cy - 7}L${cx + 7} ${cy}L${cx} ${cy + 7}L${cx - 7} ${cy}Z`, style: 'fill:var(--good);stroke:var(--paper);stroke-width:1.2' }, s), 'a-pop', 1.3 + .1 * i);
    el('text', { x: cx + dx, y: cy + dy, 'text-anchor': anc, style: 'fill:var(--good);font-size:12.5px;font-weight:600' }, s, n);
    hover(d, () => fmt(t('anchorTip'), { n, a, b, v: f1(v) }));
  });
  swatches('lgProd', [[MC.free, t('free')], [MC.reserve, t('reserve')], [MC.segment, t('segment')], ['var(--good)', t('lgAnchor'), 'transform:rotate(45deg) scale(.8)']]);
  const at = md => P[md].find(p => p[0] === 30)[1];
  $('prodRead').innerHTML = stat(`${f1(at('reserve'))}<small>→ ${Math.round(lo)}–${Math.round(hi)}</small>`,
    fmt(t('rdProd'), { r: f1(at('reserve')), s: f1(at('segment')), f: f1(at('free')), a: Math.round(lo), b: Math.round(hi) }));
}

Deck.start({
  strings: T,
  sections: { intro: ['导读', 'Overview', '개요'], pos: ['问题与定位', 'Question and position', '질문과 위치'], why: ['为什么要编排', 'Why orchestration', '왜 편성인가'],
    rules: ['规则与 T5', 'Rules and T5', '규칙과 T5'], goal: ['目标与 H5', 'Goal and H5', '목표와 H5'], method: ['方法', 'Methods', '방법'],
    plan: ['实验与产出', 'Experiments and outputs', '실험과 산출물'], status: ['进度与风险', 'Status and risks', '진행과 위험'], pub: ['投稿去向', 'Candidate journals', '투고 후보'],
    ref: ['参考文献', 'References', '참고문헌'], end: ['结语', 'Close', '맺음'] },
  draw: [drawInt, drawProbe, drawDead, drawProd],
});
})();
