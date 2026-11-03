/* ============================================================
   APP
   ============================================================ */
var PRAISE = ['Correct.', 'Nailed it.', 'Clean.', 'Exactly.', 'Yes.', 'That is it.'];
COURSES.forEach(function (c) {
  c.QBY = {};
  c.Q.forEach(function (q) { c.QBY[q.id] = q; });
  c.TBY = {};
  c.topics.forEach(function (t) { c.TBY[t.id] = t; });
});
var CBY = {};
COURSES.forEach(function (c) { CBY[c.id] = c; });
var CUR = null;

/* ---------- answer parsing ---------- */
var NAMES = ['arcsin', 'arccos', 'arctan', 'asin', 'acos', 'atan', 'sinh', 'cosh', 'tanh', 'sqrt', 'sin', 'cos', 'tan', 'sec', 'csc', 'cot', 'abs', 'exp', 'log', 'ln', 'pi', 'π', 'x', 'e'];
var FN = {
  arcsin: Math.asin, asin: Math.asin, arccos: Math.acos, acos: Math.acos, arctan: Math.atan, atan: Math.atan,
  sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh, sqrt: Math.sqrt, sin: Math.sin, cos: Math.cos, tan: Math.tan,
  sec: function (v) { return 1 / Math.cos(v); }, csc: function (v) { return 1 / Math.sin(v); }, cot: function (v) { return 1 / Math.tan(v); },
  abs: Math.abs, exp: Math.exp, log: Math.log, ln: Math.log
};
function evalExpr(raw, xv) {
  var s = String(raw).replace(/\s+/g, '').replace(/[−–]/g, '-').replace(/√/g, 'sqrt').replace(/[×·]/g, '*').toLowerCase();
  if (!s) throw new Error('empty');
  var i = 0;
  function peek() { return s.charAt(i); }
  function name() { for (var k = 0; k < NAMES.length; k++) if (s.substr(i, NAMES[k].length) === NAMES[k]) return NAMES[k]; return null; }
  function startsFactor() { var c = peek(); return c === '(' || c === '|' || /[a-zπ]/.test(c) || /[0-9.]/.test(c); }
  function expr() { var v = term(); while (peek() === '+' || peek() === '-') { var o = s.charAt(i++); var r = term(); v = o === '+' ? v + r : v - r; } return v; }
  function term() {
    var v = unary();
    for (;;) {
      var c = peek();
      if (c === '*' || c === '/') { i++; var r = unary(); v = c === '*' ? v * r : v / r; }
      else if (startsFactor() && c !== '|') { v = v * power(); }
      else break;
    }
    return v;
  }
  function unary() { if (peek() === '-') { i++; return -unary(); } if (peek() === '+') { i++; return unary(); } return power(); }
  function power() { var b = atom(); if (peek() === '^') { i++; return Math.pow(b, unary()); } return b; }
  function atom() {
    var c = peek();
    if (c === '(') { i++; var w = expr(); if (s.charAt(i++) !== ')') throw new Error('paren'); return w; }
    if (c === '|') { i++; var a = expr(); if (s.charAt(i++) !== '|') throw new Error('bar'); return Math.abs(a); }
    var m = /^(\d+\.?\d*|\.\d+)(e[+-]?\d+)?/.exec(s.slice(i));
    if (m) { i += m[0].length; return parseFloat(m[0]); }
    var n = name();
    if (!n) throw new Error('num');
    i += n.length;
    if (n === 'pi' || n === 'π') return Math.PI;
    if (n === 'e') return Math.E;
    if (n === 'x') { if (xv == null) throw new Error('var'); return xv; }
    var f = FN[n];
    var arg;
    if (peek() === '(') { i++; arg = expr(); if (s.charAt(i++) !== ')') throw new Error('paren'); }
    else arg = power();
    return f(arg);
  }
  var out = expr();
  if (i !== s.length || isNaN(out)) throw new Error('trail');
  return out;
}
function splitTop(s) {
  var out = [], d = 0, cur = '';
  for (var k = 0; k < s.length; k++) {
    var c = s.charAt(k);
    if (c === '(') d++; if (c === ')') d--;
    if (c === ',' && d === 0) { out.push(cur.trim()); cur = ''; } else cur += c;
  }
  out.push(cur.trim());
  return out;
}
function structOf(ans) {
  var s = String(ans).trim();
  if (s.indexOf(';') >= 0) return { kind: 'm', rows: s.split(';').map(splitTop) };
  if (s.charAt(0) === '(' && s.charAt(s.length - 1) === ')') {
    var d = 0, wraps = true;
    for (var k = 0; k < s.length - 1; k++) { if (s.charAt(k) === '(') d++; if (s.charAt(k) === ')') d--; if (d === 0) { wraps = false; break; } }
    if (wraps && splitTop(s.slice(1, -1)).length > 1) return { kind: 'v', rows: splitTop(s.slice(1, -1)).map(function (c) { return [c]; }) };
  }
  return { kind: 's', rows: [[s]] };
}
function partsOf(q) {
  if (q.type === 'num') return [{ ask: null, ans: q.ans, labels: q.labels, hint: q.hint, why: q.why, tol: q.tol, sf: q.sf, unit: q.unit, kind: q.kind, pts: q.pts, lim: q.lim }];
  return q.parts;
}
function sigFigs(str) {
  var s = String(str).trim().replace(/^[+−-]/, '');
  var m = /^(\d*)(\.?)(\d*)(?:[eE][+-]?\d+)?$/.exec(s);
  if (!m || (!m[1] && !m[3])) return -1;
  var digits = (m[1] + m[3]).replace(/^0+/, '');
  if (!m[2]) digits = digits.replace(/0+$/, '');
  return Math.max(digits.length, 1);
}
var LIMV = { inf: Infinity, '+inf': Infinity, infinity: Infinity, '∞': Infinity, '+∞': Infinity, '-inf': -Infinity, '-infinity': -Infinity, '-∞': -Infinity, dne: 'dne', 'doesnotexist': 'dne' };
function normLim(v) { return String(v).toLowerCase().replace(/\s+/g, '').replace(/[−–]/g, '-'); }
/* returns 1 (right), 0.5 (right value, wrong sig figs) or 0 */
function gradePart(p, raw) {
  if (!raw || !raw.length) return 0;
  var tol = p.tol || (CUR && CUR.tol) || 5e-4;
  if (p.kind === 'expr') {
    var good = 0;
    for (var k = 0; k < p.pts.length; k++) {
      var e, v;
      try { e = evalExpr(p.ans, p.pts[k]); } catch (er) { continue; }
      if (!isFinite(e)) continue;
      try { v = evalExpr(raw[0], p.pts[k]); } catch (er2) { return 0; }
      if (!(Math.abs(v - e) <= 1e-6 * Math.max(1, Math.abs(e)))) return 0;
      good++;
    }
    return good >= 3 ? 1 : 0;
  }
  var a = normLim(p.ans);
  if (LIMV[a] !== undefined) return LIMV[normLim(raw[0])] === LIMV[a] ? 1 : 0;
  if (p.lim && LIMV[normLim(raw[0])] !== undefined) return 0;
  var S = p._S || (p._S = structOf(p.ans));
  var exp = [].concat.apply([], S.rows).map(function (c) { return evalExpr(c); });
  if (raw.length !== exp.length) return 0;
  for (var j = 0; j < exp.length; j++) {
    var val;
    try { val = evalExpr(raw[j]); } catch (er3) { return 0; }
    if (!(Math.abs(val - exp[j]) <= tol * Math.max(1, Math.abs(exp[j])))) return 0;
  }
  if (p.sf && sigFigs(raw[0]) !== p.sf) return 0.5;
  return 1;
}
function normOut(s) { return String(s == null ? '' : s).replace(/[“”]/g, '"').replace(/\s+/g, ' ').trim(); }
function ansHTML(p) {
  var a = String(p.ans);
  if (LIMV[normLim(a)] !== undefined) return '<span class="nowrap">' + ({ inf: '∞', '-inf': '−∞', dne: 'does not exist' })[normLim(a)] + '</span>';
  if (p.kind === 'expr') return '<code class="ic">' + esc(a) + '</code>';
  var S = structOf(a);
  if (S.kind === 's') return '<span class="nowrap">' + minus(S.rows[0][0]).replace(/pi/g, 'π').replace(/sqrt\(([^)]*)\)/g, '√$1') + (p.unit ? ' ' + p.unit : '') + '</span>';
  if (S.kind === 'v') return vecHTML(S.rows.map(function (r) { return r[0]; }).join(','));
  return matHTML(S.rows.map(function (r) { return r.join(','); }).join(';'), false);
}
function orders(q) { var base = q.steps.map(function (_, i) { return i; }); return [base].concat(q.alt || []); }
function gradeQ(q, resp) {
  if (q.type === 'mc') { var ok = resp === q.a; return { ok: ok, frac: ok ? 1 : 0 }; }
  if (q.type === 'txt') {
    var acc = [].concat(q.ans), r = normOut(resp), hit = r !== '' && acc.some(function (x) { return normOut(x) === r; });
    return { ok: hit, frac: hit ? 1 : 0 };
  }
  if (q.type === 'proof' || q.type === 'order') {
    var b = (resp && resp.built) || [], n = q.steps.length, best = 0, exact = false;
    orders(q).forEach(function (ord) {
      var h = 0;
      for (var k = 0; k < Math.min(b.length, n); k++) if (b[k] === ord[k]) h++;
      if (b.length === n && h === n) exact = true;
      best = Math.max(best, h);
    });
    return { ok: exact, frac: exact ? 1 : (b.length > n ? 0 : best / n) * 0.75, ord: exact ? null : bestOrder(q, b) };
  }
  var parts = partsOf(q), sc = parts.map(function (p, pi) { return gradePart(p, resp && resp[pi]); });
  var sum = sc.reduce(function (s, v) { return s + v; }, 0);
  return { ok: sc.every(function (v) { return v === 1; }), frac: sum / parts.length, parts: sc };
}
function bestOrder(q, b) {
  var best = orders(q)[0], bh = -1;
  orders(q).forEach(function (ord) { var h = 0; for (var k = 0; k < Math.min(b.length, ord.length); k++) if (b[k] === ord[k]) h++; if (h > bh) { bh = h; best = ord; } });
  return best;
}
function xpBase(q) {
  if (q.type === 'mc') return 10;
  if (q.type === 'num' || q.type === 'txt') return 15;
  if (q.type === 'proof' || q.type === 'order') return 25;
  return 10 * q.parts.length;
}
function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

/* ============================================================
   PROGRESS STORES
   ============================================================ */
