(() => {
'use strict';
const D = window.DATA;
const root = document.documentElement;
const NS = 'http://www.w3.org/2000/svg';
const LANGS = ['zh', 'en', 'ko'];
const LI = { zh: 0, en: 1, ko: 2 };
const $ = id => document.getElementById(id);
let lang = LANGS.includes(root.dataset.lang) ? root.dataset.lang : 'zh';

// ---------- strings used inside charts: [zh, en, ko] ----------
const T = {
  title: ['分段运输车选型', 'Block Transporter Choice', '블록 트랜스포터 선정'],
  mx1: ['270 t + 1 台重车', '270 t + 1 heavy', '270 t + 대형 1대'],
  mx2: ['270 t + 2 台重车', '270 t + 2 heavy', '270 t + 대형 2대'],
  M1: ['Jiang 实测', 'Jiang', 'Jiang 실측'], M2: ['偏轻', 'Light-skewed', '경량 편중'], M3: ['均匀', 'Uniform', '균일'],
  M4: ['超重', 'Extra-heavy', '초중량'], M5: ['Roh–Cha', 'Roh–Cha', 'Roh–Cha'], M6: ['Liu', 'Liu', 'Liu'],
  H1: ['短', 'short', '짧음'], H2: ['随重', 'mass-dep.', '중량비례'], H3: ['长', 'long', '긺'],
  H1l: ['短装卸', 'short handling', '짧은 적재·하역'], H2l: ['随重量变化的装卸', 'mass-dependent handling', '중량 비례 적재·하역'], H3l: ['长装载', 'long loading', '긴 적재'],
  'D-emp': ['基准', 'base', '기준'], 'D-tight': ['紧', 'tight', '촉박'],
  'D-empl': ['基准交期', 'baseline due dates', '기준 납기'], 'D-tightl': ['紧交期', 'tight due dates', '촉박한 납기'],
  xr: ['价格比 r（人时/天）', 'Price ratio r (labour-hours/day)', '가격비 r (인시/일)'],
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
  capTxt: ['r = {r} 时，最贵的 550 t 每天资本成本为 {v} 人时，仍低于一组人的 64 人时。少买一台车，比升级到更大吨级更省。',
           'At r = {r}, the dearest tier, 550 t, costs {v} labour-hours of capital a day, still below one crew’s 64. Saving a transporter beats moving up a tier.',
           'r = {r}일 때 가장 비싼 550 t의 하루 자본비는 {v}인시로, 작업 인원 64인시보다 낮다. 한 대를 덜 사는 편이 등급을 올리는 것보다 절약된다.'],
  sX: ['拼载占服务时间（%）', 'Coupled share of service time (%)', '결합 운반의 서비스 시간 비율 (%)'],
  sY: ['比最省车队贵（%）', 'Cost above the cheapest fleet (%)', '최저비용 대비 추가 비용 (%)'],
  work: ['工作量 × {k}', 'Workload × {k}', '작업량 × {k}'],
  cheapest: ['最省', 'cheapest', '최저'],
  above: ['比最省贵（%）', 'Above the cheapest (%)', '최저 대비 추가 (%)'],
  aY: ['与最终决定相同（%）', 'Same fleet as final (%)', '최종 결정과 동일 (%)'],
  greedy: ['贪心', 'Greedy', '탐욕'], cp0: ['仅构造', 'Constr.', '구성만'], cp100: ['100 次迭代', '100 it.', '100회'],
  cp300: ['300 次迭代', '300 it.', '300회'], single: ['786 次迭代', '786 it.', '786회'], final: ['最终', 'Final', '최종'],
  stackTip: ['台数 = K*：{a} 个系列 · 多 1 台：{b} · 多 2 台以上：{c}', 'Count = K*: {a} series · one more: {b} · two or more: {c}', '대수 = K*: {a}개 시리즈 · 1대 많음: {b} · 2대 이상 많음: {c}'],
  lX: ['K* − Kρ（台）', 'K* − Kρ (transporters)', 'K* − Kρ (대)'],
  lY: ['车队系列数', 'Fleet series', '차량군 시리즈 수'],
  base: ['基准交期', 'Baseline due dates', '기준 납기'], tight: ['紧交期', 'Tight due dates', '촉박한 납기'],
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
  pilot: ['试算中', 'pilot', '시험 실행 중'], planned: ['待运行', 'planned', '예정'],
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
  cCost: ['每天成本，人时（r = 12.4，班次人工）', 'Daily cost (labour-h, r = 12.4)', '하루 비용, 인시 (r = 12.4, 교대 인원)'],
  // mass scenarios
  M1d: ['68 条实测任务重量（Jiang 2021）重抽样', '68 recorded task masses (Jiang 2021), resampled', '실측 작업 중량 68건 (Jiang 2021) 재표본'],
  M2d: ['90% 为 100–300 t，10% 为 300–500 t（假设）', '90% at 100–300 t, 10% at 300–500 t (assumed)', '90%는 100–300 t, 10%는 300–500 t (가정)'],
  M3d: ['100–500 t 均匀分布（假设）', 'Uniform over 100–500 t (assumed)', '100–500 t 균일 분포 (가정)'],
  M4d: ['90% 同偏轻，10% 为 500–800 t：有的块超过所有吨级（假设）', '90% light-skewed, 10% at 500–800 t: some blocks exceed every tier (assumed)', '90%는 경량 편중, 10%는 500–800 t: 일부 블록은 모든 등급 초과 (가정)'],
  M5d: ['文献中 10 块分段的重量重抽样（Roh &amp; Cha 2011）', 'Ten block masses from Roh &amp; Cha (2011), resampled', 'Roh &amp; Cha (2011)의 블록 중량 10개 재표본'],
  M6d: ['外高桥一周 50 块分段的重量重抽样（Liu 2022）', '50 block masses of one week at Waigaoqiao (Liu 2022), resampled', '와이가오차오 1주일 블록 중량 50개 (Liu 2022) 재표본'],
  above270: ['超过 270 t：{p}%', 'above 270 t: {p}%', '270 t 초과: {p}%'],
  // calculator
  fleetH: ['车队', 'Fleet', '차량군'], compH: ['组成', 'Composition', '구성'], costH: ['每天成本（人时）', 'Daily cost (labour-h)', '하루 비용 (인시)'],
  aboveH: ['比最省', 'vs cheapest', '최저 대비'], coupH: ['拼载', 'Coupled', '결합'],
  capLg: ['资本 r × P', 'Capital r × P', '자본 r × P'], labLg: ['人工 L', 'Labour L', '인건비 L'],
  liuFinal: ['共用车速（12/6 km/h）下：{n} / {N} 个设定全部由混编胜出，领先下一名 {lo}–{hi}%，拼载 ≤ {c}%。',
             'At common speeds (12/6 km/h): a mix wins {n} of {N} settings, {lo}–{hi}% ahead of the next fleet, coupling at most {c}%.',
             '공통 속도 (12/6 km/h): {N}개 중 {n}개 설정 모두 혼합이 최저, 다음 차량군보다 {lo}–{hi}% 싸고 결합은 {c}% 이하.'],
  porNum: ['个成本设定中买车成本上升；中位数 0，最多 {max}%', 'cost settings where the purchase gets dearer; median 0, at most {max}%', '개 비용 설정에서 구매 비용 상승, 중앙값 0, 최대 {max}%'],
  porNote: ['另有 {neg} 个设定受限规则反而更便宜：{small} 个不到 1%（搜索差异）；{big} 个都在“{cell}”，最多 {min}%。那里受限规则 5 台就达标，灵活规则的搜索却停在 6 台：主实验在该工况多算了 1 台，2 重车混编（而不是报告的 550 t）才是 {m4} 个班次配员设定中最便宜的。',
            '{neg} more settings are cheaper under the restricted rule: {small} by under 1% (search noise), {big} in {cell} by up to {min}%. There the restricted rule qualified with 5 vehicles where the flexible search stopped at 6, so the two-heavy mix, not the reported 550 t, is cheapest in {m4} shift-staffing settings.',
            '또 {neg}개 설정은 제한 규칙에서 오히려 싸다. {small}개는 1% 미만 (탐색 차이), {big}개는 모두 "{cell}"에서 최대 {min}%. 그 조건에서 제한 규칙은 5대로 충족했지만 유연 규칙의 탐색은 6대에서 멈췄다. 주 실험이 1대를 더 센 것이며, {m4}개 교대 인원 설정에서는 보고된 550 t가 아니라 대형 2대 혼합이 최저다.'],
  porTip: ['{cell}<br>r = {r} · 贵 {v}%<br>灵活：{a} → 超重才拼：{b}', '{cell}<br>r = {r} · {v}% dearer<br>flexible: {a} → overweight-only: {b}', '{cell}<br>r = {r} · {v}% 상승<br>유연: {a} → 초과 중량: {b}'],
  porZero: ['0：没有变化', '0: no change', '0: 변화 없음'], porPos: ['变贵（越深越贵，最深 {max}%）', 'dearer (darker = more, up to {max}%)', '비싸짐 (진할수록, 최대 {max}%)'],
  porNeg: ['更便宜：搜索差异', 'cheaper: search difference', '더 쌈: 탐색 차이'],
  b4Cell: ['工况', 'Condition', '조건'],
  asofTxt: ['截至 {d}。进度条 = 已完成运行 / 预估运行；系列数 = 已完成扫描的车队系列。', 'As of {d}. Bar = runs done / estimated runs; series = fleet series whose scan is closed.', '{d} 기준. 막대 = 완료 실행 / 예상 실행, 시리즈 = 스캔이 끝난 차량군 시리즈.'],
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
  e7Ax: ['重分段（350–540 t）占比 p', 'Share p of heavy blocks (350–540 t)', '무거운 블록(350–540 t) 비율 p'],
  e7Tip: ['重块占 {p}% · {fleet} · 拼载 {c}%', 'heavy share {p}% · {fleet} · {c}% coupled', '무거운 블록 {p}% · {fleet} · 결합 {c}%'],
  e7Le: ['300 t：重块都要拼载', '300 t: couples every heavy block', '300 t: 무거운 블록 모두 결합'],
  e7Mx: ['270 t 轻车 + 1 或 2 台 550 t', '270 t units + one or two 550 t', '270 t 경형 + 550 t 1–2대'],
  e7Big: ['550 t：每块都单独运', '550 t: carries every block alone', '550 t: 모든 블록 단독 운반'],
  e7Num: ['个设定中最省车队拼载 ≤ 1/10；例外是 p = 35%、随重量装卸、按队计运营人工下的 2 重车混编（19.6%）', 'settings where the cheapest fleet couples at most one block in ten; the exceptions are the two-heavy mix at p = 35% with mass-dependent handling under per-team crews (19.6%)', '개 설정에서 최저비용 차량군의 결합 ≤ 10%. 예외는 p = 35%, 중량 비례 적재·하역, 팀별 운영 인원에서의 대형 2대 혼합 (19.6%)'],
  b4Shift: ['个班次配员设定换了最省车队，全在 Jiang 短装卸：一重车混编要多 1 台，被两重车混编取代；沿用原选择最多多花 {g}%', 'shift-staffing settings change their cheapest fleet, all with Jiang masses and short handling: the one-heavy mix needs one more vehicle and the two-heavy mix replaces it; keeping the old choice costs up to {g}% more', '개 교대 인원 설정에서 최저비용 차량군이 바뀜. 모두 Jiang·짧은 적재·하역: 대형 1대 혼합이 1대 더 필요해 대형 2대 혼합이 대신하며, 기존 선택 유지 시 최대 {g}% 추가'],
  b4All: ['个设定换了最省车队（混编取悲观车速；取乐观车速时为 {o} 个）', 'settings change their cheapest fleet at the pessimistic end ({o} at the optimistic end)', '개 설정에서 최저비용 차량군이 바뀜 (혼합 비관 속도 기준, 낙관 속도 기준 {o}개)'],
  b4Le10: ['个设定中最省车队仍拼载 ≤ 1/10（悲观端）', 'settings where the cheapest fleet still couples at most one block in ten (pessimistic end)', '개 설정에서 최저비용 차량군의 결합이 여전히 10% 이하 (비관적 끝)'],
  b4Roh: ['Roh–Cha 重量下 550 t 在全部 {a} 个设定中最省；Liu 重量下 425 t 在 {b} / {n} 个设定中最省（11 种标准车队中）', 'Under Roh–Cha masses 550 t is cheapest in all {a} settings; under Liu masses 425 t in {b} of {n} (among the eleven standard fleets)', 'Roh–Cha 중량에서 550 t가 {a}개 설정 모두 최저, Liu 중량에서 425 t가 {n}개 중 {b}개 최저 (표준 차량군 11개 중)'],
  b4NotRerun: ['未重跑', 'not rerun', '재실행 안 함'],
  calcTxt: ['最便宜：<b>{f}</b>（{k} 台），每天 {c} 人时；第二名 {f2} 贵 {p}%。人工占最便宜车队成本的 {lp}%。',
            'Cheapest: <b>{f}</b> ({k} vehicles), {c} labour-hours a day; the runner-up, {f2}, costs {p}% more. Labour is {lp}% of the cheapest fleet’s cost.',
            '최저: <b>{f}</b> ({k}대), 하루 {c}인시. 2위 {f2}는 {p}% 더 비싸다. 최저 차량군 비용 중 인건비 비중은 {lp}%.'],
};
const t = k => T[k][LI[lang]];
const fmt = (s, o) => s.replace(/\{(\w+)\}/g, (_, k) => o[k]);

// tier colours as in the manuscript figures (paper/figs/make_r25_figures.py)
const COL = { 200: '#f0f0f0', 250: '#d9d9d9', 270: '#c6dbef', 300: '#a9c8e1', 325: '#56b4b8', 380: '#4388b5',
  425: '#183a63', 500: '#91679d', 550: '#cc6d24', MX1: '#b9d7bf', MX2: '#42835a' };
const DARK = new Set(['325', '380', '425', '500', '550', 'MX2']);
const FAMS = ['200', '250', '270', '300', '325', '380', '425', '500', '550', 'MX1', 'MX2'];
const famName = f => f === 'MX1' ? t('mx1') : f === 'MX2' ? t('mx2') : f + ' t';
const cellName = c => { const [m, h, d] = c.split('_'); return `${t(m)} · ${t(h + 'l')} · ${t(d + 'l')}`; };
const cellShort = c => { const [m, h, d] = c.split('_'); return `${t(m)} · ${t(h)} · ${t(d)}`; };

// ---------- svg helpers ----------
function el(tag, attrs, parent, text) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (text != null) e.textContent = text;
  if (parent) parent.appendChild(e);
  return e;
}
function frame(id, w, h, label) {
  const host = $(id);
  host.innerHTML = '';
  return el('svg', { viewBox: `0 0 ${w} ${h}`, role: 'img', 'aria-label': label || '' }, host);
}
// chart height in design units that matches the box the slide gives the chart (between lo and hi times the default)
function fitH(id, W, H0, lo = 0.8, hi = 1.8) {
  const host = $(id);
  if (root.classList.contains('flow') || !host.clientWidth || !host.clientHeight) return H0;
  return Math.round(Math.min(H0 * hi, Math.max(H0 * lo, W * host.clientHeight / host.clientWidth)));
}
const lin = (d0, d1, r0, r1) => v => r0 + (v - d0) * (r1 - r0) / (d1 - d0);
function yTitle(s, x, y, text) { el('text', { x, y, transform: `rotate(-90 ${x} ${y})`, 'text-anchor': 'middle' }, s, text); }
function swatches(id, items) {
  $(id).innerHTML = items.map(([c, name, extra]) => `<span><i style="background:${c};${extra || ''}"></i>${name}</span>`).join('');
}

// ---------- tooltip ----------
const tip = $('tip');
function moveTip(e) {
  const w = tip.offsetWidth, h = tip.offsetHeight;
  let x = e.clientX + 14, y = e.clientY + 14;
  if (x + w > innerWidth - 8) x = e.clientX - w - 14;
  if (y + h > innerHeight - 8) y = e.clientY - h - 14;
  tip.style.left = x + 'px'; tip.style.top = y + 'px';
}
function hover(node, html) {
  node.addEventListener('mouseenter', e => { tip.innerHTML = html(); tip.hidden = false; moveTip(e); });
  node.addEventListener('mousemove', moveTip);
  node.addEventListener('mouseleave', () => { tip.hidden = true; });
}

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
  el('line', { x1: x(80), y1: y(pQ(80)), x2: x(620), y2: y(pQ(620)), style: 'stroke:var(--amber);stroke-width:2.5' }, s);
  el('line', { x1: x(20), x2: x(48), y1: y(4.6), y2: y(4.6), style: 'stroke:var(--amber);stroke-width:2.5' }, s);
  el('text', { x: x(56), y: y(4.6) + 4, class: 't-strong' }, s, `${t('pFit')}: p(Q) = 0.575 + 0.00607 Q`);
  for (const [q, p, n] of D.price) {
    const c = el('circle', { cx: x(q), cy: y(p), r: 4.5 + (n - 1) * 1.6, style: 'fill:var(--steel);fill-opacity:.45;stroke:var(--steel);stroke-width:1.2' }, s);
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
    el('rect', { x: x0, y: y(v), width: bw, height: y(0) - y(v), style: `fill:${v > 64 ? 'var(--oxide)' : 'var(--steel)'}` }, s);
    el('text', { x: x0 + bw / 2, y: y(v) - 5, 'text-anchor': 'middle', class: 't-strong' }, s, v.toFixed(0));
    el('text', { x: x0 + bw / 2, y: y(0) + 17, 'text-anchor': 'middle' }, s, q);
  });
  el('line', { x1: m.l, x2: W - m.r, y1: y(64), y2: y(64), style: 'stroke:var(--oxide);stroke-width:2;stroke-dasharray:7 5' }, s);
  el('text', { x: m.l + 4, y: y(64) - 7, class: 't-ox' }, s, t('crew'));
  el('text', { x: (m.l + W - m.r) / 2, y: H - 4, 'text-anchor': 'middle' }, s, t('capX'));
  yTitle(s, 14, (m.t + H - m.b) / 2, t('capY'));
  $('capTxt').textContent = fmt(t('capTxt'), { r: r.toFixed(1), v: vals[8].toFixed(0) });
}

