// Dock-mouth deck: the strings and charts of this briefing.
// Paging, language, notes, contents, glossary, layout and the PDF link come from ../shared/deck-core.js (README.md).
(() => {
'use strict';
const D = window.DATA;
const { LI, $, el, frame, fitH, anim, spread, lin, yTitle, swatches, hover, fmt } = Deck;

// ---------- strings used inside charts and generated text: [zh, en, ko] ----------
const T = {
  title: ['坞口与搭载高峰 · 分项研究', 'Dock Mouth', '도크 입구 · 세부 연구'],
  yupu: ['玉浦', 'Okpo', '옥포'], yantai: ['烟台', 'Yantai', '옌타이'],
  reserve: ['整条路径预约', 'Whole-route reservation', '전체 경로 예약'],
  segment: ['逐段申请·参照规则（瞬移疏解）', 'Segment request · reference rule (teleport clearing)', '구간별 요청 · 참조 규칙 (순간이동 해소)'],
  segShort: ['逐段申请（参照规则）', 'Segment request (reference rule)', '구간별 요청 (참조 규칙)'],
  thr: ['饱和平台（任务 / 16 h）', 'Saturated plateau (tasks / 16 h)', '포화 평탄 (작업 / 16시간)'],
  rhoX: ['吊车利用率 ρ', 'Crane utilisation ρ', '크레인 이용률 ρ'],
  rhoLbl: ['吊车利用率与饱和平台', 'Crane utilisation against the saturated plateau', '크레인 이용률과 포화 평탄 구간'],
  base: ['不受吊车约束 {v}', 'no crane limit {v}', '크레인 제약 없음 {v}'],
  work: ['玉浦工作点区间（情景读数）', 'Okpo working-point range (scenario reading)', '옥포 작업점 구간 (시나리오 판독)'],
  workY: ['烟台本厂工作点', "Yantai's own working point", '옌타이 자체 작업점'],
  hollow: ['空心 = 非稳态', 'hollow = not steady', '빈 점 = 비정상 상태'],
  rhoTip: ['{yard} · {m}<br>ρ = {r}（搭载 {n} 个/日）<br>平台 {v}（相对不受吊车约束 {rel}%）<br>逐日趋势 {tr}%{st}', '{yard} · {m}<br>ρ = {r} ({n} erections a day)<br>plateau {v} ({rel}% against no crane limit)<br>daily trend {tr}%{st}', '{yard} · {m}<br>ρ = {r} (하루 탑재 {n}건)<br>평탄 {v} (크레인 제약 없음 대비 {rel}%)<br>일별 추세 {tr}%{st}'],
  unsteady: ['；K = {k} 非稳态', '; not steady at K = {k}', ', K = {k} 비정상'],
  // readings next to the rho chart
  rdRes: ['整条路径预约（路外等待）的平台，全部 ρ 档；不受吊车约束时 {b}', 'Reservation plateau (waiting off-road) over every ρ; {b} with no crane limit', '예약 (도로 밖 대기) 평탄 구간, 모든 ρ, 크레인 제약 없을 때 {b}'],
  rdLowY: ['逐段申请（参照规则）在 ρ ≤ 0.79 时相对不受吊车约束的 {b}', 'Segment request (reference rule) for ρ ≤ 0.79, against {b} with no crane limit', '구간별 요청 (참조 규칙), ρ ≤ 0.79에서 크레인 제약 없음 {b} 대비'],
  rdLowT: ['逐段申请（参照规则）在本厂 ρ = 0.13 时相对不受吊车约束的 {b}', "Segment request (reference rule) at Yantai's own ρ = 0.13, against {b} with no crane limit", '구간별 요청 (참조 규칙), 자체 ρ = 0.13에서 크레인 제약 없음 {b} 대비'],
  rdDropY: ['ρ = 0.88（主值，稳态）/ 0.97（区间上端，8 天内持续下降、没有平台）', 'ρ = 0.88 (main value, steady) / 0.97 (upper end, falling for 8 days, no plateau)', 'ρ = 0.88 (주값, 정상) / 0.97 (상단, 8일 내내 하락, 평탄 구간 없음)'],
  rdDropT: ['ρ = 0.73 / 0.92：坞前道路本来就忙，比玉浦更早下降', 'ρ = 0.73 / 0.92: the dock roads are busy already, so it falls earlier than Okpo', 'ρ = 0.73 / 0.92: 도크 앞 도로가 원래 바빠 옥포보다 일찍 하락'],
  rdLP: ['P6 固定的线性规划坞口裕度，各 ρ 下几乎不变：上界看不到排队造成的时间阻塞', 'Dock margin of the LP with P6 fixed, nearly constant over ρ: the bound cannot see queue-induced time blocking', 'P6 고정 LP의 도크 여유, ρ에 거의 무관: 상한은 대기열이 만든 시간 차단을 보지 못함'],
  // dock road held
  busyLbl: ['坞前停靠路段被占的时间比例', 'Share of time the dock stopping road is held', '도크 정차 구간 점유 시간 비율'],
  busyY: ['被占比例（饱和，K = 150）', 'Held (saturated, K = 150)', '점유 비율 (포화, K = 150)'],
  busyTip: ['玉浦 · {m}<br>ρ = {r}：被占 {v}%', 'Okpo · {m}<br>ρ = {r}: held {v}%', '옥포 · {m}<br>ρ = {r}: 점유 {v}%'],
  // fleet size curves
  K: ['车队规模 K（台）', 'Fleet size K (vehicles)', '차량군 규모 K (대)'],
  thrK: ['饱和吞吐（任务 / 16 h）', 'Saturated throughput (tasks / 16 h)', '포화 처리량 (작업 / 16시간)'],
  kLbl: ['各吊车负荷下饱和吞吐随车队规模', 'Saturated throughput against fleet size at each crane load', '크레인 부하별 차량군 규모에 따른 포화 처리량'],
  kTip: ['{yard} · {m}<br>ρ = {r}，K = {k}：{v} 个/日<br>逐日趋势 {tr}%{st}', '{yard} · {m}<br>ρ = {r}, K = {k}: {v} a day<br>daily trend {tr}%{st}', '{yard} · {m}<br>ρ = {r}, K = {k}: 하루 {v}건<br>일별 추세 {tr}%{st}'],
  notSteady: ['（非稳态）', ' (not steady)', ' (비정상)'],
  resAt: ['整条路径预约，ρ = {r}', 'Reservation, ρ = {r}', '예약, ρ = {r}'],
  segHdr: ['逐段申请（参照规则）：', 'Segment request (reference rule):', '구간별 요청 (참조 규칙):'],
  tYard: ['船厂', 'Yard', '조선소'], tRho: ['吊车负荷', 'Crane load', '크레인 부하'], tDrop: ['K 增大时的吞吐（逐段，参照规则）', 'Throughput as K grows (segment, reference rule)', 'K 증가 시 처리량 (구간별, 참조 규칙)'],
  // probe
  prLbl: ['作者探针：道路161 的三种改动', "The author's probe: three changes to road 161", '저자 탐침: 도로161의 세 가지 변경'],
  prY: ['任务 / 16 h', 'tasks / 16 h', '작업 / 16시간'],
  prG: [['T1′ 上界', 'T1′ bound', 'T1′ 상한'], ['整条路径预约', 'Reservation', '예약'], ['逐段（参照规则）', 'Segment (reference)', '구간별 (참조)']],
  prV: [['现模型（整段）', 'Current (whole road)', '현 모형 (전 구간)'], ['改宽 12 m', 'Widened to 12 m', '12 m 확폭'], ['分段闭塞', 'Split at stops', '정차 지점별 분할'], ['分段 + 会车点', 'Split + passing bays', '분할 + 대피 구간']],
  prNote: ['搭载组合，饱和，K = 100（仿真 3 个种子）', 'Erection mix, saturated, K = 100 (simulation, 3 seeds)', '탑재 조합, 포화, K = 100 (시뮬레이션 시드 3개)'],
  prTip: ['{g} · {v}：{n}（相对现模型 {d}%）', '{g} · {v}: {n} ({d}% against current)', '{g} · {v}: {n} (현 모형 대비 {d}%)'],
  // deadlocks
  dReg: ['常规日（K = {k}）', 'regular day (K = {k})', '평상일 (K = {k})'], dPeak: ['高峰日（K = {k}）', 'peak day (K = {k})', '피크일 (K = {k})'],
  dSat: ['饱和，K = {k}', 'saturated, K = {k}', '포화, K = {k}'],
  dOff: ['K = 100 时至少 {h} 车·时/日不在路网上，占全天车时的 {p}%。', 'At K = 100 at least {h} vehicle-hours a day, {p}% of the fleet\'s day, are off the network.', 'K = 100에서 하루 최소 {h} 차량·시간, 전체의 {p}%가 도로망 밖에 있다.'],
};
const t = k => T[k][LI[Deck.lang]];
const tt = a => a[LI[Deck.lang]];
const MC = { reserve: 'var(--oxide)', segment: 'var(--amber-hi)' };
const f0 = v => Math.round(v).toLocaleString('en-US');
const half = v => Math.floor(v + 0.5);   // half up, as the review rounds
function niceStep(top) { const p = 10 ** Math.floor(Math.log10(top / 6)); return [1, 2, 2.5, 5, 10].map(k => k * p).find(s => top / s <= 6); }
function axes(s, x, y, xt, yt, W, H, m, fx = v => v, fy = v => v) {
  const g = el('g', { class: 'grid' }, s), a = el('g', { class: 'axis' }, s);
  yt.forEach(v => { el('line', { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v) }, g); el('text', { x: m.l - 8, y: y(v) + 4, 'text-anchor': 'end' }, s, fy(v)); });
  xt.forEach(v => el('text', { x: x(v), y: H - m.b + 17, 'text-anchor': 'middle' }, s, fx(v)));
  el('path', { d: `M${m.l} ${m.t}V${H - m.b}H${W - m.r}` }, a);
}
const range = (a, b, st) => { const r = []; for (let v = a; v <= b + 1e-9; v += st) r.push(+v.toFixed(6)); return r; };
const pathOf = pts => pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('');
const sgn = v => (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(1);
// marker shapes for the working points
function marker(s, kind, cx, cy, c) {
  const r = 8;
  const d = kind === 'star'
    ? Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? r * 0.45 : r * 1.15; return (i ? 'L' : 'M') + (cx + q * Math.cos(a)).toFixed(1) + ' ' + (cy + q * Math.sin(a)).toFixed(1); }).join('') + 'Z'
    : kind === 'down' ? `M${cx - r} ${cy - r * 0.7}H${cx + r}L${cx} ${cy + r * 0.9}Z` : `M${cx - r} ${cy + r * 0.7}H${cx + r}L${cx} ${cy - r * 0.9}Z`;
  return el('path', { d, style: `fill:${c};stroke:var(--ink);stroke-width:1` }, s);
}

