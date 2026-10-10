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
  safe: ['安全放行', 'Safe release', '안전 방출'],
  segment: ['逐段申请（参照规则·瞬移疏解）', 'Segment request (reference rule, teleport clearing)', '구간별 요청 (참조 규칙·순간 이동 해소)'],
  segShort: ['参照规则（瞬移疏解）', 'Reference rule (teleport)', '참조 규칙 (순간 이동)'],
  K: ['车队规模 K（台）', 'Fleet size K (vehicles)', '차량군 규모 K (대)'],
  thr: ['日吞吐（任务 / 16 h）', 'Daily throughput (tasks / 16 h)', '일일 처리량 (작업 / 16시간)'],
  whole: ['整段', 'whole road', '통째'], stops: ['分段', 'segmented', '구간 분할'],
  // flag figure
  flagLbl: ['运力区间：车队规模与日吞吐', 'Capacity interval: fleet size against daily throughput', '운송 능력 구간: 차량군 규모와 일일 처리량'],
  t1t: ['上沿 T1′', 'Ceiling T1′', '상한 T1′'], floor: ['下沿：预约平台', 'Floor: reservation plateau', '하한: 예약 평탄 구간'],
  band: ['运力区间', 'Capacity interval', '운송 능력 구간'],
  t1tLg: ['上沿 T1′（只约束占路模型）', 'Ceiling T1′ (bounds occupancy models only)', '상한 T1′ (점유 모형만 제약)'],
  freeOut: ['自由流 K = 150：{v} ↑', 'free flow at K = 150: {v} ↑', '자유류 K = 150: {v} ↑'],
  ptTip: ['{yard} · {m}<br>K = {k}：{v} 个/日（种子范围 {lo}–{hi}）', '{yard} · {m}<br>K = {k}: {v} a day (seeds {lo}–{hi})', '{yard} · {m}<br>K = {k}: 하루 {v}건 (시드 범위 {lo}–{hi})'],
  rdInt: ['运力区间（个/日）：下沿是整条路径预约在 K = 100–150 的平台，上沿是 T1′（10 个种子均值，种子间 {a}–{b}）', 'Capacity interval (a day): the floor is the reservation plateau over K = 100–150, the ceiling T1′ (mean of 10 seeds, {a}–{b} across seeds)', '운송 능력 구간 (하루): 하한은 K = 100–150 예약 평탄 구간, 상한은 T1′ (시드 10개 평균, 시드 간 {a}–{b})'],
  rdShare: ['下沿只到上沿的这一比例：差距来自交通规则，编排把下沿往上推', 'The floor reaches only this share of the ceiling: the gap is the traffic rule, which orchestration aims to close', '하한은 상한의 이 비율뿐: 차이는 통행 규칙에서 오며 편성이 좁힐 몫'],
  rdSafe: ['安全放行（不瞬移、从不死锁）的平台；K ≈ {k} 时最大 {m}，之后下降，低于预约（下一页）', 'Safe-release plateau (no teleport, never deadlocks); maximum {m} at K ≈ {k}, then falling, below reservation (next slide)', '안전 방출 (순간 이동 없음, 교착 없음)의 평탄 구간, K ≈ {k}에서 최대 {m} 후 감소, 예약보다 낮음 (다음 쪽)'],
  rdSeg: ['参照规则（瞬移疏解）的平台，只作参照', 'Reference-rule plateau (teleport clearing), for reference only', '참조 규칙 (순간 이동 해소)의 평탄 구간, 참조용'],
  // safe release against reservation
  safeLbl: ['整条路径预约与安全放行的饱和曲线', 'Saturated curves: whole-route reservation and safe release', '전체 경로 예약과 안전 방출의 포화 곡선'],
  safeMax: ['最大 {v} @ K ≈ {k}', 'max {v} at K ≈ {k}', '최대 {v} @ K ≈ {k}'],
  safeEq: ['K ≤ 15 两者相当', 'K ≤ 15: on a par', 'K ≤ 15 비슷함'],
  // interval by granularity and mix
  ivLbl: ['运力区间随资源粒度与任务组合的变化', 'Capacity interval by resource granularity and task mix', '자원 단위와 작업 조합에 따른 운송 능력 구간'],
  ivX: ['日吞吐（个/日，饱和）', 'Daily throughput (saturated)', '일일 처리량 (포화)'],
  gMain: ['主情景', 'main scenario', '주 시나리오'], gErect: ['搭载组合（P6 15%）', 'erection mix (P6 15%)', '탑재 조합 (P6 15%)'],
  ivSafe: ['安全放行平台', 'safe-release plateau', '안전 방출 평탄 구간'],
  ivRatio: ['下沿 / 上沿', 'floor / ceiling', '하한 / 상한'],
  ivTip: ['{c}<br>区间 [{lo}, {hi}]，下沿 / 上沿 = {r}<br>安全放行平台 {s}（最大 {sm} @ K ≈ {sk}）', '{c}<br>interval [{lo}, {hi}], floor / ceiling = {r}<br>safe-release plateau {s} (max {sm} at K ≈ {sk})', '{c}<br>구간 [{lo}, {hi}], 하한 / 상한 = {r}<br>안전 방출 평탄 구간 {s} (최대 {sm} @ K ≈ {sk})'],
  // T23 route slack
  slLbl: ['上界中的路线余量：T1″ 相对系统 T1′ 的增量', 'Route slack in the bound: T1″ over system T1′', '상한의 경로 여유: 시스템 T1′ 대비 T1″ 증가분'],
  slX: ['路线余量（%）', 'Route slack (%)', '경로 여유 (%)'],
  slLo: ['下限（回代可行值）', 'lower end (back-substituted)', '하한 (역대입 가능값)'], slHi: ['上限（T1″）', 'upper end (T1″)', '상한 (T1″)'],
  sMain: ['主情景', 'main', '주 시나리오'], sErect: ['搭载组合', 'erection mix', '탑재 조합'], sCrane: ['吊车节拍', 'crane cadence', '크레인 박자'],
  slTip: ['{c}：系统 T1′ {s}，T1″ {pp}<br>路线余量 +{lo}%（上限 +{hi}%）', '{c}: system T1′ {s}, T1″ {pp}<br>route slack +{lo}% (upper end +{hi}%)', '{c}: 시스템 T1′ {s}, T1″ {pp}<br>경로 여유 +{lo}% (상한 +{hi}%)'],
  tScen: ['船厂 · 情景', 'Yard · scenario', '조선소 · 시나리오'], tSys: ['系统 T1′', 'System T1′', '시스템 T1′'],
  tSeeds: ['10 个种子', '10 seeds', '시드 10개'],
  // marginal ratio
  margLbl: ['每多一台车的吞吐占自由流的比例', 'Gain from one more vehicle as a share of free flow', '한 대 추가 효과의 자유류 대비 비율'],
  margY: ['边际比（占路 ÷ 自由流）', 'Marginal ratio (occupancy ÷ free flow)', '한계 비율 (점유 ÷ 자유류)'],
  theta: ['θ = 20%', 'θ = 20%', 'θ = 20%'],
  margTip: ['{yard} · K = {k}：{v}%', '{yard} · K = {k}: {v}%', '{yard} · K = {k}: {v}%'],
  // dock mouth thresholds
  rhoLbl: ['坞口阈值：吞吐降幅首次达 10% 时的吊车利用率 ρ，按车数读', 'Dock-mouth threshold: crane utilisation ρ at which throughput first drops 10%, by fleet size', '도크 입구 임계값: 처리량 감소가 처음 10%에 이르는 크레인 이용률 ρ, 차량 수별'],
  rhoY: ['阈值 ρ', 'Threshold ρ', '임계값 ρ'],
  rhoNo: ['降幅未达 10%', 'drop below 10%', '감소 10% 미만'],
  rhoRes: ['整条路径预约（两种粒度）', 'Whole-route reservation (both)', '전체 경로 예약 (두 단위)'],
  rhoHollow: ['空心 = 用到不稳态的点', 'hollow = uses an unsteady point', '빈 표시 = 불안정 점 포함'],
  rhoTip: ['{s} · K = {k}：{v}', '{s} · K = {k}: {v}', '{s} · K = {k}: {v}'],
  rhoTipNo: ['降幅未达 10%（最大 {d}%）', 'drop below 10% (largest {d}%)', '감소 10% 미만 (최대 {d}%)'],
  rd1: ['安全放行·整段：阈值由 K = 20 的 {a} 移到 K = 150 的 {b}（{y} {c} → {d}）：车越多，等吊车的车在路上排得越长', 'Safe release, whole road: the threshold moves from {a} at K = 20 to {b} at K = 150 ({y} {c} → {d}); more vehicles, longer queues on the road', '안전 방출·통째: 임계값이 K = 20의 {a}에서 K = 150의 {b}로 ({y} {c} → {d}), 차가 많을수록 도로 위 대기가 길다'],
  rd2: ['玉浦 K = 40，安全放行：按停靠点分段闭塞把阈值右移', 'Okpo, K = 40, safe release: segmented blocking at the stops moves the threshold right', '옥포 K = 40 안전 방출: 정차 지점 구간 폐색이 임계값을 오른쪽으로'],
  // vehicles-needed table
  dSel1: ['玉浦 · 整段', 'Okpo · whole road', '옥포 · 통째'], dSel2: ['玉浦 · 分段', 'Okpo · segmented', '옥포 · 구간 분할'], dSel3: ['烟台', 'Yantai', '옌타이'],
  dVol: ['日任务量', 'Tasks a day', '하루 작업'], d16: ['16 h 工作日', '16-h working day', '16시간 근무일'], d24: ['24 h 工作日', '24-h working day', '24시간 근무일'],
  cFree: ['自由流', 'Free', '자유류'], cRes: ['预约', 'Resv.', '예약'], cSafe: ['安全放行', 'Safe', '안전'], cRef: ['参照', 'Ref.', '참조'],
  dOwn: ['本厂日均', 'own mean', '자체 평균'], dPeak: ['本厂高峰', 'own peak', '자체 피크'], dDirect: ['直接锚点', 'direct anchor', '직접 기준점'],
  dHhi: ['现代重工量级', 'Hyundai Heavy scale', '현대중공업 규모'], dShen: ['Shen 等量级', 'Shen et al. scale', 'Shen 등 규모'],
  vY: ['成立（≥ K* 上端）', 'holds (≥ top of K*)', '성립 (≥ K* 상단)'], vNear: ['在约束区起点附近（落在 K* 区间内）', 'near the start (inside the K* range)', '제약 시작 부근 (K* 구간 안)'],
  vN: ['不成立（< K* 下端）', 'does not hold (< bottom of K*)', '불성립 (< K* 하단)'],
  dagNote: ['† 达标后再加车又有一档不达（门槛附近，T22 第 6.1 节）', '† a higher fleet falls short again (near the threshold; T22 §6.1)', '† 더 큰 차량군에서 다시 미달 (문턱 부근, T22 §6.1)'],
  // work zone
  zoneLbl: ['工作区图：日任务量与所需车数', 'Work-zone chart: daily volume against vehicles needed', '작업 영역도: 일일 작업량과 필요 차량'],
  zoneX: ['日任务量（个/日）', 'Daily task volume', '일일 작업량'],
  zoneY: ['所需车数（台，整数 K）', 'Vehicles needed (integer K)', '필요 차량 수 (정수 K)'],
  zoneK: ['K* {k}', 'K* {k}', 'K* {k}'],
  zoneOwn: ['本厂日均 {d}', 'own mean {d}', '자체 평균 {d}'], zonePeak: ['本厂高峰 {d}', 'own peak {d}', '자체 피크 {d}'],
  zoneOwnYt: ['本厂 {a}–{b}', 'own {a}–{b}', '자체 {a}–{b}'],
  zoneHhi: ['现代重工 {n} 台（每天约 {d} 次，24 h）', 'Hyundai Heavy, {n} vehicles ({d} a day, 24 h)', '현대중공업 {n}대 (하루 약 {d}회, 24시간)'],
  zoneShen: ['Shen 等约 {n} 台（每天约 {d} 个，班次未写）', 'Shen et al., about {n} ({d} a day, shift not stated)', 'Shen 등 약 {n}대 (하루 약 {d}개, 교대 미기재)'],
  zoneOut: ['> {v}', '> {v}', '> {v}'],
  zoneTip: ['{m}<br>每天 {d} 个：{k} 台', '{m}<br>{d} a day: {k} vehicles', '{m}<br>하루 {d}건: {k}대'],
  zoneAnchor: ['现场车队：现代重工 {h} 台（{hd} 次/日）、Shen 等约 {s} 台（{sd} 个/日）', 'field fleets: Hyundai Heavy {h} ({hd} a day), Shen et al. about {s} ({sd} a day)', '현장 차량군: 현대중공업 {h}대 (하루 {hd}회), Shen 등 약 {s}대 (하루 {sd}개)'],
  zr1: ['每天约 {d} 次、24 h：模型自由流 {f} 台、整条路径预约 {r} 台，现代重工的 {n} 台在其间', 'About {d} a day over 24 h: the model needs {f} in free flow and {r} under reservation; Hyundai Heavy\'s {n} sit between', '하루 약 {d}회, 24시간: 모형은 자유류 {f}대, 예약 {r}대, 현대중공업의 {n}대는 그 사이'],
  zr2: ['每天约 {d} 个、24 h：自由流 {f}、预约 {r}（参照规则 {s}），Shen 等的约 {n} 台在其间；16 h 下要 {f16}–{r16} 台，只有自由流对得上', 'About {d} a day over 24 h: free flow {f}, reservation {r} (reference rule {s}); Shen et al.\'s about {n} sit between. Over 16 h it takes {f16}–{r16}, and only free flow matches', '하루 약 {d}건, 24시간: 자유류 {f}, 예약 {r} (참조 규칙 {s}), Shen 등의 약 {n}대는 그 사이. 16시간이면 {f16}–{r16}대로 자유류만 맞는다'],
  // H1 by caliber
  hCal: ['任务量口径', 'Volume caliber', '작업량 기준'],
  hOwn: ['玉浦本厂日均（同法 339 / 直接锚点 350）', 'Okpo own mean (339 same method / 350 direct anchor)', '옥포 자체 평균 (같은 방법 339 / 직접 기준점 350)'],
  hPeak: ['玉浦本厂高峰（678 / 700，日均 × 2）', 'Okpo own peak (678 / 700, mean × 2)', '옥포 자체 피크 (678 / 700, 평균 × 2)'],
  hHhi: ['现代重工量级（每天 500）', 'Hyundai Heavy scale (500 a day)', '현대중공업 규모 (하루 500)'],
  hShen: ['韩国大型厂量级（每天 600）', 'Large Korean yard scale (600 a day)', '한국 대형 조선소 규모 (하루 600)'],
  hYtOwn: ['烟台本厂（23 / 46）', 'Yantai own (23 / 46)', '옌타이 자체 (23 / 46)'],
  hYt450: ['烟台按韩国量级（每天 450）', 'Yantai at Korean scale (450 a day)', '옌타이, 한국 규모 (하루 450)'],
  hY: ['成立', 'holds', '성립'], hN: ['不成立', 'does not hold', '불성립'], hNear: ['起点附近', 'near the start', '시작 부근'],
  hEdge: ['起点下沿', 'lower edge of the start', '시작 하단'],
  hK: ['预约 {k} 台', 'reservation {k}', '예약 {k}대'], hKstar: ['K* {k}', 'K* {k}', 'K* {k}'],
  hYtOnly: ['16 h 已不成立', 'already below at 16 h', '16시간에서 이미 불성립'],
  // density
  denLbl: ['日任务量占 T1′ 的比例', 'Daily volume as a share of T1′', '일일 작업량의 T1′ 대비 비율'],
  denX: ['日任务量 / T1′', 'daily volume / T1′', '일일 작업량 / T1′'],
  denRow: ['{yard} · 每天 {d} 个', '{yard} · {d} a day', '{yard} · 하루 {d}건'],
  denKr: ['每天 {d} 个', '{d} a day', '하루 {d}건'],
  denLine: ['预约平台 ≈ T1′ 的 {v}%（两厂）', 'reservation plateau ≈ {v}% of T1′ (both yards)', '예약 평탄 구간 ≈ T1′의 {v}% (두 곳)'],
  denYt: ['烟台本厂', 'Yantai, own volume', '옌타이 자체'], denOk: ['玉浦本厂（日均 / 高峰）', 'Okpo, own (mean / peak)', '옥포 자체 (평균 / 피크)'],
  denKo: ['韩国大型厂量级（按玉浦 T1′）', 'Korean large-yard scale (Okpo T1′)', '한국 대형 조선소 규모 (옥포 T1′)'],
  // productivity
  prodLbl: ['每台车每天完成的任务数', 'Tasks per vehicle per day', '차량당 하루 작업 수'],
  prodX: ['个 / 车 · 日', 'tasks per vehicle-day', '작업 / 차량·일'],
  pYim: ['Yim 2008 · 97 / 4（16 h，子集）', 'Yim 2008 · 97 / 4 (16 h, subset)', 'Yim 2008 · 97 / 4 (16시간, 부분)'],
  pHeo: ['Heo 2013 · 126 / 7（苏比克）', 'Heo 2013 · 126 / 7 (Subic)', 'Heo 2013 · 126 / 7 (수빅)'],
  pShen: ['Shen 2018 · 600 / 30', 'Shen 2018 · 600 / 30', 'Shen 2018 · 600 / 30'],
  pHhi: ['现代重工 2006 · 500 / 24（24 h）', 'Hyundai Heavy 2006 · 500 / 24 (24 h)', '현대중공업 2006 · 500 / 24 (24시간)'],
  pField: ['现场锚点', 'Field anchors', '현장 기준점'], pModel: ['模型（玉浦，K = 30）', 'Model (Okpo, K = 30)', '모형 (옥포, K = 30)'],
  p16: ['16 h', '16 h', '16시간'], p24: ['24 h', '24 h', '24시간'], pHeo5: ['按 5 台主车 {v}', '{v} counting the 5 main', '주 차량 5대 기준 {v}'],
  // service-time gap
  gapLbl: ['服务时间差 Δ(K)：整条路径预约减自由流', 'Service-time gap Δ(K): whole-route reservation minus free flow', '서비스 시간 차 Δ(K): 전체 경로 예약 − 자유류'],
  gapY: ['Δ(K)（分钟）', 'Δ(K) (minutes)', 'Δ(K) (분)'],
  gapFit: ['拟合 Δ ∝ K^α', 'fit Δ ∝ K^α', '적합 Δ ∝ K^α'],
  gapTip: ['{yard} · K = {k}：Δ = {v} min', '{yard} · K = {k}: Δ = {v} min', '{yard} · K = {k}: Δ = {v}분'],
  rtD: ['日任务量', 'Tasks a day', '하루 작업'], rtRatio: ['比', 'ratio', '비'],
  rt16: ['16 h：自由流 → 预约', '16 h: free → reservation', '16시간: 자유류 → 예약'], rt24: ['24 h：自由流 → 预约', '24 h: free → reservation', '24시간: 자유류 → 예약'],
  // topology table
  tRoads: ['道路（条 / km）', 'Roads (count / km)', '도로 (개 / km)'], tJun: ['路口资源', 'Junction resources', '교차로 자원'],
  tStops: ['停靠点', 'Stops', '정차 지점'],
  tDem: ['本厂日任务量：日均 / 高峰', 'Own daily volume: mean / peak', '자체 일일 작업량: 평균 / 피크'],
  tBind: ['T1′ 取紧的要素（种子数）', 'Where T1′ binds (seeds)', 'T1′이 걸리는 요소 (시드 수)'],
  bindY: ['道路161 坞前 5/10，道路010-6 4/10', 'dock road 161 5/10, road 010-6 4/10', '도크 앞 도로161 5/10, 도로010-6 4/10'],
  bindT: ['建筑014 的两个门 9/10', 'the two doors of building 014 9/10', '건물014의 두 출입구 9/10'],
};
const t = k => T[k][LI[Deck.lang]];
const MC = { free: 'var(--steel)', reserve: 'var(--oxide)', safe: 'var(--ink2)', segment: 'var(--amber)' };
const YC = { yupu: 'var(--steel)', yantai: 'var(--amber)' };
const RULES = ['free', 'reserve', 'safe', 'segment'];
const DEM = { free: 'free', reserve: 'reserve', safe: 'segment_safe', segment: 'segment' };   // rule names in t22_demand.csv
const DASH = { free: '', reserve: '', safe: '', segment: 'stroke-dasharray:7 4;' };
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
const stat = (num, p) => `<div class="stat"><span class="num">${num}</span><p>${p}</p></div>`;
const pressed = (id, v) => document.querySelectorAll(`#${id} button`).forEach(b => b.setAttribute('aria-pressed', b.dataset.v === v));
const lineSw = (c, dash) => `height:0;border-top:2.5px ${dash ? 'dashed' : 'solid'} ${c};background:none`;