var GKEY = 'midterm-gym-global-v1';
var INTERVALS = [0, 8 * 3600e3, 24 * 3600e3, 48 * 3600e3, 96 * 3600e3];
var GOAL = 20;
function load(key) { try { var r = localStorage.getItem(key); return r ? JSON.parse(r) : null; } catch (e) { return null; } }
function store(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* storage unavailable */ } }
var G = load(GKEY);
if (!G) {
  var old = load('math115-midterm-gym-v1') || {};
  G = { streak: old.streak || 0, last: old.last || '', today: old.today || { d: '', n: 0, hit: false }, snd: old.snd !== false, hap: old.hap !== false };
  store(GKEY, G);
}
COURSES.forEach(function (c) {
  var o = load(c.key) || {};
  c.S = { xp: o.xp || 0, q: o.q || {}, code: o.code || {} };
});
function save() { store(GKEY, G); if (CUR) { var o = load(CUR.key) || {}; o.xp = CUR.S.xp; o.q = CUR.S.q; o.code = CUR.S.code || {}; store(CUR.key, o); } }
function dayKey(d) { d = d || new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
function touchDay() {
  var k = dayKey();
  if (G.today.d !== k) G.today = { d: k, n: 0, hit: false };
  if (G.last !== k) {
    var y = new Date(); y.setDate(y.getDate() - 1);
    G.streak = G.last === dayKey(y) ? G.streak + 1 : 1;
    G.last = k;
  }
}
function todayN() { return G.today.d === dayKey() ? G.today.n : 0; }
function lvlInfo(xp, c) {
  c = c || CUR;
  var L = 1, need = 100, rem = xp;
  while (rem >= need) { rem -= need; L++; need = 100 + 40 * (L - 1); }
  return { L: L, rem: rem, need: need, title: c.titles[Math.min(L - 1, c.titles.length - 1)] };
}
function record(qid, ok, redeem) {
  var r = CUR.S.q[qid] || (CUR.S.q[qid] = { b: 0, due: 0, seen: 0, ok: 0 });
  r.seen++;
  if (ok) { r.ok++; r.b = redeem ? 2 : (r.b ? Math.min(5, r.b + 1) : 2); } else r.b = 1;
  r.due = Date.now() + INTERVALS[r.b - 1];
}
/* topics flagged extra (not on the midterm) stay out of smart runs, mocks and the overall mastery bar */
function coreQ(c) { c = c || CUR; return c.CQ || (c.CQ = c.Q.filter(function (q) { return !c.TBY[q.t].extra; })); }
/* mastered = box 5, the only state that shows green */
function solidN(c) { return coreQ(c).filter(function (q) { var r = c.S.q[q.id]; return r && r.b >= 5; }).length; }
function mastery(tid, c) {
  c = c || CUR;
  var qs = tid ? c.Q.filter(function (q) { return q.t === tid; }) : coreQ(c), sum = 0;
  qs.forEach(function (q) { var r = c.S.q[q.id]; if (r) sum += (r.b - 1) / 4; }); /* box 1 (missed) counts 0, box 5 counts 1 */
  return qs.length ? sum / qs.length : 0;
}
function dueIds(pool, c) {
  c = c || CUR;
  var now = Date.now();
  return pool.filter(function (q) { var r = c.S.q[q.id]; return r && r.due <= now; })
    .sort(function (a, b) { return c.S.q[a.id].b - c.S.q[b.id].b || c.S.q[a.id].due - c.S.q[b.id].due; });
}
function spread(list) {
  var out = list.slice();
  for (var i = 1; i < out.length; i++) {
    if (out[i].t === out[i - 1].t) {
      for (var j = i + 1; j < out.length; j++) if (out[j].t !== out[i - 1].t) { var tmp = out[i]; out[i] = out[j]; out[j] = tmp; break; }
    }
  }
  return out;
}
function pickSmart(n, tid) {
  var pool = tid ? CUR.Q.filter(function (q) { return q.t === tid; }) : coreQ();
  var due = dueIds(pool).slice(0, tid ? n : Math.ceil(n * 0.6));
  var used = {}; due.forEach(function (q) { used[q.id] = 1; });
  var unseen = shuffle(pool.filter(function (q) { return !CUR.S.q[q.id] && !used[q.id]; }));
  if (!tid) unseen.sort(function (a, b) { return mastery(a.t) - mastery(b.t); });
  var out = due.slice(), perTopic = {};
  unseen.forEach(function (q) {
    if (out.length >= n) return;
    perTopic[q.t] = (perTopic[q.t] || 0) + 1;
    if (tid || perTopic[q.t] <= 2) { out.push(q); used[q.id] = 1; }
  });
  if (out.length < n) {
    var rest = shuffle(pool.filter(function (q) { return !used[q.id]; })).sort(function (a, b) {
      var ra = CUR.S.q[a.id], rb = CUR.S.q[b.id]; return (ra ? ra.b : 0) - (rb ? rb.b : 0);
    });
    rest.forEach(function (q) { if (out.length < n) { out.push(q); used[q.id] = 1; } });
  }
  return spread(shuffle(out)).map(function (q) { return q.id; });
}
function daysTo(c) {
  if (!c.exam) return null;
  var e = new Date(c.exam.at), n = new Date();
  var a = new Date(e.getFullYear(), e.getMonth(), e.getDate()), b = new Date(n.getFullYear(), n.getMonth(), n.getDate());
  var d = Math.round((a - b) / 864e5);
  if (d === 0 && e < n) return -1;
  return d;
}
function cdText(d) { return d == null ? '' : d < 0 ? 'done' : d === 0 ? 'today' : d === 1 ? 'tomorrow' : 'in ' + d + ' days'; }

/* ============================================================
   SOUND, HAPTICS, CONFETTI
   ============================================================ */
var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var Snd = {
  ctx: null,
  init: function () {
    if (!this.ctx) { try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { this.ctx = null; } }
    if (this.ctx && this.ctx.state === 'suspended') { try { this.ctx.resume(); } catch (e) { /* ignore */ } }
  },
  tone: function (f, at, dur, type, vol, to) {
    if (!G.snd || !this.ctx) return;
    var c = this.ctx, t0 = c.currentTime + at, o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(f, t0);
    if (to) o.frequency.exponentialRampToValueAtTime(to, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol || 0.14, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(c.destination); o.start(t0); o.stop(t0 + dur + 0.03);
  },
  tap: function () { this.init(); this.tone(720, 0, 0.05, 'square', 0.035); },
  good: function (combo) {
    this.init();
    var pent = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24], st = pent[Math.min(combo, pent.length - 1)], f = 523.25 * Math.pow(2, st / 12);
    this.tone(f, 0, 0.14, 'triangle', 0.16); this.tone(f * 1.5, 0.07, 0.22, 'triangle', 0.13);
  },
  half: function () { this.init(); this.tone(440, 0, 0.16, 'triangle', 0.12); this.tone(415, 0.1, 0.2, 'triangle', 0.1); },
  bad: function () { this.init(); this.tone(210, 0, 0.3, 'sawtooth', 0.07, 105); },
  level: function () { var self = this; this.init(); [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach(function (f, i) { self.tone(f, i * 0.09, 0.3, 'triangle', 0.15); }); },
  done: function () { var self = this; this.init(); [659.25, 783.99, 987.77].forEach(function (f, i) { self.tone(f, i * 0.1, 0.35, 'sine', 0.14); }); },
  bell: function () { var self = this; this.init(); [783.99, 659.25, 523.25, 783.99].forEach(function (f, i) { self.tone(f, i * 0.42, 1.1, 'sine', 0.13); self.tone(f * 2, i * 0.42, 0.6, 'sine', 0.03); }); }
};
function buzz(p) { if (!G.hap) return; try { if (navigator.vibrate) navigator.vibrate(p); } catch (e) { /* unsupported */ } }
var FX = {
  cv: null, ctx: null, ps: [], on: false,
  size: function () { var r = window.devicePixelRatio || 1; this.cv.width = innerWidth * r; this.cv.height = innerHeight * r; this.ctx.setTransform(r, 0, 0, r, 0, 0); },
  burst: function (n, x, y) {
    if (reduced) return;
    if (!this.cv) { this.cv = document.getElementById('fx'); this.ctx = this.cv.getContext('2d'); this.size(); }
    var cs = getComputedStyle(document.documentElement), cols = ['--gold', '--brand', '--good', '--flame'].map(function (v) { return cs.getPropertyValue(v).trim() || '#2f5bea'; });
    for (var i = 0; i < n; i++) {
      var a = Math.random() * Math.PI * 2, sp = 4 + Math.random() * 8;
      this.ps.push({ x: x * innerWidth, y: y * innerHeight, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 5, w: 5 + Math.random() * 6, hgt: 3 + Math.random() * 4, r: Math.random() * 6, vr: (Math.random() - .5) * .4, c: cols[i % cols.length], life: 70 + Math.random() * 40 });
    }
    if (!this.on) { this.on = true; requestAnimationFrame(this.step.bind(this)); }
  },
  step: function () {
    var c = this.ctx; c.clearRect(0, 0, innerWidth, innerHeight);
    this.ps = this.ps.filter(function (p) { return p.life > 0 && p.y < innerHeight + 20; });
    this.ps.forEach(function (p) {
      p.x += p.vx; p.y += p.vy; p.vy += 0.28; p.vx *= 0.99; p.r += p.vr; p.life--;
      c.save(); c.translate(p.x, p.y); c.rotate(p.r); c.globalAlpha = Math.min(1, p.life / 25); c.fillStyle = p.c; c.fillRect(-p.w / 2, -p.hgt / 2, p.w, p.hgt); c.restore();
    });
    if (this.ps.length) requestAnimationFrame(this.step.bind(this)); else { this.on = false; c.clearRect(0, 0, innerWidth, innerHeight); }
  }
};
window.addEventListener('resize', function () { if (FX.cv) FX.size(); });

/* ============================================================
   QUESTION CARD
   ============================================================ */
function fbBox(state, head, html) {
  var d = h('div', 'fb ' + (state === 1 || state === true ? 'good' : state === 0.5 ? 'part' : 'bad'));
  d.setAttribute('role', 'status');
  d.innerHTML = '<span class="hd">' + head + '</span>' + html;
  return d;
}
function buildGrid(q, p, pi, raw0, uid) {
  var S0 = p.kind === 'expr' || p.lim ? { kind: 'w', rows: [['']] } : (p._S || (p._S = structOf(p.ans)));
  var rows = S0.rows.length, cols = S0.rows[0].length, inputs = [];
  var wrap = h('div', 'grid ' + S0.kind);
  if (S0.kind === 'm') wrap.style.setProperty('--cols', cols);
  var idx = 0;
  for (var r = 0; r < rows; r++) {
    for (var c = 0; c < cols; c++) {
      if (S0.kind === 'v') {
        var lb = (p.labels || q.labels || [])[r];
        wrap.appendChild(h('span', 'lbl', lb ? lb + ' =' : ''));
      }
      var inp = document.createElement('input');
      inp.type = 'text'; inp.className = 'cell'; inp.autocomplete = 'off'; inp.autocapitalize = 'off'; inp.spellcheck = false;
      inp.setAttribute('autocorrect', 'off');
      inp.setAttribute('inputmode', 'text'); inp.setAttribute('enterkeyhint', 'next');
      inp.id = 'in-' + uid + '-' + pi + '-' + idx;
      inp.setAttribute('aria-label', S0.kind === 's' || S0.kind === 'w' ? 'Answer' : 'Entry ' + (idx + 1));
      if (raw0 && raw0[idx] != null) inp.value = raw0[idx];
      wrap.appendChild(inp); inputs.push(inp); idx++;
    }
  }
  return { el: wrap, inputs: inputs, S: S0 };
}
function hintFor(p, kind) {
  if (p.kind === 'expr') return 'Expression in x, like (x+3)/(1-2x). Use sqrt(), ln(), e^x and pi.';
  if (p.lim) return (CUR && CUR.limHint) || 'Number, or inf, -inf, DNE.';
  if (p.sf) return 'Exactly ' + p.sf + ' significant figure' + (p.sf === 1 ? '' : 's') + '. Use E notation for powers of ten, like 1.23E4.';
  if (CUR && CUR.tol) return 'Number, like 0.455 or 1.81E2.';
  return kind === 's' ? 'Number or fraction, like 3/4 or sqrt(2)/2.' : 'Fill every box. Fractions are fine, like 3/13.';
}
/* display order for multiple choice: numeric answers ascending, "none of the above" style options last,
   True/False as written, everything else shuffled */
var KEEP_LAST = /^(none\b|all of\b|all four\b|neither\b|both\b|it cannot\b|it does not compile|nothing\b)/i;
function plainOpt(t) { return String(t).replace(/<[^>]+>|[\u0001-\u0004]/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim(); }
function mcOrder(q) {
  var idx = q.opts.map(function (_, i) { return i; }), P = q.opts.map(plainOpt);
  if (q.fixed || (P.length === 2 && /^(true|false)$/i.test(P[0]))) return idx;
  var stay = idx.filter(function (i) { return KEEP_LAST.test(P[i]); }), move = idx.filter(function (i) { return !KEEP_LAST.test(P[i]); });
  var nums = move.map(function (i) { var m = /^[−-]?\d*\.?\d+/.exec(P[i]); return m ? parseFloat(m[0].replace('−', '-')) : NaN; });
  if (move.length > 1 && nums.every(function (v) { return !isNaN(v); })) {
    move = move.map(function (i, k) { return [i, nums[k], Math.random()]; }).sort(function (a, b) { return a[1] - b[1] || a[2] - b[2]; }).map(function (p) { return p[0]; });
  } else move = shuffle(move);
  return move.concat(stay);
}
function qCard(q, o) {
  var mode = o.mode, st = o.state, uid = (o.uid || 'x') + q.id.replace(/\W/g, '');
  var T = CUR.TBY[q.t];
  var root = h('div', 'qcard');
  root._q = q; /* lets tests read the question behind a card */
  root.appendChild(h('div', 'qmeta', '<span class="tag">' + T.sec + '</span><span>' + T.name + '</span>'));
  var body = h('div', 'qbody'); root.appendChild(body);
  var api = { el: root, locked: false, onChange: null, onEnter: null, hinted: false };

  if (q.type === 'mc') {
    body.appendChild(h('div', 'qtext', fmt(q.q)));
    var graphic = q.opts.every(function (t) { return /^<svg/.test(t); });
    var list = h('div', 'opts' + (graphic ? ' g2' : '')); body.appendChild(list);
    /* options are shown in a shuffled order kept in the state, so a review shows the same order;
       st.resp always holds the original option index */
    if (!st.order || st.order.length !== q.opts.length) st.order = mcOrder(q);
    var btns = st.order.map(function (i, k) {
      var b = h('button', 'opt', '<span class="ltr">' + 'abcde'.charAt(k) + '</span><span class="otxt">' + fmt(q.opts[i]) + '</span>');
      b.type = 'button'; b._i = i; list.appendChild(b);
      b.addEventListener('click', function () {
        if (api.locked) return;
        Snd.tap(); st.resp = i; paint();
        if (mode === 'practice') { if (o.onAuto) o.onAuto(); } else if (api.onChange) api.onChange();
      });
      return b;
    });
    var paint = function () { btns.forEach(function (b) { b.classList.toggle('sel', st.resp === b._i); b.setAttribute('aria-pressed', st.resp === b._i); }); };
    paint();
    api.canSubmit = function () { return st.resp != null; };
    api.reveal = function (res, giveUp) {
      api.locked = true;
      btns.forEach(function (b) { var i = b._i; b.disabled = true; b.classList.remove('sel'); b.classList.toggle('right', i === q.a); b.classList.toggle('wrong', st.resp === i && i !== q.a); });
      var head = res.ok ? PRAISE[Math.floor(Math.random() * PRAISE.length)] : (st.resp == null ? (giveUp ? 'Answer revealed.' : 'Skipped.') : 'Not quite.');
      body.appendChild(fbBox(res.ok, head, fmt(q.why)));
    };
  } else if (q.type === 'proof' || q.type === 'order') {
    body.appendChild(h('div', 'qtext', fmt(q.q)));
    var isCode = !!q.code, steps = q.steps, all = steps.concat(q.extra || []);
    var show = function (s) { return isCode ? codeTile(s) : fmt(s); };
    st.order = st.order || shuffle(all.map(function (_, i) { return i; }));
    st.resp = st.resp || { built: [] };
    var lab1 = h('div', 'pf-lab', q.label || (q.type === 'proof' ? 'Your proof, top to bottom' : 'Your order')), build = h('div', 'build'), lab2 = h('div', 'pf-lab', 'Tiles'), pool = h('div', 'tiles');
    var wrapP = h('div', 'pf'); wrapP.appendChild(lab1); wrapP.appendChild(build); wrapP.appendChild(lab2); wrapP.appendChild(pool); body.appendChild(wrapP);
    var mark = null;
    var repaint = function () {
      build.innerHTML = ''; pool.innerHTML = '';
      var b = st.resp.built;
      if (!b.length) build.appendChild(h('div', 'empty', 'Tap tiles below to place them here.'));
      b.forEach(function (id, pos) {
        var t = h('button', 'tile' + (isCode ? ' code' : ''), '<span class="tt">' + show(all[id]) + '</span>'); t.type = 'button'; t.disabled = api.locked;
        if (mark) t.classList.add(mark[pos] ? 'ok' : 'no');
        t.addEventListener('click', function () { if (api.locked) return; Snd.tap(); b.splice(pos, 1); repaint(); if (api.onChange) api.onChange(); });
        build.appendChild(t);
      });
      st.order.forEach(function (id) {
        if (b.indexOf(id) >= 0) return;
        var t = h('button', 'tile' + (isCode ? ' code' : ''), '<span class="tt">' + show(all[id]) + '</span>'); t.type = 'button'; t.disabled = api.locked;
        t.addEventListener('click', function () { if (api.locked) return; Snd.tap(); b.push(id); repaint(); if (api.onChange) api.onChange(); });
        pool.appendChild(t);
      });
      lab2.hidden = !pool.children.length; pool.hidden = !pool.children.length;
    };
    repaint();
    if (mode === 'practice' && q.why) {
      var hb = h('button', 'link hint-btn', 'Need a hint?'); hb.type = 'button';
      hb.addEventListener('click', function () { api.hinted = true; hb.replaceWith(h('div', 'hint-box', fmt(q.why))); });
      body.appendChild(hb);
    }
    api.canSubmit = function () { return st.resp.built.length > 0; };
    api.reveal = function (res, giveUp) {
      api.locked = true;
      if (giveUp) st.resp.built = [];
      var b = st.resp.built, ord = res.ok ? b : bestOrder(q, b);
      mark = b.map(function (id, pos) { return id === ord[pos]; });
      repaint();
      var head = res.ok ? PRAISE[Math.floor(Math.random() * PRAISE.length)] : (giveUp ? 'Here is the answer.' : 'Not quite. Green tiles were in the right place.');
      var html = '<span class="ans-lab">Correct order</span><ol class="proof' + (isCode ? ' code' : '') + '">' + steps.map(function (s) { return '<li>' + show(s) + '</li>'; }).join('') + '</ol>';
      if (q.type === 'order' && q.why) html += '<div style="margin-top:.4rem">' + fmt(q.why) + '</div>';
      body.appendChild(fbBox(res.ok, head, html));
    };
  } else if (q.type === 'txt') {
    body.appendChild(h('div', 'qtext', fmt(q.q)));
    st.resp = st.resp == null ? '' : st.resp;
    var blk = h('div', 'part');
    var inp = document.createElement('input');
    inp.type = 'text'; inp.className = 'cell'; inp.autocomplete = 'off'; inp.autocapitalize = 'off'; inp.spellcheck = false;
    inp.setAttribute('autocorrect', 'off'); inp.setAttribute('aria-label', 'Program output'); inp.setAttribute('enterkeyhint', 'done');
    inp.value = st.resp;
    var gw = h('div', 'grid w'); gw.appendChild(inp); blk.appendChild(gw);
    blk.appendChild(h('div', 'fmt-hint', 'Type the exact output. A line break counts as a space.'));
    var slot = h('div', 'pfb'); blk.appendChild(slot);
    if (mode === 'practice' && q.hint) {
      var hb3 = h('button', 'link hint-btn', 'Need a hint?'); hb3.type = 'button';
      hb3.addEventListener('click', function () { api.hinted = true; hb3.replaceWith(h('div', 'hint-box', fmt(q.hint))); });
      blk.appendChild(hb3);
    }
    body.appendChild(blk);
    inp.addEventListener('input', function () { st.resp = inp.value; if (api.onChange) api.onChange(); });
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); if (api.onEnter) api.onEnter(); } });
    api.canSubmit = function () { return inp.value.trim() !== ''; };
    api.focus = function () { inp.focus(); };
    api.reveal = function (res, giveUp) {
      api.locked = true; inp.disabled = true;
      if (giveUp) inp.value = '';
      inp.classList.add(res.ok ? 'ok' : 'no');
      var head = res.ok ? PRAISE[Math.floor(Math.random() * PRAISE.length)] : (giveUp ? 'Answer revealed.' : 'Not quite.');
      var html = (res.ok ? '' : '<span class="ans-lab">Output</span><span class="ans"><span class="out">' + esc([].concat(q.ans)[0]) + '</span></span>') + fmt(q.why);
      slot.appendChild(fbBox(res.ok, head, html));
    };
  } else {
    var parts = partsOf(q);
    body.appendChild(h('div', 'qtext', fmt(q.q)));
    st.resp = st.resp || parts.map(function () { return []; });
    var grids = parts.map(function (p, pi) {
      var blk2 = h('div', 'part');
      if (p.ask) blk2.appendChild(h('div', 'pask', fmt(p.ask)));
      var g = buildGrid(q, p, pi, st.resp[pi], uid);
      var row = h('div', 'inrow'); row.appendChild(g.el);
      if (p.unit) row.appendChild(h('span', 'unit', p.unit));
      blk2.appendChild(row);
      blk2.appendChild(h('div', 'fmt-hint', hintFor(p, g.S.kind)));
      var slot2 = h('div', 'pfb'); blk2.appendChild(slot2);
      if (mode === 'practice' && p.hint) {
        var hb2 = h('button', 'link hint-btn', 'Need a hint?'); hb2.type = 'button';
        hb2.addEventListener('click', function () { api.hinted = true; hb2.replaceWith(h('div', 'hint-box', fmt(p.hint))); });
        blk2.appendChild(hb2);
      }
      g.inputs.forEach(function (inp2) {
        inp2.addEventListener('input', function () { st.resp[pi] = g.inputs.map(function (x) { return x.value; }); if (api.onChange) api.onChange(); });
        inp2.addEventListener('keydown', function (e) {
          if (e.key !== 'Enter') return;
          e.preventDefault();
          var all2 = [].slice.call(root.querySelectorAll('input.cell')), pos = all2.indexOf(inp2);
          if (pos < all2.length - 1) all2[pos + 1].focus(); else if (api.onEnter) api.onEnter();
        });
      });
      body.appendChild(blk2);
      return { g: g, slot: slot2, p: p };
    });
    api.canSubmit = function () { return grids.every(function (x) { return x.g.inputs.every(function (i) { return i.value.trim() !== ''; }); }); };
    api.focus = function () { if (grids[0] && grids[0].g.inputs[0]) grids[0].g.inputs[0].focus(); };
    api.reveal = function (res, giveUp) {
      api.locked = true;
      grids.forEach(function (x, pi) {
        var sc = res.parts[pi];
        if (giveUp) x.g.inputs.forEach(function (i) { i.value = ''; });
        x.g.inputs.forEach(function (i) { i.disabled = true; i.classList.add(sc === 1 ? 'ok' : sc === 0.5 ? 'half' : 'no'); });
        var head = sc === 1 ? PRAISE[(pi + 2) % PRAISE.length] : sc === 0.5 ? 'Right value, but not in the requested form (sig figs or E notation). Half credit.' : (giveUp ? 'Answer revealed.' : 'Not quite.');
        var html = (sc === 1 ? '' : '<span class="ans-lab">Answer</span><span class="ans">' + ansHTML(x.p) + '</span>') + fmt(x.p.why);
        x.slot.appendChild(fbBox(sc, head, html));
      });
    };
  }
  var revealRaw = api.reveal;
  api.reveal = function () { revealRaw.apply(null, arguments); [].forEach.call(root.querySelectorAll('.hint-btn'), function (b) { b.remove(); }); };
  if (mode === 'review') api.reveal(gradeQ(q, st.resp), false);
  return api;
}

/* ============================================================
   APP SHELL
   ============================================================ */
var app = document.getElementById('app');
var run = null, exam = null, timerId = null, resetArm = 0;
function clearTimer() { if (timerId) { clearInterval(timerId); timerId = null; } }
function countUp(el, to, ms, suffix) {
  if (reduced || !to) { el.textContent = to + (suffix || ''); return; }
  var t0 = performance.now();
  (function f(now) { var p = Math.min(1, (now - t0) / ms); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))) + (suffix || ''); if (p < 1) requestAnimationFrame(f); })(t0);
}
function floatXP(host, t) { var f = h('div', 'floater', t); host.appendChild(f); setTimeout(function () { if (f.parentNode) f.parentNode.removeChild(f); }, 1050); }
function overlay(html, cls) {
  var ov = h('div', 'overlay'), m = h('div', 'modal' + (cls ? ' ' + cls : ''), html);
  m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true');
  ov.appendChild(m); document.body.appendChild(ov);
  var prev = document.activeElement;
  function close() { ov.remove(); document.removeEventListener('keydown', onKey); if (prev && prev.focus) prev.focus(); }
  function onKey(e) { if (e.key === 'Escape') close(); }
  document.addEventListener('keydown', onKey);
  ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
  return { ov: ov, m: m, close: close };
}
function addXP(n) {
  var before = lvlInfo(CUR.S.xp).L;
  CUR.S.xp += n;
  var after = lvlInfo(CUR.S.xp);
  if (after.L > before) levelUp(after);
}
function levelUp(li) {
  Snd.level(); buzz([30, 50, 30, 50, 90]); FX.burst(120, 0.5, 0.35);
  var m = overlay('<p class="eyebrow">' + CUR.code + ' · Level up</p><div class="huge">' + li.L + '</div><h3>' + li.title + '</h3><p class="muted">Keep the streak going.</p><button class="btn" id="lvl-ok" type="button">Keep going</button>', 'center');
  var b = m.m.querySelector('#lvl-ok'); b.addEventListener('click', m.close); b.focus();
}
function bumpToday(n) {
  touchDay(); G.today.n += n;
  if (!G.today.hit && G.today.n >= GOAL) {
    G.today.hit = true; FX.burst(80, 0.5, 0.3); Snd.done(); buzz([20, 40, 20, 40, 60]);
    var m = overlay('<p class="eyebrow">Daily goal</p><div class="huge">' + GOAL + '</div><h3>questions done today</h3><p class="muted">Streak: ' + G.streak + ' day' + (G.streak === 1 ? '' : 's') + '.</p><button class="btn" id="g-ok" type="button">Nice</button>', 'center');
    var b = m.m.querySelector('#g-ok'); b.addEventListener('click', m.close); b.focus();
  }
}
function flame() { return '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2c1 3.5-1.5 5-1.5 7.5 0 1.4 1 2.5 2.2 2.5 1.7 0 2.8-1.6 2.3-3.6 2.3 1.6 3.5 4.1 3.5 6.6A6.5 6.5 0 0 1 12 21.5a6.5 6.5 0 0 1-6.5-6.5c0-3 1.7-4.8 3.1-6.4C9.9 7.1 11.5 5.3 12 2z"/></svg>'; }
function multOf(c) { return 1 + Math.min(c, 10) * 0.1; }
function dropBars() { keyFn = null; document.querySelectorAll('.bar').forEach(function (b) { b.remove(); }); }