// ---------- the rho curve ----------
let rYard = 'yupu';
function drawRho() {
  const P = D.rho[rYard], B = D.base[rYard], okpo = rYard === 'yupu';
  const W = 560, H = fitH('cRho', W, 380), m = { l: 58, r: 16, t: 16, b: 46 };
  const s = frame('cRho', W, H, t('rhoLbl'));
  const x0 = okpo ? 0.5 : 0.1, x = lin(x0, 1, m.l, W - m.r);
  const top0 = 1.12 * B.segment, st = niceStep(top0), yTop = Math.ceil(top0 / st) * st, y = lin(0, yTop, H - m.b, m.t);
  axes(s, x, y, range(x0, 1, 0.1), range(0, yTop, st), W, H, m, v => v.toFixed(1), f0);
  el('text', { x: (m.l + W - m.r) / 2, y: H - 6, 'text-anchor': 'middle' }, s, t('rhoX'));
  yTitle(s, 14, (m.t + H - m.b) / 2, t('thr'));
  // working points
  const wk = okpo ? ['p6lo', 'crane', 'p6hi'] : ['crane'];
  const wp = wk.map(k => P.find(p => p.key === k));
  if (okpo) {
    el('rect', { x: x(wp[0].rho), y: m.t, width: x(wp[2].rho) - x(wp[0].rho), height: H - m.b - m.t, style: 'fill:var(--amber-soft);opacity:.75' }, s);
    el('text', { x: x(wp[0].rho) - 6, y: m.t + 14, 'text-anchor': 'end', style: 'fill:var(--amber);font-weight:600' }, s, t('work'));
  } else {
    el('path', { d: `M${x(wp[0].rho)} ${m.t}V${H - m.b}`, style: 'stroke:var(--amber);stroke-dasharray:3 3' }, s);
    el('text', { x: x(wp[0].rho) + 6, y: m.t + 14, style: 'fill:var(--amber);font-weight:600' }, s, t('workY'));
  }
  // crane-free levels
  ['segment', 'reserve'].forEach(md => {
    el('path', { d: `M${m.l} ${y(B[md])}H${W - m.r}`, style: `stroke:${MC[md]};stroke-width:1.3;stroke-dasharray:6 4;opacity:.8` }, s);
    el('text', { x: m.l + 6, y: y(B[md]) - 6, style: `fill:${md === 'segment' ? 'var(--amber)' : 'var(--oxide)'};font-size:12px` }, s, fmt(t('base'), { v: f0(B[md]) }));
  });
  ['reserve', 'segment'].forEach((md, i) => {
    anim(el('path', { d: pathOf(P.map(p => [x(p.rho), y(p[md].plat)])), pathLength: 1, style: `stroke:${MC[md]};stroke-width:2.8;fill:none;stroke-linejoin:round` }, s), 'a-draw', .25 + .3 * i);
    P.forEach((p, j) => {
      const r = p[md], bad = r.unsteady.length > 0, cx = x(p.rho), cy = y(r.plat);
      const k = md === 'segment' ? wk.indexOf(p.key) : -1;
      const c = k >= 0
        ? marker(s, okpo ? ['down', 'star', 'up'][k] : 'star', cx, cy, bad ? 'var(--paper)' : MC[md])
        : el('circle', { cx, cy, r: 4, style: `fill:${bad ? 'var(--paper)' : MC[md]};stroke:${bad ? MC[md] : 'var(--paper)'};stroke-width:${bad ? 2 : 1}` }, s);
      if (k >= 0 && bad) c.style.stroke = MC[md], c.style.strokeWidth = 2;
      anim(c, 'a-pop', .9 + .3 * spread(j + 5 * i));
      hover(c, () => fmt(t('rhoTip'), { yard: t(rYard), m: t(md === 'segment' ? 'segShort' : 'reserve'), r: p.rho.toFixed(2), n: p.n6, v: r.plat.toFixed(1), rel: sgn(r.rel), tr: sgn(r.trend), st: bad ? fmt(t('unsteady'), { k: r.unsteady.join(', ') }) : '' }));
    });
  });
  swatches('lgRho', [[MC.reserve, t('reserve')], [MC.segment, t('segment')], ['var(--paper)', t('hollow'), 'border:2px solid var(--ink3);border-radius:50%']]);
  // readings
  const stat = (num, p) => `<div class="stat"><span class="num">${num}</span><p>${p}</p></div>`;
  const res = P.map(p => p.reserve.plat), at = k => P.find(p => p.key === k).segment;
  const mg = P.map(p => p.segment.margin);
  const mgTxt = Math.min(...mg) === Math.max(...mg) ? Math.min(...mg).toFixed(2) : `${Math.min(...mg).toFixed(2)}–${Math.max(...mg).toFixed(2)}`;
  const low = okpo ? Math.max(...P.filter(p => p.rho <= 0.795).map(p => Math.abs(p.segment.rel))) : at('crane').rel;
  $('rhoRead').innerHTML = stat(`${f0(Math.min(...res))}–${f0(Math.max(...res))}`, fmt(t('rdRes'), { b: f0(B.reserve) }))
    + stat(okpo ? `≤ ±${low.toFixed(1)}%` : `${sgn(low)}%`, fmt(t(okpo ? 'rdLowY' : 'rdLowT'), { b: f0(B.segment) }))
    + stat(okpo ? `${sgn(at('crane').rel)}% / ${sgn(at('p6hi').rel)}%` : `${sgn(at('rho11').rel)}% / ${sgn(at('rho14').rel)}%`, t(okpo ? 'rdDropY' : 'rdDropT'))
    + stat(mgTxt, t('rdLP'));
  document.querySelectorAll('#rhoYard button').forEach(b => b.setAttribute('aria-pressed', b.dataset.v === rYard));
}

