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
  segment_safe: ['安全放行', 'Safe release', '안전 출발'],
  segment: ['参照规则（瞬移疏解）', 'Reference rule (teleport clearing)', '참조 규칙 (순간이동 해소)'],
  whole: ['整段', 'whole road', '전 구간'], stops: ['分段', 'split at stops', '구간 분할'],
  hollow: ['空心 = 不稳态', 'hollow = not steady', '빈 점 = 비정상'],
  rhoX: ['吊车利用率 ρ', 'Crane utilisation ρ', '크레인 이용률 ρ'],
  K: ['车队规模 K（台）', 'Fleet size K (vehicles)', '차량군 규모 K (대)'],
  // rho curve at one K
  rkLbl: ['固定 K 时吞吐相对最低 ρ 档的变化', 'Change in throughput against the lowest ρ at a fixed K', '고정 K에서 최저 ρ 대비 처리량 변화'],
  rkY: ['相对最低 ρ 档的变化（%）', 'Change against the lowest ρ (%)', '최저 ρ 대비 변화 (%)'],
  rkThr: ['降幅 10%：阈值', '10% drop: threshold', '10% 하락: 임계값'],
  rkTip: ['{yard} · K = {k} · {m} · {g}<br>ρ = {r}：{v}%{st}', '{yard} · K = {k} · {m} · {g}<br>ρ = {r}: {v}%{st}', '{yard} · K = {k} · {m} · {g}<br>ρ = {r}: {v}%{st}'],
  notSteady: ['（不稳态）', ' (not steady)', ' (비정상)'],
  rdRes: ['整条路径预约（路外等待）在 K = {k}、ρ = 0.99 时的变化（整段 / 分段）', 'Reservation (waiting off-road): change at K = {k} and ρ = 0.99 (whole / split)', '예약 (도로 밖 대기): K = {k}, ρ = 0.99의 변화 (전 구간 / 분할)'],
  rdSafe: ['安全放行（不瞬移）在 K = {k} 的阈值（未达 10% 时给 ρ = 0.99 的变化）：整段 → 分段', 'Safe release (no teleporting), threshold at K = {k} (change at ρ = 0.99 if under 10%): whole → split', '안전 출발 (순간이동 없음), K = {k}의 임계값 (10% 미만이면 ρ = 0.99의 변화): 전 구간 → 분할'],
  rdSeg: ['参照规则（瞬移疏解）在 K = {k} 的阈值（未达 10% 时给 ρ = 0.99 的变化）：整段 → 分段', 'Reference rule (teleport clearing), threshold at K = {k} (change at ρ = 0.99 if under 10%): whole → split', '참조 규칙 (순간이동 해소), K = {k}의 임계값 (10% 미만이면 ρ = 0.99의 변화): 전 구간 → 분할'],
  noDrop: ['不降', 'no drop', '하락 없음'],
  // thresholds against K
  thLbl: ['降幅首次达 10% 的 ρ 随车队规模', 'ρ at which the drop first reaches 10%, against fleet size', '하락이 처음 10%에 이르는 ρ와 차량군 규모'],
  thY: ['阈值 ρ', 'Threshold ρ', '임계값 ρ'],
  thTop: ['ρ 到 0.99 降幅未达 10%', 'drop under 10% up to ρ = 0.99', 'ρ 0.99까지 하락 10% 미만'],
  thTip: ['{yard} · {m} · {g}<br>K = {k}：阈值 ρ ≈ {r}{st}', '{yard} · {m} · {g}<br>K = {k}: threshold ρ ≈ {r}{st}', '{yard} · {m} · {g}<br>K = {k}: 임계값 ρ ≈ {r}{st}'],
  thTipN: ['{yard} · {m} · {g}<br>K = {k}：未达 10%（ρ = 0.99 时 {d}%）', '{yard} · {m} · {g}<br>K = {k}: under 10% ({d}% at ρ = 0.99)', '{yard} · {m} · {g}<br>K = {k}: 10% 미만 (ρ = 0.99에서 {d}%)'],
  thSteadyNote: ['（用到不稳态的点）', ' (uses non-steady points)', ' (비정상 점 사용)'],
  rdLeft: ['安全放行·整段：阈值由 K = 20 移到 K = 150', 'Safe release, whole road: threshold from K = 20 to K = 150', '안전 출발·전 구간: K = 20에서 K = 150으로 임계값 이동'],
  rdRight: ['同一 K = {k}：分段闭塞把安全放行的阈值右移（整段 → 分段）', 'At K = {k}, splitting the dock road at its stops moves the safe-release threshold right (whole → split)', 'K = {k}에서 정차 지점별 분할이 안전 출발의 임계값을 오른쪽으로 이동 (전 구간 → 분할)'],
  rdRef: ['参照规则（瞬移疏解）K = 150：整段 → 分段', 'Reference rule (teleport clearing), K = 150: whole → split', '참조 규칙 (순간이동 해소), K = 150: 전 구간 → 분할'],
  rdResAll: ['整条路径预约：两种粒度、K = 20–150 每一档在 ρ = 0.99 时的最大降幅', 'Reservation: largest drop at ρ = 0.99 over both granularities and every K = 20–150', '예약: 두 단위, K = 20–150 모든 단계에서 ρ = 0.99의 최대 하락'],
  // H1 table
  tRule: ['规则 · 粒度', 'Rule · granularity', '규칙 · 단위'],
  // dock road held
  heldLbl: ['坞前停靠路段被占的时间比例（玉浦，K = 150）', 'Share of time the dock stopping road is held (Okpo, K = 150)', '도크 정차 구간 점유 시간 비율 (옥포, K = 150)'],
  heldY: ['被占比例（整段）', 'Held (whole road)', '점유 비율 (전 구간)'],
  heldTip: ['玉浦 · {m}<br>ρ = {r}：被占 {v}%', 'Okpo · {m}<br>ρ = {r}: held {v}%', '옥포 · {m}<br>ρ = {r}: 점유 {v}%'],
  // crane use
  crLbl: ['吊车台时占用率与名义 ρ（K = 150）', 'Crane-hours used against nominal ρ (K = 150)', '크레인 시간 점유율과 명목 ρ (K = 150)'],
  crY: ['吊车台时占用率', 'Crane-hours used', '크레인 시간 점유율'],
  crDiag: ['名义：吊车做完全部搭载', 'nominal: cranes do every erection', '명목: 크레인이 모든 탑재 수행'],
  crTip: ['{yard} · {m} · {g}<br>ρ = {r}：吊车用 {u}%，饥饿率 {s}%（其中被路网卡住 {b}%）', '{yard} · {m} · {g}<br>ρ = {r}: cranes used {u}%, starvation {s}% (stuck in the network {b}%)', '{yard} · {m} · {g}<br>ρ = {r}: 크레인 {u}%, 기아율 {s}% (도로망에 갇힘 {b}%)'],
  crSafe: ['安全放行在 ρ = {r} 的吊车台时占用率（整段 / 分段），比名义少 {a}–{b} 个百分点：搭载积压，系统失稳', 'Safe release at ρ = {r}, crane-hours used (whole / split): {a}–{b} points below nominal; erections pile up and the system is unstable', '안전 출발, ρ = {r}의 크레인 시간 점유율 (전 구간 / 분할): 명목보다 {a}–{b}%p 낮음, 탑재가 쌓여 불안정'],
  crRes: ['整条路径预约：吊车接近名义；车在停靠点上等预约时段，不传到路网', 'Reservation: cranes close to nominal; vehicles wait at stops for their slot, nothing reaches the network', '예약: 크레인은 명목에 가깝고 차는 정차 지점에서 예약 시간대를 기다려 도로망으로 번지지 않음'],
  crRefY: ['参照规则：吊车几乎不损失；平台下降来自坞前排队占住 1 号坞前道路（被占 {h}%），挡住其他流向', 'Reference rule: the cranes lose almost nothing; the plateau falls because the dock queue holds the dock-1 road ({h}% of the time) and blocks other flows', '참조 규칙: 크레인 손실은 거의 없고, 도크 대기열이 1도크 앞 도로를 점유 ({h}%)해 다른 흐름을 막아 평탄 구간이 떨어짐'],
  crRefT: ['参照规则：吊车少用约 {d} 个百分点，被路网卡住的饥饿 {a}% 对预约 {b}%：吊车因上游被堵而空闲', 'Reference rule: cranes used about {d} points less; starvation stuck in the network {a}% against {b}% under reservation: the crane idles because upstream is blocked', '참조 규칙: 크레인 약 {d}%p 덜 사용, 도로망에 갇힌 기아 {a}% 대 예약 {b}%: 상류가 막혀 크레인이 쉼'],
  // teleports
  tlY: ['玉浦：在来坞途中至少被瞬移一次的车载搭载', 'Okpo: loaded erections teleported at least once', '옥포: 도크로 가는 길에 한 번 이상 순간이동된 차량 탑재'],
  tlT: ['烟台：同上', 'Yantai: the same', '옌타이: 같은 값'],
  tl2: ['其中被瞬移 2 次以上（两厂，约一半）', 'of these, teleported twice or more (both yards, about half)', '그중 2회 이상 (두 조선소, 약 절반)'],
  tlMax: ['同一任务最多被瞬移的次数', 'most teleports of a single task', '한 작업의 최대 순간이동 횟수'],
  // erection mix
  erLbl: ['搭载组合：上界与三种规则的平台，整段对分段', 'Erection mix: bound and the plateau of three rules, whole road against split', '탑재 조합: 상한과 세 규칙의 평탄 구간, 전 구간 대 분할'],
  erY: ['任务 / 16 h', 'tasks / 16 h', '작업 / 16시간'],
  erG: [['路网上界', 'Network bound', '도로망 상한'], ['整条路径预约', 'Reservation', '예약'], ['安全放행', 'Safe release', '안전 출발'], ['参照规则', 'Reference rule', '참조 규칙']],
  erTip: ['{g} · {v}：{n}', '{g} · {v}: {n}', '{g} · {v}: {n}'],
  ivEr: ['搭载组合：[{a}, {b}] → 分段 [{c}, {d}]；上沿 {u}，下沿 {l}', 'Erection mix: [{a}, {b}] → split [{c}, {d}]; upper edge {u}, lower edge {l}', '탑재 조합: [{a}, {b}] → 분할 [{c}, {d}], 상단 {u}, 하단 {l}'],
  ivMain: ['玉浦主情景：[{a}, {b}] → 分段 [{c}, {d}]，只抬上沿（{u}；下沿 {l}）；烟台 [{e}, {f}]', 'Okpo main scenario: [{a}, {b}] → split [{c}, {d}], upper edge only ({u}; lower {l}); Yantai [{e}, {f}]', '옥포 주 시나리오: [{a}, {b}] → 분할 [{c}, {d}], 상단만 상승 ({u}, 하단 {l}), 옌타이 [{e}, {f}]'],
  ivRatio: ['平台 / 路网上界：搭载组合 {a} → 分段 {b}，主情景 {c}–{d}：粒度一改，瓶颈从“路”移到“规则”（“派车变排路”与“路—车汇率”的分界）', 'Plateau / network bound: erection mix {a} → split {b}, main scenario {c}–{d}: with the split the bottleneck moves from road to rule (ordering vs. exchange rate)', '평탄 / 도로망 상한: 탑재 조합 {a} → 분할 {b}, 주 시나리오 {c}–{d}: 단위를 바꾸면 병목이 “도로”에서 “규칙”으로 이동 (“배차에서 통행 편성으로”와 “도로–차량 환율”의 경계)'],
  // H2
  h2Lbl: ['主情景饱和吞吐随车队规模', 'Saturated throughput of the main scenario against fleet size', '주 시나리오 포화 처리량과 차량군 규모'],
  h2Y: ['饱和吞吐（任务 / 16 h）', 'Saturated throughput (tasks / 16 h)', '포화 처리량 (작업 / 16시간)'],
  h2Tip: ['{yard} · {m}<br>K = {k}：{v} 个/日', '{yard} · {m}<br>K = {k}: {v} a day', '{yard} · {m}<br>K = {k}: 하루 {v}건'],
  h2Peak: ['最大 {v} @ K = {k}', 'peak {v} at K = {k}', '최대 {v} @ K = {k}'],
  h2Safe: ['安全放行（整段）：最大 @ K = {k} → K = 150（{d}%）', 'Safe release (whole road): peak at K = {k} → K = 150 ({d}%)', '안전 출발 (전 구간): K = {k}에서 최대 → K = 150 ({d}%)'],
  h2Res: ['整条路径预约：单调上升到平台（K = 100–150 平均；K = 150 为 {v}）', 'Reservation: rises monotonically to its plateau (mean over K = 100–150; {v} at K = 150)', '예약: 평탄 구간까지 단조 증가 (K = 100–150 평균, K = 150에서 {v})'],
  h2Ref: ['参照规则（瞬移疏解，图外）的平台；K = {k} 时最大 {v}，同一路网上没有安全放行那样的下降', 'Plateau of the reference rule (teleport clearing, off the chart); highest {v} at K = {k}, with no fall like safe release on the same network', '참조 규칙 (순간이동 해소, 그림 밖)의 평탄 구간, K = {k}에서 최대 {v}, 같은 망에서 안전 출발 같은 하락 없음'],
};
const t = k => T[k][LI[Deck.lang]];
const tt = a => a[LI[Deck.lang]];
const MC = { reserve: 'var(--oxide)', segment_safe: 'var(--steel)', segment: 'var(--amber-hi)' };
const RULES = ['reserve', 'segment_safe', 'segment'], GRAN = ['whole', 'stops'], KS = ['20', '40', '60', '100', '150'];
const DASH = { whole: '', stops: '7 4' };
const f0 = v => Math.round(v).toLocaleString('en-US');
const f2 = v => v.toFixed(2);
const pc = v => Math.round(100 * v);
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
const sgp = v => (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(Math.abs(v) >= 10 ? 0 : 1);   // a relative change for prose
const dot = (s, cx, cy, col, ok, r = 4) => el('circle', { cx, cy, r, style: ok ? `fill:${col};stroke:var(--paper);stroke-width:1` : `fill:var(--paper);stroke:${col};stroke-width:2` }, s);
const stat = (num, p) => `<div class="stat"><span class="num">${num}</span><p>${p}</p></div>`;
const legendRG = (id, rules, hollow = true) => swatches(id, rules.map(m => [MC[m], t(m)])
  .concat([['none', t('whole'), 'width:18px;height:0;border:0;border-top:2.5px solid var(--ink3);border-radius:0'],
    ['none', t('stops'), 'width:18px;height:0;border:0;border-top:2.5px dashed var(--ink3);border-radius:0']])
  .concat(hollow ? [['var(--paper)', t('hollow'), 'border:2px solid var(--ink3);border-radius:50%']] : []));
function seg(id, v) { document.querySelectorAll(`#${id} button`).forEach(b => b.setAttribute('aria-pressed', b.dataset.v === String(v))); }
const thr = (y, k, g, m) => D.rhok[y][k][`${g}|${m}`];
// a-draw animates stroke-dasharray and pathLength rescales dashes, so dashed (split-road) lines fade in without pathLength
const line = (s, pts, col, g, delay, w = 2.6) => anim(el('path', Object.assign({ d: pathOf(pts), style: `stroke:${col};stroke-width:${w};fill:none;stroke-linejoin:round;stroke-dasharray:${DASH[g]}` }, DASH[g] ? {} : { pathLength: 1 }), s), DASH[g] ? 'a-fade' : 'a-draw', delay);
const fv = c => f2(c.thr) + (c.thrOk ? '' : '*');

// ---------- rho curve at one fleet size: change against the lowest rho ----------
let rkYard = 'yupu', rkK = '40';
function drawRhoK() {
  const R = D.rhok[rkYard][rkK], okpo = rkYard === 'yupu';
  const W = 560, H = fitH('cRhoK', W, 380), m = { l: 58, r: 16, t: 14, b: 46 };
  const s = frame('cRhoK', W, H, t('rkLbl'));
  const lo = Math.min(-20, ...Object.values(R).flatMap(c => c.pts.map(p => p[1])));
  const yLo = Math.floor(lo / 10) * 10, x0 = okpo ? 0.5 : 0.1;
  const x = lin(x0, 1, m.l, W - m.r), y = lin(yLo, 10, H - m.b, m.t);
  axes(s, x, y, range(x0, 1, 0.1), range(yLo, 10, 10), W, H, m, v => v.toFixed(1), v => (v > 0 ? '+' : '') + v);
  el('text', { x: (m.l + W - m.r) / 2, y: H - 6, 'text-anchor': 'middle' }, s, t('rhoX'));
  yTitle(s, 14, (m.t + H - m.b) / 2, t('rkY'));
  el('path', { d: `M${m.l} ${y(0)}H${W - m.r}`, style: 'stroke:var(--ink3);stroke-width:1.2' }, s);
  el('path', { d: `M${m.l} ${y(-10)}H${W - m.r}`, style: 'stroke:var(--ink2);stroke-width:1.2;stroke-dasharray:3 3' }, s);
  el('text', { x: m.l + 6, y: y(-10) + 15, style: 'fill:var(--ink2);font-size:12px' }, s, t('rkThr'));
  RULES.forEach((md, i) => GRAN.forEach((g, j) => {
    const c = R[`${g}|${md}`];
    line(s, c.pts.map(p => [x(p[0]), y(p[1])]), MC[md], g, .2 + .15 * (2 * i + j), 2.5);
    c.pts.forEach((p, q) => {
      const d = anim(dot(s, x(p[0]), y(p[1]), MC[md], p[2], 3.6), 'a-pop', .8 + .3 * spread(q + 7 * i + 3 * j));
      hover(d, () => fmt(t('rkTip'), { yard: t(rkYard), k: rkK, m: t(md), g: t(g), r: f2(p[0]), v: sgn(p[1]), st: p[2] ? '' : t('notSteady') }));
    });
  }));
  legendRG('lgRhoK', RULES);
  const th2 = md => GRAN.map(g => R[`${g}|${md}`]).map(c => (c.thr ? fv(c) : `${sgn(c.drop)}%`)).join(' → ');
  $('rkRead').innerHTML = stat(GRAN.map(g => `${sgn(R[`${g}|reserve`].drop)}%`).join(' / '), fmt(t('rdRes'), { k: rkK }))
    + stat(th2('segment_safe'), fmt(t('rdSafe'), { k: rkK })) + stat(th2('segment'), fmt(t('rdSeg'), { k: rkK }));
  seg('rkYard', rkYard); seg('rkK', rkK);
}

// ---------- thresholds against fleet size ----------
let thYard = 'yupu';
const KSH = { yupu: '40', yantai: '60' };
function drawThr() {
  const y0 = thYard, W = 560, H = fitH('cThr', W, 380), m = { l: 58, r: 16, t: 62, b: 46 };
  const s = frame('cThr', W, H, t('thLbl'));
  const x = lin(10, 155, m.l, W - m.r), y = lin(0.3, 1, H - m.b, m.t), yTop = m.t - 22;
  axes(s, x, y, KS.map(Number), range(0.3, 1, 0.1), W, H, m, v => v, v => v.toFixed(1));
  el('text', { x: (m.l + W - m.r) / 2, y: H - 6, 'text-anchor': 'middle' }, s, t('K'));
  yTitle(s, 14, (m.t + H - m.b) / 2, t('thY'));
  el('rect', { x: m.l, y: yTop - 12, width: W - m.l - m.r, height: 24, rx: 3, style: 'fill:var(--good-soft);opacity:.8' }, s);
  el('text', { x: W - m.r, y: yTop - 18, 'text-anchor': 'end', style: 'fill:var(--good);font-size:12.5px;font-weight:600' }, s, t('thTop'));
  RULES.forEach((md, i) => GRAN.forEach((g, j) => {
    const pts = KS.map(k => [k, thr(y0, k, g, md)]);
    const runs = []; let cur = [];
    pts.forEach(([k, c]) => { if (c.thr) cur.push([x(+k), y(c.thr)]); else { if (cur.length) runs.push(cur); cur = []; } });
    if (cur.length) runs.push(cur);
    runs.forEach(r => line(s, r, MC[md], g, .2 + .15 * (2 * i + j)));
    pts.forEach(([k, c], q) => {
      const off = (2 * i + j - 2.5) * 7, cx = x(+k) + (c.thr ? 0 : off), cy = c.thr ? y(c.thr) : yTop;
      const d = anim(dot(s, cx, cy, MC[md], c.thr ? c.thrOk : true, c.thr ? 4.2 : 3.4), 'a-pop', .8 + .3 * spread(q + 5 * i + 2 * j));
      hover(d, () => c.thr ? fmt(t('thTip'), { yard: t(y0), m: t(md), g: t(g), k, r: f2(c.thr), st: c.thrOk ? '' : t('thSteadyNote') })
        : fmt(t('thTipN'), { yard: t(y0), m: t(md), g: t(g), k, d: sgn(c.drop) }));
    });
  }));
  legendRG('lgThr', RULES);
  const sw = k => thr(y0, k, 'whole', 'segment_safe'), sp = k => thr(y0, k, 'stops', 'segment_safe');
  const rf = g => thr(y0, '150', g, 'segment');
  const res = Math.min(...KS.flatMap(k => GRAN.map(g => thr(y0, k, g, 'reserve').drop)));
  $('thRead').innerHTML = stat(`${fv(sw('20'))} → ${fv(sw('150'))}`, t('rdLeft'))
    + stat(`${fv(sw(KSH[y0]))} → ${fv(sp(KSH[y0]))}`, fmt(t('rdRight'), { k: KSH[y0] }))
    + stat(`${fv(rf('whole'))} → ${fv(rf('stops'))}`, t('rdRef'))
    + stat(res > -0.05 ? t('noDrop') : `${sgn(res)}%`, t('rdResAll'));
  seg('thYard', y0);
}

// ---------- the H1 part 3 readings table: thresholds by rule, granularity and K, both yards ----------
function fillH1() {
  const cell = c => (c.thr ? `<b>${f2(c.thr)}</b>${c.thrOk ? '' : '*'}` : `—<span class="tiny">（${sgn(c.drop)}）</span>`);
  const head = `<thead><tr><th rowspan="2">${t('tRule')}</th><th colspan="5">${t('yupu')}</th><th colspan="5">${t('yantai')}</th></tr>`
    + `<tr>${['yupu', 'yantai'].map(() => KS.map(k => `<th class="mono">K = ${k}</th>`).join('')).join('')}</tr></thead>`;
  $('h1Tbl').innerHTML = head + '<tbody>' + RULES.flatMap(md => GRAN.map(g => `<tr><td><span class="sw" style="background:${MC[md]}"></span>${t(md)} · ${t(g)}</td>`
    + ['yupu', 'yantai'].map(y => KS.map(k => `<td class="mono">${cell(thr(y, k, g, md))}</td>`).join('')).join('') + '</tr>')).join('') + '</tbody>';
}

// ---------- dock stopping road held at K = 150 (Okpo, whole road) ----------
function drawHeld() {
  const C = D.crane.yupu;
  const W = 520, H = fitH('cHeld', W, 230, 0.8, 1.4), m = { l: 50, r: 14, t: 12, b: 40 };
  const s = frame('cHeld', W, H, t('heldLbl'));
  const x = lin(0.5, 1, m.l, W - m.r), y = lin(0, 100, H - m.b, m.t);
  axes(s, x, y, range(0.5, 1, 0.1), [0, 25, 50, 75, 100], W, H, m, v => v.toFixed(1), v => v + '%');
  el('text', { x: (m.l + W - m.r) / 2, y: H - 5, 'text-anchor': 'middle' }, s, t('rhoX'));
  yTitle(s, 12, (m.t + H - m.b) / 2, t('heldY'));
  RULES.forEach((md, i) => {
    const P = C[`whole|${md}`];
    anim(el('path', { d: pathOf(P.map(p => [x(p[0]), y(100 * p[4])])), pathLength: 1, style: `stroke:${MC[md]};stroke-width:2.6;fill:none` }, s), 'a-draw', .2 + .3 * i);
    P.forEach((p, j) => hover(anim(dot(s, x(p[0]), y(100 * p[4]), MC[md], true, 3.5), 'a-pop', .8 + .3 * spread(j + 4 * i)),
      () => fmt(t('heldTip'), { m: t(md), r: f2(p[0]), v: pc(p[4]) })));
  });
  swatches('lgHeld', RULES.map(md => [MC[md], t(md)]));
}

// ---------- crane-hours used against nominal rho at K = 150 ----------
let crYard = 'yupu';
const CR = [['reserve', 'whole'], ['segment', 'whole'], ['segment_safe', 'whole'], ['segment_safe', 'stops']];
function drawCrane() {
  const C = D.crane[crYard], okpo = crYard === 'yupu';
  const W = 560, H = fitH('cCrane', W, 380), m = { l: 58, r: 16, t: 14, b: 46 };
  const s = frame('cCrane', W, H, t('crLbl'));
  const x0 = okpo ? 0.5 : 0.1, x = lin(x0, 1, m.l, W - m.r), y = lin(x0, 1, H - m.b, m.t);
  axes(s, x, y, range(x0, 1, 0.1), range(x0, 1, 0.1), W, H, m, v => v.toFixed(1), v => pc(v) + '%');
  el('text', { x: (m.l + W - m.r) / 2, y: H - 6, 'text-anchor': 'middle' }, s, t('rhoX'));
  yTitle(s, 14, (m.t + H - m.b) / 2, t('crY'));
  el('path', { d: `M${x(x0)} ${y(x0)}L${x(1)} ${y(1)}`, style: 'stroke:var(--ink3);stroke-width:1.4;stroke-dasharray:4 4' }, s);
  el('text', { x: x(x0) + 10, y: y(x0) - 30, transform: `rotate(${-Math.atan2(y(x0) - y(1), x(1) - x(x0)) * 180 / Math.PI} ${x(x0) + 10} ${y(x0) - 30})`, style: 'fill:var(--ink3);font-size:12px' }, s, t('crDiag'));
  CR.forEach(([md, g], i) => {
    const P = C[`${g}|${md}`];
    line(s, P.map(p => [x(p[0]), y(p[1])]), MC[md], g, .2 + .2 * i);
    P.forEach((p, j) => hover(anim(dot(s, x(p[0]), y(p[1]), MC[md], true, 3.6), 'a-pop', .8 + .3 * spread(j + 5 * i)),
      () => fmt(t('crTip'), { yard: t(crYard), m: t(md), g: t(g), r: f2(p[0]), u: pc(p[1]), s: (100 * p[2]).toFixed(1), b: (100 * p[3]).toFixed(1) })));
  });
  legendRG('lgCrane', ['reserve', 'segment', 'segment_safe'], false);
  const last = gm => C[gm][C[gm].length - 1], rTop = last('whole|reserve')[0];
  const sw = last('whole|segment_safe'), ss = last('stops|segment_safe'), rs = last('whole|reserve'), rf = last('whole|segment');
  const gaps = [sw, ss].map(p => 100 * (p[0] - p[1])).sort((a, b) => a - b);
  $('crRead').innerHTML = stat(`${pc(sw[1])}% / ${pc(ss[1])}%`, fmt(t('crSafe'), { r: f2(rTop), a: Math.round(gaps[0]), b: Math.round(gaps[1]) }))
    + stat(`${pc(rs[1])}%`, t('crRes'))
    + stat(`${pc(rf[1])}%`, okpo ? fmt(t('crRefY'), { h: pc(rf[4]) }) : fmt(t('crRefT'), { d: pc(rs[1]) - pc(rf[1]), a: (100 * rf[3]).toFixed(1), b: (100 * rs[3]).toFixed(1) }));
  seg('crYard', crYard);
}

// ---------- teleports counted by task ----------
function fillTele() {
  const rg = (a, f = pc) => { const v = a.map(f); return `${Math.min(...v)}–${Math.max(...v)}`; };
  const all = D.tele.yupu.concat(D.tele.yantai);
  const n = (v, lbl) => `<div><b>${v}</b><span>${t(lbl)}</span></div>`;
  $('teleNums').innerHTML = n(rg(D.tele.yupu.map(r => r[2])) + '%', 'tlY') + n(rg(D.tele.yantai.map(r => r[2])) + '%', 'tlT')
    + n(rg(all.map(r => r[3])) + '%', 'tl2') + n(rg(all.map(r => r[4]), v => v), 'tlMax');
}

// ---------- erection mix: bound and plateaus, whole road against split ----------
function drawEr() {
  const E = D.iv['yupu|erection'];
  const G = [[E['T1|whole'], E['T1|stops']]].concat(RULES.map(md => GRAN.map(g => E[`${g}|${md}`].plat)));
  const GC = ['var(--ink3)', MC.reserve, MC.segment_safe, MC.segment];
  const W = 560, H = fitH('cEr', W, 380), m = { l: 56, r: 10, t: 16, b: 46 };
  const s = frame('cEr', W, H, t('erLbl'));
  const top0 = 1.1 * Math.max(...G.flat()), st = niceStep(top0), yTop = Math.ceil(top0 / st) * st;
  const y = lin(0, yTop, H - m.b, m.t), gw = (W - m.l - m.r) / 4, bw = 40, gap = 6;
  const g = el('g', { class: 'grid' }, s);
  range(0, yTop, st).forEach(v => { el('line', { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v) }, g); el('text', { x: m.l - 8, y: y(v) + 4, 'text-anchor': 'end' }, s, f0(v)); });
  el('path', { d: `M${m.l} ${m.t}V${H - m.b}H${W - m.r}`, style: 'stroke:var(--ink3);fill:none' }, s);
  yTitle(s, 14, (m.t + H - m.b) / 2, t('erY'));
  G.forEach((vals, gi) => {
    const cx = m.l + gw * (gi + 0.5), x0 = cx - (2 * bw + gap) / 2;
    el('text', { x: cx, y: H - m.b + 18, 'text-anchor': 'middle', style: 'fill:var(--ink);font-weight:600' }, s, tt(T.erG[gi]));
    vals.forEach((v, vi) => {
      const bx = x0 + vi * (bw + gap);
      const r = anim(el('rect', { x: bx, y: y(v), width: bw, height: y(0) - y(v), style: `fill:${GC[gi]};${vi ? 'fill-opacity:.38;stroke-width:2;stroke:' + GC[gi] : ''}` }, s), 'a-fade', .2 + .12 * vi + .2 * gi);
      el('text', { x: bx + bw / 2, y: y(v) - 5, 'text-anchor': 'middle', style: 'fill:var(--ink2);font-size:12px' }, s, f0(v));
      hover(r, () => fmt(t('erTip'), { g: tt(T.erG[gi]), v: t(GRAN[vi]), n: f0(v) }));
    });
  });
  swatches('lgEr', [['var(--ink3)', t('whole')], ['var(--paper)', t('stops'), 'border:2px solid var(--ink3)']]);
  const M = D.iv['yupu|main'], Y = D.iv['yantai|main'], pct = (a, b) => `${sgn(100 * (b / a - 1))}%`;
  const lo = (B, g) => B[`${g}|reserve`].plat;
  $('ivEr').innerHTML = fmt(t('ivEr'), { a: f0(lo(E, 'whole')), b: f0(E['T1|whole']), c: f0(lo(E, 'stops')), d: f0(E['T1|stops']), u: pct(E['T1|whole'], E['T1|stops']), l: pct(lo(E, 'whole'), lo(E, 'stops')) });
  $('ivMain').innerHTML = fmt(t('ivMain'), { a: f0(lo(M, 'whole')), b: f0(M['T1|whole']), c: f0(lo(M, 'stops')), d: f0(M['T1|stops']), u: pct(M['T1|whole'], M['T1|stops']), l: pct(lo(M, 'whole'), lo(M, 'stops')), e: f0(lo(Y, 'whole')), f: f0(Y['T1|whole']) });
  const rt = (B, g) => f2(lo(B, g) / B[`T1|${g}`]), mr = [rt(M, 'whole'), rt(M, 'stops'), rt(Y, 'whole')].sort();
  $('ivRatio').innerHTML = fmt(t('ivRatio'), { a: rt(E, 'whole'), b: rt(E, 'stops'), c: mr[0], d: mr[mr.length - 1] });
}