/* keyboard: 1-5 or a-e pick an option, Enter checks or moves on, H opens a hint */
var keyFn = null;
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && dockWant && !document.querySelector('.overlay')) { closeDock(); return; }
  if (!keyFn || e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
  if (document.querySelector('.overlay')) return;
  var tag = e.target && e.target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA') return;
  keyFn(e, tag === 'BUTTON' || tag === 'SUMMARY');
});
function practiceKeys(card, main) {
  return function (e, onBtn) {
    if (!main.isConnected) return;
    var k = e.key.toLowerCase(), opts = card.el.querySelectorAll('.opt'), idx = '12345'.indexOf(k);
    if (idx < 0) idx = 'abcde'.indexOf(k);
    if (idx >= 0 && opts[idx] && !opts[idx].disabled) { e.preventDefault(); opts[idx].click(); return; }
    if (k === 'h') { var hb = card.el.querySelector('.hint-btn'); if (hb) { e.preventDefault(); hb.click(); } return; }
    if (k === 'f' && CUR && CUR.formula) { e.preventDefault(); toggleDock(); return; }
    if (k === 'enter' && !onBtn && !main.disabled) { e.preventDefault(); main.click(); }
  };
}

/* toasts for milestones, queued so they never stack */
var toastQ = [], toastOn = false;
function toast(t) { toastQ.push(t); if (!toastOn) nextToast(); }
function nextToast() {
  var t = toastQ.shift();
  if (!t) { toastOn = false; return; }
  toastOn = true;
  var el = h('div', 'toast', t); el.setAttribute('role', 'status'); document.body.appendChild(el);
  setTimeout(function () { el.remove(); nextToast(); }, 1750);
}
function infIcon() { return '<svg class="inf-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 8.2a3.8 3.8 0 1 0 0 7.6c2.4 0 3.4-1.9 5-3.8s2.6-3.8 5-3.8a3.8 3.8 0 1 1 0 7.6c-2.4 0-3.4-1.9-5-3.8S9.4 8.2 7 8.2z"/></svg>'; }
function heartSVG(on, cls) { return '<svg class="heart ' + (on ? 'on' : 'off') + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 7.9 3.6 4.5 7 4.5c2 0 3.4 1.1 5 3 1.6-1.9 3-3 5-3 3.4 0 5.6 3.4 4.3 6.8-1.8 4.6-9.3 9.2-9.3 9.2z"/></svg>'; }
function togglesHTML() {
  var cd = G.candle && !G.candle.done ? G.candle : null;
  return '<div class="toggles"><button class="tgl" type="button" data-tgl="snd" aria-pressed="' + G.snd + '"><i></i>Sound</button><button class="tgl" type="button" data-tgl="hap" aria-pressed="' + G.hap + '"><i></i>Haptics</button>' +
    '<button class="tgl tmr" type="button" id="tmr-pill">' + candleIcon() + '<span id="tmr-txt">' + (cd ? fmtClock(cdLeft(cd)) : 'Study timer') + '</span></button></div>';
}
function bindToggles() {
  var tp = document.getElementById('tmr-pill'); if (tp) tp.addEventListener('click', function () { Snd.tap(); candleOpen(); });
  app.querySelectorAll('[data-tgl]').forEach(function (b) {
    b.addEventListener('click', function () {
      var k = b.getAttribute('data-tgl'); G[k] = !G[k]; b.setAttribute('aria-pressed', G[k]); save();
      if (G[k]) { Snd.tap(); if (k === 'hap') buzz(30); }
    });
  });
}
function ringHTML(tn) {
  var circ = 2 * Math.PI * 24;
  return '<div class="goal"><svg class="ring" viewBox="0 0 60 60" aria-hidden="true"><circle class="bg" cx="30" cy="30" r="24"/><circle class="fg" id="ringfg" cx="30" cy="30" r="24" stroke-dasharray="' + circ + '" stroke-dashoffset="' + circ + '"/></svg><b>' + Math.min(tn, GOAL) + '/' + GOAL + '</b></div>';
}
function animateRing(tn) {
  var circ = 2 * Math.PI * 24;
  requestAnimationFrame(function () { requestAnimationFrame(function () {
    var rf = document.getElementById('ringfg'); if (rf) rf.style.strokeDashoffset = circ * (1 - Math.min(1, tn / GOAL));
  }); });
}
function sortedCourses() {
  return COURSES.slice().sort(function (a, b) {
    var da = daysTo(a), db = daysTo(b);
    var ka = da == null || da < 0 ? 1e6 + COURSES.indexOf(a) : da, kb = db == null || db < 0 ? 1e6 + COURSES.indexOf(b) : db;
    return ka - kb || new Date(a.exam.at) - new Date(b.exam.at);
  });
}

/* ============================================================
   CANDLE TIMER: pick a study period and the candle burns down evenly
   until time is up. The state lives in G (saved), and it runs on the
   wall clock, so it keeps burning across screens and page reloads.
   ============================================================ */
var CD_H = 72, cdIv = null, cdEndArm = 0;
function candleIcon() { return '<svg class="tmr-ico" viewBox="0 0 24 24" aria-hidden="true"><path class="w" d="M9 10.5h6V21H9z"/><path class="f" d="M12 2.5c1.6 2 2.3 3.4 2.3 4.6A2.3 2.3 0 0 1 12 9.4a2.3 2.3 0 0 1-2.3-2.3c0-1.2.7-2.6 2.3-4.6z"/></svg>'; }
function cdLeft(cd) { var now = Date.now(); return Math.max(0, cd.total - (now - cd.start - cd.pausedFor - (cd.paused ? now - cd.pausedAt : 0))); }
function fmtClock(ms) { var s = Math.ceil(ms / 1000), hh = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), ss = s % 60; return (hh ? hh + ':' + ('0' + m).slice(-2) : m) + ':' + ('0' + ss).slice(-2); }
function candleSVG(cls) {
  var t = 108 - CD_H;
  return '<svg class="cd-svg' + (cls ? ' ' + cls : '') + '" viewBox="0 0 60 118" aria-hidden="true">' +
    '<defs><radialGradient id="cdGlow"><stop offset="0" style="stop-color:var(--flame);stop-opacity:.5"/><stop offset="1" style="stop-color:var(--flame);stop-opacity:0"/></radialGradient>' +
    '<linearGradient id="cdFlame" x1="0" y1="1" x2="0" y2="0"><stop offset="0" style="stop-color:var(--flame)"/><stop offset=".6" style="stop-color:var(--gold)"/><stop offset="1" style="stop-color:#fff4c2"/></linearGradient></defs>' +
    '<ellipse class="cd-plate" cx="30" cy="110" rx="25" ry="5.5"/>' +
    '<g class="cd-wax"><rect x="18" y="' + t + '" width="24" height="' + CD_H + '" rx="2.5"/><path class="cd-shine" d="M22.5 ' + (t + 7) + ' V103"/></g>' +
    '<g class="cd-top">' +
      '<ellipse class="cd-pool" cx="30" cy="' + t + '" rx="12" ry="2.8"/>' +
      '<path class="cd-drip" d="M36.5 ' + t + ' q2.2 6 0 11 q-2.2 -5 0 -11z"/>' +
      '<path class="cd-wick" d="M30 ' + (t + 1) + ' V' + (t - 7) + '"/>' +
      '<g class="cd-fire"><circle cx="30" cy="' + (t - 16) + '" r="17" fill="url(#cdGlow)"/>' +
        '<path class="cd-flame" fill="url(#cdFlame)" d="M30 ' + (t - 30) + ' C35.5 ' + (t - 22) + ' 37.5 ' + (t - 15) + ' 35 ' + (t - 10) + ' C33.4 ' + (t - 6.5) + ' 26.6 ' + (t - 6.5) + ' 25 ' + (t - 10) + ' C22.5 ' + (t - 15) + ' 24.5 ' + (t - 22) + ' 30 ' + (t - 30) + 'Z"/></g>' +
      '<g class="cd-smoke"><path d="M30 ' + (t - 8) + ' c-3 -5 3 -8 0 -13 s3 -8 0 -13"/><path d="M27 ' + (t - 10) + ' c-3 -4 2 -7 0 -11"/></g>' +
    '</g></svg>';
}
/* the wax shrinks from the bottom and the flame rides down with its top; a small stub is always left */
function cdPaint(root, frac) {
  var v = 0.05 + 0.95 * Math.max(0, Math.min(1, frac));
  root.querySelectorAll('.cd-live').forEach(function (svg) {
    svg.querySelector('.cd-wax').style.transform = 'scaleY(' + v + ')';
    svg.querySelector('.cd-top').style.transform = 'translateY(' + ((1 - v) * CD_H) + 'px)';
  });
}
function candleWidget() {
  var w = document.getElementById('candle');
  if (w) return w;
  w = h('div', 'candle'); w.id = 'candle'; w.setAttribute('role', 'timer'); w.title = 'Drag to move. Click the candle for controls.';
  w.innerHTML = '<span class="cd-grip" aria-hidden="true"></span><button type="button" class="cd-open" id="cd-open" aria-label="Study timer controls">' + candleSVG('cd-live') + '</button>' +
    '<div class="cd-info"><b id="cd-time"></b><span id="cd-sub"></span>' +
    '<div class="cd-btns"><button type="button" id="cd-pp">Pause</button><button type="button" id="cd-end">End</button></div></div>';
  document.body.appendChild(w);
  document.documentElement.classList.add('candle-on');
  w.querySelector('#cd-open').addEventListener('click', function () { if (w._dragged) return; Snd.tap(); candleOpen(); });
  w.querySelector('#cd-pp').addEventListener('click', function () { Snd.tap(); candlePause(); });
  var e = w.querySelector('#cd-end');
  e.addEventListener('click', function () {
    if (Date.now() - cdEndArm < 2500) candleEnd();
    else { cdEndArm = Date.now(); e.textContent = 'Sure?'; setTimeout(function () { if (e.isConnected) e.textContent = 'End'; }, 2500); }
  });
  cdDraggable(w);
  candlePlace();
  return w;
}
/* drag the candle anywhere; the spot is saved separately for computer and phone layouts */
function cdMode() { return window.matchMedia && window.matchMedia('(min-width: 64rem) and (hover: hover) and (pointer: fine)').matches ? 'desk' : 'phone'; }
function candlePlace() {
  var w = document.getElementById('candle'); if (!w) return;
  var pos = G.candlePos && G.candlePos[cdMode()];
  if (!pos) { w.classList.remove('placed'); w.style.left = w.style.top = ''; return; }
  var r = w.getBoundingClientRect(), vw = window.innerWidth, vh = window.innerHeight;
  w.classList.add('placed');
  w.style.left = Math.round(pos[0] * Math.max(0, vw - r.width)) + 'px';
  w.style.top = Math.round(pos[1] * Math.max(0, vh - r.height)) + 'px';
}
function cdDraggable(w) {
  var sx, sy, ox, oy, dragging = false;
  function move(ev) {
    var dx = ev.clientX - sx, dy = ev.clientY - sy;
    if (!dragging && Math.abs(dx) + Math.abs(dy) < 6) return;
    if (!dragging) { dragging = true; w._dragged = true; w.classList.add('placed', 'dragging'); }
    var r = w.getBoundingClientRect();
    w.style.left = Math.max(0, Math.min(window.innerWidth - r.width, ox + dx)) + 'px';
    w.style.top = Math.max(0, Math.min(window.innerHeight - r.height, oy + dy)) + 'px';
    ev.preventDefault();
  }
  function up() {
    document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up); document.removeEventListener('pointercancel', up);
    if (!dragging) return;
    w.classList.remove('dragging');
    var r = w.getBoundingClientRect(), vw = window.innerWidth, vh = window.innerHeight;
    G.candlePos = G.candlePos || {};
    G.candlePos[cdMode()] = [vw > r.width ? r.left / (vw - r.width) : 0, vh > r.height ? r.top / (vh - r.height) : 0];
    cdSave();
    setTimeout(function () { w._dragged = false; }, 0);   /* swallow the click that ends a drag */
  }
  w.addEventListener('pointerdown', function (ev) {
    if (ev.button !== 0 || ev.target.closest('.cd-btns')) return;
    var r = w.getBoundingClientRect();
    dragging = false; w._dragged = false; sx = ev.clientX; sy = ev.clientY; ox = r.left; oy = r.top;
    document.addEventListener('pointermove', move, { passive: false }); document.addEventListener('pointerup', up); document.addEventListener('pointercancel', up);
  });
}
window.addEventListener('resize', candlePlace);
function candleRemove() { var w = document.getElementById('candle'); if (w) w.remove(); document.documentElement.classList.remove('candle-on'); var p = document.getElementById('tmr-txt'); if (p) p.textContent = 'Study timer'; }
function cdSave() { store(GKEY, G); }
function cdRun() { if (!cdIv) cdIv = setInterval(candleTick, 1000); }
function cdStop() { if (cdIv) { clearInterval(cdIv); cdIv = null; } }
function candleTick() {
  var cd = G.candle;
  if (!cd) { cdStop(); return; }
  var left = cdLeft(cd), w = candleWidget(), txt = fmtClock(left);
  w.classList.remove('cd-out');
  w.classList.toggle('paused', !!cd.paused);
  cdPaint(document, left / cd.total);
  sdSet('cd-time', txt);
  sdSet('cd-sub', cd.paused ? 'Paused' : 'of ' + Math.round(cd.total / 60000) + ' min');
  sdSet('cd-pp', cd.paused ? 'Resume' : 'Pause');
  w.setAttribute('aria-label', 'Study timer, ' + txt + ' left' + (cd.paused ? ', paused' : ''));
  sdSet('tmr-txt', txt); sdSet('cd-m-time', txt); sdSet('cd-m-pp', cd.paused ? 'Resume' : 'Pause');
  var mc = document.querySelector('.cd-modal'); if (mc) mc.classList.toggle('paused', !!cd.paused);
  var bar = document.querySelector('.bar'); w.style.setProperty('--cd-bottom', (bar ? bar.offsetHeight : 0) + 'px');
  if (left <= 0) candleDone();
}
function candleStart(min) {
  G.candle = { total: min * 60000, start: Date.now(), paused: false, pausedAt: 0, pausedFor: 0, q0: todayN(), d0: dayKey() };
  cdSave(); cdRun(); candleTick();
  toast('Candle lit: ' + min + ' min');
}
function candlePause() {
  var cd = G.candle; if (!cd) return;
  if (cd.paused) { cd.pausedFor += Date.now() - cd.pausedAt; cd.paused = false; }
  else { cd.paused = true; cd.pausedAt = Date.now(); }
  cdSave(); candleTick();
}
function candleAdd(min) { if (!G.candle) return; G.candle.total += min * 60000; cdSave(); candleTick(); toast('+' + min + ' min'); }
function candleEnd() { G.candle = null; cdSave(); cdStop(); candleRemove(); toast('Timer ended'); }
function candleDone() {
  var cd = G.candle; if (!cd) return;
  var mins = Math.round(cd.total / 60000), answered = dayKey() === cd.d0 ? todayN() - cd.q0 : null;
  G.candle = null; cdSave(); cdStop();
  var w = candleWidget(); w.classList.remove('paused'); w.classList.add('cd-out'); cdPaint(document, 0);
  sdSet('cd-time', '0:00'); sdSet('cd-sub', 'Time\'s up'); sdSet('tmr-txt', 'Study timer');
  Snd.bell(); buzz([80, 60, 80, 60, 160]); FX.burst(40, 0.5, 0.35);
  var open = document.querySelector('.overlay'); if (open) open.remove();
  var m = overlay('<div class="cd-modal">' + candleSVG('big cd-out cd-live') + '</div><p class="eyebrow">Candle timer</p><h3>Time\'s up</h3>' +
    '<p class="muted">You studied for ' + mins + ' minute' + (mins === 1 ? '' : 's') + (answered != null ? ' and answered ' + answered + ' question' + (answered === 1 ? '' : 's') : '') + '.</p>' +
    '<p class="cd-acts"><button class="btn" id="cd-more" type="button">5 more minutes</button><button class="btn ghost" id="cd-fin" type="button">Done</button></p>', 'center');
  cdPaint(m.m, 0);
  m.m.querySelector('#cd-more').addEventListener('click', function () { m.close(); candleStart(5); });
  m.m.querySelector('#cd-fin').addEventListener('click', function () { m.close(); candleRemove(); });
  m.m.querySelector('#cd-fin').focus();
  setTimeout(function () { if (!G.candle && !document.querySelector('.overlay')) candleRemove(); }, 12000);
}
function candleOpen() {
  var cd = G.candle, m;
  if (cd) {
    m = overlay('<div class="cd-modal">' + candleSVG('big cd-live') + '</div><p class="eyebrow">Candle timer</p><div class="huge" id="cd-m-time">' + fmtClock(cdLeft(cd)) + '</div>' +
      '<p class="muted">of ' + Math.round(cd.total / 60000) + ' minutes. The candle burns down evenly until time is up.</p>' +
      '<p class="cd-acts"><button class="btn" id="cd-m-pp" type="button">' + (cd.paused ? 'Resume' : 'Pause') + '</button><button class="btn ghost" id="cd-m-add" type="button">+5 min</button><button class="btn ghost" id="cd-m-end" type="button">End timer</button></p>' +
      '<p class="cd-links"><button class="link" id="cd-m-x" type="button">Close</button>' + (G.candlePos && G.candlePos[cdMode()] ? '<button class="link" id="cd-m-home" type="button">Move the candle back to its corner</button>' : '') + '</p>' +
      '<p class="cd-tip">Tip: drag the candle anywhere on the screen.</p>', 'center');
    cdPaint(m.m, cdLeft(cd) / cd.total);
    m.m.querySelector('.cd-modal').classList.toggle('paused', !!cd.paused);
    m.m.querySelector('#cd-m-pp').addEventListener('click', function () { Snd.tap(); candlePause(); });
    m.m.querySelector('#cd-m-add').addEventListener('click', function () { Snd.tap(); candleAdd(5); m.close(); });
    m.m.querySelector('#cd-m-end').addEventListener('click', function () { m.close(); candleEnd(); });
    m.m.querySelector('#cd-m-x').addEventListener('click', m.close);
    var mh = m.m.querySelector('#cd-m-home'); if (mh) mh.addEventListener('click', function () { delete G.candlePos[cdMode()]; cdSave(); candlePlace(); m.close(); });
    m.m.querySelector('#cd-m-pp').focus();
    return;
  }
  var mins = G.candleMin || 25, PRE = [15, 25, 30, 45, 60, 90];
  m = overlay('<div class="cd-modal">' + candleSVG('big') + '</div><p class="eyebrow">Candle timer</p><h3>How long will you study?</h3>' +
    '<p class="muted">The candle burns down evenly and goes out when your time is up. It keeps burning while you move between courses.</p>' +
    '<div class="chips cd-pre">' + PRE.map(function (v) { return '<button class="tchip" type="button" data-min="' + v + '" aria-pressed="' + (v === mins) + '">' + v + ' min</button>'; }).join('') + '</div>' +
    '<div class="stepper"><button type="button" id="cd-mm" aria-label="5 minutes less">−</button><b class="timer" id="cd-mv">' + mins + ' min</b><button type="button" id="cd-mp" aria-label="5 minutes more">+</button></div>' +
    '<p class="cd-acts"><button class="btn" id="cd-go" type="button">' + candleIcon() + 'Light the candle</button></p>', 'center');
  function setMin(v) {
    mins = Math.max(5, Math.min(240, v)); G.candleMin = mins;
    m.m.querySelector('#cd-mv').textContent = mins + ' min';
    m.m.querySelectorAll('[data-min]').forEach(function (b) { b.setAttribute('aria-pressed', String(+b.getAttribute('data-min') === mins)); });
  }
  m.m.querySelectorAll('[data-min]').forEach(function (b) { b.addEventListener('click', function () { Snd.tap(); setMin(+b.getAttribute('data-min')); }); });
  m.m.querySelector('#cd-mm').addEventListener('click', function () { Snd.tap(); setMin(mins - 5); });
  m.m.querySelector('#cd-mp').addEventListener('click', function () { Snd.tap(); setMin(mins + 5); });
  m.m.querySelector('#cd-go').addEventListener('click', function () { Snd.init(); m.close(); candleStart(mins); });
  m.m.querySelector('#cd-go').focus();
}
/* on page load: carry on a running candle, or report one that ran out while the page was closed */
function candleBoot() {
  var cd = G.candle; if (!cd) return;
  if (!cd.paused && cdLeft(cd) <= 0) {
    var over = Date.now() - (cd.start + cd.pausedFor + cd.total);
    if (over > 6 * 3600e3) { G.candle = null; cdSave(); return; }
    setTimeout(candleDone, 400); return;
  }
  cdRun(); candleTick();
}

