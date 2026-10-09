// The briefings listed on the portal (index.html). Text fields are triples [zh, en, ko].
// To add a briefing: make a folder with its index.html (README.md, "Adding a deck"), then add an entry here.
//   status 'live'    -> the card links to href
//   status 'planned' -> a placeholder card; give it a href once the folder exists and switch it to 'live'
window.DECKS = [
  {
    id: 'thesis', href: 'thesis/', status: 'live',
    kind: ['博士学位论文', 'PhD thesis', '박사 학위 논문'],
    title: ['船厂分段占路运输的运力机理与车队路网协同设计研究',
      'Road-occupying transport in shipyards: network-bound capacity and fleet–network co-design',
      '조선소 블록 점유 운송의 운송 능력 메커니즘과 차량군·도로망 협동 설계'],
    sub: ['载着分段的平板车不是在路上跑，而是把路占了：运力的天花板在路网，不在车队。',
      'A loaded transporter does not drive on the road; it owns the road. Capacity is capped by the network, not the fleet.',
      '블록을 실은 트랜스포터는 도로를 달리는 것이 아니라 도로를 점유한다. 운송 능력의 상한은 차량군이 아니라 도로망에 있다.'],
    note: ['研究进行中 · 2026 年 10 月', 'In progress · October 2026', '진행 중 · 2026년 10월'],
  },
  {
    id: 'fleet', href: 'fleet/', status: 'live',
    kind: ['期刊论文 · 车队配置', 'Journal paper · fleet sizing', '학술지 논문 · 차량군 산정'],
    title: ['船厂分段运输车选型', 'Block Transporter Choice', '블록 트랜스포터 선정'],
    sub: ['几百吨的分段，用一台大车运，还是几台小车拼着运？同等服务水平下配车，并用招标价格计价。',
      'Carry a heavy hull block on one big transporter, or on several small ones coupled together? Fleets sized at equal service and priced from tender awards.',
      '수백 톤의 블록을 대형 한 대로 옮길까, 소형 여러 대를 결합해 옮길까? 같은 서비스 수준에서 차량군을 산정하고 낙찰가로 비용 계산.'],
    note: ['目标期刊：Ocean Engineering', 'Target journal: Ocean Engineering', '목표 학술지: Ocean Engineering'],
  },
  {
    id: 'seg', href: 'seg/', status: 'live',
    kind: ['期刊论文 · 遥感分割', 'Journal paper · remote sensing', '학술지 논문 · 원격 탐사'],
    title: ['结构引导的跨船厂遥感影像语义分割', 'Structure-guided cross-site semantic segmentation of shipyard imagery', '구조 유도 조선소 간 원격 탐사 영상 의미 분할'],
    sub: ['在没见过的船厂上分出道路、堆场、厂房与背景；边界与区域两路约束只在训练时使用，部署模型不变。',
      'Roads, yards, buildings and background in shipyards the model never saw; boundary and region constraints are used in training only, so the deployed model is unchanged.',
      '처음 보는 조선소에서 도로, 야드, 건물, 배경을 구분하고, 경계·영역 제약은 학습에만 써서 배포 모형은 그대로다.'],
    note: ['Ocean Engineering 368 (2026) 128269', 'Ocean Engineering 368 (2026) 128269', 'Ocean Engineering 368 (2026) 128269'],
  },
  {
    id: 'ch3', status: 'planned',
    kind: ['第 3 章 · 运力机理', 'Chapter 3 · capacity', '3장 · 운송 능력'],
    title: ['当平板车占住道路：路网约束运力与拥塞', 'When transporters own the road: network-bound capacity and jamming', '트랜스포터가 도로를 점유할 때: 도로망 제약 운송 능력과 정체'],
    sub: ['双上界、梯形律、自由流误差与非单调性（定理 T1–T4）。', 'Two upper bounds, the trapezoid law, free-flow error and non-monotonicity (T1–T4).', '이중 상한, 사다리꼴 법칙, 자유류 오차, 비단조성 (정리 T1–T4).'],
  },
  {
    id: 'ch4', status: 'planned',
    kind: ['第 4 章 · 交通编排', 'Chapter 4 · orchestration', '4장 · 교통 편성'],
    title: ['无死锁的任务分派与通行编排', 'Deadlock-free task assignment and traffic orchestration', '교착 없는 작업 배정과 통행 편성'],
    sub: ['精确模型、大邻域搜索与可证明安全的预约策略（T5）。', 'Exact model, large-neighbourhood search and a provably safe reservation policy (T5).', '정확 모형, 대규모 이웃 탐색, 안전성이 증명된 예약 정책 (T5).'],
  },
  {
    id: 'ch5', status: 'planned',
    kind: ['第 5 章 · 协同设计', 'Chapter 5 · co-design', '5장 · 협동 설계'],
    title: ['一处会车点值不值一台车？', 'Is a passing bay worth a transporter?', '대피 구간 하나가 트랜스포터 한 대의 가치가 있을까?'],
    sub: ['路—车汇率（T6）、关键路段识别与车队路网协同设计。', 'The road–vehicle exchange rate (T6), critical links and fleet–network co-design.', '도로–차량 환율 (T6), 핵심 구간 식별, 차량군·도로망 협동 설계.'],
  },
  {
    id: 'ch6', status: 'planned',
    kind: ['第 6 章 · 多船厂检验', 'Chapter 6 · many yards', '6장 · 다수 조선소 검증'],
    title: ['拥塞阈值能否跨船厂迁移？', 'Do jamming thresholds transfer across shipyards?', '정체 임계값은 조선소 사이에 옮겨질까?'],
    sub: ['15 座公开船厂布局上的拥塞阈值、改造价值与拓扑预测。', 'Jamming thresholds, upgrade values and topological predictors on 15 public layouts.', '공개 조선소 배치 15곳에서 정체 임계값, 개조 가치, 위상 예측.'],
  },
];