// ---------- the capacity interval on the flag figure ----------
let fYard = 'yupu';
function drawFlag() {
  const F = D.flag[fYard], lo = F.plateau.reserve, hi = F.T1t[0];
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
  RULES.forEach((md, i) => {
    const pts = F.K.map((k, j) => [k, ...F[md][j]]);
    el('path', { d: pathOf(pts.map(p => [x(p[0]), y(p[3])])) + pathOf(pts.slice().reverse().map(p => [x(p[0]), y(p[2])])).replace('M', 'L') + 'Z', style: `fill:${MC[md]};opacity:.12` }, g);
    anim(el('path', { d: pathOf(pts.map(p => [x(p[0]), y(p[1])])), pathLength: 1, style: `stroke:${MC[md]};stroke-width:${md === 'safe' ? 2.2 : 2.6};fill:none;stroke-linejoin:round;${DASH[md]}` }, g), md === 'segment' ? 'a-fade' : 'a-draw', .25 + .2 * i);
    pts.forEach((p, j) => {
      if (p[0] > 40 && p[0] % 10) return;   // thin the K = 45–150 grid for hover targets
      if (p[0] < 5 && p[0] !== 1) return;
      const c = anim(el('circle', { cx: x(p[0]), cy: y(p[1]), r: 2.6, style: `fill:${MC[md]};stroke:var(--paper);stroke-width:1` }, g), 'a-pop', .9 + .3 * spread(j));
      hover(c, () => fmt(t('ptTip'), { yard: t(fYard), m: t(md), k: p[0], v: p[1].toFixed(1), lo: p[2].toFixed(0), hi: p[3].toFixed(0) }));
    });
  });
  el('text', { x: W - m.r - 8, y: y(lo) + 17, 'text-anchor': 'end', style: 'fill:var(--oxide);font-weight:600' }, s, `${t('floor')} = ${f0(lo)}`);
  const last = F.free[F.free.length - 1][0];
  if (last > yTop) {   // label where the free-flow line leaves the frame, on its left
    const j = F.free.findIndex(v => v[0] > yTop), kx = F.K[j - 1] + (yTop - F.free[j - 1][0]) * (F.K[j] - F.K[j - 1]) / (F.free[j][0] - F.free[j - 1][0]);
    el('text', { x: x(kx) - 22, y: m.t + 14, 'text-anchor': 'end', style: 'fill:var(--steel);font-weight:600;font-size:12px' }, s, fmt(t('freeOut'), { v: f0(last) }));
  }
  swatches('lgFlag', [[MC.free, t('free')], [MC.reserve, t('reserve')], [MC.safe, t('safe')], [MC.segment, t('segShort')], ['var(--good-soft)', t('band'), 'border:1px solid var(--good)'], ['var(--good)', t('t1tLg'), 'height:2px;border:0']]);
  $('flagRead').innerHTML =
    stat(`[${f0(lo)}, ${f0(hi)}]`, fmt(t('rdInt'), { a: f0(F.T1t[1]), b: f0(F.T1t[2]) }))
    + stat(`${Math.round(100 * lo / hi)}%`, t('rdShare'))
    + stat(`${f0(F.plateau.safe)}<small>${f0(F.safeMax[1])} @ ${F.safeMax[0]}</small>`, fmt(t('rdSafe'), { k: F.safeMax[0], m: f0(F.safeMax[1]) }))
    + stat(`${f0(F.plateau.segment)}<small>${Math.round(100 * F.plateau.segment / hi)}%</small>`, t('rdSeg'));
  pressed('flagYard', fYard);
}