/* ---------- GYM (all courses) ---------- */
function showGym() {
  dropBars(); leaveQuestions(); clearTimer(); run = null; exam = null; CUR = null;
  touchDay();
  var tn = todayN(), list = sortedCourses();
  var next = list.filter(function (c) { var d = daysTo(c); return d != null && d >= 0; })[0];
  var cards = list.map(function (c) {
    var li = lvlInfo(c.S.xp, c), d = daysTo(c), m = Math.round(mastery(null, c) * 100), due = dueIds(coreQ(c), c).length, rec = infRec(c.id);
    return '<button class="course" type="button" data-course="' + c.id + '" style="--hue:var(--' + c.hue + ')"><span class="stripe" aria-hidden="true"></span><span class="cb">' +
      '<span class="r1"><span class="code">' + c.code + '</span><span class="cd' + (d != null && d >= 0 && d <= 3 ? ' soon' : '') + (d != null && d < 0 ? ' past' : '') + '">' + cdText(d) + '</span></span>' +
      '<span class="nm">' + c.name + ' · ' + c.exam.label + '</span>' +
      '<span class="r3"><span class="lv">Lv ' + li.L + ' · ' + li.title + '</span><span class="mbar" aria-hidden="true"><i style="width:' + m + '%"></i></span><span class="mono">' + m + '%</span>' +
      (due ? '<span class="badge">' + due + ' due</span>' : '') + (c.formula ? '<span class="badge sb">formula sheet</span>' : '') + '</span>' +
      '<span class="r4"><span>' + solidN(c) + ' of ' + coreQ(c).length + ' mastered</span>' + (c.gens ? '<span>+ ' + c.gens.length + ' question generators</span>' : '') + (rec.st ? '<span class="best">' + flame() + 'best streak ' + rec.st + '</span>' : '') + '</span></span></button>';
  }).join('');
  var mixRec = infRec('mix');
  app.innerHTML =
    '<header class="top"><div><p class="eyebrow">Fall 2026 · Midterm season</p><h1>Midterm Gym</h1></div>' + togglesHTML() + '</header>' +
    '<section class="stats" aria-label="Your stats">' +
      '<div class="stat"><span class="lab">Next exam</span>' + (next ? '<div class="next-n"><span class="hue-chip" style="--hue:var(--' + next.hue + ')"></span>' + next.code + ' ' + cdText(daysTo(next)) + '</div><div class="muted" style="font-size:.85rem;margin-top:.2rem">' + next.exam.label + '</div>' : '<div class="next-n">All done</div>') + '</div>' +
      '<div class="stat"><span class="lab">Streak</span><div class="big-n">' + G.streak + '<span class="muted" style="font-size:.8rem;font-family:var(--font-ui)"> day' + (G.streak === 1 ? '' : 's') + '</span></div></div>' +
      '<div class="stat"><span class="lab">Today</span>' + ringHTML(tn) + '</div>' +
    '</section>' +
    '<section class="cta"><button class="btn big inf" type="button" id="mix"><span class="bl">' + infIcon() + 'Infinite mix</span><small>' + (mixRec.st ? 'best streak ' + mixRec.st : 'sooner exams first') + '</small></button></section>' +
    '<section class="block"><h2>Your courses</h2><div class="courses">' + cards + '</div><p class="due-note" style="margin-top:.7rem">Sorted by exam date. The bar is your mastery. A question turns green only when it is 100% mastered: four right answers in a row. Any miss sends it back to red.</p></section>' +
    '<details class="how"><summary>How this works</summary><ul><li>You answer before you see anything. Pulling the answer out of your head is what builds memory.</li><li>Missed questions come back in the same run, then again after 8 hours, 1 day, 2 days and 4 days.</li><li>Smart runs mix topics, like the exam does. Tap a topic on a course page to drill just that topic.</li><li>Infinite mode never runs out. Generators write new versions of the calculation questions with fresh numbers each time.</li><li>The streak and the daily goal of ' + GOAL + ' questions count every course.</li><li>The formula sheet button sits at the top of every question for courses that have one.</li><li>On a keyboard: 1 to 5 picks an option, Enter checks or moves on, H opens a hint, F opens the formula sheet.</li></ul></details>' +
    '<div class="foot"><span>Progress saves in this browser.</span></div>';
  animateRing(tn);
  bindToggles();
  app.querySelectorAll('[data-course]').forEach(function (b) { b.addEventListener('click', function () { Snd.tap(); showHome(CBY[b.getAttribute('data-course')]); }); });
  document.getElementById('mix').addEventListener('click', function () { Snd.tap(); showInfIntro(true); });
  window.scrollTo(0, 0);
}

/* ---------- COURSE HOME ---------- */
function showHome(c) {
  if (c) CUR = c;
  dropBars(); leaveQuestions(); clearTimer(); run = null; exam = null;
  touchDay();
  var li = lvlInfo(CUR.S.xp), dueN = dueIds(coreQ()).length, newN = coreQ().filter(function (q) { return !CUR.S.q[q.id]; }).length, tn = todayN(), d = daysTo(CUR);
  var missed = CUR.Q.filter(function (q) { var r = CUR.S.q[q.id]; return r && r.b === 1; }), rec = infRec(CUR.id);
  var genBy = {}; (CUR.gens || []).forEach(function (g) { genBy[g.t] = (genBy[g.t] || 0) + 1; });
  var mapHTML = CUR.topics.map(function (t) {
    var qs = CUR.Q.filter(function (q) { return q.t === t.id; });
    var pips = qs.map(function (q) { var r = CUR.S.q[q.id]; return '<i class="pip p' + (r ? r.b : 0) + '"></i>'; }).join('');
    return '<button class="topic' + (t.extra ? ' extra' : '') + '" type="button" data-topic="' + t.id + '"><div class="row"><span class="sec">' + t.sec + '</span><span class="pct">' + Math.round(mastery(t.id) * 100) + '%</span></div><div class="tn">' + t.name + '</div>' +
      (t.extra ? '<div class="xt">' + t.extra + '</div>' : '') + '<div class="pips" aria-hidden="true">' + pips + (genBy[t.id] ? '<span class="gen-n" title="Question generators">+' + infIcon() + '</span>' : '') + '</div></button>';
  }).join('');
  var mockSub = CUR.mock.sections.map(function (s) { return (s.n || s.lps.length) + ' ' + s.short; }).join(' + ') + ', timed';
  app.innerHTML =
    '<button class="back" type="button" id="gym"><span aria-hidden="true">←</span> All courses</button>' +
    '<header class="top"><div><p class="eyebrow"><span class="hue-chip" style="--hue:var(--' + CUR.hue + ')"></span>' + CUR.scope + ' · Midterm ' + cdText(d) + '</p><h1>' + CUR.code + '</h1><p class="sub">' + CUR.name + ' · ' + CUR.exam.label + '</p></div>' + togglesHTML() + '</header>' +
    '<section class="stats" aria-label="Your stats">' +
      '<div class="stat"><span class="lab">Level</span><div class="lvl"><b>' + li.L + '</b><span>' + li.title + '</span></div><div class="xpbar" aria-label="' + li.rem + ' of ' + li.need + ' XP"><i id="xpfill"></i></div><div class="muted mono" style="font-size:.72rem;margin-top:.3rem">' + li.rem + ' / ' + li.need + ' XP</div></div>' +
      '<div class="stat"><span class="lab">Streak</span><div class="big-n">' + G.streak + '<span class="muted" style="font-size:.8rem;font-family:var(--font-ui)"> day' + (G.streak === 1 ? '' : 's') + '</span></div></div>' +
      '<div class="stat"><span class="lab">Today</span>' + ringHTML(tn) + '</div>' +
    '</section>' +
    '<section class="cta"><button class="btn big" type="button" data-act="smart">Start smart run <small>10 questions</small></button>' +
      '<p class="due-note">' + (dueN ? '<b>' + dueN + ' due for review</b> go first, then new questions from your weakest topics.' : (newN ? 'Nothing due. You get new questions from your weakest topics.' : 'Everything is on a review schedule. Mixed practice from all topics.')) + '</p>' +
      '<button class="btn big inf" type="button" data-act="inf"><span class="bl">' + infIcon() + 'Infinite mode</span><small>' + (rec.st || rec.lv ? 'best streak ' + rec.st + (rec.lv ? ' · 3-lives best ' + rec.lv : '') : 'endless or 3 lives') + '</small></button>' +
      (missed.length ? '<button class="btn ghost big fix" type="button" data-act="fix"><span>Fix my mistakes</span><small class="muted">' + missed.length + ' missed last time</small></button>' : '') +
      '<div class="cta2' + (CUR.formula ? '' : ' one') + '"><button class="btn ghost" type="button" data-act="mock">Mock midterm<small class="muted">' + mockSub + '</small></button>' +
      (CUR.formula ? '<button class="btn ghost" type="button" data-act="formula">Formula sheet<small class="muted">' + (CUR.formula.sub || (CUR.formula.kind === 'img' ? 'The real sheet, ' + CUR.formula.pages.length + ' page' + (CUR.formula.pages.length > 1 ? 's' : '') : 'What you get on the exam')) + '</small></button>' : '') +
      (CUR.progs ? '<button class="btn ghost aidb codeb" type="button" data-act="code"><span class="bl">' + codeIcon() + 'Write the code</span><small class="muted">' + CUR.progs.length + ' full programs like the real midterm, ' + (codeHasClaude() ? 'marked by Claude' : 'with a rubric and model solution') + codeBestNote() + '</small></button>' : '') +
      (CUR.aid ? '<button class="btn ghost aidb" type="button" data-act="aid"><span class="bl">' + sheetIcon() + CUR.aid.title + '</span><small class="muted">Two sides, ready to print. Also in the Formulas panel while you practise.</small></button>' : '') + '</div></section>' +
    '<section class="block"><h2>Topic map</h2><div class="map">' + mapHTML + '</div><p class="due-note" style="margin-top:.6rem">Each square is a question: grey is unseen, red is missed, amber is in progress (darker as it gets closer), and green is 100% mastered. +∞ means the topic also has generators that write fresh versions in infinite mode. Tap a topic to drill it.</p></section>' +
    '<details class="how"><summary>How this course works</summary><ul>' + (CUR.how || []).map(function (x) { return '<li>' + x + '</li>'; }).join('') + '<li>Missed questions come back within the same run, then again after 8 hours, 1 day, 2 days and 4 days.</li></ul></details>' +
    '<div class="foot"><span>' + CUR.Q.length + ' questions · progress saves in this browser.</span><button class="link" type="button" data-act="reset">Reset ' + CUR.code + ' progress</button></div>';
  requestAnimationFrame(function () { requestAnimationFrame(function () {
    var xf = document.getElementById('xpfill'); if (xf) xf.style.width = Math.round(100 * li.rem / li.need) + '%';
  }); });
  animateRing(tn);
  bindToggles();
  document.getElementById('gym').addEventListener('click', function () { Snd.tap(); showGym(); });
  app.querySelectorAll('[data-topic]').forEach(function (b) { b.addEventListener('click', function () { Snd.tap(); startRun(pickSmart(10, b.getAttribute('data-topic')), 'drill'); }); });
  app.querySelector('[data-act="smart"]').addEventListener('click', function () { Snd.tap(); startRun(pickSmart(10), 'smart'); });
  app.querySelector('[data-act="mock"]').addEventListener('click', function () { Snd.tap(); showMockIntro(); });
  app.querySelector('[data-act="inf"]').addEventListener('click', function () { Snd.tap(); showInfIntro(false); });
  var fx = app.querySelector('[data-act="fix"]');
  if (fx) fx.addEventListener('click', function () { Snd.tap(); startRun(spread(shuffle(missed)).slice(0, 10).map(function (q) { return q.id; }), 'fix'); });
  var fb = app.querySelector('[data-act="formula"]'); if (fb) fb.addEventListener('click', showFormula);
  var ab = app.querySelector('[data-act="aid"]'); if (ab) ab.addEventListener('click', function () { Snd.tap(); showAid(); });
  var cwb = app.querySelector('[data-act="code"]'); if (cwb) cwb.addEventListener('click', function () { Snd.tap(); showCodeList(); });
  var rs = app.querySelector('[data-act="reset"]');
  rs.addEventListener('click', function () {
    if (Date.now() - resetArm < 3000) { CUR.S = { xp: 0, q: {} }; save(); resetArm = 0; showHome(); }
    else { resetArm = Date.now(); rs.textContent = 'Tap again to erase ' + CUR.code + ' progress'; setTimeout(function () { if (rs.isConnected) rs.textContent = 'Reset ' + CUR.code + ' progress'; }, 3000); }
  });
  window.scrollTo(0, 0);
}
function formulaBody(F) {
  if (F.kind === 'img') return '<p class="sheet-note">Tap a page to zoom in.</p>' +
    F.pages.map(function (p) { return '<div class="sheet"><img src="' + p.src + '" alt="' + p.alt + '" width="' + p.w + '" height="' + p.h + '" loading="lazy"></div>'; }).join('');
  return '<div class="fs">' + F.items.map(function (f) { return '<h4>' + f[0] + '</h4><div>' + fmt(f[1]) + '</div>'; }).join('') + '</div>';
}
function bindZoom(root) { root.querySelectorAll('.sheet').forEach(function (s) { s.addEventListener('click', function () { s.classList.toggle('zoom'); }); }); }
/* full-screen view, used from the course page */
function showFormula() {
  var F = CUR.formula;
  var html = '<div class="mhead"><div><h3>' + F.title + '</h3>' + (F.note ? '<p class="sheet-note">' + F.note + '</p>' : '') + '</div><button class="btn ghost" id="f-x" type="button">Close</button></div>' + formulaBody(F);
  var m = overlay(html, 'wide');
  m.m.querySelector('#f-x').addEventListener('click', m.close);
  bindZoom(m.m);
  m.m.querySelector('#f-x').focus();
}
/* your own aid sheet: the same content as the printable page, reflowed for the screen */
function aidActs(A) {
  return '<div class="aid-acts"><a class="btn ghost" href="' + A.page + '" target="_blank" rel="noopener">Open printable page</a>' +
    '<button class="btn ghost" type="button" id="aid-pdf">Download PDF</button></div>';
}
/* The artifact viewer only hands files over through its downloads capability; anywhere else a plain link works. */
function aidDownloads() { return window.claude && window.claude.use ? window.claude.use('downloads').catch(function () { return null; }) : Promise.resolve(undefined); }
function bindAidPdf(root, A) {
  var btn = root.querySelector('#aid-pdf'); if (!btn) return;
  var dlp = aidDownloads(), label = btn.textContent;
  dlp.then(function (dl) { if (dl === null && btn.isConnected) btn.hidden = true; });
  function say(t) { btn.textContent = t; btn.disabled = false; setTimeout(function () { if (btn.isConnected) btn.textContent = label; }, 2600); }
  btn.addEventListener('click', function () {
    Snd.tap(); btn.disabled = true; btn.textContent = 'Preparing…';
    dlp.then(function (dl) {
      if (dl === undefined) {
        var a = document.createElement('a'); a.href = A.pdf; a.download = A.file;
        document.body.appendChild(a); a.click(); a.remove(); btn.disabled = false; btn.textContent = label; return;
      }
      if (!dl) { btn.hidden = true; return; }
      return fetch(A.pdf).then(function (r) { if (!r.ok) throw new Error('fetch'); return r.blob(); })
        .then(function (b) { return dl.save({ filename: A.file, data: b }); })
        .then(function () { say('Saved'); }, function (e) {
          if (e && e.code === 'declined') { btn.disabled = false; btn.textContent = label; }
          else if (e && /unavailable|not_granted|capability_/.test(e.code || '')) btn.hidden = true;
          else say(e && e.code === 'rate_limited' ? 'One moment, try again' : 'Could not save');
        });
    }).catch(function () { say('Could not save'); });
  });
}
/* versions: the write-out sheet (copy by hand, Unit 2 focus) and the full typed sheet */
var aidVer = 'w';
function aidVers(A) {
  var full = { k: 'f', label: 'Full typed sheet', note: A.note, page: A.page, pdf: A.pdf, html: A.html, file: 'CHE102-aid-sheet.pdf' };
  if (!A.write) return [full];
  return [{ k: 'w', label: A.write.label, note: 'Two sides built to copy by hand, focused on the last five topics: ideal gas law and pressure, gas mixtures and reacting gases, kinetic theory and real gases, formulas, solutions. Copy it box by box; grey notes say why.', page: A.write.page, pdf: A.write.pdf, html: A.write.html, file: 'CHE102-write-out-sheet.pdf' }].concat(A.back ? [{ k: 'b', label: A.back.label, note: 'One page for the back of your sheet: long-answer setups and a true/false bank from the 2016–2019 midterms.', page: A.back.page, pdf: A.back.pdf, html: A.back.html, file: 'CHE102-back-page.pdf' }] : [], [full]);
}
function aidCur(A) { var vs = aidVers(A); return vs.filter(function (v) { return v.k === aidVer; })[0] || vs[0]; }
function showAid() {
  var A = CUR.aid, vs = aidVers(A), first = true;
  var m = overlay('', 'wide');
  function paint() {
    var V = aidCur(A);
    m.m.innerHTML = '<div class="mhead"><div><h3>' + A.title + '</h3><p class="sheet-note">' + V.note + '</p></div><button class="btn ghost" id="a-x" type="button">Close</button></div>' +
      (vs.length > 1 ? '<div class="aid-ver" role="tablist">' + vs.map(function (v) { return '<button type="button" role="tab" data-v="' + v.k + '" aria-selected="' + (v.k === V.k) + '">' + v.label + '</button>'; }).join('') + '</div>' : '') +
      aidActs(V) + '<div class="aid">' + V.html + '</div>';
    m.m.querySelector('#a-x').addEventListener('click', m.close);
    m.m.querySelectorAll('.aid-ver button').forEach(function (b) {
      b.addEventListener('click', function () { if (b.getAttribute('data-v') === aidVer) return; Snd.tap(); aidVer = b.getAttribute('data-v'); paint(); m.m.scrollTop = 0; var t = m.m.querySelector('.aid-ver [aria-selected="true"]'); if (t) t.focus(); });
    });
    bindAidPdf(m.m, V);
    if (first) { m.m.querySelector('#a-x').focus(); first = false; }
    if (dockWant) syncDock();
  }
  paint();
}
/* docked view, used while answering: a side panel on wide screens, a bottom sheet on phones.
   It does not block the question, and it stays open from one question to the next. */
