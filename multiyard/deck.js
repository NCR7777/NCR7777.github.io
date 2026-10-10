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
  tMap: ['地图版本（结果所用）', 'Map version (of these results)', '지도 버전 (이 결과 기준)'],
  mapY: ['加浮坞与支路前', 'before floating docks, spurs', '플로팅 도크·지선 추가 전'], mapT: ['补上第二个门后', 'after the second door', '두 번째 문 추가 후'],
  tSys: ['系统上界（个/日；括号为 10 个种子均值）', 'System bound (a day; 10-seed mean in brackets)', '시스템 상한 (하루, 괄호는 시드 10개 평균)'],
  tInt: ['运力区间 [最好的无死锁规则, 路网上界]', 'Capacity interval [best deadlock-free rule, bound]', '운송 능력 구간 [최선의 교착 없는 규칙, 도로망 상한]'],
  tShare: ['预约平台 ÷ 系统上界', 'Reservation plateau ÷ system bound', '예약 평탄 ÷ 시스템 상한'],
  tK: ['K*(20%)（区间）', 'K*(20%) (range)', 'K*(20%) (구간)'],
  tBind: ['路网上界的取紧要素（10 个种子中的次数）', 'Where the bound binds (of 10 seeds)', '도로망 상한 구속 요소 (시드 10개 중)'],
  bindT: ['涂装厂房的两个门 ×{a} · 另一座厂房的门 ×{b}', "two paint-shop doors ×{a} · another shop's door ×{b}", '도장 공장 두 문 ×{a} · 다른 공장 문 하나 ×{b}'],
  // map elements named by role (no element numbers on screen)
  eDock1: ['1 号坞前道路', 'dock-1 road', '1도크 앞 도로'], eCorr: ['贯通走廊', 'through corridor', '관통 회랑'],
  eWide: ['18 m 宽道路', '18 m road', '폭 18 m 도로'], eDockT: ['坞前停靠路段', 'dock stopping road', '도크 앞 정차 도로'],
  tCat: ['类别', 'Type', '유형'], catY: ['坞前单车道型', 'dock-road single-lane', '도크 앞 단일 차로형'], catT: ['门口型', 'door type', '출입문형'],
  tThr: ['坞口阈值（安全放行·整段，K = 20 → 150）', 'Dock threshold (safe release, whole road, K = 20 → 150)', '도크 임계값 (안전 출발·구간 전체, K = 20 → 150)'],
  tDens: ['本厂日任务量 ÷ 系统上界（日均–高峰）', "Own daily tasks ÷ system bound (mean–peak)", '자체 하루 작업량 ÷ 시스템 상한 (평균–피크)'],
  densV: ['{a}–{b} 个：{c}–{d}', '{a}–{b}: {c}–{d}', '{a}–{b}건: {c}–{d}'],
  tNeed: ['本厂日均所需车数（16 h · 预约）对 K*', 'Vehicles needed at own mean (16 h, reservation) vs K*', '자체 평균 필요 차량 (16시간·예약) 대 K*'],
  // topology table
  tRoads: ['道路 / 中心线', 'Roads / centreline', '도로 / 중심선'], tJun: ['路口资源 / 入口 / 停靠点', 'Junctions / entrances / stops', '교차로 / 출입구 / 정차 지점'],
  tCyc: ['独立环路 μ / meshedness α', 'Independent cycles μ / meshedness α', '독립 순환 μ / meshedness α'],
  tCut: ['坞向瓶颈断面（路宽之和）', 'Dock-bound minimum cut (sum of widths)', '도크 방향 최소 절단 (도로 폭 합)'],
  tEntry: ['坞口入口度（最大）', 'Dock entry degree (max)', '도크 입구 차수 (최대)'],
  oT1t: ['→ 系统上界（个/日）', '→ system bound (a day)', '→ 시스템 상한 (하루)'], oBind: ['→ 取紧要素', '→ binding element', '→ 구속 요소'],
  oK: ['→ K*(20%)', '→ K*(20%)', '→ K*(20%)'], oPlat: ['→ 预约平台（个/日）', '→ reservation plateau (a day)', '→ 예약 평탄 (하루)'],
  // density chart
  dLbl: ['日任务量与系统上界之比', 'Daily tasks as a share of the system bound', '하루 작업량과 시스템 상한의 비'],
  dX: ['日任务量 ÷ 系统上界', 'Daily tasks ÷ system bound', '하루 작업량 ÷ 시스템 상한'],
  dYo: ['烟台 · 本厂 {d}/日', 'Yantai · own {d}/day', '옌타이 · 자체 {d}/일'], dYp: ['烟台 · 高峰 {d}/日', 'Yantai · peak {d}/day', '옌타이 · 피크 {d}/일'],
  dOo: ['玉浦 · 本厂 {d}/日', 'Okpo · own {d}/day', '옥포 · 자체 {d}/일'], dOp: ['玉浦 · 高峰 {d}/日', 'Okpo · peak {d}/day', '옥포 · 피크 {d}/일'],
  dOw: ['公开量级 {a}–{b}/日', 'Public scale {a}–{b}/day', '공개 규모 {a}–{b}/일'],
  dOwn: ['本厂口径：同法折算（钢材 ÷ 100 t × 10 次 ÷ 300 日），高峰 × 2', 'own caliber: same folding (steel ÷ 100 t × 10 moves ÷ 300 days), peak × 2', '자체 기준: 같은 환산 (강재 ÷ 100 t × 10회 ÷ 300일), 피크 × 2'],
  dWhole: ['韩国大型厂的公开量级，不是玉浦本厂（Yim 2008；Shen 等 2018）', 'public scale of large Korean yards, not Okpo itself (Yim 2008; Shen et al. 2018)', '한국 대형 조선소 공개 규모, 옥포 자체 아님 (Yim 2008; Shen 외 2018)'],
  dTip: ['{n}：{d} 个/日 ÷ 系统上界 {t} = {v}', '{n}: {d} a day ÷ system bound {t} = {v}', '{n}: 하루 {d}건 ÷ 시스템 상한 {t} = {v}'],
  // LOO chart
  lLbl: ['系统上界与预约平台', 'System bound against reservation plateau', '시스템 상한과 예약 평탄 구간'],
  lX: ['系统上界（个/日）', 'System bound (a day)', '시스템 상한 (하루)'], lY: ['预约平台（个/日）', 'Reservation plateau (a day)', '예약 평탄 (하루)'],
  lEq: ['平台 = 上界：上界取紧', 'plateau = bound: the bound binds', '평탄 = 상한: 상한이 구속'],
  lRatio: ['{y}的比例 {r}', '{y} ratio {r}', '{y} 비율 {r}'],
  lOne: ['烟台 · 单门设定', 'Yantai, one door', '옌타이 · 문 하나'],
  lDoor: ['补上第二个门', 'second door added', '두 번째 문 추가'],
  lPred: ['留一法预测', 'leave-one-out prediction', '하나 빼기 예측'],
  lTip: ['{y}：系统上界 {t}，平台 {p}，比例 {r}', '{y}: system bound {t}, plateau {p}, ratio {r}', '{y}: 시스템 상한 {t}, 평탄 {p}, 비율 {r}'],
  lTipP: ['用{o}的比例预测{y}：{p}（实际 {a}，{e}）', '{y} predicted from the {o} ratio: {p} (actual {a}, {e})', '{o} 비율로 예측한 {y}: {p} (실제 {a}, {e})'],
  lTip1: ['单门设定（10 个种子均值）：上界 {t}，平台 {p}，比例 {r}', 'one-door setting (10-seed mean): bound {t}, plateau {p}, ratio {r}', '문 하나 설정 (시드 10개 평균): 상한 {t}, 평탄 {p}, 비율 {r}'],
  sShare: ['预约平台 ÷ 系统上界：玉浦 / 烟台', 'Reservation plateau ÷ system bound: Okpo / Yantai', '예약 평탄 ÷ 시스템 상한: 옥포 / 옌타이'],
  sErr: ['用一厂的比例预测另一厂平台的误差（按 10 个种子的抽样上界为 ±{s}）', "Error when one yard's ratio predicts the other's plateau (±{s} with the 10-seed sampled bound)", '한 조선소의 비율로 다른 조선소 평탄을 예측한 오차 (시드 10개 표본 상한으로는 ±{s})'],
  sDoor: ['烟台涂装厂房补上第二个门前后（10 个种子均值）：上界 {a} → {b}，平台 {c} → {d}', "Yantai before and after the paint shop's second door (10-seed mean): bound {a} → {b}, plateau {c} → {d}", '옌타이 도장 공장 두 번째 문 추가 전후 (시드 10개 평균): 상한 {a} → {b}, 평탄 {c} → {d}'],
  // binding-resource readings (T23)
  bLbl: ['上界中的路线余量（按取紧资源）', 'Route slack in the bound, by binding resource', '상한의 경로 여유 (구속 자원별)'],
  bX: ['上界中的路线余量（下限；细线到上限）', 'Route slack in the bound (lower; thin line to upper)', '상한의 경로 여유 (하한, 가는 선은 상한까지)'],
  bMain: ['主情景', 'main', '주 시나리오'], bErect: ['搭载组合', 'erection mix', '탑재 조합'], bCrane: ['吊车节拍', 'crane cadence', '크레인 박자'],
  bGate: ['入口', 'Entrance', '출입구'], bDock: ['坞的停靠路段', 'Dock stopping road', '도크 정차 도로'], bCorr: ['贯通走廊', 'Through corridor', '관통 회랑'],
  bPass: ['路过 {p}', 'through {p}', '통과 {p}'],
  bTip: ['{y} · {s}：{n}；其上载货流 {f} 个/日，路过 {p}；路线余量 {lo}（上限 {hi}）', '{y} · {s}: {n}; {f} loaded moves a day, {p} through traffic; route slack {lo} (upper {hi})', '{y} · {s}: {n}, 적재 흐름 하루 {f}건, 통과 {p}, 경로 여유 {lo} (상한 {hi})'],
  bAlt: ['；绕开它的路线剩 {a} 的占用余量、平均多走 {m} m', '; its detours keep {a} spare occupancy and add {m} m on average', ', 우회로는 점유 여유 {a}, 평균 {m} m 추가'],
  door14: ['涂装厂房的一个门', 'a paint-shop door', '도장 공장 문 하나'],
  // thresholds by K (T22)
  kLbl: ['坞口阈值随车数', 'Dock threshold against fleet size', '차량 수에 따른 도크 임계값'],
  kX: ['车数 K', 'Fleet size K', '차량 수 K'], kY: ['阈值 ρ（降幅首次达 10%）', 'Threshold ρ (first 10% drop)', '임계값 ρ (처음 10% 감소)'],
  kWhole: ['整段', 'whole road', '구간 전체'], kStops: ['分段闭塞', 'blocks', '분할 폐색'],
  kRes: ['整条路径预约：两厂、两种粒度、每个 K 都不降（最大降幅 {m}）', 'Whole-route reservation: no drop on either yard, granularity or K (largest drop {m})', '전체 경로 예약: 두 조선소, 두 세분도, 모든 K에서 감소 없음 (최대 감소 {m})'],
  kTip: ['{y} · {g} · K = {k}：阈值 {v}{s}', '{y} · {g} · K = {k}: threshold {v}{s}', '{y} · {g} · K = {k}: 임계값 {v}{s}'],
  kNs: ['（用到的点有不稳态的）', ' (uses non-steady points)', ' (불안정 점 포함)'],
  kOpen: ['空心 = 用到不稳态的点', 'hollow = uses non-steady points', '빈 표시 = 불안정 점 포함'],
  // H1 sides (T22 §6–7)
  hLbl: ['全厂口径的所需车数对 K*', 'Vehicles needed at whole-yard volumes against K*', '전체 조선소 기준 필요 차량 대 K*'],
  hX: ['所需车数（台；○ 自由流 → ● 整条路径预约）', 'Vehicles needed (○ free flow → ● whole-route reservation)', '필요 차량 (○ 자유류 → ● 전체 경로 예약)'],
  hYo: ['烟台 · 本厂 {n}/日 · {d} h', 'Yantai · own {n}/day · {d} h', '옌타이 · 자체 {n}/일 · {d}시간'],
  hYp: ['烟台 · 高峰 {n}/日 · {d} h', 'Yantai · peak {n}/day · {d} h', '옌타이 · 피크 {n}/일 · {d}시간'],
  hYw: ['烟台 · 按 {n}/日 · {d} h', 'Yantai · at {n}/day · {d} h', '옌타이 · {n}/일 가정 · {d}시간'],
  hOo: ['玉浦 · 本厂 {n}/日 · {d} h', 'Okpo · own {n}/day · {d} h', '옥포 · 자체 {n}/일 · {d}시간'],
  hOp: ['玉浦 · 高峰 {n}/日 · {d} h', 'Okpo · peak {n}/day · {d} h', '옥포 · 피크 {n}/일 · {d}시간'],
  hH: ['现代重工 {n}/日 · {d} h', 'Hyundai Heavy {n}/day · {d} h', '현대중공업 {n}/일 · {d}시간'],
  hS: ['韩国某大厂 {n}/日 · {d} h', 'Large Korean yard {n}/day · {d} h', '한국 대형 조선소 {n}/일 · {d}시간'],
  hBand: ['K* 区间', 'K* range', 'K* 구간'], hField: ['现实车队', 'real fleet', '실제 차량군'],
  hIn: ['≥ K*', '≥ K*', '≥ K*'], hOut: ['< K*', '< K*', '< K*'], hNear: ['≈ K*', '≈ K*', '≈ K*'],
  hTip: ['{c}：自由流 {f} 台 → 预约 {r} 台；K* {k}', '{c}: free flow {f} → reservation {r}; K* {k}', '{c}: 자유류 {f}대 → 예약 {r}대, K* {k}'],
  hTipF: ['；现实车队 {v} 台', '; real fleet {v}', ', 실제 차량군 {v}대'],
  // review chart
  rLbl: ['关键要素复核前后的路网上界', 'The network bound before and after the key-element review', '핵심 요소 검토 전후의 도로망 상한'],
  rX: ['路网上界（个/日，10 个种子均值）', 'Network bound (a day, mean of 10 seeds)', '도로망 상한 (하루, 시드 10개 평균)'],
  rYm: ['玉浦 · 主情景', 'Okpo · main mix', '옥포 · 주 시나리오'], rYe: ['玉浦 · 搭载组合（搭载占 15%）', 'Okpo · erection mix (15% erection)', '옥포 · 탑재 조합 (탑재 15%)'],
  rT: ['烟台 · 主情景', 'Yantai · main mix', '옌타이 · 주 시나리오'],
  rBef: ['复核前：1 号坞前道路整段一个资源', 'before: the dock-1 road as one resource', '검토 전: 1도크 앞 도로 전체가 자원 하나'],
  rAft: ['复核后：按停靠点分段闭塞', 'after: blocks split at its stops', '검토 후: 정차 지점별 분할 폐색'],
  rBefT: ['复核前：涂装厂房一个门', 'before: the paint shop with one door', '검토 전: 도장 공장 문 하나'],
  rAftT: ['复核后：两个门（与影像相符）', 'after: two doors (as on imagery)', '검토 후: 문 두 개 (영상과 일치)'],
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
const pct = v => (v < 0.1 && v > 0 ? (100 * v).toFixed(1) : Math.round(100 * v)) + '%';
const pct1 = v => (100 * v).toFixed(1) + '%';
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
// display names of the binding elements in data.js, keyed by yard and element number
const ELEM = { 'yupu|161': 'eDock1', 'yupu|010-6': 'eCorr', 'yupu|026': 'eWide', 'yantai|007': 'eDockT' };
const elem = (y, name) => t(ELEM[y + '|' + name.match(/\d{3}(?:-\d+)?/)[0]]);
const range = (a, b, st) => { const r = []; for (let v = a; v <= b + 1e-9; v += st) r.push(+v.toFixed(6)); return r; };
const txt = (s, x, y, str, style = '', anchor = 'start') => el('text', { x, y, 'text-anchor': anchor, style }, s, str);
const HALO = ';paint-order:stroke;stroke:var(--paper);stroke-width:4px;stroke-linejoin:round';
const sysT = y => Y[y].T1sys.main;