// ---------- reservation against safe release, both yards ----------
function drawSafe() {
  const W = 560, H = fitH('cSafe', W, 380), m = { l: 56, r: 16, t: 14, b: 46 };
  const s = frame('cSafe', W, H, t('safeLbl'));
  const x = lin(0, 150, m.l, W - m.r), y = lin(0, 700, H - m.b, m.t);
  el('rect', { x: m.l, y: m.t, width: x(15) - m.l, height: H - m.b - m.t, style: 'fill:var(--panel)' }, s);
  axes(s, x, y, range(0, 150, 25), range(0, 700, 100), W, H, m);
  el('text', { x: (m.l + W - m.r) / 2, y: H - 6, 'text-anchor': 'middle' }, s, t('K'));
  yTitle(s, 14, (m.t + H - m.b) / 2, t('thr'));
  el('text', { x: m.l + 6, y: m.t + 14, style: 'fill:var(--ink3);font-size:12px' }, s, t('safeEq'));
  ['yupu', 'yantai'].forEach((yd, i) => {
    const F = D.flag[yd];
    ['reserve', 'safe'].forEach((md, r) => {
      const pts = F.K.map((k, j) => [k, F[md][j][0]]);
      anim(el('path', { d: pathOf(pts.map(p => [x(p[0]), y(p[1])])), pathLength: 1, style: `stroke:${YC[yd]};stroke-width:2.6;fill:none;stroke-linejoin:round;${r ? 'stroke-dasharray:6 4;' : ''}` }, s), 'a-draw', .2 + .25 * (2 * i + r));
      pts.forEach(([k, v], j) => {
        if (k > 40 && k % 10) return;
        const c = el('circle', { cx: x(k), cy: y(v), r: 6, style: 'fill:transparent' }, s);
        hover(c, () => `${t(yd)} · ${t(md)}<br>K = ${k}: ${v.toFixed(1)}`);
      });
    });
    const [k, v] = F.safeMax;
    anim(el('circle', { cx: x(k), cy: y(v), r: 6, style: `fill:none;stroke:${YC[yd]};stroke-width:2.2` }, s), 'a-pop', 1.3);
    anim(el('text', { x: x(55), y: y(150 - 45 * i), style: `fill:${YC[yd]};font-weight:700;font-size:13px` }, s, `${t(yd)} · ${t('safe')}: ${fmt(t('safeMax'), { v: f0(v), k })}`), 'a-fade', 1.4);
    anim(el('text', { x: W - m.r - 4, y: y(F.reserve[F.reserve.length - 1][0]) - 9, 'text-anchor': 'end', style: `fill:${YC[yd]};font-weight:600;font-size:12.5px` }, s, `${t(yd)} · ${t('reserve')} ${f0(F.plateau.reserve)}`), 'a-fade', 1.2);
  });
  swatches('lgSafe', [[YC.yupu, t('yupu') + ' · ' + t('reserve'), lineSw(YC.yupu)], [YC.yupu, t('yupu') + ' · ' + t('safe'), lineSw(YC.yupu, 1)],
    [YC.yantai, t('yantai') + ' · ' + t('reserve'), lineSw(YC.yantai)], [YC.yantai, t('yantai') + ' · ' + t('safe'), lineSw(YC.yantai, 1)]]);
}

