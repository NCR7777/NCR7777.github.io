// Deck engine shared by every briefing on this site.
// A deck page holds its slides in <main id="deck">, loads this file, then its own script, which calls Deck.start(config).
// The engine builds the chrome (top bar, stage, notes panel, footer, contents and glossary drawers, tooltip) and runs
// paging, language, notes, theme, full screen, the PDF link and the layout. The contract is in README.md.
(() => {
'use strict';
const root = document.documentElement;
const NS = 'http://www.w3.org/2000/svg';
const LANGS = ['en', 'ko', 'zh'];          // order of the language buttons
const LI = { zh: 0, en: 1, ko: 2 };        // strings are triples [zh, en, ko]
const $ = id => document.getElementById(id);
const tri = a => LANGS.map(l => `<span lang="${l}">${a[LI[l]]}</span>`).join('');
const fmt = (s, o) => s.replace(/\{(\w+)\}/g, (_, k) => o[k]);
let lang = LANGS.includes(root.dataset.lang) ? root.dataset.lang : 'en';

// chrome strings; a deck adds its own (and must give `title`) through config.strings
const S = {
  home: ['全部汇报', 'All briefings', '전체 보고'],
  toc: ['目录', 'Contents', '목차'], notes: ['讲稿', 'Notes', '발표 원고'], notesH: ['讲稿', 'Speaker notes', '발표 원고'],
  gloss: ['术语', 'Glossary', '용어'], glossH: ['术语表', 'Glossary', '용어집'], full: ['全屏', 'Full screen', '전체 화면'],
  cover: ['封面', 'Cover', '표지'],
  hPage: ['← → / 滚轮 翻页', '← → / wheel: slides', '← → / 휠: 넘기기'], hToc: ['T 目录', 'T contents', 'T 목차'],
  hNotes: ['N 讲稿', 'N notes', 'N 원고'], hGloss: ['G 术语', 'G glossary', 'G 용어'], hFull: ['F 全屏', 'F full screen', 'F 전체 화면'],
  pdfLbl: ['下载当前语言的幻灯片 PDF（{n} 页，不含讲稿）', 'Download the slides as PDF in this language ({n} pages, no notes)', '이 언어로 슬라이드 PDF 다운로드 ({n}쪽, 원고 제외)'],
};
const t = k => S[k][LI[lang]];

// ---------- svg helpers for the decks' charts ----------
function el(tag, attrs, parent, text) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) if (attrs[k] != null) e.setAttribute(k, attrs[k]);
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
// entrance motion (the .a-* rules in deck.css), played once when the slide opens; d is the delay in seconds
function anim(e, cls, d) { e.classList.add(cls); e.style.setProperty('--d', d.toFixed(2) + 's'); return e; }
const spread = k => (k * 0.618034) % 1;   // even but unordered spread in [0, 1), so points do not appear in a sweep
const lin = (d0, d1, r0, r1) => v => r0 + (v - d0) * (r1 - r0) / (d1 - d0);
function yTitle(s, x, y, text) { el('text', { x, y, transform: `rotate(-90 ${x} ${y})`, 'text-anchor': 'middle' }, s, text); }
function swatches(id, items) {
  $(id).innerHTML = items.map(([c, name, extra]) => `<span><i style="background:${c};${extra || ''}"></i>${name}</span>`).join('');
}
function safe(f) { try { f(); } catch (e) { if (window.console) console.error(f.name, e); } }

// ---------- tooltip ----------
let tip = null;
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

// shared drawing symbols: a hull block, a long and a short transporter, a hatch pattern
const SPRITE = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<symbol id="blk" viewBox="0 0 340 110"><path d="M6 8H334V70C334 96 312 104 286 104H54C28 104 6 96 6 70Z" style="fill:var(--steel)"/><path d="M6 32H334M60 8V104M112 8V104M164 8V104M216 8V104M268 8V104" style="stroke:var(--paper);stroke-opacity:.3;stroke-width:2;fill:none"/></symbol>
<symbol id="trL" viewBox="0 0 360 34"><rect x="0" y="0" width="360" height="14" rx="2" style="fill:var(--amber-hi)"/><rect x="0" y="0" width="24" height="14" rx="2" style="fill:var(--ink)"/><g style="fill:var(--ink)">${Array.from({ length: 17 }, (_, i) => `<circle cx="${20 + 20 * i}" cy="24" r="8"/>`).join('')}</g></symbol>
<symbol id="trS" viewBox="0 0 170 34"><rect x="0" y="0" width="170" height="14" rx="2" style="fill:var(--amber-hi)"/><rect x="0" y="0" width="20" height="14" rx="2" style="fill:var(--ink)"/><g style="fill:var(--ink)">${Array.from({ length: 8 }, (_, i) => `<circle cx="${16 + 20 * i}" cy="24" r="8"/>`).join('')}</g></symbol>
<pattern id="hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="5" stroke="#2b2b2b" stroke-width="1" stroke-opacity=".55"/></pattern>
</defs></svg>`;

const ICON = {
  home: '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" style="flex:none"><path d="M2.5 2.5h4.5v4.5h-4.5zM9 2.5h4.5v4.5H9zM2.5 9h4.5v4.5h-4.5zM9 9h4.5v4.5H9z" style="fill:none;stroke:currentColor;stroke-width:1.4"/></svg>',
  globe: '<svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true" style="flex:none"><circle cx="8" cy="8" r="6.6" style="fill:none;stroke:currentColor;stroke-width:1.3"/><path d="M1.6 8h12.8M8 1.4c-2.2 2.2-2.2 11 0 13.2M8 1.4c2.2 2.2 2.2 11 0 13.2" style="fill:none;stroke:currentColor;stroke-width:1.1"/></svg>',
  pdf: '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" style="flex:none"><path d="M8 2v8M4.5 7 8 10.5 11.5 7M3 13.5h10" style="fill:none;stroke:currentColor;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round"/></svg>',
  prev: '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M10 3L5 8l5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  next: '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M6 3l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};

// ---------- chrome: wraps the slides of <main id="deck"> into the app shell ----------
function shell() {
  const deck = $('deck'), d = deck.dataset, brand = deck.querySelector('.brand-src'), gl = $('glossary');
  const btn = (id, k, key) => `<button type="button" class="tbtn" id="${id}" aria-pressed="false">${tri(S[k])}<kbd>${key}</kbd></button>`;
  const app = document.createElement('div');
  app.className = 'app'; app.id = 'app';
  app.innerHTML = `<div class="bar">
    <div class="brand"><i></i>${brand ? brand.innerHTML : ''}</div>
    ${d.home ? `<a class="tbtn" id="btnHome" href="${d.home}">${ICON.home}${tri(S.home)}</a>` : ''}
    <div class="langbox"><span class="langlbl" id="langLbl">${ICON.globe}<span>Language · 언어 · 语言</span></span>
      <div class="seg" role="group" aria-labelledby="langLbl"><button type="button" data-set-lang="en">EN</button><button type="button" data-set-lang="ko">한국어</button><button type="button" data-set-lang="zh">中文</button></div></div>
    ${btn('btnToc', 'toc', 'T')}${btn('btnNotes', 'notes', 'N')}${gl ? btn('btnGloss', 'gloss', 'G') : ''}
    <button type="button" class="tbtn" id="btnTheme" aria-label="Theme">◐</button>
    ${d.pdf ? `<a class="tbtn" id="btnPdf" href="#">${ICON.pdf}PDF</a>` : ''}
    <button type="button" class="tbtn" id="btnFull">${tri(S.full)}<kbd>F</kbd></button>
  </div>
  <div class="stagewrap" id="stagewrap"><div class="stagebox" id="stagebox"><div class="stage" id="stage"></div></div></div>
  <div class="notesp" id="notesp" hidden><div class="nh">${tri(S.notesH)}</div><div id="notesBody"></div></div>
  <div class="foot">
    <button type="button" class="nav" id="prev" aria-label="Previous slide">${ICON.prev}</button>
    <button type="button" class="nav" id="next" aria-label="Next slide">${ICON.next}</button>
    <div class="prog" id="prog" role="navigation" aria-label="Chapters"></div>
    <span class="help">${LANGS.map(l => `<span lang="${l}">${['hPage', 'hToc', 'hNotes', gl && 'hGloss', 'hFull'].filter(Boolean).map(k => S[k][LI[l]]).join(' · ')}</span>`).join('')}</span>
    <span class="count" id="count"></span>
  </div>`;
  app.querySelector('#stage').append(...deck.querySelectorAll(':scope > .slide'));
  deck.replaceWith(app);
  document.body.insertAdjacentHTML('afterbegin', SPRITE);
  if (gl) {
    gl.hidden = false;
    document.body.insertAdjacentHTML('beforeend', `<div class="drawer" id="drawer" hidden role="dialog" aria-label="Glossary"><h2><span>${tri(S.glossH)}</span><button type="button" class="tbtn" id="gClose" aria-label="Close">✕</button></h2></div>`);
    $('drawer').appendChild(gl);
  }
  document.body.insertAdjacentHTML('beforeend', `<div class="drawer" id="tocDrawer" hidden role="dialog" aria-label="Contents"><h2><span>${tri(S.toc)}</span><button type="button" class="tbtn" id="tocClose" aria-label="Close">✕</button></h2><ol class="toc" id="toc"></ol></div><div class="tip" id="tip" hidden></div>`);
  tip = $('tip');
  return d.pdf || '';
}

// ---------- engine ----------
let SEC = {}, draws = [], slides = [], cur = 0, notesOn = false, stage, box, wrap, pdfBase = '';
function drawAll() { draws.forEach(safe); }
function fillNotes() {
  const a = slides[cur].querySelector('aside.notes');
  $('notesBody').innerHTML = a ? a.innerHTML : '';
}
function markToc() { document.querySelectorAll('#toc button').forEach(b => b.setAttribute('aria-current', +b.dataset.i === cur)); }
let playTimer = null;
function go(i, keepHash) {
  i = Math.max(0, Math.min(slides.length - 1, i));
  root.dataset.dir = i < cur ? -1 : 1;
  slides[cur].classList.remove('on', 'play');
  slides[cur].setAttribute('aria-hidden', 'true');
  cur = i;
  const sl = slides[cur];
  sl.classList.add('on', 'play');
  sl.removeAttribute('aria-hidden');
  $('count').textContent = `${cur + 1} / ${slides.length}`;
  clearTimeout(playTimer);
  playTimer = setTimeout(() => sl.classList.remove('play'), 3000);
  paintProg();
  $('prev').setAttribute('aria-disabled', cur === 0);
  $('next').setAttribute('aria-disabled', cur === slides.length - 1);
  tip.hidden = true;
  fillNotes();
  markToc();
  if (!keepHash) try { history.replaceState(null, '', '#s' + (cur + 1)); } catch (e) {}
}
let wasFlow = null;
function layout() {
  // reading mode on phones and on screens too short for a legible slide (e.g. a phone held sideways)
  const flow = innerWidth < 760 || Math.min((innerWidth - 32) / 1280, (innerHeight - 120) / 720) < 0.42;
  root.classList.toggle('flow', flow);
  if (wasFlow !== null && wasFlow !== flow) { drawAll(); fit(); }
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
  if (S.title) document.title = t('title');
  try { localStorage.setItem('deck-lang2', l); } catch (e) {}
  const pdf = $('btnPdf');
  if (pdf) {
    const f = `${pdfBase}_${l}.pdf`, lbl = fmt(t('pdfLbl'), { n: slides.length });
    pdf.href = `pdf/${f}`;
    pdf.setAttribute('download', f);
    pdf.title = lbl;
    pdf.setAttribute('aria-label', lbl);
  }
  document.querySelectorAll('[data-set-lang]').forEach(b => b.setAttribute('aria-pressed', b.dataset.setLang === l));
  drawAll();
  fit();
  fillNotes();
  buildProg();
}
// chapter progress: one segment per section, filled up to the current slide; click a segment to jump to its first slide
function buildProg() {
  const host = $('prog'), groups = [];
  slides.forEach((s, i) => { const k = s.dataset.sec; if (!groups.length || groups[groups.length - 1].k !== k) groups.push({ k, first: i, n: 0 }); groups[groups.length - 1].n++; });
  host.innerHTML = groups.map(g => {
    const name = (SEC[g.k] || ['', '', ''])[LI[lang]] || (g.k === 'cover' ? t('cover') : '');
    return `<span class="ch" data-first="${g.first}" data-n="${g.n}" data-name="${name}" style="flex-grow:${g.n}" title="${name}"><i></i></span>`;
  }).join('');
  paintProg();
}
function paintProg() {
  document.querySelectorAll('#prog .ch').forEach(c => {
    const a = +c.dataset.first, n = +c.dataset.n, done = Math.max(0, Math.min(n, cur - a + 1));
    c.firstChild.style.width = (100 * done / n) + '%';
    c.classList.toggle('cur', cur >= a && cur < a + n);
  });
}
function toggleNotes(on) {
  notesOn = on ?? !notesOn;
  $('notesp').hidden = !notesOn;
  root.classList.toggle('show-notes', notesOn);
  $('btnNotes').setAttribute('aria-pressed', notesOn);
  layout();
}
function toggleGloss(on) {
  const d = $('drawer');
  if (!d) return;
  const show = on ?? d.hidden;
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
function paintRange(r) { r.style.setProperty('--p', (100 * (r.value - r.min) / (r.max - r.min)) + '%'); }
// A content box marked data-fit="min,max" (font sizes in px) is filled by its text: the largest font size, then the
// largest line height, at which every such box of the deck still fits. It is measured in the reader's own browser, so
// fallback fonts and a minimum-font-size setting are accounted for; all boxes share one size so the pages match.
function fit() {
  const boxes = [...document.querySelectorAll('.slide [data-fit]')];
  boxes.forEach(b => { b.style.removeProperty('--fs'); b.style.removeProperty('--lh'); });
  if (!boxes.length || root.classList.contains('flow')) return;
  const [lo, hi] = boxes[0].dataset.fit.split(',').map(Number);
  const set = (v, k) => boxes.forEach(b => b.style.setProperty(k, v + (k === '--fs' ? 'px' : '')));
  const fits = () => boxes.every(b => {   // the last block must end 14 design px above the box's bottom edge
    const r = b.getBoundingClientRect(), k = r.height / b.clientHeight || 1;
    return Math.max(...[...b.children].map(c => c.getBoundingClientRect().bottom)) <= r.bottom - 14 * k;
  });
  const search = (k, a, z) => { for (let n = 0; n < 9; n++) { const m = (a + z) / 2; set(m, k); if (fits()) a = m; else z = m; } set(a, k); return a; };
  set(1.38, '--lh');
  set(hi, '--fs');
  if (fits()) search('--lh', 1.38, 1.8);   // the largest font still leaves room: open up the lines
  else search('--fs', lo, hi);
}

// config: { strings: {key: [zh, en, ko]} (with `title`), sections: {sec: [zh, en, ko]}, draw: [fn] (redrawn on language,
// font and layout changes), init(): wires the deck's own controls and draws static figures once, after the shell exists }
function start(cfg) {
  Object.assign(S, cfg.strings || {});
  SEC = cfg.sections || {};
  draws = cfg.draw || [];
  pdfBase = shell();
  stage = $('stage'); box = $('stagebox'); wrap = $('stagewrap');
  slides = [...document.querySelectorAll('.slide')];
  slides.forEach((s, i) => {
    s.id = 's' + (i + 1);
    const eb = s.querySelector('.eb'), L = SEC[s.dataset.sec];
    if (eb && L) eb.innerHTML = `<span class="sec">${tri(L)}</span><span class="no">${String(i + 1).padStart(2, '0')} / ${slides.length}</span>`;
  });
  // contents, built from each slide's title in all three languages
  const secOf = i => slides[i].dataset.sec;
  $('toc').innerHTML = slides.map((s, i) => {
    const head = i === 0 || secOf(i) !== secOf(i - 1) ? `<li class="sh">${SEC[secOf(i)] ? tri(SEC[secOf(i)]) : ''}</li>` : '';
    const ttl = s.querySelector('.ttl, h1');
    const names = LANGS.map(l => { const e = ttl && ttl.querySelector(`[lang="${l}"]`); return `<span lang="${l}">${e ? e.textContent.trim() : ''}</span>`; }).join('');
    return `${head}<li><button type="button" data-i="${i}"><span class="mono">${i + 1}</span><span>${names}</span></button></li>`;
  }).join('');
  // an agenda item with data-go="<sec>" jumps to the first slide of that section and shows its page number in .pg
  document.querySelectorAll('.slide [data-go]').forEach(li => {
    const i = slides.findIndex(s => s.dataset.sec === li.dataset.go);
    const pg = li.querySelector('.pg');
    if (pg) pg.textContent = 'p. ' + (i + 1);
    li.addEventListener('click', () => go(i));
    li.addEventListener('keydown', e => { if (e.key === 'Enter') go(i); });
  });
  // sliders show their value as a filled track
  document.querySelectorAll('input[type="range"]').forEach(r => { paintRange(r); r.addEventListener('input', () => paintRange(r)); });

  document.querySelectorAll('[data-set-lang]').forEach(b => b.addEventListener('click', () => setLang(b.dataset.setLang)));
  $('prev').addEventListener('click', () => go(cur - 1));
  $('next').addEventListener('click', () => go(cur + 1));
  $('prog').addEventListener('click', e => { const c = e.target.closest('.ch'); if (c) go(+c.dataset.first); });
  $('btnNotes').addEventListener('click', () => toggleNotes());
  if ($('drawer')) { $('btnGloss').addEventListener('click', () => toggleGloss()); $('gClose').addEventListener('click', () => toggleGloss(false)); }
  $('btnToc').addEventListener('click', () => toggleToc());
  $('tocClose').addEventListener('click', () => toggleToc(false));
  $('toc').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { go(+b.dataset.i); toggleToc(false); } });
  $('btnFull').addEventListener('click', toggleFull);
  $('btnTheme').addEventListener('click', () => {
    const dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.theme = dark ? 'light' : 'dark';
  });
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
  wrap.addEventListener('touchend', e => {
    if (!ts || e.touches.length) { ts = null; return; }
    const dx = e.changedTouches[0].clientX - ts.x, dy = e.changedTouches[0].clientY - ts.y;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) go(cur + (dx < 0 ? 1 : -1));   // more sideways than up/down
    ts = null;
  });
  // after a slider is dragged or a select is chosen with the mouse, hand the keyboard back to paging
  addEventListener('pointerup', () => { const a = document.activeElement; if (a && a.matches('input[type="range"]')) a.blur(); });
  document.addEventListener('change', e => { if (e.target.matches('select')) e.target.blur(); });
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

  if (cfg.init) safe(cfg.init);
  slides.forEach(s => s.setAttribute('aria-hidden', 'true'));
  layout();
  setLang(lang);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { drawAll(); fit(); });
  const m0 = /^#s(\d+)$/.exec(location.hash);
  go(m0 ? +m0[1] - 1 : 0, true);
  layout();
}

window.Deck = {
  NS, LANGS, LI, $, tri, fmt, el, frame, fitH, anim, spread, lin, yTitle, swatches, hover, safe, start,
  t, get lang() { return lang; }, go: i => go(i),
};
})();