// ---------- daily tasks against the system T1′ (H1's density criterion), both yards ----------
function drawDensity() {
  const W = 470, H = fitH('cDens', W, 300, 0.8, 1.4), m = { l: 150, r: 64, t: 8, b: 40 };
  const s = frame('cDens', W, H, t('dLbl'));
  const x = lin(0, 0.5, m.l, W - m.r);
  const [w0, w1] = D.wholeYard;
  const rows = [
    { k: 'dYo', d: Y.yantai.demand[0], y: 'yantai' },
    { k: 'dYp', d: Y.yantai.demand[1], y: 'yantai', pk: 1 },
    { k: 'dOo', d: Y.yupu.demand[0], y: 'yupu' },
    { k: 'dOp', d: Y.yupu.demand[1], y: 'yupu', pk: 1 },
    { k: 'dOw', d: [w0, w1], y: 'yupu', whole: 1 },
  ];
  const band = (H - m.t - m.b) / rows.length, bh = Math.min(22, band * 0.5);
  const g = el('g', { class: 'grid' }, s);
  range(0, 0.5, 0.1).forEach(v => { el('line', { x1: x(v), x2: x(v), y1: m.t, y2: H - m.b }, g); txt(s, x(v), H - m.b + 16, Math.round(100 * v) + '%', '', 'middle'); });
  txt(s, (m.l + W - m.r) / 2, H - 6, t('dX'), '', 'middle');
  rows.forEach((r, i) => {
    const cy = m.t + band * (i + 0.5), tb = sysT(r.y), c = C[r.y];
    const lo = (r.whole ? r.d[0] : r.d) / tb, hi = (r.whole ? r.d[1] : r.d) / tb;
    txt(s, m.l - 8, cy + 4, r.whole ? fmt(t(r.k), { a: r.d[0], b: r.d[1] }) : fmt(t(r.k), { d: r.d }), 'fill:var(--ink)', 'end');
    const x0 = r.whole ? x(lo) : x(0);
    const bar = anim(el('rect', { x: x0, y: cy - bh / 2, width: Math.max(2, x(hi) - x0), height: bh, rx: 2,
      style: r.whole ? `fill:url(#hatch);stroke:${c};stroke-width:1.4;stroke-dasharray:4 3` : `fill:${c};opacity:${r.pk ? 0.5 : 0.95}` }, s), 'a-fade', 0.2 + 0.12 * i);
    txt(s, x(hi) + 6, cy + 4, r.whole ? `${pct(lo)}–${pct(hi)}` : pct(hi), `fill:${c};font-weight:600`);
    hover(bar, () => r.whole ? `${fmt(t(r.k), { a: r.d[0], b: r.d[1] })}<br>${t('dWhole')}`
      : fmt(t('dTip'), { n: t(r.y), d: r.d, t: f0(tb), v: pct(hi) }) + `<br>${t('dOwn')}`);
  });
  el('path', { d: `M${m.l} ${m.t}V${H - m.b}`, style: 'stroke:var(--ink3)' }, s);
  swatches('lgDens', [[C.yantai, t('yantai')], [C.yupu, t('yupu')], ['url(#hatch)', t('dWhole'), 'border:1px dashed var(--steel);background:repeating-linear-gradient(45deg,transparent 0 3px,var(--ink3) 3px 4px)']]);
}