let heatLab = 'shift_h';
function heatInfo(i, j) {
  const [f, share, hatch, weak] = D.heat[heatLab][i][j];
  $('heatTip').innerHTML = `<p class="small" style="color:var(--ink)"><b>${cellName(D.cells[i])}</b></p>
    <p class="small">r = ${D.r[j].toFixed(1)} · ${t('winner')}: <b style="color:var(--ink)">${famName(f)}</b> · ${t('coupled')}: <b style="color:var(--ink)">${share}%</b></p>
    ${hatch ? `<p class="small">▨ ${t('hatchTip')}</p>` : ''}${weak ? `<p class="small" style="color:var(--oxide)">● ${t('weakTip')}</p>` : ''}`;
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
      const x = L + j * cw, cell = el('g', { style: 'cursor:default' }, s);
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

function drawScatter() {
  const W = 600, H = fitH('cScatter', 600, 390), m = { l: 56, r: 14, t: 10, b: 46 };
  const s = frame('cScatter', W, H, 'Coupled share against cost premium');
  const x = lin(0, 100, m.l, W - m.r), y = lin(-5, 185, H - m.b, m.t);
  const g = el('g', { class: 'grid' }, s);
  for (let v = 0; v <= 175; v += 25) { el('line', { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v) }, g); el('text', { x: m.l - 8, y: y(v) + 4, 'text-anchor': 'end' }, s, v); }
  for (let v = 0; v <= 100; v += 25) { el('line', { x1: x(v), x2: x(v), y1: m.t, y2: H - m.b }, g); el('text', { x: x(v), y: H - m.b + 18, 'text-anchor': 'middle' }, s, v); }
  el('text', { x: (m.l + W - m.r) / 2, y: H - 6, 'text-anchor': 'middle' }, s, t('sX'));
  yTitle(s, 14, (m.t + H - m.b) / 2, t('sY'));
  for (const [f, cx, cy, K, cell] of D.scatter) {
    const c = el('circle', { cx: x(cx), cy: y(cy), r: 4.8, fill: COL[f], style: 'stroke:var(--ink);stroke-opacity:.5;stroke-width:.7' }, s);
    hover(c, () => `<b>${famName(f)}</b> · K* = ${K}<br>${cellName(cell)}<br>${t('sX')}: ${cx}%<br>${t('sY')}: +${cy}%`);
  }
  swatches('scatLegend', FAMS.map(f => [COL[f], famName(f)]));
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
      if (!win) el('rect', { x: x0 + bx, y: y + 6, width: Math.min(pct, dom) * bw / dom, height: rh - 12, fill: COL[o.f], style: 'stroke:var(--ink3);stroke-width:.6' }, s);
      el('text', { x: x0 + bx + (win ? 0 : Math.min(pct, dom) * bw / dom) + 5, y: y + rh / 2 + 4, class: win ? 't-strong' : '', style: win ? 'fill:var(--good)' : 'font-size:11.5px' }, s,
        win ? '★ ' + t('cheapest') : '+' + (pct < 10 ? pct.toFixed(1) : pct.toFixed(0)) + '%');
    });
    el('text', { x: x0 + bx + bw / 2, y: H - 4, 'text-anchor': 'middle', style: 'font-size:11.5px' }, s, t('above'));
  });
}

