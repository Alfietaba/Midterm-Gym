import asyncio, subprocess, sys, json, datetime
from playwright.async_api import async_playwright
import os, pathlib as _pl
ROOT = str(_pl.Path(__file__).resolve().parents[1])  # repo root, served over http
srv = subprocess.Popen([sys.executable, '-m', 'http.server', '8767', '--bind', '127.0.0.1'], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
yday = (datetime.date.today() - datetime.timedelta(days=1)).isoformat()
OLD = {'xp': 250, 'q': {'t1-1': {'b': 3, 'due': 0, 'seen': 2, 'ok': 2}, 't2-1': {'b': 1, 'due': 0, 'seen': 1, 'ok': 0}}, 'streak': 3, 'last': yday,
       'today': {'d': yday, 'n': 12, 'hit': False}, 'snd': False, 'hap': True}

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={'width': 390, 'height': 844})
        await ctx.add_init_script("if (!sessionStorage.getItem('seeded')) { localStorage.clear(); localStorage.setItem('math115-midterm-gym-v1', JSON.stringify(%s)); sessionStorage.setItem('seeded', '1'); }" % json.dumps(OLD))
        pg = await ctx.new_page()
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto('http://127.0.0.1:8767/docs/index.html')
        await pg.wait_for_timeout(400)
        card = await pg.locator('[data-course="math115"]').inner_text()
        streak = await pg.locator('.stats .stat').nth(1).inner_text()
        snd = await pg.locator('[data-tgl="snd"]').get_attribute('aria-pressed')
        print('MATH 115 card after migration:', card.replace('\n', ' | '))
        print('streak tile:', streak.replace('\n', ' '), '| sound toggle:', snd)
        for cid in ['math115', 'mte121', 'che102', 'math116', 'mte100']:
            await pg.click(f'[data-course="{cid}"]')
            await pg.click('[data-act="smart"]')
            n = 0
            while n < 30:
                n += 1
                if await pg.locator('.sum-top').count():
                    break
                if await pg.locator('.opt').count():
                    await pg.locator('.opt').first.click()
                else:
                    await pg.click('.bar .link')
                await pg.wait_for_timeout(60)
                ov = pg.locator('.overlay .btn')
                if await ov.count():
                    await ov.first.click()
                await pg.click('.bar .btn.wide')
                await pg.wait_for_timeout(40)
                ov = pg.locator('.overlay .btn')
                if await ov.count():
                    await ov.first.click()
            score = await pg.locator('.sum-top').inner_text()
            # open a review
            await pg.locator('[data-rv]').first.click()
            rv_ok = await pg.locator('.rv .qcard').count()
            print(cid, 'run steps', n, '|', score.replace('\n', ' '), '| review cards', rv_ok)
            await pg.click('#home')
            # mock exam
            await pg.click('[data-act="mock"]')
            await pg.click('#go')
            pills = await pg.locator('.pill').count()
            # answer the first question if mc
            if await pg.locator('.opt').count():
                await pg.locator('.opt').first.click()
            await pg.locator('.pill').nth(pills - 1).click()
            await pg.click('.bar .btn.wide')
            await pg.click('#sub')
            await pg.wait_for_timeout(200)
            ov = pg.locator('.overlay .btn')
            while await ov.count():
                await ov.first.click(); await pg.wait_for_timeout(100)
            res = await pg.locator('.sum-top').inner_text()
            await pg.locator('[data-rv]').first.click()
            print('   mock', pills, 'questions |', res.replace('\n', ' '))
            await pg.click('#home')
            await pg.click('#gym')
        store = await pg.evaluate("() => Object.keys(localStorage).map(k => k + ':' + localStorage.getItem(k).length)")
        print('storage keys:', store)
        m115 = await pg.evaluate("() => JSON.parse(localStorage.getItem('math115-midterm-gym-v1'))")
        print('math115 xp now', m115['xp'], 'questions seen', len(m115['q']), 't1-1 kept:', 't1-1' in m115['q'])
        await pg.reload(); await pg.wait_for_timeout(300)
        print('after reload card:', (await pg.locator('[data-course="math115"]').inner_text()).replace('\n', ' | '))
        print('errors:', errs)
        await b.close()
try:
    asyncio.run(main())
finally:
    srv.terminate()