// ---------- leave-one-out on two yards: system T1′ against the reservation plateau ----------
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
  ['yupu', 'yantai'].forEach((yd, i) => {
    const r = D.loo[yd].ratio;
    anim(el('path', { d: `M${x(0)} ${y(0)}L${x(2000)} ${y(2000 * r)}`, pathLength: 1, style: `stroke:${C[yd]};stroke-width:1.6;stroke-dasharray:7 5;fill:none;opacity:.8` }, cg), 'a-draw', 0.2 + 0.2 * i);
  });
  const ry = y(1900 * D.loo.yupu.ratio);
  txt(s, x(1990), ry - 32, fmt(t('lRatio'), { y: t('yupu'), r: pct(D.loo.yupu.ratio) }), `fill:${C.yupu};font-weight:600;font-size:12.5px`, 'end');
  txt(s, x(1990), ry - 14, fmt(t('lRatio'), { y: t('yantai'), r: pct(D.loo.yantai.ratio) }), `fill:${C.yantai};font-weight:600;font-size:12.5px`, 'end');
  // Yantai with one door at building 014 (10-seed mean), and the move once the second door is in
  const one = Y.yantai.oneDoor, yt = Y.yantai;
  const p1 = [x(one.T1t), y(one.plateau)], p2 = [x(sysT('yantai')), y(yt.plateau.reserve)];
  anim(el('path', { d: `M${p1[0] + 9} ${p1[1]}L${p2[0] - 12} ${p2[1]}`, style: 'stroke:var(--amber);stroke-width:1.4;fill:none;marker-end:url(#arLoo)' }, s), 'a-fade', 1.1);
  const mk = el('marker', { id: 'arLoo', viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, el('defs', {}, s));
  el('path', { d: 'M0 0L10 5L0 10Z', style: 'fill:var(--amber)' }, mk);
  txt(s, (p1[0] + p2[0]) / 2 + 10, p1[1] - 12, t('lDoor'), 'fill:var(--amber);font-size:12.5px' + HALO, 'middle');
  const c1 = anim(el('circle', { cx: p1[0], cy: p1[1], r: 6, style: 'fill:var(--paper);stroke:var(--amber);stroke-width:2' }, s), 'a-pop', 0.9);
  txt(s, p1[0] + 4, p1[1] + 24, t('lOne'), 'fill:var(--ink2);font-size:12.5px' + HALO, 'middle');
  hover(c1, () => fmt(t('lTip1'), { t: f0(one.T1t), p: f0(one.plateau), r: pct(one.plateau / one.T1t) }));
  [['yupu', 'yantai'], ['yantai', 'yupu']].forEach(([yd, other], i) => {
    const v = Y[yd], L = D.loo[yd], cx = x(sysT(yd));
    const pd = anim(el('path', { d: `M${cx} ${y(L.pred) - 9}L${cx + 9} ${y(L.pred)}L${cx} ${y(L.pred) + 9}L${cx - 9} ${y(L.pred)}Z`, style: 'fill:none;stroke:var(--ink);stroke-width:1.4' }, s), 'a-pop', 1.3 + 0.1 * i);
    hover(pd, () => fmt(t('lTipP'), { y: t(yd), o: t(other), p: f0(L.pred), a: f0(v.plateau.reserve), e: (L.err > 0 ? '+' : '') + pct1(L.err) }));
    const c = anim(el('circle', { cx, cy: y(v.plateau.reserve), r: 6.5, style: `fill:${C[yd]};stroke:var(--paper);stroke-width:1.5` }, s), 'a-pop', 0.9 + 0.2 * i);
    hover(c, () => fmt(t('lTip'), { y: t(yd), t: f0(sysT(yd)), p: f0(v.plateau.reserve), r: pct(L.ratio) }));
    txt(s, cx + 12, y(v.plateau.reserve) + 24, t(yd), `fill:${C[yd]};font-weight:700;font-size:14px` + HALO);
  });
  swatches('lgLoo', [[C.yupu, t('yupu')], [C.yantai, t('yantai')], ['transparent', `◇ ${t('lPred')}`, 'width:0;border:0'], ['transparent', `○ ${t('lOne')}`, 'width:0;border:0']]);
  const errS = Math.max(Math.abs(D.looSample.yupu.err), Math.abs(D.looSample.yantai.err));
  $('looRead').innerHTML = [
    [`${pct(D.loo.yupu.ratio)}<small>/ ${pct(D.loo.yantai.ratio)}</small>`, t('sShare')],
    [`±${pct1(Math.max(Math.abs(D.loo.yupu.err), Math.abs(D.loo.yantai.err)))}`, fmt(t('sErr'), { s: pct1(errS) })],
    [pct(one.plateau / one.T1t) + ' → ' + pct(D.looSample.yantai.ratio), fmt(t('sDoor'), { a: f0(one.T1t), b: f0(yt.T1t[0]), c: f0(one.plateau), d: f0(yt.plateau.reserve) })],
  ].map(([n, p]) => `<div class="stat"><span class="num">${n}</span><p>${p}</p></div>`).join('');
}

