"""Regenerate the README screenshots in docs/screenshots/.

Seeds a little demo progress so the topic maps are not all grey, then drives the real app.
Usage: python3 build/build.py && python3 tools/screenshots.py
"""
import asyncio, json, pathlib, re, datetime
from playwright.async_api import async_playwright

ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs' / 'screenshots'
OUT.mkdir(parents=True, exist_ok=True)


def demo_progress(course_file, pattern, plan):
    """plan maps topic id -> list of boxes to hand out (0 = unseen, 1 = missed, 2-4 = learning, 5 = mastered)"""
    ids = re.findall(r"(?m)^\s*\w+\('(" + pattern + r")',\s*'(\w+)'", (ROOT / 'data' / course_file).read_text())
    q, seen = {}, {}
    for qid, t in ids:
        boxes = plan.get(t, [])
        k = seen.get(t, 0); seen[t] = k + 1
        if k < len(boxes) and boxes[k]:
            b = boxes[k]
            q[qid] = {'b': b, 'due': 0, 'seen': b, 'ok': max(0, b - 1)}
    return q


today = datetime.date.today().isoformat()
m115 = demo_progress('math115.js', r't\d+-\d+', {
    't1': [5, 5, 5, 4, 5, 4, 3], 't2': [5, 4, 5, 5, 3, 4, 2, 4], 't3': [4, 5, 3, 4, 2, 3], 't4': [4, 3, 1, 4, 2, 3, 2],
    't5': [3, 2, 4, 1, 3], 't6': [3, 2, 2, 1, 3], 't7': [2, 1, 2], 't8': [2, 1], 't9': [1], 't10': []})
SEED = {
    'midterm-gym-global-v1': {'streak': 6, 'last': today, 'today': {'d': today, 'n': 14, 'hit': False}, 'snd': False, 'hap': False},
    'math115-midterm-gym-v1': {'xp': 1180, 'q': m115},
}
INIT = 'try { ' + ' '.join(f'localStorage.setItem({json.dumps(k)}, {json.dumps(json.dumps(v))});' for k, v in SEED.items()) + ' } catch (e) {}'


async def open_course(pg, cid):
    await pg.evaluate("cid => { const g = window.__gym; g.setCur(g.COURSES.find(c => c.id === cid)); g.showHome(); }", cid)
    await pg.wait_for_timeout(500)


async def first_mc(pg):
    """advance a practice run until a multiple-choice question is on screen"""
    for _ in range(12):
        if await pg.locator('.qcard .opt').count():
            return
        await pg.click('.bar .link'); await pg.wait_for_timeout(150)
        await pg.click('.bar .btn'); await pg.wait_for_timeout(300)


async def answer_right(pg):
    await pg.evaluate("""() => { const card = document.querySelector('.qcard'), q = card._q;
        [...card.querySelectorAll('.opt')].find(b => b._i === q.a).click(); }""")
    await pg.wait_for_timeout(900)


async def main():
    async with async_playwright() as p:
        br = await p.chromium.launch()
        url = (ROOT / 'out' / 'test.html').as_uri()

        ctx = await br.new_context(viewport={'width': 1280, 'height': 860}, device_scale_factor=1.5)
        await ctx.add_init_script(INIT)
        pg = await ctx.new_page()
        await pg.goto(url); await pg.wait_for_timeout(700)
        await pg.screenshot(path=str(OUT / 'home.png'))
        await open_course(pg, 'math115')
        await pg.evaluate("() => document.querySelector('.map').scrollIntoView({block: 'center'})"); await pg.wait_for_timeout(200)
        await pg.screenshot(path=str(OUT / 'course.png'))
        await ctx.close()

        ctx = await br.new_context(viewport={'width': 1440, 'height': 900}, device_scale_factor=1.5)
        await ctx.add_init_script(INIT)
        pg = await ctx.new_page()
        await pg.goto(url); await pg.wait_for_timeout(500)
        await open_course(pg, 'math115')
        await pg.click('[data-act="smart"]'); await pg.wait_for_timeout(500)
        await first_mc(pg)
        await pg.click('#fs'); await pg.wait_for_timeout(400)
        await answer_right(pg)
        await pg.screenshot(path=str(OUT / 'practice.png'))
        await ctx.close()

        ctx = await br.new_context(viewport={'width': 1280, 'height': 900}, device_scale_factor=1.5)
        await ctx.add_init_script(INIT)
        pg = await ctx.new_page()
        await pg.goto(url); await pg.wait_for_timeout(500)
        await open_course(pg, 'mte121')
        await pg.click('[data-act="code"]'); await pg.click('.cw-item[data-p="w1"]'); await pg.wait_for_timeout(400)
        model = await pg.evaluate("() => window.__gym.COURSES.find(c => c.id === 'mte121').progs[0].model")
        draft = model.split('int main()')[0] + 'int main()\n{\n    ifstream fin("readings.txt");\n    \n    return 0;\n}\n'
        await pg.fill('#cw-ed', draft)
        await pg.evaluate("() => document.getElementById('cw-ed').scrollIntoView({block: 'center'})"); await pg.wait_for_timeout(200)
        await pg.screenshot(path=str(OUT / 'write-the-code.png'))
        await ctx.close()

        ctx = await br.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
        await ctx.add_init_script(INIT)
        pg = await ctx.new_page()
        await pg.goto(url); await pg.wait_for_timeout(500)
        await open_course(pg, 'che102')
        await pg.click('[data-act="smart"]'); await pg.wait_for_timeout(500)
        await first_mc(pg)
        await answer_right(pg)
        await pg.screenshot(path=str(OUT / 'phone.png'))
        await ctx.close()
        await br.close()
    print('wrote', sorted(x.name for x in OUT.glob('*.png')))


asyncio.run(main())
