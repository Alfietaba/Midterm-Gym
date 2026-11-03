"""Build the single-file app.

Reads build/template.html and fills its three slots with the helpers, the course data and the app code.
Writes docs/index.html (the published page) and out/test.html (the same page with a hook the tests use).

Usage: python3 build/build.py
"""
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
COURSES = ['math115', 'mte121', 'che102', 'math116', 'mte100']   # order of the cards on the home screen


def read(rel):
    return (ROOT / rel).read_text(encoding='utf-8')


def main():
    data = '\n'.join(read(f'data/{c}.js') for c in COURSES) + '\n' + read('build/gens.js')
    page = (read('build/template.html')
            .replace('/*@HELPERS@*/', read('build/helpers.js'))
            .replace('/*@DATA@*/', data)
            .replace('/*@APP@*/', read('build/app.js')))
    head = ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
            '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
            '<meta name="description" content="Midterm Gym: a learning-first study app for first-year engineering midterms. '
            'Spaced repetition, exam-style mocks, fresh generated questions and explanations for every answer.">\n'
            '<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 32 32%22%3E'
            '%3Crect width=%2232%22 height=%2232%22 rx=%228%22 fill=%22%232f5bea%22/%3E%3Cpath d=%22M8 16h16M6 12v8M26 12v8M10 10v12M22 10v12%22 '
            'stroke=%22white%22 stroke-width=%222.6%22 stroke-linecap=%22round%22/%3E%3C/svg%3E">\n'
            '</head>\n<body>\n')
    (ROOT / 'docs').mkdir(exist_ok=True)
    (ROOT / 'docs/index.html').write_text(head + page + '\n</body>\n</html>\n', encoding='utf-8')

    # test build: exposes a few internals on window.__gym so the browser tests can drive the app
    hook = ("window.__gym = { COURSES: COURSES, qCard: qCard, setCur: function (c) { CUR = c; }, showHome: showHome, "
            "showFormula: showFormula, gradeQ: gradeQ, partsOf: partsOf, structOf: structOf, G: function () { return G; }, "
            "candleTick: candleTick };\nshowGym();")
    test = page.replace('\nshowGym();\n', '\n' + hook + '\n')
    assert test != page, 'could not find the start-up call to hook into'
    shell = ('<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1">'
             '</head><body>\n')
    (ROOT / 'out').mkdir(exist_ok=True)
    (ROOT / 'out/test.html').write_text(shell + test + '</body></html>', encoding='utf-8')
    print(f'wrote docs/index.html ({len(page) // 1024} KB) and out/test.html')


if __name__ == '__main__':
    main()