// ---------- H2: saturated throughput against fleet size, main scenario ----------
let h2Yard = 'yupu';
const H2L = [['reserve', 'reserve', 'whole'], ['safe', 'segment_safe', 'whole'], ['safeS', 'segment_safe', 'stops']];
function drawH2() {
  const C = D.h2[h2Yard];
  const W = 560, H = fitH('cH2', W, 380), m = { l: 58, r: 16, t: 16, b: 46 };
  const s = frame('cH2', W, H, t('h2Lbl'));
  const top0 = 1.15 * Math.max(...H2L.flatMap(([k]) => C[k].map(p => p[1]))), st = niceStep(top0), yTop = Math.ceil(top0 / st) * st;
  const x = lin(0, 150, m.l, W - m.r), y = lin(0, yTop, H - m.b, m.t);
  axes(s, x, y, range(0, 150, 25), range(0, yTop, st), W, H, m, v => v, f0);
  el('text', { x: (m.l + W - m.r) / 2, y: H - 6, 'text-anchor': 'middle' }, s, t('K'));
  yTitle(s, 14, (m.t + H - m.b) / 2, t('h2Y'));
  H2L.forEach(([k, md, g], i) => {
    const P = C[k];
    line(s, P.map(p => [x(p[0]), y(p[1])]), MC[md], g, .2 + .3 * i);
    P.forEach((p, j) => hover(anim(dot(s, x(p[0]), y(p[1]), MC[md], true, 2.6), 'a-pop', .8 + .3 * spread(j + 9 * i)),
      () => fmt(t('h2Tip'), { yard: t(h2Yard), m: `${t(md)} · ${t(g)}`, k: p[0], v: p[1].toFixed(1) })));
  });
  const pk = C.safe.reduce((a, b) => (b[1] > a[1] ? b : a)), at = C.safe.find(p => p[0] === 150);
  el('circle', { cx: x(pk[0]), cy: y(pk[1]), r: 7, style: 'fill:none;stroke:var(--ink);stroke-width:1.5' }, s);
  el('text', { x: x(pk[0]) + 10, y: y(pk[1]) - 10, style: 'fill:var(--ink);font-size:12.5px;font-weight:600' }, s, fmt(t('h2Peak'), { v: f0(pk[1]), k: pk[0] }));
  el('circle', { cx: x(150), cy: y(at[1]), r: 7, style: 'fill:none;stroke:var(--ink);stroke-width:1.5' }, s);
  el('text', { x: x(150) - 10, y: y(at[1]) + 24, 'text-anchor': 'end', style: 'fill:var(--ink);font-size:12.5px;font-weight:600' }, s, `${f0(at[1])} @ K = 150`);
  swatches('lgH2', [[MC.reserve, t('reserve')], [MC.segment_safe, t('segment_safe')],
    ['none', t('whole'), 'width:18px;height:0;border:0;border-top:2.5px solid var(--ink3);border-radius:0'],
    ['none', t('stops'), 'width:18px;height:0;border:0;border-top:2.5px dashed var(--ink3);border-radius:0']]);
  const iv = D.iv[`${h2Yard}|main`], ref = C.segment.reduce((a, b) => (b[1] > a[1] ? b : a));
  $('h2Read').innerHTML = stat(`${f0(pk[1])} → ${f0(at[1])}`, fmt(t('h2Safe'), { k: pk[0], d: sgp(100 * (at[1] / pk[1] - 1)) }))
    + stat(f0(iv['whole|reserve'].plat), fmt(t('h2Res'), { v: f0(C.reserve.find(p => p[0] === 150)[1]) }))
    + stat(f0(iv['whole|segment'].plat), fmt(t('h2Ref'), { k: ref[0], v: f0(ref[1]) }));
  seg('h2Yard', h2Yard);
}