// ---------- where vehicles wait: dock stopping road held at K = 150 (Okpo) ----------
function drawBusy() {
  const P = D.rho.yupu;
  const W = 520, H = fitH('cBusy', W, 230, 0.8, 1.4), m = { l: 50, r: 14, t: 12, b: 40 };
  const s = frame('cBusy', W, H, t('busyLbl'));
  const x = lin(0.5, 1, m.l, W - m.r), y = lin(0, 100, H - m.b, m.t);
  axes(s, x, y, range(0.5, 1, 0.1), [0, 25, 50, 75, 100], W, H, m, v => v.toFixed(1), v => v + '%');
  el('text', { x: (m.l + W - m.r) / 2, y: H - 5, 'text-anchor': 'middle' }, s, t('rhoX'));
  yTitle(s, 12, (m.t + H - m.b) / 2, t('busyY'));
  ['reserve', 'segment'].forEach((md, i) => {
    anim(el('path', { d: pathOf(P.map(p => [x(p.rho), y(p[md].busy150)])), pathLength: 1, style: `stroke:${MC[md]};stroke-width:2.6;fill:none` }, s), 'a-draw', .2 + .3 * i);
    P.forEach((p, j) => {
      const c = anim(el('circle', { cx: x(p.rho), cy: y(p[md].busy150), r: 3.5, style: `fill:${MC[md]};stroke:var(--paper);stroke-width:1` }, s), 'a-pop', .8 + .3 * spread(j + 4 * i));
      hover(c, () => fmt(t('busyTip'), { m: t(md === 'segment' ? 'segShort' : 'reserve'), r: p.rho.toFixed(2), v: p[md].busy150.toFixed(0) }));
    });
  });
  swatches('lgBusy', [[MC.reserve, t('reserve')], [MC.segment, t('segShort')]]);
}