// ---------- the interval by granularity and task mix ----------
function drawIv() {
  const rows = D.interval, W = 560, H = fitH('cIv', W, 380), m = { l: 92, r: 50, t: 22, b: 44 }, gapU = 0.9;
  const s = frame('cIv', W, H, t('ivLbl'));
  const x = lin(0, 2000, m.l, W - m.r), band = (H - m.t - m.b) / (rows.length + 3 * gapU), bh = Math.min(26, band * 0.62);
  axes(s, x, v => v, range(0, 2000, 500), [], W, H, m, f0);
  range(500, 2000, 500).forEach(v => el('line', { x1: x(v), x2: x(v), y1: m.t, y2: H - m.b, style: 'stroke:var(--line)' }, s));
  el('text', { x: (m.l + W - m.r) / 2, y: H - 6, 'text-anchor': 'middle' }, s, t('ivX'));
  el('text', { x: W - 4, y: m.t - 6, 'text-anchor': 'end', style: 'fill:var(--ink3);font-size:12px' }, s, t('ivRatio'));
  let yy = m.t, prev = null;
  rows.forEach((c, i) => {
    const [yd, sc, gr] = c.key.split('|'), grp = yd + sc, cname = `${t(yd)} · ${t(sc === 'main' ? 'gMain' : 'gErect')}`;
    if (grp !== prev) { el('text', { x: m.l + 6, y: yy + band * gapU - 5, style: 'fill:var(--ink);font-weight:600;font-size:12.5px' }, s, cname); yy += band * gapU; prev = grp; }
    const cy = yy + band / 2, r2 = (c.lower / c.T1).toFixed(2), lbl = `[${f0(c.lower)}, ${f0(c.T1)}]`, wide = x(c.T1) - x(c.lower) > 110;
    el('text', { x: m.l - 8, y: cy + 4, 'text-anchor': 'end', style: 'fill:var(--ink2);font-size:12.5px' }, s, t(gr));
    const r = anim(el('rect', { x: x(c.lower), y: cy - bh / 2, width: x(c.T1) - x(c.lower), height: bh, rx: 2, style: 'fill:var(--good-soft);stroke:var(--good);stroke-width:1' }, s), 'a-x', .3 + .08 * i);
    el('rect', { x: x(c.lower) - 1.5, y: cy - bh / 2 - 3, width: 3, height: bh + 6, style: 'fill:var(--oxide)' }, s);
    el('path', { d: `M${x(c.safe)} ${cy - 6}l6 6l-6 6l-6 -6z`, style: 'fill:var(--paper);stroke:var(--ink2);stroke-width:1.6' }, s);
    el('text', { x: wide ? x(c.T1) - 6 : x(c.T1) + 6, y: cy + 4.5, 'text-anchor': wide ? 'end' : 'start', style: 'fill:var(--good);font-weight:600;font-size:12.5px;font-family:var(--mono)' }, s, lbl);
    el('text', { x: W - 4, y: cy + 5, 'text-anchor': 'end', style: `fill:${c.lower / c.T1 > 0.6 ? 'var(--oxide)' : 'var(--ink)'};font-weight:700;font-family:var(--mono)` }, s, r2);
    hover(r, () => fmt(t('ivTip'), { c: `${cname} · ${t(gr)}`, lo: f0(c.lower), hi: f0(c.T1), r: r2, s: f0(c.safe), sm: f0(c.safeMax[1]), sk: c.safeMax[0] }));
    yy += band;
  });
  swatches('lgIv', [['var(--good-soft)', t('band'), 'border:1px solid var(--good)'], ['var(--oxide)', t('floor'), 'width:4px'], ['var(--paper)', t('ivSafe'), 'border:1.6px solid var(--ink2);transform:rotate(45deg);width:9px;height:9px']]);
}

