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
  M1: ['Jiang 实测', 'Jiang', 'Jiang 실측'], M2: ['偏轻', 'Light-skewed', '경량 편중'], M3: ['均匀', 'Uniform', '균일'],
  M4: ['重尾', 'Heavy tail', '중량 꼬리'], M5: ['Roh–Cha', 'Roh–Cha', 'Roh–Cha'], M6: ['Liu', 'Liu', 'Liu'],
  H1: ['短', 'short', '짧음'], H2: ['随重', 'mass-dep.', '중량비례'], H3: ['长', 'long', '긺'],
  H1l: ['短装卸', 'short handling', '짧은 적재·하역'], H2l: ['随重量变化的装卸', 'mass-dependent handling', '중량 비례 적재·하역'], H3l: ['长装载', 'long loading', '긴 적재'],
  'D-emp': ['基准', 'empirical', '기준'], 'D-tight': ['紧', 'tight', '촉박'],
  'D-empl': ['基准交期', 'empirical due dates', '기준 납기'], 'D-tightl': ['紧交期', 'tight due dates', '촉박한 납기'],
  xr: ['价格比 θ（人时/天）', 'Price ratio θ (labour-hours/day)', '가격비 θ (인시/일)'],
  winner: ['最省车队', 'Cheapest fleet', '최저비용 차량군'],
  coupled: ['拼载的分段', 'Blocks coupled', '결합 운반 블록'],
  hatchTip: ['按天重抽样中胜者保持 < 80%：与另一车队几乎打平', 'Winner kept in < 80% of day resamples: nearly tied with another fleet', '일자 재표본에서 승자 유지 < 80%: 다른 차량군과 거의 동률'],
  weakTip: ['弱搜索依赖：多搜一点可能翻转', 'Weak search dependence: a little more search could flip it', '약한 탐색 의존성: 탐색을 조금 더 하면 뒤집힐 수 있음'],
  hatchLg: ['支持率 < 80%', 'support < 80%', '유지율 < 80%'], weakLg: ['弱搜索依赖', 'weak search dependence', '약한 탐색 의존성'],
  pX: ['额定载重（t）', 'Rated capacity (t)', '정격 용량 (t)'],
  pY: ['单价（百万元，不含税）', 'Unit price (CNY million, ex VAT)', '단가 (백만 위안, 부가세 제외)'],
  mcny: ['百万元', 'M CNY', '백만 위안'],
  pFit: ['仿射拟合', 'Affine fit', '아핀 적합'],
  capX: ['吨级（t）', 'Tier (t)', '등급 (t)'],
  capY: ['人时 / 天', 'labour-hours / day', '인시 / 일'],
  crew: ['一组人：4 人 × 16 h = 64', 'One crew: 4 × 16 h = 64', '작업 인원: 4명 × 16시간 = 64'],
  capTxt: ['θ = {r} 时，最贵的 550 t 每天资本成本为 {v} 人时，仍低于一组人的 64 人时。少买一台车，比升级到更大吨级更省。',
           'At θ = {r}, the dearest tier, 550 t, costs {v} labour-hours of capital a day, still below one crew’s 64. Saving a transporter beats moving up a tier.',
           'θ = {r}일 때 가장 비싼 550 t의 하루 자본비는 {v}인시로, 작업 인원 64인시보다 낮다. 한 대를 덜 사는 편이 등급을 올리는 것보다 절약된다.'],
  sX: ['拼载占服务时间（%）', 'Coupled share of service time (%)', '결합 운반의 서비스 시간 비율 (%)'],
  sY: ['比最省车队贵（%）', 'Cost above the cheapest fleet (%)', '최저비용 대비 추가 비용 (%)'],
  work: ['工作量 × {k}', 'Workload × {k}', '작업량 × {k}'],
  cheapest: ['最省', 'cheapest', '최저'],
  above: ['比最省贵（%）', 'Above the cheapest (%)', '최저 대비 추가 (%)'],
  aY: ['与最终决定相同（%）', 'Same fleet as final (%)', '최종 결정과 동일 (%)'],
  greedy: ['贪心', 'Greedy', '탐욕'], cp0: ['仅构造', 'Constr.', '구성만'], cp100: ['100 次迭代', '100 it.', '100회'],
  cp300: ['300 次迭代', '300 it.', '300회'], single: ['786 次迭代', '786 it.', '786회'], final: ['最终', 'Final', '최종'],
  stackTip: ['台数 = K*：{a} 个车队 · 多 1 台：{b} · 多 2 台以上：{c}', 'Count = K*: {a} fleets · one more: {b} · two or more: {c}', '대수 = K*: {a}개 차량군 · 1대 많음: {b} · 2대 이상 많음: {c}'],
  lX: ['K* − Kρ（台）', 'K* − Kρ (transporters)', 'K* − Kρ (대)'],
  lY: ['车队数', 'Sized fleets', '차량군 수'],
  base: ['基准交期', 'Empirical due dates', '기준 납기'], tight: ['紧交期', 'Tight due dates', '촉박한 납기'],
  under: ['少估 →', 'underestimate →', '과소 추정 →'],
  single1: ['<span class="v-ok">单车运输</span>：{Q} t ≥ {m} t，占用 1 台车 · 4 人。',
            '<span class="v-ok">Carried alone</span>: {Q} t ≥ {m} t, holding 1 vehicle · 4 crew.',
            '<span class="v-ok">단독 운반</span>: {Q} t ≥ {m} t, 차량 1대 · 인원 4명 점유.'],
  couple: ['<span class="v-cp">{n} 台拼载</span>：{n} × {Q} = {S} t ≥ {m} t；少一台只有 {S2} t &lt; {m} t。占用 {n} 台车 · {w} 人，另加 10 min 对接。',
           '<span class="v-cp">{n} coupled</span>: {n} × {Q} = {S} t ≥ {m} t; one fewer gives only {S2} t &lt; {m} t. Holds {n} vehicles · {w} crew, plus 10 min coupling.',
           '<span class="v-cp">{n}대 결합</span>: {n} × {Q} = {S} t ≥ {m} t, 한 대 적으면 {S2} t &lt; {m} t. 차량 {n}대 · 인원 {w}명 점유, 결합 10분 추가.'],
  nope: ['<span class="v-no">运不了</span>：需要 {n} 台，超过最多 3 台的上限，必须用更大吨级。',
         '<span class="v-no">Cannot carry</span>: it would take {n} transporters, above the limit of 3. A larger tier must carry it.',
         '<span class="v-no">운반 불가</span>: {n}대가 필요해 최대 3대 한도를 넘는다. 더 큰 등급이 운반해야 한다.'],
  series: ['系列', 'series', '시리즈'], runs: ['次运行', 'runs', '회 실행'], est: ['预估', 'est.', '예상'],
  pilot: ['试算中', 'pilot', '시험 실행 중'], planned: ['待运行', 'planned', '예정'], phaseN: ['第 {n} 阶段', 'phase {n}', '{n}단계'],
  heatHint: ['读图示例：最下面 6 行（Liu 重量）全是深蓝，表示 425 t 在所有价格下都最便宜；格子里的 0 表示它完全不拼载。把鼠标移到格子上可看细节。',
             'Example: the bottom six rows (Liu masses) are all dark blue, so 425 t is cheapest at every price, and the 0 means it never couples. Hover a cell for details.',
             '읽기 예: 맨 아래 6행(Liu 중량)은 모두 짙은 파랑으로 425 t가 모든 가격에서 가장 싸다는 뜻이고, 0은 결합 운반이 전혀 없다는 뜻이다. 칸에 마우스를 올리면 세부 정보가 나온다.'],
  // one working day
  dX: ['从班次开始算起的时间（h）', 'Hours from the start of the shift', '교대 시작부터의 시간 (h)'],
  dY: ['分段重量（t）', 'Block mass (t)', '블록 중량 (t)'],
  shiftEnd: ['16 h 班次结束', '16-h shift ends', '16시간 교대 종료'],
  dayTip: ['{m} t · 释放 {r} h · 交期 {d} h', '{m} t · release {r} h · due {d} h', '{m} t · 투입 {r}h · 납기 {d}h'],
  // timetables
  gEmpty: ['空驶', 'Empty travel', '공차 주행'], gSingle: ['单独搬运', 'Carried alone', '단독 운반'],
  gCoupled: ['拼载搬运（含对接）', 'Coupled move (incl. coupling)', '결합 운반 (결합 포함)'],
  gWait: ['等队友', 'Waiting for team', '팀원 대기'], gLate: ['迟到（红框）', 'Late (red outline)', '지연 (빨간 테두리)'],
  gTitle: ['{f} × {k} 台', '{f} × {k} vehicles', '{f} × {k}대'],
  gTip: ['分段 #{id} · {m} t · {team}<br>释放 {r} · 交期 {d} · 完成 {c}', 'Block #{id} · {m} t · {team}<br>release {r} · due {d} · done {c}', '블록 #{id} · {m} t · {team}<br>투입 {r} · 납기 {d} · 완료 {c}'],
  alone: ['单独运', 'alone', '단독'], teamOf: ['{n} 台拼载', '{n} coupled', '{n}대 결합'],
  onTime: ['准时', 'on time', '정시'], lateBy: ['晚 {m} min', '{m} min late', '{m}분 지연'],
  hrs: ['时间（h）', 'Hours', '시간 (h)'],
  cVeh: ['台数 K*', 'Vehicles K*', '대수 K*'], cOn: ['当天准时', 'On time that day', '당일 정시'],
  cCoup: ['拼载的分段', 'Blocks coupled', '결합 운반 블록'], cWork: ['车辆工作时间（车·时）', 'Vehicle work (vehicle-h)', '차량 작업 시간 (차량·시)'],
  cEmpty: ['· 其中空驶', '· empty travel', '· 그중 공차 주행'], cSync: ['· 其中等队友', '· waiting for team', '· 그중 팀원 대기'],
  cLate: ['最大迟到（min）', 'Worst delay (min)', '최대 지연 (분)'],
  cP: ['车队价格 P（270 t = 1）', 'Fleet price P (270 t = 1)', '차량군 가격 P (270 t = 1)'],
  cCost: ['每天成本，人时（θ = 12.4，班次人工）', 'Daily cost (labour-h, θ = 12.4)', '하루 비용, 인시 (θ = 12.4, 교대 인건비)'],
  // mass scenarios
  M1d: ['Jiang et al. (2021) 三组算例的 68 个重量，有放回抽样', '68 masses from the three instances of Jiang et al. (2021), resampled', 'Jiang et al. (2021) 세 인스턴스의 중량 68개 재표본'],
  M2d: ['90% 为 100–300 t（Park &amp; Seo 2012），10% 为 300–500 t（设定）', '90% at 100–300 t (Park &amp; Seo 2012), 10% at 300–500 t (assumed)', '90%는 100–300 t (Park &amp; Seo 2012), 10%는 300–500 t (설정)'],
  M3d: ['100–500 t 均匀（Kweon et al. 2026 公开实例的规则）', 'Uniform 100–500 t (the rule of the public instances of Kweon et al. 2026)', '100–500 t 균일 (Kweon et al. 2026 공개 인스턴스 규칙)'],
  M4d: ['偏轻分布加 10% 的 500–800 t 尾部：有的块超过所有吨级（设定，压力测试）', 'Light-skewed plus a 10% tail at 500–800 t: some blocks exceed every tier (assumed, a stress test)', '경량 편중 + 500–800 t 꼬리 10%: 일부 블록은 모든 등급 초과 (설정, 압력 시험)'],
  M5d: ['Roh &amp; Cha (2011) 表 2 的 10 个分段重量，有放回抽样', 'The ten block masses of Roh &amp; Cha (2011) Table 2, resampled', 'Roh &amp; Cha (2011) 표 2의 블록 중량 10개 재표본'],
  M6d: ['Liu et al. (2022) 一周 50 块分段的重量，有放回抽样', 'The 50 block masses of one week in Liu et al. (2022), resampled', 'Liu et al. (2022) 1주일 블록 50개의 중량 재표본'],
  above270: ['超过 270 t：{p}%', 'above 270 t: {p}%', '270 t 초과: {p}%'],
  // calculator
  fleetH: ['车队', 'Fleet', '차량군'], compH: ['组成', 'Composition', '구성'], costH: ['每天成本（人时）', 'Daily cost (labour-h)', '하루 비용 (인시)'],
  aboveH: ['比最省', 'vs cheapest', '최저 대비'], coupH: ['拼载', 'Coupled', '결합'],
  capLg: ['资本 θ × P', 'Capital θ × P', '자본 θ × P'], labLg: ['人工 L', 'Labour L', '인건비 L'],
  liuFinal: ['共用车速（12/6 km/h）下：{n} / {N} 个决策全部由混编胜出，领先下一名 {lo}–{hi}%，拼载 ≤ {c}%。',
             'At common speeds (12/6 km/h): a mix wins {n} of {N} decisions, {lo}–{hi}% ahead of the next fleet, coupling at most {c}%.',
             '공통 속도 (12/6 km/h): {N}개 중 {n}개 결정 모두 혼합이 최저, 다음 차량군보다 {lo}–{hi}% 싸고 결합은 {c}% 이하.'],
  porNum: ['个成本决策中买车成本上升；中位数 0，最多 {max}%', 'cost decisions where the purchase gets dearer; median 0, at most {max}%', '개 비용 결정에서 구매 비용 상승, 중앙값 0, 최대 {max}%'],
  porNote: ['另有 {neg} 个决策受限规则反而更便宜：{small} 个不到 1%（搜索差异）；{big} 个都在“{cell}”，最多 {min}%。那里受限规则 5 台就达标，灵活规则的搜索却停在 6 台：主实验在该工况多算了 1 台，2 重车混编（而不是报告的 550 t）才是 {m4} 个班次人工决策中最便宜的。',
            '{neg} more decisions are cheaper under the restricted rule: {small} by under 1% (search noise), {big} in {cell} by up to {min}%. There the restricted rule qualified with 5 vehicles where the flexible search stopped at 6, so the two-heavy mix, not the reported 550 t, is cheapest in {m4} shift-labour decisions.',
            '또 {neg}개 결정은 제한 규칙에서 오히려 싸다. {small}개는 1% 미만 (탐색 차이), {big}개는 모두 "{cell}"에서 최대 {min}%. 그 조건에서 제한 규칙은 5대로 충족했지만 유연 규칙의 탐색은 6대에서 멈췄다. 주 실험이 1대를 더 센 것이며, {m4}개 교대 인건비 결정에서는 보고된 550 t가 아니라 대형 2대 혼합이 최저다.'],
  porTip: ['{cell}<br>r = {r} · 贵 {v}%<br>灵活：{a} → 超重才拼：{b}', '{cell}<br>r = {r} · {v}% dearer<br>flexible: {a} → overweight-only: {b}', '{cell}<br>r = {r} · {v}% 상승<br>유연: {a} → 초과 중량: {b}'],
  porZero: ['0：没有变化', '0: no change', '0: 변화 없음'], porPos: ['变贵（越深越贵，最深 {max}%）', 'dearer (darker = more, up to {max}%)', '비싸짐 (진할수록, 최대 {max}%)'],
  porNeg: ['更便宜：搜索差异', 'cheaper: search difference', '더 쌈: 탐색 차이'],
  b4Cell: ['工况（基准交期）', 'Condition (empirical due dates)', '조건 (기준 납기)'],
  doneP: ['已完成', 'done', '완료'],
  lateLbl: ['无上限 {k} 台（有上限要 {k1} 台）· 晚 4 h 以上 {n} 块', '{k} vehicles uncapped ({k1} with the cap) · {n} blocks > 4 h late', '상한 없음 {k}대 (상한 시 {k1}대) · 4시간 초과 {n}개'],
  lateAx: ['30 天里最晚一块的延误（h）', 'Largest delay over 30 days (h)', '30일 중 최대 지연 (h)'],
  capLine: ['120 min 上限', '120-min cap', '120분 상한'],
  tmaxA: ['最省车队拼载的分段（%）', 'Blocks coupled by the cheapest fleet (%)', '최저비용 차량군의 결합 블록 (%)'],
  tmaxB: ['比不设上限时贵（%）', 'Cost above the uncapped choice (%)', '상한 없음 대비 추가 비용 (%)'],
  tmaxX: ['每块分段的延误上限', 'Per-block delay cap', '블록별 지연 상한'],
  noCap: ['无', 'none', '없음'],
  oneTen: ['1/10', 'one in ten', '10%'],
  tmaxTip: ['{sc} · 上限 {lev}<br>最省：{fleet}<br>拼载 {c}% · 成本 +{md}%（{lo} 到 {hi}%）', '{sc} · cap {lev}<br>cheapest: {fleet}<br>{c}% coupled · cost +{md}% ({lo} to {hi}%)', '{sc} · 상한 {lev}<br>최저: {fleet}<br>결합 {c}% · 비용 +{md}% ({lo}–{hi}%)'],
  thSc: ['重量', 'Masses', '중량'], thNo: ['不设上限', 'No cap', '상한 없음'], thCap: ['120 min 上限', '120-min cap', '120분 상한'], thCost: ['成本', 'Cost', '비용'],
  e7Ax: ['重分段（350–540 t）占比 φ', 'Share φ of heavy blocks (350–540 t)', '무거운 블록(350–540 t) 비율 φ'],
  e7Tip: ['重块占 {p}% · {fleet} · 拼载 {c}%', 'heavy share {p}% · {fleet} · {c}% coupled', '무거운 블록 {p}% · {fleet} · 결합 {c}%'],
  e7Le: ['300 t：重块都要拼载', '300 t: couples every heavy block', '300 t: 무거운 블록 모두 결합'],
  e7Mx: ['270 t 轻车 + 1 或 2 台 550 t', '270 t units + one or two 550 t', '270 t 경형 + 550 t 1–2대'],
  e7Big: ['550 t：每块都单独运', '550 t: carries every block alone', '550 t: 모든 블록 단독 운반'],
  e5Ax: ['最省车队改变的班次人工决策（每个水平共 180 个）', 'Shift-labour decisions whose cheapest fleet changed (180 per level)', '최저비용 차량군이 바뀐 교대 인건비 결정 (수준별 180개)'],
  e5Max: ['最省车队拼载', 'Coupled', '결합 비율'],
  e5Tip: ['{f}：{v}<br>最省车队改变 {n} / 180{nw}<br>最省车队最多拼载 {c}%<br>四种人工口径下拼载 ≤ 1/10：{le} / {has}', '{f}: {v}<br>cheapest fleet changed in {n} of 180{nw}<br>cheapest fleet couples at most {c}%<br>≤ one in ten over all labour measures: {le} of {has}', '{f}: {v}<br>최저비용 차량군 변경 {n} / 180{nw}<br>최저비용 차량군 최대 결합 {c}%<br>4가지 인건비 기준에서 결합 ≤ 10%: {le} / {has}'],
  ktTier: ['覆盖吨级', 'covering tier', '커버 등급'], ktNone: ['无覆盖吨级：9% 的块 > 550 t', 'no covering tier: 9% of blocks > 550 t', '커버 등급 없음: 블록 9% > 550 t'],
  occX: ['拼载的分段比例（%）', 'Blocks carried by a coupled team (%)', '결합 운반 블록 비율 (%)'],
  occY: ['每天车时，比覆盖车队多（%）', 'Transporter-hours vs covering fleet (%)', '일일 차량 시간, 커버 차량군 대비 (%)'],
  occFit: ['每多拼 1 个百分点，车时 +{b}%（r = {r}）', '+{b}% transporter-hours per point coupled (r = {r})', '결합 1%p당 차량 시간 +{b}% (r = {r})'],
  slackY: ['比负荷估算多需的车（%）', 'Beyond the workload rule (%)', '부하 추정 대비 추가 (%)'],
  brkCal: ['标定范围', 'calibrated range', '보정 범위'], brkCrew: ['一组人一班 = 64 人时', 'one crew-shift = 64 labour-h', '1개 조 1교대 = 64 인시'],
  brkX: ['一台 270 t 车每天的资本成本 θ（人时，对数轴）', 'Daily capital cost of a 270 t transporter, θ (labour-hours, log scale)', '270 t 차량의 일일 자본 비용 θ (인시, 로그 축)'],
  brkY: ['拼载 ≤ 1/10 的车队胜出（%）', 'Won by fleets coupling ≤ 1/10 (%)', '결합 ≤ 10% 차량군 승리 (%)'],
  brkEx: ['四种口径，不含重尾', 'four measures, outside heavy tail', '4개 기준, 중량 꼬리 제외'], brkTeam: ['按队计作业，不含重尾', 'crew-team hours, outside heavy tail', '팀별 작업, 중량 꼬리 제외'], brkAll: ['四种口径，全部 36 种工况', 'four measures, all 36 conditions', '4개 기준, 36개 조건 전체'],
  robNom: ['{f}', '{f}', '{f}'], robHi: ['名义最省车队', 'nominal cheapest fleet', '명목 최저비용 차량군'],
  robOther: ['其他车队', 'other fleets', '기타 차량군'], rob95: ['95% 目标', '95% target', '95% 목표'],
  budEq: ['h* = κ ÷ (1 + 2δ / w̄) = κ ÷ {f}；δ = {d} min，w̄ = {w} min（覆盖车队每块的平均占用：短装卸约 43，随重量装卸 63–85，长装载约 80）；价格按 α = 0.84 幂律，班次人工', 'h* = κ ÷ (1 + 2δ / w̄) = κ ÷ {f}; δ = {d} min, w̄ = {w} min (covering fleet’s mean occupancy per block: about 43 with short, 63–85 with mass-dependent handling, about 80 with long loading); α = 0.84 power law, shift labour', 'h* = κ ÷ (1 + 2δ / w̄) = κ ÷ {f}, δ = {d}분, w̄ = {w}분 (커버 차량군의 블록당 평균 점유: 짧은 적재·하역 약 43, 중량 비례 63–85, 긴 적재 약 80), 가격 α = 0.84 거듭제곱, 교대 인건비'],
  budK: ['κ：大车每天比小车贵多少', 'κ: how much dearer the larger unit is per day', 'κ: 큰 차가 하루에 얼마나 더 비싼가'],
  budH: ['h*：小车最多能拼载的工作量比例', 'h*: the largest coupled share of workload the light tier can afford', 'h*: 경형이 감당할 수 있는 최대 결합 작업 비율'],
  v1Exact: ['精确求解部分（CP-SAT）；启发式部分已完成', 'exact solver (CP-SAT); heuristic part done', '정확해 (CP-SAT), 휴리스틱 부분 완료'],
  e5NoW: ['；{n} 个无达标车队', '; no fleet qualifies in {n}', '; {n}개는 충족 차량군 없음'],
  e5Chg: ['最省车队改变', 'cheapest fleet changed', '최저비용 차량군 변경'], e5None: ['没有车队达标', 'no fleet qualifies', '충족 차량군 없음'], e5Hi: ['拼载 > 1/10', 'couples > one in ten', '결합 > 10%'],
  e7Num: ['个决策中最省车队拼载 ≤ 1/10；例外是 φ = 35%、随重量装卸、按队计运营人工下的 2 重车混编（19.6%）', 'decisions where the cheapest fleet couples at most one block in ten; the exceptions are the two-heavy mix at φ = 35% with mass-dependent handling under per-team crews (19.6%)', '개 결정에서 최저비용 차량군의 결합 ≤ 10%. 예외는 φ = 35%, 중량 비례 적재·하역, 팀별 운영 인원에서의 대형 2대 혼합 (19.6%)'],
  b4Shift: ['个班次人工决策换了最省车队，全在 Jiang 短装卸：一重车混编要多 1 台，被两重车混编取代；沿用原选择最多多花 {g}%', 'shift-labour decisions change their cheapest fleet, all with Jiang masses and short handling: the one-heavy mix needs one more vehicle and the two-heavy mix replaces it; keeping the old choice costs up to {g}% more', '개 교대 인건비 결정에서 최저비용 차량군이 바뀜. 모두 Jiang·짧은 적재·하역: 대형 1대 혼합이 1대 더 필요해 대형 2대 혼합이 대신하며, 기존 선택 유지 시 최대 {g}% 추가'],
  b4All: ['个决策换了最省车队（混编取悲观车速；取乐观车速时为 {o} 个）', 'decisions change their cheapest fleet at the pessimistic end ({o} at the optimistic end)', '개 결정에서 최저비용 차량군이 바뀜 (혼합 비관 속도 기준, 낙관 속도 기준 {o}개)'],
  b4Le10: ['个决策中最省车队仍拼载 ≤ 1/10（悲观端）', 'decisions where the cheapest fleet still couples at most one block in ten (pessimistic end)', '개 결정에서 최저비용 차량군의 결합이 여전히 10% 이하 (비관적 끝)'],
  b4Roh: ['Roh–Cha 重量下 550 t 在全部 {a} 个决策中最省；Liu 重量下 425 t 在 {b} / {n} 个决策中最省（11 种标准车队中）', 'Under Roh–Cha masses 550 t is cheapest in all {a} decisions; under Liu masses 425 t in {b} of {n} (among the eleven standard fleets)', 'Roh–Cha 중량에서 550 t가 {a}개 결정 모두 최저, Liu 중량에서 425 t가 {n}개 중 {b}개 최저 (표준 차량군 11개 중)'],
  b4NotRerun: ['未重跑', 'not rerun', '재실행 안 함'],
  calcTxt: ['最便宜：<b>{f}</b>（{k} 台），每天 {c} 人时；第二名 {f2} 贵 {p}%。人工占最便宜车队成本的 {lp}%。',
            'Cheapest: <b>{f}</b> ({k} vehicles), {c} labour-hours a day; the runner-up, {f2}, costs {p}% more. Labour is {lp}% of the cheapest fleet’s cost.',
            '최저: <b>{f}</b> ({k}대), 하루 {c}인시. 2위 {f2}는 {p}% 더 비싸다. 최저 차량군 비용 중 인건비 비중은 {lp}%.'],
  // manuscript of 2026-10-03: decomposition, exact benchmark, fresh days, outages, matched mixes, budget slider
  decX: ['比覆盖车队多出的车时（车·时/天）', 'Extra transporter-hours per day over the covering tier', '커버 등급 대비 추가 차량 시간 (차량·시/일)'],
  decY: ['其中的车时（车·时/天）', 'Part of the extra hours (h/day)', '그중 차량 시간 (h/일)'],
  decCoup: ['拼载占用：重复搬运加对接', 'Coupled occupancy: repeated service plus alignment', '결합 점유: 반복 운반 + 정렬'],
  decWait: ['等队友', 'Partner waiting', '팀원 대기'], dec11: ['1:1', '1:1', '1:1'],
  decTip: ['{f} · {c}<br>多出 {d} h/天：拼载占用 {o} h，等待 {w} h', '{f} · {c}<br>{d} h/day extra: coupled occupancy {o} h, waiting {w} h', '{f} · {c}<br>추가 {d} h/일: 결합 점유 {o} h, 대기 {w} h'],
  exFinal: ['本文流程', 'Proposed procedure', '제안 절차'], exSingle: ['单次搜索', 'One search run', '단일 탐색'],
  exCp0: ['仅构造', 'Constructions only', '구성만'], exGreedy: ['贪心派工', 'Greedy dispatcher', '탐욕 배차'],
  exEq: ['等于证明的最小台数', 'equals the proven minimum', '증명된 최소 대수와 같음'], exP1: ['多 1 台', 'one too many', '1대 많음'],
  exP2: ['多 2 台以上', 'two or more too many', '2대 이상 많음'], exNone: ['找不到达标台数', 'no qualifying count', '충족 대수 없음'],
  exX: ['有证明最小台数的 56 个车队', 'The 56 fleets with a proven minimum count', '최소 대수가 증명된 차량군 56개'],
  frY: ['与原 30 天选出同一最省车队的决策（%）', 'Decisions with the same least-cost fleet as on the original days (%)', '원래 30일과 같은 최저비용 차량군인 결정 (%)'],
  frAll: ['全部 1,260 个决策', 'all 1,260 decisions', '전체 1,260개 결정'],
  ouX: ['去掉一台车容量后的准时比例（%，30 天）', 'On-time share after removing one unit of capacity (%, 30 days)', '용량 1대를 뺀 뒤 정시 비율 (%, 30일)'],
  ouOne: ['只有 1 台重车的混编（去掉重车容量）', 'mix with one heavy unit (heavy capacity removed)', '대형 1대 혼합 (대형 용량 제거)'], ouCov: ['覆盖吨级的同质车队', 'covering homogeneous fleet', '커버 등급 단일 차량군'],
  ouOther: ['其他车队', 'other fleets', '기타 차량군'], ou95: ['95% 目标', '95% target', '95% 목표'],
  ouTip: ['{f}<br>减少后的组成准时 {v}%<br>若每天以 0.1 的概率换成减少后的组成，满足服务要求的概率 {p}', '{f}<br>on time in the reduced composition: {v}%<br>meets the specification with probability {p} if each day switches to it with probability 0.1', '{f}<br>축소 구성의 정시 {v}%<br>매일 0.1 확률로 축소 구성이 되면 서비스 기준 충족 확률 {p}'],
  mxX: ['每种工况 180 个决策中的占比（%）', 'Share of the 180 decisions per condition (%)', '조건별 결정 180개 중 비율 (%)'],
  mxRule: ['重车台数 = 规则值 K<sub>H</sub>*', 'heavy units = rule value K<sub>H</sub>*', '대형 대수 = 규칙값 K<sub>H</sub>*'],
  mxOff: ['比规则值 {o} 台', 'rule {o}', '규칙값 {o}대'],
  mxTip: ['{c}<br>规则值 K<sub>H</sub>* = {n}<br>{d}', '{c}<br>rule value K<sub>H</sub>* = {n}<br>{d}', '{c}<br>규칙값 K<sub>H</sub>* = {n}<br>{d}'],
  mxCnt: ['{k} 台重车：{v} 个决策', '{k} heavy units: {v} decisions', '대형 {k}대: 결정 {v}개'],
};
const t = k => T[k][LI[Deck.lang]];

