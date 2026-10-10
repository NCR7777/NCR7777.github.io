"""Check a deck's layout before publishing: every slide, in each language, with the web fonts and with them blocked
(as for readers who cannot reach Google Fonts), animations off. Reports content that leaves its slide or runs into
the slide's source line, pages whose content box is nearly full, and how full the reference pages are. Exits with
status 1 if anything overflows.

  python tools/check_layout.py <deck folder> [--slides 58,59] [--margin 10]
"""
import functools
import http.server
import sys
import threading
from pathlib import Path

from playwright.sync_api import sync_playwright

SITE = Path(__file__).resolve().parents[1]
args = sys.argv[1:]
if not args or not (SITE / args[0] / 'index.html').is_file():
    sys.exit(__doc__)
DECK = args[0]
ONLY = [int(x) for x in args[args.index('--slides') + 1].split(',')] if '--slides' in args else None
MARGIN = float(args[args.index('--margin') + 1]) if '--margin' in args else 10   # design px a content box must keep free
CHECK = """([i, margin]) => {
  const s = document.querySelectorAll('.slide')[i], r = s.getBoundingClientRect(), k = r.width / 1280, out = [];
  s.querySelectorAll('*').forEach(e => {
    if (e.closest('aside.notes') || (e.closest('svg') && e.tagName.toLowerCase() !== 'svg')) return;
    const b = e.getBoundingClientRect();
    if (!b.width || !b.height) return;
    const over = Math.max(b.bottom - r.bottom, b.right - r.right) / k;
    if (over > 1) out.push(`overflow ${e.tagName.toLowerCase()}.${(e.className && e.className.baseVal === undefined ? e.className : '').split(' ')[0]} +${over.toFixed(0)}px`);
  });
  const c = s.querySelector('.content'), src = s.querySelector(':scope > .src');
  let fill = null;
  if (c && src) {   // content that grows past its box runs into the source line, though it stays inside the slide
    const top = src.getBoundingClientRect().top;
    const low = Math.max(0, ...[...c.querySelectorAll('*')].filter(e => !(e.closest('svg') && e.tagName.toLowerCase() !== 'svg'))
      .map(e => e.getBoundingClientRect()).filter(b => b.width && b.height).map(b => b.bottom));
    if ((low - top) / k > 1) out.push(`overflow into the source line +${((low - top) / k).toFixed(0)}px`);
  }
  if (c) {
    const cr = c.getBoundingClientRect();
    const bottom = Math.max(...[...c.querySelectorAll(':scope > *')].map(e => e.getBoundingClientRect().bottom));
    const used = (bottom - cr.top) / k, room = cr.height / k;
    if (s.dataset.sec === 'ref') fill = used / room;
    if (used > room - margin + 0.5 && s.dataset.sec === 'ref') out.push(`tight: ${(room - used).toFixed(0)}px free`);
  }
  return [[...new Set(out)].slice(0, 5), fill];
}"""

handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(SITE))
handler.log_message = lambda *a: None
server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), handler)
threading.Thread(target=server.serve_forever, daemon=True).start()
bad = 0
with sync_playwright() as p:
    browser = p.chromium.launch(channel='chrome')
    for fonts in ('web', 'blocked'):
        for lang in ('zh', 'en', 'ko'):
            ctx = browser.new_context(viewport={'width': 1440, 'height': 900})
            ctx.add_init_script("try{localStorage.setItem('deck-lang2','%s')}catch(e){}" % lang)
            if fonts == 'blocked':
                ctx.route('**/fonts.g*/**', lambda r: r.abort())
            page = ctx.new_page()
            page.goto('http://127.0.0.1:%d/%s/index.html' % (server.server_address[1], DECK))
            page.add_style_tag(content='*,*::before,*::after{animation:none!important;transition:none!important}')
            page.wait_for_timeout(1500)
            n = page.evaluate("document.querySelectorAll('.slide').length")
            fills = []
            for i in (ONLY and [x - 1 for x in ONLY]) or range(n):
                page.evaluate("i => { location.hash = '#s' + (i + 1) }", i)
                page.wait_for_timeout(120)
                problems, fill = page.evaluate(CHECK, [i, MARGIN])
                if fill is not None:
                    fills.append('s%d %.2f' % (i + 1, fill))
                if problems:
                    bad += any(x.startswith('overflow') for x in problems)
                    print('%s %-7s %s s%d: %s' % (DECK, fonts, lang, i + 1, '; '.join(problems)))
            print('%s %-7s %s: %d slides checked; reference pages filled %s' % (DECK, fonts, lang, n if not ONLY else len(ONLY), ', '.join(fills) or '-'))
            ctx.close()
    browser.close()
server.shutdown()
sys.exit(1 if bad else 0)