// ---------- three readings of the binding resource (T23): route slack in the bound ----------
function drawSlack() {
  const W = 560, H = fitH('cSlack', W, 340, 0.85, 1.4), m = { l: 176, r: 150, t: 22, b: 40 };
  const s = frame('cSlack', W, H, t('bLbl'));
  const x = lin(0, 0.5, m.l, W - m.r);
  const SC = { main: 'bMain', erection: 'bErect', crane: 'bCrane' };
  const pick = (y, sc) => ({ y, ...Y[y].slack.find(e => e.scen === sc) });
  const groups = [
    { k: 'bGate', c: 'var(--amber-hi)', rows: [pick('yantai', 'main'), pick('yantai', 'crane')] },
    { k: 'bDock', c: 'var(--steel)', rows: [pick('yupu', 'main'), pick('yupu', 'erection'), pick('yantai', 'erection')] },
    { k: 'bCorr', c: 'var(--oxide)', rows: [pick('yupu', 'crane')] },
  ];
  const n = groups.reduce((a, g) => a + g.rows.length, 0), gap = 20, band = (H - m.t - m.b - gap * (groups.length - 1)) / n, bh = Math.min(16, band * 0.55);
  const g0 = el('g', { class: 'grid' }, s);
  range(0, 0.5, 0.1).forEach(v => { el('line', { x1: x(v), x2: x(v), y1: m.t, y2: H - m.b }, g0); txt(s, x(v), H - m.b + 16, Math.round(100 * v) + '%', '', 'middle'); });
  txt(s, (m.l + W - m.r) / 2, H - 6, t('bX'), '', 'middle');
  const short = r => r.type === '入口' ? t('door14') : elem(r.y, r.name);
  let yy = m.t, i = 0;
  groups.forEach(gr => {
    txt(s, 4, yy - 6, t(gr.k), `fill:${gr.c};font-weight:700;font-size:13px`);
    gr.rows.forEach(r => {
      const cy = yy + band / 2;
      txt(s, m.l - 8, cy + 4, `${t(r.y)} · ${t(SC[r.scen])}`, 'fill:var(--ink)', 'end');
      el('path', { d: `M${x(r.lo)} ${cy}H${x(r.hi)}`, style: `stroke:${gr.c};stroke-width:2` }, s);
      el('path', { d: `M${x(r.hi)} ${cy - 5}V${cy + 5}`, style: `stroke:${gr.c};stroke-width:2` }, s);
      const b = anim(el('rect', { x: x(0), y: cy - bh / 2, width: Math.max(2, x(r.lo) - x(0)), height: bh, rx: 2, style: `fill:${gr.c}` }, s), 'a-fade', 0.2 + 0.1 * i);
      txt(s, x(r.hi) + 7, cy + 4, r.lo > 0 ? `+${pct1(r.lo)}` : '0', `fill:${gr.c};font-weight:700`);
      txt(s, W - 4, cy + 4, fmt(t('bPass'), { p: pct(r.pass) }), 'fill:var(--ink2);font-size:12.5px', 'end');
      hover(b, () => fmt(t('bTip'), { y: t(r.y), s: t(SC[r.scen]), n: short(r), f: f0(r.flow), p: pct1(r.pass), lo: `+${pct1(r.lo)}`, hi: `+${pct1(r.hi)}` })
        + (r.alt != null ? fmt(t('bAlt'), { a: pct(r.alt), m: r.extra }) : ''));
      yy += band; i++;
    });
    yy += gap;
  });
  el('path', { d: `M${m.l} ${m.t}V${H - m.b}`, style: 'stroke:var(--ink3)' }, s);
}