// tier colours as in the manuscript figures (paper/figs/make_r25_figures.py)
const COL = { 200: '#f0f0f0', 250: '#d9d9d9', 270: '#c6dbef', 300: '#a9c8e1', 325: '#56b4b8', 380: '#4388b5',
  425: '#183a63', 500: '#91679d', 550: '#cc6d24', MX1: '#b9d7bf', MX2: '#42835a' };
const DARK = new Set(['325', '380', '425', '500', '550', 'MX2']);
const FAMS = ['200', '250', '270', '300', '325', '380', '425', '500', '550', 'MX1', 'MX2'];
const famName = f => f === 'MX1' ? t('mx1') : f === 'MX2' ? t('mx2') : f + ' t';
const cellName = c => { const [m, h, d] = c.split('_'); return `${t(m)} · ${t(h + 'l')} · ${t(d + 'l')}`; };
const cellShort = c => { const [m, h, d] = c.split('_'); return `${t(m)} · ${t(h)} · ${t(d)}`; };

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
  anim(el('path', { d: `M${x(80)} ${y(pQ(80))}L${x(620)} ${y(pQ(620))}`, pathLength: 1, style: 'fill:none;stroke:var(--amber);stroke-width:2.5' }, s), 'a-draw', .8);
  anim(el('line', { x1: x(20), x2: x(48), y1: y(4.6), y2: y(4.6), style: 'stroke:var(--amber);stroke-width:2.5' }, s), 'a-fade', 1);
  anim(el('text', { x: x(56), y: y(4.6) + 4, class: 't-strong' }, s, `${t('pFit')}: p(Q) = 0.575 + 0.00607 Q`), 'a-fade', 1);
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

