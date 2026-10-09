// The briefings listed on the portal (index.html). Text fields are triples [zh, en, ko].
// To add a briefing: make a folder with its index.html (README.md, "Adding a deck"), then add an entry here.
//   group            -> the shelf it appears on (GROUPS, in order); lead: true makes the card span the whole row
//   status 'live'    -> the card links to href
//   status 'planned' -> a placeholder card on the "Planned" shelf; give it a href once the folder exists and switch it to 'live'
window.GROUPS = [
  { id: 'thesis', title: ['博士论文：总览与分项研究', 'PhD thesis: overview and sub-studies', '박사 논문: 개요와 세부 연구'] },
  { id: 'papers', title: ['期刊论文', 'Journal papers', '학술지 논문'] },
];
window.DECKS = [
  {
    id: 'thesis', href: 'thesis/', status: 'live', group: 'thesis', lead: true,
    kind: ['博士学位论文 · 总览', 'PhD thesis · overview', '박사 학위 논문 · 개요'],
    title: ['船厂分段占路运输的运力机理与车队路网协同设计研究',
      'Road-occupying transport in shipyards: network-bound capacity and fleet–network co-design',
      '조선소 블록 점유 운송의 운송 능력 메커니즘과 차량군·도로망 협동 설계'],
    sub: ['载货车辆独占道路时，运力由什么决定？运力是一个区间：上沿由路网定，下沿由编排定。研究问题、论断与假设、已有结果、六项分研究的地图和计划。',
      'When loaded vehicles own the road, what sets capacity? Capacity is an interval: the network sets its upper edge, orchestration its lower. The question, claims and hypotheses, results so far, the map of six sub-studies and the plan.',
      '적재 차량이 도로를 독점할 때 운송 능력은 무엇이 정하는가? 운송 능력은 구간이며 상한은 도로망이, 하한은 편성이 정한다. 질문, 논제와 가설, 지금까지의 결과, 여섯 세부 연구의 지도와 계획.'],
    note: ['研究宣言 v1 · 2026 年 10 月', 'Manifesto v1 · October 2026', '연구 선언 v1 · 2026년 10월'],
  },
  {
    id: 'bound', href: 'bound/', status: 'live', group: 'thesis',
    kind: ['第 2–3 章 · 分研究', 'Ch. 2–3 · sub-study', '2–3장 · 세부 연구'],
    title: ['占路运输模型与路网上界', 'Occupancy model and network bounds', '점유 운송 모형과 도로망 상한'],
    sub: ['阻塞时间模型，与规则无关的路网上界 T1′：宽度装箱行、吊车行，两厂 17,760 个点无一超出；路线自由的 T1″ 计算中。',
      'The blocking-time model and the rule-free network bound T1′: width bin-packing and crane rows, never exceeded at 17,760 points in two yards; the route-free T1″ under way.',
      '차단 시간 모형과 규칙과 무관한 도로망 상한 T1′: 폭 빈 패킹 행과 크레인 행, 두 조선소 17,760개 점에서 초과 없음. 경로 자유 T1″ 계산 중.'],
    note: ['C1 · T1′ · T1″', 'C1 · T1′ · T1″', 'C1 · T1′ · T1″'],
  },
  {
    id: 'capacity', href: 'capacity/', status: 'live', group: 'thesis',
    kind: ['第 3 章 · 分研究', 'Ch. 3 · sub-study', '3장 · 세부 연구'],
    title: ['运力区间与路网约束区', 'Capacity interval and the network-bound regime', '운송 능력 구간과 도로망 제약 구간'],
    sub: ['立旗实验：自由流一路上升，占路运力落在 [最好的无死锁规则, T1′] 之内；约束区起点 K* 与全厂口径任务量。',
      'The flag experiment: free flow keeps rising while occupancy capacity stays within [best deadlock-free rule, T1′]; the regime start K* and whole-yard task volumes.',
      '깃발 실험: 자유류는 계속 오르고 점유 운송 능력은 [최선의 교착 없는 규칙, T1′] 안에 머문다. 제약 구간 시작 K*와 조선소 전체 작업량.'],
    note: ['C1 · C2 · H1 · H3', 'C1 · C2 · H1 · H3', 'C1 · C2 · H1 · H3'],
  },
  {
    id: 'dock', href: 'dock/', status: 'live', group: 'thesis',
    kind: ['第 3 章 · 分研究', 'Ch. 3 · sub-study', '3장 · 세부 연구'],
    title: ['坞口与搭载高峰', 'The dock mouth at erection peaks', '탑재 피크의 도크 입구'],
    sub: ['车在路外等，吊车排队不外传；在坞前道路上等，排队传到全网。坞前道路怎样分段，决定坞口是否拖住全厂。',
      'Waiting off-road keeps crane queues local; waiting on the dock road spreads them yard-wide. How the dock road is segmented decides whether the dock mouth holds up the yard.',
      '도로 밖에서 기다리면 크레인 대기열이 퍼지지 않고, 도크 도로에서 기다리면 전체로 퍼진다. 도크 도로를 어떻게 나누느냐가 도크 입구가 전체를 막는지를 정한다.'],
    note: ['H1 · H2 · 坞口命题', 'H1 · H2 · dock proposition', 'H1 · H2 · 도크 명제'],
  },
  {
    id: 'orchestration', href: 'orchestration/', status: 'live', group: 'thesis',
    kind: ['第 4 章 · 分研究', 'Ch. 4 · sub-study', '4장 · 세부 연구'],
    title: ['交通编排', 'Traffic orchestration', '교통 편성'],
    sub: ['无死锁的任务分派与通行编排：安全放行规则、分段闭塞与方向锁、精确模型与大邻域搜索（T5），把区间的下沿推向上沿。',
      'Deadlock-free assignment and passage ordering: a safe release rule, segmented blocking with direction locks, an exact model and neighbourhood search (T5), pushing the lower edge towards the upper.',
      '교착 없는 작업 배정과 통행 편성: 안전 출발 규칙, 방향 잠금이 있는 분할 폐색, 정확 모형과 이웃 탐색 (T5)으로 하한을 상한 쪽으로.'],
    note: ['C3 · H5 · T5', 'C3 · H5 · T5', 'C3 · H5 · T5'],
  },
  {
    id: 'codesign', href: 'codesign/', status: 'live', group: 'thesis',
    kind: ['第 5 章 · 分研究', 'Ch. 5 · sub-study', '5장 · 세부 연구'],
    title: ['车队与路网协同设计', 'Fleet–network co-design', '차량군·도로망 협동 설계'],
    sub: ['买车还是改路？一项改造值几台车：路—车汇率（T6）、控制粒度这种隐形运力，以及大车与组队的取舍（H7）。',
      'Buy vehicles or change roads? How many vehicles an upgrade is worth: the road–vehicle exchange rate (T6), control granularity as hidden capacity, and large units against teams (H7).',
      '차를 살까 도로를 고칠까? 개조 하나가 차량 몇 대 값인지: 도로–차량 환율 (T6), 숨은 능력인 제어 단위, 대형 차량과 결합 운반의 선택 (H7).'],
    note: ['C4 · H4 · H7 · T6', 'C4 · H4 · H7 · T6', 'C4 · H4 · H7 · T6'],
  },
  {
    id: 'multiyard', href: 'multiyard/', status: 'live', group: 'thesis',
    kind: ['第 6 章 · 分研究', 'Ch. 6 · sub-study', '6장 · 세부 연구'],
    title: ['多船厂检验', 'Testing across shipyards', '다수 조선소 검증'],
    sub: ['由地图直接算出的上界与取紧要素，能否跨船厂预测平台、K* 与改造价值；关键要素分类与留一法检验，目标 15 座公开布局。',
      'Whether the bound and binding elements computed from a map predict plateau, K* and upgrade value across yards; key-element types and leave-one-out tests on up to 15 public layouts.',
      '지도에서 계산한 상한과 빡빡한 요소가 조선소 간 평탄 구간, K*, 개조 가치를 예측하는지. 핵심 요소 분류와 하나 빼기 검증, 공개 배치 15곳 목표.'],
    note: ['C5 · H6', 'C5 · H6', 'C5 · H6'],
  },
  {
    id: 'fleet', href: 'fleet/', status: 'live', group: 'papers',
    kind: ['期刊论文 · 车队配置', 'Journal paper · fleet sizing', '학술지 논문 · 차량군 산정'],
    title: ['船厂分段运输车选型', 'Block Transporter Choice', '블록 트랜스포터 선정'],
    sub: ['几百吨的分段，用一台大车运，还是几台小车拼着运？同等服务水平下配车，并用招标价格计价。',
      'Carry a heavy hull block on one big transporter, or on several small ones coupled together? Fleets sized at equal service and priced from tender awards.',
      '수백 톤의 블록을 대형 한 대로 옮길까, 소형 여러 대를 결합해 옮길까? 같은 서비스 수준에서 차량군을 산정하고 낙찰가로 비용 계산.'],
    note: ['目标期刊：Ocean Engineering', 'Target journal: Ocean Engineering', '목표 학술지: Ocean Engineering'],
  },
  {
    id: 'seg', href: 'seg/', status: 'live', group: 'papers',
    kind: ['期刊论文 · 遥感分割', 'Journal paper · remote sensing', '학술지 논문 · 원격 탐사'],
    title: ['结构引导的跨船厂遥感影像语义分割', 'Structure-guided cross-site semantic segmentation of shipyard imagery', '구조 유도 조선소 간 원격 탐사 영상 의미 분할'],
    sub: ['在没见过的船厂上分出道路、堆场、厂房与背景；边界与区域两路约束只在训练时使用，部署模型不变。',
      'Roads, yards, buildings and background in shipyards the model never saw; boundary and region constraints are used in training only, so the deployed model is unchanged.',
      '처음 보는 조선소에서 도로, 야드, 건물, 배경을 구분하고, 경계·영역 제약은 학습에만 써서 배포 모형은 그대로다.'],
    note: ['Ocean Engineering 368 (2026) 128269', 'Ocean Engineering 368 (2026) 128269', 'Ocean Engineering 368 (2026) 128269'],
  },
];
