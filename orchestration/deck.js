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
  whole: ['整段', 'whole segments', '구간 전체'], stops: ['分段闭塞', 'segmented', '분할 폐색'],
  free: ['自由流', 'Free flow', '자유류'], reserve: ['整条路径预约', 'Whole-route reservation', '전체 경로 예약'],
  segment: ['逐段申请（参照规则，瞬移疏解）', 'Segment request (reference rule, teleport clearing)', '구간별 요청 (참조 규칙, 순간이동 해소)'],
  safe: ['安全放行 segment_safe', 'Safe release, segment_safe', '안전 출발 segment_safe'],
  K: ['车队规模 K（台）', 'Fleet size K (vehicles)', '차량군 규모 K (대)'],
  perDay: ['个/日', 'a day', '건/일'],
  // interval
  intLbl: ['运力区间：各规则的平台占 T1′ 的比例', 'Capacity interval: each rule\'s plateau as a share of T1′', '운송 능력 구간: 규칙별 평탄 구간의 T1′ 대비 비율'],
  intX: ['占路网上界 T1′ 的比例', 'Share of the network bound T1′', '도로망 상한 T1′ 대비 비율'],
  intRow: ['{yard} · {sec} · 区间 [{lo}, {hi}] 个/日', '{yard} · {sec} · interval [{lo}, {hi}] a day', '{yard} · {sec} · 구간 [{lo}, {hi}] 건/일'],
  intGap: ['第 4 章要挣回：T1′ 的 {p}', 'For chapter 4 to win back: {p} of T1′', '4장이 되찾을 몫: T1′의 {p}'],
  intSafe: ['安全放行 {p} · {v}', 'safe release {p} · {v}', '안전 출발 {p} · {v}'],
  intTip: ['{yard} · {sec} · {m}<br>平台 {v} 个/日 = T1′ 的 {p}<br>T1′ = {t}（10 个种子 {lo}–{hi}）', '{yard} · {sec} · {m}<br>plateau {v} a day = {p} of T1′<br>T1′ = {t} (10 seeds {lo}–{hi})', '{yard} · {sec} · {m}<br>평탄 하루 {v}건 = T1′의 {p}<br>T1′ = {t} (시드 10개 {lo}–{hi})'],
  lgT1: ['T1′ 路网上界', 'T1′ network bound', 'T1′ 도로망 상한'],
  lgRes: ['整条路径预约：最好的无死锁规则 = 下沿', 'Whole-route reservation: best deadlock-free rule = lower edge', '전체 경로 예약: 가장 좋은 무교착 규칙 = 하한'],
  rdRes: ['整条路径预约的平台 ÷ T1′（玉浦 / 烟台，整段）：最好的无死锁规则，即区间下沿', 'Whole-route reservation plateau ÷ T1′ (Okpo / Yantai, whole segments): the best deadlock-free rule, i.e. the lower edge', '전체 경로 예약 평탄 ÷ T1′ (옥포 / 옌타이, 구간 전체): 가장 좋은 무교착 규칙, 곧 구간 하한'],
  rdSafe: ['安全放行 segment_safe ÷ T1′：同样无死锁、不瞬移，但更保守（第 8 页）', 'Safe release, segment_safe ÷ T1′: also deadlock-free with no teleporting, but more conservative (page 8)', '안전 출발 segment_safe ÷ T1′: 역시 무교착·순간이동 없음, 그러나 더 보수적 (8쪽)'],
  rdSeg: ['逐段申请（参照规则，瞬移疏解）÷ T1′：依赖瞬移，不能当下沿', 'Segment request (reference rule, teleport clearing) ÷ T1′: it relies on teleporting, so it cannot be the lower edge', '구간별 요청 (참조 규칙, 순간이동 해소) ÷ T1′: 순간이동에 기대므로 하한이 될 수 없음'],
  // segmenting the dock roads
  segLbl: ['坞前道路按停靠点分段闭塞后的变化（玉浦）', 'Change after segmenting the dock roads at their stops (Okpo)', '도크 앞 도로를 정차 지점별로 분할 폐색한 뒤의 변화 (옥포)'],
  segY: ['相对整段的变化', 'Change from whole segments', '구간 전체 대비 변화'],
  gMain: ['主情景（MY-B 流向组合）', 'Main scenario (MY-B task mix)', '주 시나리오 (MY-B 작업 구성)'],
  gErect: ['搭载组合（P6 15%，坞口取紧）', 'Erection mix (P6 15%, dock binds)', '탑재 구성 (P6 15%, 도크 입구가 제약)'],
  gRatio: ['平台 / T1′：{a} → {b}', 'plateau / T1′: {a} → {b}', '평탄 / T1′: {a} → {b}'],
  mT1: ['T1′ 路网上界', 'T1′ network bound', 'T1′ 도로망 상한'], mRes: ['整条路径预约的平台（区间下沿）', 'Whole-route reservation plateau (lower edge)', '전체 경로 예약 평탄 (구간 하한)'],
  segTip: ['{g} · {m}<br>整段 {a} → 分段 {b}（{d}）', '{g} · {m}<br>whole {a} → segmented {b} ({d})', '{g} · {m}<br>구간 전체 {a} → 분할 {b} ({d})'],
  // safe release curves
  curLbl: ['饱和吞吐随车数：安全放行、整条路径预约、参照规则与自由流', 'Saturated throughput against fleet size: safe release, reservation, the reference rule and free flow', '차량 수에 따른 포화 처리량: 안전 출발, 예약, 참조 규칙, 자유류'],
  curY: ['吞吐（个/日，饱和档）', 'Throughput (a day, saturated)', '처리량 (건/일, 포화)'],
  curT1: ['T1′ = {v}', 'T1′ = {v}', 'T1′ = {v}'],
  curFree: ['→ {v} @ K = 150', '→ {v} @ K = 150', '→ {v} @ K = 150'],
  curPeak: ['最大 {v} @ K ≈ {k}', 'max {v} @ K ≈ {k}', '최대 {v} @ K ≈ {k}'],
  curEnd: ['K = 150：{v}', 'K = 150: {v}', 'K = 150: {v}'],
  curTip: ['{yard} · {m} · K = {k}<br>{v} 个/日', '{yard} · {m} · K = {k}<br>{v} a day', '{yard} · {m} · K = {k}<br>하루 {v}건'],
  curTipS: ['{yard} · 安全放行 · K = {k}<br>{v} 个/日（种子 {lo}–{hi}）', '{yard} · safe release · K = {k}<br>{v} a day (seeds {lo}–{hi})', '{yard} · 안전 출발 · K = {k}<br>하루 {v}건 (시드 {lo}–{hi})'],
  rdNaive: ['次放行判定与不带缓存的朴素归约逐次相同，不一致 0 次、死锁 0 次', 'decisions identical to a naive reduction without caching: 0 mismatches, 0 deadlocks', '회의 출발 판정이 캐시 없는 단순 환원과 하나하나 같음: 불일치 0회, 교착 0회'],
  rdRefuse: ['安全放行的等待中，起于“容量够、被判据拒绝”的比例（主情景、全部 K：玉浦 {a}–{b}，烟台 {c}–{d}）', 'of safe-release waits begin with a criterion refusal while capacity is free (main scenario, all K: Okpo {a}–{b}, Yantai {c}–{d})', '안전 출발의 대기 중 “용량은 있으나 판정 기준이 거부”해 시작된 비율 (주 시나리오, 모든 K: 옥포 {a}–{b}, 옌타이 {c}–{d})'],
  rdPeak: ['玉浦最大 {a} @ K ≈ {k}，K = 150 为 {b}；烟台 {c} @ {k2} → {d}。先升后降是这条判据的性质，T27 复核', 'Okpo: max {a} @ K ≈ {k}, {b} at K = 150; Yantai {c} @ {k2} → {d}. The rise and fall belong to this criterion; T27 re-checks them', '옥포 최대 {a} @ K ≈ {k}, K = 150에서 {b}; 옌타이 {c} @ {k2} → {d}. 오르다 내리는 모양은 이 판정 기준의 성질이며 T27이 재확인'],
  // deadlocks
  deadLbl: ['逐段申请（参照规则）每天的死锁次数', 'Deadlocks a day under segment request (reference rule)', '구간별 요청 (참조 규칙)의 하루 교착 수'],
  deadY: ['每天死锁（次，饱和档）', 'Deadlocks a day (saturated)', '하루 교착 (회, 포화)'],
  deadMark: ['K = 100：每天 {v} 次', 'K = 100: {v} a day', 'K = 100: 하루 {v}회'],
  deadMark2: ['约 {s} 的车·时被移出路网', 'about {s} of vehicle-hours off the network', '차량·시간 약 {s}가 도로망 밖'],
  deadTip: ['{yard} · K = {k}<br>每天 {v} 次死锁（种子 {lo}–{hi}）<br>被瞬移出路网的车·时 ≥ {s}', '{yard} · K = {k}<br>{v} deadlocks a day (seeds {lo}–{hi})<br>vehicle-hours teleported off ≥ {s}', '{yard} · K = {k}<br>하루 교착 {v}회 (시드 {lo}–{hi})<br>순간이동으로 빠진 차량·시간 ≥ {s}'],
  rdLev: ['玉浦常规日 / 高峰日每天的死锁（97 / 194 个/日，即 4 台车子集，Yim 2008，只作对照）', 'Okpo deadlocks a day on a regular / peak day (97 / 194 tasks, the 4-vehicle subset of Yim 2008, for comparison only)', '옥포 평상일 / 피크일 하루 교착 (97 / 194건, Yim 2008의 4대 부분집합, 비교용)'],
  rdSat: ['饱和档 K = 100 / 150 每天的死锁', 'Deadlocks a day at saturation, K = 100 / 150', '포화, K = 100 / 150의 하루 교착'],
  rdShare: ['K = 100 时至少被瞬移出路网的车·时（{a} / {b} 车·时）', 'Vehicle-hours teleported off the network at K = 100, at least ({a} / {b})', 'K = 100에서 최소한 순간이동으로 빠진 차량·시간 ({a} / {b})'],
  // productivity and H5
  prodLbl: ['玉浦每台车每天完成的任务', 'Tasks per vehicle per day on Okpo', '옥포 차량당 하루 작업'],
  prodY: ['每台车每天的任务（个）', 'Tasks per vehicle per day', '차량당 하루 작업 (건)'],
  ceil: ['自由流 = 单车上限 H/c̄ = {v}', 'Free flow = per-vehicle ceiling H/c̄ = {v}', '자유류 = 차량당 상한 H/c̄ = {v}'],
  k30: ['K = 30', 'K = 30', 'K = 30'],
  prodTip: ['{m} · K = {k}<br>每台车每天 {v} 个', '{m} · K = {k}<br>{v} tasks per vehicle per day', '{m} · K = {k}<br>차량당 하루 {v}건'],
  rdEff: ['K = 30 时每车每日 ÷ 自由流上限：整条路径预约 / 安全放行；参照规则（瞬移疏解）为 {s}', 'Per vehicle per day ÷ free-flow ceiling at K = 30: reservation / safe release; the reference rule (teleport clearing) reaches {s}', 'K = 30에서 차량당 하루 ÷ 자유류 상한: 전체 경로 예약 / 안전 출발; 참조 규칙 (순간이동 해소)은 {s}'],
  rdLoss: ['按宣言判据，最好的安全规则（整条路径预约）相对 T1′ 的损失（玉浦 / 烟台）；参照规则不安全、靠瞬移，也损失 {a} / {b}', 'The best safe rule\'s loss against T1′ (reservation; Okpo / Yantai), the manifesto criterion; the teleporting reference rule still loses {a} / {b}', '선언의 기준으로 가장 좋은 안전 규칙 (전체 경로 예약)의 T1′ 대비 손실 (옥포 / 옌타이); 안전하지 않고 순간이동에 기대는 참조 규칙도 {a} / {b} 손실'],
  // vehicles needed
  needLbl: ['玉浦全厂口径所需车数（整段，整数 K）', 'Whole-yard vehicles needed on Okpo (whole segments, integer K)', '옥포 조선소 전체 기준 필요 차량 (구간 전체, 정수 K)'],
  needX: ['所需车数（台）', 'Vehicles needed', '필요 차량 (대)'],
  day16: ['16 h 工作日', '16-h working day', '16시간 근무일'], day24: ['24 h 工作日', '24-h working day', '24시간 근무일'],
  n339: ['玉浦日均 339', 'Okpo mean 339', '옥포 평균 339'], n500: ['500 个/日', '500 a day', '하루 500건'],
  n600: ['600 个/日', '600 a day', '하루 600건'], n678: ['玉浦高峰 678', 'Okpo peak 678', '옥포 피크 678'],
  kstar: ['K* {a}–{b}', 'K* {a}–{b}', 'K* {a}–{b}'],
  aHHI: ['现代重工 24 台', 'Hyundai Heavy 24', '현대중공업 24대'], aShen: ['Shen 等 约 30 台', 'Shen et al. ≈30', 'Shen 등 약 30대'],
  needTip: ['{n} 个/日 · {h} h<br>自由流 {f} · 参照规则 {s} · 预约 {r}<br>安全放行 {sf}', '{n} a day · {h} h<br>free flow {f} · reference {s} · reservation {r}<br>safe release {sf}', '하루 {n}건 · {h}시간<br>자유류 {f} · 참조 {s} · 예약 {r}<br>안전 출발 {sf}'],
  failNote: ['（其上 {k} 又不达）', ' (missed again at {k})', ' (그 위 {k}에서 다시 미달)'],
  lgGap: ['预约与自由流之间：更好的规则能省下的车', 'Reservation to free flow: what a better rule could save', '예약과 자유류 사이: 더 나은 규칙이 아낄 차량'],
  refShort: ['参照规则（瞬移疏解）', 'Reference rule (teleport clearing)', '참조 규칙 (순간이동 해소)'],
  lgAnchor: ['现场车队（T24 全文核对）', 'Field fleets (T24)', '현장 차량군 (T24 전문 확인)'],
  rdNeed: ['玉浦每天 600 个、16 h：整条路径预约 {r} 台，参照规则 {s}，自由流 {f}（24 h：{r2} / {s2} / {f2}）', 'Okpo at 600 a day, 16 h: whole-route reservation {r} vehicles, reference rule {s}, free flow {f} (24 h: {r2} / {s2} / {f2})', '옥포 하루 600건, 16시간: 전체 경로 예약 {r}대, 참조 규칙 {s}, 자유류 {f} (24시간: {r2} / {s2} / {f2})'],
  rdOwn: ['玉浦本厂日均 339 个：16 h 预约 {r} 台、自由流 {f}；24 h 为 {r2} / {f2}，都低于 K* {a}–{b}', 'Okpo\'s own mean of 339 a day: 16 h reservation {r}, free flow {f}; 24 h {r2} / {f2}, all below K* = {a}–{b}', '옥포 자체 평균 하루 339건: 16시간 예약 {r}대, 자유류 {f}; 24시간 {r2} / {f2}, 모두 K* {a}–{b} 아래'],
};
const t = k => T[k][LI[Deck.lang]];
const YC = { yupu: 'var(--steel)', yantai: 'var(--amber)' };
const MC = { free: 'var(--steel)', reserve: 'var(--oxide)', segment: 'var(--amber)', safe: 'var(--good)' };
const f0 = v => Math.round(v).toLocaleString('en-US');
const f1 = v => v.toFixed(1);
const pct = v => Math.round(100 * v) + '%';
const sgn1 = v => (v >= 0 ? '+' : '−') + Math.abs(100 * v).toFixed(1) + '%';
const range = (a, b, st) => { const r = []; for (let v = a; v <= b + 1e-9; v += st) r.push(+v.toFixed(6)); return r; };
const pathOf = pts => pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('');
const stat = (num, p) => `<div class="stat"><span class="num">${num}</span><p>${p}</p></div>`;
const thin = k => (k > 40 ? k % 10 : k % 5);              // fewer hover dots on the dense K grid
function axes(s, x, y, xt, yt, W, H, m, fx = v => v, fy = v => v) {
  const g = el('g', { class: 'grid' }, s), a = el('g', { class: 'axis' }, s);
  yt.forEach(v => { el('line', { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v) }, g); el('text', { x: m.l - 8, y: y(v) + 4, 'text-anchor': 'end' }, s, fy(v)); });
  xt.forEach(v => el('text', { x: x(v), y: H - m.b + 17, 'text-anchor': 'middle' }, s, fx(v)));
  el('path', { d: `M${m.l} ${m.t}V${H - m.b}H${W - m.r}` }, a);
}