let heatLab = 'shift_h';
function heatInfo(i, j) {
  const [f, share, hatch, weak] = D.heat[heatLab][i][j];
  // always three short lines in a card of fixed height, so hovering never reflows the slide or rescales the map
  const flags = [hatch ? `▨ ${t('hatchLg')}` : '', weak ? `<span style="color:var(--oxide)">● ${t('weakLg')}</span>` : ''].filter(Boolean).join(' · ');
  $('heatTip').innerHTML = `<p class="small" style="color:var(--ink)"><b>${cellName(D.cells[i])}</b></p>
    <p class="small">θ = ${D.r[j].toFixed(1)} · ${t('winner')}: <b style="color:var(--ink)">${famName(f)}</b> · ${t('coupled')}: <b style="color:var(--ink)">${share}%</b></p>
    <p class="small">${flags || '&nbsp;'}</p>`;
}
function drawHeat() {
  const rows = D.heat[heatLab];
  const L = 172, cw = 44, rh = 12, gap = 4, top = 2;
  const W = L + cw * 9 + 2, H = top + 36 * rh + 5 * gap + 40;
  const s = frame('cHeat', W, H, 'Cheapest fleet by condition and price ratio');
  const used = new Set();
  D.cells.forEach((c, i) => {
    const grp = Math.floor(i / 6), y = top + i * rh + grp * gap;
    const [m, h, d] = c.split('_');
    if (i % 6 === 0) el('text', { x: 0, y: y + 3 * rh + 4, class: 't-strong', style: 'font-size:11px' }, s, t(m));
    el('text', { x: L - 6, y: y + rh - 3, 'text-anchor': 'end', style: 'font-size:9px' }, s, `${t(h)} · ${t(d)}`);
    rows[i].forEach(([f, share, hatch, weak], j) => {
      used.add(f);
      const x = L + j * cw, cell = anim(el('g', { style: 'cursor:default' }, s), 'a-fade', .25 + i * .022);
      el('rect', { x, y, width: cw - 1, height: rh - 1, fill: COL[f] }, cell);
      if (hatch) el('rect', { x, y, width: cw - 1, height: rh - 1, fill: 'url(#hatch)' }, cell);
      el('text', { x: x + cw / 2, y: y + rh - 3, 'text-anchor': 'middle', style: `font-size:8.5px;fill:${DARK.has(f) ? '#fff' : '#1b1b1b'}` }, cell, share);
      if (weak) el('circle', { cx: x + cw - 5, cy: y + 3.2, r: 2, fill: '#e03131' }, cell);
      cell.addEventListener('mouseenter', () => heatInfo(i, j));
    });
  });
  D.r.forEach((r, j) => el('text', { x: L + j * cw + cw / 2, y: H - 24, 'text-anchor': 'middle', style: 'font-size:10px' }, s, r.toFixed(1)));
  el('text', { x: L + cw * 4.5, y: H - 5, 'text-anchor': 'middle', style: 'font-size:10.5px' }, s, t('xr'));
  swatches('heatLegend', FAMS.filter(f => used.has(f)).map(f => [COL[f], famName(f)])
    .concat([['repeating-linear-gradient(45deg,#fff 0 2px,#555 2px 3px)', t('hatchLg')],
             ['#e03131', t('weakLg'), 'border-radius:50%;width:8px;height:8px']]));
  document.querySelectorAll('#heatSeg button').forEach(b => b.setAttribute('aria-pressed', b.dataset.lab === heatLab));
}