var dockWant = false, dockFor = null, dockBig = false, dockTab = 'f';
function openDock() { dockWant = true; syncDock(); }
function closeDock() { dockWant = false; syncDock(); }
function toggleDock() { Snd.tap(); if (dockWant) closeDock(); else openDock(); }
function syncDock() {
  var root = document.documentElement, el = document.getElementById('dock');
  var bar = document.querySelector('.bar');
  root.style.setProperty('--barh', (bar ? bar.offsetHeight : 0) + 'px');
  var show = dockWant && CUR && CUR.formula;
  var fb = document.getElementById('fs'); if (fb) fb.setAttribute('aria-pressed', String(!!show));
  if (!show) { if (el) el.remove(); dockFor = null; root.classList.remove('docked'); return; }
  root.classList.add('docked');
  var tab = CUR.aid && dockTab === 'a' ? 'a' : 'f', AV = CUR.aid ? aidCur(CUR.aid) : null;
  if (el && dockFor === CUR.id + tab + (AV ? AV.k : '')) return;
  if (el) el.remove();
  var F = CUR.formula;
  el = h('aside', 'dock' + (dockBig ? ' big' : ''));
  el.id = 'dock'; el.setAttribute('aria-label', tab === 'a' ? CUR.aid.title : F.title);
  var head = CUR.aid ? '<div class="dtabs" role="tablist"><button type="button" role="tab" data-t="f" aria-selected="' + (tab === 'f') + '">Data sheet</button><button type="button" role="tab" data-t="a" aria-selected="' + (tab === 'a') + '">Aid sheet</button></div>' : '<b>' + F.title + '</b>';
  el.innerHTML = '<div class="dh">' + head + '<button class="x dsz" type="button" id="dock-sz">' + (dockBig ? 'Smaller' : 'Bigger') + '</button><button class="x" type="button" id="dock-x" aria-label="Close formula sheet">Close</button></div><div class="db">' + (tab === 'a' ? '<div class="aid">' + AV.html + '</div>' : formulaBody(F)) + '</div>';
  document.body.appendChild(el);
  dockFor = CUR.id + tab + (AV ? AV.k : '');
  bindZoom(el);
  el.querySelectorAll('.dtabs button').forEach(function (b) {
    b.addEventListener('click', function () { if (b.getAttribute('data-t') === tab) return; Snd.tap(); dockTab = b.getAttribute('data-t'); syncDock(); });
  });
  el.querySelector('#dock-x').addEventListener('click', function () { Snd.tap(); closeDock(); });
  el.querySelector('#dock-sz').addEventListener('click', function () {
    Snd.tap(); dockBig = !dockBig; el.classList.toggle('big', dockBig); this.textContent = dockBig ? 'Smaller' : 'Bigger';
  });
}

/* ============================================================
   WRITE THE CODE: whole programs typed in an editor and marked by Claude
   (sample capability). Without Claude, the viewer marks it against the rubric.
   ============================================================ */