// ---------- the capacity interval: plateaus as shares of T1' (T22 section 4) ----------
function drawInt() {
  const R = D.interval, W = 600, H = fitH('cInt', W, 360), m = { l: 14, r: 26, t: 6, b: 44 };
  const s = frame('cInt', W, H, t('intLbl'));
  const x = lin(0, 1, m.l, W - m.r);
  const g = el('g', { class: 'grid' }, s);
  [0, .25, .5, .75, 1].forEach(v => { el('line', { x1: x(v), x2: x(v), y1: m.t, y2: H - m.b }, g); el('text', { x: x(v), y: H - m.b + 18, 'text-anchor': 'middle' }, s, pct(v)); });
  el('text', { x: (m.l + W - m.r) / 2, y: H - 8, 'text-anchor': 'middle' }, s, t('intX'));
  const rowH = (H - m.t - m.b) / R.length;
  R.forEach((Y, i) => {
    const y0 = m.t + i * rowH + Math.max(0, (rowH - 100) / 2), bh = 30, by = y0 + 24;
    el('text', { x: m.l, y: y0 + 15, class: 't-strong', style: 'font-size:14px' }, s, fmt(t('intRow'), { yard: t(Y.yard), sec: t(Y.sec), lo: f0(Y.plateau.reserve), hi: f0(Y.T1t[0]) }));
    el('rect', { x: x(0), y: by, width: x(1) - x(0), height: bh, style: 'fill:var(--panel)' }, s);
    const sr = Y.share.reserve, tip = md => () => fmt(t('intTip'), { yard: t(Y.yard), sec: t(Y.sec), m: t(md), v: f0(Y.plateau[md]), p: pct(Y.share[md]), t: f0(Y.T1t[0]), lo: f0(Y.T1t[1]), hi: f0(Y.T1t[2]) });
    if (Y.share.segment) {
      const ss = Y.share.segment;
      const seg = anim(el('rect', { x: x(sr), y: by, width: x(ss) - x(sr), height: bh, style: 'fill:var(--amber-hi);fill-opacity:.45' }, s), 'a-x', .7 + .2 * i);
      anim(el('rect', { x: x(sr), y: by, width: x(ss) - x(sr), height: bh, style: 'fill:url(#hatch);pointer-events:none' }, s), 'a-x', .7 + .2 * i);
      el('text', { x: x(ss) + 7, y: by + bh / 2 + 5, style: 'fill:var(--amber);font-weight:600;font-size:13px' }, s, `${pct(ss)} · ${f0(Y.plateau.segment)}`);
      hover(seg, tip('segment'));
    }
    const res = anim(el('rect', { x: x(0), y: by, width: x(sr) - x(0), height: bh, style: 'fill:var(--oxide)' }, s), 'a-x', .3 + .2 * i);
    el('text', { x: x(sr) - 7, y: by + bh / 2 + 5, 'text-anchor': 'end', style: 'fill:#fff;font-weight:600;font-size:14px' }, s, `${pct(sr)} · ${f0(Y.plateau.reserve)}`);
    hover(res, tip('reserve'));
    // safe release: a thin bar under the reservation bar
    const sy = by + bh + 3, sf = anim(el('rect', { x: x(0), y: sy, width: x(Y.share.safe) - x(0), height: 8, style: 'fill:var(--good)' }, s), 'a-x', .5 + .2 * i);
    el('text', { x: x(Y.share.safe) + 6, y: sy + 8, style: 'fill:var(--good);font-weight:600;font-size:12px' }, s, fmt(t('intSafe'), { p: pct(Y.share.safe), v: f0(Y.plateau.safe) }));
    hover(sf, tip('safe'));
    el('path', { d: `M${x(1)} ${by - 8}V${by + bh + 12}`, style: 'stroke:var(--oxide);stroke-width:2;stroke-dasharray:5 3' }, s);
    // the gap chapter 4 aims to win back
    const gy = by + bh + 26, gx = x(sr);
    anim(el('path', { d: `M${gx + 1} ${gy - 6}V${gy}H${x(1) - 1}V${gy - 6}`, style: 'stroke:var(--ink2);stroke-width:1.4;fill:none' }, s), 'a-fade', 1.1);
    anim(el('text', { x: (gx + x(1)) / 2, y: gy + 15, 'text-anchor': 'middle', style: 'fill:var(--ink);font-size:12.5px;font-weight:600' }, s, fmt(t('intGap'), { p: pct(1 - sr) })), 'a-fade', 1.2);
  });
  swatches('lgInt', [['var(--oxide)', t('lgRes')], ['var(--good)', t('safe')], ['var(--amber-hi)', t('segment'), 'opacity:.6'], ['transparent', t('lgT1'), 'border:2px dashed var(--oxide)']]);
  const [Y, , Yt] = R;
  $('intRead').innerHTML = stat(`${pct(Y.share.reserve)}<small>/ ${pct(Yt.share.reserve)}</small>`, t('rdRes'))
    + stat(`${pct(Y.share.safe)}<small>/ ${pct(Yt.share.safe)}</small>`, t('rdSafe'))
    + stat(`${pct(Y.share.segment)}<small>/ ${pct(Yt.share.segment)}</small>`, t('rdSeg'));
}