function drawAgree() {
  const lv = [['greedy', 65.4], ['cp0', 69.4], ['cp100', 74.7], ['cp300', 88.0], ['single', 94.4], ['final', 100]];
  const W = 540, H = fitH('cAgree', 540, 300), m = { l: 54, r: 20, t: 24, b: 44 };
  const s = frame('cAgree', W, H, 'Agreement with the final purchase by evaluation level');
  const x = i => m.l + 20 + i * (W - m.l - m.r - 40) / 5, y = lin(55, 102, H - m.b, m.t);
  const g = el('g', { class: 'grid' }, s);
  for (const v of [60, 70, 80, 90, 100]) { el('line', { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v) }, g); el('text', { x: m.l - 8, y: y(v) + 4, 'text-anchor': 'end' }, s, v); }
  yTitle(s, 14, (m.t + H - m.b) / 2, t('aY'));
  el('path', { d: lv.map(([, v], i) => `${i ? 'L' : 'M'}${x(i)} ${y(v)}`).join(''), style: 'fill:none;stroke:var(--steel);stroke-width:2.5' }, s);
  lv.forEach(([k, v], i) => {
    const c = el('circle', { cx: x(i), cy: y(v), r: 7, style: `fill:${i ? 'var(--steel)' : 'var(--oxide)'};stroke:var(--paper);stroke-width:2` }, s);
    const [a, b, cc] = D.stack[k];
    hover(c, () => fmt(t('stackTip'), { a, b, c: cc }));
    el('text', { x: x(i), y: y(v) - 13, 'text-anchor': 'middle', class: i ? 't-strong' : 't-ox' }, s, v.toFixed(0) + '%');
    el('text', { x: x(i), y: H - m.b + 20, 'text-anchor': 'middle', style: 'font-size:11.5px' }, s, t(k));
  });
}

