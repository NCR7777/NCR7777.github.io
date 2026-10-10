// Fleet–network co-design deck (thesis chapter 5): the strings and charts of this briefing.
// Paging, language, notes, contents, glossary, layout and the PDF link come from ../shared/deck-core.js (README.md).
(() => {
'use strict';
const D = window.DATA;
const { LI, $, el, frame, fitH, anim, lin, yTitle, swatches, hover, fmt } = Deck;

// ---------- strings used inside charts and filled tables: [zh, en, ko] ----------
const T = {
  title: ['车队与路网协同设计 · 分项汇报', 'Fleet–Network Co-Design', '차량군·도로망 협동 설계 · 세부 보고'],
  // interval charts
  ivlLbl: ['运力区间：整条路径预约的平台与上界 T1′（10 个种子）', 'Capacity interval: whole-route reservation plateau against the bound T1′ (10 seeds)', '운송 능력 구간: 전체 경로 예약 평탄과 상한 T1′ (시드 10개)'],
  segLbl: ['坞前道路分段前后的运力区间（玉浦，10 个种子）', 'Capacity interval before and after segmenting the dock road (Okpo, 10 seeds)', '도크 앞 도로 분할 전후의 운송 능력 구간 (옥포, 시드 10개)'],
  thr: ['日吞吐（任务 / 16 h）', 'Daily throughput (tasks / 16 h)', '일일 처리량 (작업 / 16시간)'],
  rMainW: ['玉浦主情景 · 坞前道路整段', 'Okpo main scenario · dock road as one resource', '옥포 주 시나리오 · 도크 앞 도로 전체'],
  rEreW: ['玉浦搭载组合 · 整段（P6 15%，白班集中）', 'Okpo erection mix · one resource (P6 15%, day shift)', '옥포 탑재 조합 · 전체 (P6 15%, 주간 집중)'],
  rYtW: ['烟台主情景 · 整段', 'Yantai main scenario · one resource', '옌타이 주 시나리오 · 전체'],
  rMainS: ['玉浦主情景 · 按停靠点分段', 'Okpo main scenario · segmented at the stops', '옥포 주 시나리오 · 정차 지점별 분할'],
  rEreS: ['玉浦搭载组合 · 按停靠点分段', 'Okpo erection mix · segmented at the stops', '옥포 탑재 조합 · 정차 지점별 분할'],
  gapMain: ['差距来自规则 → 先改编排（第 4 章）', 'gap from the rule → orchestration first (ch. 4)', '차이는 규칙에서 → 편성 먼저 (4장)'],
  gapEre: ['差距小 → 改路直接见效', 'small gap → road changes pay', '차이 작음 → 개조가 바로 효과'],
  gapYt: ['差距来自规则', 'gap from the rule', '차이는 규칙에서'],
  segAnn: ['分段：T1′ {t}，平台 {p}', 'segmented: T1′ {t}, plateau {p}', '분할: T1′ {t}, 평탄 {p}'],
  lgPlat: ['整条路径预约的饱和平台（K = 100–150 均值）', 'Whole-route reservation plateau (mean of K = 100–150)', '전체 경로 예약 포화 평탄 (K = 100–150 평균)'],
  lgGap: ['到 T1′ 的差距', 'Gap to T1′', 'T1′까지의 차이'],
  lgT1: ['T1′（横线：10 个种子的范围）', 'T1′ (whisker: range over 10 seeds)', 'T1′ (가로선: 시드 10개 범위)'],
  lgT1s: ['T1′（10 个种子均值）', 'T1′ (mean of 10 seeds)', 'T1′ (시드 10개 평균)'],
  lgPlatS: ['分段后的预约平台', 'Reservation plateau after segmenting', '분할 후 예약 평탄'],
  ivlTip: ['{row}<br>平台 {p} 个/日；T1′ {t}{rng}<br>平台 / T1′ = {r}%', '{row}<br>plateau {p} a day; T1′ {t}{rng}<br>plateau / T1′ = {r}%', '{row}<br>평탄 하루 {p}건, T1′ {t}{rng}<br>평탄 / T1′ = {r}%'],
  rngTip: ['（{lo}–{hi}；系统 T1′ {s}）', ' ({lo}–{hi}; system T1′ {s})', ' ({lo}–{hi}, 시스템 T1′ {s})'],
  // vehicles needed
  needLbl: ['玉浦全厂口径的所需车数（整数 K，10 个种子）', 'Vehicles needed at Okpo whole-yard volume (integer K, 10 seeds)', '옥포 조선소 전체 기준 필요 차량 수 (정수 K, 시드 10개)'],
  needX: ['所需车数（台）', 'Vehicles needed', '필요 차량 수 (대)'],
  needRow: ['{n} 个/日 · {h} h', '{n} a day · {h} h', '하루 {n}건 · {h} h'],
  g339: ['玉浦同法折算', 'Okpo, same conversion', '옥포 동일 환산'], g500: ['现代重工锚点', 'Hyundai Heavy anchor', '현대중공업 기준점'],
  g600: ['韩国大型厂量级', 'large Korean yard scale', '한국 대형 조선소 규모'], g678: ['玉浦高峰（× 2）', 'Okpo peak (× 2)', '옥포 피크 (× 2)'],
  kBand: ['K* 50–60：约束区起点', 'K* 50–60: constrained zone starts', 'K* 50–60: 제약 구간 시작'],
  lgFree: ['自由流', 'Free flow', '자유류'], lgRes: ['整条路径预约', 'Whole-route reservation', '전체 경로 예약'],
  lgRef: ['参照规则（瞬移疏解）', 'Reference rule (teleport clearing)', '참조 규칙 (순간 이동 해소)'],
  lgField: ['现场车队', 'Field fleet', '현장 차량군'], lgK: ['约束区起点 K*（50–60）', 'Constrained-zone start K* (50–60)', '제약 구간 시작 K* (50–60)'],
  needTip: ['{row}<br>自由流 {f} 台；整条路径预约 {r} 台；参照规则（瞬移疏解）{s} 台{a}', '{row}<br>free flow {f}; whole-route reservation {r}; reference rule (teleport clearing) {s}{a}', '{row}<br>자유류 {f}대, 전체 경로 예약 {r}대, 참조 규칙 (순간 이동 해소) {s}대{a}'],
  aHhi: ['<br>现代重工：约 {n} 次/日、{v} 台、{h} h', '<br>Hyundai Heavy: about {n} moves a day, {v} vehicles, {h} h', '<br>현대중공업: 하루 약 {n}회, {v}대, {h}시간'],
  aShen: ['<br>韩国某大型厂（Shen 等）：约 {n} 个/日、约 {v} 台（班次未写）', '<br>A large Korean yard (Shen et al.): about {n} a day, about {v} vehicles (shift not stated)', '<br>한국 대형 조선소 (Shen 등): 하루 약 {n}건, 약 {v}대 (교대 미기재)'],
  // route slack
  slkLbl: ['上界中的路线余量（系统上界）', 'Route slack in the bound (system bounds)', '상한의 경로 여유 (시스템 상한)'],
  slkX: ['T1″ 比 T1′ 多出（%）', 'T1″ above T1′ (%)', 'T1″이 T1′보다 큰 정도 (%)'],
  yYupu: ['玉浦', 'Okpo', '옥포'], yYantai: ['烟台', 'Yantai', '옌타이'],
  sMain: ['主情景', 'main scenario', '주 시나리오'], sErection: ['搭载组合', 'erection mix', '탑재 조합'], sCrane: ['吊车节拍', 'crane cadence', '크레인 주기'],
  cDock: ['坞的停靠路段，路过 {p}%', 'dock stopping road, {p}% through', '도크 정차 도로, 통과 {p}%'],
  cCorr: ['贯通走廊，路过 {p}%', 'through corridor, {p}% through', '관통 통로, 통과 {p}%'],
  cGate: ['入口：余量为 0，构造使然', 'entrance: zero by construction', '입구: 구조상 0'],
  slkV: ['+{lo}%（+{hi}%）', '+{lo}% (+{hi}%)', '+{lo}% (+{hi}%)'],
  lgLo: ['下限：回代可行值 − T1′', 'Lower: back-substituted feasible value − T1′', '하한: 역대입 가능값 − T1′'],
  lgHi: ['到上限 T1″ − T1′', 'Up to T1″ − T1′', '상한 T1″ − T1′까지'],
  slkTip: ['{row}<br>系统 T1′ {t}；T1″ {pp}<br>路线余量 +{lo}%（上限 +{hi}%）{x}', '{row}<br>system T1′ {t}; T1″ {pp}<br>route slack +{lo}% (at most +{hi}%){x}', '{row}<br>시스템 T1′ {t}, T1″ {pp}<br>경로 여유 +{lo}% (최대 +{hi}%){x}'],
  slkAlt: ['<br>绕开它的路线剩余 {a}%、平均多走 {e} m', '<br>the detour keeps {a}% spare, {e} m longer on average', '<br>우회 경로 여유 {a}%, 평균 {e} m 더 김'],
  road: ['道路{id}', 'road {id}', '도로{id}'], gate: ['建筑014 入口 A', 'building 014, entrance A', '건물014 입구 A'],
  // exchange-rate chart
  rateLbl: ['对偶价格折成台车（T23，系统上界，两列）', 'Dual prices in vehicles (T23, system bounds, two columns)', '쌍대 가격의 차량 환산 (T23, 시스템 상한, 두 열)'],
  rateX: ['台车 / 资源每天多 1 h', 'Vehicles per extra hour a day on the resource', '자원 하루 1시간 추가당 차량'],
  rateR: ['平台 / 上界', 'Plateau / bound', '평탄 / 상한'],
  lgC1: ['最短路派车（T1′）', 'Shortest-path dispatch (T1′)', '최단 경로 배차 (T1′)'],
  lgC2: ['允许绕行（T1″）', 'Re-routing allowed (T1″)', '우회 허용 (T1″)'],
  lgDag: ['† 吊车节拍按系统口径；其余按完成组合口径', '† crane cadence on the system caliber; others on the completed mix', '† 크레인 주기는 시스템 기준, 나머지는 완료 조합 기준'],
  rateTip: ['{row} · {res}<br>T1′：{p1} 个/日 → {v1} 台车<br>T1″：{p2} 个/日 → {v2} 台车<br>每台车每天 {hc} 个', '{row} · {res}<br>T1′: {p1} a day → {v1} vehicles<br>T1″: {p2} a day → {v2} vehicles<br>one vehicle: {hc} a day', '{row} · {res}<br>T1′: 하루 {p1}건 → {v1}대<br>T1″: 하루 {p2}건 → {v2}대<br>차량 1대 하루 {hc}건'],
  // schematics
  h4Lbl: ['H4 判据：对偶预测与仿真实测', 'H4 criterion: dual prediction against simulation', 'H4 판정: 쌍대 예측 대 시뮬레이션'],
  h4X: ['对偶预测（台车）', 'Dual prediction (vehicles)', '쌍대 예측 (대)'],
  h4Y: ['仿真：少用的车', 'Simulated: vehicles saved', '시뮬레이션: 절감 차량'],
  h4A: ['平台 / T1′ ≈ 1：两者一致', 'plateau / T1′ ≈ 1: they agree', '평탄 / T1′ ≈ 1: 일치'],
  h4B: ['平台 / T1′ ≪ 1：仿真远低于预测', 'plateau / T1′ ≪ 1: far below', '평탄 / T1′ ≪ 1: 예측보다 한참 낮음'],
  blkLbl: ['运力—块长曲线（T25 块长扫描）', 'Capacity against block length (T25 scan)', '운송 능력–블록 길이 곡선 (T25 스캔)'],
  blkX: ['闭塞区段长度 →', 'block length →', '폐색 구간 길이 →'],
  blkY: ['运力', 'Capacity', '운송 능력'],
  blkShort: ['按停靠点分段', 'cut at stops', '정차 지점별'], blkLong: ['整段', 'whole road', '도로 전체'],
  blkBand: ['仿真平台落在哪里由 T25 读出', 'T25 reads where simulation falls', '시뮬레이션 위치는 T25가 판독'],
};
const t = k => T[k][LI[Deck.lang]];
const f0 = v => Math.round(v).toLocaleString('en-US');
const f1 = v => (Math.round(v * 10) / 10).toFixed(1);
const sg1 = v => (v >= 0 ? '+' : '−') + f1(Math.abs(v)) + '%';
const pc = r => Math.round(100 * r);
const range = (a, b, st) => { const r = []; for (let v = a; v <= b + 1e-9; v += st) r.push(+v.toFixed(6)); return r; };
const pathOf = pts => pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('');
const key = (...a) => a.join('|');
const RT = Object.fromEntries(D.rates.map(r => [key(r.yard, r.scen, r.res), r]));
const SL = Object.fromEntries(D.slack.map(r => [key(r.yard, r.scen), r]));
const ND = Object.fromEntries(D.need.map(r => [key(r.n, r.h), r]));
const AN = Object.fromEntries(D.anchors.map(a => [key(a.n, a.h), a]));

// ---------- capacity interval: plateau bar, gap to T1′, T1′ tick; one row per scenario ----------
function ivlChart(id, lgId, label, H0, rows, whisk) {
  const W = 600, H = fitH(id, W, H0), m = { l: 12, r: 92, t: 4, b: 42 };
  const s = frame(id, W, H, label);
  const x = lin(0, 2000, m.l, W - m.r);
  const g = el('g', { class: 'grid' }, s), a = el('g', { class: 'axis' }, s);
  range(0, 2000, 500).forEach(v => { el('line', { x1: x(v), x2: x(v), y1: m.t, y2: H - m.b }, g); el('text', { x: x(v), y: H - m.b + 17, 'text-anchor': 'middle' }, s, f0(v)); });
  el('path', { d: `M${m.l} ${H - m.b}H${W - m.r}` }, a);
  el('text', { x: (m.l + W - m.r) / 2, y: H - 6, 'text-anchor': 'middle' }, s, t('thr'));
  const band = (H - m.t - m.b) / rows.length, bh = 26;
  rows.forEach((r, i) => {
    const b = D.ivl[r.k], y0 = m.t + i * band, top = y0 + (band - (whisk ? 80 : 70)) / 2, by = top + (whisk ? 28 : 22);
    if (r.sep) el('path', { d: `M${m.l} ${y0 + 1}H${W - 4}`, style: 'stroke:var(--line);stroke-width:1.2' }, s);
    el('text', { x: m.l, y: top + 14, class: 't-strong', style: 'font-size:14px' }, s, t(r.name));
    const solid = anim(el('rect', { x: x(0), y: by, width: x(b.plateau) - x(0), height: bh, style: `fill:${r.bar || 'var(--oxide)'};opacity:.88` }, s), 'a-x', .3 + .2 * i);
    const gap = anim(el('rect', { x: x(b.plateau), y: by, width: x(b.T1) - x(b.plateau), height: bh, style: 'fill:var(--oxide-soft);stroke:var(--oxide);stroke-width:1.4;stroke-dasharray:5 3' }, s), 'a-fade', .6 + .2 * i);
    el('text', { x: x(b.plateau) - 6, y: by + bh / 2 + 5, 'text-anchor': 'end', style: 'fill:var(--paper);font-weight:600;font-size:13.5px' }, s, f0(b.plateau));
    if (whisk && b.lo) {
      const wy = by - 8;
      el('path', { d: `M${x(b.lo)} ${wy}H${x(b.hi)}M${x(b.lo)} ${wy - 4}V${wy + 4}M${x(b.hi)} ${wy - 4}V${wy + 4}`, style: 'stroke:var(--ink3);stroke-width:1.4;fill:none' }, s);
    }
    el('path', { d: `M${x(b.T1)} ${by - (whisk ? 12 : 5)}V${by + bh + 4}`, style: 'stroke:var(--ink);stroke-width:2.4' }, s);
    el('text', { x: x(b.T1) + 6, y: by + bh / 2 + 5, style: 'fill:var(--ink);font-weight:600;font-size:13.5px' }, s, `T1′ ${f0(b.T1)}`);
    if (r.ann) anim(el('text', { x: x(b.plateau) + 4, y: by + bh + 17, style: `fill:${r.col};font-weight:600;font-size:13.5px` }, s, r.ann()), 'a-fade', 1 + .2 * i);
    anim(el('text', { x: W - 4, y: by + bh / 2 + 9, 'text-anchor': 'end', style: `fill:${r.col};font:700 26px var(--d-en)` }, s, pc(b.ratio) + '%'), 'a-pop', 1.1 + .2 * i);
    const tip = () => fmt(t('ivlTip'), { row: t(r.name), p: f0(b.plateau), t: f0(b.T1), r: pc(b.ratio),
      rng: b.lo ? fmt(t('rngTip'), { lo: f0(b.lo), hi: f0(b.hi), s: f0(b.sys) }) : '' });
    hover(solid, tip); hover(gap, tip);
  });
  swatches(lgId, [['var(--oxide)', t('lgPlat')], ...(rows.some(r => r.bar) ? [['var(--steel)', t('lgPlatS')]] : []),
    ['var(--oxide-soft)', t('lgGap'), 'border:1px dashed var(--oxide)'], ['var(--ink)', t(whisk ? 'lgT1' : 'lgT1s'), 'width:3px']]);
}
function drawIvl() {
  ivlChart('cIvl', 'lgIvl', t('ivlLbl'), 330, [
    { k: 'yupu|main|whole', name: 'rMainW', col: 'var(--oxide)', ann: () => t('gapMain') },
    { k: 'yupu|erection|whole', name: 'rEreW', col: 'var(--good)', ann: () => t('gapEre') },
    { k: 'yantai|main|whole', name: 'rYtW', col: 'var(--oxide)', ann: () => t('gapYt') }], true);
  $('rdMain').textContent = pc(D.ivl['yupu|main|whole'].ratio) + '%';
  $('rdEre').textContent = pc(D.ivl['yupu|erection|whole'].ratio) + '%';
}
function drawSeg() {
  const ann = sk => () => fmt(t('segAnn'), { t: sg1(D.seg[sk].dT1), p: sg1(D.seg[sk].dPl) });
  ivlChart('cSeg', 'lgSeg', t('segLbl'), 370, [
    { k: 'yupu|main|whole', name: 'rMainW', col: 'var(--oxide)' },
    { k: 'yupu|main|stops', name: 'rMainS', col: 'var(--oxide)', ann: ann('main'), bar: 'var(--steel)' },
    { k: 'yupu|erection|whole', name: 'rEreW', col: 'var(--good)', sep: true },
    { k: 'yupu|erection|stops', name: 'rEreS', col: 'var(--amber)', ann: ann('erection'), bar: 'var(--steel)' }], false);
}

// ---------- vehicles needed at whole-yard volume: free flow to reservation, K* band, field fleets ----------
function drawNeed() {
  const W = 600, H = fitH('cNeed', W, 390), m = { l: 156, r: 16, t: 28, b: 40 };
  const s = frame('cNeed', W, H, t('needLbl'));
  const x = lin(0, 130, m.l, W - m.r), [k0, k1] = D.kstar;
  const g = el('g', { class: 'grid' }, s), a = el('g', { class: 'axis' }, s);
  anim(el('rect', { x: x(k0), y: m.t - 4, width: x(k1) - x(k0), height: H - m.b - m.t + 4, style: 'fill:var(--amber-soft)' }, s), 'a-fade', .2);
  el('text', { x: x(k1) + 4, y: m.t - 10, style: 'fill:var(--amber);font-weight:600;font-size:12.5px' }, s, t('kBand'));
  range(0, 120, 20).forEach(v => { el('line', { x1: x(v), x2: x(v), y1: m.t, y2: H - m.b }, g); el('text', { x: x(v), y: H - m.b + 17, 'text-anchor': 'middle' }, s, v); });
  el('path', { d: `M${m.l} ${H - m.b}H${W - m.r}` }, a);
  el('text', { x: (m.l + W - m.r) / 2, y: H - 6, 'text-anchor': 'middle' }, s, t('needX'));
  const band = (H - m.t - m.b) / D.need.length, GN = { 339: 'g339', 500: 'g500', 600: 'g600', 678: 'g678' };
  D.need.forEach((d, i) => {
    const yc = m.t + (i + .5) * band, first = !i || D.need[i - 1].n !== d.n, an = AN[key(d.n, d.h)];
    if (first && i) el('path', { d: `M8 ${m.t + i * band}H${W - m.r}`, style: 'stroke:var(--line);stroke-width:1.2' }, s);
    el('text', { x: m.l - 12, y: yc + (first ? -1 : 5), 'text-anchor': 'end', class: 't-strong', style: 'font-size:13.5px' }, s, fmt(t('needRow'), { n: d.n, h: d.h }));
    if (first) el('text', { x: m.l - 12, y: yc + 14, 'text-anchor': 'end', style: 'fill:var(--ink3);font-size:12px' }, s, t(GN[d.n]));
    const ln = anim(el('path', { d: `M${x(d.free)} ${yc}H${x(d.reserve)}`, style: 'stroke:var(--ink3);stroke-width:2.2' }, s), 'a-fade', .4 + .08 * i);
    const sx = x(d.segment);
    el('path', { d: `M${sx} ${yc - 5}L${sx + 5} ${yc}L${sx} ${yc + 5}L${sx - 5} ${yc}Z`, style: 'fill:var(--paper);stroke:var(--amber);stroke-width:1.6' }, s);
    anim(el('circle', { cx: x(d.free), cy: yc, r: 5.5, style: 'fill:var(--steel)' }, s), 'a-pop', .5 + .08 * i);
    anim(el('circle', { cx: x(d.reserve), cy: yc, r: 6, style: 'fill:var(--oxide)' }, s), 'a-pop', .6 + .08 * i);
    el('text', { x: x(d.free) - 9, y: yc + 4.5, 'text-anchor': 'end', style: 'fill:var(--steel);font-weight:600;font-size:13px' }, s, d.free);
    el('text', { x: x(d.reserve) + 10, y: yc + 4.5, style: 'fill:var(--oxide);font-weight:700;font-size:13.5px' }, s, d.reserve);
    if (an) {
      anim(el('text', { x: x(an.veh), y: yc + 6, 'text-anchor': 'middle', style: 'fill:var(--ink);font-size:17px' }, s, '★'), 'a-pop', 1 + .1 * i);
      el('text', { x: x(an.veh), y: yc - 9, 'text-anchor': 'middle', style: 'fill:var(--ink);font-weight:700;font-size:12.5px' }, s, an.veh);
    }
    hover(ln, () => fmt(t('needTip'), { row: fmt(t('needRow'), { n: d.n, h: d.h }), f: d.free, r: d.reserve, s: d.segment,
      a: an ? fmt(t(an.name === 'hhi' ? 'aHhi' : 'aShen'), { n: an.n, v: an.veh, h: an.h }) : '' }));
  });
  swatches('lgNeed', [['var(--steel)', t('lgFree'), 'border-radius:50%'], ['var(--oxide)', t('lgRes'), 'border-radius:50%'],
    ['var(--paper)', t('lgRef'), 'border:1.6px solid var(--amber);transform:rotate(45deg) scale(.8)'], ['var(--amber-soft)', t('lgK')]]);
  $('lgNeed').insertAdjacentHTML('beforeend', `<span><b style="font-size:15px;margin-right:4px">★</b>${t('lgField')}</span>`);
}

// ---------- route slack in the bound: [lower, upper] per scenario ----------
const SCN = { main: 'sMain', erection: 'sErection', crane: 'sCrane' };
const CLS = { gate: 'cGate', '010-6': 'cCorr' };
const resName = id => id === 'gate' ? t('gate') : fmt(t('road'), { id });
function drawSlack() {
  const W = 600, H = fitH('cSlack', W, 360), m = { l: 214, r: 104, t: 8, b: 40 };
  const s = frame('cSlack', W, H, t('slkLbl'));
  const x = lin(0, 50, m.l, W - m.r);
  const g = el('g', { class: 'grid' }, s), a = el('g', { class: 'axis' }, s);
  range(0, 50, 10).forEach(v => { el('line', { x1: x(v), x2: x(v), y1: m.t, y2: H - m.b }, g); el('text', { x: x(v), y: H - m.b + 17, 'text-anchor': 'middle' }, s, v); });
  el('path', { d: `M${m.l} ${m.t}V${H - m.b}H${W - m.r}` }, a);
  el('text', { x: (m.l + W - m.r) / 2, y: H - 6, 'text-anchor': 'middle' }, s, t('slkX'));
  const band = (H - m.t - m.b) / D.slack.length, bh = 18;
  D.slack.forEach((d, i) => {
    const y0 = m.t + i * band, yc = y0 + band / 2, row = `${t(d.yard === 'yupu' ? 'yYupu' : 'yYantai')} · ${t(SCN[d.scen])}`;
    if (i && d.yard !== D.slack[i - 1].yard) el('path', { d: `M8 ${y0}H${W - 4}`, style: 'stroke:var(--line);stroke-width:1.2' }, s);
    el('text', { x: m.l - 10, y: yc - 4, 'text-anchor': 'end', class: 't-strong', style: 'font-size:13.5px' }, s, row);
    const cls = CLS[d.res] || 'cDock';
    el('text', { x: m.l - 10, y: yc + 12, 'text-anchor': 'end', style: 'fill:var(--ink3);font-size:12px' }, s,
      cls === 'cGate' ? t('cGate') : `${resName(d.res)} · ${fmt(t(cls), { p: f1(d.pass) })}`);
    const col = cls === 'cCorr' ? 'var(--oxide)' : 'var(--steel)';
    const lo = anim(el('rect', { x: x(0), y: yc - bh / 2, width: Math.max(0, x(d.lo) - x(0)), height: bh, style: `fill:${col};opacity:.9` }, s), 'a-x', .3 + .1 * i);
    el('rect', { x: x(d.lo), y: yc - bh / 2, width: Math.max(0, x(d.hi) - x(d.lo)), height: bh, style: `fill:${col};opacity:.35` }, s);
    el('rect', { x: x(d.lo), y: yc - bh / 2, width: Math.max(0, x(d.hi) - x(d.lo)), height: bh, style: 'fill:url(#hatch);pointer-events:none' }, s);
    anim(el('text', { x: x(d.hi) + 6, y: yc + 5, style: `fill:${d.hi > 0 ? col : 'var(--ink3)'};font-weight:700;font-size:13.5px` }, s,
      d.hi > 0 ? fmt(t('slkV'), { lo: f1(d.lo), hi: f1(d.hi) }) : '0'), 'a-fade', .8 + .1 * i);
    hover(lo, () => fmt(t('slkTip'), { row, t: f0(d.T1), pp: f0(d.T1pp), lo: f1(d.lo), hi: f1(d.hi),
      x: d.alt != null ? fmt(t('slkAlt'), { a: f0(d.alt), e: d.extra }) : '' }));
  });
  swatches('lgSlack', [['var(--steel)', t('lgLo')], ['var(--steel)', t('lgHi'), 'opacity:.4;background-image:repeating-linear-gradient(45deg,transparent 0 3px,rgba(43,43,43,.55) 3px 4px)']]);
}

// ---------- the first reading: dual prices in vehicles, two columns (T23) ----------
function drawRate() {
  const W = 600, H = fitH('cRate', W, 400), m = { l: 186, r: 70, t: 26, b: 40 };
  const s = frame('cRate', W, H, t('rateLbl'));
  const x = lin(0, 8, m.l, W - m.r - 10);
  const g = el('g', { class: 'grid' }, s), a = el('g', { class: 'axis' }, s);
  range(0, 8, 2).forEach(v => { el('line', { x1: x(v), x2: x(v), y1: m.t, y2: H - m.b }, g); el('text', { x: x(v), y: H - m.b + 17, 'text-anchor': 'middle' }, s, v); });
  el('path', { d: `M${m.l} ${m.t}V${H - m.b}H${W - m.r - 10}` }, a);
  el('text', { x: (m.l + W - m.r) / 2, y: H - 6, 'text-anchor': 'middle' }, s, t('rateX'));
  el('text', { x: W - 4, y: m.t - 10, 'text-anchor': 'end', class: 't-strong', style: 'font-size:12.5px' }, s, t('rateR'));
  const band = (H - m.t - m.b) / D.rates.length, bh = Math.min(11, band * 0.26);
  D.rates.forEach((r, i) => {
    const prev = D.rates[i - 1], first = !prev || prev.yard !== r.yard || prev.scen !== r.scen;
    const n = D.rates.filter(q => q.yard === r.yard && q.scen === r.scen).length, y0 = m.t + i * band, yc = y0 + band / 2;
    const row = `${t(r.yard === 'yupu' ? 'yYupu' : 'yYantai')} · ${t(SCN[r.scen])}`, res = resName(r.res) + (r.w ? ` (${r.w} m)` : '');
    if (first && i) el('path', { d: `M8 ${y0}H${W - 4}`, style: 'stroke:var(--line);stroke-width:1.2' }, s);
    if (r.yard === 'yupu' && r.scen === 'erection') el('rect', { x: 4, y: y0 + 1, width: W - 8, height: band - 2, style: 'fill:var(--good-soft)' }, s);
    if (first) el('text', { x: m.l - 10, y: yc - 4, 'text-anchor': 'end', class: 't-strong', style: 'font-size:13.5px' }, s, row);
    el('text', { x: m.l - 10, y: first ? yc + 12 : yc + 5, 'text-anchor': 'end', style: 'fill:var(--ink3);font-size:12px' }, s, res);
    [[r.v1, 'var(--oxide)', -bh - 1], [r.v2, 'var(--steel)', 1]].forEach(([v, col, dy], q) => {
      const b = anim(el('rect', { x: x(0), y: yc + dy, width: Math.max(0, x(v) - x(0)), height: bh, style: `fill:${col}` }, s), 'a-x', .3 + .08 * i + .1 * q);
      el('text', { x: x(v) + 5, y: yc + dy + bh - 1, style: `fill:${v > 0 ? col : 'var(--ink3)'};font-weight:700;font-size:12.5px` }, s, v > 0 ? f1(v) : '0');
      hover(b, () => fmt(t('rateTip'), { row, res, p1: f1(r.p1), v1: f1(r.v1), p2: f1(r.p2), v2: f1(r.v2), hc: f1(r.perVeh) }));
    });
    if (first) el('text', { x: W - m.r / 2, y: y0 + n * band / 2 + 5, 'text-anchor': 'middle', style: 'fill:var(--ink);font-weight:600;font-size:13.5px' }, s,
      r.scen === 'crane' ? pc(r.sys) + '%†' : pc(r.mix) + '%');
  });
  swatches('lgRate', [['var(--oxide)', t('lgC1')], ['var(--steel)', t('lgC2')]]);
  $('lgRate').insertAdjacentHTML('beforeend', `<span>${t('lgDag')}</span>`);
}

// ---------- schematic: H4 criterion, dual prediction against simulation ----------
function drawH4() {
  const W = 360, H = fitH('cH4', W, 200, 0.7, 1.4), m = { l: 30, r: 10, t: 22, b: 30 };
  const s = frame('cH4', W, H, t('h4Lbl'));
  const x = lin(0, 5, m.l, W - m.r), y = lin(0, 5, H - m.b, m.t);
  el('path', { d: `M${m.l} ${m.t}V${H - m.b}H${W - m.r}`, style: 'stroke:var(--ink3);fill:none' }, s);
  el('text', { x: m.l, y: 13, class: 't-strong' }, s, t('h4Lbl'));
  el('text', { x: W - m.r, y: H - m.b + 18, 'text-anchor': 'end' }, s, t('h4X'));
  yTitle(s, m.l - 12, (m.t + H - m.b) / 2, t('h4Y'));
  el('path', { d: `M${x(0)} ${y(0)}L${x(5)} ${y(5)}`, style: 'stroke:var(--ink3);stroke-dasharray:4 4' }, s);
  const A = [[1, 0.9], [1.8, 1.9], [2.8, 2.6], [3.6, 3.7]], Bp = [[2.2, 0.35], [3.3, 0.6], [4.4, 0.45]];
  A.forEach((p, j) => anim(el('circle', { cx: x(p[0]), cy: y(p[1]), r: 5, style: 'fill:var(--good)' }, s), 'a-pop', .4 + .1 * j));
  Bp.forEach((p, j) => anim(el('circle', { cx: x(p[0]), cy: y(p[1]), r: 5, style: 'fill:var(--oxide)' }, s), 'a-pop', .8 + .1 * j));
  el('text', { x: x(0.25), y: y(4.25), style: 'fill:var(--good);font-weight:600' }, s, t('h4A'));
  el('text', { x: x(4.9), y: y(1.15), 'text-anchor': 'end', style: 'fill:var(--oxide);font-weight:600' }, s, t('h4B'));
}

// ---------- schematic: capacity against block-section length ----------
function drawBlock() {
  const W = 360, H = fitH('cBlock', W, 200, 0.7, 1.4), m = { l: 30, r: 10, t: 22, b: 30 };
  const s = frame('cBlock', W, H, t('blkLbl'));
  const x = lin(0, 10, m.l, W - m.r), y = lin(0, 10, H - m.b, m.t);
  el('path', { d: `M${m.l} ${m.t}V${H - m.b}H${W - m.r}`, style: 'stroke:var(--ink3);fill:none' }, s);
  el('text', { x: m.l, y: 13, class: 't-strong' }, s, t('blkLbl'));
  el('text', { x: (m.l + W - m.r) / 2 + 10, y: H - m.b + 18, 'text-anchor': 'middle' }, s, t('blkX'));
  yTitle(s, m.l - 12, (m.t + H - m.b) / 2, t('blkY'));
  const bound = v => 2.6 + 6.4 * Math.exp(-v / 3.2), low = 1.3;
  const ub = range(0.4, 9.6, 0.2).map(v => [x(v), y(bound(v))]);
  const band = ub.concat(range(0.4, 9.6, 0.2).reverse().map(v => [x(v), y(Math.min(low, bound(v)))]));
  anim(el('path', { d: pathOf(band) + 'Z', style: 'fill:var(--amber-soft);opacity:.9' }, s), 'a-fade', .5);
  anim(el('path', { d: pathOf(ub), pathLength: 1, style: 'stroke:var(--ink);stroke-width:2;stroke-dasharray:6 4;fill:none' }, s), 'a-fade', .3);
  el('path', { d: `M${x(0.4)} ${y(low)}H${x(9.6)}`, style: 'stroke:var(--oxide);stroke-width:1.6;fill:none' }, s);
  el('text', { x: x(3.4), y: y(bound(3.4)) - 6, style: 'fill:var(--ink);font-weight:600' }, s, 'T1′');
  el('text', { x: x(4.4), y: y((bound(4.4) + low) / 2) + 4, 'text-anchor': 'middle', style: 'fill:var(--amber);font-weight:600' }, s, t('blkBand'));
  el('text', { x: x(0.4), y: H - m.b + 18 }, s, t('blkShort'));
  el('text', { x: W - m.r, y: H - m.b + 18, 'text-anchor': 'end' }, s, t('blkLong'));
}

// ---------- numbers in the slide text, filled from the data ----------
// <span data-v="path" data-f="format">: path into V (dots separate levels; keys use '|'), formatted per F;
// data-div="<rate key>" divides by that resource's vehicle capacity H / c̄ instead (tasks a day -> vehicles)
const V = { ivl: D.ivl, seg: D.seg, RT, SL, ND, AN, probe: D.probe };
const F = { i: f0, d1: f1, s1: sg1, pc: v => pc(v) + '%', r2: v => (Math.round(v * 100) / 100).toFixed(2) };
function fillNumbers() {
  document.querySelectorAll('[data-v]').forEach(e => {
    const v = e.dataset.v.split('.').reduce((o, k) => o[k], V);
    e.textContent = e.dataset.div ? f1(v / V.RT[e.dataset.div].perVeh) : F[e.dataset.f || 'i'](v);
  });
}

Deck.start({
  strings: T,
  sections: { intro: ['导读', 'Overview', '개요'], q: ['问题与定位', 'Question and position', '질문과 위치'], rule: ['分界规则与改造菜单', 'Dividing rule and menu', '경계 규칙과 메뉴'],
    res: ['已有结果', 'Results so far', '현재 결과'], theory: ['汇率与协同设计', 'Exchange rate and co-design', '환율과 협동 설계'], h7: ['车型与占路', 'Vehicle type', '차종과 점유'],
    status: ['进度与去向', 'Progress and venues', '진행과 투고처'], ref: ['参考文献', 'References', '참고문헌'], end: ['结语', 'Close', '맺음'] },
  draw: [drawIvl, drawSeg, drawNeed, drawSlack, drawRate, drawH4, drawBlock, fillNumbers],
});
})();
