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
  sc_main: ['主情景', 'main', '주 시나리오'], sc_erection: ['搭载组合', 'erection mix', '탑재 조합'], sc_crane: ['吊车节拍', 'crane cadence', '크레인 주기'],
  roadN: ['道路{r}', 'road {r}', '도로{r}'], door014: ['建筑014 入口', 'building 014 door', '건물014 출입구'],
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
  mean: ['{yard} · T1′ 均值 {v}', '{yard} · T1′ mean {v}', '{yard} · T1′ 평균 {v}'],
  T1: ['T1（空心）', 'T1 (hollow)', 'T1 (빈 점)'], lgMean: ['10 个种子均值（虚线）', 'mean of 10 seeds (dashed)', '시드 10개 평균 (점선)'],
  lgSys: ['系统 T1′（实线，T23）', 'system T1′ (solid, T23)', '시스템 T1′ (실선, T23)'],
  r161: ['道路161', 'road 161', '도로161'], r010: ['道路010-6', 'road 010-6', '도로010-6'], r026: ['道路026', 'road 026', '도로026'],
  b014: ['建筑014 的门', 'building 014 doors', '건물014 문'], b007: ['建筑007 的门', 'building 007 door', '건물007 문'],
  seedTip: ['{yard} · 种子 {s}<br>T1 = {a}，T1′ = {b}<br>取紧：{r}（对偶价格 {p}）', '{yard} · seed {s}<br>T1 = {a}, T1′ = {b}<br>binds: {r} (dual price {p})', '{yard} · 시드 {s}<br>T1 = {a}, T1′ = {b}<br>결속: {r} (쌍대 가격 {p})'],
  rdOk: ['玉浦主情景 T1 → T1′，10 个种子均值（个/日，−{pct}%）；种子间 {lo}–{hi}，系统 T1′ {sys}', 'Okpo main scenario, T1 → T1′, mean of 10 seeds (a day, −{pct}%); seeds range {lo}–{hi}, system T1′ {sys}', '옥포 주 시나리오 T1 → T1′, 시드 10개 평균 (하루, −{pct}%), 시드 간 {lo}–{hi}, 시스템 T1′ {sys}'],
  rdEr: ['玉浦搭载组合（P6 15%），−{pct}%；{n}/10 个种子取紧在道路161；系统 T1′ {sys}', 'Okpo erection mix (P6 15%), −{pct}%; {n} of 10 seeds bind on road 161; system T1′ {sys}', '옥포 탑재 조합 (P6 15%), −{pct}%, 시드 10개 중 {n}개가 도로161에서 결속, 시스템 T1′ {sys}'],
  rdYt: ['烟台主情景 T1′；{n}/10 个种子取紧在建筑014 的两个门；系统 T1′ {sys}。T1 = {t1} 重复计入卸货后的让出净空，只作对照', 'Yantai main scenario T1′; {n} of 10 seeds bind at the two doors of building 014; system T1′ {sys}. T1 = {t1} counts the clearance after unloading twice and serves only for comparison', '옌타이 주 시나리오 T1′, 시드 10개 중 {n}개가 건물014의 두 문에서 결속, 시스템 T1′ {sys}. T1 = {t1}은 하역 후 여유를 두 번 계산해 비교용'],
  // system T1' and convergence
  convLbl: ['抽样 T1′ 相对系统 T1′ 的偏差随 N 收窄', 'Sampled T1′ against the system T1′ as N grows', '추출 T1′과 시스템 T1′의 편차가 N에 따라 줄어든다'],
  convY: ['相对系统 T1′ 的偏差', 'Deviation from the system T1′', '시스템 T1′ 대비 편차'],
  convZero: ['系统 T1′', 'system T1′', '시스템 T1′'],
  convN: ['N = {n} 个任务', 'N = {n} tasks', 'N = {n}건'], convN0: ['N = 2,000（逐种子批次）', 'N = 2,000 (per-seed batches)', 'N = 2,000 (시드별 배치)'],
  convMean: ['10 个种子均值', 'mean of 10 seeds', '시드 10개 평균'],
  convTip: ['{yard} · {sc} · N = {n}<br>10 个种子 {lo}–{hi}（{a} 至 {b}）<br>系统 T1′ {sys}', '{yard} · {sc} · N = {n}<br>10 seeds {lo}–{hi} ({a} to {b})<br>system T1′ {sys}', '{yard} · {sc} · N = {n}<br>시드 10개 {lo}–{hi} ({a} ~ {b})<br>시스템 T1′ {sys}'],
  sysScen: ['情景', 'Scenario', '시나리오'], sysOk: ['玉浦：系统 T1′ · 取紧', 'Okpo: system T1′ · binds', '옥포: 시스템 T1′ · 결속'], sysYt: ['烟台：系统 T1′ · 取紧', 'Yantai: system T1′ · binds', '옌타이: 시스템 T1′ · 결속'],
  // case-by-case check
  chkLbl: ['吞吐与本例 T1′ 之比的分布', 'Distribution of throughput over each point\'s T1′', '처리량 ÷ 점별 T1′의 분포'],
  chkX: ['吞吐 ÷ 本例完成组合的 T1′', 'Throughput ÷ T1′ of the completed mix', '처리량 ÷ 완료 조합의 T1′'], chkY: ['仿真点数', 'Simulation points', '시뮬레이션 점 수'],
  chkOne: ['T1′（比值 = 1）', 'T1′ (ratio = 1)', 'T1′ (비율 = 1)'], chkNone: ['超过：0 个点', 'above: 0 points', '초과: 0점'],
  lgT21: ['T21：吊车节拍各档', 'T21: crane-cadence settings', 'T21: 크레인 주기 각 단계'], lgT22: ['T22：新规则、分段与全厂任务量', 'T22: new rule, sections, plant volumes', 'T22: 새 규칙, 구간화, 전체 작업량'],
  chkTip: ['{who}：比值 {a}–{b}，{n} 个点', '{who}: ratio {a}–{b}, {n} points', '{who}: 비율 {a}–{b}, {n}점'],
  rdOver: ['超过 T1′ 的点：T21 {a} 个（预约与参照规则，高峰与饱和），T22 {b} 个（再加安全放行、坞前道路分段、全厂任务量、16 h / 24 h）', 'Points above T1′: of {a} in T21 (reservation and the reference rule, peak and saturated) and {b} in T22 (adding safe release, the sectioned dock road, plant-level volumes, 16 h and 24 h days)', 'T1′을 넘는 점: T21 {a}점 (예약과 참조 규칙, 피크와 포화), T22 {b}점 (안전 허가, 도크 앞 도로 구간화, 전체 작업량, 16 h·24 h 추가)'],
  rdMax: ['最大比值：T22 玉浦 ρ = 0.99、坞前道路分段、整条路径预约、K = {k}；T21 最大 {y}', 'Largest ratio: T22, Okpo, ρ = 0.99, sectioned dock road, whole-route reservation, K = {k}; T21\'s largest {y}', '최대 비율: T22 옥포 ρ = 0.99, 도크 앞 도로 구간화, 전체 경로 예약, K = {k}, T21 최대 {y}'],
  rdHigh: ['比值 ≥ 0.9 的点中，名义吊车负荷 ρ ≥ 0.92 的几档所占的个数：吊车几乎满负荷，上界几乎贴合', 'Of the points with ratio ≥ 0.9, those from settings with nominal crane load ρ ≥ 0.92: cranes nearly saturated, bound nearly reached', '비율 ≥ 0.9인 점 중 명목 크레인 부하 ρ ≥ 0.92 단계의 점 수: 크레인이 거의 포화, 상한에 거의 닿음'],
  // route slack
  slkLbl: ['上界中的路线余量（系统 T1′ 为 0）', 'Route slack in the bound (system T1′ = 0)', '상한의 경로 여유 (시스템 T1′ = 0)'],
  slkX: ['相对系统 T1′ 的增量', 'Gain over the system T1′', '시스템 T1′ 대비 증가'],
  cEnt: ['入口取紧', 'an entrance binds', '출입구 결속'], cDock: ['坞的停靠路段取紧', 'a dock stopping road binds', '도크 정차 구간 결속'], cCor: ['贯通走廊取紧', 'a through corridor binds', '관통 통로 결속'],
  lgLo: ['实色：下限（回代可行值）', 'solid: lower (back-substituted feasible value)', '진한 색: 하한 (역대입 실행 가능 값)'], lgHi: ['浅色延伸到上限（T1″）', 'light: up to the upper value (T1″)', '옅은 색: 상한 (T1″)까지'],
  slkTip: ['{yard} · {sc}<br>取紧（T1′）：{res}<br>系统 T1′ {sys} → 回代 {feas} → T1″ {pp}', '{yard} · {sc}<br>binds (T1′): {res}<br>system T1′ {sys} → back-substituted {feas} → T1″ {pp}', '{yard} · {sc}<br>결속 (T1′): {res}<br>시스템 T1′ {sys} → 역대입 {feas} → T1″ {pp}'],
  // plateau / bound
  plLbl: ['平台 / 上界', 'Plateau / bound', '평탄 구간 / 상한'], plY: ['平台 ÷ T1′', 'Plateau ÷ T1′', '평탄 구간 ÷ T1′'],
  plRes: ['整条路径预约', 'whole-route reservation', '전체 경로 예약'], plSeg: ['参照规则（瞬移疏解）', 'reference rule (teleport clearing)', '참조 규칙 (순간이동 해소)'],
  plOne: ['= 上界', '= bound', '= 상한'], plSys: ['* 系统口径：吊车节拍下完成组合口径不可比', '* system caliber: the completed-mix caliber is not comparable under crane cadence', '* 시스템 기준: 크레인 주기에서는 완료 조합 기준이 비교 불가'],
  plHot: ['上界取紧：改路值钱', 'bound binds: road upgrades pay', '상한 결속: 도로 개조가 값지다'], plCold: ['远低于 1：先改编排', 'far below 1: fix orchestration first', '1보다 훨씬 낮음: 편성 먼저'],
  plTip: ['{yard} · {sc} · {rule}<br>平台 {p} 个/日<br>÷ 完成组合 T1′ {mix}；÷ 系统 T1′ {sys}；÷ T1″ {pp}', '{yard} · {sc} · {rule}<br>plateau {p} a day<br>÷ completed-mix T1′ {mix}; ÷ system T1′ {sys}; ÷ T1″ {pp}', '{yard} · {sc} · {rule}<br>평탄 구간 하루 {p}건<br>÷ 완료 조합 T1′ {mix}, ÷ 시스템 T1′ {sys}, ÷ T1″ {pp}'],
  // exchange-rate table
  rtRes: ['资源 · 情景', 'Resource · scenario', '자원 · 시나리오'], rtA: ['最短路派车（T1′）', 'Shortest-path dispatch (T1′)', '최단 경로 배차 (T1′)'], rtB: ['允许绕行（T1″）', 'Detours allowed (T1″)', '우회 허용 (T1″)'],
  rtD10: ['占用 −10%：+{v}', 'holds −10%: +{v}', '점유 −10%: +{v}'], rtFirst: ['（一阶 +{v}）', ' (first-order +{v})', ' (1차 +{v})'], rtW1: ['加宽 1 m：+{v}', 'widen 1 m: +{v}', '1 m 확폭: +{v}'], rtW0: ['加宽 1 m：0', 'widen 1 m: 0', '1 m 확폭: 0'],
  rtZero: ['0', '0', '0'], rtSame: ['同左（入口与路线无关）', 'same (entrances do not depend on routes)', '왼쪽과 같음 (출입구는 경로와 무관)'],
  // capacity interval by granularity
  ivLbl: ['运力区间 [最好的无死锁规则, T1′]：整段与分段', 'Capacity interval [best deadlock-free rule, T1′]: whole road and sectioned', '운송 능력 구간 [가장 좋은 교착 없는 규칙, T1′]: 전체 구간과 구간화'],
  ivY: ['个/日', 'Tasks a day', '건/일'], ivWhole: ['整段', 'whole', '전체'], ivStops: ['分段', 'sectioned', '구간화'],
  gyMain: ['玉浦主情景', 'Okpo main', '옥포 주 시나리오'], gtMain: ['烟台主情景', 'Yantai main', '옌타이 주 시나리오'], gyEr: ['玉浦搭载组合', 'Okpo erection mix', '옥포 탑재 조합'],
  lgIv: ['区间：整条路径预约的平台 → T1′', 'interval: reservation plateau → T1′', '구간: 전체 경로 예약 평탄 구간 → T1′'],
  lgSafe: ['安全放行（segment_safe）的平台', 'safe release (segment_safe) plateau', '안전 허가 (segment_safe) 평탄 구간'],
  lgRef: ['参照规则（瞬移疏解）的平台', 'reference rule (teleport clearing) plateau', '참조 규칙 (순간이동 해소) 평탄 구간'],
  ivTip: ['{g} · {gran}<br>T1′ = {t1}；预约平台 {res}（T1′ 的 {pct}）<br>安全放行平台 {safe}（最大 {smax} @ K = {sk}）{seg}', '{g} · {gran}<br>T1′ = {t1}; reservation plateau {res} ({pct} of T1′)<br>safe-release plateau {safe} (max {smax} at K = {sk}){seg}', '{g} · {gran}<br>T1′ = {t1}, 예약 평탄 구간 {res} (T1′의 {pct})<br>안전 허가 평탄 구간 {safe} (최대 {smax} @ K = {sk}){seg}'],
  ivSeg: ['<br>参照规则（瞬移疏解）{v}', '<br>reference rule (teleport clearing) {v}', '<br>참조 규칙 (순간이동 해소) {v}'],
  // sensitivity table
  sScen: ['情景', 'Scenario', '시나리오'], sOk: ['玉浦 T1′', 'Okpo T1′', '옥포 T1′'], sYt: ['烟台 T1′', 'Yantai T1′', '옌타이 T1′'],
  main: ['主情景', 'Main scenario', '주 시나리오'], 'w+1.5': ['路宽 +1.5 m', 'Widths +1.5 m', '도로 폭 +1.5 m'], 'w-1.5': ['路宽 −1.5 m', 'Widths −1.5 m', '도로 폭 −1.5 m'],
  empty_excl: ['空车处处独占', 'Empties exclusive everywhere', '공차 어디서나 독점'], empty_free: ['空车处处可交会', 'Empties pass everywhere', '공차 어디서나 교행'],
};
const t = k => T[k][LI[Deck.lang]];
const BC = { r161: 'var(--oxide)', r010: 'var(--steel)', r026: 'var(--amber-hi)', b014: 'var(--good)', b007: 'var(--ink3)' };
const CLS = { cEnt: 'var(--good)', cDock: 'var(--amber-hi)', cCor: 'var(--oxide)' };
const YS = [['yupu', 'main'], ['yupu', 'erection'], ['yupu', 'crane'], ['yantai', 'main'], ['yantai', 'erection'], ['yantai', 'crane']];
const f0 = v => Math.round(v).toLocaleString('en-US');
const pct = (v, d = 0) => (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(100 * v).toFixed(d) + '%';
const par = v => LI[Deck.lang] === 0 ? `（${v}）` : ` (${v})`;
const mean = a => a.reduce((s, v) => s + v, 0) / a.length;
const find = (a, y, s) => a[y].find(r => r.scen === s);
// resource names in the results are Chinese map labels; show the road number or the building door in the slide's language
const resName = n => n.includes('建筑014') ? t('door014') : n.startsWith('道路') ? fmt(t('roadN'), { r: n.match(/道路([\d-]+)/)[1] }) : n;
const clsOf = r => r.type === '入口' ? 'cEnt' : r.pass > 0.5 ? 'cCor' : 'cDock';
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

// ---------- per-seed T1 and T1' on both yards, with the system T1' of T23 ----------
function drawSeeds() {
  const W = 560, H = fitH('cSeeds', W, 380), m = { l: 60, r: 12, t: 30, b: 42 };
  const s = frame('cSeeds', W, H, t('seedLbl'));
  const x = lin(-0.7, 20.7, m.l, W - m.r), y = lin(1000, 2400, H - m.b, m.t);
  grid(s, y, [1000, 1200, 1400, 1600, 1800, 2000, 2200, 2400], m, W, f0);
  axis(s, m, W, H);
  yTitle(s, 14, (m.t + H - m.b) / 2, t('seedY'));
  el('text', { x: (m.l + W - m.r) / 2, y: H - 8, 'text-anchor': 'middle' }, s, t('seedX'));
  [['yupu', 0], ['yantai', 11]].forEach(([yd, o], k) => {
    const S = D.seeds[yd], c0 = x(o), c1 = x(o + 9), mt = mean(S.map(r => r.T1t)), sys = find(D.system, yd, 'main').sys;
    el('text', { x: (c0 + c1) / 2, y: m.t - 12, 'text-anchor': 'middle', class: 't-title' }, s, fmt(t('mean'), { yard: t(yd), v: f0(mt) }));
    el('text', { x: c0, y: H - m.b + 17, 'text-anchor': 'middle' }, s, String(S[0].seed));
    el('text', { x: c1, y: H - m.b + 17, 'text-anchor': 'middle' }, s, String(S[9].seed));
    el('path', { d: `M${c0 - 10} ${y(mt)}H${c1 + 10}`, style: 'stroke:var(--ink2);stroke-width:1.2;stroke-dasharray:5 4' }, s);
    anim(el('path', { d: `M${c0 - 10} ${y(sys)}H${c1 + 10}`, style: 'stroke:var(--oxide);stroke-width:2.2' }, s), 'a-fade', 1.3);
    S.forEach((r, i) => {
      const cx = x(o + i);
      anim(el('path', { d: `M${cx} ${y(r.T1)}V${y(r.T1t)}`, style: 'stroke:var(--ink3);stroke-width:1.4' }, s), 'a-fade', .3 + .5 * spread(i + 3 * k));
      anim(el('circle', { cx, cy: y(r.T1), r: 4.2, style: 'fill:var(--paper);stroke:var(--ink3);stroke-width:1.6' }, s), 'a-pop', .4 + .5 * spread(i + 3 * k));
      const c = anim(el('circle', { cx, cy: y(r.T1t), r: 6, style: `fill:${BC[r.bind]};stroke:var(--paper);stroke-width:1.2` }, s), 'a-pop', .7 + .5 * spread(i + 3 * k));
      hover(c, () => fmt(t('seedTip'), { yard: t(yd), s: r.seed, a: f0(r.T1), b: f0(r.T1t), r: t(r.bind), p: r.price.toFixed(1) }));
    });
  });
  swatches('lgSeeds', [['transparent', t('T1'), 'border:1.6px solid var(--ink3);border-radius:50%'],
    ...['r161', 'r010', 'r026', 'b014', 'b007'].map(k => [BC[k], 'T1′ · ' + t(k), 'border-radius:50%']),
    ['var(--ink2)', t('lgMean'), 'height:2px;border:0'], ['var(--oxide)', t('lgSys'), 'height:3px;border:0']]);
  const ok = D.sens.yupu.main, yt = D.sens.yantai.main, er = D.erection, sys = (y, sc) => f0(find(D.system, y, sc).sys);
  $('seedRead').innerHTML = stat(`${f0(ok.T1)} → ${f0(ok.T1t)}`, fmt(t('rdOk'), { pct: Math.round(100 * (1 - ok.T1t / ok.T1)), lo: f0(ok.lo), hi: f0(ok.hi), sys: sys('yupu', 'main') }))
    + stat(`${f0(er.T1)} → ${f0(er.T1t)}`, fmt(t('rdEr'), { pct: Math.round(100 * (1 - er.T1t / er.T1)), n: er.n161, sys: sys('yupu', 'erection') }))
    + stat(f0(yt.T1t), fmt(t('rdYt'), { n: D.seeds.yantai.filter(r => r.bind === 'b014').length, t1: f0(yt.T1), sys: sys('yantai', 'main') }));
}

// ---------- system T1': the 10-seed range of sampled T1' around it, at N = 2,000, 20,000 and 200,000 tasks ----------
function drawConv() {
  const W = 560, H = fitH('cConv', W, 380), m = { l: 58, r: 10, t: 14, b: 64 };
  const s = frame('cConv', W, H, t('convLbl'));
  const x = lin(-0.5, 6.45, m.l, W - m.r), y = lin(-0.2, 0.15, H - m.b, m.t);
  grid(s, y, [-0.2, -0.15, -0.1, -0.05, 0, 0.05, 0.1, 0.15], m, W, v => pct(v));
  axis(s, m, W, H);
  yTitle(s, 14, (m.t + H - m.b) / 2, t('convY'));
  el('path', { d: `M${m.l} ${y(0)}H${W - m.r}`, style: 'stroke:var(--oxide);stroke-width:2' }, s);
  el('text', { x: W - m.r - 4, y: y(0) - 6, 'text-anchor': 'end', class: 't-ox' }, s, t('convZero'));
  const NC = ['var(--ink3)', 'var(--steel)', 'var(--good)'], bw = 11;
  YS.forEach(([yd, sc], g) => {
    const sys = find(D.system, yd, sc).sys, cx = x(g);
    el('text', { x: cx, y: H - m.b + 17, 'text-anchor': 'middle', class: 't-strong' }, s, t(yd));
    el('text', { x: cx, y: H - m.b + 33, 'text-anchor': 'middle' }, s, t('sc_' + sc));
    el('text', { x: cx, y: H - m.b + 50, 'text-anchor': 'middle', class: 't-ox' }, s, f0(sys));
    D.conv[yd][sc].forEach((c, i) => {
      const bx = cx + (i - 1) * (bw + 5), lo = c.min / sys - 1, hi = c.max / sys - 1, d = .2 + .3 * spread(g) + .25 * i;
      const r = anim(el('rect', { x: bx - bw / 2, y: y(hi), width: bw, height: Math.max(2, y(lo) - y(hi)), rx: 2, style: `fill:${NC[i]};fill-opacity:.85` }, s), 'a-y', d);
      el('path', { d: `M${bx - bw / 2 - 2} ${y(c.mean / sys - 1)}H${bx + bw / 2 + 2}`, style: 'stroke:var(--ink);stroke-width:2' }, s);
      hover(r, () => fmt(t('convTip'), { yard: t(yd), sc: t('sc_' + sc), n: c.N.toLocaleString('en-US'), lo: f0(c.min), hi: f0(c.max), a: pct(lo, 1), b: pct(hi, 1), sys: f0(sys) }));
    });
  });
  swatches('lgConv', [[NC[0], t('convN0')], [NC[1], fmt(t('convN'), { n: '20,000' })], [NC[2], fmt(t('convN'), { n: '200,000' })], ['var(--ink)', t('convMean'), 'height:2px;border:0']]);
  const cell = (yd, sc) => { const r = find(D.system, yd, sc); return `<td class="mono">${f0(r.sys)}</td><td>${resName(r.top)}</td>`; };
  $('sysTbl').innerHTML = `<thead><tr><th>${t('sysScen')}</th><th colspan="2">${t('sysOk')}</th><th colspan="2">${t('sysYt')}</th></tr></thead><tbody>`
    + ['main', 'erection', 'crane'].map(sc => `<tr><td>${t('sc_' + sc)}</td>${cell('yupu', sc)}${cell('yantai', sc)}</tr>`).join('') + '</tbody>';
}

// ---------- case-by-case check: histogram of throughput / T1' over the T21 and T22 points ----------
function drawChk() {
  const W = 560, H = fitH('cChk', W, 380), m = { l: 58, r: 16, t: 16, b: 46 };
  const s = frame('cChk', W, H, t('chkLbl'));
  const ha = D.hist.t21, hb = D.hist.t22, tot = ha.map((v, i) => v + hb[i]);
  const st = niceStep(Math.max(...tot) * 1.12), top = Math.ceil(Math.max(...tot) * 1.12 / st) * st;
  const x = lin(0, 1.1, m.l, W - m.r), y = lin(0, top, H - m.b, m.t);
  const ticks = []; for (let v = 0; v <= top; v += st) ticks.push(v);
  grid(s, y, ticks, m, W, f0);
  [0, 0.2, 0.4, 0.6, 0.8, 1].forEach(v => el('text', { x: x(v), y: H - m.b + 17, 'text-anchor': 'middle' }, s, v.toFixed(1)));
  axis(s, m, W, H);
  el('text', { x: (m.l + W - m.r) / 2, y: H - 8, 'text-anchor': 'middle' }, s, t('chkX'));
  yTitle(s, 14, (m.t + H - m.b) / 2, t('chkY'));
  const bw = x(0.05) - x(0) - 2;
  ha.forEach((a, i) => {
    const b = hb[i], x0 = x(0.05 * i) + 1;
    [[a, 0, 'var(--steel)', 'lgT21'], [b, a, 'var(--amber-hi)', 'lgT22']].forEach(([n, base, c, who], k) => {
      if (!n) return;
      const r = anim(el('rect', { x: x0, y: y(base + n), width: bw, height: y(base) - y(base + n), style: `fill:${c}` }, s), 'a-y', .2 + .5 * spread(i) + .1 * k);
      hover(r, () => fmt(t('chkTip'), { who: t(who), a: (0.05 * i).toFixed(2), b: (0.05 * i + 0.05).toFixed(2), n: f0(n) }));
    });
  });
  const g = anim(el('g', {}, s), 'a-fade', 1.1);
  el('path', { d: `M${x(1)} ${m.t}V${H - m.b}`, style: 'stroke:var(--oxide);stroke-width:2;stroke-dasharray:6 4' }, g);
  el('text', { x: x(1) - 6, y: m.t + 12, 'text-anchor': 'end', class: 't-ox' }, g, t('chkOne'));
  el('text', { x: x(1.05), y: y(0) - 8, 'text-anchor': 'middle', class: 't-ox' }, g, '0');
  el('text', { x: x(1) - 6, y: m.t + 30, 'text-anchor': 'end', style: 'fill:var(--oxide);font-size:12px' }, g, t('chkNone'));
  swatches('lgChk', [['var(--steel)', t('lgT21')], ['var(--amber-hi)', t('lgT22')], ['var(--oxide)', t('chkOne'), 'height:2px;border:0']]);
  const C = D.check, n21 = C.yupu.n + C.yantai.n;
  $('chkRead').innerHTML = stat(`0 <small>/ ${f0(n21 + C.t22.n)}</small>`, fmt(t('rdOver'), { a: f0(n21), b: f0(C.t22.n) }))
    + stat(C.t22.max.toFixed(3), fmt(t('rdMax'), { k: C.t22.at.K, y: Math.max(C.yupu.max, C.yantai.max).toFixed(3) }))
    + stat(`${f0(D.high[1])} <small>/ ${f0(D.high[0])}</small>`, t('rdHigh'));
}

// ---------- route slack in the bound: [back-substituted feasible value, T1''] over the system T1', by binding-resource class ----------
function drawSlack() {
  const W = 560, H = fitH('cSlack', W, 340), m = { l: 128, r: 104, t: 12, b: 44 };
  const s = frame('cSlack', W, H, t('slkLbl'));
  const x = lin(0, 0.5, m.l, W - m.r), rowH = (H - m.t - m.b) / 6;
  const g0 = el('g', { class: 'grid' }, s);
  [0, 0.1, 0.2, 0.3, 0.4, 0.5].forEach(v => { el('line', { x1: x(v), x2: x(v), y1: m.t, y2: H - m.b }, g0); el('text', { x: x(v), y: H - m.b + 17, 'text-anchor': 'middle' }, s, pct(v)); });
  el('path', { d: `M${m.l} ${m.t}V${H - m.b}H${W - m.r}` }, el('g', { class: 'axis' }, s));
  el('text', { x: (m.l + W - m.r) / 2, y: H - 8, 'text-anchor': 'middle' }, s, t('slkX'));
  YS.forEach(([yd, sc], i) => {
    const r = find(D.route, yd, sc), ro = find(D.readout, yd, sc), c = CLS[clsOf(ro)], cy = m.t + rowH * (i + 0.5), h = Math.min(22, rowH * 0.56);
    el('text', { x: m.l - 10, y: cy - 2, 'text-anchor': 'end', class: 't-strong' }, s, t(yd) + ' · ' + t('sc_' + sc));
    el('text', { x: m.l - 10, y: cy + 14, 'text-anchor': 'end', style: 'font-size:12px;fill:var(--ink3)' }, s, resName(ro.name));
    const lo = Math.max(0, r.lo), hi = Math.max(0, r.hi), d = .2 + .12 * i, nodes = [];
    if (hi > 0.0005) {
      nodes.push(anim(el('rect', { x: x(0), y: cy - h / 2, width: x(hi) - x(0), height: h, style: `fill:${c};fill-opacity:.32` }, s), 'a-x', d));
      nodes.push(anim(el('rect', { x: x(0), y: cy - h / 2, width: Math.max(1.5, x(lo) - x(0)), height: h, style: `fill:${c}` }, s), 'a-x', d + .15));
    } else nodes.push(anim(el('circle', { cx: x(0) + 5, cy, r: 5, style: `fill:${c}` }, s), 'a-pop', d));
    el('text', { x: hi > 0.0005 ? x(hi) + 8 : x(0) + 16, y: cy + 5, class: 't-strong' }, s, hi > 0.0005 ? pct(r.lo, 1) + par(pct(r.hi, 1)) : '0');
    nodes.forEach(n => hover(n, () => fmt(t('slkTip'), { yard: t(yd), sc: t('sc_' + sc), res: resName(ro.name), sys: f0(r.sys), feas: f0(r.feas), pp: f0(r.pp) })));
  });
  swatches('lgSlack', [...['cEnt', 'cDock', 'cCor'].map(k => [CLS[k], t(k)]), ['var(--ink2)', t('lgLo')], ['var(--ink2)', t('lgHi'), 'opacity:.32']]);
}

// ---------- plateau / bound: completed-mix caliber (system caliber for Okpo's crane cadence) ----------
function drawPlat() {
  const W = 560, H = fitH('cPlat', W, 360), m = { l: 52, r: 10, t: 22, b: 64 };
  const s = frame('cPlat', W, H, t('plLbl'));
  const x = lin(-0.6, 5.6, m.l, W - m.r), y = lin(0, 1.1, H - m.b, m.t);
  grid(s, y, [0, 0.2, 0.4, 0.6, 0.8, 1], m, W, v => Math.round(100 * v) + '%');
  axis(s, m, W, H);
  yTitle(s, 14, (m.t + H - m.b) / 2, t('plY'));
  el('path', { d: `M${m.l} ${y(1)}H${W - m.r}`, style: 'stroke:var(--oxide);stroke-width:2;stroke-dasharray:6 4' }, s);
  el('text', { x: W - m.r - 4, y: y(1) - 6, 'text-anchor': 'end', class: 't-ox' }, s, t('plOne'));
  const bw = 22, RC = { reserve: 'var(--steel)', segment: 'var(--amber-hi)' };
  YS.forEach(([yd, sc], g) => {
    const cx = x(g), sysCal = yd === 'yupu' && sc === 'crane';
    el('text', { x: cx, y: H - m.b + 17, 'text-anchor': 'middle', class: 't-strong' }, s, t(yd));
    el('text', { x: cx, y: H - m.b + 33, 'text-anchor': 'middle' }, s, t('sc_' + sc) + (sysCal ? ' *' : ''));
    ['reserve', 'segment'].forEach((md, k) => {
      const p = D.platform[yd].find(r => r.scen === sc && r.model === md), v = sysCal ? p.sys : p.mix, bx = cx + (k - 0.5) * (bw + 3);
      const r = anim(el('rect', { x: bx - bw / 2, y: y(v), width: bw, height: y(0) - y(v), style: `fill:${RC[md]}` }, s), 'a-y', .2 + .1 * g + .1 * k);
      if (sysCal) el('rect', { x: bx - bw / 2, y: y(v), width: bw, height: y(0) - y(v), style: 'fill:url(#hatch)' }, s);
      el('text', { x: bx, y: y(v) - 5, 'text-anchor': 'middle', style: 'font-size:12px;font-weight:600;fill:var(--ink)' }, s, Math.round(100 * v) + '%');
      hover(r, () => fmt(t('plTip'), { yard: t(yd), sc: t('sc_' + sc), rule: t(md === 'reserve' ? 'plRes' : 'plSeg'), p: f0(p.plat), mix: Math.round(100 * p.mix) + '%', sys: Math.round(100 * p.sys) + '%', pp: Math.round(100 * p.pp) + '%' }));
    });
  });
  const a = anim(el('g', {}, s), 'a-fade', 1);
  el('text', { x: x(1), y: y(1) - 22, 'text-anchor': 'middle', class: 't-ox' }, a, t('plHot'));
  el('text', { x: x(3.5), y: y(0.75), 'text-anchor': 'middle', style: 'fill:var(--steel);font-weight:600' }, a, t('plCold'));
  el('text', { x: m.l, y: H - 8, style: 'font-size:12px;fill:var(--ink3)' }, s, t('plSys'));
  swatches('lgPlat', [[RC.reserve, t('plRes')], [RC.segment, t('plSeg')]]);
}

// ---------- exchange-rate rows: shortest-path dispatch (T1') and detours allowed (T1''), tasks a day ----------
function fillRate() {
  const ROWS = [['yupu', 'main', r => r.rank === 1], ['yupu', 'crane', r => r.rank === 1], ['yupu', 'crane', r => r.name.startsWith('道路013-7')],
    ['yantai', 'main', r => r.rank === 1], ['yantai', 'erection', r => r.rank === 1]];
  const n = v => Math.abs(v) < 10 ? (Math.round(10 * v) / 10).toFixed(1) : f0(v);
  const cell = c => {
    const [, first, d10, w1] = c;
    if (d10 < 0.05 && first < 0.05 && !(w1 > 0.05)) return t('rtZero');
    const txt = fmt(t('rtD10'), { v: n(d10) }) + (Math.abs(first - d10) > 0.5 ? fmt(t('rtFirst'), { v: n(first) }) : '');
    return w1 == null ? txt : txt + '<br>' + (w1 > 0.05 ? fmt(t('rtW1'), { v: n(w1) }) : t('rtW0'));
  };
  $('rateTbl').innerHTML = `<thead><tr><th>${t('rtRes')}</th><th>${t('rtA')}</th><th>${t('rtB')}</th></tr></thead><tbody>`
    + ROWS.map(([yd, sc, f]) => {
      const r = D.rate.find(q => q.yard === yd && q.scen === sc && f(q));
      return `<tr><td>${resName(r.name)}<br><span class="tiny">${t(yd)} · ${t('sc_' + sc)}</span></td><td>${cell(r.a)}</td><td>${r.type === '入口' ? t('rtSame') : cell(r.b)}</td></tr>`;
    }).join('') + '</tbody>';
}

// ---------- capacity interval by resource granularity (T22): reservation plateau to T1', with safe release and the reference rule ----------
function drawIv() {
  const W = 560, H = fitH('cIv', W, 380), m = { l: 62, r: 10, t: 24, b: 58 };
  const s = frame('cIv', W, H, t('ivLbl'));
  const x = lin(-0.7, 7.7, m.l, W - m.r), y = lin(0, 2000, H - m.b, m.t);
  grid(s, y, [0, 500, 1000, 1500, 2000], m, W, f0);
  axis(s, m, W, H);
  yTitle(s, 14, (m.t + H - m.b) / 2, t('ivY'));
  const half = (x(1) - x(0)) * 0.34;
  [['yupu_main', 0, 'gyMain'], ['yantai_main', 3, 'gtMain'], ['yupu_erection', 6, 'gyEr']].forEach(([blk, o, gl], k) => {
    el('text', { x: (x(o) + x(o + 1)) / 2, y: H - 12, 'text-anchor': 'middle', class: 't-title' }, s, t(gl));
    ['whole', 'stops'].forEach((gr, i) => {
      const r = D.interval[blk][gr], cx = x(o + i), d = .2 + .25 * k + .15 * i, gname = t(gr === 'whole' ? 'ivWhole' : 'ivStops');
      el('text', { x: cx, y: H - m.b + 17, 'text-anchor': 'middle', class: 't-strong' }, s, gname);
      const b = anim(el('rect', { x: cx - half, y: y(r.T1), width: 2 * half, height: y(r.res) - y(r.T1), style: 'fill:var(--oxide-soft);stroke:var(--oxide);stroke-width:1.4' }, s), 'a-y', d);
      el('text', { x: cx, y: y(r.T1) - 6, 'text-anchor': 'middle', class: 't-ox' }, s, f0(r.T1));
      el('path', { d: `M${cx - half} ${y(r.res)}H${cx + half}`, style: 'stroke:var(--steel);stroke-width:3' }, s);
      el('text', { x: cx, y: y(r.res) + 16, 'text-anchor': 'middle', style: 'fill:var(--steel);font-size:12px;font-weight:600' }, s, f0(r.res));
      const nodes = [b, anim(el('path', { d: `M${cx} ${y(r.safe) - 6}l6 6l-6 6l-6 -6z`, style: 'fill:var(--good);stroke:var(--paper);stroke-width:1' }, s), 'a-pop', d + .4)];
      if (r.seg != null) nodes.push(anim(el('circle', { cx, cy: y(r.seg), r: 5.5, style: 'fill:var(--paper);stroke:var(--amber);stroke-width:2' }, s), 'a-pop', d + .5));
      nodes.forEach(nd => hover(nd, () => fmt(t('ivTip'), { g: t(gl), gran: gname, t1: f0(r.T1), res: f0(r.res), pct: Math.round(100 * r.res / r.T1) + '%',
        safe: f0(r.safe), smax: f0(r.safeMax), sk: r.safeK, seg: r.seg != null ? fmt(t('ivSeg'), { v: f0(r.seg) }) : '' })));
    });
  });
  swatches('lgIv', [['var(--oxide-soft)', t('lgIv'), 'border:1px solid var(--oxide)'], ['var(--good)', t('lgSafe'), 'transform:rotate(45deg) scale(.8)'],
    ['var(--paper)', t('lgRef'), 'border:2px solid var(--amber);border-radius:50%']]);
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
    bound: ['路网上界', 'Network bound', '도로망 상한'], route: ['路线自由的上界', 'Route-free bound', '경로 자유 상한'],
    robust: ['资源粒度与关键要素', 'Granularity and key elements', '자원 단위와 핵심 요소'],
    plan: ['进度、风险与下一步', 'Progress, risks, next steps', '진행, 위험, 다음 단계'], pos: ['定位与去向', 'Positioning and venues', '위치와 투고처'],
    ref: ['参考文献', 'References', '참고문헌'], end: ['小结', 'Wrap-up', '정리'] },
  draw: [drawDff, drawSeeds, drawConv, drawChk, drawSlack, drawPlat, fillRate, drawIv, fillSens],
});
})();