// ---------- segmenting the dock roads: T1' moves, the reservation lower edge hardly (T22 sections 3.5, 4) ----------
function drawSeg() {
  const S = D.seg, W = 600, H = fitH('cSeg', W, 340), m = { l: 66, r: 12, t: 16, b: 66 };
  const s = frame('cSeg', W, H, t('segLbl'));
  const y = lin(0, 0.8, H - m.b, m.t);
  axes(s, v => v, y, [], range(0, 0.8, 0.2), W, H, m, v => v, v => Math.round(100 * v) + '%');
  yTitle(s, 14, (m.t + H - m.b) / 2, t('segY'));
  const G = [['main', 'gMain'], ['erection', 'gErect']], MS = [['T1', 'mT1', 'var(--steel)'], ['reserve', 'mRes', 'var(--oxide)']];
  const gw = (W - m.l - m.r) / G.length, bw = 74, gap = 18;
  G.forEach(([k, lbl], i) => {
    const v = S[k], cx = m.l + gw * (i + .5);
    el('text', { x: cx, y: H - m.b + 20, 'text-anchor': 'middle', class: 't-strong', style: 'font-size:13.5px' }, s, t(lbl));
    const r0 = v.reserve[0] / v.T1[0], r1 = v.reserve[1] / v.T1[1];
    el('text', { x: cx, y: H - m.b + 40, 'text-anchor': 'middle', style: 'font-size:13px;fill:var(--ink2)' }, s, fmt(t('gRatio'), { a: r0.toFixed(2), b: r1.toFixed(2) }));
    MS.forEach(([mk, ml, c], j) => {
      const d = v[mk][1] / v[mk][0] - 1, bx = cx - bw - gap / 2 + j * (bw + gap);
      const r = anim(el('rect', { x: bx, y: y(Math.max(d, 0)), width: bw, height: Math.max(1.5, y(0) - y(Math.max(d, 0))), style: `fill:${c}` }, s), 'a-y', .3 + .15 * j + .25 * i);
      el('text', { x: bx + bw / 2, y: y(Math.max(d, 0)) - 7, 'text-anchor': 'middle', style: `font-size:14px;fill:${c};font-weight:700` }, s, sgn1(d));
      hover(r, () => fmt(t('segTip'), { g: t(lbl), m: t(ml), a: f0(v[mk][0]), b: f0(v[mk][1]), d: sgn1(d) }));
    });
  });
  swatches('lgSeg', MS.map(([, ml, c]) => [c, t(ml)]));
}