// ---------- T23: route slack in the bound ----------
const SL = [['yupu', 'main', 'sMain'], ['yupu', 'erection', 'sErect'], ['yupu', 'crane', 'sCrane'], ['yantai', 'main', 'sMain'], ['yantai', 'erection', 'sErect'], ['yantai', 'crane', 'sCrane']];
function drawSlack() {
  const W = 560, H = fitH('cSlack', W, 360), m = { l: 150, r: 30, t: 18, b: 44 };
  const s = frame('cSlack', W, H, t('slLbl'));
  const x = lin(0, 60, m.l, W - m.r), gap = 0.5, band = (H - m.t - m.b) / (SL.length + gap), bh = Math.min(24, band * 0.6);
  axes(s, x, v => v, range(0, 60, 10), [], W, H, m, v => v + '%');
  range(10, 60, 10).forEach(v => el('line', { x1: x(v), x2: x(v), y1: m.t, y2: H - m.b, style: 'stroke:var(--line)' }, s));
  el('text', { x: (m.l + W - m.r) / 2, y: H - 6, 'text-anchor': 'middle' }, s, t('slX'));
  SL.forEach(([yd, sc, k], i) => {
    const B = D.bounds23[yd][sc], cy = m.t + band * (i + 0.5 + (i >= 3 ? gap : 0));
    el('text', { x: m.l - 8, y: cy + 4, 'text-anchor': 'end', style: 'fill:var(--ink);font-size:12.5px' }, s, `${t(yd)} · ${t(k)}`);
    el('rect', { x: m.l, y: cy - bh / 2, width: Math.max(0, x(B.hi) - m.l), height: bh, rx: 2, style: `fill:${YC[yd]};opacity:.3` }, s);
    const r = anim(el('rect', { x: m.l, y: cy - bh / 2, width: Math.max(1.5, x(B.lo) - m.l), height: bh, rx: 2, style: `fill:${YC[yd]}` }, s), 'a-x', .3 + .08 * i);
    hover(r, () => fmt(t('slTip'), { c: `${t(yd)} · ${t(k)}`, s: f0(B.sys), pp: f0(B.T1pp), lo: B.lo.toFixed(1), hi: B.hi.toFixed(1) }));
    const inside = B.hi > 30, lbl = B.hi > 0 ? `+${B.lo.toFixed(1)}% (+${B.hi.toFixed(1)}%)` : '0';
    el('text', { x: inside ? x(B.lo) - 6 : Math.max(x(B.hi), m.l) + 6, y: cy + 4, 'text-anchor': inside ? 'end' : 'start', style: `fill:${inside ? 'var(--paper)' : 'var(--ink)'};font-weight:600;font-family:var(--mono);font-size:12.5px` }, s, lbl);
  });
  swatches('lgSlack', [['var(--steel)', t('slLo')], ['var(--steel)', t('slHi'), 'opacity:.3']]);
  $('sysTbl').innerHTML = `<thead><tr><th>${t('tScen')}</th><th class="c">${t('tSys')}</th><th class="c">${t('tSeeds')}</th><th class="c">T1″</th></tr></thead><tbody>`
    + SL.map(([yd, sc, k]) => { const B = D.bounds23[yd][sc]; return `<tr><td>${t(yd)} · ${t(k)}</td><td class="mono c"><b>${f0(B.sys)}</b></td><td class="mono c">${f0(B.seeds[0])}–${f0(B.seeds[1])}</td><td class="mono c">${f0(B.T1pp)}</td></tr>`; }).join('') + '</tbody>';
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

// ---------- H1 part 3: dock-mouth threshold by fleet size ----------
let rYard = 'yupu';
const RS = [['segment_safe', 'whole', 'var(--ink2)', ''], ['segment_safe', 'stops', 'var(--ink2)', '6 4'], ['segment', 'whole', 'var(--amber)', ''], ['segment', 'stops', 'var(--amber)', '6 4']];
function drawRho() {
  const W = 560, H = fitH('cRho', W, 380), m = { l: 56, r: 16, t: 58, b: 46 };
  const s = frame('cRho', W, H, t('rhoLbl'));
  const x = lin(0, 160, m.l, W - m.r), y = lin(0.3, 1.0, H - m.b, m.t), yNo = m.t - 20;
  axes(s, x, y, [20, 40, 60, 100, 150], range(0.3, 1.0, 0.1), W, H, m, v => v, v => v.toFixed(1));
  el('rect', { x: m.l, y: yNo - 12, width: W - m.l - m.r, height: 24, style: 'fill:var(--panel)' }, s);
  el('text', { x: W - m.r - 4, y: yNo - 17, 'text-anchor': 'end', style: 'fill:var(--ink3);font-size:12px' }, s, t('rhoNo'));
  el('text', { x: (m.l + W - m.r) / 2, y: H - 6, 'text-anchor': 'middle' }, s, t('K'));
  yTitle(s, 14, (m.t + H - m.b) / 2, t('rhoY'));
  const name = (md, gr) => `${t(md === 'segment' ? 'segShort' : 'safe')} · ${t(gr)}`;
  D.rhok[`${rYard}|whole|reserve`].forEach(([k, , , d], j) => {   // reservation: never a 10% drop
    const c = anim(el('rect', { x: x(k) - 18, y: yNo - 5, width: 10, height: 10, style: 'fill:var(--oxide)' }, s), 'a-pop', .4 + .1 * j);
    hover(c, () => fmt(t('rhoTip'), { s: t('reserve'), k, v: fmt(t('rhoTipNo'), { d }) }));
  });
  RS.forEach(([md, gr, c, dash], i) => {
    const P = D.rhok[`${rYard}|${gr}|${md}`], dx = (i - 1.5) * 3.5, bx = (i - 1) * 8;
    const pts = P.filter(p => p[1] != null);
    anim(el('path', { d: pathOf(pts.map(p => [x(p[0]) + dx, y(p[1])])), pathLength: 1, style: `stroke:${c};stroke-width:2.4;fill:none;${dash ? `stroke-dasharray:${dash};` : ''}` }, s), 'a-draw', .3 + .2 * i);
    P.forEach(([k, v, steady, d], j) => {
      const cy = v == null ? yNo : y(v);
      const e = anim(el('circle', { cx: x(k) + (v == null ? bx : dx), cy, r: 4, style: `fill:${v == null || steady ? c : 'var(--paper)'};stroke:${c};stroke-width:1.8` }, s), 'a-pop', .8 + .3 * spread(j));
      hover(e, () => fmt(t('rhoTip'), { s: name(md, gr), k, v: v == null ? fmt(t('rhoTipNo'), { d }) : v.toFixed(2) }));
    });
  });
  swatches('lgRho', [['var(--oxide)', t('rhoRes')], ['', name('segment_safe', 'whole'), lineSw('var(--ink2)')], ['', name('segment_safe', 'stops'), lineSw('var(--ink2)', 1)],
    ['', name('segment', 'whole'), lineSw('var(--amber)')], ['', name('segment', 'stops'), lineSw('var(--amber)', 1)], ['var(--paper)', t('rhoHollow'), 'border:1.6px solid var(--ink2);border-radius:50%']]);
  const at = (yd, gr, K) => D.rhok[`${yd}|${gr}|segment_safe`].find(p => p[0] === K)[1].toFixed(2);
  $('rhoRead').innerHTML = stat(`${at('yupu', 'whole', 20)} → ${at('yupu', 'whole', 150)}`, fmt(t('rd1'), { a: at('yupu', 'whole', 20), b: at('yupu', 'whole', 150), y: t('yantai'), c: at('yantai', 'whole', 20), d: at('yantai', 'whole', 150) }))
    + stat(`${at('yupu', 'whole', 40)} → ${at('yupu', 'stops', 40)}`, t('rd2'));
  pressed('rhoYard', rYard);
}

// ---------- whole-yard vehicles needed, coloured by the H1 test ----------
let dSel = 'yupu|whole';
const LV = { yupu: [300, 339, 350, 450, 500, 600, 678, 700, 900, 1200], yantai: [23, 46, 300, 450, 600, 900, 1200] };
const cellTxt = c => (c == null ? '—' : `${c.k}${c.dag ? '†' : ''}`);
const vCls = c => (c == null ? '' : c.v === 'Y' ? 'vY' : c.v === 'near' ? 'vNear' : '');
function fillDem() {
  const [yd, gr] = dSel.split('|'), small = { 23: 0, 46: 1 };
  const get = (day, d, md) => {
    if (d in small) {   // own volume of Yantai: T20, 16-h days, no safe release
      if (day === 24 || md === 'safe') return null;
      const k = D.flag.yantai.Kreq_small[DEM[md]][small[d]];
      return { k, v: k >= D.Kstar.yantai[1] ? 'Y' : k >= D.Kstar.yantai[0] ? 'near' : 'N' };
    }
    return D.demand[`${yd}|${gr}|${day}`][d][DEM[md]];
  };
  const tag = d => (d === 339 ? t('dOwn') : d === 350 ? t('dDirect') : d === 678 ? t('dPeak') : d === 500 ? t('dHhi') : d === 600 ? t('dShen') : (yd === 'yantai' && d < 100) ? t('dOwn') : '');
  const hd = ['cFree', 'cRes', 'cSafe', 'cRef'].map(k => `<th class="c">${t(k)}</th>`).join('');
  $('demTbl').innerHTML = `<thead><tr><th rowspan="2">${t('dVol')}</th><th colspan="4" class="c grp">${t('d16')}</th><th colspan="4" class="c grp">${t('d24')}</th></tr><tr>${hd}${hd}</tr></thead><tbody>`
    + LV[yd].map(d => `<tr class="${[339, 678].includes(d) || (yd === 'yantai' && d < 100) ? 'own' : ''}"><td><b>${d.toLocaleString('en-US')}</b>${tag(d) ? `<span class="tiny"> ${tag(d)}</span>` : ''}</td>`
      + [16, 24].map(day => RULES.map(md => { const c = get(day, d, md); return `<td class="mono c ${vCls(c)}${md === 'segment' ? ' refcol' : ''}">${cellTxt(c)}</td>`; }).join('')).join('') + '</tr>').join('') + '</tbody>';
  swatches('lgDem', [['var(--oxide-soft)', t('vY'), 'border:1px solid var(--oxide)'], ['var(--amber-soft)', t('vNear'), 'border:1px solid var(--amber)'], ['var(--paper)', t('vN'), 'border:1px solid var(--line)']]);
  $('demK').textContent = `K* = ${D.Kstar[yd].join('–').replace(/^(\d+)–\1$/, '$1')}`;
  pressed('demSel', dSel);
}

// ---------- work-zone chart from the integer-K table ----------
let zYard = 'yupu', zDay = 16;
function drawZone() {
  const W = 560, H = fitH('cZone', W, 380), m = { l: 52, r: 16, t: 16, b: 46 };
  const s = frame('cZone', W, H, t('zoneLbl'));
  const x = lin(0, 1250, m.l, W - m.r), y = lin(0, 160, H - m.b, m.t);
  const ks = D.Kstar[zYard], tab = D.demand[`${zYard}|whole|${zDay}`];
  el('rect', { x: m.l, y: y(ks[1]) - (ks[1] === ks[0] ? 1 : 0), width: W - m.l - m.r, height: Math.max(2, y(ks[0]) - y(ks[1])), style: 'fill:var(--ink3);opacity:.18' }, s);
  axes(s, x, y, range(0, 1250, 250), range(0, 150, 25), W, H, m, v => v.toLocaleString('en-US'));
  el('text', { x: (m.l + W - m.r) / 2, y: H - 6, 'text-anchor': 'middle' }, s, t('zoneX'));
  yTitle(s, 14, (m.t + H - m.b) / 2, t('zoneY'));
  el('text', { x: W - m.r - 6, y: y(ks[1]) - 6, 'text-anchor': 'end', style: 'fill:var(--ink2);font-weight:600;font-size:12.5px' }, s, fmt(t('zoneK'), { k: ks[0] === ks[1] ? ks[0] : ks.join('–') }));
  const marks = zYard === 'yupu' ? [[339, fmt(t('zoneOwn'), { d: 339 })], [678, fmt(t('zonePeak'), { d: 678 })]] : [[46, fmt(t('zoneOwnYt'), { a: 23, b: 46 })]];
  marks.forEach(([d, lbl]) => {
    el('path', { d: `M${x(d)} ${H - m.b}V${m.t + 4}`, style: 'stroke:var(--ink2);stroke-width:1.3;stroke-dasharray:3 3' }, s);
    el('text', { x: x(d) + 4, y: H - m.b - 6, style: 'fill:var(--ink2);font-weight:600;font-size:12px' }, s, lbl);
  });
  const g = clipTo(s, 'clipZone', m, W, H);
  const lv = Object.keys(tab).map(Number).sort((a, b) => a - b);
  RULES.forEach((md, i) => {
    const pts = lv.map(d => [d, tab[d][DEM[md]]]).filter(p => typeof p[1].k === 'number');
    anim(el('path', { d: pathOf(pts.map(([d, c]) => [x(d), y(c.k)])), pathLength: 1, style: `stroke:${MC[md]};stroke-width:${md === 'safe' ? 2.2 : 2.6};fill:none;stroke-linejoin:round;${DASH[md]}` }, g), md === 'segment' ? 'a-fade' : 'a-draw', .3 + .2 * i);
    pts.forEach(([d, c], j) => {
      const e = anim(el('circle', { cx: x(d), cy: y(c.k), r: 3, style: `fill:${MC[md]};stroke:var(--paper);stroke-width:1` }, g), 'a-pop', .9 + .3 * spread(j));
      hover(e, () => fmt(t('zoneTip'), { m: t(md), d, k: c.k + (c.dag ? '†' : '') }));
    });
    const out = lv.filter(d => typeof tab[d][DEM[md]].k !== 'number');
    if (out.length) {   // beyond the scanned range: an arrow at the first such volume
      const d = out[0], v = tab[d][DEM[md]].k.replace('> ', ''), xx = x(d) + (md === 'safe' ? -6 : 6);
      el('path', { d: `M${xx} ${m.t + 34}V${m.t + 6}M${xx - 5} ${m.t + 12}L${xx} ${m.t + 6}L${xx + 5} ${m.t + 12}`, style: `stroke:${MC[md]};stroke-width:2.2;fill:none` }, s);
      el('text', { x: xx + (md === 'safe' ? -6 : 6), y: m.t + 30, 'text-anchor': md === 'safe' ? 'end' : 'start', style: `fill:${MC[md]};font-weight:700;font-size:12px` }, s, fmt(t('zoneOut'), { v }));
    }
  });
  if (zYard === 'yupu') {   // field fleets of other large Korean yards (T24, full texts)
    ['hhi', 'shen'].forEach(k => {   // named in the legend
      const [d, n] = D.field[k];
      const e = anim(el('path', { d: `M${x(d)} ${y(n) - 7}l7 7l-7 7l-7 -7z`, style: 'fill:var(--good);stroke:var(--paper);stroke-width:1.2' }, s), 'a-pop', 1.4);
      hover(e, () => fmt(t(k === 'hhi' ? 'zoneHhi' : 'zoneShen'), { n, d }));
    });
  }
  swatches('lgZone', [[MC.free, t('free')], [MC.reserve, t('reserve')], [MC.safe, t('safe')], [MC.segment, t('segShort')], ['var(--ink3)', 'K*', 'opacity:.35'], ['var(--good)', fmt(t('zoneAnchor'), { h: D.field.hhi[1], hd: D.field.hhi[0], s: D.field.shen[1], sd: D.field.shen[0] }), 'transform:rotate(45deg);width:9px;height:9px']]);
  const q = (day, d, md) => D.demand[`yupu|whole|${day}`][d][md].k;
  const [hd, hn] = D.field.hhi, [sd, sn] = D.field.shen;
  $('zoneRead').innerHTML = stat(`${q(24, hd, 'free')} &lt; ${hn} &lt; ${q(24, hd, 'reserve')}`, fmt(t('zr1'), { d: hd, f: q(24, hd, 'free'), r: q(24, hd, 'reserve'), n: hn }))
    + stat(`${q(24, sd, 'free')} &lt; ${sn} &lt; ${q(24, sd, 'reserve')}`, fmt(t('zr2'), { d: sd, f: q(24, sd, 'free'), r: q(24, sd, 'reserve'), s: q(24, sd, 'segment'), n: sn, f16: q(16, sd, 'free'), r16: q(16, sd, 'reserve') }));
  pressed('zoneYard', zYard); pressed('zoneDay', String(zDay));
}

// ---------- H1 test by volume caliber (whole-route reservation; both working days) ----------
const CAL = [['hOwn', 'yupu', [339, 350]], ['hPeak', 'yupu', [678, 700]], ['hHhi', 'yupu', [500]], ['hShen', 'yupu', [600]], ['hYtOwn', 'yantai', [23, 46]], ['hYt450', 'yantai', [450]]];
function fillH1() {
  const verdict = cs => {
    const v = new Set(cs.map(c => c.v)), ks = cs.map(c => c.k), kr = Math.min(...ks) === Math.max(...ks) ? `${ks[0]}` : `${Math.min(...ks)}–${Math.max(...ks)}`;
    const [w, cls] = v.size === 1 ? (v.has('Y') ? ['hY', 'vY'] : v.has('N') ? ['hN', ''] : ['hNear', 'vNear']) : v.has('N') && !v.has('Y') ? ['hEdge', 'vNear'] : ['hNear', 'vNear'];
    return `<td class="c ${cls}"><b>${t(w)}</b><span class="tiny"> ${fmt(t('hK'), { k: kr })}</span></td>`;
  };
  $('h1Tbl').innerHTML = `<thead><tr><th>${t('hCal')}</th><th class="c">${t('d16')}</th><th class="c">${t('d24')}</th></tr></thead><tbody>`
    + CAL.map(([k, yd, ds]) => {
      const lbl = `<td>${t(k)} <span class="tiny">${fmt(t('hKstar'), { k: D.Kstar[yd][0] === D.Kstar[yd][1] ? D.Kstar[yd][0] : D.Kstar[yd].join('–') })}</span></td>`;
      if (yd === 'yantai' && ds[0] < 100) {
        const ks = D.flag.yantai.Kreq_small.reserve;
        return `<tr>${lbl}<td class="c"><b>${t('hN')}</b><span class="tiny"> ${fmt(t('hK'), { k: ks.join('–') })}</span></td><td class="c tiny">${t('hYtOnly')}</td></tr>`;
      }
      const secs = yd === 'yupu' ? ['whole', 'stops'] : ['whole'];
      return `<tr>${lbl}` + [16, 24].map(day => verdict(secs.flatMap(g => ds.map(d => D.demand[`${yd}|${g}|${day}`][d].reserve)))).join('') + '</tr>';
    }).join('') + '</tbody>';
}

// ---------- H1: density criterion, daily volume / T1' ----------
function drawDen() {
  const Dn = D.density, share = 100 * D.flag.yupu.plateau.reserve / D.flag.yupu.T1t[0];
  const rows = [...Dn.yantai.map(([d, v]) => ['denYt', 'yantai', d, v, 'var(--amber)']), ...Dn.yupu.map(([d, v]) => ['denOk', 'yupu', d, v, 'var(--steel)']), ...Dn.korea.map(([d, v]) => ['denKo', null, d, v, 'var(--ink3)'])];
  const W = 560, H = fitH('cDen', W, 380), m = { l: 150, r: 40, t: 30, b: 40 };
  const s = frame('cDen', W, H, t('denLbl'));
  const x = lin(0, 45, m.l, W - m.r), gap = 0.7, band = (H - m.t - m.b) / (rows.length + 2 * gap), bh = Math.min(24, band * 0.62);
  axes(s, x, v => v, range(0, 40, 10), [], W, H, m, v => v + '%');
  range(10, 40, 10).forEach(v => el('line', { x1: x(v), x2: x(v), y1: m.t, y2: H - m.b, style: 'stroke:var(--line)' }, s));
  el('text', { x: (m.l + W - m.r) / 2, y: H - 6, 'text-anchor': 'middle' }, s, t('denX'));
  let yy = m.t, prev = null;
  rows.forEach(([grp, yd, d, v, c], i) => {
    if (grp !== prev) { if (prev) yy += band * gap; el('text', { x: m.l + 4, y: yy + band * 0.5 - bh / 2 - 4, style: `fill:${c};font-size:12px;font-weight:600` }, s, t(grp)); prev = grp; }
    const cy = yy + band * 0.5 + 6, lbl = yd ? fmt(t('denRow'), { yard: t(yd), d }) : fmt(t('denKr'), { d });
    el('text', { x: m.l - 8, y: cy + 4, 'text-anchor': 'end', style: 'fill:var(--ink);font-size:12.5px' }, s, lbl);
    const r = anim(el('rect', { x: m.l, y: cy - bh / 2, width: Math.max(1, x(v) - m.l), height: bh, rx: 2, style: `fill:${c}` }, s), 'a-x', .3 + .08 * i);
    hover(r, () => `${lbl}: ${v.toFixed(1)}%`);
    const inside = v > 25;   // long bars carry their value inside, clear of the plateau line
    el('text', { x: inside ? x(v) - 6 : x(v) + 6, y: cy + 4, 'text-anchor': inside ? 'end' : 'start', style: `fill:${inside ? 'var(--paper)' : 'var(--ink)'};font-weight:600;font-family:var(--mono)` }, s, v.toFixed(1) + '%');
    yy += band;
  });
  el('path', { d: `M${x(share)} ${m.t - 6}V${H - m.b}`, style: 'stroke:var(--oxide);stroke-width:1.6;stroke-dasharray:6 4' }, s);
  el('text', { x: x(share) - 4, y: m.t - 12, 'text-anchor': 'end', style: 'fill:var(--oxide);font-weight:600;font-size:12px' }, s, fmt(t('denLine'), { v: Math.round(share) }));
  swatches('lgDen', [['var(--amber)', t('denYt')], ['var(--steel)', t('denOk')], ['var(--ink3)', t('denKo')], ['var(--oxide)', fmt(t('denLine'), { v: Math.round(share) }), 'height:2px;border:0']]);
}

// ---------- external anchors: tasks per vehicle-day ----------
function drawProd() {
  const F = D.field, A = (k, n) => F[k][0] / (n || F[k][1]);
  const mod = (day, md) => D.anchor.find(r => r[0] === 'yupu' && r[1] === day && r[2] === DEM[md] && r[3] === 30)[4];
  const field = [['pYim', A('yim')], ['pHeo', A('heo'), A('heo', F.heo[2])], ['pShen', A('shen')], ['pHhi', A('hhi')]];
  const W = 560, H = fitH('cProd', W, 380), m = { l: 210, r: 44, t: 30, b: 40 };
  const s = frame('cProd', W, H, t('prodLbl'));
  const x = lin(0, 32, m.l, W - m.r), n = field.length + RULES.length, band = (H - m.t - m.b) / (n + 0.7), bh = Math.min(24, band * 0.62);
  axes(s, x, v => v, range(0, 32, 4), [], W, H, m);
  range(4, 32, 4).forEach(v => el('line', { x1: x(v), x2: x(v), y1: m.t, y2: H - m.b, style: 'stroke:var(--line)' }, s));
  el('text', { x: (m.l + W - m.r) / 2, y: H - 6, 'text-anchor': 'middle' }, s, t('prodX'));
  el('text', { x: 4, y: m.t - 10, style: 'fill:var(--amber);font-size:12px;font-weight:600' }, s, t('pField'));
  field.forEach(([k, v, v5], i) => {
    const yy = m.t + band * (i + 0.5);
    el('text', { x: m.l - 8, y: yy + 4, 'text-anchor': 'end', style: 'fill:var(--ink);font-size:12.5px' }, s, t(k));
    if (v5) el('rect', { x: m.l, y: yy - bh / 2, width: x(v5) - m.l, height: bh, rx: 2, style: 'fill:var(--amber-hi);opacity:.3' }, s);
    const r = anim(el('rect', { x: m.l, y: yy - bh / 2, width: x(v) - m.l, height: bh, rx: 2, style: 'fill:var(--amber-hi)' }, s), 'a-x', .3 + .08 * i);
    hover(r, () => `${t(k)}: ${v.toFixed(1)}${v5 ? ' · ' + fmt(t('pHeo5'), { v: v5.toFixed(1) }) : ''}`);
    el('text', { x: x(v5 || v) + 6, y: yy + 4, style: 'fill:var(--ink);font-weight:600;font-family:var(--mono)' }, s, v5 ? `${v.toFixed(1)} / ${v5.toFixed(1)}` : v.toFixed(1));
  });
  const y0 = m.t + band * (field.length + 0.7);
  el('text', { x: 4, y: y0 - 4, style: 'fill:var(--steel);font-size:12px;font-weight:600' }, s, t('pModel'));
  RULES.forEach((md, i) => {
    const yy = y0 + band * (i + 0.5), a = mod(16, md), b = mod(24, md), h2 = bh / 2 - 1;
    el('text', { x: m.l - 8, y: yy + 4, 'text-anchor': 'end', style: 'fill:var(--ink);font-size:12.5px;font-weight:600' }, s, t(md === 'segment' ? 'segShort' : md));
    const r1 = anim(el('rect', { x: m.l, y: yy - h2 - 1, width: x(a) - m.l, height: h2, rx: 1.5, style: `fill:${MC[md]}` }, s), 'a-x', .5 + .08 * i);
    const r2 = anim(el('rect', { x: m.l, y: yy + 1, width: x(b) - m.l, height: h2, rx: 1.5, style: `fill:${MC[md]};opacity:.45` }, s), 'a-x', .55 + .08 * i);
    hover(r1, () => `${t(md)} · ${t('p16')}: ${a.toFixed(1)}`); hover(r2, () => `${t(md)} · ${t('p24')}: ${b.toFixed(1)}`);
    el('text', { x: x(Math.max(a, b)) + 6, y: yy + 4, style: 'fill:var(--ink);font-weight:600;font-family:var(--mono);font-size:12.5px' }, s, `${a.toFixed(1)} / ${b.toFixed(1)}`);
  });
  swatches('lgProd', [['var(--amber-hi)', t('pField')], ['var(--ink2)', t('p16')], ['var(--ink2)', t('p24'), 'opacity:.45']]);
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

// ---------- tables filled from the data ----------
function fillTables() {
  const Y = ['yupu', 'yantai'], F = D.flag, own = { yupu: D.density.yupu.map(r => r[0]), yantai: D.density.yantai.map(r => r[0]) };
  const row = (k, f) => `<tr><td>${t(k)}</td>${Y.map(y => `<td class="mono">${f(F[y], y)}</td>`).join('')}</tr>`;
  $('topoTbl').innerHTML = `<thead><tr><th></th>${Y.map(y => `<th>${t(y)}</th>`).join('')}</tr></thead><tbody>` + [
    row('tRoads', f => `${f.topo.roads} / ${f.topo.km}`), row('tJun', f => f.topo.junction_res),
    row('tStops', f => f.topo.stops), row('tDem', (f, y) => own[y].join(' / ')),
    `<tr><td>${t('tBind')}</td>${Y.map(y => `<td style="font-family:var(--body)">${t(y === 'yupu' ? 'bindY' : 'bindT')}</td>`).join('')}</tr>`,
  ].join('') + '</tbody>';
  const L = [300, 339, 450, 600, 678, 900], q = (day, d, md) => D.demand[`yupu|whole|${day}`][d][md].k;
  const ratio = (r, f) => (typeof r === 'number' ? (r / f).toFixed(1) : `> ${(Number(r.replace('> ', '')) / f).toFixed(1)}`);
  $('ratioTbl').innerHTML = `<thead><tr><th>${t('rtD')}</th><th class="c">${t('rt16')}</th><th class="c">${t('rtRatio')}</th><th class="c">${t('rt24')}</th><th class="c">${t('rtRatio')}</th></tr></thead><tbody>`
    + L.map(d => `<tr class="${[339, 678].includes(d) ? 'own' : ''}"><td>${d}</td>` + [16, 24].map(day => `<td class="mono c" style="white-space:nowrap">${q(day, d, 'free')} → ${q(day, d, 'reserve')}</td><td class="mono c" style="white-space:nowrap"><b>${ratio(q(day, d, 'reserve'), q(day, d, 'free'))}</b></td>`).join('') + '</tr>').join('') + '</tbody>';
}

function init() {
  const bind = (id, f) => $(id).addEventListener('click', e => { const b = e.target.closest('button'); if (b) f(b.dataset.v); });
  bind('flagYard', v => { fYard = v; drawFlag(); });
  bind('rhoYard', v => { rYard = v; drawRho(); });
  bind('demSel', v => { dSel = v; fillDem(); });
  bind('zoneYard', v => { zYard = v; drawZone(); });
  bind('zoneDay', v => { zDay = Number(v); drawZone(); });
}

Deck.start({
  strings: T,
  sections: { intro: ['导读', 'Overview', '개요'], exp: ['立旗实验', 'Flag experiment', '깃발 실험'], c1: ['运力区间 C1、C2', 'Capacity interval C1, C2', '운송 능력 구간 C1, C2'],
    h1: ['路网约束区 H1', 'Network-bound regime H1', '도로망 제약 구간 H1'], anchor: ['外部锚点', 'External anchors', '외부 기준점'], h3: ['自由流误差 H3', 'Free-flow error H3', '자유류 오차 H3'],
    status: ['进度与计划', 'Progress and plan', '진행과 계획'], pub: ['论文与期刊', 'Paper and journals', '논문과 학술지'], ref: ['参考文献', 'References', '참고문헌'], end: ['链接', 'Links', '링크'] },
  draw: [drawFlag, drawSafe, drawIv, drawSlack, drawMarg, drawRho, fillDem, drawZone, fillH1, drawDen, drawProd, drawGap, fillTables],
  init,
});
})();