// ---------- H2: saturated throughput against fleet size at several crane loads ----------
let kYard = 'yupu';
const KSEL = { yupu: ['rho8', 'crane', 'rho14', 'p6hi', 'rho15'], yantai: ['crane', 'rho11', 'rho12', 'rho14', 'rho15'] };
const KC = ['var(--steel)', 'var(--good)', 'var(--amber-hi)', 'var(--amber)', 'var(--oxide)'];
function drawK() {
  const C = D.curves[kYard], sel = KSEL[kYard].map(k => C.find(c => c.key === k));
  const W = 560, H = fitH('cK', W, 380), m = { l: 58, r: 16, t: 16, b: 46 };
  const s = frame('cK', W, H, t('kLbl'));
  const top0 = 1.1 * Math.max(...sel.flatMap(c => c.segment.map(v => v[0]))), st = niceStep(top0), yTop = Math.ceil(top0 / st) * st;
  const x = lin(0, 150, m.l, W - m.r), y = lin(0, yTop, H - m.b, m.t);
  axes(s, x, y, range(0, 150, 25), range(0, yTop, st), W, H, m, v => v, f0);
  el('text', { x: (m.l + W - m.r) / 2, y: H - 6, 'text-anchor': 'middle' }, s, t('K'));
  yTitle(s, 14, (m.t + H - m.b) / 2, t('thrK'));
  const last = sel[sel.length - 1];   // reservation at the highest load, for contrast
  anim(el('path', { d: pathOf(last.K.map((k, j) => [x(k), y(last.reserve[j][0])])), pathLength: 1, style: 'stroke:var(--ink3);stroke-width:2.2;fill:none;stroke-dasharray:7 4' }, s), 'a-fade', .2);
  const pts = (c, md, col, i) => c.K.forEach((k, j) => {
    const [v, ok, tr] = c[md][j];
    const p = anim(el('circle', { cx: x(k), cy: y(v), r: 3.6, style: ok ? `fill:${col};stroke:var(--paper);stroke-width:1` : `fill:var(--paper);stroke:${col};stroke-width:2` }, s), 'a-pop', .8 + .25 * spread(j + 7 * i));
    hover(p, () => fmt(t('kTip'), { yard: t(kYard), m: t(md === 'segment' ? 'segShort' : 'reserve'), r: c.rho.toFixed(2), k, v: v.toFixed(1), tr: sgn(tr), st: ok ? '' : t('notSteady') }));
  });
  pts(last, 'reserve', 'var(--ink3)', 9);
  sel.forEach((c, i) => {
    anim(el('path', { d: pathOf(c.K.map((k, j) => [x(k), y(c.segment[j][0])])), pathLength: 1, style: `stroke:${KC[i]};stroke-width:2.6;fill:none;stroke-linejoin:round` }, s), 'a-draw', .3 + .2 * i);
    pts(c, 'segment', KC[i], i);
  });
  swatches('lgK', [['transparent', t('segHdr'), 'width:0;border:0']].concat(sel.map((c, i) => [KC[i], `ρ = ${c.rho.toFixed(2)}`]))
    .concat([['none', fmt(t('resAt'), { r: last.rho.toFixed(2) }), 'width:18px;height:0;border:0;border-top:2.5px dashed var(--ink3);border-radius:0'], ['var(--paper)', t('hollow'), 'border:2px solid var(--ink3);border-radius:50%']]));
  document.querySelectorAll('#kYard button').forEach(b => b.setAttribute('aria-pressed', b.dataset.v === kYard));
}