function drawCase() {
  const r = +$('rCase').value;
  $('rCaseV').value = r.toFixed(1);
  const W = 640, H = fitH('cCase', 640, 430), top = 50, rh = Math.max(26, Math.min(44, (H - 86) / 11)), bx = 124, bw = 140, dom = 200;
  const s = frame('cCase', W, H, 'Second yard: cost above the cheapest fleet');
  ['6', '8'].forEach((k, p) => {
    const x0 = p * 328, rows = FAMS.map(f => { const [K, cp] = D.case[k][f]; return { f, K, cost: r * cp + 40 * K }; });
    const best = Math.min(...rows.map(o => o.cost));
    el('text', { x: x0, y: 16, class: 't-title' }, s, fmt(t('work'), { k }));
    el('text', { x: x0 + 104, y: 38, 'text-anchor': 'middle', style: 'font-size:11px;fill:var(--ink3)' }, s, 'K*');
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



// minimal-team demo (Eq. teams of the manuscript, homogeneous fleet, kappa = 3)
let tier = 270;
function drawTeam() {
  const mass = +$('massR').value;
  $('massV').value = mass + ' t';
  const n = mass <= tier ? 1 : Math.ceil(mass / tier), ok = n <= 3;
  const W = 460, H = fitH('teamViz', 460, 124, 1, 2.6), s = el('g', { transform: `translate(0 ${(H - 124) / 2})` }, frame('teamViz', W, H, 'Team for the chosen block'));
  const bw = 80 + mass * 0.34;
  const tw = 40 + tier * 0.2, gp = 8, tot = n * tw + (n - 1) * gp;
  const blk = anim(el('g', {}, s), 'a-drop', .45 + n * .14);
  el('rect', { x: (W - bw) / 2, y: 4, width: bw, height: 46, rx: 6, style: 'fill:var(--steel)' }, blk);
  el('text', { x: W / 2, y: 33, 'text-anchor': 'middle', style: 'fill:var(--paper);font:600 18px var(--d-en)' }, blk, mass + ' t');
  for (let i = 0; i < n; i++) {
    const x0 = (W - tot) / 2 + i * (tw + gp), v = anim(el('g', {}, s), 'a-rise', .3 + i * .14);
    el('rect', { x: x0, y: 54, width: tw, height: 14, rx: 2, style: ok ? 'fill:var(--amber-hi)' : 'fill:var(--oxide-soft);stroke:var(--oxide);stroke-dasharray:4 3' }, v);
    for (let w = 8; w < tw; w += 14) el('circle', { cx: x0 + w, cy: 76, r: 5.5, style: `fill:${ok ? 'var(--ink)' : 'var(--ink3)'}` }, v);
    el('text', { x: x0 + tw / 2, y: 100, 'text-anchor': 'middle', style: 'font-family:var(--mono);font-size:12px' }, v, tier + ' t');
    if (i && ok) anim(el('line', { x1: x0 - gp, x2: x0, y1: 58, y2: 58, style: 'stroke:var(--ink);stroke-width:4' }, s), 'a-fade', .3 + n * .14);
  }
  $('teamTxt').innerHTML = n === 1 ? fmt(t('single1'), { Q: tier, m: mass })
    : ok ? fmt(t('couple'), { n, Q: tier, S: n * tier, S2: (n - 1) * tier, m: mass, w: 4 * n })
    : fmt(t('nope'), { n });
  document.querySelectorAll('#tierSeg button').forEach(b => b.setAttribute('aria-pressed', +b.dataset.q === tier));
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

const clock = s => (s / 3600).toFixed(1);
function drawDay() {
  const tk = D.example.tasks, W = 640, H = fitH('cDay', 640, 400), m = { l: 54, r: 44, t: 16, b: 46 };
  const s = frame('cDay', W, H, 'Release and due times of one day');
  const x = lin(0, 18 * 3600, m.l, W - m.r), y = lin(60, 540, H - m.b, m.t);
  const g = el('g', { class: 'grid' }, s);
  for (let v = 100; v <= 500; v += 100) { el('line', { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v) }, g); el('text', { x: m.l - 8, y: y(v) + 4, 'text-anchor': 'end' }, s, v); }
  for (let h = 0; h <= 18; h += 2) el('text', { x: x(h * 3600), y: H - m.b + 18, 'text-anchor': 'middle' }, s, h);
  el('line', { x1: m.l, x2: W - m.r, y1: y(60), y2: y(60), style: 'stroke:var(--ink3)' }, s);
  el('text', { x: (m.l + W - m.r) / 2, y: H - 6, 'text-anchor': 'middle' }, s, t('dX'));
  yTitle(s, 14, (m.t + H - m.b) / 2, t('dY'));
  el('line', { x1: x(16 * 3600), x2: x(16 * 3600), y1: m.t, y2: y(60), style: 'stroke:var(--ink3);stroke-dasharray:5 4' }, s);
  el('text', { x: x(16 * 3600) - 4, y: m.t + 10, 'text-anchor': 'end', style: 'font-size:11px' }, s, t('shiftEnd'));
  el('line', { x1: m.l, x2: W - m.r, y1: y(270), y2: y(270), style: 'stroke:var(--amber);stroke-width:1.5;stroke-dasharray:6 4' }, s);
  el('text', { x: W - m.r + 4, y: y(270) + 4, class: 't-strong', style: 'fill:var(--amber)' }, s, '270 t');
  for (const [ms, r, d] of tk) {
    const heavy = ms > 270, c = heavy ? 'var(--amber-hi)' : 'var(--steel)';
    const at = .25 + 1.1 * r / (16 * 3600);
    const ln = anim(el('line', { x1: x(r), x2: x(d), y1: y(ms), y2: y(ms), style: `stroke:${c};stroke-width:3.2;stroke-linecap:round` }, s), 'a-x', at);
    anim(el('circle', { cx: x(r), cy: y(ms), r: 2.6, style: `fill:${heavy ? 'var(--amber)' : 'var(--steel)'}` }, s), 'a-pop', at);
    hover(ln, () => fmt(t('dayTip'), { m: ms, r: clock(r), d: clock(d) }));
  }
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

function drawMasses() {
  const host = $('massGrid');
  host.innerHTML = '';
  ['M1', 'M2', 'M3', 'M4', 'M5', 'M6'].forEach((k, mi) => {
    const mm = D.masses[k], div = document.createElement('div');
    div.className = 'm';
    div.innerHTML = `<h4>${t(k)} · <span class="mono" style="font-weight:400;color:var(--ink3)">${mm.lo}–${mm.hi} t</span></h4><p>${t(k + 'd')}</p>`;
    host.appendChild(div);
    const W = 240, H = 104, b = { l: 4, r: 4, t: 18, b: 18 }, bw = (W - b.l - b.r) / mm.hist.length, mx = Math.max(...mm.hist);
    const box = document.createElement('div');
    box.className = 'fill';
    div.appendChild(box);
    const s = el('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Mass histogram' }, box);
    mm.hist.forEach((n, i) => {
      if (!n) return;
      const h = (H - b.t - b.b) * n / mx;
      anim(el('rect', { x: b.l + i * bw + .5, y: H - b.b - h, width: bw - 1, height: h, style: `fill:${i * 50 >= 270 ? 'var(--amber-hi)' : 'var(--steel)'}` }, s), 'a-y', .3 + mi * .08 + i * .012);
    });
    el('line', { x1: b.l, x2: W - b.r, y1: H - b.b, y2: H - b.b, style: 'stroke:var(--ink3)' }, s);
    const x270 = b.l + 270 / 50 * bw;
    anim(el('line', { x1: x270, x2: x270, y1: 4, y2: H - b.b, style: 'stroke:var(--oxide);stroke-dasharray:4 3;stroke-width:1.2' }, s), 'a-fade', 1.1 + mi * .08);
    anim(el('text', { x: x270 + 4, y: 13, style: 'font-size:11px;fill:var(--oxide);font-weight:600' }, s, fmt(t('above270'), { p: Math.round(mm.above['270']) })), 'a-fade', 1.1 + mi * .08);
    for (const v of [0, 400, 800]) el('text', { x: b.l + v / 50 * bw, y: H - 4, 'text-anchor': v ? (v === 800 ? 'end' : 'middle') : 'start', style: 'font-size:10px;fill:var(--ink3)' }, s, v + (v === 800 ? ' t' : ''));
  });
}

// cost calculator: C = r * P + L for every fleet of the chosen condition at its K*
let calcLabI = 3;
function fillCalcSelects() {
  const opts = (id, keys, lab) => {
    const sel = $(id), v = sel.value;
    sel.innerHTML = keys.map(k => `<option value="${k}">${t(lab(k))}</option>`).join('');
    sel.value = v || keys[0];
  };
  if (!$('calcM').value) { $('calcM').innerHTML = '<option value="M3">M3</option>'; $('calcH').innerHTML = '<option value="H1">H1</option>'; $('calcD').innerHTML = '<option value="D-emp">D-emp</option>'; }
  opts('calcM', ['M1', 'M2', 'M3', 'M4', 'M5', 'M6'], k => k);
  opts('calcH', ['H1', 'H2', 'H3'], k => k + 'l');
  opts('calcD', ['D-emp', 'D-tight'], k => k + 'l');
}
function drawCalc() {
  const r = +$('rCalc').value;
  $('rCalcV').value = r.toFixed(1);
  const cell = `${$('calcM').value}_${$('calcH').value}_${$('calcD').value}`;
  const items = D.calc[cell].map(([f, K, P, Ls, Lt, Lv, cp, hq]) => {
    const L = [0, 0, 0, Ls, Lt, Lv][calcLabI];
    return { f, K, P, L, cap: r * P, cost: r * P + L, cp, hq };
  }).sort((a, b) => a.cost - b.cost);
  const best = items[0].cost, max = Math.max(...items.map(o => o.cost));
  const W = 1100, top = 26, H0 = top + items.length * 33 + 8, rowH = Math.max(26, Math.min(46, (fitH('calcChart', W, H0, 0.8, 1.6) - top - 8) / items.length)), H = top + items.length * rowH + 8;
  const s = frame('calcChart', W, H, 'Daily cost of every fleet');
  const cols = { name: 6, comp: 170, k: 410, bar: 450, barW: 370, tot: 885, pct: 950, cp: 1094 };
  const hdr = (x, txt, anchor) => el('text', { x, y: 16, 'text-anchor': anchor || 'start', style: 'font-size:12px;fill:var(--ink3);font-weight:600' }, s, txt);
  hdr(cols.name, t('fleetH')); hdr(cols.comp, t('compH')); hdr(cols.k, 'K*', 'middle'); hdr(cols.bar, t('costH'));
  hdr(cols.pct, t('aboveH')); hdr(cols.cp, t('coupH'), 'end');
  items.forEach((o, i) => {
    const y = top + i * rowH, win = i === 0;
    if (win) el('rect', { x: 0, y: y + 1, width: W, height: rowH - 2, rx: 4, style: 'fill:var(--amber-soft)' }, s);
    el('rect', { x: cols.name, y: y + rowH / 2 - 6, width: 12, height: 12, rx: 2, fill: COL[o.f], style: 'stroke:var(--ink3);stroke-width:.6' }, s);
    el('text', { x: cols.name + 18, y: y + rowH / 2 + 5, class: win ? 't-strong' : '', style: 'font-size:14px' }, s, famName(o.f));
    const comp = o.f === 'MX1' ? `1 × ${o.hq} t + ${o.K - 1} × 270 t` : o.f === 'MX2' ? `2 × ${o.hq} t + ${o.K - 2} × 270 t` : `${o.K} × ${o.f} t`;
    el('text', { x: cols.comp, y: y + rowH / 2 + 5, style: 'font-size:13px;font-family:var(--mono)' }, s, comp);
    el('text', { x: cols.k, y: y + rowH / 2 + 5, 'text-anchor': 'middle', class: 't-strong', style: 'font-size:14px;font-family:var(--mono)' }, s, o.K);
    const wc = cols.barW * o.cap / max, wl = cols.barW * o.L / max;
    anim(el('rect', { x: cols.bar, y: y + rowH * 0.24, width: wc, height: rowH * 0.52, style: 'fill:var(--steel)' }, s), 'a-x', .3 + i * .05);
    anim(el('rect', { x: cols.bar + wc, y: y + rowH * 0.24, width: wl, height: rowH * 0.52, style: 'fill:var(--amber-hi)' }, s), 'a-x', .65 + i * .05);
    el('text', { x: cols.tot, y: y + rowH / 2 + 5, 'text-anchor': 'end', class: win ? 't-strong' : '', style: 'font-size:13px;font-family:var(--mono)' }, s, o.cost.toFixed(0));
    el('text', { x: cols.pct, y: y + rowH / 2 + 5, style: `font-size:13px;font-family:var(--mono);fill:${win ? 'var(--good)' : 'var(--ink2)'}` }, s, win ? '★' : '+' + (100 * (o.cost / best - 1)).toFixed(1) + '%');
    el('text', { x: cols.cp, y: y + rowH / 2 + 5, 'text-anchor': 'end', style: 'font-size:13px;font-family:var(--mono)' }, s, o.cp.toFixed(0) + '%');
  });
  const [a, b] = items;
  $('calcTxt').innerHTML = fmt(t('calcTxt'), { f: famName(a.f), k: a.K, c: a.cost.toFixed(0), f2: famName(b.f), p: (100 * (b.cost / a.cost - 1)).toFixed(1), lp: (100 * a.L / a.cost).toFixed(0) }) +
    `<span class="legend" style="display:inline-flex;margin-left:14px;vertical-align:middle"><span><i style="background:var(--steel)"></i>${t('capLg')}</span><span><i style="background:var(--amber-hi)"></i>${t('labLg')}</span></span>`;
  document.querySelectorAll('#calcLab button').forEach(x => x.setAttribute('aria-pressed', +x.dataset.i === calcLabI));
}

function drawBoot() {
  let z = 7;
  const rnd = () => (z = (z * 48271) % 2147483647) / 2147483647;
  const draw = Array.from({ length: 30 }, () => 1 + Math.floor(rnd() * 30)).sort((a, b) => a - b);
  const cnt = {};
  draw.forEach(d => { cnt[d] = (cnt[d] || 0) + 1; });
  $('bootA').innerHTML = Array.from({ length: 30 }, (_, i) => `<i>${i + 1}</i>`).join('');
  $('bootB').innerHTML = draw.map((d, k) => `<i class="a-pop${cnt[d] > 1 ? ' dup' : ''}" style="--d:${(.4 + k * .03).toFixed(2)}s">${d}</i>`).join('');
}

// Liu mixes at manufacturer speeds (B4, conservative for the mixes)
const liuName = (f, K, hv) => {
  const m = /^L(\d+)_H(\d+)x(\d)$/.exec(f), caps = [];
  const add = (q, n) => { for (let k = 0; k < n; k++) caps.push(q); };
  if (m) { add(m[2], +m[3]); add(m[1], K - m[3]); }
  else if (f === 'MX1' || f === 'MX2') { const h = +f[2]; add(hv, h); add(270, K - h); }
  else add(f, K);
  return fleetStr(caps.join(' '));
};

// price of overweight-only coupling (R4R), affine curve, shift staffing
function porColour(v) {
  if (v > 1e-9) {
    const k = Math.min(1, v / D.late.por_all.max), a = [247, 220, 207], b = [168, 54, 31];
    return `rgb(${a.map((x, i) => Math.round(x + (b[i] - x) * Math.sqrt(k))).join(',')})`;
  }
  return v < -1e-9 ? '#cfe1f0' : '#e6ebf0';
}

// manufacturer speeds (B4): K* at common speeds -> K* at manufacturer speeds, and the decisions
function renderB4() {
  const fams = ['380', '425', '500', '550', 'MX1', 'MX2'], byCell = {};
  D.late.b4k.forEach(([c, f, a, b, flag]) => { (byCell[c] = byCell[c] || {})[f] = [a, b, flag]; });
  $('b4Table').innerHTML = `<thead><tr><th style="text-transform:none;white-space:normal;max-width:150px">${t('b4Cell')}</th>${fams.map(f => `<th style="text-transform:none">${famName(f)}</th>`).join('')}</tr></thead><tbody>` +
    Object.keys(byCell).map(c => `<tr><td style="font-family:var(--body);font-weight:400;white-space:nowrap">${t(c.split('_')[0])} · ${t(c.split('_')[1])}</td>` + fams.map(f => {
      const v = byCell[c][f];
      if (!v) return '<td class="mono" style="color:var(--ink3)">—</td>';
      if (v[2] === 'bound') return `<td class="mono" style="color:var(--ink3)" title="${t('b4NotRerun')}">${v[0]}*</td>`;
      return `<td class="mono" style="white-space:nowrap;${v[1] !== v[0] ? 'background:var(--amber-soft);color:var(--ink);font-weight:600' : ''}">${v[0]} → ${v[1]}</td>`;
    }).join('') + '</tr>').join('') + '</tbody>';
  const d = D.late.b4dec, n = v => v.toLocaleString('en-US');
  $('b4Shift').innerHTML = `${d.changed_shift} / ${d.n_shift}<small>${fmt(t('b4Shift'), { g: d.regret })}</small>`;
  $('b4All').innerHTML = `${d.changed} / ${n(d.n)}<small>${fmt(t('b4All'), { o: d.changed_opt })}</small>`;
  $('b4Le10').innerHTML = `${n(d.le10)} / ${n(d.n)}<small>${t('b4Le10')}</small>`;
  $('b4Roh').textContent = fmt(t('b4Roh'), { a: d.roh_550, b: d.liu_425, n: d.liu_n });
}

// "270 270 270 270 500" -> "1 × 500 t + 4 × 270 t"
function fleetStr(sp) {
  const n = {};
  sp.split(' ').forEach(q => { n[q] = (n[q] || 0) + 1; });
  return Object.keys(n).sort((a, b) => b - a).map(q => `${n[q]} × ${q} t`).join(' + ');
}
const SC = { 'M1_H1_D-emp': 'M1', 'M3_H1_D-emp': 'M3', 'M6_H1_D-emp': 'M6' };
const SC_COL = { M1: 'var(--steel)', M3: 'var(--oxide)', M6: 'var(--good)' };
const capName = lev => lev === 'inf' ? t('noCap') : lev + ' min';

// Finding 2a: fleets that qualify with one vehicle fewer without a cap (R3), one bar per distinct fleet
function drawLate() {
  const seen = new Set(), rows = [];
  D.late.late_blocks.forEach(([c, f, k, k1, cp, mx, n4, n4c]) => {
    const name = liuName(f, k, c.startsWith('M6') ? 425 : 500), key = c + name;
    if (!seen.has(key)) { seen.add(key); rows.push({ c, name, k, k1, cp, mx, n4 }); }
  });
  const W = 640, top = 8, bot = 44, H = fitH('cLate', W, top + rows.length * 56 + bot, 0.8, 1.6), rh = (H - top - bot) / rows.length;
  const s = frame('cLate', W, H, 'Largest delay of fleets that qualify only without a cap');
  const L = 250, x = lin(0, 20, L, W - 40);
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

// Finding 2b: coupled share and cost of the cheapest fleet against the delay cap (R3, shift staffing)
function drawTmax() {
  const R = D.late.r3, levs = ['inf', '480', '240', '120', '60', '30'], keys = Object.keys(R);
  const W = 620, H = fitH('cTmax', W, 440, 0.8, 1.5), m = { l: 52, r: 14 }, gapP = 46, top = 12, bot = 40;
  const ph = (H - top - bot - gapP) / 2;
  const s = frame('cTmax', W, H, 'Coupling and cost of the cheapest fleet against the delay cap');
  const band = (W - m.l - m.r) / levs.length, xc = i => m.l + band * (i + 0.5);
  const panel = (y0, d0, d1, ticks, title) => {
    const y = lin(d0, d1, y0 + ph, y0), g = el('g', { class: 'grid' }, s);
    ticks.forEach(v => { el('line', { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v) }, g); el('text', { x: m.l - 8, y: y(v) + 4, 'text-anchor': 'end' }, s, v); });
    el('text', { x: m.l, y: y0 - 4, class: 't-strong', style: 'font-size:12px' }, s, title);
    return y;
  };
  const ya = panel(top + 10, 0, 14, [0, 5, 10], t('tmaxA'));
  el('line', { x1: m.l, x2: W - m.r, y1: ya(10), y2: ya(10), style: 'stroke:var(--ink3);stroke-dasharray:4 3' }, s);
  el('text', { x: W - m.r, y: ya(10) - 4, 'text-anchor': 'end', style: 'font-size:10.5px;fill:var(--ink3)' }, s, t('oneTen'));
  const yb = panel(top + 10 + ph + gapP, -0.5, 5, [0, 1, 2, 3, 4, 5], t('tmaxB'));
  keys.forEach((c, k) => {
    const col = SC_COL[SC[c]], off = (k - 1) * 9;
    anim(el('path', { d: R[c].map((r, i) => `${i ? 'L' : 'M'}${xc(i) + off} ${ya(r[4])}`).join(''), pathLength: 1, style: `fill:none;stroke:${col};stroke-width:2` }, s), 'a-draw', .3 + k * .15);
    R[c].forEach((r, i) => {
      const tipf = () => fmt(t('tmaxTip'), { sc: t(SC[c]), lev: capName(r[0]), fleet: fleetStr(r[3]), c: r[4], md: r[5], lo: r[6], hi: r[7] });
      const at = .3 + k * .15 + i * .18;
      hover(anim(el('circle', { cx: xc(i) + off, cy: ya(r[4]), r: 5, style: `fill:${col};stroke:var(--paper);stroke-width:1.5` }, s), 'a-pop', at), tipf);
      anim(el('line', { x1: xc(i) + off, x2: xc(i) + off, y1: yb(r[6]), y2: yb(r[7]), style: `stroke:${col};stroke-width:2` }, s), 'a-fade', at);
      hover(anim(el('rect', { x: xc(i) + off - 4.5, y: yb(r[5]) - 4.5, width: 9, height: 9, style: `fill:${col};stroke:var(--paper);stroke-width:1.5` }, s), 'a-pop', at), tipf);
    });
  });
  levs.forEach((lev, i) => el('text', { x: xc(i), y: H - bot + 18, 'text-anchor': 'middle' }, s, capName(lev)));
  el('text', { x: (m.l + W - m.r) / 2, y: H - 4, 'text-anchor': 'middle' }, s, t('tmaxX'));
  swatches('tmaxLegend', keys.map(c => [SC_COL[SC[c]], t(SC[c])]));
  const row = c => { const a = R[c][0], b = R[c][3]; return `<tr><td style="font-family:var(--body);font-weight:600">${t(SC[c])}</td><td>${fleetStr(a[3])}<div class="tiny">${a[4]}%</div></td><td>${fleetStr(b[3])}<div class="tiny">${b[4]}%</div></td><td class="mono" style="white-space:nowrap">${b[7] > 0 ? '+' + b[6].toFixed(1) + '–' + b[7].toFixed(1) + '%' : '0'}</td></tr>`; };
  $('tmaxTable').innerHTML = `<thead><tr><th style="text-transform:none">${t('thSc')}</th><th style="text-transform:none">${t('thNo')}</th><th style="text-transform:none">${t('thCap')}</th><th style="text-transform:none">${t('thCost')}</th></tr></thead><tbody>${keys.map(row).join('')}</tbody>`;
}

// heavy-block share (E7): cheapest fleet by p, short and mass-dependent handling
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

// sensitivity (E5): one assumed parameter changed at a time; shift staffing, 4 conditions x 45 price settings per level
const E5F = {
  'coupling time (min)': [['对接时间', 'Coupling time', '결합 시간'], v => '10 → ' + v + ' min'],
  'handling factor': [['装卸时间', 'Handling time', '적재·하역 시간'], v => '× ' + v],
  'speed factor': [['车速', 'Speed', '속도'], v => v.startsWith('Liu') ? 'Liu 50/30 m/min' : '× ' + v],
  'largest team': [['最大编组', 'Largest team', '최대 편성'], v => '3 → ' + v],
  'turn time (s)': [['转弯耗时', 'Turn time', '회전 시간'], v => '0 → ' + v + ' s'],
  'coupled-turn time (s)': [['编组转弯另加', 'Coupled turns', '결합 회전 추가'], v => '0 → ' + v + ' s'],
};
function drawE5() {
  const groups = [];
  D.late.e5.forEach(r => { const g = groups.find(g => g[0] === r[0]); g ? g[1].push(r) : groups.push([r[0], [r]]); });
  groups.forEach(g => { if (g[0] === 'speed factor') g[1].sort((a, b) => (b[1].startsWith('Liu') ? -1 : +b[1]) - (a[1].startsWith('Liu') ? -1 : +a[1])); });
  const n = D.late.e5.length, W = 660, top = 24, bot = 44, gap = 10, L = 262, R = 540, xm = 606;
  const H = fitH('cE5', W, top + n * 24 + gap * (groups.length - 1) + bot, 0.85, 1.35), rh = (H - top - bot - gap * (groups.length - 1)) / n;
  const s = frame('cE5', W, H, 'Settings whose cheapest fleet changed when one assumed parameter changed');
  const x = lin(0, 180, L, R), gr = el('g', { class: 'grid' }, s);
  for (const v of [0, 45, 90, 135, 180]) { el('line', { x1: x(v), x2: x(v), y1: top - 4, y2: H - bot + 4 }, gr); el('text', { x: x(v), y: H - bot + 20, 'text-anchor': 'middle' }, s, v); }
  el('text', { x: (L + R) / 2, y: H - 6, 'text-anchor': 'middle' }, s, t('e5Ax'));
  el('text', { x: xm, y: top - 8, 'text-anchor': 'middle', style: 'font-size:11px;fill:var(--ink3)' }, s, t('e5Max'));
  let y = top;
  groups.forEach(([f, rows], gi) => {
    if (gi) { el('line', { x1: 0, x2: W, y1: y + gap / 2, y2: y + gap / 2, style: 'stroke:var(--line)' }, s); y += gap; }
    const name = E5F[f][0][LI[Deck.lang]];
    el('text', { x: 0, y: y + rh / 2 + 5, class: 't-strong', style: 'font-size:13px' }, s, name);
    rows.forEach(([, v, chg, mx, has, le, tot], j) => {
      const yc = y + rh / 2, nw = (tot - has) / 4, at = .3 + gi * .12 + j * .06, hi = mx > 10;   // a level without a cheapest fleet lacks it under every labour measure
      const g = el('g', {}, s);
      if (hi) el('rect', { x: L - 120, y: y + 1, width: W - L + 120, height: rh - 2, rx: 4, style: 'fill:var(--oxide-soft)' }, g);
      el('text', { x: L - 10, y: yc + 4, 'text-anchor': 'end', style: 'font-family:var(--mono);font-size:12px;fill:var(--ink2)' }, g, E5F[f][1](v));
      if (chg) anim(el('rect', { x: L, y: yc - rh * 0.3, width: x(chg) - L, height: rh * 0.6, rx: 2, style: 'fill:var(--amber-hi)' }, g), 'a-x', at);
      if (nw) anim(el('rect', { x: x(chg), y: yc - rh * 0.3, width: x(chg + nw) - x(chg), height: rh * 0.6, style: 'fill:var(--g-empty)' }, g), 'a-x', at + .1);
      const lab = anim(el('text', { x: x(chg + nw) + 6, y: yc + 4, class: chg ? 't-strong' : '', style: 'font-size:12px' + (chg ? '' : ';fill:var(--ink3)') }, g, String(chg)), 'a-fade', at + .3);
      if (nw) el('tspan', { style: 'font-weight:400;fill:var(--ink3)' }, lab, ` (+${nw})`);
      anim(el('text', { x: xm, y: yc + 4, 'text-anchor': 'middle', style: `font-family:var(--mono);font-size:12px;${hi ? 'font-weight:700;fill:var(--oxide)' : 'fill:var(--ink2)'}` }, g, mx.toFixed(1) + '%'), 'a-fade', at + .3);
      el('rect', { x: 0, y, width: W, height: rh, style: 'fill:transparent' }, g);
      hover(g, () => fmt(t('e5Tip'), { f: name, v: E5F[f][1](v), n: chg, nw: nw ? fmt(t('e5NoW'), { n: nw }) : '', c: mx.toFixed(1), le, has }));
      y += rh;
    });
  });
  swatches('e5Legend', [['var(--amber-hi)', t('e5Chg')], ['var(--g-empty)', t('e5None')], ['var(--oxide-soft)', t('e5Hi')]]);
}

// ---------- OE manuscript figures (data: D.oe, from make_data.py with the definitions of paper/oe/scripts) ----------
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
        () => `${t(m)} · ${t(h + 'l')}<br>${q} t: K* = ${v}`));
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

// Fig. 5b: transporters beyond the input-only workload rule, by coupled share and due dates (means with 95% intervals)
function drawSlack() {
  const S = D.oe.slack, W = 520, H = fitH('cSlack', W, 320), m = { l: 46, r: 10, t: 14, b: 46 };
  const s = frame('cSlack', W, H, 'Transporters beyond the workload rule');
  const y = lin(-11, 14, H - m.b, m.t), band = (W - m.l - m.r) / 5, g = el('g', { class: 'grid' }, s);
  for (const v of [-10, -5, 0, 5, 10]) { el('line', { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v), style: v ? '' : 'stroke:var(--ink3)' }, g); el('text', { x: m.l - 6, y: y(v) + 4, 'text-anchor': 'end' }, s, v); }
  ['D-emp', 'D-tight'].forEach((due, k) => S[due].forEach(([lab, mean, ci, n], i) => {
    const bw = band * 0.34, x0 = m.l + i * band + band * 0.14 + k * bw, cx = x0 + bw / 2, col = k ? 'var(--steel)' : 'var(--g-empty)';
    const bar = anim(el('rect', { x: x0, y: Math.min(y(mean), y(0)), width: bw * 0.92, height: Math.abs(y(mean) - y(0)), style: `fill:${col}` }, s), mean >= 0 ? 'a-y' : 'a-fade', .3 + i * .1 + k * .05);
    anim(el('path', { d: `M${cx} ${y(mean - ci)}V${y(mean + ci)}M${cx - 3} ${y(mean - ci)}h6M${cx - 3} ${y(mean + ci)}h6`, style: 'stroke:var(--ink2);stroke-width:1;fill:none' }, s), 'a-fade', .7 + i * .1);
    hover(bar, () => `${t(due + 'l')} · ${lab}%<br>${mean >= 0 ? '+' : ''}${mean.toFixed(1)}% (± ${ci.toFixed(1)}) · n = ${n}`);
    if (!k) el('text', { x: m.l + i * band + band / 2, y: H - m.b + 18, 'text-anchor': 'middle' }, s, lab);
  }));
  el('text', { x: (m.l + W - m.r) / 2, y: H - 6, 'text-anchor': 'middle' }, s, t('occX'));
  yTitle(s, 12, (m.t + H - m.b) / 2, t('slackY'));
  swatches('slackLegend', [['var(--g-empty)', t('D-empl')], ['var(--steel)', t('D-tightl')]]);
}

