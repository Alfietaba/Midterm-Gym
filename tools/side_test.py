import asyncio, subprocess, sys, json
from playwright.async_api import async_playwright
import os, pathlib as _pl
ROOT = str(_pl.Path(__file__).resolve().parents[1])  # repo root, served over http
OUT = ROOT + '/out/shots/'; os.makedirs(OUT, exist_ok=True)
srv = subprocess.Popen([sys.executable, '-m', 'http.server', '8770', '--bind', '127.0.0.1'], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
READ = "() => ({ c: document.getElementById('sd-cn').textContent, t: document.getElementById('sd-tp').textContent, x: document.getElementById('sd-xn').textContent, tn: document.getElementById('sd-tn').textContent, code: document.getElementById('sd-code').textContent, sess: document.getElementById('sd-sess').textContent })"
ANSWER = """(right) => {
  const card = document.querySelector('.stage .qcard'), q = card._q, g = window.__gym;
  if (q.type === 'mc') { const want = right ? q.a : (q.a + 1) % q.opts.length; [...card.querySelectorAll('.opt')].find(b => b._i === want).click(); return 'mc'; }
  if (!right || q.type === 'proof' || q.type === 'order') { document.querySelector('.bar .link').click(); return 'giveup'; }
  const set = (inp, v) => { inp.value = v; inp.dispatchEvent(new Event('input', { bubbles: true })); };
  const inputs = [...card.querySelectorAll('input.cell')];
  if (q.type === 'txt') set(inputs[0], [].concat(q.ans)[0]);
  else { let k = 0; g.partsOf(q).forEach(p => { const vals = (p.kind === 'expr' || /^(inf|-inf|dne)$/i.test(p.ans)) ? [p.ans] : [].concat.apply([], g.structOf(p.ans).rows); vals.forEach(v => set(inputs[k++], v)); }); }
  document.querySelector('.bar .btn.wide').click(); return q.type;
}"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={'width': 1440, 'height': 900})
        await ctx.add_init_script("if (!sessionStorage.getItem('s')) { localStorage.clear(); sessionStorage.setItem('s', '1'); }")
        pg = await ctx.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto('http://127.0.0.1:8770/out/test.html'); await pg.wait_for_timeout(300)
        await pg.click('[data-course="mte121"]'); await pg.click('[data-act="smart"]'); await pg.wait_for_timeout(300)
        vis = await pg.locator('#side').is_visible()
        box = await pg.locator('#side').bounding_box(); app = await pg.locator('.app').bounding_box()
        print('desktop panel visible', vis, '| panel x..', round(box['x']), round(box['x'] + box['width']), '| app starts at', round(app['x']))
        await pg.screenshot(path=OUT + 'side_0.png')
        before = await pg.evaluate(READ); print('before     ', before)
        kind = await pg.evaluate(ANSWER, True); await pg.wait_for_timeout(350)
        await pg.screenshot(path=OUT + 'side_right_mid.png')
        await pg.wait_for_timeout(1000)
        after = await pg.evaluate(READ); print('after right', kind, after)
        await pg.screenshot(path=OUT + 'side_right.png')
        await pg.click('.bar .btn.wide'); await pg.wait_for_timeout(300)
        b2 = await pg.evaluate(READ)
        kind = await pg.evaluate(ANSWER, False); await pg.wait_for_timeout(250)
        await pg.screenshot(path=OUT + 'side_wrong_mid.png')
        await pg.wait_for_timeout(1100)
        a2 = await pg.evaluate(READ); print('wrong      ', kind, b2, '->', a2)
        # a few more right answers, checking the numbers only move up on right answers
        ups = []
        for i in range(6):
            await pg.click('.bar .btn.wide'); await pg.wait_for_timeout(250)
            if await pg.locator('.sum-top').count(): break
            b3 = await pg.evaluate(READ); k = await pg.evaluate(ANSWER, True); await pg.wait_for_timeout(1100)
            while await pg.locator('.overlay .btn').count(): await pg.locator('.overlay .btn').first.click(); await pg.wait_for_timeout(100)
            a3 = await pg.evaluate(READ); ups.append((k, b3['c'], a3['c'], b3['t'], a3['t'], b3['x'], a3['x']))
        for u in ups: print('  right', u)
        # formula dock and panel together at 1280
        await pg.set_viewport_size({'width': 1280, 'height': 800}); await pg.wait_for_timeout(100)
        if await pg.locator('#fs').count():
            await pg.click('#fs'); await pg.wait_for_timeout(300)
            sb = await pg.locator('#side').bounding_box(); db = await pg.locator('#dock').bounding_box(); ab = await pg.locator('.app').bounding_box()
            print('1280 with sheet: panel ends', round(sb['x'] + sb['width']), '| app', round(ab['x']), '..', round(ab['x'] + ab['width']), '| sheet starts', round(db['x']))
            await pg.screenshot(path=OUT + 'side_dock_1280.png')
            await pg.click('#dock-x')
        # phone width: hidden
        await pg.set_viewport_size({'width': 390, 'height': 844}); await pg.wait_for_timeout(100)
        print('phone panel visible', await pg.locator('#side').is_visible(), '| body padding-left', await pg.evaluate("getComputedStyle(document.body).paddingLeft"))
        await pg.set_viewport_size({'width': 1440, 'height': 900})
        # leaving the run removes it
        await pg.click('#quit'); await pg.click('#quit'); await pg.wait_for_timeout(150)
        print('after quit panel exists', await pg.locator('#side').count(), '| html class', await pg.evaluate("document.documentElement.className"))
        # infinite mix: panel follows the course of each question
        await pg.click('#gym'); await pg.click('#mix'); await pg.click('#go'); await pg.wait_for_timeout(200)
        seen = []
        for i in range(10):
            r = await pg.evaluate(READ); seen.append(r['code'])
            gen = await pg.locator('#sd-gen').is_visible()
            await pg.evaluate(ANSWER, i % 2 == 0); await pg.wait_for_timeout(150)
            while await pg.locator('.overlay .btn').count(): await pg.locator('.overlay .btn').first.click(); await pg.wait_for_timeout(80)
            await pg.click('.bar .btn.wide'); await pg.wait_for_timeout(120)
        print('mix panel courses', seen, '| session line', (await pg.evaluate(READ))['sess'])
        await pg.screenshot(path=OUT + 'side_mix.png')
        await pg.click('#quit'); await pg.click('#quit'); await pg.wait_for_timeout(200)
        await pg.click('#home'); await pg.click('[data-course="che102"]'); await pg.click('[data-act="mock"]'); await pg.click('#go'); await pg.wait_for_timeout(200)
        print('mock panel exists', await pg.locator('#side').count())
        print('errors', errs)
        await b.close()
try:
    asyncio.run(main())
finally:
    srv.terminate()