// ---------- safe release against the other rules, saturated curves on both yards (T22 sections 2.1, 5) ----------
function drawCurve() {
  const C = D.curve, W = 600, H = fitH('cCurve', W, 340), m = { l: 62, r: 8, t: 22, b: 46 }, gap = 62;
  const s = frame('cCurve', W, H, t('curLbl'));
  const pw = (W - m.l - m.r - gap) / 2;
  yTitle(s, 13, (m.t + H - m.b) / 2, t('curY'));
  el('text', { x: (m.l + W - m.r) / 2, y: H - 6, 'text-anchor': 'middle' }, s, t('K'));
  ['yupu', 'yantai'].forEach((yd, i) => {
    const c = C[yd], top = yd === 'yupu' ? 1800 : 1300, x0 = m.l + i * (pw + gap);
    const x = lin(0, 150, x0, x0 + pw), y = lin(0, top, H - m.b, m.t);
    const g = el('g', { class: 'grid' }, s), a = el('g', { class: 'axis' }, s);
    range(0, top, top > 1500 ? 300 : 250).forEach(v => { el('line', { x1: x0, x2: x0 + pw, y1: y(v), y2: y(v) }, g); el('text', { x: x0 - 6, y: y(v) + 4, 'text-anchor': 'end', style: 'font-size:12px' }, s, f0(v)); });
    [0, 50, 100, 150].forEach(v => el('text', { x: x(v), y: H - m.b + 17, 'text-anchor': 'middle', style: 'font-size:12px' }, s, v));
    el('path', { d: `M${x0} ${m.t}V${H - m.b}H${x0 + pw}` }, a);
    el('text', { x: x0 + 4, y: m.t - 6, class: 't-strong', style: 'font-size:14px' }, s, t(yd));
    // T1'
    el('path', { d: `M${x0} ${y(c.T1t)}H${x0 + pw}`, style: 'stroke:var(--oxide);stroke-width:1.6;stroke-dasharray:6 4' }, s);
    el('text', { x: x0 + 4, y: y(c.T1t) - 5, style: 'fill:var(--oxide);font-size:12px;font-weight:600' }, s, fmt(t('curT1'), { v: f0(c.T1t) }));
    // free flow, cut where it leaves the panel
    const fp = []; let cut = null;
    for (const p of c.free) { if (p[1] <= top) fp.push(p); else { const q = fp[fp.length - 1]; cut = [q[0] + (p[0] - q[0]) * (top - q[1]) / (p[1] - q[1]), top]; break; } }
    if (cut) fp.push(cut);
    anim(el('path', { d: pathOf(fp.map(p => [x(p[0]), y(p[1])])), pathLength: 1, style: `stroke:${MC.free};stroke-width:2.2;fill:none` }, s), 'a-draw', .2);
    if (cut) el('text', { x: x(cut[0]) + 4, y: m.t - 6, style: `fill:${MC.free};font-size:12px;font-weight:600` }, s, fmt(t('curFree'), { v: f0(c.free[c.free.length - 1][1]) }));
    // the safe-release band (min-max over seeds), then the three rule curves
    el('path', { d: pathOf(c.safe.map(p => [x(p[0]), y(p[3])])) + pathOf(c.safe.slice().reverse().map(p => [x(p[0]), y(p[2])])).replace('M', 'L') + 'Z', style: 'fill:var(--good);opacity:.18' }, s);
    ['segment', 'reserve', 'safe'].forEach((md, j) => {
      const pts = c[md];
      anim(el('path', { d: pathOf(pts.map(p => [x(p[0]), y(p[1])])), pathLength: 1, style: `stroke:${MC[md]};stroke-width:${md === 'safe' ? 2.8 : 2.3};fill:none;stroke-linejoin:round${md === 'segment' ? ';stroke-dasharray:7 4' : ''}` }, s), 'a-draw', .35 + .2 * j);
      pts.forEach((p, k) => {
        if (thin(p[0])) return;
        const d = anim(el('circle', { cx: x(p[0]), cy: y(p[1]), r: 2.6, style: `fill:${MC[md]};stroke:var(--paper);stroke-width:1` }, s), 'a-pop', .9 + .3 * spread(k));
        hover(d, md === 'safe' ? () => fmt(t('curTipS'), { yard: t(yd), k: p[0], v: f0(p[1]), lo: f0(p[2]), hi: f0(p[3]) }) : () => fmt(t('curTip'), { yard: t(yd), m: t(md), k: p[0], v: f0(p[1]) }));
      });
    });
    // the safe-release peak and its fall to K = 150
    const [pk, pv] = c.peak;
    anim(el('circle', { cx: x(pk), cy: y(pv), r: 6, style: 'fill:none;stroke:var(--good);stroke-width:2' }, s), 'a-pop', 1.3);
    const ly = y(c.at150) - 30, lab = anim(el('text', { x: x0 + pw - 2, y: ly, 'text-anchor': 'end', style: 'fill:var(--good);font-weight:700;font-size:12px' }, s), 'a-fade', 1.4);
    el('tspan', { x: x0 + pw - 2 }, lab, fmt(t('curPeak'), { v: f0(pv), k: pk }));
    el('tspan', { x: x0 + pw - 2, dy: 15 }, lab, fmt(t('curEnd'), { v: f0(c.at150) }));
  });
  swatches('lgCurve', [[MC.safe, t('safe')], [MC.reserve, t('reserve')], [MC.segment, t('segment')], [MC.free, t('free')], ['transparent', t('lgT1'), 'border:2px dashed var(--oxide)']]);
  const Y = C.yupu, Tt = C.yantai, N = D.naive;
  $('curRead').innerHTML = stat(f0(N.checks), t('rdNaive'))
    + stat(`≈ 2/3`, fmt(t('rdRefuse'), { a: pct(Y.refusal[0]), b: pct(Y.refusal[1]), c: pct(Tt.refusal[0]), d: pct(Tt.refusal[1]) }))
    + stat(`${f0(Y.peak[1])} → ${f0(Y.at150)}`, fmt(t('rdPeak'), { a: f0(Y.peak[1]), k: Y.peak[0], b: f0(Y.at150), c: f0(Tt.peak[1]), k2: Tt.peak[0], d: f0(Tt.at150) }));
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
      if (thin(p[0])) return;
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

// ---------- per-vehicle productivity and the cost of safety at K = 30 (T22 section 6.3) ----------
function drawProd() {
  const P = D.prod, W = 600, H = fitH('cProd', W, 340), m = { l: 52, r: 14, t: 24, b: 46 };
  const s = frame('cProd', W, H, t('prodLbl'));
  const x = lin(0, 150, m.l, W - m.r), y = lin(0, 22, H - m.b, m.t);
  axes(s, x, y, range(0, 150, 25), range(0, 20, 5), W, H, m, v => v, v => v);
  el('text', { x: (m.l + W - m.r) / 2, y: H - 6, 'text-anchor': 'middle' }, s, t('K'));
  yTitle(s, 14, (m.t + H - m.b) / 2, t('prodY'));
  el('path', { d: `M${x(30)} ${m.t}V${H - m.b}`, style: 'stroke:var(--ink3);stroke-width:1.2;stroke-dasharray:4 4' }, s);
  el('text', { x: x(30), y: m.t - 8, 'text-anchor': 'middle', style: 'fill:var(--ink2);font-size:12.5px;font-weight:600' }, s, t('k30'));
  el('text', { x: W - m.r - 4, y: y(P.ceiling) - 8, 'text-anchor': 'end', style: `fill:${MC.free};font-size:12.5px;font-weight:600` }, s, fmt(t('ceil'), { v: f1(P.ceiling) }));
  ['free', 'segment', 'reserve', 'safe'].forEach((md, i) => {
    const pts = P[md];
    anim(el('path', { d: pathOf(pts.map(p => [x(p[0]), y(p[1])])), pathLength: 1, style: `stroke:${MC[md]};stroke-width:2.6;fill:none;stroke-linejoin:round${md === 'segment' ? ';stroke-dasharray:7 4' : ''}` }, s), 'a-draw', .3 + .2 * i);
    pts.forEach((p, j) => {
      if (thin(p[0])) return;
      const c = anim(el('circle', { cx: x(p[0]), cy: y(p[1]), r: 3, style: `fill:${MC[md]};stroke:var(--paper);stroke-width:1` }, s), 'a-pop', .9 + .3 * spread(j));
      hover(c, () => fmt(t('prodTip'), { m: t(md), k: p[0], v: f1(p[1]) }));
    });
    if (md === 'free') return;
    const p = pts.find(q => q[0] === 30), e = P.eff30[md];
    anim(el('circle', { cx: x(30), cy: y(p[1]), r: 6, style: `fill:none;stroke:${MC[md]};stroke-width:2` }, s), 'a-pop', 1.3);
    anim(el('text', { x: x(30) - 10, y: y(p[1]) + 5, 'text-anchor': 'end', style: `fill:${MC[md]};font-size:13px;font-weight:700` }, s, pct(e)), 'a-fade', 1.4);
  });
  swatches('lgProd', [[MC.free, t('free')], [MC.reserve, t('reserve')], [MC.safe, t('safe')], [MC.segment, t('segment')]]);
  const E = P.eff30, I = D.interval;
  $('prodRead').innerHTML = stat(`${pct(E.reserve)}<small>/ ${pct(E.safe)}</small>`, fmt(t('rdEff'), { s: pct(E.segment) }))
    + stat(`${pct(1 - I[0].share.reserve)}<small>/ ${pct(1 - I[2].share.reserve)}</small>`, fmt(t('rdLoss'), { a: pct(1 - I[0].share.segment), b: pct(1 - I[2].share.segment) }));
}

// ---------- whole-yard vehicles needed per rule against field fleets (T22 section 6.1, T24) ----------
function drawNeed() {
  const N = D.need, W = 600, H = fitH('cNeed', W, 380), m = { l: 104, r: 46, t: 26, b: 42 }, XM = 130;
  const s = frame('cNeed', W, H, t('needLbl'));
  const x = lin(0, XM, m.l, W - m.r), ph = (H - m.t - m.b - 26) / 2, rh = (ph - 22) / 4;
  const rowY = (pi, i) => m.t + pi * (ph + 26) + 22 + (i + .5) * rh;
  const g = el('g', { class: 'grid' }, s);
  range(0, 125, 25).forEach(v => { el('line', { x1: x(v), x2: x(v), y1: m.t, y2: H - m.b }, g); el('text', { x: x(v), y: H - m.b + 17, 'text-anchor': 'middle', style: 'font-size:12px' }, s, v); });
  el('text', { x: (m.l + W - m.r) / 2, y: H - 6, 'text-anchor': 'middle' }, s, t('needX'));
  const [k1, k2] = N.kstar;
  el('rect', { x: x(k1), y: m.t, width: x(k2) - x(k1), height: H - m.b - m.t, style: 'fill:var(--ink3);opacity:.12' }, s);
  el('text', { x: (x(k1) + x(k2)) / 2, y: m.t - 8, 'text-anchor': 'middle', style: 'fill:var(--ink2);font-size:12px;font-weight:600' }, s, fmt(t('kstar'), { a: k1, b: k2 }));
  const val = v => (typeof v === 'number' ? v : null), lv = { 339: 'n339', 500: 'n500', 600: 'n600', 678: 'n678' };
  [16, 24].forEach((h, pi) => {
    const rows = N.rows.filter(r => r.h === h), py = m.t + pi * (ph + 26);
    el('text', { x: 4, y: py + 12, class: 't-strong', style: 'font-size:13.5px' }, s, t(h === 16 ? 'day16' : 'day24'));
    rows.forEach((r, i) => {
      const cy = rowY(pi, i), j = pi * 4 + i;
      el('text', { x: m.l - 10, y: cy + 4, 'text-anchor': 'end', style: 'font-size:12.5px;fill:var(--ink2)' }, s, t(lv[r.n]));
      const band = anim(el('rect', { x: x(r.free), y: cy - 6, width: x(r.reserve) - x(r.free), height: 12, rx: 3, style: 'fill:var(--oxide-soft)' }, s), 'a-x', .3 + .06 * j);
      hover(band, () => fmt(t('needTip'), { n: r.n, h, f: r.free, s: r.segment, r: r.reserve, sf: (val(r.safe) == null ? r.safe.replace('>', '> ') : r.safe) + (r.safe_fail ? fmt(t('failNote'), { k: r.safe_fail.join(', ') }) : '') }));
      el('circle', { cx: x(r.segment), cy, r: 4.2, style: `fill:var(--paper);stroke:${MC.segment};stroke-width:2` }, s);
      el('circle', { cx: x(r.free), cy, r: 5, style: `fill:${MC.free}` }, s);
      el('circle', { cx: x(r.reserve), cy, r: 5, style: `fill:${MC.reserve}` }, s);
      el('text', { x: x(r.free) - 8, y: cy + 4, 'text-anchor': 'end', style: `fill:${MC.free};font-size:12px;font-weight:700` }, s, r.free);
      el('text', { x: x(r.reserve) + 8, y: cy + 4, style: `fill:${MC.reserve};font-size:12px;font-weight:700` }, s, r.reserve);
      const sv = val(r.safe);
      if (sv != null && sv <= XM) el('path', { d: `M${x(sv)} ${cy - 7}l6 11h-12Z`, style: `fill:${MC.safe};stroke:var(--paper);stroke-width:1` }, s);
      else {                                                       // off the scale: an arrow at the edge with its value
        el('path', { d: `M${x(XM) + 2} ${cy - 5}l8 5l-8 5Z`, style: `fill:${MC.safe}` }, s);
        el('text', { x: x(XM) + 13, y: cy + 4, style: `fill:${MC.safe};font-size:12px;font-weight:600` }, s, sv != null ? sv : r.safe.replace('>', '> '));
      }
    });
  });
  // field fleets: Hyundai Heavy (24 h stated) and Shen et al. (shift not stated: drawn on both panels)
  const A = N.anchors, rowsOf = h => N.rows.filter(r => r.h === h);
  const dia = (cx, cy, lbl, dy) => {                         // label below (dy > 0) or above (dy < 0) the row
    anim(el('path', { d: `M${cx} ${cy - 8}l8 8l-8 8l-8-8Z`, style: 'fill:none;stroke:var(--ink);stroke-width:2' }, s), 'a-pop', 1.3);
    el('text', { x: cx, y: cy + dy, 'text-anchor': 'middle', style: 'fill:var(--ink);font-size:12px;font-weight:600' }, s, lbl);
  };
  [16, 24].forEach((h, pi) => {
    const cyOf = n => rowY(pi, rowsOf(h).findIndex(r => r.n === n));
    dia(x(A.shen[1]), cyOf(A.shen[0]), t('aShen'), 21);
    if (h === 24) dia(x(A.hhi[1]), cyOf(A.hhi[0]), t('aHHI'), -12);
  });
  swatches('lgNeed', [['var(--oxide-soft)', t('lgGap')], [MC.free, t('free')], [MC.segment, t('refShort'), 'background:var(--paper);border:2px solid var(--amber)'], [MC.reserve, t('reserve')], [MC.safe, t('safe'), 'clip-path:polygon(50% 0,100% 100%,0 100%)'], ['transparent', t('lgAnchor'), 'border:2px solid var(--ink);transform:rotate(45deg) scale(.75)']]);
  const R = (h, n) => N.rows.find(r => r.h === h && r.n === n), a = R(16, 600), b = R(24, 600), c = R(16, 339), d = R(24, 339);
  $('needRead').innerHTML = stat(`${a.reserve} → ${a.free}`, fmt(t('rdNeed'), { r: a.reserve, s: a.segment, f: a.free, r2: b.reserve, s2: b.segment, f2: b.free }))
    + stat(`${c.reserve}<small>/ ${d.reserve}</small>`, fmt(t('rdOwn'), { r: c.reserve, f: c.free, r2: d.reserve, f2: d.free, a: k1, b: k2 }));
}

Deck.start({
  strings: T,
  sections: { intro: ['导读', 'Overview', '개요'], pos: ['问题与定位', 'Question and position', '질문과 위치'], why: ['为什么要编排', 'Why orchestration', '왜 편성인가'],
    rules: ['规则与起点', 'Rules and starting point', '규칙과 출발점'], goal: ['目标与 H5', 'Goal and H5', '목표와 H5'], method: ['方法', 'Methods', '방법'],
    plan: ['实验与产出', 'Experiments and outputs', '실험과 산출물'], status: ['进度与风险', 'Status and risks', '진행과 위험'], pub: ['投稿去向', 'Target journals', '투고 대상'],
    ref: ['参考文献', 'References', '참고문헌'], end: ['结语', 'Close', '맺음'] },
  draw: [drawInt, drawSeg, drawDead, drawCurve, drawProd, drawNeed],
});
})();