function codeHasClaude() { return !!(window.claude && window.claude.use); }
function codeIcon() { return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.5 7 3.5 12l5 5 M15.5 7l5 5-5 5 M13.5 4.5l-3 15"/></svg>'; }
function codeRec(pid) { var o = CUR.S.code || (CUR.S.code = {}); return o[pid] || (o[pid] = { best: null, last: null, tries: 0, draft: null }); }
function codeBestNote() {
  var o = CUR.S.code || {}, done = (CUR.progs || []).filter(function (p) { return o[p.id] && o[p.id].best != null; });
  return done.length ? ' · ' + done.length + ' of ' + CUR.progs.length + ' marked' : '';
}
var codeSampleP = null;
function codeSample() {
  if (!codeSampleP) codeSampleP = window.claude && window.claude.use ? window.claude.use('sample').catch(function () { return null; }) : Promise.resolve(null);
  return codeSampleP;
}
var codeOff = false; /* set when the viewer declined or Claude is unavailable in this view */
function codeStarter(p) {
  return p.vex ? '#include "vex.h"\nusing namespace vex;\n\n// rotateRobot(angle, speed) is given\n\nint main()\n{\n    configureAllSensors();\n    \n    return 0;\n}\n'
    : '#include <iostream>\nusing namespace std;\n\nint main()\n{\n    \n    return 0;\n}\n';
}
function showCodeList() {
  dropBars(); leaveQuestions();
  var o = CUR.S.code || {};
  app.innerHTML = '<button class="back" type="button" id="cw-home"><span aria-hidden="true">←</span> ' + CUR.code + '</button>' +
    '<header class="top"><div><p class="eyebrow">Separate section · not part of mastery</p><h1>Write the code</h1><p class="sub">Whole programs, written the way the real midterm asks. ' + (codeHasClaude() ? 'Type your answer, then Claude marks it out of 10 against a rubric and traces it on test files.' : 'Type your answer, then mark it out of 10 against the rubric, with the model solution beside it.') + '</p></div></header>' +
    '<section class="cw-list">' + CUR.progs.map(function (p) {
      var r = o[p.id], st = r && r.best != null ? '<span class="cw-score' + (r.best >= 8 ? ' good' : '') + '">Best ' + r.best + '/10</span>' : (r && r.draft ? '<span class="cw-score">Draft saved</span>' : '<span class="cw-score muted">Not tried</span>');
      return '<button class="cw-item" type="button" data-p="' + p.id + '"><div class="cw-it"><b>' + p.title + '</b>' + st + '</div><div class="muted cw-tags">' + p.tags + ' · about ' + p.mins + ' min</div></button>';
    }).join('') + '</section>' +
    '<p class="due-note">' + (codeHasClaude() ? 'Claude checks your code the way a TA would: does it compile, what does it print on each test, and where does it lose marks. The first check asks you to allow Claude for this page.' : 'Opened inside Claude, this section has Claude mark your code like a TA. Here you mark it yourself against the rubric.') + ' Drafts save as you type.</p>';
  document.getElementById('cw-home').addEventListener('click', function () { Snd.tap(); showHome(); });
  app.querySelectorAll('[data-p]').forEach(function (b) { b.addEventListener('click', function () { Snd.tap(); showCodeProblem(CUR.progs.filter(function (p) { return p.id === b.getAttribute('data-p'); })[0]); }); });
  window.scrollTo(0, 0);
}
function testHTML(t) {
  var h1 = '';
  (t.files || []).forEach(function (f) { h1 += '<div class="cw-io"><span class="cw-lab">' + esc(f[0]) + '</span><pre>' + (f[1] ? esc(f[1]) : '<i>(empty file)</i>') + '</pre></div>'; });
  if (t.input) h1 += '<div class="cw-io"><span class="cw-lab">Keyboard input</span><pre>' + esc(t.input) + '</pre></div>';
  h1 += '<div class="cw-io"><span class="cw-lab">Expected output</span><pre>' + esc(t.out) + '</pre></div>';
  return h1;
}
function showCodeProblem(p) {
  dropBars(); leaveQuestions();
  var rec = codeRec(p.id), self = !codeHasClaude(), shown = p.tests.filter(function (t) { return t.show || self; }), hidden = p.tests.filter(function (t) { return !t.show && !self; });
  app.innerHTML = '<button class="back" type="button" id="cw-back"><span aria-hidden="true">←</span> All programs</button>' +
    '<section class="cw"><p class="eyebrow">' + CUR.code + ' · Write the code · about ' + p.mins + ' min</p><h1>' + p.title + '</h1>' +
    '<div class="cw-spec" id="cw-spec">' + p.q + '</div>' +
    shown.map(function (t) { return '<div class="cw-sample"><span class="cw-h">' + esc(t.name) + '</span>' + testHTML(t) + '</div>'; }).join('') +
    (hidden.length ? '<p class="muted cw-also">Claude also tests: ' + hidden.map(function (t) { return esc(t.name.toLowerCase()); }).join('; ') + '.</p>' : '') +
    '<details class="cw-rub"><summary>What earns the marks (' + p.rubric.length + ' items, 10 marks)</summary><ul>' + p.rubric.map(function (r) { return '<li><b>' + r[0] + '</b> ' + esc(r[1]) + '</li>'; }).join('') + '</ul></details>' +
    '<label class="cw-edlab" for="cw-ed">Your program</label>' +
    '<textarea id="cw-ed" class="cw-ed" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" wrap="off" rows="20"></textarea>' +
    '<div class="cw-acts"><button class="btn" type="button" id="cw-check">' + (codeHasClaude() ? 'Check with Claude' : 'Mark it myself') + '</button><button class="btn ghost" type="button" id="cw-model">Show model solution</button><button class="link" type="button" id="cw-reset">Start over</button></div>' +
    '<div id="cw-out" aria-live="polite"></div><div id="cw-modelbox"></div></section>';
  var ed = document.getElementById('cw-ed'), out = document.getElementById('cw-out'), chk = document.getElementById('cw-check');
  ed.value = rec.draft != null ? rec.draft : codeStarter(p);
  var tmr = null;
  ed.addEventListener('input', function () { clearTimeout(tmr); tmr = setTimeout(function () { codeRec(p.id).draft = ed.value; save(); }, 400); });
  ed.addEventListener('keydown', function (e) {
    if (e.key === 'Tab' && !e.shiftKey) { e.preventDefault(); edInsert(ed, '    '); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      var before = ed.value.slice(0, ed.selectionStart), line = before.slice(before.lastIndexOf('\n') + 1), ind = line.match(/^ */)[0];
      if (/[{]\s*$/.test(line)) ind += '    ';
      edInsert(ed, '\n' + ind);
    } else if (e.key === '}') {
      var b2 = ed.value.slice(0, ed.selectionStart), ln = b2.slice(b2.lastIndexOf('\n') + 1);
      if (/^ {4,}$/.test(ln)) { e.preventDefault(); ed.setRangeText('}', ed.selectionStart - 4, ed.selectionStart, 'end'); ed.dispatchEvent(new Event('input')); }
    }
  });
  document.getElementById('cw-back').addEventListener('click', function () { Snd.tap(); codeRec(p.id).draft = ed.value; save(); showCodeList(); });
  document.getElementById('cw-reset').addEventListener('click', function () {
    var b = this;
    if (b._armed) { ed.value = codeStarter(p); codeRec(p.id).draft = null; save(); out.innerHTML = ''; b._armed = false; b.textContent = 'Start over'; }
    else { b._armed = true; b.textContent = 'Tap again to clear your code'; setTimeout(function () { if (b.isConnected) { b._armed = false; b.textContent = 'Start over'; } }, 2500); }
  });
  document.getElementById('cw-model').addEventListener('click', function () {
    Snd.tap(); var box = document.getElementById('cw-modelbox');
    box.innerHTML = box.innerHTML ? '' : '<div class="cw-res"><span class="cw-h">Model solution</span><p class="muted" style="margin:.2rem 0 .5rem">One correct way. Other correct programs earn full marks too.</p><pre class="cw-code">' + esc(p.model) + '</pre></div>';
    this.textContent = box.innerHTML ? 'Hide model solution' : 'Show model solution';
  });
  chk.addEventListener('click', function () { Snd.tap(); codeRec(p.id).draft = ed.value; save(); codeCheck(p, ed.value, out, chk); });
  codeSample().then(function (smp) { if (!smp && chk.isConnected) { codeOff = true; chk.textContent = 'Mark it myself'; } });
  if (codeOff) chk.textContent = 'Mark it myself';
  window.scrollTo(0, 0);
}
function edInsert(ed, t) { ed.setRangeText(t, ed.selectionStart, ed.selectionEnd, 'end'); ed.dispatchEvent(new Event('input')); }
function codePrompt(p, code) {
  var spec = document.getElementById('cw-spec'), specText = spec ? spec.innerText : '';
  var tests = p.tests.map(function (t, i) {
    var s = 'Test ' + (i + 1) + ': ' + t.name + '\n';
    (t.files || []).forEach(function (f) { s += 'File ' + f[0] + ' contains:\n' + (f[1] || '(empty)') + '\n'; });
    if (!(t.files || []).length && !t.input && /file/i.test(t.name)) s += 'The file does not exist.\n';
    if (t.input) s += 'Keyboard input: ' + t.input + '\n';
    s += 'Expected output:\n' + t.out + '\n';
    return s;
  }).join('\n');
  return 'You are a fair but careful TA marking a first-year engineering C++ midterm question (University of Waterloo, MTE 121, Digital Computation). ' +
    'Mark the student program the way a written exam is marked. It must be a complete program. ' + (p.vex ? 'It is VEXcode IQ C++: the names in the question (LeftMotor, RightMotor, TouchLED10, Distance7, configureAllSensors, wait, rotateRobot) exist and need no declaration, and #include "vex.h" with using namespace vex is the normal header. Do not take marks off for the header or for not defining rotateRobot. Trace what the robot does instead of program output.' : 'Assume it is compiled with g++ (C++11) and run in a folder where the test files exist as described.') +
    ' Minor style differences, extra blank lines and different variable names cost nothing. Prompts or output text that differ from the question cost marks only where the rubric mentions output.\n\n' +
    'QUESTION\n' + specText + '\n\nTESTS\n' + tests + '\nMARKING RUBRIC (10 marks total)\n' +
    p.rubric.map(function (r, i) { return (i + 1) + '. [' + r[0] + '] ' + r[1]; }).join('\n') +
    '\n\nREFERENCE SOLUTION (one correct approach)\n' + p.model + '\n\nSTUDENT PROGRAM\n' + code + '\n\n' +
    'First decide whether it compiles, then trace it carefully on every test. If it does not compile, give at most 5 marks, for the parts that are right. ' +
    'Reply with only one JSON object, no other text, in exactly this shape:\n' +
    '{"compiles": true, "compileNote": "", "tests": [{"name": "Sample file", "pass": true, "note": "what it prints or does if different, else empty"}], ' +
    '"rubric": [{"item": 1, "marks": 1, "of": 1, "note": "short reason"}], "score": 9, ' +
    '"fixes": ["most important fix first, at most 3, one sentence each, quoting the code involved"], "summary": "one or two sentences, specific and encouraging"}';
}
function codeCheck(p, code, out, chk) {
  if (!code.trim() || code.trim() === codeStarter(p).trim()) { out.innerHTML = '<div class="cw-note">Write your program in the box first.</div>'; return; }
  codeSample().then(function (smp) {
    if (!smp || codeOff) { codeOff = true; return codeSelf(p, out); }
    var ctl = new AbortController();
    chk.disabled = true;
    out.innerHTML = '<div class="cw-res cw-wait"><span class="cw-dot"></span><span>Claude is reading and tracing your program. This takes about half a minute.</span><button class="link" type="button" id="cw-stop">Stop</button></div>';
    document.getElementById('cw-stop').addEventListener('click', function () { ctl.abort(); });
    smp.json(codePrompt(p, code), { signal: ctl.signal, modelTier: 'default' }).then(function (r) {
      chk.disabled = false;
      if (!r || typeof r !== 'object' || typeof r.score !== 'number') { out.innerHTML = '<div class="cw-note">Claude\'s marking came back in a shape the page could not read. Try again.</div>'; return; }
      var sc = Math.max(0, Math.min(10, Math.round(r.score))), rec = codeRec(p.id);
      rec.tries++; rec.last = sc; rec.best = rec.best == null ? sc : Math.max(rec.best, sc); save();
      out.innerHTML = codeResHTML(r, sc);
      if (sc >= 8) { Snd.good(2); FX.burst(sc === 10 ? 80 : 30, 0.5, 0.4); } else if (sc >= 5) Snd.half(); else Snd.bad();
      var rs = out.querySelector('.cw-res'); if (rs && rs.scrollIntoView) rs.scrollIntoView({ block: 'start', behavior: reduced ? 'auto' : 'smooth' });
    }, function (e) {
      chk.disabled = false;
      var c = e && e.code;
      if (c === 'cancelled') { out.innerHTML = ''; return; }
      if (/not_granted|sampling_disabled|not_declared|capability_disabled|capability_removed/.test(c || '')) { codeOff = true; chk.textContent = 'Mark it myself'; out.innerHTML = '<div class="cw-note">Claude is not available for this page, so mark it yourself against the rubric.</div>'; return codeSelf(p, out, true); }
      out.innerHTML = '<div class="cw-note">' + (c === 'rate_limited' ? 'Too many checks right now. Wait a minute and try again.' : c === 'invalid_json' ? 'Claude\'s marking could not be read. Try again.' : c === 'session_expired' ? 'Your Claude session expired. Sign in again, then retry.' : 'The check did not finish. Try again.') + '</div>';
    });
  });
}
function codeResHTML(r, sc) {
  var tests = (r.tests || []).map(function (t) { return '<li class="' + (t.pass ? 'ok' : 'no') + '"><span class="cw-mk">' + (t.pass ? '✓' : '✗') + '</span><span><b>' + esc(t.name || 'Test') + '</b>' + (t.note ? ' · ' + esc(t.note) : '') + '</span></li>'; }).join('');
  var rub = (r.rubric || []).map(function (x) { var full = x.marks >= x.of; return '<tr class="' + (full ? 'ok' : (x.marks > 0 ? 'half' : 'no')) + '"><td class="cw-pts">' + esc(String(x.marks)) + '/' + esc(String(x.of)) + '</td><td>' + esc(x.note || '') + '</td></tr>'; }).join('');
  var fixes = (r.fixes || []).filter(Boolean).map(function (f) { return '<li>' + esc(f) + '</li>'; }).join('');
  return '<div class="cw-res"><div class="cw-top"><div class="cw-big' + (sc >= 8 ? ' good' : sc >= 5 ? ' mid' : ' low') + '">' + sc + '<span>/10</span></div><div><b>' + (r.compiles === false ? 'Would not compile' : 'Compiles') + '</b>' + (r.compileNote ? '<div class="muted">' + esc(r.compileNote) + '</div>' : '') + (r.summary ? '<p>' + esc(r.summary) + '</p>' : '') + '</div></div>' +
    (tests ? '<span class="cw-h">Tests</span><ul class="cw-tests">' + tests + '</ul>' : '') +
    (rub ? '<span class="cw-h">Rubric</span><table class="cw-rubt"><tbody>' + rub + '</tbody></table>' : '') +
    (fixes ? '<span class="cw-h">Fix first</span><ol class="cw-fix">' + fixes + '</ol>' : '') +
    '<p class="muted cw-disc">Claude traced your code by reading it, not by running it, so treat the score as a TA\'s estimate.</p></div>';
}
/* fallback: tick the rubric yourself, with the model solution beside it */
function codeSelf(p, out, keep) {
  var html = '<div class="cw-res"><span class="cw-h">Mark it yourself</span><p class="muted" style="margin:.2rem 0 .6rem">Compare with the model solution below and tick each item your program really does.</p>' +
    '<ul class="cw-self">' + p.rubric.map(function (r, i) { return '<li><label><input type="checkbox" data-i="' + i + '"> <b>' + r[0] + '</b> ' + esc(r[1]) + '</label></li>'; }).join('') + '</ul>' +
    '<button class="btn" type="button" id="cw-save">Save my mark</button><div id="cw-selfres"></div>' +
    '<span class="cw-h" style="margin-top:1rem">Model solution</span><pre class="cw-code">' + esc(p.model) + '</pre></div>';
  if (keep) out.insertAdjacentHTML('beforeend', html); else out.innerHTML = html;
  out.querySelector('#cw-save').addEventListener('click', function () {
    var sc = 0; out.querySelectorAll('.cw-self input').forEach(function (cb) { if (cb.checked) sc += p.rubric[+cb.getAttribute('data-i')][0]; });
    var rec = codeRec(p.id); rec.tries++; rec.last = sc; rec.best = rec.best == null ? sc : Math.max(rec.best, sc); save();
    out.querySelector('#cw-selfres').innerHTML = '<p><b>' + sc + '/10</b> saved.</p>';
    if (sc >= 8) Snd.good(1); else Snd.half();
  });
}

/* ---------- PRACTICE RUN ---------- */
function startRun(ids, kind) {
  Snd.init();
  run = { ids: ids.slice(), i: 0, res: [], combo: 0, best: 0, xp: 0, kind: kind, requeued: {}, firstTry: {} };
  runNext();
}
function runHud() {
  var pct = Math.round(100 * run.i / run.ids.length);
  return '<div class="hud"><button class="x" type="button" id="quit">Quit</button><div class="prog" role="progressbar" aria-label="Run progress" aria-valuenow="' + pct + '" aria-valuemin="0" aria-valuemax="100"><i id="progfill" style="width:' + pct + '%"></i></div>' +
    '<span class="chip' + (run.combo >= 3 ? ' hot' : '') + '" id="combo">' + flame() + '<span>×' + multOf(run.combo).toFixed(1) + '</span></span><span class="chip mono" id="xpchip">' + run.xp + ' XP</span>' + fsBtn() + '</div>';
}
/* ============================================================
   PROGRESS PANEL (computer only: wide screen with a mouse, see CSS).
   Course %, the current topic's %, and total XP, beside practice and
   infinite questions. Each answer animates the numbers from their old
   values. Not shown in the mock, which gives no feedback until the end.
   ============================================================ */
var SD = null, RING_C = 2 * Math.PI * 42;
function totalXP() { return COURSES.reduce(function (s, c) { return s + c.S.xp; }, 0); }
function fmtInt(n) { return Math.round(n).toLocaleString('en-CA'); }
function fmtPct(v) { return v.toFixed(1) + '%'; }
function topicSolid(c, tid) { var qs = c.Q.filter(function (q) { return q.t === tid; }); return [qs.filter(function (q) { var r = c.S.q[q.id]; return r && r.b >= 5; }).length, qs.length]; }
function tween(el, from, to, f, ms) {
  if (!el) return;
  if (el._raf) cancelAnimationFrame(el._raf);
  if (reduced || Math.abs(to - from) < 1e-9) { el.textContent = f(to); return; }
  var t0 = performance.now();
  (function step(now) { var p = Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - p, 3); el.textContent = f(from + (to - from) * e); if (p < 1) el._raf = requestAnimationFrame(step); })(t0);
}
function reflash(el, cls) { if (!el || reduced) return; el.classList.remove('fl-good', 'fl-bad', 'fl-part', 'fl-swap', 'n-up', 'n-down', 'bump'); void el.offsetWidth; el.classList.add(cls); }
function sdFloat(host, text, cls) { if (reduced || !host) return; var d = h('span', 'sd-delta ' + cls, text); host.appendChild(d); setTimeout(function () { d.remove(); }, 1300); }
function noTr(el, fn) { el.classList.add('no-tr'); fn(); void el.offsetWidth; el.classList.remove('no-tr'); }
function ringSet(cp) { var f = document.getElementById('sd-cfg'); if (!f) return; f.style.strokeDashoffset = RING_C * (1 - cp / 100); f.style.opacity = cp > 0.05 ? 1 : 0; }
function sdSet(id, v) { var e = document.getElementById(id); if (e) e.textContent = v; return e; }
function sideShell() {
  var el = h('aside', 'side');
  el.id = 'side'; el.setAttribute('aria-label', 'Your progress');
  el.innerHTML =
    '<div class="sd-head"><span class="hue-chip"></span><b id="sd-code"></b><span id="sd-name"></span></div>' +
    '<section class="sd-card" id="sd-c"><span class="lab">Course progress</span>' +
      '<div class="sd-ringwrap"><svg class="sd-ring" viewBox="0 0 100 100" aria-hidden="true"><circle class="bg" cx="50" cy="50" r="42"/><circle class="fg" id="sd-cfg" cx="50" cy="50" r="42" stroke-dasharray="' + RING_C + '" stroke-dashoffset="' + RING_C + '"/></svg>' +
      '<div class="sd-rn"><b id="sd-cn">0.0%</b><small>mastered</small></div></div>' +
      '<div class="sd-sub" id="sd-cs"></div></section>' +
    '<section class="sd-card" id="sd-t"><span class="lab">This topic</span>' +
      '<div class="sd-tn" id="sd-tn"></div>' +
      '<div class="sd-row"><b class="sd-pct" id="sd-tp">0.0%</b><span class="sd-sub" id="sd-ts"></span></div>' +
      '<div class="sd-bar" aria-hidden="true"><i id="sd-tb"></i></div>' +
      '<div class="pips sd-pips" id="sd-pips" aria-hidden="true"></div>' +
      '<div class="sd-dots" id="sd-dots"></div>' +
      '<p class="sd-note" id="sd-gen" hidden>Fresh-numbers question: it earns XP, but mastery only counts the written questions.</p></section>' +
    '<section class="sd-card" id="sd-x"><span class="lab">Total XP</span>' +
      '<div class="sd-big" id="sd-xn">0</div>' +
      '<div class="sd-sub" id="sd-xl"></div>' +
      '<div class="xpbar" aria-hidden="true"><i id="sd-xb"></i></div>' +
      '<div class="sd-sub mono" id="sd-xr"></div></section>' +
    '<div class="sd-foot" id="sd-sess"></div>';
  document.body.appendChild(el);
  return el;
}
function sdCourseText(c) { var li = lvlInfo(c.S.xp, c); sdSet('sd-xl', c.code + ' · Lv ' + li.L + ' · ' + li.title); sdSet('sd-xr', li.rem + ' / ' + li.need + ' XP to level ' + (li.L + 1)); return li; }
function sdPips(c, tid, cur) {
  var box = document.getElementById('sd-pips'); if (!box) return;
  box.innerHTML = c.Q.filter(function (q) { return q.t === tid; }).map(function (q) {
    var r = c.S.q[q.id]; return '<i class="pip p' + (r ? r.b : 0) + (q.id === cur ? ' cur' : '') + '" data-q="' + q.id + '"></i>';
  }).join('');
}
function sdDots(key) {
  var box = document.getElementById('sd-dots'); if (!box) return;
  var list = SD.recent[key] || [];
  box.innerHTML = list.length ? '<span>This session</span>' + list.map(function (r) { return '<i class="' + r + '"></i>'; }).join('') : '';
}
function sdSess() { sdSet('sd-sess', SD.sess.n ? 'This session: ' + SD.sess.ok + ' of ' + SD.sess.n + ' right' : 'This session: nothing answered yet'); }
/* called each time a practice or infinite question appears */
function sideShow(q, gen) {
  if (!SD || SD.run !== run) SD = { run: run, recent: {}, sess: { n: 0, ok: 0 }, el: SD && SD.el };
  if (!SD.el || !SD.el.isConnected) { SD.el = sideShell(); SD.cid = null; SD.tkey = null; }
  document.documentElement.classList.add('side-on');
  var c = CUR, el = SD.el, cp = mastery(null, c) * 100, tp = mastery(q.t, c) * 100, xp = totalXP(), tkey = c.id + '|' + q.t;
  if (SD.cid !== c.id) {
    el.style.setProperty('--hue', 'var(--' + c.hue + ')');
    sdSet('sd-code', c.code); sdSet('sd-name', c.name);
    noTr(el, function () {
      ringSet(cp);
      document.getElementById('sd-xb').style.width = Math.round(100 * lvlInfo(c.S.xp, c).rem / lvlInfo(c.S.xp, c).need) + '%';
    });
    sdSet('sd-cn', fmtPct(cp));
    if (SD.cid) reflash(el.querySelector('.sd-head'), 'fl-swap');
    SD.cid = c.id;
  }
  var cs = solidN(c); sdSet('sd-cs', cs + ' of ' + coreQ(c).length + ' questions mastered');
  if (SD.tkey !== tkey) {
    sdSet('sd-tn', c.TBY[q.t].name + (c.TBY[q.t].extra ? ' (bonus)' : ''));
    noTr(el, function () { document.getElementById('sd-tb').style.width = tp + '%'; });
    sdSet('sd-tp', fmtPct(tp));
    sdDots(tkey);
    if (SD.tkey) reflash(document.getElementById('sd-t'), 'fl-swap');
    SD.tkey = tkey;
  }
  var ts = topicSolid(c, q.t); sdSet('sd-ts', ts[0] + ' of ' + ts[1] + ' mastered');
  sdPips(c, q.t, gen ? null : q.id);
  document.getElementById('sd-gen').hidden = !gen;
  sdCourseText(c);
  sdSet('sd-xn', fmtInt(xp));
  sdSess();
  SD.disp = { course: cp, topic: tp, xp: xp, cxp: c.S.xp };
}
/* called right after an answer has been graded, recorded and its XP added */
function sideAfter(q, res, gain, gen) {
  if (!SD || !SD.el || !SD.el.isConnected || !SD.disp) return;
  var c = CUR, d = SD.disp, cp = mastery(null, c) * 100, tp = mastery(q.t, c) * 100, xp = totalXP();
  var tone = res.ok ? 'fl-good' : res.frac > 0 ? 'fl-part' : 'fl-bad';
  /* course */
  var cCard = document.getElementById('sd-c'), cNum = document.getElementById('sd-cn'), dc = cp - d.course;
  tween(cNum, d.course, cp, fmtPct, 900);
  ringSet(cp);
  reflash(cCard, tone);
  if (Math.abs(dc) >= 0.05) { sdFloat(cCard, (dc > 0 ? '+' : '−') + Math.abs(dc).toFixed(1) + '%', dc > 0 ? 'up' : 'down'); reflash(cNum, dc > 0 ? 'n-up' : 'n-down'); }
  sdSet('sd-cs', solidN(c) + ' of ' + coreQ(c).length + ' questions mastered');
  /* topic */
  var tCard = document.getElementById('sd-t'), tNum = document.getElementById('sd-tp'), dt = tp - d.topic;
  tween(tNum, d.topic, tp, fmtPct, 900);
  document.getElementById('sd-tb').style.width = tp + '%';
  reflash(tCard, tone);
  if (Math.abs(dt) >= 0.05) { sdFloat(tCard, (dt > 0 ? '+' : '−') + Math.abs(dt).toFixed(1) + '%', dt > 0 ? 'up' : 'down'); reflash(tNum, dt > 0 ? 'n-up' : 'n-down'); }
  var ts = topicSolid(c, q.t); sdSet('sd-ts', ts[0] + ' of ' + ts[1] + ' mastered');
  if (!gen) {
    var pip = SD.el.querySelector('.sd-pips [data-q="' + q.id + '"]'), r = c.S.q[q.id];
    if (pip && r) { pip.className = 'pip p' + r.b + ' cur'; reflash(pip, 'bump'); }
  }
  var key = c.id + '|' + q.t, list = SD.recent[key] || (SD.recent[key] = []);
  list.push(res.ok ? 'g' : res.frac > 0 ? 'p' : 'b'); if (list.length > 14) list.shift();
  sdDots(key);
  var dots = SD.el.querySelectorAll('.sd-dots i'); if (dots.length && !reduced) dots[dots.length - 1].classList.add('new');
  /* XP */
  var xCard = document.getElementById('sd-x'), before = lvlInfo(d.cxp, c), li = sdCourseText(c), xb = document.getElementById('sd-xb');
  tween(document.getElementById('sd-xn'), d.xp, xp, fmtInt, 900);
  if (gain) { sdFloat(xCard, '+' + gain + ' XP', 'xp'); reflash(xCard, 'fl-good'); }
  if (li.L > before.L && !reduced) {
    xb.style.width = '100%';
    setTimeout(function () { if (xb.isConnected) { noTr(xb.parentNode, function () { xb.style.width = '0%'; }); xb.style.width = Math.round(100 * li.rem / li.need) + '%'; } }, 700);
  } else xb.style.width = Math.round(100 * li.rem / li.need) + '%';
  /* session */
  SD.sess.n++; if (res.ok) SD.sess.ok++; sdSess();
  SD.disp = { course: cp, topic: tp, xp: xp, cxp: c.S.xp };
}
function sideHide() { if (SD && SD.el) { SD.el.remove(); SD.el = null; } document.documentElement.classList.remove('side-on'); }
function leaveQuestions() { closeDock(); sideHide(); }

/* formula sheet button for any screen with a question on it (practice, infinite, mock) */
function sheetIcon() { return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 2.8h8.2L19 7.6v13.6H6z M14 2.8v5h5 M9 12h7 M9 15.5h7 M9 19h4.5"/></svg>'; }
function fsBtn() { return CUR && CUR.formula ? '<button class="x fsb" type="button" id="fs" aria-label="Formula sheet" aria-pressed="' + dockWant + '" title="Formula sheet (F)">' + sheetIcon() + '<span>Formulas</span></button>' : ''; }
function bindFs() { var b = document.getElementById('fs'); if (b) b.addEventListener('click', toggleDock); syncDock(); }
function runNext() {
  if (run.i >= run.ids.length) return finishRun();
  var q = CUR.QBY[run.ids[run.i]], st = {}, answered = false;
  run.seenOnce = run.seenOnce || {};
  var isRetry = !!run.seenOnce[q.id];
  run.seenOnce[q.id] = true;
  app.innerHTML = runHud() + '<div class="stage" id="stage"></div>';
  var card = qCard(q, { mode: 'practice', state: st, uid: 'r' + run.i, onAuto: function () { submit(false); } });
  document.getElementById('stage').appendChild(card.el);
  if (isRetry) card.el.querySelector('.qmeta').insertAdjacentHTML('beforeend', '<span class="tag" style="background:var(--gold-soft);color:var(--ink)">Second chance</span>');
  var bar = h('div', 'bar'), inner = h('div', 'in');
  var stuck = h('button', 'link', 'Stuck? Show answer'); stuck.type = 'button';
  var main = h('button', 'btn wide', q.type === 'mc' ? 'Pick an answer' : 'Check'); main.type = 'button'; main.disabled = true;
  if (q.type === 'mc') stuck.hidden = true;
  inner.appendChild(stuck); inner.appendChild(main); bar.appendChild(inner); document.body.appendChild(bar);
  function cleanup() { if (bar.parentNode) bar.parentNode.removeChild(bar); }
  var q0 = document.getElementById('quit'), qArm = 0;
  q0.addEventListener('click', function () {
    if (Date.now() - qArm < 2500) { cleanup(); showHome(); } else { qArm = Date.now(); q0.textContent = 'Tap to confirm'; setTimeout(function () { if (q0.isConnected) q0.textContent = 'Quit'; }, 2500); }
  });
  card.onChange = function () { if (!answered) main.disabled = !card.canSubmit(); };
  card.onEnter = function () { if (!answered && card.canSubmit()) submit(false); };
  stuck.addEventListener('click', function () { if (!answered) submit(true); });
  main.addEventListener('click', function () { if (!answered) submit(false); else { cleanup(); run.i++; runNext(); } });
  keyFn = practiceKeys(card, main);
  bindFs();
  sideShow(q, false);
  if (card.focus && !('ontouchstart' in window)) card.focus();
  window.scrollTo(0, 0);

  function submit(giveUp) {
    if (answered) return;
    if (!giveUp && !card.canSubmit()) return;
    answered = true; Snd.init();
    var res;
    if (giveUp && q.type !== 'mc') {
      if (q.type === 'proof' || q.type === 'order') { st.resp = { built: [] }; res = { ok: false, frac: 0 }; }
      else if (q.type === 'txt') { st.resp = ''; res = { ok: false, frac: 0 }; }
      else { st.resp = partsOf(q).map(function () { return []; }); res = { ok: false, frac: 0, parts: partsOf(q).map(function () { return 0; }) }; }
    } else res = gradeQ(q, st.resp);
    card.reveal(res, giveUp);
    if (!isRetry) run.firstTry[q.id] = res.ok;
    if (res.ok) { run.combo++; run.best = Math.max(run.best, run.combo); } else run.combo = 0;
    var gain = Math.round(xpBase(q) * res.frac * multOf(Math.max(0, run.combo - 1)) * (card.hinted ? 0.5 : 1) * (isRetry ? 0.5 : 1));
    run.xp += gain; addXP(gain); record(q.id, res.ok, isRetry); bumpToday(1); save();
    sideAfter(q, res, gain, false);
    run.res.push({ id: q.id, ok: res.ok, frac: res.frac, retry: isRetry, state: JSON.parse(JSON.stringify(st)) });
    if (!res.ok && !run.requeued[q.id]) { run.requeued[q.id] = true; run.ids.splice(Math.min(run.i + 4, run.ids.length), 0, q.id); }
    if (res.ok) {
      Snd.good(run.combo - 1); buzz(run.combo % 5 === 0 ? [20, 40, 20, 40, 30] : 18);
      if (!reduced) card.el.classList.add('pop');
      if (gain) floatXP(card.el, '+' + gain + ' XP');
      if (run.combo > 0 && run.combo % 5 === 0) FX.burst(70, 0.5, 0.4);
      else if (res.frac === 1 && Math.random() < 0.25) FX.burst(18, 0.5, 0.55);
    } else {
      if (res.frac > 0) { Snd.half(); buzz([30, 40, 30]); } else { Snd.bad(); buzz([60, 40, 60]); if (!reduced) card.el.classList.add('shake'); }
      if (gain) floatXP(card.el, '+' + gain + ' XP');
    }
    var cb = document.getElementById('combo');
    if (cb) { cb.className = 'chip' + (run.combo >= 3 ? ' hot' : ''); cb.innerHTML = flame() + '<span>×' + multOf(run.combo).toFixed(1) + '</span>'; }
    var xc = document.getElementById('xpchip'); if (xc) xc.textContent = run.xp + ' XP';
    var pf = document.getElementById('progfill'); if (pf) pf.style.width = Math.round(100 * (run.i + 1) / run.ids.length) + '%';
    main.disabled = false; main.textContent = run.i + 1 >= run.ids.length ? 'Finish' : 'Next'; main.classList.toggle('good', res.ok);
    stuck.hidden = true; main.focus();
    var fbEl = card.el.querySelector('.fb'); if (fbEl && fbEl.scrollIntoView) setTimeout(function () { fbEl.scrollIntoView({ block: 'nearest', behavior: reduced ? 'auto' : 'smooth' }); }, 60);
  }
}
function stIcon(r) { return r.ok ? '✓' : (r.frac > 0 ? '½' : '✗'); }
function finishRun() {
  dropBars(); leaveQuestions();
  var firsts = run.res.filter(function (r) { return !r.retry; }), good = firsts.filter(function (r) { return r.ok; }).length, acc = firsts.length ? Math.round(100 * good / firsts.length) : 0;
  var bonus = acc === 100 ? 50 : 0;
  if (bonus) { run.xp += bonus; addXP(bonus); }
  save(); Snd.done(); buzz([25, 40, 25]); if (acc >= 80) FX.burst(100, 0.5, 0.3);
  var weak = {};
  firsts.forEach(function (r) { if (!r.ok) { var t = CUR.QBY[r.id].t; weak[t] = (weak[t] || 0) + 1; } });
  var wk = Object.keys(weak).sort(function (a, b) { return weak[b] - weak[a]; })[0];
  var tname = wk ? CUR.TBY[wk] : null;
  var items = firsts.map(function (r) {
    var q = CUR.QBY[r.id], T = CUR.TBY[q.t], cls = r.ok ? '' : (r.frac > 0 ? ' part' : ' no');
    return '<div class="ritem"><button type="button" data-rv="' + r.id + '" aria-expanded="false"><span class="st' + cls + '">' + stIcon(r) + '</span><span class="nm"><b>' + T.name + '</b></span><span class="muted">Review</span></button><div class="rv" hidden></div></div>';
  }).join('');
  app.innerHTML =
    '<div class="sum-top"><p class="eyebrow">' + CUR.code + ' · ' + (run.kind === 'fix' ? 'Mistakes run' : 'Run') + ' complete</p><div class="score" id="acc">0%</div><p class="muted">first-try accuracy' + (acc === 100 ? ' · perfect run, +50 bonus XP' : '') + '</p></div>' +
    '<div class="kpis"><div class="stat"><span class="lab">XP earned</span><div class="big-n" id="kxp">0</div></div><div class="stat"><span class="lab">Best combo</span><div class="big-n">' + run.best + '</div></div><div class="stat"><span class="lab">Level</span><div class="big-n">' + lvlInfo(CUR.S.xp).L + '</div></div></div>' +
    (tname ? '<p class="due-note" style="margin-top:1rem">Weakest this run: <b>' + tname.name + '</b>. Missed questions are scheduled to come back.</p>' : '<p class="due-note" style="margin-top:1rem">No misses. Everything you answered moves up a review box.</p>') +
    '<div class="rlist">' + items + '</div>' +
    '<div class="cta" style="margin-top:1.2rem"><button class="btn big" type="button" id="again">Another run <small>10 questions</small></button>' +
    (tname ? '<button class="btn ghost big" type="button" id="drill">Drill ' + tname.name + '</button>' : '') +
    '<button class="link" type="button" id="home">Back to ' + CUR.code + '</button></div>';
  countUp(document.getElementById('acc'), acc, 900, '%'); countUp(document.getElementById('kxp'), run.xp, 900);
  document.getElementById('again').addEventListener('click', function () { Snd.tap(); startRun(pickSmart(10), 'smart'); });
  if (tname) document.getElementById('drill').addEventListener('click', function () { Snd.tap(); startRun(pickSmart(10, wk), 'drill'); });
  document.getElementById('home').addEventListener('click', function () { showHome(); });
  bindReviews(app, function (id) { var r = run.res.filter(function (x) { return x.id === id && !x.retry; })[0]; return { q: CUR.QBY[id], state: r && r.state }; });
  window.scrollTo(0, 0);
}
/* lookup(key) returns { q, state, c? }; c switches the course for mixed infinite runs */
function bindReviews(root, lookup) {
  root.querySelectorAll('[data-rv]').forEach(function (b) {
    b.addEventListener('click', function () {
      var box = b.parentNode.querySelector('.rv'), key = b.getAttribute('data-rv');
      if (!box.hidden) { box.hidden = true; b.setAttribute('aria-expanded', 'false'); return; }
      if (!box.firstChild) {
        var T = lookup(key);
        if (T.c) CUR = T.c;
        var card = qCard(T.q, { mode: 'review', state: T.state ? JSON.parse(JSON.stringify(T.state)) : { resp: null }, uid: 'v' + key });
        box.appendChild(card.el);
      }
      box.hidden = false; b.setAttribute('aria-expanded', 'true');
    });
  });
}

/* ============================================================
   INFINITE MODE
   Endless or 3 lives. Mixes due reviews, unseen bank questions and
   generated questions with fresh numbers. Misses come back 3 to 5
   questions later (generated ones as a new version of the same kind).
   ============================================================ */
var MILES = [5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 100, 125, 150, 200];
function isMile(s) { return MILES.indexOf(s) >= 0 || (s > 200 && s % 50 === 0); }
function mileBounds(s) {
  var lo = 0;
  for (var i = 0; i < MILES.length; i++) { if (MILES[i] <= s) lo = MILES[i]; else return [lo, MILES[i]]; }
  lo = Math.floor(s / 50) * 50; return [lo, lo + 50];
}
function infRec(key) { G.inf = G.inf || {}; return G.inf[key] || (G.inf[key] = { st: 0, lv: 0, n: 0 }); }
function wpick(list, wf) {
  var ws = list.map(wf), tot = ws.reduce(function (s, v) { return s + v; }, 0);
  if (!(tot > 0)) return list[Math.floor(Math.random() * list.length)];
  var r = Math.random() * tot;
  for (var i = 0; i < list.length; i++) { r -= ws[i]; if (r < 0) return list[i]; }
  return list[list.length - 1];
}
function examWeight(c) { var d = daysTo(c); return d == null || d < 0 ? 0.12 : 1 / (1 + d / 5); }

function showInfIntro(mix) {
  dropBars(); leaveQuestions(); clearTimer(); run = null; exam = null;
  if (mix) CUR = null;
  var key = mix ? 'mix' : CUR.id, saved = (G.infCfg && G.infCfg[key]) || {}, lives = !!saved.lives, rec = infRec(key);
  var items = mix
    ? sortedCourses().map(function (c) { var d = daysTo(c); return { id: c.id, label: c.code, sub: cdText(d), def: d == null || d >= 0, hue: c.hue }; })
    : CUR.topics.map(function (t) { return { id: t.id, label: t.name, sub: t.sec, def: !t.extra, extra: t.extra }; });
  var sel = {};
  items.forEach(function (it) { sel[it.id] = saved.sel ? saved.sel.indexOf(it.id) >= 0 : it.def; });
  if (!items.some(function (it) { return sel[it.id]; })) items.forEach(function (it) { sel[it.id] = true; });
  var nGen = mix ? COURSES.reduce(function (s, c) { return s + (c.gens || []).length; }, 0) : (CUR.gens || []).length;
  var nBank = mix ? COURSES.reduce(function (s, c) { return s + c.Q.length; }, 0) : CUR.Q.length;
  var chips = items.map(function (it) {
    return '<button class="tchip" type="button" data-sel="' + it.id + '" aria-pressed="' + !!sel[it.id] + '"' + (it.hue ? ' style="--hue:var(--' + it.hue + ')"' : '') + '>' +
      (it.hue ? '<span class="hue-chip"></span>' : '') + '<span>' + it.label + '</span><span class="s">' + (it.extra ? 'bonus' : it.sub) + '</span></button>';
  }).join('');
  app.innerHTML =
    '<button class="back" type="button" id="back0"><span aria-hidden="true">←</span> ' + (mix ? 'All courses' : CUR.code) + '</button>' +
    '<p class="eyebrow">' + (mix ? 'All courses' : CUR.code) + ' · Infinite mode</p><h1>' + (mix ? 'Infinite mix' : 'Infinite mode') + '</h1>' +
    '<p class="sub">Questions never run out. The ' + nBank + ' written questions mix with ' + nGen + ' generators that make new versions with fresh numbers every time. Misses come back a few questions later.</p>' +
    '<section class="block"><h2>Mode</h2><div class="seg" role="group" aria-label="Mode">' +
      '<button type="button" data-mode="0" aria-pressed="' + !lives + '"><b>Endless</b><span>Go as long as you like and chase your best streak. End whenever you want.</span></button>' +
      '<button type="button" data-mode="1" aria-pressed="' + lives + '"><b>' + heartSVG(true) + heartSVG(true) + heartSVG(true) + ' 3 lives</b><span>Three misses and it is over. Every 10 in a row wins a life back.</span></button>' +
    '</div></section>' +
    '<section class="block"><div class="hrow"><h2>' + (mix ? 'Courses' : 'Topics') + '</h2><button class="link" type="button" id="all">Select all</button></div><div class="chips">' + chips + '</div>' +
      '<p class="due-note" style="margin-top:.6rem">' + (mix ? 'Courses with sooner exams come up more often. Finished exams are off by default.' : 'Weak topics come up more often.' + (items.some(function (it) { return it.extra; }) ? ' Bonus topics are not on the midterm, so they are off by default.' : '')) + '</p></section>' +
    '<section class="block"><div class="recs"><div class="stat"><span class="lab">Best streak</span><div class="big-n">' + rec.st + '</div></div><div class="stat"><span class="lab">3-lives best</span><div class="big-n">' + rec.lv + '</div></div><div class="stat"><span class="lab">Answered</span><div class="big-n">' + rec.n + '</div></div></div></section>' +
    '<div class="cta" style="margin-top:1.2rem"><button class="btn big inf" type="button" id="go"><span class="bl">' + infIcon() + 'Start</span><small id="go-s"></small></button></div>';
  function paint() {
    app.querySelectorAll('[data-mode]').forEach(function (b) { b.setAttribute('aria-pressed', String((b.getAttribute('data-mode') === '1') === lives)); });
    app.querySelectorAll('[data-sel]').forEach(function (b) { b.setAttribute('aria-pressed', String(!!sel[b.getAttribute('data-sel')])); });
    var n = items.filter(function (it) { return sel[it.id]; }).length;
    document.getElementById('go').disabled = !n;
    document.getElementById('go-s').textContent = (lives ? '3 lives' : 'endless') + ' · ' + (n === items.length ? 'all ' + (mix ? 'courses' : 'topics') : n + ' ' + (mix ? 'course' : 'topic') + (n === 1 ? '' : 's'));
  }
  paint();
  app.querySelectorAll('[data-mode]').forEach(function (b) { b.addEventListener('click', function () { Snd.tap(); lives = b.getAttribute('data-mode') === '1'; paint(); }); });
  app.querySelectorAll('[data-sel]').forEach(function (b) { b.addEventListener('click', function () { Snd.tap(); var id = b.getAttribute('data-sel'); sel[id] = !sel[id]; paint(); }); });
  document.getElementById('all').addEventListener('click', function () { Snd.tap(); var allOn = items.every(function (it) { return sel[it.id]; }); items.forEach(function (it) { sel[it.id] = !allOn; }); paint(); });
  function back() { if (mix) showGym(); else showHome(); }
  document.getElementById('back0').addEventListener('click', back);
  document.getElementById('go').addEventListener('click', function () {
    var cfg = { key: key, mix: mix, lives: lives, sel: items.filter(function (it) { return sel[it.id]; }).map(function (it) { return it.id; }) };
    G.infCfg = G.infCfg || {}; G.infCfg[key] = { lives: lives, sel: cfg.sel }; save();
    startInf(cfg);
  });
  window.scrollTo(0, 0);
}

function startInf(cfg) {
  Snd.init();
  var home = cfg.mix ? null : CUR;
  var pools = cfg.mix
    ? cfg.sel.map(function (id) { var c = CBY[id]; return { c: c, tops: c.topics.filter(function (t) { return !t.extra; }).map(function (t) { return t.id; }), w: examWeight(c) }; })
    : [{ c: CUR, tops: cfg.sel.slice(), w: 1 }];
  run = { kind: 'inf', cfg: cfg, pools: pools, home: home, n: 0, ok: 0, combo: 0, best: 0, xp: 0, hearts: cfg.lives ? 3 : 0, over: false,
    res: [], queue: [], recent: [], seenTxt: {}, lastT: null, rec0: JSON.parse(JSON.stringify(infRec(cfg.key))), flags: {} };
  infNext();
}
function genItem(c, gens, fresh) {
  for (var k = 0; k < 8; k++) {
    var g = gens[Math.floor(Math.random() * gens.length)], q;
    try { q = g.make(Rand()); } catch (e) { continue; }
    if (!q || !c.TBY[q.t]) continue;
    var key = c.id + '|' + q.q + '|' + (q.parts ? q.parts.map(function (p) { return p.ask; }).join('|') : '');
    if (run.seenTxt[key] && k < 7) continue;
    run.seenTxt[key] = 1;
    return { c: c, q: q, gen: g, fresh: !!fresh };
  }
  return null;
}
function infPick() {
  for (var i = 0; i < run.queue.length; i++) {
    if (run.queue[i].at > run.n) continue;
    var it = run.queue.splice(i, 1)[0];
    CUR = it.c;
    if (!it.gen) return { c: it.c, q: it.q, retry: true };
    var made = genItem(it.c, [it.gen], true);
    if (made) return made;
  }
  var P = wpick(run.pools, function (p) { return p.w; }), c = P.c, now = Date.now();
  CUR = c;
  var recent = {}; run.recent.forEach(function (id) { recent[id] = 1; });
  for (var tries = 0; tries < 10; tries++) {
    var t = wpick(P.tops, function (tid) { return (0.35 + 1 - mastery(tid, c)) * (tid === run.lastT && P.tops.length > 1 ? 0.2 : 1); });
    var bank = c.Q.filter(function (q) { return q.t === t && !recent[q.id]; });
    var due = bank.filter(function (q) { var r = c.S.q[q.id]; return r && r.due <= now; });
    var unseen = bank.filter(function (q) { return !c.S.q[q.id]; });
    var gens = (c.gens || []).filter(function (g) { return g.t === t; });
    var srcs = [];
    if (due.length) srcs.push(['due', 3]);
    if (unseen.length) srcs.push(['new', 2.5]);
    if (gens.length) srcs.push(['gen', bank.length ? 3.5 : 6]);
    if (bank.length) srcs.push(['bank', 1]);
    if (!srcs.length) continue;
    var s = wpick(srcs, function (x) { return x[1]; })[0];
    if (s === 'gen') { var gi = genItem(c, gens, false); if (gi) return gi; continue; }
    var pool = s === 'due' ? due : s === 'new' ? unseen : bank;
    return { c: c, q: pool[Math.floor(Math.random() * pool.length)] };
  }
  var any = c.Q.filter(function (q) { return P.tops.indexOf(q.t) >= 0; });
  return any.length ? { c: c, q: any[Math.floor(Math.random() * any.length)] } : null;
}
function heartsHTML(lose) {
  var s = '';
  for (var i = 0; i < 3; i++) s += heartSVG(i < run.hearts, lose && i === run.hearts ? 'lose' : '');
  return '<span class="hearts" id="hearts" aria-label="' + run.hearts + ' lives left">' + s + '</span>';
}
function infHud() {
  var mb = mileBounds(run.combo), pct = Math.round(100 * (run.combo - mb[0]) / (mb[1] - mb[0]));
  return '<div class="hud"><button class="x" type="button" id="quit">End</button>' +
    '<div class="prog streak" role="progressbar" aria-label="Streak toward ' + mb[1] + ' in a row" aria-valuenow="' + pct + '" aria-valuemin="0" aria-valuemax="100"><i id="progfill" style="width:' + pct + '%"></i></div>' +
    '<span class="chip' + (run.combo >= 3 ? ' hot' : '') + '" id="combo" title="Current streak">' + flame() + '<span>' + run.combo + '</span></span>' +
    '<span class="chip mono" id="cnt" title="Correct answers">✓ ' + run.ok + '</span>' +
    (run.cfg.lives ? heartsHTML(false) : '') + fsBtn() + '</div>';
}
function infNext() {
  if (run.over) return finishInf();
  var it = infPick();
  if (!it) return finishInf();
  CUR = it.c;
  var q = it.q, st = {}, answered = false;
  if (!it.gen && !it.retry) { run.recent.push(q.id); if (run.recent.length > 14) run.recent.shift(); }
  run.lastT = q.t;
  app.innerHTML = infHud() + '<div class="stage" id="stage"></div>';
  var card = qCard(q, { mode: 'practice', state: st, uid: 'i' + run.n, onAuto: function () { submit(false); } });
  document.getElementById('stage').appendChild(card.el);
  var meta = card.el.querySelector('.qmeta');
  if (run.cfg.mix) meta.insertAdjacentHTML('afterbegin', '<span class="tag crs" style="--hue:var(--' + CUR.hue + ')">' + CUR.code + '</span>');
  if (it.retry) meta.insertAdjacentHTML('beforeend', '<span class="tag" style="background:var(--gold-soft);color:var(--ink)">Second chance</span>');
  if (it.fresh) meta.insertAdjacentHTML('beforeend', '<span class="tag" style="background:var(--gold-soft);color:var(--ink)">Same kind, new numbers</span>');
  var bar = h('div', 'bar'), inner = h('div', 'in');
  var stuck = h('button', 'link', 'Stuck? Show answer'); stuck.type = 'button';
  var main = h('button', 'btn wide', q.type === 'mc' ? 'Pick an answer' : 'Check'); main.type = 'button'; main.disabled = true;
  if (q.type === 'mc') stuck.hidden = true;
  inner.appendChild(stuck); inner.appendChild(main); bar.appendChild(inner); document.body.appendChild(bar);
  var q0 = document.getElementById('quit'), qArm = 0;
  q0.addEventListener('click', function () {
    if (!run.n || Date.now() - qArm < 2500) { dropBars(); finishInf(); }
    else { qArm = Date.now(); q0.textContent = 'Tap to end'; setTimeout(function () { if (q0.isConnected) q0.textContent = 'End'; }, 2500); }
  });
  card.onChange = function () { if (!answered) main.disabled = !card.canSubmit(); };
  card.onEnter = function () { if (!answered && card.canSubmit()) submit(false); };
  stuck.addEventListener('click', function () { if (!answered) submit(true); });
  main.addEventListener('click', function () { if (!answered) submit(false); else { dropBars(); infNext(); } });
  keyFn = practiceKeys(card, main);
  bindFs();
  sideShow(q, !!it.gen);
  if (card.focus && !('ontouchstart' in window)) card.focus();
  window.scrollTo(0, 0);

  function submit(giveUp) {
    if (answered) return;
    if (!giveUp && !card.canSubmit()) return;
    answered = true; Snd.init();
    var res;
    if (giveUp && q.type !== 'mc') {
      if (q.type === 'proof' || q.type === 'order') { st.resp = { built: [] }; res = { ok: false, frac: 0 }; }
      else if (q.type === 'txt') { st.resp = ''; res = { ok: false, frac: 0 }; }
      else { st.resp = partsOf(q).map(function () { return []; }); res = { ok: false, frac: 0, parts: partsOf(q).map(function () { return 0; }) }; }
    } else res = gradeQ(q, st.resp);
    card.reveal(res, giveUp);
    var second = !!(it.retry || it.fresh), R = infRec(run.cfg.key);
    run.n++; R.n++;
    if (res.ok) { run.ok++; run.combo++; run.best = Math.max(run.best, run.combo); } else run.combo = 0;
    var gain = Math.round(xpBase(q) * res.frac * multOf(Math.max(0, run.combo - 1)) * (card.hinted ? 0.5 : 1) * (second ? 0.5 : 1));
    run.xp += gain; addXP(gain);
    if (!it.gen) record(q.id, res.ok, it.retry);
    bumpToday(1);
    run.res.push({ c: CUR.id, q: q, ok: res.ok, frac: res.frac, second: second, state: JSON.parse(JSON.stringify(st)) });
    if (!res.ok && !second) run.queue.push({ at: run.n + 3 + Math.floor(Math.random() * 3), c: CUR, q: it.gen ? null : q, gen: it.gen || null });
    var lost = false, gained = false;
    if (run.cfg.lives) {
      if (!res.ok) { run.hearts--; lost = true; if (run.hearts <= 0) run.over = true; }
      else if (run.combo % 10 === 0 && run.hearts < 3) { run.hearts++; gained = true; }
    }
    /* records */
    if (run.combo > R.st) { R.st = run.combo; if (!run.flags.st && run.rec0.st >= 3) { run.flags.st = true; toast('New best streak'); } }
    if (run.cfg.lives && run.ok > R.lv) { R.lv = run.ok; if (!run.flags.lv && run.rec0.lv >= 3) { run.flags.lv = true; toast('New 3-lives record'); } }
    save();
    sideAfter(q, res, gain, !!it.gen);
    /* feedback */
    if (res.ok) {
      Snd.good(run.combo - 1); buzz(run.combo % 5 === 0 ? [20, 40, 20, 40, 30] : 18);
      if (!reduced) card.el.classList.add('pop');
      if (gain) floatXP(card.el, '+' + gain + ' XP');
      if (isMile(run.combo)) { toast(run.combo + ' in a row'); FX.burst(Math.min(160, 50 + run.combo * 2), 0.5, 0.35); if (run.combo >= 10) Snd.done(); }
      else if (res.frac === 1 && Math.random() < 0.2) FX.burst(16, 0.5, 0.55);
    } else {
      if (res.frac > 0) { Snd.half(); buzz([30, 40, 30]); } else { Snd.bad(); buzz([60, 40, 60]); if (!reduced) card.el.classList.add('shake'); }
      if (gain) floatXP(card.el, '+' + gain + ' XP');
    }
    if (run.n % 25 === 0) toast(run.n + ' questions');
    if (gained) toast('+1 life');
    /* HUD */
    var cb = document.getElementById('combo');
    if (cb) { cb.className = 'chip' + (run.combo >= 3 ? ' hot' : ''); cb.innerHTML = flame() + '<span>' + run.combo + '</span>'; }
    var cn = document.getElementById('cnt'); if (cn) cn.textContent = '✓ ' + run.ok;
    var mb = mileBounds(run.combo), pf = document.getElementById('progfill');
    if (pf) pf.style.width = Math.round(100 * (run.combo - mb[0]) / (mb[1] - mb[0])) + '%';
    var hs = document.getElementById('hearts'); if (hs && (lost || gained)) hs.outerHTML = heartsHTML(lost);
    main.disabled = false; main.textContent = run.over ? 'See results' : 'Next'; main.classList.toggle('good', res.ok);
    stuck.hidden = true; main.focus();
    var fbEl = card.el.querySelector('.fb'); if (fbEl && fbEl.scrollIntoView) setTimeout(function () { fbEl.scrollIntoView({ block: 'nearest', behavior: reduced ? 'auto' : 'smooth' }); }, 60);
  }
}
function finishInf() {
  dropBars(); leaveQuestions();
  var r = run, cfg = r.cfg;
  if (!r.n) { if (cfg.mix) showGym(); else showHome(r.home); return; }
  save();
  var acc = Math.round(100 * r.ok / r.n), R = infRec(cfg.key);
  var newSt = r.best > r.rec0.st && r.best >= 3, newLv = cfg.lives && r.ok > r.rec0.lv && r.ok >= 3;
  Snd.done(); buzz([25, 40, 25]);
  if (newSt || newLv || acc >= 80) FX.burst(110, 0.5, 0.3);
  var by = {};
  r.res.forEach(function (x) {
    if (x.second) return;
    var k = x.c + '|' + x.q.t, b = by[k] || (by[k] = { c: x.c, t: x.q.t, n: 0, ok: 0 });
    b.n++; if (x.ok) b.ok++;
  });
  var rows = Object.keys(by).map(function (k) { return by[k]; }).sort(function (a, b) { return a.ok / a.n - b.ok / b.n || b.n - a.n; });
  var weak = rows[0] && rows[0].ok < rows[0].n ? rows[0] : null;
  var brkRows = rows.map(function (x) {
    var c = CBY[x.c], T = c.TBY[x.t], p = Math.round(100 * x.ok / x.n);
    return '<div class="brow"><span class="bn">' + (cfg.mix ? '<b>' + c.code + '</b> · ' : '') + T.name + '</span><span class="mbar' + (p < 50 ? ' lo' : '') + '" aria-hidden="true"><i style="width:' + p + '%"></i></span><span class="mono">' + x.ok + '/' + x.n + '</span></div>';
  });
  var brk = brkRows.slice(0, 6).join('') + (brkRows.length > 6 ? '<details class="more"><summary>All ' + brkRows.length + ' topics</summary><div class="brk">' + brkRows.slice(6).join('') + '</div></details>' : '');
  var misses = [];
  r.res.forEach(function (x, i) { if (!x.ok) misses.push(i); });
  var missRows = misses.slice(-40).reverse().map(function (i) {
    var x = r.res[i], c = CBY[x.c], T = c.TBY[x.q.t];
    return '<div class="ritem"><button type="button" data-rv="' + i + '" aria-expanded="false"><span class="st' + (x.frac > 0 ? ' part' : ' no') + '">' + stIcon(x) + '</span><span class="nm"><b>' + (cfg.mix ? c.code + ' · ' : '') + T.name + '</b>' + (x.second ? ' <span class="muted">(second go)</span>' : '') + '</span><span class="muted">Review</span></button><div class="rv" hidden></div></div>';
  });
  var items = missRows.slice(0, 8).join('') + (missRows.length > 8 ? '<details class="more"><summary>' + (missRows.length - 8) + ' more</summary><div class="rlist">' + missRows.slice(8).join('') + '</div></details>' : '');
  var label = cfg.mix ? 'All courses' : r.home.code;
  app.innerHTML =
    '<div class="sum-top"><p class="eyebrow">' + label + ' · Infinite · ' + (cfg.lives ? (r.over ? 'Out of lives' : '3 lives') : 'Endless') + '</p><div class="score" id="acc">0</div><p class="muted">correct · ' + acc + '% of ' + r.n + ' answered</p>' +
      (newSt || newLv ? '<p class="newrec">' + (newSt ? 'New best streak: ' + r.best : '') + (newSt && newLv ? ' · ' : '') + (newLv ? 'New 3-lives record: ' + r.ok : '') + '</p>' : '') + '</div>' +
    '<div class="kpis"><div class="stat"><span class="lab">Best streak</span><div class="big-n">' + r.best + '</div></div><div class="stat"><span class="lab">XP earned</span><div class="big-n" id="kxp">0</div></div><div class="stat"><span class="lab">All-time best</span><div class="big-n">' + (cfg.lives ? R.lv : R.st) + '</div><div class="muted" style="font-size:.75rem">' + (cfg.lives ? '3-lives score' : 'streak') + '</div></div></div>' +
    '<section class="block"><h2>By topic</h2><div class="brk">' + brk + '</div></section>' +
    (items ? '<section class="block"><h2>Your misses</h2><p class="due-note">Most recent first. Tap one to see your answer and the full solution.' + (misses.length > 40 ? ' Showing the last 40.' : '') + '</p><div class="rlist">' + items + '</div></section>' : '<p class="due-note" style="margin-top:1rem">No misses at all.</p>') +
    '<div class="cta" style="margin-top:1.2rem"><button class="btn big inf" type="button" id="again"><span class="bl">' + infIcon() + 'Go again</span><small>' + (cfg.lives ? '3 lives' : 'endless') + '</small></button>' +
    (weak ? '<button class="btn ghost big" type="button" id="weak"><span>Drill ' + CBY[weak.c].TBY[weak.t].name + '</span><small class="muted">infinite, one topic</small></button>' : '') +
    '<button class="link" type="button" id="home">Back to ' + (cfg.mix ? 'all courses' : label) + '</button></div>';
  countUp(document.getElementById('acc'), r.ok, 900); countUp(document.getElementById('kxp'), r.xp, 900);
  document.getElementById('again').addEventListener('click', function () { Snd.tap(); if (!cfg.mix) CUR = r.home; startInf(cfg); });
  if (weak) document.getElementById('weak').addEventListener('click', function () {
    Snd.tap(); CUR = CBY[weak.c];
    startInf({ key: CUR.id, mix: false, lives: false, sel: [weak.t] });
  });
  document.getElementById('home').addEventListener('click', function () { if (cfg.mix) showGym(); else showHome(r.home); });
  bindReviews(app, function (i) { var x = r.res[+i]; return { q: x.q, state: x.state, c: CBY[x.c] }; });
  window.scrollTo(0, 0);
}

/* ---------- MOCK MIDTERM ---------- */
function pickMock() {
  var used = {}, ids = [], sec = [];
  CUR.mock.sections.forEach(function (s, si) {
    var got = [];
    if (s.lps) {
      s.lps.forEach(function (lp) { var pool = shuffle(coreQ().filter(function (q) { return q.lp === lp && !used[q.id]; })); if (pool.length) { got.push(pool[0]); used[pool[0].id] = 1; } });
    } else {
      var pool = shuffle(coreQ().filter(function (q) { return s.pick(q) && !used[q.id]; })), seen = {};
      pool.forEach(function (q) { if (got.length < s.n && !seen[q.t]) { seen[q.t] = 1; got.push(q); used[q.id] = 1; } });
      pool.forEach(function (q) { if (got.length < s.n && !used[q.id]) { got.push(q); used[q.id] = 1; } });
    }
    got.forEach(function (q) { ids.push(q.id); sec.push(si); });
  });
  return { ids: ids, sec: sec };
}
function showMockIntro() {
  dropBars(); leaveQuestions();
  var mins = CUR.mockMin || CUR.mock.minutes;
  app.innerHTML =
    '<button class="back" type="button" id="back0"><span aria-hidden="true">←</span> ' + CUR.code + '</button>' +
    '<p class="eyebrow">' + CUR.code + ' · Mock midterm</p><h1>Exam conditions</h1>' +
    '<div class="stat" style="margin-top:1rem"><p style="margin:0">' + CUR.mock.blurb + ' No feedback until you submit.' + (CUR.formula ? ' You can open the formula sheet, like the real thing.' : '') + '</p>' +
    '<div class="stepper"><span class="lab mono" style="font-size:.75rem">TIME LIMIT</span><button type="button" id="mm" aria-label="Less time">−</button><b class="timer" id="mv">' + mins + ' min</b><button type="button" id="mp" aria-label="More time">+</button></div>' +
    '<p class="muted" style="font-size:.85rem;margin:.6rem 0 0">Misses go into your review schedule.</p></div>' +
    '<div class="cta" style="margin-top:1.2rem"><button class="btn big" type="button" id="go">Start the clock</button><button class="link" type="button" id="back">Back</button></div>';
  function setM(v) { mins = Math.max(10, Math.min(180, v)); CUR.mockMin = mins; document.getElementById('mv').textContent = mins + ' min'; Snd.tap(); }
  document.getElementById('mm').addEventListener('click', function () { setM(mins - 5); });
  document.getElementById('mp').addEventListener('click', function () { setM(mins + 5); });
  document.getElementById('go').addEventListener('click', function () { Snd.init(); startMock(mins); });
  document.getElementById('back').addEventListener('click', function () { showHome(); });
  document.getElementById('back0').addEventListener('click', function () { showHome(); });
  window.scrollTo(0, 0);
}
function startMock(mins) {
  sideHide();
  var pk = pickMock();
  exam = { ids: pk.ids, sec: pk.sec, i: 0, st: pk.ids.map(function () { return {}; }), t0: Date.now(), limit: mins * 60000, mins: mins };
  renderExam();
  clearTimer();
  timerId = setInterval(tick, 1000);
}
function fmtTime(ms) { var neg = ms < 0, s = Math.abs(Math.round(ms / 1000)), m = Math.floor(s / 60); return (neg ? '+' : '') + m + ':' + ('0' + (s % 60)).slice(-2); }
function tick() {
  var el = document.getElementById('clock'); if (!el || !exam) return;
  var left = exam.limit - (Date.now() - exam.t0); el.textContent = fmtTime(left); el.classList.toggle('late', left < 0);
}
function answeredMock(i) {
  var q = CUR.QBY[exam.ids[i]], st = exam.st[i];
  if (q.type === 'mc') return st.resp != null;
  if (q.type === 'proof' || q.type === 'order') return !!(st.resp && st.resp.built.length > 0);
  if (q.type === 'txt') return !!(st.resp && String(st.resp).trim());
  return !!(st.resp && st.resp.some(function (a) { return a && a.some(function (v) { return String(v).trim() !== ''; }); }));
}
function renderExam() {
  var q = CUR.QBY[exam.ids[exam.i]], st = exam.st[exam.i], S = CUR.mock.sections[exam.sec[exam.i]];
  var pills = exam.ids.map(function (id, i) { return '<button class="pill' + (answeredMock(i) ? ' done' : '') + (i === exam.i ? ' cur' : '') + '" type="button" data-p="' + i + '" aria-label="Question ' + (i + 1) + '">' + (i + 1) + '</button>'; }).join('');
  var left = exam.limit - (Date.now() - exam.t0);
  app.innerHTML =
    '<div class="hud"><span class="chip"><b class="timer' + (left < 0 ? ' late' : '') + '" id="clock">' + fmtTime(left) + '</b></span><span class="muted" style="flex:1;font-size:.85rem;min-width:0">Q' + (exam.i + 1) + ' of ' + exam.ids.length + ' · ' + S.short + ' · ' + S.pts + ' pt' + (S.pts > 1 ? 's' : '') + '</span>' + fsBtn() + '</div>' +
    '<div class="pills">' + pills + '</div><div class="stage" id="stage"></div>';
  var card = qCard(q, { mode: 'exam', state: st, uid: 'e' + exam.i });
  card.onChange = function () { var p = app.querySelector('[data-p="' + exam.i + '"]'); if (p) p.classList.toggle('done', answeredMock(exam.i)); };
  document.getElementById('stage').appendChild(card.el);
  var old = document.querySelector('.bar'); if (old) old.remove();
  var bar = h('div', 'bar'), inner = h('div', 'in');
  var prev = h('button', 'btn ghost', 'Back'); prev.type = 'button'; prev.disabled = exam.i === 0;
  var last = exam.i === exam.ids.length - 1;
  var next = h('button', 'btn wide', last ? 'Review and submit' : 'Next'); next.type = 'button';
  inner.appendChild(prev); inner.appendChild(next); bar.appendChild(inner); document.body.appendChild(bar);
  prev.addEventListener('click', function () { Snd.tap(); bar.remove(); exam.i--; renderExam(); });
  next.addEventListener('click', function () { Snd.tap(); if (last) showSubmit(bar); else { bar.remove(); exam.i++; renderExam(); } });
  app.querySelectorAll('[data-p]').forEach(function (b) { b.addEventListener('click', function () { Snd.tap(); bar.remove(); exam.i = +b.getAttribute('data-p'); renderExam(); }); });
  bindFs();
  keyFn = function (e, onBtn) {
    if (!next.isConnected) return;
    var k = e.key.toLowerCase(), opts = card.el.querySelectorAll('.opt'), idx = '12345'.indexOf(k);
    if (idx < 0) idx = 'abcde'.indexOf(k);
    if (idx >= 0 && opts[idx]) { e.preventDefault(); opts[idx].click(); }
    else if (k === 'f' && CUR.formula) { e.preventDefault(); toggleDock(); }
    else if (k === 'arrowright' || (k === 'enter' && !onBtn)) { e.preventDefault(); next.click(); }
    else if (k === 'arrowleft' && !prev.disabled) { e.preventDefault(); prev.click(); }
  };
  window.scrollTo(0, 0);
}
function showSubmit(bar) {
  var un = exam.ids.filter(function (_, i) { return !answeredMock(i); }).length;
  var m = overlay('<h3>Submit the exam?</h3><p class="muted">' + (un ? un + ' question' + (un === 1 ? ' is' : 's are') + ' unanswered.' : 'All questions have an answer.') + '</p><p style="display:flex;gap:.6rem;flex-wrap:wrap"><button class="btn" id="sub" type="button">Submit</button><button class="btn ghost" id="cancel" type="button">Keep working</button></p>');
  m.m.querySelector('#cancel').addEventListener('click', m.close);
  m.m.querySelector('#sub').addEventListener('click', function () { m.close(); bar.remove(); finishMock(); });
  m.m.querySelector('#sub').focus();
}
function finishMock() {
  clearTimer(); dropBars(); leaveQuestions();
  var used = Date.now() - exam.t0, got = 0, max = 0, rows = [], secs = CUR.mock.sections.map(function (s) { return { s: s, got: 0, max: 0 }; });
  exam.ids.forEach(function (id, i) {
    var q = CUR.QBY[id], r = gradeQ(q, exam.st[i].resp), w = CUR.mock.sections[exam.sec[i]].pts;
    max += w; got += r.frac * w; record(id, r.ok);
    secs[exam.sec[i]].got += r.frac * w; secs[exam.sec[i]].max += w;
    rows.push({ id: id, ok: r.ok, frac: r.frac, w: w });
  });
  var secHTML = '<div class="secs">' + secs.filter(function (x) { return x.max; }).map(function (x) {
    var p = Math.round(100 * x.got / x.max);
    return '<div class="stat"><span class="lab">' + x.s.label + '</span><div class="big-n">' + (Math.round(x.got * 10) / 10) + '<span class="muted" style="font-size:.85rem;font-family:var(--font-ui)"> / ' + x.max + '</span></div><div class="mbar' + (p < 50 ? ' lo' : '') + '" aria-hidden="true"><i style="width:' + p + '%"></i></div></div>';
  }).join('') + '</div>';
  var pct = Math.round(100 * got / max), xp = Math.round(got / max * 50) + 30;
  addXP(xp); bumpToday(exam.ids.length); save();
  Snd.done(); buzz([25, 40, 25, 40, 60]); if (pct >= 70) FX.burst(110, 0.5, 0.3);
  var items = rows.map(function (r, i) {
    var T = CUR.TBY[CUR.QBY[r.id].t], cls = r.ok ? '' : (r.frac > 0 ? ' part' : ' no');
    return '<div class="ritem"><button type="button" data-rv="' + r.id + '" aria-expanded="false"><span class="st' + cls + '">' + stIcon(r) + '</span><span class="nm"><b>Q' + (i + 1) + '</b> · ' + T.name + '</span><span class="muted mono">' + (Math.round(r.frac * r.w * 10) / 10) + '/' + r.w + '</span></button><div class="rv" hidden></div></div>';
  }).join('');
  app.innerHTML =
    '<div class="sum-top"><p class="eyebrow">' + CUR.code + ' · Mock midterm result</p><div class="score" id="acc">0%</div><p class="muted">' + (Math.round(got * 10) / 10) + ' of ' + max + ' points · ' + fmtTime(used) + ' used of ' + exam.mins + ':00</p></div>' +
    '<div class="kpis"><div class="stat"><span class="lab">XP earned</span><div class="big-n" id="kxp">0</div></div><div class="stat"><span class="lab">Missed</span><div class="big-n">' + rows.filter(function (r) { return !r.ok; }).length + '</div></div><div class="stat"><span class="lab">Level</span><div class="big-n">' + lvlInfo(CUR.S.xp).L + '</div></div></div>' +
    secHTML +
    '<p class="due-note" style="margin-top:1rem">Tap a question to see your answer and the full solution. Anything you missed is now in your review schedule.</p>' +
    '<div class="rlist">' + items + '</div>' +
    '<div class="cta" style="margin-top:1.2rem"><button class="btn big" type="button" id="redo">Practice your misses <small>smart run</small></button><button class="link" type="button" id="home">Back to ' + CUR.code + '</button></div>';
  countUp(document.getElementById('acc'), pct, 1000, '%'); countUp(document.getElementById('kxp'), xp, 900);
  document.getElementById('redo').addEventListener('click', function () { Snd.tap(); startRun(pickSmart(10), 'smart'); });
  document.getElementById('home').addEventListener('click', function () { showHome(); });
  var st = exam.st, ids = exam.ids;
  bindReviews(app, function (id) { return { q: CUR.QBY[id], state: st[ids.indexOf(id)] }; });
  window.scrollTo(0, 0);
}

candleBoot();
showGym();