// ---------- the decline table (review section 2.5, recomputed from the batches) ----------
function fillDrop() {
  const rows = [['yupu', 'p6hi', [100, 120, 150]], ['yupu', 'rho15', [100, 150]], ['yantai', 'rho14', [40, 150]], ['yantai', 'rho15', [40, 150]]];
  $('dropTbl').innerHTML = `<thead><tr><th>${t('tYard')}</th><th>${t('tRho')}</th><th>${t('tDrop')}</th></tr></thead><tbody>`
    + rows.map(([yd, key, Ks]) => {
      const c = D.curves[yd].find(q => q.key === key);
      const v = Ks.map(k => f0(half(c.segment[c.K.indexOf(k)][0]))).join(' → ');
      return `<tr><td>${t(yd)}</td><td class="mono">ρ = ${c.rho.toFixed(2)}</td><td class="mono">${v} <span class="tiny">(K = ${Ks.join(Ks.length > 2 ? ' / ' : ' → ')})</span></td></tr>`;
    }).join('') + '</tbody>';
}

// ---------- the author's probe ----------
function drawProbe() {
  const Pr = D.probe, G = [Pr.T1t, Pr.res, Pr.seg], VC = ['var(--ink3)', 'var(--steel)', 'var(--good)', 'var(--good)'];
  const W = 560, H = fitH('cProbe', W, 380), m = { l: 56, r: 10, t: 26, b: 46 };
  const s = frame('cProbe', W, H, t('prLbl'));
  const top0 = 1.12 * Math.max(...G.flat()), st = niceStep(top0), yTop = Math.ceil(top0 / st) * st;
  const y = lin(0, yTop, H - m.b, m.t), gw = (W - m.l - m.r) / 3, bw = 34, gap = 4;
  const g = el('g', { class: 'grid' }, s);
  range(0, yTop, st).forEach(v => { el('line', { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v) }, g); el('text', { x: m.l - 8, y: y(v) + 4, 'text-anchor': 'end' }, s, f0(v)); });
  el('path', { d: `M${m.l} ${m.t}V${H - m.b}H${W - m.r}`, style: 'stroke:var(--ink3);fill:none' }, s);
  yTitle(s, 14, (m.t + H - m.b) / 2, t('prY'));
  el('text', { x: m.l + 4, y: 14, style: 'fill:var(--ink3);font-size:12px' }, s, t('prNote'));
  G.forEach((vals, gi) => {
    const cx = m.l + gw * (gi + 0.5), x0 = cx - (4 * bw + 3 * gap) / 2;
    el('text', { x: cx, y: H - m.b + 18, 'text-anchor': 'middle', style: 'fill:var(--ink);font-weight:600' }, s, tt(T.prG[gi]));
    vals.forEach((v, vi) => {
      const bx = x0 + vi * (bw + gap);
      const r = anim(el('rect', { x: bx, y: y(v), width: bw, height: y(0) - y(v), style: `fill:${VC[vi]};${vi === 3 ? 'fill-opacity:.45;stroke:var(--good);stroke-width:1.5' : ''}` }, s), 'a-fade', .2 + .12 * vi + .25 * gi);
      el('text', { x: bx + bw / 2, y: y(v) - 5, 'text-anchor': 'middle', style: 'fill:var(--ink2);font-size:12px' }, s, f0(v));
      hover(r, () => fmt(t('prTip'), { g: tt(T.prG[gi]), v: tt(T.prV[vi]), n: f0(v), d: sgn(100 * (v / vals[0] - 1)) }));
    });
  });
  swatches('lgProbe', T.prV.map((v, i) => [VC[i], tt(v), i === 3 ? 'opacity:.45;border:1.5px solid var(--good)' : '']));
}