function drawLoad() {
  const W = 540, H = fitH('cLoad', 540, 300), m = { l: 50, r: 14, t: 34, b: 44 };
  const s = frame('cLoad', W, H, 'Load-rule count error by due-date setting');
  const xs = [-1, 0, 1, 2, 3, 4, 5], band = (W - m.l - m.r) / xs.length, y = lin(0, 140, H - m.b, m.t);
  const g = el('g', { class: 'grid' }, s);
  for (const v of [25, 50, 75, 100, 125]) { el('line', { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v) }, g); el('text', { x: m.l - 8, y: y(v) + 4, 'text-anchor': 'end' }, s, v); }
  el('line', { x1: m.l, x2: W - m.r, y1: y(0), y2: y(0), style: 'stroke:var(--ink3)' }, s);
  [['D-emp', 'var(--g-load)', 0], ['D-tight', 'var(--oxide)', 1]].forEach(([due, col, o]) => {
    D.load[due].forEach(([d, n], i) => {
      const bw = band * 0.36, x0 = m.l + i * band + band * 0.12 + o * bw;
      if (n) el('rect', { x: x0, y: y(n), width: bw, height: y(0) - y(n), style: `fill:${col}` }, s);
      if (n) el('text', { x: x0 + bw / 2, y: y(n) - 4, 'text-anchor': 'middle', style: 'font-size:10.5px' }, s, n);
    });
  });
  xs.forEach((d, i) => el('text', { x: m.l + i * band + band / 2, y: y(0) + 17, 'text-anchor': 'middle', class: d === 0 ? 't-strong' : '' }, s, d > 0 ? '+' + d : d));
  el('text', { x: (m.l + W - m.r) / 2, y: H - 6, 'text-anchor': 'middle' }, s, t('lX'));
  yTitle(s, 14, (m.t + H - m.b) / 2, t('lY'));
  el('rect', { x: m.l + 150, y: 6, width: 12, height: 12, style: 'fill:var(--g-load)' }, s);
  el('text', { x: m.l + 167, y: 16 }, s, t('base'));
  el('rect', { x: m.l + 300, y: 6, width: 12, height: 12, style: 'fill:var(--oxide)' }, s);
  el('text', { x: m.l + 317, y: 16 }, s, t('tight'));
  el('text', { x: W - m.r, y: y(128), 'text-anchor': 'end', class: 't-ox' }, s, t('under'));
}

