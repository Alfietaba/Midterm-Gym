// Self-consistency: every stored answer must grade as correct with the app's own grader.
const fs = require('fs');
const html = fs.readFileSync('docs/index.html', 'utf8');
let js = html.match(/<script>([\s\S]*)<\/script>/)[1];
js = js.replace(/var reduced = window\.matchMedia[\s\S]*$/, '');      // cut before sound/DOM code
js = js.replace("(function () {\n'use strict';", '');
global.localStorage = { getItem: () => null, setItem: () => {} };
global.window = {}; global.document = {};
eval(js + `
let bad = 0, n = 0;
COURSES.forEach(c => {
  CUR = c;
  const ids = {};
  c.Q.forEach(q => {
    n++;
    if (ids[q.id]) { bad++; console.log('DUP id', q.id); } ids[q.id] = 1;
    if (!c.TBY[q.t]) { bad++; console.log('bad topic', q.id); }
    try {
      if (q.type === 'mc') { if (!(q.a >= 0 && q.a < q.opts.length)) throw 'answer index'; fmt(q.q); q.opts.forEach(fmt); fmt(q.why); }
      else if (q.type === 'txt') { const r = gradeQ(q, [].concat(q.ans)[0]); if (!r.ok) throw 'txt self-grade'; }
      else if (q.type === 'proof' || q.type === 'order') { const r = gradeQ(q, { built: q.steps.map((_, i) => i) }); if (!r.ok) throw 'order self-grade'; (q.alt||[]).forEach(a => { if (!gradeQ(q, {built:a}).ok) throw 'alt'; if (a.length !== q.steps.length) throw 'alt len'; }); }
      else {
        const parts = partsOf(q);
        const resp = parts.map(p => {
          if (p.kind === 'expr' || normLim(p.ans) in LIMV) return [p.ans];
          const S = structOf(p.ans); return [].concat.apply([], S.rows);
        });
        const r = gradeQ(q, resp);
        if (!r.ok) throw 'num self-grade ' + JSON.stringify(r.parts) + ' ' + parts.map(p=>p.ans+'/sf'+p.sf).join(',');
        parts.forEach(p => { if (p.sf && sigFigs(p.ans) !== p.sf) throw 'sf mismatch ' + p.ans; fmt(p.ask); fmt(p.why); fmt(p.hint); });
      }
    } catch (e) { bad++; console.log('FAIL', c.code, q.id, e); }
  });
  if (c.id === 'che102') c.Q.forEach(q => { const all = [q.q, q.why, q.hint].concat(q.opts || [], ...(q.parts || []).map(p => [p.ask, p.why, p.hint])).join(' '); if (all.indexOf('$') >= 0) { bad++; console.log('stray $', q.id); } });
  console.log(c.code, c.Q.length, 'questions;', c.topics.map(t => t.id + ':' + c.Q.filter(q => q.t === t.id).length).join(' '));
  // mock feasibility
  c.mock.sections.forEach(s => { const k = s.lps ? s.lps.filter(lp => c.Q.some(q => q.lp === lp)).length : c.Q.filter(s.pick).length; const need = s.lps ? s.lps.length : s.n; if (k < need) { bad++; console.log('MOCK short', c.code, s.label, k, need); } else console.log('  mock', s.label, 'pool', k, 'need', need); });
});
// parser spot checks
const T = [['1.0E4',10000],['50.E5',5e6],['8sqrt(2)',8*Math.SQRT2],['5pi/6',5*Math.PI/6],['e^3',Math.exp(3)],['-x^2+1',-3,2],['ln(2)',Math.log(2)],['pi/2+1/2',Math.PI/2+0.5],['2(3+1)',8],['(x+3)/(1-2x)',-5/3,2],['sqrt(16.0)',4],['−1/2',-0.5]];
T.forEach(t => { const v = evalExpr(t[0], t[2]); if (Math.abs(v - t[1]) > 1e-9) { bad++; console.log('PARSE', t[0], v, t[1]); } });
[['3.01E23',3],['1.0E4',2],['150.',3],['150',2],['0.0500',3],['0.455',3],['21',2],['20.0',3]].forEach(t => { if (sigFigs(t[0]) !== t[1]) { bad++; console.log('SF', t[0], sigFigs(t[0]), t[1]); } });
console.log('checked', n, 'questions,', bad, 'problems');
if (bad) process.exit(1);
`);
