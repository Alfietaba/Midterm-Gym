"""Write-the-code section: list, editor, Claude marking (stubbed), self-mark fallback, persistence."""
import asyncio, pathlib, sys, json
from playwright.async_api import async_playwright
B = pathlib.Path(__file__).resolve().parents[1]; OUT = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else B / 'out' / 'shots'; OUT.mkdir(parents=True, exist_ok=True)
STUB = """
window.__prompts = [];
window.claude = { use: function (name) { if (name !== 'sample') return Promise.resolve(null);
  var f = function () { return Promise.reject({ code: 'invalid_request' }); };
  f.json = function (input) { window.__prompts.push(input); return new Promise(function (res) { setTimeout(function () { res({ compiles: true, compileNote: '', tests: [{ name: 'Sample file', pass: true, note: '' }, { name: 'Crowded file', pass: false, note: 'prints no warning' }], rubric: [{ item: 1, marks: 1, of: 1, note: 'includes fine' }, { item: 6, marks: 0, of: 1, note: 'uses >= instead of >' }], score: 8, fixes: ['Change numNear >= n / 2 to numNear > n / 2.0'], summary: 'Solid program, one boundary slip.' }); }, 300); }); };
  return Promise.resolve(f); } };
"""
async def main():
    errs = []
    async with async_playwright() as p:
        br = await p.chromium.launch()
        for name, stub in [('claude', True), ('self', False)]:
            for vpn, vp in [('desk', {'width': 1300, 'height': 900}), ('phone', {'width': 390, 'height': 844})]:
                ctx = await br.new_context(viewport=vp)
                if stub: await ctx.add_init_script(STUB)
                pg = await ctx.new_page(); pg.on('pageerror', lambda e: errs.append(str(e)))
                await pg.goto((B/'out/test.html').as_uri()); await pg.wait_for_timeout(300)
                await pg.evaluate("() => { const g = window.__gym; g.setCur(g.COURSES.find(c => c.id === 'mte121')); g.showHome(); }")
                await pg.wait_for_timeout(200)
                assert await pg.locator('[data-act="code"]').count() == 1
                if vpn == 'desk' and name == 'claude':
                    await pg.locator('[data-act="code"]').scroll_into_view_if_needed(); await pg.screenshot(path=str(OUT/f'cw-home-{vpn}.png'))
                await pg.click('[data-act="code"]'); await pg.wait_for_timeout(200)
                n = await pg.locator('.cw-item').count(); assert n == 4, n
                await pg.screenshot(path=str(OUT/f'cw-list-{name}-{vpn}.png'))
                await pg.click('.cw-item[data-p="w1"]'); await pg.wait_for_timeout(300)
                ed = pg.locator('#cw-ed'); await ed.click()
                await pg.keyboard.press('Control+End')
                await pg.evaluate("() => { const e = document.getElementById('cw-ed'); e.focus(); e.setSelectionRange(e.value.indexOf('int main'), e.value.indexOf('int main')); }")
                await pg.keyboard.type('void f()')
                await pg.keyboard.press('Enter'); await pg.keyboard.type('{'); await pg.keyboard.press('Enter'); await pg.keyboard.type('int x = 0;'); await pg.keyboard.press('Enter'); await pg.keyboard.type('}'); await pg.keyboard.press('Enter'); await pg.keyboard.press('Enter')
                val = await ed.input_value()
                assert '{\n    int x = 0;\n}\n' in val, repr(val[:200])
                await pg.wait_for_timeout(600)
                await pg.click('#cw-check'); await pg.wait_for_timeout(1500)
                if stub:
                    assert await pg.locator('.cw-big').count() == 1
                    txt = await pg.locator('.cw-big').inner_text(); assert txt.startswith('8'), txt
                    pr = await pg.evaluate('() => window.__prompts[0]')
                    assert 'readings.txt' in pr and 'STUDENT PROGRAM' in pr and 'void f()' in pr and 'Warning: crowded' in pr
                else:
                    assert await pg.locator('.cw-self input').count() == 6
                    boxes = pg.locator('.cw-self input')
                    for i in range(3): await boxes.nth(i).check()
                    await pg.click('#cw-save'); await pg.wait_for_timeout(200)
                    assert '4/10' in await pg.locator('#cw-selfres').inner_text()
                await pg.screenshot(path=str(OUT/f'cw-prob-{name}-{vpn}.png'), full_page=True)
                await pg.click('#cw-model'); await pg.wait_for_timeout(100)
                assert await pg.locator('#cw-modelbox .cw-code').count() == 1
                await pg.click('#cw-back'); await pg.wait_for_timeout(200)
                st = await pg.locator('.cw-item[data-p="w1"] .cw-score').inner_text()
                print(name, vpn, 'list status after:', st)
                await pg.reload(); await pg.wait_for_timeout(300)
                await pg.evaluate("() => { const g = window.__gym; g.setCur(g.COURSES.find(c => c.id === 'mte121')); g.showHome(); }")
                await pg.click('[data-act="code"]'); await pg.click('.cw-item[data-p="w1"]'); await pg.wait_for_timeout(200)
                assert 'void f()' in await pg.locator('#cw-ed').input_value(), 'draft lost'
                await ctx.close()
        await br.close()
    print('errors', errs); sys.exit(1 if errs else 0)
asyncio.run(main())
