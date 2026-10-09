// Bound deck ("Occupancy model and network bounds"): the strings and charts of this briefing.
// Paging, language, notes, contents, glossary, layout and the PDF link come from ../shared/deck-core.js (README.md).
(() => {
'use strict';
const D = window.DATA;
const { LI, $, el, frame, fitH, anim, spread, lin, yTitle, swatches, hover, fmt } = Deck;

// ---------- strings used inside charts: [zh, en, ko] ----------
const T = {
  title: ['占路模型与路网上界', 'Occupancy Model and Bounds', '점유 모형과 도로망 상한'],
  yupu: ['玉浦', 'Okpo', '옥포'], yantai: ['烟台', 'Yantai', '옌타이'],
  perDay: ['个/日', 'a day', '건/일'],
  // dual-feasible functions
  dffLbl: ['宽度份额与对偶可行函数', 'Width share and the dual-feasible functions', '폭 비율과 쌍대 실행 가능 함수'],
  dffX: ['宽度份额 x = d / C', 'Width share x = d / C', '폭 비율 x = d / C'], dffY: ['计入的份额 u(x)', 'Counted share u(x)', '계산되는 비율 u(x)'],
  u0: ['u⁽⁰⁾(x) = x（T1 的行）', 'u⁽⁰⁾(x) = x (the T1 row)', 'u⁽⁰⁾(x) = x (T1의 행)'], u1: ['u⁽¹⁾：过半按 1 计', 'u⁽¹⁾: above 1/2 counts as 1', 'u⁽¹⁾: 1/2 초과는 1'],
  u2: ['u⁽²⁾：1/3–2/3 按 1/2 计', 'u⁽²⁾: 1/3–2/3 counts as 1/2', 'u⁽²⁾: 1/3–2/3은 1/2'],
  r161a: ['道路161：空车份额 6.5/10 = 0.65', 'Road 161: an empty takes 6.5/10 = 0.65', '도로161: 공차 비율 6.5/10 = 0.65'],
  r161b: ['两车放不下 → u⁽¹⁾ 记 1', 'two cannot fit → u⁽¹⁾ counts 1', '두 대 불가 → u⁽¹⁾는 1'],
  // per-seed bounds
  seedLbl: ['逐种子的 T1 与 T1′', 'T1 and T1′ seed by seed', '시드별 T1과 T1′'],
  seedY: ['路网上界（个/日）', 'Network bound (tasks a day)', '도로망 상한 (건/일)'], seedX: ['种子 101–110', 'seeds 101–110', '시드 101–110'],
  mean: ['{yard} · T1′ 均值 {v}（虚线）', '{yard} · T1′ mean {v} (dashed)', '{yard} · T1′ 평균 {v} (점선)'],
  T1: ['T1（空心）', 'T1 (hollow)', 'T1 (빈 점)'],
  r161: ['道路161', 'road 161', '도로161'], r010: ['道路010-6', 'road 010-6', '도로010-6'], r026: ['道路026', 'road 026', '도로026'],
  b014: ['建筑014 的门', 'building 014 doors', '건물014 문'], b007: ['建筑007 的门', 'building 007 door', '건물007 문'],
  seedTip: ['{yard} · 种子 {s}<br>T1 = {a}，T1′ = {b}<br>取紧：{r}（对偶价格 {p}）', '{yard} · seed {s}<br>T1 = {a}, T1′ = {b}<br>binds: {r} (dual price {p})', '{yard} · 시드 {s}<br>T1 = {a}, T1′ = {b}<br>결속: {r} (쌍대 가격 {p})'],
  rdOk: ['玉浦主情景 T1 → T1′，10 个种子均值（个/日，−{pct}%）；T1′ 种子间 {lo}–{hi}', 'Okpo main scenario, T1 → T1′, mean of 10 seeds (a day, −{pct}%); T1′ ranges {lo}–{hi} across seeds', '옥포 주 시나리오 T1 → T1′, 시드 10개 평균 (하루, −{pct}%), T1′ 시드 간 {lo}–{hi}'],
  rdEr: ['玉浦搭载组合（P6 15%），−{pct}%；{n}/10 个种子取紧在道路161', 'Okpo erection mix (P6 15%), −{pct}%; {n} of 10 seeds bind on road 161', '옥포 탑재 조합 (P6 15%), −{pct}%, 시드 10개 중 {n}개가 도로161에서 결속'],
  rdYt: ['烟台主情景 T1′；{n}/10 个种子取紧在建筑014 的两个门。T1 = {t1}：T1 重复计入卸货后的让出净空，只作对照', 'Yantai main scenario T1′; {n} of 10 seeds bind at the two doors of building 014. T1 = {t1}: T1 counts the clearance after unloading twice and serves only for comparison', '옌타이 주 시나리오 T1′, 시드 10개 중 {n}개가 건물014의 두 문에서 결속. T1 = {t1}: 하역 후 여유를 두 번 계산해 비교용'],
  // case-by-case check
  chkLbl: ['吞吐与本例 T1′ 之比的分布', 'Distribution of throughput over each point\'s T1′', '처리량 ÷ 점별 T1′의 분포'],
  chkX: ['吞吐 ÷ 本例完成组合的 T1′', 'Throughput ÷ T1′ of the completed mix', '처리량 ÷ 완료 조합의 T1′'], chkY: ['仿真点数', 'Simulation points', '시뮬레이션 점 수'],
  chkOne: ['T1′（比值 = 1）', 'T1′ (ratio = 1)', 'T1′ (비율 = 1)'], chkNone: ['超过：0 个点', 'above: 0 points', '초과: 0점'],
  chkTip: ['{yard}：比值 {a}–{b}，{n} 个点', '{yard}: ratio {a}–{b}, {n} points', '{yard}: 비율 {a}–{b}, {n}점'],
  rdOver: ['超过 T1′ 的点：玉浦 {a}、烟台 {b} 个占路点（整条路径预约与参照规则，高峰与饱和）', 'Points above T1′, of {a} on Okpo and {b} on Yantai (reservation and the reference rule, peak and saturated)', 'T1′을 넘는 점: 옥포 {a}점, 옌타이 {b}점 중 (예약과 참조 규칙, 피크와 포화)'],
  rdMax: ['最大比值：玉浦 ρ = 0.99 档、参照规则（瞬移疏解）、饱和 K = {k}；烟台最大 {y}', 'Largest ratio: Okpo, ρ = 0.99, reference rule (teleport clearing), saturated K = {k}; Yantai\'s largest {y}', '최대 비율: 옥포 ρ = 0.99, 참조 규칙 (순간이동 해소), 포화 K = {k}, 옌타이 최대 {y}'],
  rdHigh: ['比值 ≥ 0.9 的点中，名义吊车负荷 ρ ≥ 0.92 的几档所占的个数：吊车几乎满负荷，上界几乎贴合', 'Of the points with ratio ≥ 0.9, those from settings with nominal crane load ρ ≥ 0.92: cranes nearly saturated, bound nearly reached', '비율 ≥ 0.9인 점 중 명목 크레인 부하 ρ ≥ 0.92 단계의 점 수: 크레인이 거의 포화, 상한에 거의 닿음'],
  // robustness
  robLbl: ['道路161 的三种改动：T1′ 与预约吞吐', 'Three changes to road 161: T1′ and reservation throughput', '도로161의 세 가지 변경: T1′과 예약 처리량'],
  robY: ['个/日', 'Tasks a day', '건/일'],
  vbase: ['现模型', 'current model', '현 모형'], vw12: ['改宽到 12 m', 'widened to 12 m', '12 m로 확폭'], vsect: ['按停靠点分段闭塞', 'sectioned at stops', '정차 지점별 구간 폐색'], vbay: ['分段 + 两处会车点', 'sectioned + 2 passing bays', '구간화 + 대피 구간 2곳'],
  gMain: ['主情景（预约 K = 120）', 'Main scenario (reservation K = 120)', '주 시나리오 (예약 K = 120)'],
  gEr: ['搭载组合 P6 15%（预约 K = 100）', 'Erection mix P6 15% (reservation K = 100)', '탑재 조합 P6 15% (예약 K = 100)'],
  lgT1t: ['T1′（10 个种子）', 'T1′ (10 seeds)', 'T1′ (시드 10개)'], lgRes: ['整条路径预约的饱和吞吐（3 个种子）', 'Whole-route reservation, saturated throughput (3 seeds)', '전체 경로 예약 포화 처리량 (시드 3개)'],
  bindRoad: ['道路{r}（{n}/10 个种子）', 'road {r} ({n} of 10 seeds)', '도로{r} (시드 10개 중 {n})'],
  bindDock: ['道路{r} 的坞前 50 m 段（{n}/10）', 'the 50 m piece of road {r} at the dock ({n} of 10)', '도로{r}의 도크 앞 50 m 구간 (10개 중 {n})'],
  lgInt: ['两者之间：运力区间', 'between them: the capacity interval', '그 사이: 운송 능력 구간'],
  robTip: ['{g} · {v}<br>T1′ = {a}；预约 = {b}<br>T1′ 取紧：{bind}', '{g} · {v}<br>T1′ = {a}; reservation = {b}<br>T1′ binds: {bind}', '{g} · {v}<br>T1′ = {a}, 예약 = {b}<br>T1′ 결속: {bind}'],
  // sensitivity table
  sScen: ['情景', 'Scenario', '시나리오'], sOk: ['玉浦 T1′', 'Okpo T1′', '옥포 T1′'], sYt: ['烟台 T1′', 'Yantai T1′', '옌타이 T1′'],
  main: ['主情景', 'Main scenario', '주 시나리오'], 'w+1.5': ['路宽 +1.5 m', 'Widths +1.5 m', '도로 폭 +1.5 m'], 'w-1.5': ['路宽 −1.5 m', 'Widths −1.5 m', '도로 폭 −1.5 m'],
  empty_excl: ['空车处处独占', 'Empties exclusive everywhere', '공차 어디서나 독점'], empty_free: ['空车处处可交会', 'Empties pass everywhere', '공차 어디서나 교행'],
};
const t = k => T[k][LI[Deck.lang]];
const BC = { r161: 'var(--oxide)', r010: 'var(--steel)', r026: 'var(--amber-hi)', b014: 'var(--good)', b007: 'var(--ink3)' };
const f0 = v => Math.round(v).toLocaleString('en-US');
const pathOf = pts => pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('');
const mean = a => a.reduce((s, v) => s + v, 0) / a.length;
function niceStep(top) { const p = 10 ** Math.floor(Math.log10(top)); return [1, 2, 2.5, 5, 10].map(k => k * p).find(s => top / s <= 6); }
function grid(s, y, ticks, m, W, fy) {
  const g = el('g', { class: 'grid' }, s);
  ticks.forEach(v => { el('line', { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v) }, g); el('text', { x: m.l - 8, y: y(v) + 4, 'text-anchor': 'end' }, s, fy(v)); });
}
const axis = (s, m, W, H) => el('path', { d: `M${m.l} ${m.t}V${H - m.b}H${W - m.r}` }, el('g', { class: 'axis' }, s));
const stat = (num, p) => `<div class="stat"><span class="num">${num}</span><p>${p}</p></div>`;

// ---------- the dual-feasible functions u(0), u(1), u(2) of Fekete & Schepers (drawn from their definition) ----------
function drawDff() {
  const W = 520, H = fitH('cDff', W, 380), m = { l: 56, r: 16, t: 18, b: 48 };
  const s = frame('cDff', W, H, t('dffLbl'));
  const x = lin(0, 1, m.l, W - m.r), y = lin(0, 1.08, H - m.b, m.t);
  const TK = [[0, '0'], [1 / 3, '1/3'], [1 / 2, '1/2'], [2 / 3, '2/3'], [1, '1']];
  grid(s, y, TK.map(k => k[0]), m, W, v => TK.find(k => k[0] === v)[1]);
  TK.forEach(([v, l]) => el('text', { x: x(v), y: H - m.b + 17, 'text-anchor': 'middle' }, s, l));
  axis(s, m, W, H);
  el('text', { x: (m.l + W - m.r) / 2, y: H - 8, 'text-anchor': 'middle' }, s, t('dffX'));
  yTitle(s, 16, (m.t + H - m.b) / 2, t('dffY'));
  const seg = (a, b, v, c, w, dash, d) => anim(el('path', { d: `M${x(a)} ${y(v)}H${x(b)}`, pathLength: 1, style: `stroke:${c};stroke-width:${w};fill:none;${dash ? 'stroke-dasharray:' + dash : ''}` }, s), dash ? 'a-fade' : 'a-draw', d);
  const dot = (a, v, c, open, d) => anim(el('circle', { cx: x(a), cy: y(v), r: 4.2, style: open ? `fill:var(--paper);stroke:${c};stroke-width:1.8` : `fill:${c};stroke:var(--paper);stroke-width:1` }, s), 'a-pop', d);
  anim(el('path', { d: `M${x(0)} ${y(0)}L${x(1)} ${y(1)}`, pathLength: 1, style: 'stroke:var(--steel);stroke-width:2.4;fill:none' }, s), 'a-draw', .2);
  // u1: 0 below 1/2, 1/2 at 1/2, 1 above
  seg(0, 0.5, 0, 'var(--oxide)', 4, '', .5); seg(0.5, 1, 1, 'var(--oxide)', 4, '', .7);
  dot(0.5, 0, 'var(--oxide)', true, 1); dot(0.5, 1, 'var(--oxide)', true, 1); dot(0.5, 0.5, 'var(--oxide)', false, 1.05);
  // u2: 0 below 1/3, 1/3 at 1/3, 1/2 between, 2/3 at 2/3, 1 above
  seg(0, 1 / 3, 0, 'var(--amber-hi)', 2.2, '6 4', .9); seg(1 / 3, 2 / 3, 0.5, 'var(--amber-hi)', 2.6, '', .9); seg(2 / 3, 1, 1, 'var(--amber-hi)', 2.2, '6 4', .9);
  [[1 / 3, 0], [1 / 3, 0.5], [2 / 3, 0.5], [2 / 3, 1]].forEach(([a, v]) => dot(a, v, 'var(--amber-hi)', true, 1.2));
  dot(1 / 3, 1 / 3, 'var(--amber-hi)', false, 1.25); dot(2 / 3, 2 / 3, 'var(--amber-hi)', false, 1.25);
  // road 161: an empty transporter's share 6.5 / 10
  const g = anim(el('g', {}, s), 'a-fade', 1.5);
  el('path', { d: `M${x(0.65)} ${y(0)}V${y(1)}`, style: 'stroke:var(--ink);stroke-width:1.2;stroke-dasharray:2 3' }, g);
  el('circle', { cx: x(0.65), cy: y(0.65), r: 5.5, style: 'fill:var(--steel);stroke:var(--ink);stroke-width:1' }, g);
  el('circle', { cx: x(0.65), cy: y(1), r: 5.5, style: 'fill:var(--oxide);stroke:var(--ink);stroke-width:1' }, g);
  el('text', { x: x(0.65) - 10, y: y(0.86), 'text-anchor': 'end', class: 't-strong' }, g, t('r161a'));
  el('text', { x: x(0.65) - 10, y: y(0.86) + 17, 'text-anchor': 'end', class: 't-ox' }, g, t('r161b'));
  swatches('lgDff', [['var(--steel)', t('u0'), 'height:3px;border:0'], ['var(--oxide)', t('u1'), 'height:4px;border:0'], ['var(--amber-hi)', t('u2'), 'height:3px;border:0']]);
}

// ---------- per-seed T1 and T1' on both yards ----------
function drawSeeds() {
  const W = 560, H = fitH('cSeeds', W, 380), m = { l: 60, r: 12, t: 30, b: 42 };
  const s = frame('cSeeds', W, H, t('seedLbl'));
  const x = lin(-0.7, 20.7, m.l, W - m.r), y = lin(1000, 2400, H - m.b, m.t);
  grid(s, y, [1000, 1200, 1400, 1600, 1800, 2000, 2200, 2400], m, W, f0);
  axis(s, m, W, H);
  yTitle(s, 14, (m.t + H - m.b) / 2, t('seedY'));
  el('text', { x: (m.l + W - m.r) / 2, y: H - 8, 'text-anchor': 'middle' }, s, t('seedX'));
  [['yupu', 0], ['yantai', 11]].forEach(([yd, o], k) => {
    const S = D.seeds[yd], c0 = x(o), c1 = x(o + 9), mt = mean(S.map(r => r.T1t));
    el('text', { x: (c0 + c1) / 2, y: m.t - 12, 'text-anchor': 'middle', class: 't-title' }, s, fmt(t('mean'), { yard: t(yd), v: f0(mt) }));
    el('text', { x: c0, y: H - m.b + 17, 'text-anchor': 'middle' }, s, String(S[0].seed));
    el('text', { x: c1, y: H - m.b + 17, 'text-anchor': 'middle' }, s, String(S[9].seed));
    el('path', { d: `M${c0 - 10} ${y(mt)}H${c1 + 10}`, style: 'stroke:var(--ink2);stroke-width:1.2;stroke-dasharray:5 4' }, s);
    S.forEach((r, i) => {
      const cx = x(o + i);
      anim(el('path', { d: `M${cx} ${y(r.T1)}V${y(r.T1t)}`, style: 'stroke:var(--ink3);stroke-width:1.4' }, s), 'a-fade', .3 + .5 * spread(i + 3 * k));
      anim(el('circle', { cx, cy: y(r.T1), r: 4.2, style: 'fill:var(--paper);stroke:var(--ink3);stroke-width:1.6' }, s), 'a-pop', .4 + .5 * spread(i + 3 * k));
      const c = anim(el('circle', { cx, cy: y(r.T1t), r: 6, style: `fill:${BC[r.bind]};stroke:var(--paper);stroke-width:1.2` }, s), 'a-pop', .7 + .5 * spread(i + 3 * k));
      hover(c, () => fmt(t('seedTip'), { yard: t(yd), s: r.seed, a: f0(r.T1), b: f0(r.T1t), r: t(r.bind), p: r.price.toFixed(1) }));
    });
  });
  swatches('lgSeeds', [['transparent', t('T1'), 'border:1.6px solid var(--ink3);border-radius:50%'],
    ...['r161', 'r010', 'r026', 'b014', 'b007'].map(k => [BC[k], 'T1′ · ' + t(k), 'border-radius:50%'])]);
  const ok = D.sens.yupu.main, yt = D.sens.yantai.main, er = D.erection;
  $('seedRead').innerHTML = stat(`${f0(ok.T1)} → ${f0(ok.T1t)}`, fmt(t('rdOk'), { pct: Math.round(100 * (1 - ok.T1t / ok.T1)), lo: f0(ok.lo), hi: f0(ok.hi) }))
    + stat(`${f0(er.T1)} → ${f0(er.T1t)}`, fmt(t('rdEr'), { pct: Math.round(100 * (1 - er.T1t / er.T1)), n: er.n161 }))
    + stat(f0(yt.T1t), fmt(t('rdYt'), { n: D.seeds.yantai.filter(r => r.bind === 'b014').length, t1: f0(yt.T1) }));
}

// ---------- case-by-case check: histogram of throughput / T1' over the T21 points ----------
function drawChk() {
  const W = 560, H = fitH('cChk', W, 380), m = { l: 58, r: 16, t: 16, b: 46 };
  const s = frame('cChk', W, H, t('chkLbl'));
  const hy = D.hist.yupu, ht = D.hist.yantai, tot = hy.map((v, i) => v + ht[i]);
  const st = niceStep(Math.max(...tot) * 1.12), top = Math.ceil(Math.max(...tot) * 1.12 / st) * st;
  const x = lin(0, 1.1, m.l, W - m.r), y = lin(0, top, H - m.b, m.t);
  const ticks = []; for (let v = 0; v <= top; v += st) ticks.push(v);
  grid(s, y, ticks, m, W, f0);
  [0, 0.2, 0.4, 0.6, 0.8, 1].forEach(v => el('text', { x: x(v), y: H - m.b + 17, 'text-anchor': 'middle' }, s, v.toFixed(1)));
  axis(s, m, W, H);
  el('text', { x: (m.l + W - m.r) / 2, y: H - 8, 'text-anchor': 'middle' }, s, t('chkX'));
  yTitle(s, 14, (m.t + H - m.b) / 2, t('chkY'));
  const bw = x(0.05) - x(0) - 2;
  hy.forEach((a, i) => {
    const b = ht[i], x0 = x(0.05 * i) + 1;
    [[a, 0, 'var(--steel)', 'yupu'], [b, a, 'var(--amber-hi)', 'yantai']].forEach(([n, base, c, yd], k) => {
      if (!n) return;
      const r = anim(el('rect', { x: x0, y: y(base + n), width: bw, height: y(base) - y(base + n), style: `fill:${c}` }, s), 'a-y', .2 + .5 * spread(i) + .1 * k);
      hover(r, () => fmt(t('chkTip'), { yard: t(yd), a: (0.05 * i).toFixed(2), b: (0.05 * i + 0.05).toFixed(2), n: f0(n) }));
    });
  });
  const g = anim(el('g', {}, s), 'a-fade', 1.1);
  el('path', { d: `M${x(1)} ${m.t}V${H - m.b}`, style: 'stroke:var(--oxide);stroke-width:2;stroke-dasharray:6 4' }, g);
  el('text', { x: x(1) - 6, y: m.t + 12, 'text-anchor': 'end', class: 't-ox' }, g, t('chkOne'));
  el('text', { x: x(1.05), y: y(0) - 8, 'text-anchor': 'middle', class: 't-ox' }, g, '0');
  el('text', { x: x(1) - 6, y: m.t + 30, 'text-anchor': 'end', style: 'fill:var(--oxide);font-size:12px' }, g, t('chkNone'));
  swatches('lgChk', [['var(--steel)', t('yupu')], ['var(--amber-hi)', t('yantai')], ['var(--oxide)', t('chkOne'), 'height:2px;border:0']]);
  const C = D.check;
  $('chkRead').innerHTML = stat(`0 <small>/ ${f0(C.yupu.n + C.yantai.n)}</small>`, fmt(t('rdOver'), { a: f0(C.yupu.n), b: f0(C.yantai.n) }))
    + stat(C.yupu.max.toFixed(3), fmt(t('rdMax'), { k: C.yupu.at.K, y: C.yantai.max.toFixed(3) }))
    + stat(`${f0(D.high[1])} <small>/ ${f0(D.high[0])}</small>`, t('rdHigh'));
}

// ---------- robustness probe on road 161 (author's review, appendix A) ----------
function drawRob() {
  const W = 560, H = fitH('cRob', W, 380), m = { l: 68, r: 12, t: 22, b: 52 };
  const s = frame('cRob', W, H, t('robLbl'));
  const x = lin(-0.75, 8.75, m.l, W - m.r), y = lin(0, 2000, H - m.b, m.t);
  grid(s, y, [0, 500, 1000, 1500, 2000], m, W, f0);
  axis(s, m, W, H);
  yTitle(s, 14, (m.t + H - m.b) / 2, t('robY'));
  const half = (x(1) - x(0)) * 0.36;
  [['main', 0, 'gMain'], ['erection', 5, 'gEr']].forEach(([key, o, gl], k) => {
    const R = D.robust[key];
    el('text', { x: (x(o) + x(o + 3)) / 2, y: H - 10, 'text-anchor': 'middle', class: 't-title' }, s, t(gl));
    R.forEach((r, i) => {
      const cx = x(o + i), d = .2 + .15 * i + .3 * k;
      el('text', { x: cx, y: H - m.b + 17, 'text-anchor': 'middle', class: 't-strong' }, s, String(i + 1));
      const b = anim(el('rect', { x: cx - half, y: y(r.T1t), width: 2 * half, height: y(0) - y(r.T1t), style: 'fill:var(--oxide-soft);stroke:var(--oxide);stroke-width:1.4' }, s), 'a-y', d);
      el('text', { x: cx, y: y(r.T1t) - 6, 'text-anchor': 'middle', class: 't-ox' }, s, f0(r.T1t));
      anim(el('path', { d: `M${cx} ${y(r.res)}V${y(r.T1t)}`, style: 'stroke:var(--ink2);stroke-width:1.4;stroke-dasharray:3 3' }, s), 'a-fade', d + .5);
      const c = anim(el('circle', { cx, cy: y(r.res), r: 6, style: 'fill:var(--steel);stroke:var(--paper);stroke-width:1.2' }, s), 'a-pop', d + .4);
      el('text', { x: cx, y: y(r.res) + 19, 'text-anchor': 'middle', style: 'fill:var(--steel);font-size:12px;font-weight:600' }, s, f0(r.res));
      const bind = () => r.bind.map(([road, n, dock]) => fmt(t(dock ? 'bindDock' : 'bindRoad'), { r: road, n })).join(', ');
      [b, c].forEach(n => hover(n, () => fmt(t('robTip'), { g: t(gl), v: t('v' + r.v), a: f0(r.T1t), b: f0(r.res), bind: bind() })));
    });
  });
  swatches('lgRob', [['var(--oxide-soft)', t('lgT1t'), 'border:1px solid var(--oxide)'], ['var(--steel)', t('lgRes'), 'border-radius:50%'], ['var(--ink2)', t('lgInt'), 'height:2px;border:0'],
    ...['base', 'w12', 'sect', 'bay'].map((v, i) => ['transparent', `<b>${i + 1}</b> ${t('v' + v)}`, 'display:none'])]);
}

// ---------- sensitivity table (both yards, five scenarios) ----------
function fillSens() {
  const sc = ['main', 'w+1.5', 'w-1.5', 'empty_excl', 'empty_free'];
  const cell = (y, k) => { const v = D.sens[y][k].T1t, b = D.sens[y].main.T1t, d = Math.round(100 * (v / b - 1));
    return `<td class="mono">${f0(v)}${k === 'main' ? '' : ` <span class="tiny">${d > 0 ? '+' : d < 0 ? '−' : '±'}${Math.abs(d)}%</span>`}</td>`; };
  $('sensTbl').innerHTML = `<thead><tr><th>${t('sScen')}</th><th>${t('sOk')}</th><th>${t('sYt')}</th></tr></thead><tbody>`
    + sc.map(k => `<tr><td>${t(k)}</td>${cell('yupu', k)}${cell('yantai', k)}</tr>`).join('') + '</tbody>';
}

Deck.start({
  strings: T,
  sections: { intro: ['导读', 'Overview', '개요'], q: ['问题与定位', 'Question and place', '질문과 위치'], model: ['占路模型', 'Occupancy model', '점유 모형'],
    bound: ['路网上界', 'Network bound', '도로망 상한'], robust: ['稳健性与关键要素', 'Robustness and key elements', '강건성과 핵심 요소'],
    plan: ['进度与下一步', 'Progress and next steps', '진행과 다음 단계'], pos: ['定位与去向', 'Positioning and venues', '위치와 투고처'],
    ref: ['参考文献', 'References', '참고문헌'], end: ['小结', 'Wrap-up', '정리'] },
  draw: [drawDff, drawSeeds, drawChk, drawRob, fillSens],
});
})();