// minimal-team demo (Eq. teams of the manuscript, homogeneous fleet, kappa = 3)
let tier = 270;
function drawTeam() {
  const mass = +$('massR').value;
  $('massV').value = mass + ' t';
  const n = mass <= tier ? 1 : Math.ceil(mass / tier), ok = n <= 3;
  const W = 460, H = fitH('teamViz', 460, 124, 1, 2.6), s = el('g', { transform: `translate(0 ${(H - 124) / 2})` }, frame('teamViz', W, H, 'Team for the chosen block'));
  const bw = 80 + mass * 0.34;
  el('rect', { x: (W - bw) / 2, y: 4, width: bw, height: 46, rx: 6, style: 'fill:var(--steel)' }, s);
  el('text', { x: W / 2, y: 33, 'text-anchor': 'middle', style: 'fill:var(--paper);font:600 18px var(--d-en)' }, s, mass + ' t');
  const tw = 40 + tier * 0.2, gp = 8, tot = n * tw + (n - 1) * gp;
  for (let i = 0; i < n; i++) {
    const x0 = (W - tot) / 2 + i * (tw + gp);
    el('rect', { x: x0, y: 54, width: tw, height: 14, rx: 2, style: ok ? 'fill:var(--amber-hi)' : 'fill:var(--oxide-soft);stroke:var(--oxide);stroke-dasharray:4 3' }, s);
    for (let w = 8; w < tw; w += 14) el('circle', { cx: x0 + w, cy: 76, r: 5.5, style: `fill:${ok ? 'var(--ink)' : 'var(--ink3)'}` }, s);
    el('text', { x: x0 + tw / 2, y: 100, 'text-anchor': 'middle', style: 'font-family:var(--mono);font-size:12px' }, s, tier + ' t');
    if (i && ok) el('line', { x1: x0 - gp, x2: x0, y1: 58, y2: 58, style: 'stroke:var(--ink);stroke-width:4' }, s);
  }
  $('teamTxt').innerHTML = n === 1 ? fmt(t('single1'), { Q: tier, m: mass })
    : ok ? fmt(t('couple'), { n, Q: tier, S: n * tier, S2: (n - 1) * tier, m: mass, w: 4 * n })
    : fmt(t('nope'), { n });
  document.querySelectorAll('#tierSeg button').forEach(b => b.setAttribute('aria-pressed', +b.dataset.q === tier));
}


// transporter move in four steps (static sketch)
function drawSpmt() {
  const g = $('spmtSteps');
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
    const ln = el('line', { x1: x(r), x2: x(d), y1: y(ms), y2: y(ms), style: `stroke:${c};stroke-width:3.2;stroke-linecap:round` }, s);
    el('circle', { cx: x(r), cy: y(ms), r: 2.6, style: `fill:${heavy ? 'var(--amber)' : 'var(--steel)'}` }, s);
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
        if (a > prev) el('rect', { x: x(prev), y: by + 3, width: Math.max(.5, x(a) - x(prev)), height: bh - 6, style: 'fill:var(--g-empty)' }, s);
        const w0 = Math.max(a, rel);
        if (st > w0 + 1) el('rect', { x: x(w0), y: by, width: x(st) - x(w0), height: bh, style: 'fill:var(--oxide-soft);stroke:var(--oxide);stroke-width:.6' }, s);
        const late = c > due;
        const b = el('rect', { x: x(st), y: by, width: Math.max(1, x(c) - x(st)), height: bh, rx: 1.5,
          style: `fill:${n > 1 ? 'var(--amber-hi)' : 'var(--steel)'};${late ? 'stroke:#e03131;stroke-width:1.6' : 'stroke:var(--paper);stroke-width:.5'}` }, s);
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
  ['M1', 'M2', 'M3', 'M4', 'M5', 'M6'].forEach(k => {
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
      el('rect', { x: b.l + i * bw + .5, y: H - b.b - h, width: bw - 1, height: h, style: `fill:${i * 50 >= 270 ? 'var(--amber-hi)' : 'var(--steel)'}` }, s);
    });
    el('line', { x1: b.l, x2: W - b.r, y1: H - b.b, y2: H - b.b, style: 'stroke:var(--ink3)' }, s);
    const x270 = b.l + 270 / 50 * bw;
    el('line', { x1: x270, x2: x270, y1: 4, y2: H - b.b, style: 'stroke:var(--oxide);stroke-dasharray:4 3;stroke-width:1.2' }, s);
    el('text', { x: x270 + 4, y: 13, style: 'font-size:11px;fill:var(--oxide);font-weight:600' }, s, fmt(t('above270'), { p: Math.round(mm.above['270']) }));
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
    el('rect', { x: cols.bar, y: y + rowH * 0.24, width: wc, height: rowH * 0.52, style: 'fill:var(--steel)' }, s);
    el('rect', { x: cols.bar + wc, y: y + rowH * 0.24, width: wl, height: rowH * 0.52, style: 'fill:var(--amber-hi)' }, s);
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
  $('bootB').innerHTML = draw.map(d => `<i class="${cnt[d] > 1 ? 'dup' : ''}">${d}</i>`).join('');
}

