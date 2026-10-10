// Thesis storyline briefing ("The Thesis Story"): the strings and charts of this briefing.
// The chart data are the thesis deck's (../thesis/data.js, written by thesis/make_data.py from reviewed thesis-core results).
// Paging, language, notes, contents, glossary, layout and the PDF link come from ../shared/deck-core.js (README.md).
(() => {
'use strict';
const D = window.DATA;
const { LI, $, el, frame, fitH, anim, spread, lin, yTitle, swatches, hover, fmt } = Deck;

// ---------- strings used inside charts: [zh, en, ko] ----------
const T = {
  title: ['一个故事讲完整个博士课题', 'The Thesis as One Story', '이야기로 보는 박사 연구'],
  yupu: ['玉浦', 'Okpo', '옥포'], yantai: ['烟台', 'Yantai', '옌타이'],
  free: ['自由流', 'Free flow', '자유류'], reserve: ['整条路径预约', 'Whole-route reservation', '전체 경로 예약'],
  segment: ['逐段申请（参照）', 'Segment request (reference)', '구간별 요청 (참조)'],
  segment_safe: ['安全放行', 'Safe release', '안전 출발'],
  K: ['车队规模 K（台）', 'Fleet size K (vehicles)', '차량군 규모 K (대)'],
  thr: ['日吞吐（任务 / 16 h）', 'Daily throughput (tasks / 16 h)', '일일 처리량 (작업 / 16시간)'],
  t1: ['路网上界 T1′ {v}', 'Network bound T1′ {v}', '도로망 상한 T1′ {v}'],
  t1y: ['{y} 上界 {v}', '{y} bound {v}', '{y} 상한 {v}'],
  freeOut: ['自由流 K = 150：{v} ↑', 'free flow at K = 150: {v} ↑', '자유류 K = 150: {v} ↑'],
  tip: ['{m}<br>K = {k}：每天 {v} 个（种子范围 {lo}–{hi}）', '{m}<br>K = {k}: {v} a day (seeds {lo}–{hi})', '{m}<br>K = {k}: 하루 {v}건 (시드 범위 {lo}–{hi})'],
  flagLbl: ['玉浦：车队规模与日吞吐', 'Okpo: fleet size against daily throughput', '옥포: 차량군 규모와 일일 처리량'],
  rd80: ['K = 80 时：自由流 {f}，预约只有 {r}，是它的 {p}%', 'At K = 80: free flow {f}, reservation only {r}, {p}% of it', 'K = 80일 때: 자유류 {f}, 예약은 {r}로 그 {p}%'],
  // two yards
  yardLbl: ['两座船厂：整条路径预约下的日吞吐', 'Two yards: daily throughput under whole-route reservation', '두 조선소: 전체 경로 예약의 일일 처리량'],
  yres: ['{y}（预约）', '{y} (reservation)', '{y} (예약)'],
  kstar: ['{y} K* ≈ {k}', '{y} K* ≈ {k}', '{y} K* ≈ {k}'],
  t1Leg: ['路网上界 T1′（虚线）', 'Network bound T1′ (dashed)', '도로망 상한 T1′ (점선)'],
  // work zones
  workLbl: ['玉浦：日任务量与所需车数', 'Okpo: daily volume against vehicles needed', '옥포: 일일 작업량과 필요 차량'],
  wX: ['日任务量（个 / 日）', 'Daily task volume (a day)', '일일 작업량 (건 / 일)'],
  wY: ['所需车数（台）', 'Vehicles needed', '필요 차량 수 (대)'],
  kstarBand: ['开始受路网约束：K* 50–60', 'Network limits begin: K* 50–60', '도로망 제약 시작: K* 50–60'],
  own: ['日均 339', 'mean 339', '평균 339'], peak: ['高峰 678', 'peak 678', '피크 678'],
  hhi: ['现代重工 24 台（24 h）', 'Hyundai Heavy, 24 (24 h)', '현대중공업 24대 (24 h)'],
  shen: ['Shen 2018 约 30 台', 'Shen 2018, about 30', 'Shen 2018 약 30대'],
  anchors: ['现场车队', 'Field fleets', '현장 차량군'],
  over: ['> 150', '> 150', '> 150'],
  wTip: ['{m} · 每天 {n} 个<br>所需 {k} 台', '{m} · {n} a day<br>{k} vehicles needed', '{m} · 하루 {n}건<br>필요 {k}대'],
  wRead: ['{d}：日均 339 个要 {a} 台，高峰 678 个要 {b} 台（整条路径预约）', '{d}: {a} vehicles for the mean of 339, {b} for the peak of 678 (whole-route reservation)', '{d}: 평균 339건에 {a}대, 피크 678건에 {b}대 (전체 경로 예약)'],
  d16: ['16 h 工作日', '16-h day', '16시간 작업일'], d24: ['24 h 工作日', '24-h day', '24시간 작업일'],
  // safe release
  safeLbl: ['玉浦：安全放行与整条路径预约', 'Okpo: safe release against whole-route reservation', '옥포: 안전 출발과 전체 경로 예약'],
  safeEnd: ['安全放行：车越多越低', 'Safe release: lower with more vehicles', '안전 출발: 차가 많을수록 낮아짐'],
  resEnd: ['预约：走平', 'Reservation: levels off', '예약: 평탄'],
};
const t = k => T[k][LI[Deck.lang]];
const MC = { free: 'var(--steel)', reserve: 'var(--oxide)', segment: 'var(--amber)', segment_safe: 'var(--good)' };
const YC = { yupu: 'var(--oxide)', yantai: 'var(--amber)' };
const f0 = v => Math.round(v).toLocaleString('en-US');
const range = (a, b, st) => { const r = []; for (let v = a; v <= b + 1e-9; v += st) r.push(v); return r; };
const pathOf = pts => pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('');
function axes(s, x, y, xt, yt, W, H, m, fx = v => v, fy = v => v) {
  const g = el('g', { class: 'grid' }, s), a = el('g', { class: 'axis' }, s);
  yt.forEach(v => { el('line', { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v) }, g); el('text', { x: m.l - 8, y: y(v) + 4, 'text-anchor': 'end' }, s, fy(v)); });
  xt.forEach(v => el('text', { x: x(v), y: H - m.b + 17, 'text-anchor': 'middle' }, s, fx(v)));
  el('path', { d: `M${m.l} ${m.t}V${H - m.b}H${W - m.r}` }, a);
}
// a K-axis chart frame: returns the svg, scales and a clipped group for the curves
function kFrame(id, label, yTop, yStep, H0 = 360) {
  const W = 560, H = fitH(id, W, H0), m = { l: 58, r: 16, t: 14, b: 46 };
  const s = frame(id, W, H, label);
  const x = lin(0, 150, m.l, W - m.r), y = lin(0, yTop, H - m.b, m.t);
  axes(s, x, y, range(0, 150, 25), range(0, yTop, yStep), W, H, m, v => v, f0);
  el('text', { x: (m.l + W - m.r) / 2, y: H - 6, 'text-anchor': 'middle' }, s, t('K'));
  yTitle(s, 14, (m.t + H - m.b) / 2, t('thr'));
  const clip = id + 'Clip';
  el('rect', { x: m.l, y: m.t, width: W - m.l - m.r, height: H - m.t - m.b }, el('clipPath', { id: clip }, el('defs', {}, s)));
  return { s, x, y, W, H, m, g: el('g', { 'clip-path': `url(#${clip})` }, s) };
}
// one model's curve: min–max band, mean line, hover points every 10 vehicles past K = 40
function curve(c, C, md, color, d, label, dash = '') {
  const pts = C.K.map((k, j) => [k, ...C[md][j]]);
  el('path', { d: pathOf(pts.map(p => [c.x(p[0]), c.y(p[3])])) + pathOf(pts.slice().reverse().map(p => [c.x(p[0]), c.y(p[2])])).replace('M', 'L') + 'Z', style: `fill:${color};opacity:.12` }, c.g);
  anim(el('path', { d: pathOf(pts.map(p => [c.x(p[0]), c.y(p[1])])), pathLength: 1, style: `stroke:${color};stroke-width:${dash ? 2 : 2.6};fill:none;stroke-linejoin:round;${dash}` }, c.g), dash ? 'a-fade' : 'a-draw', d);
  pts.forEach((p, j) => {
    if (p[0] > 40 ? p[0] % 10 : p[0] % 5) return;
    const e = anim(el('circle', { cx: c.x(p[0]), cy: c.y(p[1]), r: 2.8, style: `fill:${color};stroke:var(--paper);stroke-width:1` }, c.g), 'a-pop', d + .6 + .3 * spread(j));
    hover(e, () => fmt(t('tip'), { m: label, k: p[0], v: p[1].toFixed(0), lo: p[2].toFixed(0), hi: p[3].toFixed(0) }));
  });
  return pts;
}
const at = (C, md, k) => C[md][C.K.indexOf(k)][0];

// ---------- step 2: the flag curves at Okpo ----------
function drawFlag() {
  const F = D.flag.yupu, C = F.saturated, c = kFrame('cFlag', t('flagLbl'), 2000, 500);
  el('path', { d: `M${c.m.l} ${c.y(F.T1t[0])}H${c.W - c.m.r}`, style: 'stroke:var(--ink);stroke-width:1.6;stroke-dasharray:7 4' }, c.s);
  el('text', { x: c.m.l + 8, y: c.y(F.T1t[0]) - 6, style: 'fill:var(--ink);font-weight:600' }, c.s, fmt(t('t1'), { v: f0(F.T1t[0]) }));
  [['free', 0], ['reserve', 1], ['segment', 2]].forEach(([md, i]) => curve(c, C, md, MC[md], .2 + .3 * i, t(md), md === 'segment' ? 'stroke-dasharray:7 4;' : ''));
  el('text', { x: c.W - c.m.r - 4, y: c.m.t + 14, 'text-anchor': 'end', style: 'fill:var(--steel);font-weight:600;font-size:12px' }, c.s, fmt(t('freeOut'), { v: f0(at(C, 'free', 150)) }));
  swatches('lgFlag', [[MC.free, t('free')], [MC.reserve, t('reserve')], [MC.segment, t('segment'), 'height:2px;border:0']]);
  const f = at(C, 'free', 80), r = at(C, 'reserve', 80);
  $('flagRead').textContent = fmt(t('rd80'), { f: f0(f), r: f0(r), p: Math.round(100 * r / f) });
}

// ---------- step 3: the two yards under whole-route reservation ----------
function drawYards() {
  const c = kFrame('cYards', t('yardLbl'), 2000, 500, 380);
  ['yupu', 'yantai'].forEach((yd, i) => {
    const F = D.flag[yd], C = F.saturated, col = YC[yd], hi = F.T1t[0];
    el('path', { d: `M${c.m.l} ${c.y(hi)}H${c.W - c.m.r}`, style: `stroke:${col};stroke-width:1.6;stroke-dasharray:7 4` }, c.s);
    el('text', { x: c.W - c.m.r - 6, y: c.y(hi) - 6, 'text-anchor': 'end', style: `fill:${col};font-weight:600` }, c.s, fmt(t('t1y'), { y: t(yd), v: f0(hi) }));
    curve(c, C, 'reserve', col, .2 + .35 * i, fmt(t('yres'), { y: t(yd) }));
    const k = F.Kstar20[0], v = at(C, 'reserve', k);
    el('path', { d: `M${c.x(k)} ${c.y(v)}V${c.H - c.m.b}`, style: `stroke:${col};stroke-dasharray:2 3` }, c.s);
    anim(el('circle', { cx: c.x(k), cy: c.y(v), r: 5.5, style: `fill:var(--paper);stroke:${col};stroke-width:2.4` }, c.s), 'a-pop', 1.2 + .2 * i);
    // Okpo's label sits in the empty space above the curves, on a leader; Yantai's below them, beside its drop line
    const ly = i ? c.y(160) : c.y(900);
    if (!i) el('path', { d: `M${c.x(k)} ${c.y(v) - 7}V${ly + 4}`, style: `stroke:${col};stroke-dasharray:2 3` }, c.s);
    anim(el('text', { x: c.x(k) + 6, y: ly, style: `fill:${col};font-weight:700;font-size:13px` }, c.s, fmt(t('kstar'), { y: t(yd), k })), 'a-fade', 1.3 + .2 * i);
  });
  swatches('lgYards', [[YC.yupu, fmt(t('yres'), { y: t('yupu') })], [YC.yantai, fmt(t('yres'), { y: t('yantai') })], ['var(--ink3)', t('t1Leg'), 'height:2px;border:0']]);
}

// ---------- step 4: vehicles needed against the daily volume (T22, Okpo, whole dock road) ----------
let wDay = 'd16';
function drawWork() {
  const Wd = D.work, L = Wd.levels, V = Wd[wDay];
  const W = 560, H = fitH('cWork', W, 360), m = { l: 52, r: 16, t: 16, b: 46 };
  const s = frame('cWork', W, H, t('workLbl'));
  const x = lin(250, 1250, m.l, W - m.r), y = lin(0, 165, H - m.b, m.t);
  axes(s, x, y, range(300, 1200, 300), range(0, 150, 25), W, H, m, f0, v => v);
  el('text', { x: (m.l + W - m.r) / 2, y: H - 6, 'text-anchor': 'middle' }, s, t('wX'));
  yTitle(s, 14, (m.t + H - m.b) / 2, t('wY'));
  el('rect', { x: m.l, y: y(60), width: W - m.l - m.r, height: y(50) - y(60), style: 'fill:var(--oxide-soft);opacity:.8' }, s);
  el('text', { x: m.l + 8, y: y(60) - 5, style: 'fill:var(--oxide);font-weight:600;font-size:12px' }, s, t('kstarBand'));
  [[339, 'own'], [678, 'peak']].forEach(([n, k]) => {
    el('path', { d: `M${x(n)} ${m.t}V${H - m.b}`, style: 'stroke:var(--ink3);stroke-dasharray:3 3' }, s);
    el('text', { x: x(n) + 4, y: m.t + 12, style: 'fill:var(--ink2);font-size:12px;font-weight:600' }, s, t(k));
  });
  ['free', 'reserve'].forEach((md, i) => {
    const yy = v => y(v < 0 ? 150 : v), pts = L.map((n, j) => [n, V[md][j]]);
    anim(el('path', { d: pathOf(pts.map(([n, v]) => [x(n), yy(v)])), pathLength: 1, style: `stroke:${MC[md]};stroke-width:2.6;fill:none;stroke-linejoin:round` }, s), 'a-draw', .2 + .3 * i);
    pts.forEach(([n, v], j) => {
      const e = v < 0
        ? el('path', { d: `M${x(n)} ${yy(v) - 7}L${x(n) + 6} ${yy(v) + 4}L${x(n) - 6} ${yy(v) + 4}Z`, style: `fill:var(--paper);stroke:${MC[md]};stroke-width:1.6` }, s)
        : el('circle', { cx: x(n), cy: yy(v), r: 3.4, style: `fill:${MC[md]};stroke:var(--paper);stroke-width:1` }, s);
      anim(e, 'a-pop', .8 + .3 * spread(j));
      hover(e, () => fmt(t('wTip'), { m: t(md), n, k: v < 0 ? `> ${-v}` : v }));
      if (md === 'reserve' && (n === 339 || n === 678))
        anim(el('text', { x: x(n) + 8, y: yy(v) + 4, style: `fill:${MC[md]};font-weight:700;font-size:14px` }, s, String(v)), 'a-fade', 1.2);
    });
  });
  // field fleets (T24, full texts): Hyundai Heavy about 500 moves a day with 24 vehicles over 24 h; Shen et al. 2018 about 600 a day, about 30 vehicles
  [[500, 24, 'hhi', 15], [600, 30, 'shen', 5]].forEach(([n, k, lbl, ly]) => {
    el('path', { d: `M${x(n) + 6} ${y(k) + 6}L${x(845)} ${y(ly) - 4}`, style: 'stroke:var(--ink3);stroke-width:1' }, s);
    el('text', { x: x(850), y: y(ly), style: 'fill:var(--ink);font-size:12px;font-weight:600' }, s, t(lbl));
    anim(el('path', { d: `M${x(n)} ${y(k) - 7}L${x(n) + 7} ${y(k)}L${x(n)} ${y(k) + 7}L${x(n) - 7} ${y(k)}Z`, style: 'fill:var(--amber-hi);stroke:var(--ink);stroke-width:1' }, s), 'a-pop', 1.3);
  });
  swatches('lgWork', [[MC.free, t('free')], [MC.reserve, t('reserve')], ['var(--amber-hi)', t('anchors')], ['var(--oxide-soft)', t('kstarBand')]]);
  const r = V.reserve;
  $('workRead').textContent = fmt(t('wRead'), { d: t(wDay), a: r[L.indexOf(339)], b: r[L.indexOf(678)] });
  document.querySelectorAll('#workDay button').forEach(b => b.setAttribute('aria-pressed', b.dataset.v === wDay));
}

// ---------- under way: safe release against whole-route reservation at Okpo ----------
function drawSafe() {
  const C = D.flag.yupu.saturated, c = kFrame('cSafe', t('safeLbl'), 1100, 250);
  [['reserve', 0], ['segment_safe', 1], ['segment', 2]].forEach(([md, i]) => curve(c, C, md, MC[md], .2 + .3 * i, t(md), md === 'segment' ? 'stroke-dasharray:7 4;' : ''));
  const end = (md, k, dy) => anim(el('text', { x: c.x(150) - 4, y: c.y(at(C, md, 150)) + dy, 'text-anchor': 'end', style: `fill:${MC[md]};font-weight:700;font-size:13px` }, c.s, `${t(k)} ${f0(at(C, md, 150))}`), 'a-fade', 1.3);
  end('reserve', 'resEnd', -10); end('segment_safe', 'safeEnd', 20);
  swatches('lgSafe', [[MC.reserve, t('reserve')], [MC.segment_safe, t('segment_safe')], [MC.segment, t('segment'), 'height:2px;border:0']]);
}

function init() {
  $('workDay').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { wDay = b.dataset.v; drawWork(); } });
}

Deck.start({
  strings: T,
  sections: {
    intro: ['导读', 'Overview', '개요'], scene: ['船厂里的事实', 'The shipyard', '조선소의 사실'],
    question: ['研究在问什么', 'The question', '연구가 묻는 것'], story: ['已经做了什么', 'Done so far', '지금까지 한 일'],
    now: ['现在在做', 'Under way', '진행 중'], next: ['接下来', 'Next', '다음'], end: ['一张图', 'One figure', '그림 한 장'],
  },
  draw: [drawFlag, drawYards, drawWork, drawSafe],
  init,
});
})();