// Fig. 7: share of settings won by a fleet that couples at most 10%, as r runs far beyond its calibrated range
function drawBrk() {
  const B = D.oe.brk, W = 620, H = fitH('cBrk', W, 340), m = { l: 50, r: 14, t: 12, b: 46 }, lg = Math.log10;
  const s = frame('cBrk', W, H, 'Single-carry share against the capital-to-labour ratio');
  const x = v => lin(lg(0.5), lg(5000), m.l, W - m.r)(lg(v)), y = lin(0, 102, H - m.b, m.t), g = el('g', { class: 'grid' }, s);
  el('rect', { x: x(5.1), y: m.t, width: x(30) - x(5.1), height: H - m.b - m.t, style: 'fill:var(--steel-soft)' }, s);
  el('text', { x: (x(5.1) + x(30)) / 2, y: y(6), 'text-anchor': 'middle', style: 'font-size:11px;fill:var(--steel)' }, s, t('brkCal'));
  for (let v = 0; v <= 100; v += 20) { el('line', { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v) }, g); el('text', { x: m.l - 8, y: y(v) + 4, 'text-anchor': 'end' }, s, v); }
  for (const v of [1, 10, 100, 1000]) { el('line', { x1: x(v), x2: x(v), y1: m.t, y2: H - m.b }, g); el('text', { x: x(v), y: H - m.b + 18, 'text-anchor': 'middle' }, s, v.toLocaleString('en-US')); }
  el('line', { x1: x(64), x2: x(64), y1: m.t, y2: H - m.b, style: 'stroke:var(--ink2);stroke-dasharray:4 3' }, s);
  el('text', { x: x(64) + 5, y: y(14), style: 'font-size:11px;fill:var(--ink2)' }, s, t('brkCrew'));
  [['all', 'var(--ink3)', 1.8, ''], ['ex', 'var(--steel)', 2.6, ''], ['team', 'var(--oxide)', 2, ';stroke-dasharray:6 4']].forEach(([k, col, w, dash], j) =>
    anim(el('path', { d: B.r.map((r, i) => `${i ? 'L' : 'M'}${x(r).toFixed(1)} ${y(B[k][i]).toFixed(1)}`).join(''), pathLength: dash ? null : 1, style: `fill:none;stroke:${col};stroke-width:${w}${dash}` }, s), dash ? 'a-fade' : 'a-draw', .3 + j * .25));
  el('text', { x: (m.l + W - m.r) / 2, y: H - 6, 'text-anchor': 'middle' }, s, t('brkX'));
  yTitle(s, 12, (m.t + H - m.b) / 2, t('brkY'));
  swatches('brkLegend', [['var(--steel)', t('brkEx')], ['var(--oxide)', t('brkTeam')], ['var(--ink3)', t('brkAll')]]);
}