function init() {
  const on = (id, f) => $(id).addEventListener('click', e => { const b = e.target.closest('button'); if (b) f(b.dataset.v); });
  on('rkYard', v => { rkYard = v; drawRhoK(); });
  on('rkK', v => { rkK = v; drawRhoK(); });
  on('thYard', v => { thYard = v; drawThr(); });
  on('crYard', v => { crYard = v; drawCrane(); });
  on('h2Yard', v => { h2Yard = v; drawH2(); });
}

Deck.start({
  strings: T,
  sections: { intro: ['导读', 'Overview', '개요'], q: ['问题与定位', 'Question and position', '질문과 위치'], res: ['吊车与 ρ 曲线', 'Cranes and the ρ curve', '크레인과 ρ 곡선'],
    mech: ['机理与有效能力', 'Mechanism and effective capacity', '메커니즘과 유효 능력'], h2: ['下降何时出现', 'When the decline appears', '하락은 언제 나타나는가'],
    prop: ['坞口失稳命题与浮坞', 'Proposition and floating docks', '명제와 플로팅 도크'], status: ['进度与计划', 'Progress and plan', '진행과 계획'],
    pub: ['目标期刊', 'Target journals', '목표 학술지'], ref: ['参考文献', 'References', '참고문헌'], end: ['结尾', 'Close', '마무리'] },
  draw: [drawRhoK, drawThr, fillH1, drawHeld, drawCrane, fillTele, drawEr, drawH2],
  init,
});
})();
