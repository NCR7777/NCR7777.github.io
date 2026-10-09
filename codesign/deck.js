// Fleet–network co-design deck (thesis chapter 5): the strings and charts of this briefing.
// Paging, language, notes, contents, glossary, layout and the PDF link come from ../shared/deck-core.js (README.md).
(() => {
'use strict';
const D = window.DATA;
const { LI, $, el, frame, fitH, anim, spread, lin, yTitle, swatches, hover, fmt } = Deck;

// ---------- strings used inside charts and filled tables: [zh, en, ko] ----------
const T = {
  title: ['车队与路网协同设计 · 分项汇报', 'Fleet–Network Co-Design', '차량군·도로망 협동 설계 · 세부 보고'],
  // interval chart
  ivlLbl: ['运力区间：整条路径预约的平台与上界 T1′', 'Capacity interval: whole-route reservation plateau against the bound T1′', '운송 능력 구간: 전체 경로 예약 평탄과 상한 T1′'],
  thr: ['日吞吐（任务 / 16 h）', 'Daily throughput (tasks / 16 h)', '일일 처리량 (작업 / 16시간)'],
  rowMain: ['玉浦主情景（MY-B 流向组合）', 'Okpo main scenario (MY-B flow mix)', '옥포 주 시나리오 (MY-B 흐름 조합)'],
  rowEre: ['搭载组合（P6 15%，白班集中）', 'Erection mix (P6 15%, day shift)', '탑재 조합 (P6 15%, 주간 집중)'],
  gapMain: ['差距来自规则 → 先改编排（第 4 章）', 'gap from the rule → orchestration first (ch. 4)', '차이는 규칙에서 → 편성 먼저 (4장)'],
  gapEre: ['差距小 → 改路直接见效', 'small gap → road changes pay', '차이 작음 → 개조가 바로 효과'],
  lgPlat: ['整条路径预约的饱和平台（K = 100–150 均值）', 'Whole-route reservation plateau (mean of K = 100–150)', '전체 경로 예약 포화 평탄 (K = 100–150 평균)'],
  lgGap: ['到 T1′ 的差距', 'Gap to T1′', 'T1′까지의 차이'],
  lgT1: ['T1′（横线：10 个种子的范围）', 'T1′ (whisker: range over 10 seeds)', 'T1′ (가로선: 시드 10개 범위)'],
  ivlTip: ['{row}<br>平台 {p} 个/日；T1′ {t}（{lo}–{hi}）<br>平台 / T1′ = {r}%', '{row}<br>plateau {p} a day; T1′ {t} ({lo}–{hi})<br>plateau / T1′ = {r}%', '{row}<br>평탄 하루 {p}건, T1′ {t} ({lo}–{hi})<br>평탄 / T1′ = {r}%'],
  // probe chart
  probeLbl: ['道路161 三种改动后的变化（相对整段一个资源）', 'Change after three alterations of road 161 (against the whole road as one resource)', '도로161 세 가지 개조 후 변화 (도로 전체 한 자원 대비)'],
  chg: ['相对现模型的变化', 'Change against the current model', '현 모형 대비 변화'],
  pMain: ['主情景 · K = 120', 'Main scenario · K = 120', '주 시나리오 · K = 120'],
  pEre: ['搭载组合 · K = 100', 'Erection mix · K = 100', '탑재 조합 · K = 100'],
  pRatio: ['平台 / T1′ = {r}%', 'plateau / T1′ = {r}%', '평탄 / T1′ = {r}%'],
  vW12: ['改宽 12 m', 'Widen 12 m', '확폭 12 m'], vSect: ['分段闭塞', 'Sectioned', '분할 폐색'], vBay: ['分段 + 会车点', '+ passing bays', '분할 + 대피'],
  mT1: ['T1′ 上界', 'T1′ bound', 'T1′ 상한'], mRes: ['整条路径预约', 'Whole-route reservation', '전체 경로 예약'],
  mSeg: ['逐段申请（参照规则（瞬移疏解））', 'Segment request (reference rule, teleport clearing)', '구간별 요청 (참조 규칙, 순간 이동 해소)'],
  mSegS: ['逐段申请 · 参照规则（瞬移疏解）', 'segment request · reference rule (teleport clearing)', '구간별 요청 · 참조 규칙 (순간 이동 해소)'],
  probeTip: ['{panel} · {v}<br>{m}：{a} → {b}（{c}）', '{panel} · {v}<br>{m}: {a} → {b} ({c})', '{panel} · {v}<br>{m}: {a} → {b} ({c})'],
  // schematics
  schem: ['示意，非数据', 'schematic, not data', '개념도, 데이터 아님'],
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
  // T6 table
  tScen: ['情景', 'Scenario', '시나리오'], tBind: ['取紧要素（种子）', 'Binding element (seeds)', '걸리는 요소 (시드)'],
  tPrice: ['对偶价格<br>个/日 每 h/日', 'Dual price<br>tasks/day per h/day', '쌍대 가격<br>건/일 per h/일'],
  tVeh: ['折合台车', 'In vehicles', '차량 환산'], tRatio: ['平台 / T1′', 'Plateau / T1′', '평탄 / T1′'],
  sEre: ['搭载组合', 'Erection mix', '탑재 조합'], sMain: ['主情景', 'Main scenario', '주 시나리오'],
  road: ['道路{id}', 'road {id}', '도로{id}'],
};
const t = k => T[k][LI[Deck.lang]];
const f0 = v => Math.round(v).toLocaleString('en-US');
const sgn = v => { const r = Math.round(v) || 0; return (r > 0 ? '+' : '') + r + '%'; };
const pc = r => Math.round(100 * r);
const range = (a, b, st) => { const r = []; for (let v = a; v <= b + 1e-9; v += st) r.push(+v.toFixed(6)); return r; };
const pathOf = pts => pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('');
const B = D.bounds, P = D.probe;

// ---------- the dividing rule: capacity interval of two scenarios ----------
function drawIvl() {
  const W = 600, H = fitH('cIvl', W, 330), m = { l: 12, r: 76, t: 8, b: 46 };
  const s = frame('cIvl', W, H, t('ivlLbl'));
  const x = lin(0, 2000, m.l, W - m.r);
  const g = el('g', { class: 'grid' }, s), a = el('g', { class: 'axis' }, s);
  range(0, 2000, 500).forEach(v => { el('line', { x1: x(v), x2: x(v), y1: m.t, y2: H - m.b }, g); el('text', { x: x(v), y: H - m.b + 17, 'text-anchor': 'middle' }, s, f0(v)); });
  el('path', { d: `M${m.l} ${H - m.b}H${W - m.r}` }, a);
  el('text', { x: (m.l + W - m.r) / 2, y: H - 6, 'text-anchor': 'middle' }, s, t('thr'));
  const band = (H - m.t - m.b) / 2;
  [['main', 'rowMain', 'gapMain', 'var(--oxide)'], ['erection', 'rowEre', 'gapEre', 'var(--good)']].forEach(([k, rowK, gapK, rc], i) => {
    const b = B[k], y0 = m.t + i * band, bh = Math.min(40, band * 0.34), by = y0 + band * 0.42;
    el('text', { x: m.l, y: y0 + band * 0.2, class: 't-strong', style: 'font-size:14px' }, s, t(rowK));
    const solid = anim(el('rect', { x: x(0), y: by, width: x(b.plateau) - x(0), height: bh, style: 'fill:var(--oxide);opacity:.88' }, s), 'a-x', .3 + .3 * i);
    const gap = anim(el('rect', { x: x(b.plateau), y: by, width: x(b.T1t[0]) - x(b.plateau), height: bh, style: 'fill:var(--oxide-soft);stroke:var(--oxide);stroke-width:1.4;stroke-dasharray:5 3' }, s), 'a-fade', .7 + .3 * i);
    el('text', { x: x(b.plateau) - 8, y: by + bh / 2 + 5, 'text-anchor': 'end', style: 'fill:var(--paper);font-weight:600;font-size:14px' }, s, f0(b.plateau));
    // T1′ tick and its seed range
    const wy = by - 9;
    el('path', { d: `M${x(b.T1t[1])} ${wy}H${x(b.T1t[2])}M${x(b.T1t[1])} ${wy - 4}V${wy + 4}M${x(b.T1t[2])} ${wy - 4}V${wy + 4}`, style: 'stroke:var(--ink3);stroke-width:1.4;fill:none' }, s);
    el('path', { d: `M${x(b.T1t[0])} ${wy - 6}V${by + bh + 4}`, style: 'stroke:var(--ink);stroke-width:2.4' }, s);
    el('text', { x: x(b.T1t[0]) + (i ? 6 : -6), y: wy - 8, 'text-anchor': i ? 'start' : 'end', style: 'fill:var(--ink);font-weight:600' }, s, `T1′ ${f0(b.T1t[0])}`);
    const wide = x(b.T1t[0]) - x(b.plateau) > 230;
    anim(el('text', wide ? { x: (x(b.plateau) + x(b.T1t[0])) / 2, y: by + bh / 2 + 5, 'text-anchor': 'middle', style: 'fill:var(--oxide);font-weight:600' }
      : { x: x(b.T1t[0]) + 10, y: by + bh / 2 + 5, style: `fill:${rc};font-weight:600` }, s, t(gapK)), 'a-fade', 1.1 + .2 * i);
    anim(el('text', { x: W - 4, y: by + bh / 2 + 10, 'text-anchor': 'end', style: `fill:${rc};font:700 30px var(--d-en)` }, s, pc(b.ratio) + '%'), 'a-pop', 1.2 + .2 * i);
    const tip = () => fmt(t('ivlTip'), { row: t(rowK), p: f0(b.plateau), t: f0(b.T1t[0]), lo: f0(b.T1t[1]), hi: f0(b.T1t[2]), r: pc(b.ratio) });
    hover(solid, tip); hover(gap, tip);
  });
  swatches('lgIvl', [['var(--oxide)', t('lgPlat')], ['var(--oxide-soft)', t('lgGap'), 'border:1px dashed var(--oxide)'], ['var(--ink)', t('lgT1'), 'width:3px']]);
  $('rdEre').textContent = pc(B.erection.ratio) + '%';
  $('rdMain').textContent = pc(B.main.ratio) + '%';
}

// ---------- the probe: change after three alterations of road 161 ----------
function drawProbe() {
  const W = 600, H = fitH('cProbe', W, 380), m = { l: 62, r: 6, t: 44, b: 40 };
  const s = frame('cProbe', W, H, t('probeLbl'));
  const y = lin(0, 80, H - m.b, m.t), gapP = 22, pw = (W - m.l - m.r - gapP) / 2;
  const g = el('g', { class: 'grid' }, s), a = el('g', { class: 'axis' }, s);
  range(0, 80, 20).forEach(v => { el('line', { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v) }, g); el('text', { x: m.l - 6, y: y(v) + 4, 'text-anchor': 'end' }, s, (v ? '+' : '') + v + '%'); });
  el('path', { d: `M${m.l} ${m.t}V${H - m.b}H${W - m.r}` }, a);
  yTitle(s, 14, (m.t + H - m.b) / 2, t('chg'));
  el('path', { d: `M${m.l + pw + gapP / 2} ${m.t - 34}V${H - m.b}`, style: 'stroke:var(--line);stroke-width:1.2' }, s);
  const MET = [['T1t', 'mT1', 'fill:var(--paper);stroke:var(--ink2);stroke-width:1.4'], ['res', 'mRes', 'fill:var(--oxide)'], ['seg', 'mSeg', 'fill:var(--amber-hi)']];
  const VN = ['vW12', 'vSect', 'vBay'];
  [['main', 'pMain', { T1t: 'T1t', res: 'res120', seg: 'seg120' }, 'var(--oxide)'], ['erection', 'pEre', { T1t: 'T1t', res: 'res', seg: 'seg' }, 'var(--good)']].forEach(([k, pk, key, pcol], i) => {
    const x0 = m.l + i * (pw + gapP), d = P[k];
    el('text', { x: x0 + pw / 2, y: m.t - 26, 'text-anchor': 'middle', class: 't-strong', style: 'font-size:13.5px' }, s, t(pk));
    el('text', { x: x0 + pw / 2, y: m.t - 9, 'text-anchor': 'middle', style: `fill:${pcol};font-weight:600` }, s, fmt(t('pRatio'), { r: pc(B[k].ratio) }));
    const gw = pw / 3, bw = Math.min(22, (gw - 16) / 3);
    VN.forEach((vn, j) => {
      const gx = x0 + j * gw + (gw - 3 * bw - 8) / 2;
      el('text', { x: x0 + j * gw + gw / 2, y: H - m.b + 17, 'text-anchor': 'middle' }, s, t(vn));
      MET.forEach(([mk, mn, st], q) => {
        const v = d.chg[key[mk]][j], raw = d[key[mk]], bx = gx + q * (bw + 4), top = y(Math.max(0, v));
        const r = anim(el('rect', { x: bx, y: top, width: bw, height: Math.max(1, y(0) - top), style: st }, s), 'a-y', .35 + .12 * (3 * j + q) + .4 * i);
        if (mk === 'seg') el('rect', { x: bx, y: top, width: bw, height: Math.max(1, y(0) - top), style: 'fill:url(#hatch);pointer-events:none' }, s);
        anim(el('text', { x: bx + bw / 2, y: top - 4, 'text-anchor': 'middle', style: `font-size:12px;font-weight:600;paint-order:stroke;stroke:var(--paper);stroke-width:3px;fill:${mk === 'res' ? 'var(--oxide)' : 'var(--ink2)'}` }, s, sgn(v)), 'a-fade', 1 + .4 * i);
        hover(r, () => fmt(t('probeTip'), { panel: t(pk), v: t(vn), m: t(mk === 'seg' ? 'mSegS' : mn), a: f0(raw[0]), b: f0(raw[j + 1]), c: v.toFixed(1) + '%' }));
      });
    });
  });
  swatches('lgProbe', [['var(--paper)', t('mT1'), 'border:1.4px solid var(--ink2)'], ['var(--oxide)', t('mRes')], ['var(--amber-hi)', t('mSeg'), 'background-image:repeating-linear-gradient(45deg,transparent 0 3px,rgba(43,43,43,.55) 3px 4px)']]);
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

// ---------- tables filled from the data ----------
function fillTables() {
  const name = b => fmt(t('road'), { id: b.id }) + ` <span class="tiny">(${b.w} m, ${f0(b.len)} m)</span>`;
  const head = `<thead><tr><th>${t('tScen')}</th><th>${t('tBind')}</th><th class="c">${t('tPrice')}</th><th class="c">${t('tVeh')}</th><th class="c">${t('tRatio')}</th></tr></thead>`;
  const rows = (k, sk, cls) => B[k].bind.map((b, j) => `<tr class="${cls}">${j ? '' : `<td rowspan="${B[k].bind.length}">${t(sk)}</td>`}<td>${name(b)} · ${b.seeds}/10</td>`
    + `<td class="c mono">${b.price.toFixed(1)}</td><td class="c mono"><b>${b.veh.toFixed(1)}</b></td>${j ? '' : `<td class="c mono" rowspan="${B[k].bind.length}">${pc(B[k].ratio)}%</td>`}</tr>`).join('');
  $('t6Tbl').innerHTML = head + '<tbody>' + rows('erection', 'sEre', 'hi') + rows('main', 'sMain', '') + '</tbody>';
  ['t6Veh', 't6VehEn', 't6VehKo'].forEach(id => { $(id).textContent = B.erection.bind[0].veh.toFixed(1); });
  // prototype column of the planned table: reservation change at K = 100 in the erection mix (appendix A)
  const r = P.erection.res, c = P.erection.chg.res;
  const proto = { 0: c[0], 1: c[1], 2: 100 * (r[3] - r[2]) / r[2] };   // passing bays: "sections + bays" against sections alone
  document.querySelectorAll('#planTbl td[data-p]').forEach(td => { td.textContent = sgn(proto[td.dataset.p]); });
}

Deck.start({
  strings: T,
  sections: { intro: ['导读', 'Overview', '개요'], q: ['问题与定位', 'Question and position', '질문과 위치'], rule: ['分界规则与改造菜单', 'Dividing rule and menu', '경계 규칙과 메뉴'],
    res: ['初步证据', 'First evidence', '초기 근거'], theory: ['汇率与协同设计', 'Exchange rate and co-design', '환율과 협동 설계'], h7: ['车型与占路', 'Vehicle type', '차종과 점유'],
    status: ['进度与去向', 'Progress and venues', '진행과 투고처'], ref: ['参考文献', 'References', '참고문헌'], end: ['结语', 'Close', '맺음'] },
  draw: [drawIvl, drawProbe, drawH4, drawBlock, fillTables],
});
})();