// ---------- dock threshold by K (T22): safe release without teleport, both yards, whole road and blocks ----------
function drawThr() {
  const W = 560, H = fitH('cThr', W, 360, 0.85, 1.4), m = { l: 60, r: 18, t: 40, b: 46 };
  const s = frame('cThr', W, H, t('kLbl'));
  const x = lin(0, 160, m.l, W - m.r), y = lin(0.3, 1.0, H - m.b, m.t);
  const g = el('g', { class: 'grid' }, s), a = el('g', { class: 'axis' }, s);
  range(0.3, 1.0, 0.1).forEach(v => { el('line', { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v) }, g); txt(s, m.l - 8, y(v) + 4, v.toFixed(1), '', 'end'); });
  [20, 40, 60, 100, 150].forEach(v => txt(s, x(v), H - m.b + 17, v, '', 'middle'));
  el('path', { d: `M${m.l} ${m.t}V${H - m.b}H${W - m.r}` }, a);
  txt(s, (m.l + W - m.r) / 2, H - 6, t('kX'), '', 'middle');
  yTitle(s, 14, (m.t + H - m.b) / 2, t('kY'));
  const worst = Math.min(...['yupu', 'yantai'].flatMap(yd => [D.thr[yd]['reserve|whole'], D.thr[yd]['reserve|stops']]));
  txt(s, m.l + 4, m.t - 16, fmt(t('kRes'), { m: `${Math.abs(worst).toFixed(1)}%` }), 'fill:var(--good);font-size:12.5px;font-weight:600');
  let i = 0;
  ['yupu', 'yantai'].forEach(yd => ['whole', 'stops'].forEach(sec => {
    const pts = D.thr[yd][`safe|${sec}`].filter(p => p[1] != null), c = C[yd], dash = sec === 'stops' ? '6 4' : '';
    anim(el('path', { d: pts.map((p, j) => `${j ? 'L' : 'M'}${x(p[0])} ${y(p[1])}`).join(''),
      style: `fill:none;stroke:${c};stroke-width:2;${dash ? `stroke-dasharray:${dash}` : ''}` }, s), 'a-fade', 0.2 + 0.2 * i);
    pts.forEach(p => {
      const dot = anim(el('circle', { cx: x(p[0]), cy: y(p[1]), r: 5, style: p[2] ? `fill:${c};stroke:var(--paper);stroke-width:1.5` : `fill:var(--paper);stroke:${c};stroke-width:2` }, s), 'a-pop', 0.6 + 0.2 * i);
      hover(dot, () => fmt(t('kTip'), { y: t(yd), g: t(sec === 'whole' ? 'kWhole' : 'kStops'), k: p[0], v: p[1].toFixed(2), s: p[2] ? '' : t('kNs') }));
    });
    const last = pts[pts.length - 1];
    txt(s, x(last[0]) - 10, y(last[1]) + (sec === 'whole' ? 20 : -12), `${t(yd)} · ${t(sec === 'whole' ? 'kWhole' : 'kStops')}`, `fill:${c};font-size:12.5px;font-weight:600` + HALO, 'end');
    i++;
  }));
  swatches('lgThr', [[C.yupu, t('yupu')], [C.yantai, t('yantai')], ['transparent', `— ${t('kWhole')} · - - ${t('kStops')}`, 'width:0;border:0'], ['transparent', `○ ${t('kOpen')}`, 'width:0;border:0']]);
}