// Fig. 8: on-time share under +-50% handling noise as transporters are added to K* (one line per fleet type)
function drawRobust() {
  const W = 660, H = fitH('cRob', W, 400, 0.85, 1.3), pw = W / 3, ph = H / 2;
  const s = frame('cRob', W, H, 'On-time share under handling noise');
  D.oe.robust.forEach(({ cell, nominal, lines }, k) => {
    const x0 = (k % 3) * pw, y0 = Math.floor(k / 3) * ph, L = x0 + 30, R = x0 + pw - 14, T0 = y0 + 24, Bm = y0 + ph - 28;
    const x = lin(0, 3, L, R), y = lin(78, 100, Bm, T0), g = el('g', { class: 'grid' }, s), [m, h] = cell.split('_');
    for (const v of [80, 90, 100]) { el('line', { x1: L, x2: R, y1: y(v), y2: y(v) }, g); el('text', { x: L - 6, y: y(v) + 4, 'text-anchor': 'end', style: 'font-size:11px' }, s, v); }
    ['K*', '+1', '+2', '+3'].forEach((lab, i) => el('text', { x: x(i), y: Bm + 16, 'text-anchor': 'middle', style: 'font-size:11px' }, s, lab));
    el('line', { x1: L, x2: R, y1: y(95), y2: y(95), style: 'stroke:var(--oxide);stroke-dasharray:4 3' }, s);
    const pt_ = el('text', { x: x0 + 4, y: y0 + 13, class: 't-strong', style: 'font-size:12.5px' }, s, `${t(m)} · ${t(h + 'l')}`);
    if (pt_.getComputedTextLength() > pw - 14) pt_.textContent = `${t(m)} · ${t(h)}`;
    lines.slice().sort((p, q) => (p[0] === nominal) - (q[0] === nominal)).forEach(([f, ys, K, Kr], j) => {
      const hi = f === nominal, pts = ys.map((v, i) => [i, v]).filter(p => p[1] != null);
      const path = anim(el('path', { d: pts.map(([i, v], n) => `${n ? 'L' : 'M'}${x(i)} ${y(Math.max(78, v))}`).join(''), pathLength: 1,
        style: `fill:none;stroke:${hi ? 'var(--steel)' : 'var(--g-empty)'};stroke-width:${hi ? 2.6 : 1.3}` }, s), 'a-draw', .3 + k * .08 + (hi ? .4 : 0));
      hover(path, () => `${famName(f)} · ${t(m)} · ${t(h + 'l')}<br>K* = ${K} · K<sub>rob</sub> = ${Kr}<br>${pts.map(([i, v]) => (i ? 'K*+' + i : 'K*') + ': ' + v.toFixed(1) + '%').join(' · ')}`);
      if (hi) pts.forEach(([i, v]) => anim(el('circle', { cx: x(i), cy: y(Math.max(78, v)), r: 3.4, style: 'fill:var(--steel);stroke:var(--paper);stroke-width:1' }, s), 'a-pop', .8 + k * .08));
    });
    el('text', { x: R, y: Bm - 6, 'text-anchor': 'end', style: 'font-size:10.5px;fill:var(--steel)' }, s, fmt(t('robNom'), { f: famName(nominal) }));
  });
  swatches('robLegend', [['var(--steel)', t('robHi')], ['var(--g-empty)', t('robOther')], ['var(--oxide)', t('rob95')]]);
}

