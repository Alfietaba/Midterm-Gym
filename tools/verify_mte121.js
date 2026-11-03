// Compile and run every MTE 121 code question; compare with the stored answers.
const fs = require('fs'), path = require('path'), cp = require('child_process');
global.COURSES = [];
function dedent(s) {
  s = s.replace(/^\n+/, '').replace(/\s+$/, '');
  const lines = s.split('\n'); let min = Infinity;
  lines.forEach(l => { if (l.trim()) min = Math.min(min, l.match(/^ */)[0].length); });
  return lines.map(l => l.slice(min === Infinity ? 0 : min)).join('\n');
}
global.C = (s, ...v) => '\u0001' + dedent(String.raw(s, ...v)) + '\u0002';
global.K = (s, ...v) => '\u0003' + String.raw(s, ...v) + '\u0004';
global.dedent = dedent;
global.rawTag = (strs, args) => String.raw(strs, ...args);
global.mc = (id, t, q, opts, a, why, x) => ({ id, t, type: 'mc', q, opts, a, why, x: x || {} });
global.num = (id, t, q, ans, hint, why, labels, lp, x) => ({ id, t, type: 'num', q, ans, x: x || {} });
global.txt = (id, t, q, ans, hint, why, x) => ({ id, t, type: 'txt', q, ans, x: x || {} });
global.order = (id, t, q, steps, extra, why, x) => ({ id, t, type: 'order', q, steps, extra, x: x || {} });
global.multi = (id, t, q, parts, lp, x) => ({ id, t, type: 'multi', q, parts, x: x || {} });
eval(fs.readFileSync(process.argv[2], 'utf8'));
const course = COURSES[0];
const dir = fs.mkdtempSync(path.join(require('os').tmpdir(), 'mte-'));
const HDR = '#include <iostream>\n#include <string>\n#include <fstream>\n#include <cmath>\nusing namespace std;\n';
const norm = s => String(s).replace(/\s+/g, ' ').trim();
const strip = s => s.replace(/[\u0003\u0004]/g, '');
let pass = 0, fail = 0, skip = 0, vexPass = 0;
const MOCK = fs.readFileSync(path.join(__dirname, 'vex_mock.h'), 'utf8');
/* compile-only check of VEX snippets and of the correct order of every build-the-code puzzle */
function vexCheck(q) {
  let code;
  if (q.type === 'order') code = q.steps.join('\n');
  else { const mm = /\u0001([\s\S]*?)\u0002/.exec(q.q); if (!mm) { skip++; return; } code = mm[1]; }
  code = strip(code);
  const pre = (q.x.test && q.x.test.pre) || '';
  const isDef = /^\s*(void|int|bool|double)\s+\w+\s*\(/.test(code);
  const prog = MOCK + '\n' + (isDef ? pre + '\n' + code : 'void test_fn() {\n' + pre + '\n' + code + '\n}') + '\n';
  const src = path.join(dir, 'v_' + q.id.replace(/\W/g, '') + '.cpp');
  fs.writeFileSync(src, prog);
  let ok = true, msg = '';
  try { cp.execSync(`g++ -std=c++17 -fsyntax-only -w ${src}`, { stdio: 'pipe' }); } catch (e) { ok = false; msg = String(e.stderr).split('\n').slice(0, 4).join(' | '); }
  const wantErr = q.x.test && q.x.test.err;
  if (ok !== !wantErr) { fail++; console.log('FAIL vex/order', q.id, wantErr ? 'should not compile' : msg); }
  else { pass++; vexPass++; }
}
course.Q.forEach(q => {
  const all = [...q.q.matchAll(/\u0001([\s\S]*?)\u0002/g)], m = all.length ? all[all.length - 1] : null; /* the program is the last code block; earlier ones are file contents */
  const test = q.x.test;
  if (q.t === 'c5' || q.type === 'order') { vexCheck(q); return; }
  if (!m || (q.type !== 'txt' && !test)) { skip++; return; }
  let code = m[1];
  if (test && test.print) code += '\ncout << ' + test.print + ';';
  const prog = HDR + (/int main/.test(code) ? code : 'int main() {\n' + code + '\nreturn 0;\n}');
  const src = path.join(dir, q.id.replace(/\W/g, '') + '.cpp'), exe = src.replace('.cpp', '');
  fs.writeFileSync(src, prog);
  if (test && test.file) fs.writeFileSync(path.join(dir, 'numbers.txt'), test.file);
  let compiled = true;
  try { cp.execSync(`g++ -std=c++17 -w -o ${exe} ${src}`, { stdio: 'pipe' }); } catch (e) { compiled = false; }
  if (test && test.err) { if (!compiled) { pass++; } else { fail++; console.log('FAIL (should not compile)', q.id); } return; }
  if (!compiled) { fail++; console.log('FAIL compile', q.id); return; }
  const out = cp.execSync(exe, { cwd: dir, timeout: 3000 }).toString();
  let expect;
  if (q.type === 'txt') expect = q.ans;
  else if (q.type === 'num') expect = q.ans;
  else if (test.expect) expect = strip(q.opts[q.a]);
  else if ('out' in test) expect = test.out;
  if (norm(out) === norm(expect)) pass++;
  else { fail++; console.log('FAIL', q.id, 'got [' + out + '] expected [' + expect + ']'); }
});
console.log(`pass ${pass}, fail ${fail}, skipped ${skip}, total ${course.Q.length}`);

/* Write-the-code section: every model solution must compile and print exactly the expected output on
   every test (files written into a fresh folder, keyboard input piped in). VEX ones get a syntax check. */
let wPass = 0, wFail = 0;
(course.progs || []).forEach(pr => {
  if (pr.vex) {
    const body = pr.model.replace(/#include "vex.h"\n/, '').replace(/using namespace vex;\n/, '');
    const src = path.join(dir, 'w_' + pr.id + '.cpp');
    fs.writeFileSync(src, MOCK + '\n' + body + '\nvoid rotateRobot(int angle, int speed) {}\n');
    try { cp.execSync(`g++ -std=c++17 -fsyntax-only -w ${src}`, { stdio: 'pipe' }); wPass++; }
    catch (e) { wFail++; console.log('FAIL write-the-code', pr.id, String(e.stderr).split('\n').slice(0, 3).join(' | ')); }
    return;
  }
  const src = path.join(dir, 'w_' + pr.id + '.cpp'), exe = src.replace('.cpp', '');
  fs.writeFileSync(src, pr.model);
  try { cp.execSync(`g++ -std=c++17 -Wall -o ${exe} ${src}`, { stdio: 'pipe' }); }
  catch (e) { wFail++; console.log('FAIL write-the-code compile', pr.id); return; }
  pr.tests.forEach(t => {
    const run = fs.mkdtempSync(path.join(dir, 'run-'));
    (t.files || []).forEach(f => fs.writeFileSync(path.join(run, f[0]), f[1]));
    let out = '';
    try { out = cp.execSync(exe, { cwd: run, input: t.input || '', timeout: 3000 }).toString(); }
    catch (e) { out = String(e.stdout || ''); }   /* a missing-file test exits with status 1 on purpose */
    if (norm(out) === norm(t.out)) wPass++;
    else { wFail++; console.log('FAIL write-the-code', pr.id, t.name, 'got [' + out + '] expected [' + t.out + ']'); }
  });
});
console.log(`write-the-code: pass ${wPass}, fail ${wFail}`);
if (fail || wFail) process.exit(1);