// ---------- H1: vehicles needed at whole-yard volumes against K* (T22 §6–7) ----------
function drawH1() {
  const W = 620, H = fitH('cH1', W, 420, 0.85, 1.35), m = { l: 196, r: 70, t: 10, b: 44 };
  const s = frame('cH1', W, H, t('hLbl'));
  const x = lin(0, 130, m.l, W - m.r);
  const R = D.h1, grp = r => r.field ? 2 : r.yard === 'yantai' ? 0 : 1, gap = 14;
  const band = (H - m.t - m.b - 2 * gap) / R.length, bh = Math.min(14, band * 0.5);
  const g = el('g', { class: 'grid' }, s);
  range(0, 120, 20).forEach(v => { el('line', { x1: x(v), x2: x(v), y1: m.t, y2: H - m.b }, g); txt(s, x(v), H - m.b + 16, v, '', 'middle'); });
  txt(s, (m.l + W - m.r) / 2, H - 6, t('hX'), '', 'middle');
  R.forEach((r, i) => {
    const cy = m.t + band * (i + 0.5) + gap * grp(r), c = C[r.yard], ks = Y[r.yard].Kstar20, kLo = ks[1], kHi = ks[2];
    // K* range of this row's yard: a shaded band
    el('rect', { x: x(kLo) - 3, y: cy - band / 2 + 1, width: Math.max(6, x(kHi) - x(kLo) + 6), height: band - 2, style: 'fill:var(--oxide-soft);stroke:var(--oxide);stroke-width:1;stroke-dasharray:3 3;stroke-opacity:.6' }, s);
    txt(s, m.l - 8, cy + 4, fmt(t(r.k), { n: r.n, d: r.day }), `fill:var(--ink)${r.field ? ';font-style:italic' : ''}`, 'end');
    anim(el('path', { d: `M${x(r.free)} ${cy}H${x(r.res)}`, style: `stroke:${c};stroke-width:${(bh / 2.4).toFixed(1)};stroke-linecap:round;opacity:.45` }, s), 'a-fade', 0.2 + 0.06 * i);
    el('circle', { cx: x(r.free), cy, r: 5, style: `fill:var(--paper);stroke:${c};stroke-width:2` }, s);
    const dot = anim(el('circle', { cx: x(r.res), cy, r: 6, style: `fill:${c};stroke:var(--paper);stroke-width:1.5` }, s), 'a-pop', 0.4 + 0.06 * i);
    if (r.field) el('path', { d: `M${x(r.field)} ${cy - 8}L${x(r.field) + 7} ${cy}L${x(r.field)} ${cy + 8}L${x(r.field) - 7} ${cy}Z`, style: 'fill:var(--ink);stroke:var(--paper);stroke-width:1' }, s);
    const v = r.res >= kHi ? 'hIn' : r.res >= kLo ? 'hNear' : 'hOut';
    txt(s, x(Math.max(r.res, r.field || 0)) + 10, cy + 4, `${r.res}  ${t(v)}`, `fill:${v === 'hOut' ? 'var(--ink2)' : c};font-weight:${v === 'hOut' ? 500 : 700}`);
    hover(dot, () => fmt(t('hTip'), { c: fmt(t(r.k), { n: r.n, d: r.day }), f: r.free, r: r.res, k: kLo === kHi ? kLo : `${kLo}–${kHi}` }) + (r.field ? fmt(t('hTipF'), { v: r.field }) : ''));
  });
  el('path', { d: `M${m.l} ${m.t}V${H - m.b}`, style: 'stroke:var(--ink3)' }, s);
  swatches('lgH1', [[C.yantai, t('yantai')], [C.yupu, t('yupu')], ['var(--oxide-soft)', t('hBand')], ['transparent', `◆ ${t('hField')}`, 'width:0;border:0']]);
}

