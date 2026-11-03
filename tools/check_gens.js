const fs = require('fs');
const html = fs.readFileSync('docs/index.html', 'utf8');
let js = html.match(/<script>([\s\S]*)<\/script>/)[1];
js = js.replace(/var reduced = window\.matchMedia[\s\S]*$/, '').replace("(function () {\n'use strict';", '');
global.localStorage = { getItem: () => null, setItem: () => {} }; global.window = {}; global.document = {};
eval(js + `
let bad = 0, total = 0;
const N = +process.argv[2] || 300;
COURSES.forEach(c => {
  CUR = c;
  (c.gens || []).forEach((g, gi) => {
    const seen = new Set();
    for (let s = 1; s <= N; s++) {
      total++;
      let q;
      try {
        q = g.make(Rand(s * 7919 + gi * 104729));
        if (!c.TBY[q.t]) throw 'bad topic ' + q.t;
        fmt(q.q); seen.add(q.q.replace(/g~[a-z0-9]+~\\d+/ig, ''));
        if (q.type === 'mc') {
          if (!(q.a >= 0 && q.a < q.opts.length)) throw 'answer index';
          if (q.opts.length < 2) throw 'too few options';
          if (new Set(q.opts).size !== q.opts.length) throw 'dup options';
          q.opts.forEach(fmt); fmt(q.why);
        } else if (q.type === 'txt') { if (!gradeQ(q, [].concat(q.ans)[0]).ok) throw 'txt'; }
        else {
          const parts = partsOf(q);
          const resp = parts.map(p => (p.kind === 'expr' || normLim(p.ans) in LIMV) ? [p.ans] : [].concat.apply([], structOf(p.ans).rows));
          parts.forEach(p => { if (p.sf && sigFigs(p.ans) !== p.sf) throw 'sf ' + p.ans + ' vs ' + p.sf; fmt(p.ask); fmt(p.why); fmt(p.hint); });
          const r = gradeQ(q, resp);
          if (!r.ok) throw 'self-grade ' + JSON.stringify(r.parts) + ' ' + parts.map(p => p.ans).join('|');
          parts.forEach(p => { if (p.kind !== 'expr' && !(normLim(p.ans) in LIMV)) [].concat.apply([], structOf(p.ans).rows).forEach(v => { const x = evalExpr(v); if (!isFinite(x)) throw 'nonfinite ' + v; }); });
        }
        if (/NaN|undefined|Infinity/.test(JSON.stringify(q))) throw 'NaN/undefined in text';
      } catch (e) { bad++; if (bad < 40) console.log('FAIL', c.code, gi, q && q.id, String(e).slice(0, 200), q ? String(q.q).slice(0, 160) : ''); }
    }
    console.log(c.code, 'gen', gi, (q => q)(g.t), 'distinct', seen.size, '/', N);
  });
});
console.log('generated', total, 'problems', bad);
if (bad) process.exit(1);
`);