// Section 4: coupling budget h* = kappa / (1 + 2 delta / w), with prices on the alpha = 0.84 power law and shift labour
function drawBud() {
  const r = +$('rBud').value, dl = +$('dBud').value, w = +$('wBud').value, f = 1 + 2 * dl / w;
  $('rBudV').value = r.toFixed(1); $('dBudV').value = dl.toFixed(1); $('wBudV').value = w.toFixed(0);
  const c = q => r * Math.pow(q / 270, 0.84) + 64;
  const W = 560, H = fitH('cBud', W, 230, 0.8, 1.4), L = 150, R = W - 70, x = lin(0, 25, L, R);
  const s = frame('cBud', W, H, 'Coupling budget');
  const g = el('g', { class: 'grid' }, s);
  for (const v of [0, 5, 10, 15, 20, 25]) { el('line', { x1: x(v), x2: x(v), y1: 14, y2: H - 30 }, g); el('text', { x: x(v), y: H - 12, 'text-anchor': 'middle', style: 'font-size:11px' }, s, v + '%'); }
  [[425, 270], [550, 300]].forEach(([hi, lo], i) => {
    const k = 100 * (c(hi) / c(lo) - 1), h = k / f, y0 = 22 + i * (H - 52) / 2, bh = (H - 52) / 2 - 16;
    el('text', { x: 0, y: y0 + bh * 0.42, class: 't-strong', style: 'font-size:13px' }, s, `${hi} t vs ${lo} t`);
    el('text', { x: 0, y: y0 + bh * 0.42 + 17, style: 'font-size:11.5px' }, s, `κ = ${k.toFixed(1)}%`);
    el('rect', { x: L, y: y0, width: x(Math.min(k, 25)) - L, height: bh * 0.4, rx: 2, style: 'fill:var(--g-empty)' }, s);
    el('rect', { x: L, y: y0 + bh * 0.5, width: x(Math.min(h, 25)) - L, height: bh * 0.5, rx: 2, style: 'fill:var(--steel)' }, s);
    el('text', { x: x(Math.min(h, 25)) + 6, y: y0 + bh * 0.78 + 4, class: 't-strong', style: 'fill:var(--steel)' }, s, `h* = ${h.toFixed(1)}%`);
  });
  $('budEq').innerHTML = fmt(t('budEq'), { f: f.toFixed(2), d: dl.toFixed(1), w: w.toFixed(0) });
  swatches('budLegend', [['var(--g-empty)', t('budK')], ['var(--steel)', t('budH')]]);
}