// ---------- T1′ before and after the key-element review ----------
function drawReview() {
  const W = 560, H = fitH('cRev', W, 380, 0.85, 1.4), m = { l: 14, r: 64, t: 6, b: 40 };
  const s = frame('cRev', W, H, t('rLbl'));
  const x = lin(0, 2000, m.l, W - m.r);
  const I = Y.yupu.interval, one = Y.yantai.oneDoor;
  const rows = [
    { k: 'rYm', a: I.main.T1, b: I.main.T1s, la: 'rBef', lb: 'rAft', c: C.yupu },
    { k: 'rYe', a: I.erection.T1, b: I.erection.T1s, la: 'rBef', lb: 'rAft', c: C.yupu },
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
  const bindY = (f, y) => f.bind.map(([n, c]) => `${elem(y, n)} ×${c}`).join(' · ');
  const bindT = f => fmt(t('bindT'), { a: f.bind[0][1], b: f.bind[1][1] });
  const thr = y => { const p = D.thr[y]['safe|whole']; return `${p[0][1].toFixed(2)} → ${p[p.length - 1][1].toFixed(2)}`; };
  const own = (f, y) => D.h1.find(r => r.yard === y && r.n === f.demand[0] && r.day === 16);
  $('twoTbl').innerHTML = head + '<tbody>' + [
    row('tMap', (f, y) => t(y === 'yupu' ? 'mapY' : 'mapT'), ''),
    row('tSys', (f, y) => f0(sysT(y)) + ' (' + f0(f.T1t[0]) + ')'),
    row('tInt', f => '[' + f0(f.interval.main.lo) + ', ' + f0(f.interval.main.T1) + ']'),
    row('tShare', (f, y) => pct(D.loo[y].ratio)),
    row('tK', f => `${f.Kstar20[0]} (${f.Kstar20[1]}–${f.Kstar20[2]})`),
    row('tBind', (f, y) => y === 'yupu' ? bindY(f, y) : bindT(f), ''),
    row('tCat', (f, y) => `<b>${t(y === 'yupu' ? 'catY' : 'catT')}</b>`, ''),
    row('tThr', (f, y) => thr(y)),
    row('tDens', (f, y) => fmt(t('densV'), { a: f.demand[0], b: f.demand[1], c: pct(f.demand[0] / sysT(y)), d: pct(f.demand[1] / sysT(y)) }), ''),
    row('tNeed', (f, y) => `${own(f, y).res} &lt; ${f.Kstar20[1]}`),
  ].join('') + '</tbody>';
  $('topoTbl').innerHTML = head + '<tbody>' + [
    row('tRoads', f => `${f.topo.roads} / ${f.topo.km.toFixed(1)} km`),
    row('tJun', f => `${f.topo.junction_res} / ${f.topo.access} / ${f.topo.stops}`),
    row('tCyc', f => `${f.topo.cyclomatic} / ${f.topo.meshedness.toFixed(3)}`),
    row('tCut', f => `${f0(f.topo.dock_cut_width_m)} m`),
    row('tEntry', f => f.dockEntry),
  ].join('') + [
    row('oT1t', (f, y) => f0(sysT(y))),
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
  draw: [drawDensity, drawLoo, drawSlack, drawThr, drawH1, drawReview, drawOsm, fillTables],
});
})();