// status of the R25 runs: progress.json snapshots carried in data.js (make_data.py)
const PROGQ = {
  R3: ['延误上限轴：T<sub>max</sub> 从 30 min 到无上限（结论 2）', 'Delay-cap axis, T<sub>max</sub> from 30 min to no cap (Finding 2)', '지연 상한 축: T<sub>max</sub> 30분 → 상한 없음 (결론 2)'],
  E7: ['重块比例多高时，同质重车才值得买', 'Heavy-block share at which a homogeneous heavy tier pays', '무거운 블록 비율이 얼마일 때 대형 단일 등급이 이득인가'],
  E5: ['敏感性：对接时间、装卸、车速的决策边界', 'Sensitivity: decision boundaries in coupling time, handling and speed', '민감도: 결합 시간·적재 하역·속도의 결정 경계'],
  B4: ['各吨级用厂家标称车速；Liu 混编', 'Manufacturer speeds per tier; the Liu mixes', '등급별 제조사 속도, Liu 혼합'],
  R4R: ['只在超重时才允许拼载的规则', 'Overweight-only coupling rule', '초과 중량일 때만 결합을 허용하는 규칙'],
  V1: ['小规模实例上与 CP-SAT 精确解对照', 'Exact CP-SAT comparison on small instances', '소규모 인스턴스에서 CP-SAT 정확해와 비교'],
  X1: ['装卸波动下的稳健配车', 'Robust sizing under handling variability', '적재·하역 변동하의 강건 산정'],
};
function renderProg() {
  const n = v => v.toLocaleString('en-US'), P = D.late.progress;
  $('progRows').innerHTML = ['R3', 'E7', 'E5', 'B4', 'R4R', 'V1', 'X1'].map(id => {
    const p = P[id];
    let cell;
    if (!p) cell = `<span class="pill ${id === 'V1' ? 'run' : 'pend'}">${t(id === 'V1' ? 'pilot' : 'planned')}</span>`;
    else if (p[0] === p[1]) cell = `<span class="pill done">${t('doneP')}</span> <span class="tiny">${p[0]}/${p[1]} ${t('series')} · ${n(p[2])} ${t('runs')}</span>`;
    else cell = `<div class="pbar"><i style="width:${Math.min(100, 100 * p[2] / p[3]).toFixed(0)}%"></i></div>
         <div class="tiny" style="margin-top:3px">${p[0]}/${p[1]} ${t('series')} · ${n(p[2])} ${t('runs')} (${t('est')} ${n(p[3])})</div>`;
    return `<tr><td>${id}</td><td>${PROGQ[id][LI[lang]]}</td><td style="min-width:190px">${cell}</td></tr>`;
  }).join('');
  $('asofNote').textContent = fmt(t('asofTxt'), { d: D.late.asof });
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
function drawLiu() {
  const r = +$('rLiu').value;
  $('rLiuV').value = r.toFixed(1);
  const L = D.late.liu;
  const items = L.table.map(([f, K, P, Ls, Lt, Lv, cp, hv]) => ({ f, K, P, L: Ls, cap: r * P, cost: r * P + Ls, cp, hv: hv || 550 }))
    .sort((a, b) => a.cost - b.cost);
  const best = items[0].cost, max = Math.max(...items.map(o => o.cost));
  const W = 760, top = 22, H0 = top + items.length * 24 + 6;
  const rowH = Math.max(18, Math.min(30, (fitH('cLiu', W, H0, 0.8, 1.6) - top - 6) / items.length)), H = top + items.length * rowH + 6;
  const s = frame('cLiu', W, H, 'Daily cost of every fleet under Liu masses');
  const cx = { name: 4, k: 250, bar: 280, barW: 330, tot: 660, pct: 668, cp: 756 };
  const hdr = (x, txt, a) => el('text', { x, y: 14, 'text-anchor': a || 'start', style: 'font-size:11.5px;fill:var(--ink3);font-weight:600' }, s, txt);
  hdr(cx.name, t('fleetH')); hdr(cx.k, 'K*', 'middle'); hdr(cx.bar, t('costH')); hdr(cx.cp, t('coupH'), 'end');
  items.forEach((o, i) => {
    const y = top + i * rowH, win = i === 0, mix = /^L/.test(o.f), ty = y + rowH / 2 + 4.5;
    if (win) el('rect', { x: 0, y: y + 1, width: W, height: rowH - 2, rx: 3, style: 'fill:var(--amber-soft)' }, s);
    el('text', { x: cx.name, y: ty, class: win || mix ? 't-strong' : '', style: 'font-size:12.5px;font-family:var(--mono)' }, s, liuName(o.f, o.K, o.hv));
    el('text', { x: cx.k, y: ty, 'text-anchor': 'middle', style: 'font-size:12.5px;font-family:var(--mono)' }, s, o.K);
    const wc = cx.barW * o.cap / max, wl = cx.barW * o.L / max;
    el('rect', { x: cx.bar, y: y + rowH * 0.22, width: wc, height: rowH * 0.56, style: 'fill:var(--steel)' }, s);
    el('rect', { x: cx.bar + wc, y: y + rowH * 0.22, width: wl, height: rowH * 0.56, style: 'fill:var(--amber-hi)' }, s);
    el('text', { x: cx.tot, y: ty, 'text-anchor': 'end', style: 'font-size:12px;font-family:var(--mono)' }, s, o.cost.toFixed(0));
    el('text', { x: cx.pct, y: ty, style: `font-size:12px;font-family:var(--mono);fill:${win ? 'var(--good)' : 'var(--ink3)'}` }, s, win ? '★' : '+' + (100 * (o.cost / best - 1)).toFixed(1) + '%');
    el('text', { x: cx.cp, y: ty, 'text-anchor': 'end', style: 'font-size:12px;font-family:var(--mono)' }, s, o.cp.toFixed(0) + '%');
  });
  const a = L.all_10_5, m = L.main, n = v => v.toLocaleString('en-US');
  $('liuWin').textContent = `${n(a.l300_cheapest)} / ${n(a.settings)}`;
  $('liuProv').textContent = fmt(t('liuFinal'), { n: n(m.l300_cheapest), N: n(m.settings), lo: m.premium_min_pct, hi: m.premium_max_pct, c: m.coop_max });
}

// price of overweight-only coupling (R4R), affine curve, shift staffing
function porColour(v) {
  if (v > 1e-9) {
    const k = Math.min(1, v / D.late.por_all.max), a = [247, 220, 207], b = [168, 54, 31];
    return `rgb(${a.map((x, i) => Math.round(x + (b[i] - x) * Math.sqrt(k))).join(',')})`;
  }
  return v < -1e-9 ? '#cfe1f0' : '#e6ebf0';
}
function drawPor() {
  const L = 172, cw = 44, rh = 12, gap = 4, top = 2, W = L + cw * 9 + 2, H = top + 36 * rh + 5 * gap + 40;
  const s = frame('cPor', W, H, 'Cost increase under overweight-only coupling');
  D.cells.forEach((c, i) => {
    const grp = Math.floor(i / 6), y = top + i * rh + grp * gap, [m, h, d] = c.split('_');
    if (i % 6 === 0) el('text', { x: 0, y: y + 3 * rh + 4, class: 't-strong', style: 'font-size:11px' }, s, t(m));
    el('text', { x: L - 6, y: y + rh - 3, 'text-anchor': 'end', style: 'font-size:9px' }, s, `${t(h)} · ${t(d)}`);
    D.late.por_grid[i].forEach(([v, a, b], j) => {
      const x = L + j * cw, g = el('g', {}, s);
      el('rect', { x, y, width: cw - 1, height: rh - 1, fill: porColour(v) }, g);
      if (Math.abs(v) >= 0.05) el('text', { x: x + cw / 2, y: y + rh - 3, 'text-anchor': 'middle', style: `font-size:8.5px;fill:${v > 4 ? '#fff' : '#1b1b1b'}` }, g, v.toFixed(1));
      hover(g, () => fmt(t('porTip'), { cell: cellName(c), r: D.r[j].toFixed(1), v: v.toFixed(2), a: famName(a), b: famName(b) }));
    });
  });
  D.r.forEach((r, j) => el('text', { x: L + j * cw + cw / 2, y: H - 24, 'text-anchor': 'middle', style: 'font-size:10px' }, s, r.toFixed(1)));
  el('text', { x: L + cw * 4.5, y: H - 5, 'text-anchor': 'middle', style: 'font-size:10.5px' }, s, t('xr'));
  const pa = D.late.por_all;
  swatches('porLegend', [['#e6ebf0', t('porZero')], [porColour(pa.max), fmt(t('porPos'), { max: pa.max })], ['#cfe1f0', t('porNeg')]]);
  $('porNum').innerHTML = `${pa.pos.toLocaleString('en-US')} / ${pa.n.toLocaleString('en-US')}<small>${fmt(t('porNum'), { max: pa.max })}</small>`;
  $('porNote').textContent = fmt(t('porNote'), { neg: pa.neg, small: pa.neg_small, big: pa.neg_big, min: Math.abs(pa.neg_min), cell: pa.big_cells.map(cellShort).join(', '), m4: D.late.m4 });
}

// manufacturer speeds (B4): K* at common speeds -> K* at manufacturer speeds, and the decisions
function renderB4() {
  const fams = ['380', '425', '500', '550', 'MX1', 'MX2'], byCell = {};
  D.late.b4k.forEach(([c, f, a, b, flag]) => { (byCell[c] = byCell[c] || {})[f] = [a, b, flag]; });
  $('b4Table').innerHTML = `<thead><tr><th style="text-transform:none">${t('b4Cell')}</th>${fams.map(f => `<th style="text-transform:none">${famName(f)}</th>`).join('')}</tr></thead><tbody>` +
    Object.keys(byCell).map(c => `<tr><td style="font-family:var(--body);font-weight:400;white-space:nowrap">${cellShort(c)}</td>` + fams.map(f => {
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
    el('rect', { x: L, y: y + rh * 0.2, width: x(o.mx) - L, height: rh * 0.5, rx: 2, style: `fill:${SC_COL[SC[o.c]]};opacity:.85` }, s);
    el('text', { x: x(o.mx) + 6, y: y + rh * 0.45 + 5, class: 't-strong' }, s, o.mx.toFixed(1) + ' h');
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
    el('path', { d: R[c].map((r, i) => `${i ? 'L' : 'M'}${xc(i) + off} ${ya(r[4])}`).join(''), style: `fill:none;stroke:${col};stroke-width:2` }, s);
    R[c].forEach((r, i) => {
      const tipf = () => fmt(t('tmaxTip'), { sc: t(SC[c]), lev: capName(r[0]), fleet: fleetStr(r[3]), c: r[4], md: r[5], lo: r[6], hi: r[7] });
      hover(el('circle', { cx: xc(i) + off, cy: ya(r[4]), r: 5, style: `fill:${col};stroke:var(--paper);stroke-width:1.5` }, s), tipf);
      el('line', { x1: xc(i) + off, x2: xc(i) + off, y1: yb(r[6]), y2: yb(r[7]), style: `stroke:${col};stroke-width:2` }, s);
      hover(el('rect', { x: xc(i) + off - 4.5, y: yb(r[5]) - 4.5, width: 9, height: 9, style: `fill:${col};stroke:var(--paper);stroke-width:1.5` }, s), tipf);
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
    el('text', { x: 0, y: y + rh / 2 + 4, class: 't-strong', style: 'font-size:13px' }, s, t(hk + 'l'));
    E[hk].forEach(([p, f, c], j) => {
      const g = el('g', {}, s), x0 = L + j * cw;
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

function safe(f) { try { f(); } catch (e) { if (window.console) console.error(f.name, e); } }
function drawAll() {
  [drawPrice, drawCap, drawHeat, drawScatter, drawCase, drawAgree, drawLoad, drawTeam, renderProg, drawDay, drawGantt, drawMasses, fillCalcSelects, drawCalc, drawLiu, drawPor, renderB4, drawLate, drawTmax, drawE7].forEach(safe);
  $('heatTip').innerHTML = `<p class="small">${t('heatHint')}</p>`;
}

// ---------- deck ----------
const SEC = { intro: ['导读', 'Overview', '개요'], bg: ['背景', 'Background', '배경'], method: ['方法', 'Method', '방법'], setup: ['实验设置', 'Setup', '실험 설정'],
  res: ['结果', 'Results', '결과'], rel: ['可靠性', 'Reliability', '신뢰성'], status: ['进度', 'Status', '진행 상황'], end: ['总结', 'Summary', '요약'] };
const slides = [...document.querySelectorAll('.slide')];
const stage = $('stage'), box = $('stagebox'), wrap = $('stagewrap');
let cur = 0, notesOn = false;
slides.forEach((s, i) => {
  s.id = 's' + (i + 1);
  const eb = s.querySelector('.eb'), L = SEC[s.dataset.sec];
  if (eb && L) eb.innerHTML = `<span class="sec">${LANGS.map((l, k) => `<span lang="${l}">${L[k]}</span>`).join('')}</span><span class="no">${String(i + 1).padStart(2, '0')} / ${slides.length}</span>`;
});

function fillNotes() {
  const a = slides[cur].querySelector('aside.notes');
  $('notesBody').innerHTML = a ? a.innerHTML : '';
}
// table of contents, built from each slide's title in all three languages
const secOf = i => slides[i].dataset.sec;
$('toc').innerHTML = slides.map((s, i) => {
  const head = i === 0 || secOf(i) !== secOf(i - 1)
    ? `<li class="sh">${SEC[secOf(i)] ? LANGS.map((l, k) => `<span lang="${l}">${SEC[secOf(i)][k]}</span>`).join('') : ''}</li>` : '';
  const ttl = s.querySelector('.ttl, h1');
  const names = LANGS.map(l => { const e = ttl && ttl.querySelector(`[lang="${l}"]`); return `<span lang="${l}">${e ? e.textContent.trim() : ''}</span>`; }).join('');
  return `${head}<li><button type="button" data-i="${i}"><span class="mono">${i + 1}</span><span>${names}</span></button></li>`;
}).join('');
function markToc() { document.querySelectorAll('#toc button').forEach(b => b.setAttribute('aria-current', +b.dataset.i === cur)); }
document.querySelectorAll('#agenda [data-go]').forEach(li => {
  const i = slides.findIndex(s => s.dataset.sec === li.dataset.go);
  li.querySelector('.pg').textContent = 'p. ' + (i + 1);
  li.addEventListener('click', () => go(i));
  li.addEventListener('keydown', e => { if (e.key === 'Enter') go(i); });
});
function go(i, keepHash) {
  i = Math.max(0, Math.min(slides.length - 1, i));
  slides[cur].classList.remove('on');
  slides[cur].setAttribute('aria-hidden', 'true');
  cur = i;
  slides[cur].classList.add('on');
  slides[cur].removeAttribute('aria-hidden');
  $('count').textContent = `${cur + 1} / ${slides.length}`;
  $('progI').style.width = (100 * (cur + 1) / slides.length) + '%';
  tip.hidden = true;
  fillNotes();
  markToc();
  if (!keepHash) try { history.replaceState(null, '', '#s' + (cur + 1)); } catch (e) {}
}
let wasFlow = null;
function layout() {
  const flow = innerWidth < 760;
  root.classList.toggle('flow', flow);
  if (wasFlow !== null && wasFlow !== flow) drawAll();
  wasFlow = flow;
  if (flow) { stage.style.transform = ''; return; }
  const r = wrap.getBoundingClientRect();
  const k = Math.max(0.2, Math.min((r.width - 32) / 1280, (r.height - 28) / 720));
  stage.style.transform = `scale(${k})`;
  box.style.width = 1280 * k + 'px';
  box.style.height = 720 * k + 'px';
}
function setLang(l) {
  lang = l;
  root.dataset.lang = l;
  root.lang = { zh: 'zh-CN', en: 'en', ko: 'ko' }[l];
  document.title = t('title');
  try { localStorage.setItem('deck-lang', l); } catch (e) {}
  document.querySelectorAll('[data-set-lang]').forEach(b => b.setAttribute('aria-pressed', b.dataset.setLang === l));
  drawAll();
  fillNotes();
}
function toggleNotes(on) {
  notesOn = on ?? !notesOn;
  $('notesp').hidden = !notesOn;
  root.classList.toggle('show-notes', notesOn);
  $('btnNotes').setAttribute('aria-pressed', notesOn);
  layout();
}
function toggleGloss(on) {
  const d = $('drawer'), show = on ?? d.hidden;
  d.hidden = !show;
  $('btnGloss').setAttribute('aria-pressed', show);
  if (show) toggleToc(false);
}
function toggleToc(on) {
  const d = $('tocDrawer'), show = on ?? d.hidden;
  d.hidden = !show;
  $('btnToc').setAttribute('aria-pressed', show);
  if (show) { toggleGloss(false); const b = d.querySelector('[aria-current="true"]'); if (b) b.focus(); }
}
function toggleFull() {
  try {
    if (!document.fullscreenElement) { const p = root.requestFullscreen && root.requestFullscreen(); if (p) p.catch(() => {}); }
    else if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
  } catch (e) {}
}

// controls
document.querySelectorAll('[data-set-lang]').forEach(b => b.addEventListener('click', () => setLang(b.dataset.setLang)));
$('prev').addEventListener('click', () => go(cur - 1));
$('next').addEventListener('click', () => go(cur + 1));
$('btnNotes').addEventListener('click', () => toggleNotes());
$('btnGloss').addEventListener('click', () => toggleGloss());
$('gClose').addEventListener('click', () => toggleGloss(false));
$('btnToc').addEventListener('click', () => toggleToc());
$('tocClose').addEventListener('click', () => toggleToc(false));
$('toc').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { go(+b.dataset.i); toggleToc(false); } });
['calcM', 'calcH', 'calcD'].forEach(id => $(id).addEventListener('change', drawCalc));
$('rCalc').addEventListener('input', drawCalc);
$('rLiu').addEventListener('input', drawLiu);
$('calcLab').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { calcLabI = +b.dataset.i; drawCalc(); } });
$('btnFull').addEventListener('click', toggleFull);
$('btnTheme').addEventListener('click', () => {
  const dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  root.dataset.theme = dark ? 'light' : 'dark';
});
$('rCap').addEventListener('input', drawCap);
$('rCase').addEventListener('input', drawCase);
$('massR').addEventListener('input', drawTeam);
$('tierSeg').innerHTML = [200, 250, 270, 300, 325, 380, 425, 500, 550].map(q => `<button type="button" data-q="${q}">${q} t</button>`).join('');
$('tierSeg').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { tier = +b.dataset.q; drawTeam(); } });
$('heatSeg').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { heatLab = b.dataset.lab; drawHeat(); } });

document.addEventListener('keydown', e => {
  if (e.target.matches('input,select,textarea') || e.altKey || e.ctrlKey || e.metaKey) return;
  if (e.target.closest('#toc') && (e.key === 'Enter' || e.key === ' ')) return;
  const k = e.key;
  if (k === 'ArrowRight' || k === 'PageDown' || k === ' ') { e.preventDefault(); go(cur + 1); }
  else if (k === 'ArrowLeft' || k === 'PageUp') { e.preventDefault(); go(cur - 1); }
  else if (k === 'Home') go(0);
  else if (k === 'End') go(slides.length - 1);
  else if (k === 'n' || k === 'N') toggleNotes();
  else if (k === 'g' || k === 'G') toggleGloss();
  else if (k === 'f' || k === 'F') toggleFull();
  else if (k === 't' || k === 'T') toggleToc();
  else if (k === 'Escape') { toggleGloss(false); toggleToc(false); }
});
// touch paging: one finger, mostly horizontal, at normal zoom. A gesture that starts on a control belongs to the control;
// a second finger (pinch) or a zoomed-in view cancels paging, so zooming and panning a zoomed slide never turn the page.
let ts = null;
const zoomed = () => !!(window.visualViewport && visualViewport.scale > 1.05);
wrap.addEventListener('touchstart', e => {
  ts = root.classList.contains('flow') || e.touches.length > 1 || zoomed() || e.target.closest('input,select,textarea,button,label')
    ? null : { x: e.touches[0].clientX, y: e.touches[0].clientY };
}, { passive: true });
wrap.addEventListener('touchmove', e => {
  if (!ts) return;
  if (e.touches.length > 1 || zoomed()) { ts = null; return; }
  if (e.cancelable) e.preventDefault();          // the slide does not scroll at normal zoom: keep the page from drifting
}, { passive: false });
wrap.addEventListener('touchcancel', () => { ts = null; });
// after a slider is dragged or a select is chosen with the mouse, hand the keyboard back to paging
addEventListener('pointerup', () => {
  const a = document.activeElement;
  if (a && a.matches('input[type="range"]')) a.blur();
});
document.addEventListener('change', e => { if (e.target.matches('select')) e.target.blur(); });
wrap.addEventListener('touchend', e => {
  if (!ts || e.touches.length) { ts = null; return; }
  const dx = e.changedTouches[0].clientX - ts.x, dy = e.changedTouches[0].clientY - ts.y;
  if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) go(cur + (dx < 0 ? 1 : -1));   // more sideways than up/down
  ts = null;
});
// mouse wheel / trackpad: one slide per gesture; momentum keeps the lock until the wheel goes quiet
let wheelAcc = 0, wheelLock = 0;
wrap.addEventListener('wheel', e => {
  if (root.classList.contains('flow') || e.ctrlKey) return;
  e.preventDefault();
  const now = Date.now();
  if (now < wheelLock) { wheelLock = Math.max(wheelLock, now + 180); return; }
  const k = e.deltaMode === 1 ? 33 : e.deltaMode === 2 ? 800 : 1;
  wheelAcc += (Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX) * k;
  if (Math.abs(wheelAcc) >= 50) { go(cur + (wheelAcc > 0 ? 1 : -1)); wheelAcc = 0; wheelLock = now + 450; }
}, { passive: false });
addEventListener('resize', layout);
addEventListener('hashchange', () => { const m = /^#s(\d+)$/.exec(location.hash); if (m) go(+m[1] - 1, true); });

safe(drawSpmt); safe(drawBoot);
slides.forEach(s => s.setAttribute('aria-hidden', 'true'));
layout();
setLang(lang);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(drawAll);
const m0 = /^#s(\d+)$/.exec(location.hash);
go(m0 ? +m0[1] - 1 : 0, true);
layout();
})();
