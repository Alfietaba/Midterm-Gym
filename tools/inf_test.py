import asyncio, subprocess, sys
from playwright.async_api import async_playwright
import os, pathlib as _pl
ROOT = str(_pl.Path(__file__).resolve().parents[1])  # repo root, served over http
OUT = ROOT + '/out/shots/'; os.makedirs(OUT, exist_ok=True)
srv = subprocess.Popen([sys.executable, '-m', 'http.server', '8768', '--bind', '127.0.0.1'], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

async def answer(pg, wrong=False):
    """answer the current question: first option for mc, give up otherwise (or when wrong=True)"""
    if await pg.locator('.qcard .opt').count() and not wrong:
        await pg.locator('.qcard .opt').first.click()
    elif await pg.locator('.bar .link:visible').count():
        await pg.click('.bar .link')
    else:
        # mc with wrong=True: pick an option that is not the answer is unknown; just pick last
        await pg.locator('.qcard .opt').last.click()
    await pg.wait_for_timeout(30)
    while await pg.locator('.overlay .btn').count():
        await pg.locator('.overlay .btn').first.click(); await pg.wait_for_timeout(40)

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={'width': 390, 'height': 844})
        await ctx.add_init_script("if (!sessionStorage.getItem('seeded')) { localStorage.clear(); sessionStorage.setItem('seeded', '1'); }")
        pg = await ctx.new_page()
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('console', lambda m: (None if 'Failed to load resource' in m.text else errs.append('console: ' + m.text)) if m.type == 'error' else None)
        await pg.goto('http://127.0.0.1:8768/docs/index.html')
        await pg.wait_for_timeout(400)
        await pg.screenshot(path=OUT + 'inf_gym.png', full_page=True)

        # ---- infinite mix, endless
        await pg.click('#mix')
        await pg.wait_for_timeout(100)
        chips = await pg.locator('[data-sel]').count()
        on = await pg.locator('[data-sel][aria-pressed="true"]').count()
        print('mix intro chips', chips, 'on', on, '| go label:', await pg.inner_text('#go'))
        await pg.screenshot(path=OUT + 'inf_intro_mix.png', full_page=True)
        await pg.click('#go')
        courses, fs_seen, fs_opened, kinds, dock_log = {}, 0, 0, {}, []
        for i in range(60):
            code = await pg.locator('.qcard .tag.crs').first.inner_text()
            courses[code] = courses.get(code, 0) + 1
            if await pg.locator('#fs').count():
                fs_seen += 1
                if not fs_opened and i > 1:
                    await pg.click('#fs'); await pg.wait_for_timeout(300)
                    fs_opened = await pg.locator('#dock').count()
                    await pg.screenshot(path=OUT + 'inf_dock.png')
                dock_log.append(('F' if await pg.locator('#dock').count() else '-'))
            else:
                dock_log.append('n' + str(await pg.locator('#dock').count()))
            if i == 40 and await pg.locator('#dock-x').count():
                await pg.click('#dock-x')
            tags = await pg.locator('.qcard .qmeta').inner_text()
            if 'Second chance' in tags: kinds['retry'] = kinds.get('retry', 0) + 1
            if 'new numbers' in tags: kinds['fresh'] = kinds.get('fresh', 0) + 1
            if i == 3: await pg.screenshot(path=OUT + 'inf_q.png')
            await answer(pg)
            if i == 3: await pg.screenshot(path=OUT + 'inf_q_after.png')
            await pg.click('.bar .btn.wide')
            await pg.wait_for_timeout(20)
        print('dock per question (F open, - closed, n0 = course without sheet):', ''.join(x[0] if x != 'n0' else '.' for x in dock_log))
        print('mix courses seen', courses, '| formula button on', fs_seen, 'of 60, opened', fs_opened, '| requeues', kinds)
        hud = await pg.locator('.hud').inner_text()
        print('hud:', hud.replace('\n', ' '))
        await pg.click('#quit'); await pg.click('#quit')
        await pg.wait_for_timeout(200)
        print('summary:', (await pg.locator('.sum-top').inner_text()).replace('\n', ' '))
        print('breakdown rows', await pg.locator('.brow').count(), '| misses', await pg.locator('[data-rv]').count())
        await pg.locator('[data-rv]').first.click()
        print('review card renders', await pg.locator('.rv .qcard').count())
        await pg.screenshot(path=OUT + 'inf_summary.png', full_page=True)
        await pg.click('#home')
        await pg.wait_for_timeout(100)
        print('gym mix button:', (await pg.inner_text('#mix')).replace('\n', ' '))

        # ---- course infinite, 3 lives, lose all lives
        await pg.click('[data-course="che102"]')
        await pg.click('[data-act="inf"]')
        topics = await pg.locator('[data-sel]').count()
        on = await pg.locator('[data-sel][aria-pressed="true"]').count()
        await pg.click('[data-mode="1"]')
        print('che intro topics', topics, 'on by default', on, '| go:', (await pg.inner_text('#go')).replace('\n', ' '))
        await pg.screenshot(path=OUT + 'inf_intro_che.png', full_page=True)
        await pg.click('#go')
        n = 0
        while n < 40:
            n += 1
            if await pg.locator('.sum-top').count(): break
            await answer(pg, wrong=True)
            label = await pg.inner_text('.bar .btn.wide')
            hearts = await pg.locator('.hearts .heart.on').count()
            if label == 'See results':
                await pg.screenshot(path=OUT + 'inf_lives_out.png')
            await pg.click('.bar .btn.wide')
            await pg.wait_for_timeout(20)
        print('lives run ended after', n - 1, 'questions |', (await pg.locator('.sum-top').inner_text()).replace('\n', ' '))
        await pg.click('#again')
        print('go again starts:', await pg.locator('.hud .hearts').count() == 1)
        await pg.click('#quit')  # 0 answered: ends right away
        await pg.wait_for_timeout(100)
        print('quit with 0 answered goes home:', await pg.locator('[data-act="inf"]').count() == 1)

        # ---- keyboard in a smart run (math 115)
        await pg.click('#gym')
        await pg.click('[data-course="math115"]')
        await pg.click('[data-act="smart"]')
        did = []
        for i in range(10):
            if await pg.locator('.qcard .opt').count():
                await pg.keyboard.press('2'); did.append('mc')
            elif await pg.locator('.qcard input.cell').count():
                await pg.locator('.qcard input.cell').first.focus()
                for inp in await pg.locator('.qcard input.cell').all():
                    await inp.fill('1')
                await pg.locator('.qcard input.cell').last.press('Enter'); did.append('num')
            else:
                await pg.click('.bar .link'); did.append('tiles')
            await pg.wait_for_timeout(30)
            while await pg.locator('.overlay .btn').count():
                await pg.locator('.overlay .btn').first.click(); await pg.wait_for_timeout(40)
            await pg.keyboard.press('Enter')
            await pg.wait_for_timeout(40)
            if await pg.locator('.sum-top').count(): break
        print('keyboard run:', did, '| finished:', await pg.locator('.sum-top').count() == 1 or await pg.locator('.hud').count() == 1)
        # F opens the sheet mid-run
        if await pg.locator('.hud').count():
            await pg.locator('body').click(position={'x': 5, 'y': 400})
            await pg.keyboard.press('f'); await pg.wait_for_timeout(250)
            print('F key opens docked sheet:', await pg.locator('#dock').count() == 1)
            await pg.keyboard.press('Escape'); await pg.wait_for_timeout(50)
            print('Escape closes it:', await pg.locator('#dock').count() == 0)
        # ---- wide screen: side panel next to the question
        await pg.set_viewport_size({'width': 1280, 'height': 800})
        await pg.click('#quit'); await pg.click('#quit'); await pg.wait_for_timeout(150)
        if await pg.locator('#home').count(): await pg.click('#home')
        await pg.click('[data-act="inf"]'); await pg.click('#go'); await pg.wait_for_timeout(100)
        await pg.click('#fs'); await pg.wait_for_timeout(300)
        box = await pg.locator('#dock').bounding_box(); appbox = await pg.locator('.app').bounding_box()
        print('wide dock box', box, '| app right edge', appbox['x'] + appbox['width'])
        await pg.screenshot(path=OUT + 'inf_dock_wide.png')
        await pg.set_viewport_size({'width': 390, 'height': 844})
        print('errors:', errs)
        await b.close()
try:
    asyncio.run(main())
finally:
    srv.terminate()
