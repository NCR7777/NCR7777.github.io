"""Print one deck to PDF: one 1280 x 720 page per slide, per language, without speaker notes.

Charts and tables are in their final state; interactive slides show their default settings. The PDFs are compressed
losslessly (duplicate objects removed, streams and fonts deflated) and written to <deck>/pdf/<base>_<lang>.pdf, where
<base> is the deck's data-pdf attribute; these are the files behind the PDF button. Needs Playwright with Google Chrome,
and PyMuPDF.

Run after every change to a deck:  python tools/make_pdf.py <deck folder, e.g. fleet> [en ko zh] [--out DIR]
"""
import functools
import http.server
import re
import sys
import threading
from pathlib import Path

import fitz
from playwright.sync_api import sync_playwright

SITE = Path(__file__).resolve().parents[1]
args = sys.argv[1:]
if not args or not (SITE / args[0] / 'index.html').is_file():
    sys.exit(__doc__)
DECK = args[0]
OUT = Path(args[args.index('--out') + 1]) if '--out' in args else SITE / DECK / 'pdf'
LANGS = [a for a in args if a in ('en', 'ko', 'zh')] or ['en', 'ko', 'zh']
BASE = re.search(r'<main id="deck"[^>]*\sdata-pdf="([^"]+)"', (SITE / DECK / 'index.html').read_text(encoding='utf-8')).group(1)
OUT.mkdir(parents=True, exist_ok=True)
PRINT_CSS = """
@page { size: 1280px 720px; margin: 0 }
html, body { width: 1280px !important; height: auto !important; margin: 0 !important; padding: 0 !important; overflow: visible !important; background: #fff !important }
.bar, .foot, .drawer, .tip, #notesp, .help { display: none !important }
.app { display: block !important; height: auto !important }
.stagewrap { display: block !important; padding: 0 !important }
.stagebox { width: 1280px !important; height: auto !important }
.stage { position: static !important; width: 1280px !important; height: auto !important; transform: none !important;
         box-shadow: none !important; border-radius: 0 !important; overflow: visible !important }
.slide { position: relative !important; inset: auto !important; width: 1280px !important; height: 720px !important;
         opacity: 1 !important; visibility: visible !important; overflow: hidden !important; box-sizing: border-box;
         background: var(--paper); break-after: page; page-break-after: always }
.slide:last-child { break-after: auto; page-break-after: auto }
*, *::before, *::after { animation: none !important; transition: none !important }
"""

handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(SITE))   # site root, so ../shared resolves
handler.log_message = lambda *a: None
server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), handler)
threading.Thread(target=server.serve_forever, daemon=True).start()
with sync_playwright() as p:
    browser = p.chromium.launch(channel='chrome')
    for lang in LANGS:
        ctx = browser.new_context(viewport={'width': 1440, 'height': 900}, color_scheme='light')
        ctx.add_init_script("try{localStorage.setItem('deck-lang2','%s')}catch(e){}" % lang)
        page = ctx.new_page()
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.goto('http://127.0.0.1:%d/%s/index.html' % (server.server_address[1], DECK))
        page.evaluate('document.fonts.ready')
        page.wait_for_timeout(2500)              # charts are drawn and fonts settled
        n = page.evaluate("""() => { document.documentElement.dataset.theme = 'light';
          document.querySelectorAll('.slide').forEach(s => s.classList.remove('play'));
          return document.querySelectorAll('.slide').length; }""")
        page.add_style_tag(content=PRINT_CSS)
        page.emulate_media(media='print')
        page.wait_for_timeout(500)
        raw = OUT / ('_raw_%s.pdf' % lang)
        out = OUT / ('%s_%s.pdf' % (BASE, lang))
        page.pdf(path=str(raw), prefer_css_page_size=True, print_background=True)
        doc = fitz.open(raw)
        assert len(doc) == n, (lang, len(doc), n)
        doc.save(out, garbage=4, deflate=True, deflate_fonts=True, clean=True)
        doc.close()
        raw.unlink()
        assert not errors, errors
        print(lang, n, 'pages,', out.stat().st_size, 'bytes ->', out)
        ctx.close()
    browser.close()
server.shutdown()