// ---------- deadlock counts ----------
function fillDead() {
  const d = D.dead, n = (v, k, lbl) => `<div><b>${f0(v)}</b><span>${fmt(t(lbl), { k })}</span></div>`;
  $('deadNums').innerHTML = n(d.regular[1], d.regular[0], 'dReg') + n(d.peak[1], d.peak[0], 'dPeak') + n(d.sat100[1], d.sat100[0], 'dSat') + n(d.sat150[1], d.sat150[0], 'dSat');
  $('deadOff').textContent = fmt(t('dOff'), { h: d.offnet100, p: d.offshare100 });
}

function init() {
  $('rhoYard').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { rYard = b.dataset.v; drawRho(); } });
  $('kYard').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { kYard = b.dataset.v; drawK(); } });
}

Deck.start({
  strings: T,
  sections: { intro: ['导读', 'Overview', '개요'], q: ['问题与定位', 'Question and position', '질문과 위치'], res: ['吊车与 ρ 曲线', 'Cranes and the ρ curve', '크레인과 ρ 곡선'],
    mech: ['机理与建模选择', 'Mechanism and modelling', '메커니즘과 모형 선택'], h2: ['下降何时出现', 'When the decline appears', '하락은 언제 나타나는가'],
    prop: ['坞口命题与浮坞', 'Proposition and floating docks', '명제와 플로팅 도크'], status: ['进度与计划', 'Progress and plan', '진행과 계획'],
    pub: ['候选期刊', 'Candidate journals', '후보 학술지'], ref: ['参考文献', 'References', '참고문헌'], end: ['结尾', 'Close', '마무리'] },
  draw: [drawRho, drawBusy, drawK, fillDrop, drawProbe, fillDead],
  init,
});
})();