// Fig. 5b: each lighter fleet's extra transporter-hours over the covering tier, split into coupled occupancy and waiting
function drawDecomp() {
  const P = D.oe.decomp, W = 600, H = fitH('cDecomp', W, 380), m = { l: 52, r: 14, t: 12, b: 46 };
  const s = frame('cDecomp', W, H, 'Coupled occupancy and waiting against extra transporter-hours');
  const top = 50 * Math.ceil(Math.max(...P.map(p => p[2])) / 50), x = lin(0, top, m.l, W - m.r), y = lin(0, top, H - m.b, m.t), g = el('g', { class: 'grid' }, s);
  for (let v = 0; v <= top; v += 50) {
    el('line', { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v) }, g); el('text', { x: m.l - 8, y: y(v) + 4, 'text-anchor': 'end' }, s, v);
    el('line', { x1: x(v), x2: x(v), y1: m.t, y2: H - m.b }, g); el('text', { x: x(v), y: H - m.b + 18, 'text-anchor': 'middle' }, s, v);
  }
  el('line', { x1: x(0), y1: y(0), x2: x(top), y2: y(top), style: 'stroke:var(--ink3);stroke-dasharray:5 4' }, s);
  el('text', { x: x(top) - 4, y: y(top) + 16, 'text-anchor': 'end', style: 'font-size:11px;fill:var(--ink3)' }, s, t('dec11'));
  [[3, 'var(--steel)'], [4, 'var(--oxide)']].forEach(([j, col], q) => P.forEach((p, k) =>
    hover(anim(el('circle', { cx: x(p[2]), cy: y(p[j]), r: 3.4, style: `fill:${col};fill-opacity:.75;stroke:var(--paper);stroke-width:.6` }, s), 'a-pop', .25 + q * .5 + .5 * spread(k)),
      () => fmt(t('decTip'), { f: famName(p[0]), c: cellName(p[1]), d: p[2].toFixed(1), o: p[3].toFixed(1), w: p[4].toFixed(1) }))));
  el('text', { x: (m.l + W - m.r) / 2, y: H - 6, 'text-anchor': 'middle' }, s, t('decX'));
  yTitle(s, 14, (m.t + H - m.b) / 2, t('decY'));
  swatches('decLegend', [['var(--steel)', t('decCoup')], ['var(--oxide)', t('decWait')], ['var(--ink3)', t('dec11'), 'height:2px']]);
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

// one unit out of service: on-time share with the worst single unit out, by condition and fleet
const mixName = f => { const m = /^L(\d+)_H(\d+)x(\d)$/.exec(f); return m ? `${m[1]} t + ${m[3]} × ${m[2]} t` : famName(f); };
function drawOutage() {
  const O = D.oe.outage, cells = [...new Set(O.map(o => o[0]))], W = 620, H = fitH('cOutage', W, 330, 0.8, 1.4), L = 200, R = W - 14, top = 8, bh = (H - top - 44) / cells.length;
  const s = frame('cOutage', W, H, 'On-time share after removing one unit of capacity'), x = lin(40, 100, L, R), g = el('g', { class: 'grid' }, s);
  for (let v = 40; v <= 100; v += 10) { el('line', { x1: x(v), x2: x(v), y1: top, y2: H - 38 }, g); el('text', { x: x(v), y: H - 22, 'text-anchor': 'middle', style: 'font-size:11px' }, s, v); }
  el('line', { x1: x(95), x2: x(95), y1: top, y2: H - 38, style: 'stroke:var(--ink2);stroke-dasharray:4 3' }, s);
  cells.forEach((c, i) => {
    const [mm, h] = c.split('_'), yc = top + (i + 0.5) * bh;
    el('line', { x1: L, x2: R, y1: yc, y2: yc, style: 'stroke:var(--line)' }, s);
    el('text', { x: L - 10, y: yc + 4, 'text-anchor': 'end', style: 'font-size:12.5px' }, s, `${t(mm)} · ${t(h + 'l')}`);
    O.filter(o => o[0] === c).forEach(([, f, hv, on, pm, cov], k) => {
      const one = hv === 1, col = one ? 'var(--oxide)' : cov ? 'var(--steel)' : 'var(--g-empty)', cx = x(Math.max(40, on));
      const node = one ? el('rect', { x: cx - 5.5, y: yc - 5.5, width: 11, height: 11, transform: `rotate(45 ${cx} ${yc})`, style: `fill:${col};stroke:var(--paper);stroke-width:1` }, s)
        : el('circle', { cx, cy: yc, r: cov ? 6 : 4.5, style: `fill:${col};stroke:var(--paper);stroke-width:1;fill-opacity:${cov ? 1 : .85}` }, s);
      hover(anim(node, 'a-pop', .3 + i * .08 + .3 * spread(k)), () => fmt(t('ouTip'), { f: `<b>${mixName(f)}</b> · ${t(mm)} · ${t(h + 'l')}`, v: on.toFixed(1), p: pm.toFixed(2) }));
    });
  });
  el('text', { x: x(95) + 4, y: top + 10, style: 'font-size:11px;fill:var(--ink2)' }, s, t('ou95'));
  el('text', { x: (L + R) / 2, y: H - 4, 'text-anchor': 'middle', style: 'font-size:11.5px' }, s, t('ouX'));
  swatches('ouLegend', [['var(--oxide)', t('ouOne'), 'transform:rotate(45deg) scale(.8)'], ['var(--steel)', t('ouCov'), 'border-radius:50%'], ['var(--g-empty)', t('ouOther'), 'border-radius:50%']]);
}

// light units plus covering heavy units in 13 further conditions: heavy units of the cheapest mix against the heavy-share rule
function drawMix13() {
  const M = D.oe.mix13, cells = Object.keys(M), offs = [-2, -1, 0, 1, 2];
  const cols = { '-2': 'var(--g-empty)', '-1': 'var(--steel-soft)', 0: 'var(--steel)', 1: 'var(--amber)', 2: 'var(--oxide)' };
  const W = 620, H = fitH('cMix', W, 400, 0.8, 1.3), L = 250, R = W - 12, top = 4, bh = (H - top - 40) / cells.length;
  const s = frame('cMix', W, H, 'Heavy units of the cheapest mix against the heavy-share rule'), x = lin(0, 100, L, R), g = el('g', { class: 'grid' }, s);
  for (let v = 0; v <= 100; v += 25) { el('line', { x1: x(v), x2: x(v), y1: top, y2: H - 34 }, g); el('text', { x: x(v), y: H - 18, 'text-anchor': 'middle', style: 'font-size:11px' }, s, v); }
  cells.forEach((c, i) => {
    const [n, dist] = M[c], tot = Object.values(dist).reduce((a, b) => a + b, 0), y0 = top + i * bh + bh * 0.15, h = bh * 0.7;
    const lb = el('text', { x: L - 8, y: y0 + h / 2 + 4, 'text-anchor': 'end', style: 'font-size:11.5px' }, s);
    el('tspan', {}, lb, `${cellShort(c)} · K`); el('tspan', { 'baseline-shift': 'sub', 'font-size': '75%' }, lb, 'H'); el('tspan', {}, lb, `* = ${n}`);
    let acc = 0;
    offs.forEach(o => {
      const v = dist[n + o] || 0;
      if (!v) return;
      const w = 100 * v / tot, r = anim(el('rect', { x: x(acc), y: y0, width: x(acc + w) - x(acc), height: h, style: `fill:${cols[o]}` }, s), 'a-x', .25 + i * .05);
      hover(r, () => fmt(t('mxTip'), { c: cellName(c), n, d: Object.entries(dist).map(([k, q]) => fmt(t('mxCnt'), { k, v: q })).join('<br>') }));
      acc += w;
    });
  });
  el('text', { x: (L + R) / 2, y: H - 2, 'text-anchor': 'middle', style: 'font-size:11.5px' }, s, t('mxX'));
  swatches('mxLegend', offs.map(o => [cols[o], o ? fmt(t('mxOff'), { o: (o > 0 ? '+' : '−') + Math.abs(o) }) : t('mxRule')]));
}

const heatTip = () => { $('heatTip').innerHTML = `<p class="small">${t('heatHint')}</p>`; };

// controls of this deck, wired once after the shared shell is built
function init() {
  ['calcM', 'calcH', 'calcD'].forEach(id => $(id).addEventListener('change', drawCalc));
  $('rCalc').addEventListener('input', drawCalc);
  $('calcLab').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { calcLabI = +b.dataset.i; drawCalc(); } });
  $('rCap').addEventListener('input', drawCap);
  $('rCase').addEventListener('input', drawCase);
  $('rBud').addEventListener('input', drawBud);
  $('dBud').addEventListener('input', drawBud);
  $('wBud').addEventListener('input', drawBud);
  $('massR').addEventListener('input', drawTeam);
  $('tierSeg').innerHTML = [200, 250, 270, 300, 325, 380, 425, 500, 550].map(q => `<button type="button" data-q="${q}">${q} t</button>`).join('');
  $('tierSeg').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { tier = +b.dataset.q; drawTeam(); } });
  $('heatSeg').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { heatLab = b.dataset.lab; drawHeat(); } });
  drawSpmt(); drawBoot();
}

Deck.start({
  strings: T,
  sections: { intro: ['导读', 'Overview', '개요'], bg: ['背景', 'Background', '배경'], method: ['方法', 'Method', '방법'], theory: ['解析模型', 'Analytical model', '해석 모형'], why: ['拼载为何贵', 'Why coupling costs', '결합 비용의 원인'], bound: ['构成与服务', 'Composition and service', '구성과 서비스'], setup: ['案例与实验', 'Case and experiments', '사례와 실험'],
    res: ['结果', 'Results', '결과'], rel: ['验证', 'Validation', '검증'], disc: ['讨论', 'Discussion', '논의'], ref: ['参考文献', 'References', '참고문헌'], status: ['进度', 'Status', '진행 상황'], end: ['总结', 'Summary', '요약'] },
  draw: [drawPrice, drawCap, drawHeat, drawCase, drawTeam, drawDay, drawGantt, drawMasses, fillCalcSelects, drawCalc, renderB4, drawLate, drawTmax, drawE7, drawE5, drawKt, drawOcc, drawSlack, drawBrk, drawRobust, drawBud, drawDecomp, drawExact, drawFresh, drawOutage, drawMix13, heatTip],
  init,
});
})();
