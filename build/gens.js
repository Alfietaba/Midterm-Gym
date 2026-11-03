/* ============================================================
   QUESTION GENERATORS (infinite mode): fresh numbers every time
   ============================================================ */
function mkRng(seed) {
  var a = seed >>> 0;
  return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
function Rand(seed) {
  var r = mkRng(seed == null ? (Math.random() * 4294967296) >>> 0 : seed);
  var R = {
    u: r,
    i: function (a, b) { return a + Math.floor(r() * (b - a + 1)); },
    p: function (arr) { return arr[Math.floor(r() * arr.length)]; },
    sg: function () { return r() < 0.5 ? -1 : 1; },
    nz: function (a, b) { var v; do { v = R.i(a, b); } while (v === 0); return v; },
    sh: function (arr) { arr = arr.slice(); for (var i = arr.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var t = arr[i]; arr[i] = arr[j]; arr[j] = t; } return arr; },
    f: function (a, b, dp) { var m = Math.pow(10, dp); return Math.round((a + r() * (b - a)) * m) / m; },
    chance: function (p) { return r() < p; }
  };
  return R;
}
function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = b; b = a % b; a = t; } return a || 1; }
function frac(n, d) { if (d < 0) { n = -n; d = -d; } var g = gcd(n, d); n /= g; d /= g; return d === 1 ? String(n) : n + '/' + d; }
function fracHTML(n, d) { return minus(frac(n, d)); }
function sigCount(str) {
  var s = String(str).trim().replace(/^[+−-]/, ''), m = /^(\d*)(\.?)(\d*)(?:[eE][+-]?\d+)?$/.exec(s);
  if (!m) return -1;
  var digits = (m[1] + m[3]).replace(/^0+/, '');
  if (!m[2]) digits = digits.replace(/0+$/, '');
  return Math.max(digits.length, 1);
}
function expForm(v, n) {
  var e = Math.floor(Math.log10(Math.abs(v))), ms = (v / Math.pow(10, e)).toFixed(n - 1);
  if (Math.abs(parseFloat(ms)) >= 10) { e++; ms = (v / Math.pow(10, e)).toFixed(n - 1); }
  return ms + 'E' + e;
}
/* n significant figures, Mobius style: 1.23E4, 150., 0.0456 */
function sig(x, n) {
  if (x === 0) return '0';
  var s = Number(x.toPrecision(n)), e = Math.floor(Math.log10(Math.abs(s)));
  if (e >= 5 || e <= -4) return expForm(s, n);
  var dec = Math.max(0, n - 1 - e), str = s.toFixed(dec);
  if (dec === 0 && sigCount(str) !== n) str = str.replace('-', '').length === n ? str + '.' : expForm(s, n);
  return str;
}
/* how cout prints a double by default (6 significant digits, no trailing zeros) */
function coutD(x) {
  if (Number.isInteger(x)) return String(x);
  var s = x.toPrecision(6);
  if (s.indexOf('.') >= 0 && s.indexOf('e') < 0) s = s.replace(/0+$/, '').replace(/\.$/, '');
  return s;
}
function code(s) { return '\u0001' + s + '\u0002'; }
function icode(s) { return '\u0003' + s + '\u0004'; }
/* multiple choice helper: correct first, distractors after; dedupes and shuffles */
function gmc(R, id, t, q, right, wrongs, why, x) {
  var seen = {}, opts = [right];
  seen[right] = 1;
  wrongs.forEach(function (w) { if (!seen[w] && opts.length < 5) { seen[w] = 1; opts.push(w); } });
  var order = R.sh(opts.map(function (_, i) { return i; }));
  return mc(id, t, q, order.map(function (i) { return opts[i]; }), order.indexOf(0), why, x);
}
var AW = { H: 1.00794, He: 4.00260, C: 12.011, N: 14.0067, O: 15.9994, Na: 22.9898, Mg: 24.3050, Al: 26.9815, Si: 28.0855, P: 30.9738, S: 32.066, Cl: 35.4527, Ar: 39.948, K: 39.0983, Ca: 40.078, Fe: 55.847, Cu: 63.546, Zn: 65.39, Ne: 20.1797, Xe: 131.29 };
function molar(f) {
  var i = 0;
  function grp() {
    var tot = 0;
    while (i < f.length && f.charAt(i) !== ')') {
      if (f.charAt(i) === '(') { i++; var sub = grp(); i++; var m = /^\d+/.exec(f.slice(i)); var k = m ? +m[0] : 1; if (m) i += m[0].length; tot += sub * k; }
      else { var e = /^([A-Z][a-z]?)(\d*)/.exec(f.slice(i)); tot += AW[e[1]] * (e[2] ? +e[2] : 1); i += e[0].length; }
    }
    return tot;
  }
  return grp();
}
function chemF(f) { return f.replace(/([A-Za-z\)])(\d+)/g, '$1<sub>$2</sub>'); }
function eqHTML(rx) {
  function side(a) { return a.map(function (t) { return (t[0] === 1 ? '' : t[0] + ' ') + chemF(t[1]); }).join(' + '); }
  return side(rx.r) + ' → ' + side(rx.p);
}
var Rg = 0.082057;

(function () {
function course(id) { return COURSES.filter(function (c) { return c.id === id; })[0]; }
var gid = 0;
function nid(k) { return 'g~' + k + '~' + (++gid); }

/* ==================== MATH 115 ==================== */
course('math115').gens = [
  { t: 't1', make: function (R) {
    var a = R.nz(-3, 4), b = R.nz(-3, 4), u = [R.i(-4, 4), R.i(-4, 4), R.i(-4, 4)], v = [R.i(-4, 4), R.i(-4, 4), R.i(-4, 4)];
    var w = u.map(function (x, i) { return a * x + b * v[i]; });
    return num(nid('lc'), 't1', 'Compute ' + a + '{{' + u.join(',') + '}} ' + (b < 0 ? '− ' + (-b) : '+ ' + b) + '{{' + v.join(',') + '}}.', '(' + w.join(',') + ')',
      'Scale each vector, then add entry by entry.', 'Entry by entry: ' + w.map(function (x, i) { return a + '(' + u[i] + ') + ' + b + '(' + v[i] + ') = ' + x; }).join(', ') + '.');
  } },
  { t: 't2', make: function (R) {
    var trip = R.p([[1, 2, 2, 3], [2, 3, 6, 7], [1, 4, 8, 9], [2, 6, 9, 11], [4, 4, 7, 9], [2, 10, 11, 15], [6, 6, 7, 11]]);
    var v = R.sh(trip.slice(0, 3)).map(function (x) { return x * R.sg(); });
    if (R.chance(0.5)) return num(nid('norm'), 't2', 'Compute ‖{{' + v.join(',') + '}}‖.', String(trip[3]), 'Square each entry, add, take the square root.', '√(' + v.map(function (x) { return x * x; }).join(' + ') + ') = √' + trip[3] * trip[3] + ' = ' + trip[3] + '.');
    var u = [R.i(-4, 4), R.i(-4, 4), R.i(-4, 4)], d = u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
    return num(nid('dot'), 't2', 'Let ~u~ = {{' + u.join(',') + '}} and ~v~ = {{' + v.join(',') + '}}. Compute ~u~·~v~.', String(d), 'Multiply matching entries and add.', u.map(function (x, i) { return '(' + x + ')(' + v[i] + ')'; }).join(' + ') + ' = ' + d + '.');
  } },
  { t: 't4', make: function (R) {
    var u = [R.i(-3, 4), R.i(-3, 4), R.i(-3, 4)], v = [R.i(-3, 4), R.i(-3, 4), R.i(-3, 4)];
    var c = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
    return num(nid('cross'), 't4', 'Compute {{' + u.join(',') + '}} × {{' + v.join(',') + '}}.', '(' + c.join(',') + ')',
      'Pattern: (u₂v₃ − u₃v₂, u₃v₁ − u₁v₃, u₁v₂ − u₂v₁).',
      'First: (' + u[1] + ')(' + v[2] + ') − (' + u[2] + ')(' + v[1] + ') = ' + c[0] + '. Second: (' + u[2] + ')(' + v[0] + ') − (' + u[0] + ')(' + v[2] + ') = ' + c[1] + '. Third: (' + u[0] + ')(' + v[1] + ') − (' + u[1] + ')(' + v[0] + ') = ' + c[2] + '.');
  } },
  { t: 't5', make: function (R) {
    var y = [R.i(-3, 3), R.i(-3, 3), R.i(1, 3)], x = [R.i(-4, 5), R.i(-4, 5), R.i(-4, 5)];
    var xy = x[0] * y[0] + x[1] * y[1] + x[2] * y[2], yy = y[0] * y[0] + y[1] * y[1] + y[2] * y[2];
    var p = y.map(function (c) { return frac(xy * c, yy); });
    return num(nid('proj'), 't5', 'Let ~x~ = {{' + x.join(',') + '}} and ~y~ = {{' + y.join(',') + '}}. Compute proj<sub>~y~</sub>(~x~).', '(' + p.join(',') + ')',
      'proj = ((~x~·~y~) / (~y~·~y~)) ~y~.', '~x~·~y~ = ' + xy + ' and ~y~·~y~ = ' + yy + ', so proj = (' + frac(xy, yy) + ')~y~ = {{' + p.join(',') + '}}.');
  } },
  { t: 't5', make: function (R) {
    var n = R.p([[1, 2, 2, 3], [2, -2, 1, 3], [2, 3, 6, 7], [2, 6, -3, 7], [4, 4, 7, 9]]), P = [R.i(-3, 4), R.i(-3, 4), R.i(-3, 4)];
    var lhs = n[0] * P[0] + n[1] * P[1] + n[2] * P[2], k = R.i(1, 4) * R.sg(), c = lhs - k * n[3];
    return num(nid('dpl'), 't5', 'Find the distance from P(' + P.join(', ').replace(/-/g, '−') + ') to the plane ' + n[0] + 'x₁ ' + (n[1] < 0 ? '− ' + (-n[1]) : '+ ' + n[1]) + 'x₂ ' + (n[2] < 0 ? '− ' + (-n[2]) : '+ ' + n[2]) + 'x₃ = ' + minus(c) + '.', String(Math.abs(k)),
      'distance = |~n~·P − c| / ‖~n~‖.', '~n~·P = ' + lhs + ' and ‖~n~‖ = ' + n[3] + '. Distance = |' + lhs + ' − (' + c + ')| / ' + n[3] + ' = ' + Math.abs(k) + '.');
  } },
  { t: 't6', make: function (R) {
    var A, det;
    do { A = [[R.i(-3, 3), R.i(-3, 3), R.i(-3, 3)], [R.i(-3, 3), R.i(-3, 3), R.i(-3, 3)], [R.i(-3, 3), R.i(-3, 3), R.i(-3, 3)]];
      det = A[0][0] * (A[1][1] * A[2][2] - A[1][2] * A[2][1]) - A[0][1] * (A[1][0] * A[2][2] - A[1][2] * A[2][0]) + A[0][2] * (A[1][0] * A[2][1] - A[1][1] * A[2][0]);
    } while (det === 0);
    var x = [R.i(-3, 4), R.i(-3, 4), R.i(-3, 4)], b = A.map(function (r) { return r[0] * x[0] + r[1] * x[1] + r[2] * x[2]; });
    function term(c, v, first) { if (c === 0) return ''; var s = c < 0 ? (first ? '−' : ' − ') : (first ? '' : ' + '); var a = Math.abs(c); return s + (a === 1 ? '' : a) + v; }
    var eqs = A.map(function (r, i) { var s = term(r[0], 'x₁', true); s += term(r[1], 'x₂', !s); s += term(r[2], 'x₃', !s); return (s || '0') + ' = ' + minus(b[i]); });
    return num(nid('sys3'), 't6', 'Solve the system:<br>' + eqs.join('<br>'), '(' + x.join(',') + ')', 'Row reduce the augmented matrix, then back-substitute.',
      'The unique solution is x₁ = ' + minus(x[0]) + ', x₂ = ' + minus(x[1]) + ', x₃ = ' + minus(x[2]) + '. Check it in every equation: ' + A.map(function (r, i) { return r[0] + '(' + x[0] + ') + ' + r[1] + '(' + x[1] + ') + ' + r[2] + '(' + x[2] + ') = ' + b[i]; }).join('; ') + '.', ['x₁', 'x₂', 'x₃']);
  } },
  { t: 't7', make: function (R) {
    var r = R.i(1, 3), rows = [];
    var base = [[1, R.i(-2, 2), R.i(-2, 2), R.i(-2, 2)], [0, 1, R.i(-2, 2), R.i(-2, 2)], [0, 0, 1, R.i(-2, 2)]].slice(0, r);
    for (var i = 0; i < 3; i++) {
      var c = [R.i(-2, 2), R.i(-2, 2), R.i(-2, 2)].slice(0, r);
      if (c.every(function (v) { return v === 0; })) c[0] = 1;
      if (i < r) { c = c.map(function () { return 0; }); c[i] = 1; c = c.map(function (v, k) { return k === i ? 1 : (k < i ? R.i(-1, 1) : 0); }); }
      rows.push([0, 1, 2, 3].map(function (j) { var s = 0; for (var k = 0; k < r; k++) s += c[k] * base[k][j]; return s; }));
    }
    rows = R.sh(rows);
    return num(nid('rank'), 't7', 'Find the rank of [[' + rows.map(function (rw) { return rw.join(','); }).join(';') + ']].', String(r), 'Row reduce and count the nonzero rows.',
      'Row reducing leaves ' + r + ' nonzero row' + (r > 1 ? 's' : '') + ' (the other rows are combinations of them), so the rank is ' + r + '. A 3 × 4 system with this coefficient matrix would have ' + (4 - r) + ' free variable' + (4 - r === 1 ? '' : 's') + '.', null, null, { chk: { rank: rows } });
  } },
  { t: 't9', make: function (R) {
    var m = R.p([[2, 2, 2], [2, 3, 2], [2, 2, 3], [3, 2, 2]]), A = [], B = [];
    for (var i = 0; i < m[0]; i++) { A.push([]); for (var j = 0; j < m[1]; j++) A[i].push(R.i(-3, 4)); }
    for (i = 0; i < m[1]; i++) { B.push([]); for (j = 0; j < m[2]; j++) B[i].push(R.i(-3, 4)); }
    var P = A.map(function (r) { return B[0].map(function (_, j) { var s = 0; for (var k = 0; k < m[1]; k++) s += r[k] * B[k][j]; return s; }); });
    var ms = function (M) { return '[[' + M.map(function (r) { return r.join(','); }).join(';') + ']]'; };
    return num(nid('mm'), 't9', 'Let A = ' + ms(A) + ' and B = ' + ms(B) + '. Compute AB.', P.map(function (r) { return r.join(','); }).join(';'),
      'Entry (i, j) is row i of A dotted with column j of B.', 'AB is ' + m[0] + ' × ' + m[2] + '. For example, entry (1,1) = ' + A[0].map(function (v, k) { return '(' + v + ')(' + B[k][0] + ')'; }).join(' + ') + ' = ' + P[0][0] + '.', null, 'mat');
  } },
  { t: 't10', make: function (R) {
    var a, b, c, d, det;
    do { a = R.i(-4, 5); b = R.i(-4, 5); c = R.i(-4, 5); d = R.i(-4, 5); det = a * d - b * c; } while ([1, -1, 2, -2, 3, -3, 4].indexOf(det) < 0);
    var inv = [frac(d, det), frac(-b, det), frac(-c, det), frac(a, det)];
    return num(nid('inv2'), 't10', 'Find the inverse of [[' + a + ',' + b + ';' + c + ',' + d + ']].', inv[0] + ',' + inv[1] + ';' + inv[2] + ',' + inv[3],
      'For [[a,b;c,d]] the inverse is (1/(ad − bc)) [[d,−b;−c,a]].', 'ad − bc = ' + a + '·' + d + ' − ' + b + '·' + c + ' = ' + det + '. Swap a and d, negate b and c, divide by ' + det + '. On the exam, show the row reduction of [A | I].', null, 'mat', { chk: { A: [[a, b], [c, d]] } });
  } },
  { t: 't8', make: function (R) {
    var A = [[R.i(-3, 3), R.i(-3, 3), R.i(-3, 3)], [R.i(-3, 3), R.i(-3, 3), R.i(-3, 3)]], x = [R.i(-3, 3), R.i(-3, 3), R.i(-3, 3)];
    var y = A.map(function (r) { return r[0] * x[0] + r[1] * x[1] + r[2] * x[2]; });
    return num(nid('mv'), 't8', 'Compute [[' + A.map(function (r) { return r.join(','); }).join(';') + ']]{{' + x.join(',') + '}}.', '(' + y.join(',') + ')',
      'Each output entry is a row dotted with the vector.', 'Row 1: ' + y[0] + '. Row 2: ' + y[1] + '. Equivalently, the answer is ' + x[0] + '(column 1) + ' + x[1] + '(column 2) + ' + x[2] + '(column 3).');
  } }
];

/* ==================== MTE 121 ==================== */
var P121 = 'The code runs inside main(). Type the exact output.';
var WORDS = ['robot', 'sensor', 'encoder', 'gyro', 'motor', 'bumper', 'vector', 'pixel', 'stack', 'debug', 'compile', 'waterloo'];
course('mte121').gens = [
  { t: 'c1', make: function (R) {
    var a = R.i(11, 97) * (R.chance(0.25) ? -1 : 1), b = R.i(2, 9);
    var out = Math.trunc(a / b) + ' ' + (a % b) + ' ' + coutD(a / b);
    return txt(nid('div'), 'c1', P121 + code('int a = ' + a + ', b = ' + b + ';\ncout << a / b << " " << a % b << " " << (double)a / b;'), out,
      'Integer division truncates toward zero, and % keeps the sign of the left operand.', a + ' / ' + b + ' = ' + Math.trunc(a / b) + ' (truncated), ' + a + ' % ' + b + ' = ' + (a % b) + ', and the cast makes the last division real: ' + coutD(a / b) + '.');
  } },
  { t: 'c1', make: function (R) {
    var A = R.i(2, 9), B = R.i(1, 9), C = R.i(2, 5), dec = R.chance(0.4);
    var src, i, j, k, why;
    if (!dec) { src = 'int i = ' + A + ';\nint j = i++ + ' + B + ';\nint k = ++i * ' + C + ';\ncout << i << " " << j << " " << k;'; j = A + B; k = (A + 2) * C; i = A + 2; why = 'j uses the old i: ' + A + ' + ' + B + ' = ' + j + ', then i becomes ' + (A + 1) + '. ++i makes i ' + (A + 2) + ' first, so k = ' + (A + 2) + ' · ' + C + ' = ' + k + '.'; }
    else { src = 'int i = ' + A + ';\nint j = i-- - ' + B + ';\nint k = --i * ' + C + ';\ncout << i << " " << j << " " << k;'; j = A - B; k = (A - 2) * C; i = A - 2; why = 'j uses the old i: ' + A + ' − ' + B + ' = ' + j + ', then i becomes ' + (A - 1) + '. --i makes i ' + (A - 2) + ' first, so k = ' + (A - 2) + ' · ' + C + ' = ' + k + '.'; }
    return txt(nid('inc'), 'c1', P121 + code(src), i + ' ' + j + ' ' + k, 'Post-increment uses the old value; pre-increment changes first.', why);
  } },
  { t: 'c1', make: function (R) {
    var A = R.i(3, 20), B = R.i(1, 9), C = R.i(2, 4), D = R.i(2, 5), E = R.i(4, 9);
    var t1 = A + B, t2 = t1 * C, t3 = t2 - Math.trunc(t2 / D), t4 = t3 % E;
    return txt(nid('cmp'), 'c1', P121 + code('int total = ' + A + ';\ntotal += ' + B + ';\ntotal *= ' + C + ';\ntotal -= total / ' + D + ';\ntotal %= ' + E + ';\ncout << total;'), String(t4),
      'Track total line by line. total / ' + D + ' is integer division.', A + ' + ' + B + ' = ' + t1 + '. × ' + C + ' = ' + t2 + '. ' + t2 + ' / ' + D + ' = ' + Math.trunc(t2 / D) + ', so total = ' + t3 + '. ' + t3 + ' % ' + E + ' = ' + t4 + '.');
  } },
  { t: 'c1', make: function (R) {
    var v = R.i(3, 19) + R.p([0.25, 0.5, 0.75, 0.9, 0.1]), x = Math.trunc(v), d = R.i(2, 4), y = Math.trunc(x / d);
    return txt(nid('cast'), 'c1', P121 + code('int x = ' + v + ';\ndouble y = x / ' + d + ';\ncout << x << " " << y << " " << x / ' + d + '.0;'), x + ' ' + y + ' ' + coutD(x / d),
      'Storing a double in an int truncates. x / ' + d + ' is int / int.', 'x stores ' + x + '. x / ' + d + ' is integer division, ' + y + ', and the double y holds ' + y + '. x / ' + d + '.0 is real division: ' + coutD(x / d) + '.');
  } },
  { t: 'c1', make: function (R) {
    var w = R.p(WORDS), k = R.i(1, w.length - 2);
    return txt(nid('str'), 'c1', P121 + code('string w = "' + w + '";\ncout << w.length() << w[0] << w[' + k + '] << w[w.length() - 1];'), w.length + w[0] + w[k] + w[w.length - 1],
      'Indexes start at 0.', 'length() is ' + w.length + '. w[0] = ' + w[0] + ', w[' + k + '] = ' + w[k] + ', and the last character w[' + (w.length - 1) + '] = ' + w[w.length - 1] + '.');
  } },
  { t: 'c2', make: function (R) {
    var S = R.i(30, 100), T1 = R.p([80, 85, 90]), T2 = R.p([50, 60, 65]), bug = R.chance(0.4);
    var hi = bug ? T2 : T1, lo = bug ? T1 : T2, out = S >= hi ? (bug ? 'pass' : 'honours') : S >= lo ? (bug ? 'honours' : 'pass') : 'fail';
    var src = 'int score = ' + S + ';\nif (score >= ' + hi + ')\n    cout << "' + (bug ? 'pass' : 'honours') + '";\nelse if (score >= ' + lo + ')\n    cout << "' + (bug ? 'honours' : 'pass') + '";\nelse\n    cout << "fail";\nif (score % 2 == 0)\n    cout << " even";';
    out += S % 2 === 0 ? ' even' : '';
    return txt(nid('ifc'), 'c2', P121 + code(src), out, 'Only the first true branch of an else-if chain runs.',
      'score = ' + S + '. ' + (S >= hi ? S + ' >= ' + hi + ' is true, so the first branch runs.' : S >= lo ? S + ' >= ' + hi + ' is false but ' + S + ' >= ' + lo + ' is true.' : 'Both tests fail, so the else runs.') + (bug ? ' The thresholds are checked in the wrong order here, which is why a high score never reaches "honours".' : '') + ' The last if is separate: ' + S + ' % 2 = ' + (S % 2) + '.');
  } },
  { t: 'c2', make: function (R) {
    var a = R.i(1, 9), b = R.i(1, 9), c = R.i(1, 9), v = R.i(0, 2), expr, r;
    if (v === 0) { expr = '(a > b) || (b < c) && !(a == c)'; r = (a > b) || ((b < c) && !(a === c)); }
    else if (v === 1) { expr = '!(a > b && c > b) || a == c'; r = !(a > b && c > b) || a === c; }
    else { expr = '(a + b > c) && !(b >= c || a < 2)'; r = (a + b > c) && !(b >= c || a < 2); }
    return txt(nid('bool'), 'c2', P121 + code('int a = ' + a + ', b = ' + b + ', c = ' + c + ';\nbool r = ' + expr + ';\ncout << r;'), r ? '1' : '0',
      '&& binds tighter than ||. A bool prints as 1 or 0.', 'With a = ' + a + ', b = ' + b + ', c = ' + c + ' the expression is ' + (r ? 'true' : 'false') + ', so cout prints ' + (r ? 1 : 0) + '.');
  } },
  { t: 'c2', make: function (R) {
    var k0 = R.i(1, 6), T = R.i(0, 6), U = R.i(0, 6), V = R.i(0, 6), W = R.i(0, 6), k = k0, t, u;
    t = k > T ? (++k > U) : false;
    u = k > V ? true : (++k > W);
    return txt(nid('sc'), 'c2', P121 + code('int k = ' + k0 + ';\nbool t = (k > ' + T + ') && (++k > ' + U + ');\nbool u = (k > ' + V + ') || (++k > ' + W + ');\ncout << k << t << u;'), k + '' + (t ? 1 : 0) + (u ? 1 : 0),
      '&& skips its right side when the left is false; || skips it when the left is true.', 'After the first line k = ' + (k0 + (k0 > T ? 1 : 0)) + ' and t = ' + (t ? 1 : 0) + '. After the second, k = ' + k + ' and u = ' + (u ? 1 : 0) + '.');
  } },
  { t: 'c2', make: function (R) {
    var A = R.i(1, 9), Y = R.i(5, 15), B = R.chance(0.45) ? 0 : R.i(1, 6), Z = R.i(1, 4);
    var y = B !== 0 ? Z : Y;
    return txt(nid('asg'), 'c2', P121 + code('int a = ' + A + ', y = ' + Y + ';\nif (a = ' + B + ')\n    y = ' + Z + ';\ncout << a << " " << y;'), B + ' ' + y,
      'a = ' + B + ' assigns. The condition is the assigned value.', 'a becomes ' + B + '. ' + (B ? 'A nonzero value is true, so y = ' + Z + '.' : '0 is false, so y stays ' + Y + '.'));
  } },
  { t: 'c2', make: function (R) {
    var x = R.i(1, 30), P = R.i(5, 20), Q = P + R.i(1, 10);
    var out = (x > P ? (x > Q ? 'A' : 'B') : '') + 'C';
    return txt(nid('dang'), 'c2', P121 + code('int x = ' + x + ';\nif (x > ' + P + ')\n    if (x > ' + Q + ')\n        cout << "A";\n    else\n        cout << "B";\ncout << "C";'), out,
      'The else belongs to the nearest if.', 'The else pairs with if (x > ' + Q + '). ' + (x > P ? 'x > ' + P + ' is true, then ' + (x > Q ? 'x > ' + Q + ' is true: A.' : 'x > ' + Q + ' is false: B.') : 'x > ' + P + ' is false, so the inner if/else is skipped.') + ' C always prints.');
  } },
  { t: 'c3', make: function (R) {
    var A = R.i(0, 5), B = A + R.i(6, 16), C = R.i(2, 4), mode = R.i(0, 2), s = 0, ks = [];
    for (var k = A; k <= B; k += C) { ks.push(k); s += mode === 0 ? k : mode === 1 ? k * k : k % 3; }
    var body = mode === 0 ? 's += k;' : mode === 1 ? 's += k * k;' : 's += k % 3;';
    return txt(nid('fsum'), 'c3', P121 + code('int s = 0;\nfor (int k = ' + A + '; k <= ' + B + '; k += ' + C + ')\n    ' + body + '\ncout << s;'), String(s),
      'List the values k takes before it passes ' + B + '.', 'k = ' + ks.join(', ') + '. ' + (mode === 0 ? 'Their sum' : mode === 1 ? 'The sum of their squares' : 'The sum of k % 3') + ' is ' + s + '.');
  } },
  { t: 'c3', make: function (R) {
    var v = R.i(0, 1), A, B, C, n = 0, src, i;
    if (v === 0) { A = R.i(8, 30); B = R.i(2, 5); for (i = A; i > 0; i -= B) n++; src = 'for (int i = ' + A + '; i > 0; i -= ' + B + ')'; }
    else { A = R.i(0, 4); B = A + R.i(5, 20); C = R.i(2, 4); for (i = A; i < B; i += C) n++; src = 'for (int i = ' + A + '; i < ' + B + '; i += ' + C + ')'; }
    return num(nid('fcnt'), 'c3', 'How many times does ' + icode(src) + ' run its body?', String(n), 'Write out each value of i that passes the test.',
      'The loop body runs ' + n + ' times. Writing out the values of i and stopping at the first one that fails the test is the safest way to count.');
  } },
  { t: 'c3', make: function (R) {
    var A = R.i(1, 5), M = R.i(2, 4), L = R.i(20, 200), x = A, seq = [A];
    while (x < L) { x *= M; seq.push(x); }
    return txt(nid('wmul'), 'c3', P121 + code('int x = ' + A + ';\nwhile (x < ' + L + ')\n    x *= ' + M + ';\ncout << x;'), String(x), 'Keep multiplying until the test fails.', 'x goes ' + seq.join(', ') + '. At ' + x + ' the test x < ' + L + ' fails, so ' + x + ' prints.');
  } },
  { t: 'c3', make: function (R) {
    var N = R.i(3, 7), v = R.i(0, 1), cnt = v === 0 ? N * (N + 1) / 2 : N * (N - 1) / 2;
    var src = 'int count = 0;\nfor (int a = 1; a <= ' + N + '; a++)\n    for (int b = ' + (v === 0 ? 'a; b <= ' + N : '1; b < a') + '; b++)\n        count++;\ncout << count;';
    return txt(nid('nest'), 'c3', P121 + code(src), String(cnt), 'Count the inner passes for each value of a.', v === 0 ? 'For a = 1 the inner loop runs ' + N + ' times, then ' + (N - 1) + ', and so on down to 1. Total ' + cnt + '.' : 'For a = 1 the inner loop runs 0 times, then 1, 2, … up to ' + (N - 1) + '. Total ' + cnt + '.');
  } },
  { t: 'c3', make: function (R) {
    var n0 = R.i(10, 30), D = R.i(3, 7), T = R.i(1, 9), n = n0, out = [];
    do { out.push(n); n -= D; } while (n > T);
    out.push(n);
    return txt(nid('dow'), 'c3', P121 + code('int n = ' + n0 + ';\ndo\n{\n    cout << n << " ";\n    n -= ' + D + ';\n} while (n > ' + T + ');\ncout << n;'), out.join(' '),
      'A do-while checks after the body.', 'The body prints ' + out.slice(0, -1).join(', ') + '. When n = ' + n + ' the test n > ' + T + ' fails, and the last cout prints ' + n + '.');
  } },
  { t: 'c3', make: function (R) {
    var n0 = R.i(3, 20), n = n0, steps = 0;
    while (n !== 1) { n = n % 2 === 0 ? n / 2 : 3 * n + 1; steps++; }
    return txt(nid('coll'), 'c3', P121 + code('int n = ' + n0 + ', steps = 0;\nwhile (n != 1)\n{\n    if (n % 2 == 0)\n        n /= 2;\n    else\n        n = 3 * n + 1;\n    steps++;\n}\ncout << steps;'), String(steps),
      'Trace n until it reaches 1, counting passes.', 'Starting from ' + n0 + ' it takes ' + steps + ' passes to reach 1.');
  } },
  { t: 'c4', make: function (R) {
    var X = R.i(1, 5), Y = R.i(2, 4), P = R.i(1, 9), Q = R.i(1, 9), x = P + X, y = Q + X;
    var src = 'void upd(int &a, int b)\n{\n    a = a + ' + X + ';\n    b = b * ' + Y + ';\n}\nint main()\n{\n    int x = ' + P + ', y = ' + Q + ';\n    upd(x, y);\n    upd(y, x);\n    cout << x << " " << y;\n    return 0;\n}';
    return txt(nid('ref'), 'c4', 'Assume the usual includes. Type the exact output.' + code(src), x + ' ' + y, 'Only the first parameter is a reference.',
      'upd(x, y) adds ' + X + ' to x, giving ' + x + ', and only changes a copy of y. upd(y, x) adds ' + X + ' to y, giving ' + y + ', and only changes a copy of x.');
  } },
  { t: 'c4', make: function (R) {
    var X = R.i(1, 4), Y = R.i(1, 3), Z = R.i(2, 3), P = R.i(3, 9), Q = R.i(0, 5);
    var x = P, r1 = (Q + X) * Z; x -= Y; var r2 = (r1 + X) * Z; x -= Y; var w = r2 + Q;
    var src = 'int f(int a, int &b)\n{\n    a += ' + X + ';\n    b -= ' + Y + ';\n    return a * ' + Z + ';\n}\nint main()\n{\n    int w = 0, x = ' + P + ', y = ' + Q + ';\n    w = f(f(y, x), x) + y;\n    cout << w << " and " << x << " and " << y << endl;\n    return 0;\n}';
    return txt(nid('nf'), 'c4', 'Assume the usual includes. Type the exact output.' + code(src), w + ' and ' + x + ' and ' + Q,
      'The inner call runs first; only b is a reference.', 'Inner: a = ' + Q + ' + ' + X + ', x becomes ' + (P - Y) + ', returns ' + r1 + '. Outer: a = ' + r1 + ' + ' + X + ', x becomes ' + x + ', returns ' + r2 + '. w = ' + r2 + ' + ' + Q + ' = ' + w + '. y was only copied.');
  } },
  { t: 'c4', make: function (R) {
    var M = R.i(2, 3), A = R.i(-2, 3), V = R.i(0, 3), K = R.i(2, 4), v = V, tr = [];
    for (var i = 0; i < K; i++) { v = v * M + A - i; tr.push(v); }
    var src = 'int g(int n)\n{\n    return n * ' + M + (A < 0 ? ' - ' + (-A) : ' + ' + A) + ';\n}\nint main()\n{\n    int v = ' + V + ';\n    for (int i = 0; i < ' + K + '; i++)\n        v = g(v) - i;\n    cout << v;\n    return 0;\n}';
    return txt(nid('gl'), 'c4', 'Assume the usual includes. Type the exact output.' + code(src), String(v), 'Update v once per pass.', 'v after each pass: ' + tr.join(', ') + '.');
  } },
  { t: 'c4', make: function (R) {
    var a = R.i(1, 9), b = R.i(1, 9), c = R.i(1, 9), s = [a, b, c];
    function ord(i, j) { if (s[i] > s[j]) { var t = s[i]; s[i] = s[j]; s[j] = t; } }
    ord(0, 1); ord(1, 2); ord(0, 1);
    var src = 'void order(int &lo, int &hi)\n{\n    if (lo > hi)\n    {\n        int t = lo;\n        lo = hi;\n        hi = t;\n    }\n}\nint main()\n{\n    int a = ' + a + ', b = ' + b + ', c = ' + c + ';\n    order(a, b);\n    order(b, c);\n    order(a, b);\n    cout << a << " " << b << " " << c;\n    return 0;\n}';
    return txt(nid('ord'), 'c4', 'Assume the usual includes. Type the exact output.' + code(src), s.join(' '), 'Track a, b, c after each call.', 'The three calls are one pass of a sort, leaving ' + s.join(', ') + '.');
  } },
  { t: 'c5', make: function (R) {
    var mmPer = R.p([200, 250, 160, 220]), d = R.p([0.5, 0.8, 1, 1.2, 1.5, 2, 2.5]), deg = d * 1000 / mmPer * 360;
    return num(nid('vdeg'), 'c5', 'With these tires, 1 wheel turn moves the robot ' + mmPer + ' mm. How many degrees must the drive motors turn to move ' + d + ' m?', String(Math.round(deg)),
      'Convert m to mm, then to turns, then to degrees.', d + ' m = ' + d * 1000 + ' mm = ' + (d * 1000 / mmPer) + ' turns. × 360 = ' + Math.round(deg) + '°.', null, null, { tol: 0.003 });
  } },
  { t: 'c5', make: function (R) {
    var f = R.p([0.1, 0.25, 0.05, 0.2]), every = R.p([10, 15, 20, 30]), hrs = R.p([2, 3, 4, 6]), steps = hrs * 60 / every, tot = f * 360 * steps;
    return num(nid('vplat'), 'c5', 'A platform motor turns the plant ' + f + ' turns every ' + every + ' minutes. In degrees, how far has it turned after ' + hrs + ' hours?', String(Math.round(tot)),
      'Degrees per step, times the number of steps.', f + ' turns = ' + (f * 360) + '° per step. ' + hrs + ' h has ' + steps + ' steps of ' + every + ' min. ' + (f * 360) + ' × ' + steps + ' = ' + Math.round(tot) + '°.', null, null, { tol: 0.002 });
  } },
  { t: 'c5', make: function (R) {
    var T = R.p([20, 30, 45]), cond = R.p([['Optical3.color() == green', 'green is detected'], ['Bumper8.pressing()', 'the bumper is pressed'], ['Distance7.objectDistance(mm) < 300', 'something is closer than 300 mm']]);
    var neg = cond[0].indexOf('==') > 0 ? cond[0].replace('==', '!=') : cond[0].indexOf('<') > 0 ? cond[0].replace('<', '>=') : '!' + cond[0];
    var right = K_('while (Brain.Timer.time(seconds) < ' + T + ' * 60 && ' + neg + ')');
    return gmc(R, nid('vdm'), 'c5', 'The robot should keep working until ' + T + ' minutes have passed OR ' + cond[1] + '. Which loop header is correct?', right,
      [K_('while (Brain.Timer.time(seconds) < ' + T + ' * 60 || ' + neg + ')'), K_('while (Brain.Timer.time(seconds) >= ' + T + ' * 60 && ' + cond[0] + ')'), K_('while (Brain.Timer.time(seconds) < ' + T + ' && ' + neg + ')'), K_('if (Brain.Timer.time(seconds) < ' + T + ' * 60 && ' + neg + ')')],
      'Stop when (time up) OR (sensor event). Keep going while NOT that: by De Morgan, (time not up) AND (no sensor event). The timer counts seconds, so ' + T + ' minutes is ' + T + ' * 60.');
  } }
];
function K_(s) { return icode(s); }

/* ==================== CHE 102 ==================== */
var COMP = [['water', 'H2O'], ['carbon dioxide', 'CO2'], ['methane', 'CH4'], ['ethane', 'C2H6'], ['propane', 'C3H8'], ['butane', 'C4H10'], ['glucose', 'C6H12O6'], ['ammonia', 'NH3'], ['sulfuric acid', 'H2SO4'], ['sodium chloride', 'NaCl'], ['calcium carbonate', 'CaCO3'], ['ethanol', 'C2H5OH'], ['sulfur dioxide', 'SO2'], ['calcium chloride', 'CaCl2'], ['potassium chlorate', 'KClO3'], ['aluminum oxide', 'Al2O3'], ['iron(III) oxide', 'Fe2O3'], ['sodium hydroxide', 'NaOH'], ['magnesium hydroxide', 'Mg(OH)2'], ['ammonium nitrate', 'NH4NO3']];
var GASES = [['N₂', 'N2'], ['O₂', 'O2'], ['CO₂', 'CO2'], ['CH₄', 'CH4'], ['He', 'He'], ['Ar', 'Ar'], ['Ne', 'Ne'], ['NH₃', 'NH3'], ['SO₂', 'SO2'], ['C₃H₈', 'C3H8']];
var RXN = [
  { r: [[2, 'H2'], [1, 'O2']], p: [[2, 'H2O']], w: 0 },
  { r: [[1, 'N2'], [3, 'H2']], p: [[2, 'NH3']], w: 0 },
  { r: [[1, 'CaCO3'], [2, 'HCl']], p: [[1, 'CaCl2'], [1, 'CO2'], [1, 'H2O']], w: 1 },
  { r: [[4, 'Al'], [3, 'O2']], p: [[2, 'Al2O3']], w: 0 },
  { r: [[1, 'Fe2O3'], [3, 'CO']], p: [[2, 'Fe'], [3, 'CO2']], w: 0 },
  { r: [[2, 'Na'], [1, 'Cl2']], p: [[2, 'NaCl']], w: 0 },
  { r: [[1, 'C3H8'], [5, 'O2']], p: [[3, 'CO2'], [4, 'H2O']], w: 0 },
  { r: [[2, 'SO2'], [1, 'O2']], p: [[2, 'SO3']], w: 0 },
  { r: [[1, 'Mg'], [2, 'HCl']], p: [[1, 'MgCl2'], [1, 'H2']], w: 1 },
  { r: [[1, 'CH4'], [2, 'O2']], p: [[1, 'CO2'], [2, 'H2O']], w: 0 },
  { r: [[1, 'C7H6O3'], [1, 'C4H6O3']], p: [[1, 'C9H8O4'], [1, 'C2H4O2']], w: 0 }
];
function m3(R, lo, hi) { var v; for (var k = 0; k < 20; k++) { v = Number(sig(lo + R.u() * (hi - lo), 3)); if (sigCount(String(v)) === 3) return v; } return v; }
course('che102').gens = [
  { t: 'h1', make: function (R) {
    var c = R.p(COMP), m = m3(R, 1.5, 95), M = molar(c[1]), N = m / M * 6.02214e23;
    return num(nid('mol'), 'h1', 'How many formula units (or molecules) are in ' + m + ' g of ' + c[0] + ' (' + chemF(c[1]) + ')? Give 3 significant figures, like 1.23E23.', sig(N, 3),
      'Grams → moles with the molar mass, then × Avogadro\'s number.', 'M(' + chemF(c[1]) + ') = ' + M.toFixed(2) + ' g/mol. ' + m + ' / ' + M.toFixed(2) + ' = ' + sig(m / M, 4) + ' mol. × 6.02214 × 10²³ = ' + sig(N, 3) + '.', null, null, { sf: 3 });
  } },
  { t: 'h1', make: function (R) {
    var c = R.p(COMP), n = m3(R, 0.1, 5), atoms = 0;
    c[1].replace(/\(([^)]+)\)(\d+)|([A-Z][a-z]?)(\d*)/g, function (mm, grp, k, el, cnt) {
      if (grp) { var s = 0; grp.replace(/([A-Z][a-z]?)(\d*)/g, function (q, e2, c2) { s += c2 ? +c2 : 1; }); atoms += s * +k; } else atoms += cnt ? +cnt : 1; return '';
    });
    var N = n * atoms * 6.02214e23;
    return num(nid('atm'), 'h1', 'How many atoms in total are in ' + n + ' mol of ' + chemF(c[1]) + '? Give 3 significant figures.', sig(N, 3),
      'Count the atoms in one formula unit first.', 'One ' + chemF(c[1]) + ' has ' + atoms + ' atoms. ' + n + ' × ' + atoms + ' × 6.02214 × 10²³ = ' + sig(N, 3) + '.', null, null, { sf: 3 });
  } },
  { t: 'h1', make: function (R) {
    var el = R.p([['Cl', 34.969, 36.966, 35.4527, 35, 37], ['Cu', 62.930, 64.928, 63.546, 63, 65], ['B', 10.013, 11.009, 10.811, 10, 11], ['Ga', 68.926, 70.925, 69.723, 69, 71]]);
    var f = (el[2] - el[3]) / (el[2] - el[1]) * 100;
    return num(nid('iso'), 'h1', el[0] + ' has two isotopes, <sup>' + el[4] + '</sup>' + el[0] + ' (' + el[1] + ' u) and <sup>' + el[5] + '</sup>' + el[0] + ' (' + el[2] + ' u). Its average atomic mass is ' + el[3] + ' u. What percentage of atoms are <sup>' + el[4] + '</sup>' + el[0] + '? Give 3 significant figures.', sig(f, 3),
      'Let x be the fraction of the lighter isotope: x·m₁ + (1 − x)·m₂ = average.', 'x = (' + el[2] + ' − ' + el[3] + ') / (' + el[2] + ' − ' + el[1] + ') = ' + sig(f / 100, 4) + ', so ' + sig(f, 3) + '%.', null, null, { sf: 3, unit: '%' });
  } },
  { t: 'h2', make: function (R) {
    var lo = R.i(-10, 20), dT = R.i(5, 25), v = R.i(0, 1);
    if (v === 0) return gmc(R, nid('dt'), 'h2', 'The temperature rises from ' + minus(lo) + ' °C to ' + minus(lo + dT) + ' °C. What is the change in °F?', sig(1.8 * dT, 3) + ' °F',
      [sig(1.8 * dT + 32, 3) + ' °F', sig(dT / 1.8, 3) + ' °F', dT + ' °F', sig((dT - 32) / 1.8, 3) + ' °F'], 'A change uses only the factor 1.8: ' + dT + ' × 1.8 = ' + sig(1.8 * dT, 3) + ' °F. The +32 offset cancels in a difference.', { k: 'c' });
    var F = R.i(-20, 110), K = (F - 32) / 1.8 + 273.15;
    return num(nid('fk'), 'h2', 'Convert ' + minus(F) + ' °F to kelvin. Give 4 significant figures.', sig(K, 4), 'T(°C) = (T(°F) − 32)/1.8, then add 273.15.', '(' + F + ' − 32)/1.8 = ' + sig((F - 32) / 1.8, 4) + ' °C, + 273.15 = ' + sig(K, 4) + ' K.', null, null, { sf: 4, unit: 'K' });
  } },
  { t: 'h2', make: function (R) {
    var c = R.p([['atm', 'psi', 14.6959], ['lbf', 'N', 1 / 0.224809], ['g/cm³', 'lbm/ft³', 62.4280], ['m', 'ft', 3.28084], ['kg', 'lbm', 2.20462], ['atm', 'mmHg', 760], ['J', 'cal', 0.239006], ['m/s', 'km/h', 3.6], ['L', 'gal (US)', 0.264172], ['bar', 'atm', 1 / 1.01325]]);
    var x = m3(R, 0.5, 90), y = x * c[2];
    return num(nid('unit'), 'h2', 'Convert ' + x + ' ' + c[0] + ' to ' + c[1] + '. Give 3 significant figures.', sig(y, 3), 'Use the conversion factor from the data sheet.',
      '1 ' + c[0] + ' = ' + sig(c[2], 6) + ' ' + c[1] + '. ' + x + ' × ' + sig(c[2], 6) + ' = ' + sig(y, 3) + ' ' + c[1] + '.', null, null, { sf: 3, unit: c[1] });
  } },
  { t: 'h3', make: function (R) {
    var rx = R.p(RXN), ri = R.i(0, rx.r.length - 1), pi = rx.w, A = rx.r[ri], P = rx.p[pi], m = m3(R, 2, 120);
    var mp = m / molar(A[1]) * P[0] / A[0] * molar(P[1]);
    return num(nid('st'), 'h3', 'For ' + eqHTML(rx) + ', what mass of ' + chemF(P[1]) + ' forms from ' + m + ' g of ' + chemF(A[1]) + ' with the other reactant in excess? Give 3 significant figures.', sig(mp, 3),
      'Grams → moles → mole ratio → grams.', m + ' g ÷ ' + molar(A[1]).toFixed(2) + ' = ' + sig(m / molar(A[1]), 4) + ' mol ' + chemF(A[1]) + '. × ' + P[0] + '/' + A[0] + ' = ' + sig(m / molar(A[1]) * P[0] / A[0], 4) + ' mol ' + chemF(P[1]) + '. × ' + molar(P[1]).toFixed(2) + ' = ' + sig(mp, 3) + ' g.', null, null, { sf: 3, unit: 'g' });
  } },
  { t: 'h4', make: function (R) {
    var rx = R.p(RXN.filter(function (x) { return x.r.length === 2; })), A = rx.r[0], B = rx.r[1], P = rx.p[rx.w];
    var mA = m3(R, 5, 80), mB = m3(R, 5, 80), nA = mA / molar(A[1]), nB = mB / molar(B[1]), ext = Math.min(nA / A[0], nB / B[0]), lim = nA / A[0] < nB / B[0] ? A : B;
    var mp = ext * P[0] * molar(P[1]);
    return num(nid('lim'), 'h4', mA + ' g of ' + chemF(A[1]) + ' and ' + mB + ' g of ' + chemF(B[1]) + ' react: ' + eqHTML(rx) + '. What mass of ' + chemF(P[1]) + ' can form? Give 3 significant figures.', sig(mp, 3),
      'Find moles of each reactant and divide by its coefficient. The smaller result is the limiting one.', 'n(' + chemF(A[1]) + ') / ' + A[0] + ' = ' + sig(nA / A[0], 4) + ' and n(' + chemF(B[1]) + ') / ' + B[0] + ' = ' + sig(nB / B[0], 4) + ', so ' + chemF(lim[1]) + ' is limiting. Product: ' + sig(ext, 4) + ' × ' + P[0] + ' × ' + molar(P[1]).toFixed(2) + ' = ' + sig(mp, 3) + ' g.', null, null, { sf: 3, unit: 'g' });
  } },
  { t: 'h4', make: function (R) {
    var rx = R.p(RXN.filter(function (x) { return x.r.length === 2; })), A = rx.r[0], B = rx.r[1];
    var nB = R.i(3, 12), ex = R.p([10, 20, 25, 30, 40, 50, 75, 100]), nA = Number(sig(nB / B[0] * A[0] * (1 + ex / 100), 3));
    var need = nB / B[0] * A[0], pe = (nA - need) / need * 100;
    return num(nid('exc'), 'h4', nA + ' mol of ' + chemF(A[1]) + ' and ' + nB + '.00 mol of ' + chemF(B[1]) + ' react: ' + eqHTML(rx) + '. ' + chemF(B[1]) + ' is limiting. What is the percent excess of ' + chemF(A[1]) + '? Give 2 significant figures.', sig(pe, 2),
      'Percent excess = (fed − needed) / needed × 100.', nB + ' mol ' + chemF(B[1]) + ' needs ' + sig(need, 4) + ' mol ' + chemF(A[1]) + '. (' + nA + ' − ' + sig(need, 4) + ') / ' + sig(need, 4) + ' = ' + sig(pe, 2) + '%.', null, null, { sf: 2, unit: '%' });
  } },
  { t: 'h5', make: function (R) {
    var rx = R.p(RXN), A = rx.r[0], P = rx.p[rx.w], m = m3(R, 4, 90), th = m / molar(A[1]) * P[0] / A[0] * molar(P[1]), y = R.i(55, 95), act = Number(sig(th * y / 100, 3)), py = act / th * 100;
    return num(nid('yld'), 'h5', m + ' g of ' + chemF(A[1]) + ' reacts with excess of everything else by ' + eqHTML(rx) + ' and gives ' + act + ' g of ' + chemF(P[1]) + '. What is the percent yield? Give 3 significant figures.', sig(py, 3),
      'Theoretical yield first.', 'Theoretical: ' + sig(th, 4) + ' g ' + chemF(P[1]) + '. ' + act + ' / ' + sig(th, 4) + ' = ' + sig(py, 3) + '%.', null, null, { sf: 3, unit: '%' });
  } },
  { t: 'h5', make: function (R) {
    var rx = R.p(RXN.filter(function (x) { return x.p.length > 1; })), P = rx.p[rx.w];
    var mr = rx.r.reduce(function (s, t) { return s + t[0] * molar(t[1]); }, 0), ae = P[0] * molar(P[1]) / mr * 100;
    return num(nid('ae'), 'h5', 'What is the atom economy for making ' + chemF(P[1]) + ' by ' + eqHTML(rx) + '? Give 3 significant figures.', sig(ae, 3),
      'Mass of desired product ÷ mass of all reactants, using the coefficients.', P[0] + ' × ' + molar(P[1]).toFixed(2) + ' = ' + sig(P[0] * molar(P[1]), 4) + ' g of product from ' + sig(mr, 4) + ' g of reactants: ' + sig(ae, 3) + '%.', null, null, { sf: 3, unit: '%' });
  } },
  { t: 'h6', make: function (R) {
    var v = R.i(0, 2);
    if (v === 0) { var M1 = m3(R, 1, 18), V1 = m3(R, 5, 95), V2 = Number(sig(V1 * R.i(3, 20), 3)), M2 = M1 * V1 / V2;
      return num(nid('dil'), 'h6', V1 + ' mL of ' + M1 + ' M solution is diluted to ' + V2 + ' mL. What is the new concentration in M? Give 3 significant figures.', sig(M2, 3), 'M₁V₁ = M₂V₂.', M1 + ' × ' + V1 + ' / ' + V2 + ' = ' + sig(M2, 3) + ' M.', null, null, { sf: 3, unit: 'M' }); }
    var c = R.p([['NaCl', 'NaCl'], ['CaCl2', 'CaCl₂'], ['NaOH', 'NaOH'], ['KCl', 'KCl'], ['H2SO4', 'H₂SO₄']]);
    if (v === 1) { var w = m3(R, 2, 20), d = R.p([1.01, 1.02, 1.04, 1.06, 1.10, 1.15]), M = w / 100 * d * 1000 / molar(c[0]);
      return num(nid('ww'), 'h6', 'What is the molarity of a ' + w + '% (w/w) ' + chemF(c[0]) + ' solution with density ' + d.toFixed(2) + ' g/mL? Give 3 significant figures.', sig(M, 3), 'Take 1 L of solution: its mass is density × 1000 mL.', '1 L = ' + (d * 1000).toFixed(0) + ' g of solution, ' + sig(w / 100 * d * 1000, 4) + ' g of ' + chemF(c[0]) + ' = ' + sig(M, 3) + ' mol, so ' + sig(M, 3) + ' M.', null, null, { sf: 3, unit: 'M' }); }
    var Vm = m3(R, 100, 900), Mm = m3(R, 0.05, 2), g = Vm / 1000 * Mm * molar(c[0]);
    return num(nid('mk'), 'h6', 'What mass of ' + chemF(c[0]) + ' is needed to make ' + Vm + ' mL of ' + Mm + ' M solution? Give 3 significant figures.', sig(g, 3), 'mol = M × V(L), then × molar mass.', (Vm / 1000) + ' L × ' + Mm + ' M = ' + sig(Vm / 1000 * Mm, 4) + ' mol × ' + molar(c[0]).toFixed(2) + ' = ' + sig(g, 3) + ' g.', null, null, { sf: 3, unit: 'g' });
  } },
  { t: 'h7', make: function (R) {
    var hc = R.p([[1, 4], [2, 6], [2, 4], [3, 8], [3, 6], [4, 10], [4, 8], [5, 12], [6, 14], [6, 6], [7, 8], [8, 18], [2, 2]]);
    var g = gcd(hc[0], hc[1]), ef = [hc[0] / g, hc[1] / g], m = m3(R, 1, 10), n = m / (hc[0] * AW.C + hc[1] * AW.H);
    var mc2 = sig(n * hc[0] * molar('CO2'), 3), mh = sig(n * hc[1] / 2 * molar('H2O'), 3);
    function f(c, h) { return 'C' + (c > 1 ? '<sub>' + c + '</sub>' : '') + 'H<sub>' + h + '</sub>'; }
    return gmc(R, nid('emp'), 'h7', 'A hydrocarbon burns completely and gives ' + mc2 + ' g of CO<sub>2</sub> and ' + mh + ' g of H<sub>2</sub>O. What is its empirical formula?', f(ef[0], ef[1]),
      [f(ef[0], ef[1] * 2), f(ef[0] * 2, ef[1]), f(ef[0], ef[1] + 1), f(1, ef[1] === 2 * ef[0] ? 3 : 2), f(ef[1], ef[0] > 1 ? ef[0] : 2)],
      'n(C) = ' + mc2 + ' / 44.01 = ' + sig(Number(mc2) / molar('CO2'), 3) + ' mol and n(H) = 2 × ' + mh + ' / 18.02 = ' + sig(2 * Number(mh) / molar('H2O'), 3) + ' mol. The ratio reduces to ' + ef[0] + ' : ' + ef[1] + '.', { k: 'n' });
  } },
  { t: 'h7', make: function (R) {
    var e = R.p([['CH2O', 'CH₂O', 'C', 'H', 'O', [1, 2, 1]], ['CH2', 'CH₂', 'C', 'H', '', [1, 2, 0]], ['C2H5', 'C₂H₅', 'C', 'H', '', [2, 5, 0]], ['C2H5NO', 'C₂H₅NO', 'C', 'H', 'NO', [2, 5, 1]], ['CH', 'CH', 'C', 'H', '', [1, 1, 0]], ['C3H4O3', 'C₃H₄O₃', 'C', 'H', 'O', [3, 4, 3]]]);
    var k = R.i(2, 6), Me = molar(e[0]), Mm = Math.round(Me * k);
    function mult(n) { return chemF(e[0].replace(/([A-Z][a-z]?)(\d*)/g, function (m, el, c) { var v = (c ? +c : 1) * n; return el + (v > 1 ? v : ''); })); }
    return gmc(R, nid('molf'), 'h7', 'A compound has empirical formula ' + e[1] + ' and a molar mass of about ' + Mm + ' g/mol. What is its molecular formula?', mult(k),
      [mult(k + 1), mult(k - 1 || 1), mult(k * 2), chemF(e[0])], e[1] + ' has a mass of ' + Me.toFixed(2) + ' g/mol. ' + Mm + ' / ' + Me.toFixed(2) + ' = ' + k + ', so multiply every subscript by ' + k + '.', { k: 'c' });
  } },
  { t: 'h8', make: function (R) {
    var g = R.p(GASES), V = m3(R, 0.5, 25), T = R.i(-20, 150), P = m3(R, 0.8, 9), n = P * V / (Rg * (T + 273.15)), m = n * molar(g[1]);
    return num(nid('igm'), 'h8', 'A ' + V + ' L rigid tank holds ' + g[0] + ' at ' + minus(T) + ' °C and ' + P + ' atm. What mass of gas is inside? Give 3 significant figures.', sig(m, 3),
      'n = PV/RT with T in kelvin and R = 0.082057 L·atm/(mol·K).', 'n = (' + P + ')(' + V + ') / (0.082057 × ' + (T + 273.15).toFixed(2) + ') = ' + sig(n, 4) + ' mol × ' + molar(g[1]).toFixed(2) + ' = ' + sig(m, 3) + ' g.', null, null, { sf: 3, unit: 'g' });
  } },
  { t: 'h8', make: function (R) {
    var g = R.p(GASES), T = R.i(-20, 200), P = m3(R, 0.5, 5), d = P * molar(g[1]) / (Rg * (T + 273.15));
    return num(nid('igd'), 'h8', 'What is the density of ' + g[0] + ' at ' + P + ' atm and ' + minus(T) + ' °C, in g/L? Give 3 significant figures.', sig(d, 3),
      'ρ = PM / RT.', '(' + P + ')(' + molar(g[1]).toFixed(2) + ') / (0.082057 × ' + (T + 273.15).toFixed(2) + ') = ' + sig(d, 3) + ' g/L.', null, null, { sf: 3, unit: 'g/L' });
  } },
  { t: 'h8', make: function (R) {
    var P1 = m3(R, 0.8, 6), T1 = R.i(0, 60), T2 = T1 + R.i(20, 250), P2 = P1 * (T2 + 273.15) / (T1 + 273.15);
    return num(nid('igt'), 'h8', 'A rigid sealed container of gas at ' + P1 + ' atm is heated from ' + T1 + ' °C to ' + T2 + ' °C. What is the new pressure in atm? Give 3 significant figures.', sig(P2, 3),
      'Fixed V and n: P is proportional to absolute T.', P1 + ' × (' + (T2 + 273.15).toFixed(2) + ' / ' + (T1 + 273.15).toFixed(2) + ') = ' + sig(P2, 3) + ' atm. Using °C directly would give the wrong ratio.', null, null, { sf: 3, unit: 'atm' });
  } },
  { t: 'h8', make: function (R) {
    var g = R.p(GASES), V = m3(R, 0.2, 3), T = R.i(0, 100), P = m3(R, 0.5, 3), m = Number(sig(P * V / (Rg * (T + 273.15)) * molar(g[1]), 3)), M = m * Rg * (T + 273.15) / (P * V);
    return num(nid('igM'), 'h8', 'A ' + m + ' g sample of an unknown gas fills ' + V + ' L at ' + P + ' atm and ' + T + ' °C. What is its molar mass in g/mol? Give 3 significant figures.', sig(M, 3),
      'M = mRT / PV.', '(' + m + ')(0.082057)(' + (T + 273.15).toFixed(2) + ') / ((' + P + ')(' + V + ')) = ' + sig(M, 3) + ' g/mol, close to ' + g[0] + '.', null, null, { sf: 3, unit: 'g/mol' });
  } },
  { t: 'h9', make: function (R) {
    var pair = R.sh(GASES).slice(0, 2), m1 = m3(R, 1, 40), m2 = m3(R, 1, 40), P = m3(R, 0.8, 8), n1 = m1 / molar(pair[0][1]), n2 = m2 / molar(pair[1][1]), p1 = n1 / (n1 + n2) * P;
    return num(nid('pp'), 'h9', 'A mixture of ' + m1 + ' g ' + pair[0][0] + ' and ' + m2 + ' g ' + pair[1][0] + ' has a total pressure of ' + P + ' atm. What is the partial pressure of ' + pair[0][0] + '? Give 3 significant figures.', sig(p1, 3),
      'P₁ = y₁ × P(total).', 'n = ' + sig(n1, 4) + ' and ' + sig(n2, 4) + ' mol, so y = ' + sig(n1 / (n1 + n2), 4) + '. × ' + P + ' = ' + sig(p1, 3) + ' atm.', null, null, { sf: 3, unit: 'atm' });
  } },
  { t: 'h9', make: function (R) {
    var V1 = m3(R, 1, 6), P1 = m3(R, 0.5, 6), V2 = m3(R, 1, 6), P2 = m3(R, 0.5, 6), Pf = (P1 * V1 + P2 * V2) / (V1 + V2);
    return num(nid('mix'), 'h9', 'A ' + V1 + ' L tank of neon at ' + P1 + ' atm is connected to a ' + V2 + ' L tank of argon at ' + P2 + ' atm. The valve opens at constant temperature. What is the final total pressure? Give 3 significant figures.', sig(Pf, 3),
      'Each gas expands into the total volume; add the partial pressures.', 'Ne: ' + P1 + ' × ' + V1 + ' / ' + sig(V1 + V2, 4) + ' and Ar: ' + P2 + ' × ' + V2 + ' / ' + sig(V1 + V2, 4) + '. Total ' + sig(Pf, 3) + ' atm.', null, null, { sf: 3, unit: 'atm' });
  } },
  { t: 'h9', make: function (R) {
    var f = R.p([['CH₄', 1, 2, 1, 2], ['C₂H₄', 2, 3, 2, 2], ['C₃H₈', 3, 5, 3, 4], ['C₂H₆', 2, 3.5, 2, 3]]), pf = R.f(0.1, 0.6, 2), xs = R.f(1.1, 3, 1), pO = Number((pf * f[2] * xs).toFixed(2));
    var co2 = pf * f[3], o2 = pO - pf * f[2], tot = co2 + o2;
    return num(nid('rv'), 'h9', 'A rigid vessel holds ' + f[0] + ' at ' + pf.toFixed(2) + ' atm and O<sub>2</sub> at ' + pO.toFixed(2) + ' atm. The fuel burns completely to CO<sub>2</sub> and H<sub>2</sub>O, and the vessel is cooled back to the start temperature so all the water condenses. What is the final pressure in atm? Give 3 significant figures.', sig(tot, 3),
      'At fixed V and T, partial pressures behave like moles. Balance per mole of fuel.', 'Per mole of fuel: ' + f[2] + ' O₂ used, ' + f[3] + ' CO₂ made. CO₂: ' + sig(co2, 3) + ' atm. O₂ left: ' + pO.toFixed(2) + ' − ' + sig(pf * f[2], 3) + ' = ' + sig(o2, 3) + ' atm. Total ' + sig(tot, 3) + ' atm.', null, null, { sf: 3, unit: 'atm' });
  } },
  /* Tutorial 4 style: density of a breathing mix, and the pressure that matches air's density */
  { t: 'h9', make: function (R) {
    var inert = R.p([['He', 'He'], ['Ne', 'Ne'], ['Ar', 'Ar']]), pctO = R.p([18.0, 19.5, 20.0, 21.0, 22.5, 24.0, 30.0, 32.0]), pctI = 100 - pctO;
    var M = (pctI * molar(inert[1]) + pctO * molar('O2')) / 100, AIR = 0.7808 * molar('N2') + 0.2095 * molar('O2') + 0.0093 * molar('Ar') + 0.00036 * molar('CO2');
    var pre = 'A breathing mix is ' + pctI.toFixed(1) + '% ' + inert[0] + ' and ' + pctO.toFixed(1) + '% O<sub>2</sub> by volume. ';
    if (R.chance(0.5)) {
      var tC = R.i(0, 40), P = m3(R, 0.9, 3.5), rho = P * M / (Rg * (tC + 273.15));
      return num(nid('mixd'), 'h9', pre + 'What is its density at ' + tC + ' °C and ' + P + ' atm, in g/L? Give 3 significant figures.', sig(rho, 3),
        'Volume % = mol %. Average molar mass, then ρ = PM/RT.', 'M = ' + (pctI / 100).toFixed(3) + '(' + molar(inert[1]).toFixed(3) + ') + ' + (pctO / 100).toFixed(3) + '(32.00) = ' + M.toFixed(2) + ' g/mol. ρ = ' + P + ' × ' + M.toFixed(2) + ' / (0.082057 × ' + (tC + 273.15).toFixed(2) + ') = ' + sig(rho, 3) + ' g/L.', null, null, { sf: 3, unit: 'g/L' });
    }
    var Pm = AIR / M;
    return num(nid('mixp'), 'h9', pre + 'Air is 78.08% N<sub>2</sub>, 20.95% O<sub>2</sub>, 0.93% Ar and 0.036% CO<sub>2</sub>. At what pressure does the mix have the same density as air at 1.00 atm and the same temperature, in atm? Give 3 significant figures.', sig(Pm, 3),
      'At the same T, density ∝ PM, so P(mix) M(mix) = (1.00 atm) M(air).', 'M(mix) = ' + M.toFixed(2) + ' g/mol and M(air) = ' + AIR.toFixed(2) + ' g/mol. P = ' + AIR.toFixed(2) + ' / ' + M.toFixed(2) + ' = ' + sig(Pm, 3) + ' atm.', null, null, { sf: 3, unit: 'atm' });
  } },
  /* Tutorial 4 style: an inert gas plus a gas that decomposes into more gas molecules */
  { t: 'h9', make: function (R) {
    var rx = R.p([['acetone, CH<sub>3</sub>COCH<sub>3</sub>', 'CH<sub>3</sub>COCH<sub>3</sub> → C<sub>2</sub>H<sub>4</sub> + CO + H<sub>2</sub>', 2], ['N<sub>2</sub>O<sub>4</sub>', 'N<sub>2</sub>O<sub>4</sub> → 2 NO<sub>2</sub>', 1], ['PCl<sub>5</sub>', 'PCl<sub>5</sub> → PCl<sub>3</sub> + Cl<sub>2</sub>', 1], ['ethane', 'C<sub>2</sub>H<sub>6</sub> → C<sub>2</sub>H<sub>4</sub> + H<sub>2</sub>', 1], ['ammonia', '2 NH<sub>3</sub> → N<sub>2</sub> + 3 H<sub>2</sub>', 1], ['dimethyl ether, CH<sub>3</sub>OCH<sub>3</sub>', 'CH<sub>3</sub>OCH<sub>3</sub> → CH<sub>4</sub> + CO + H<sub>2</sub>', 2]]);
    var inert = R.p(['argon', 'helium', 'nitrogen']), P0 = m3(R, 10, 90), y = R.f(0.08, 0.45, 2), Pf = Number(sig(P0 * (1 + rx[2] * y), 3));
    var ans = (Pf - P0) / (rx[2] * P0);
    return num(nid('dec'), 'h9', 'A rigid flask holds ' + inert + ' and ' + rx[0] + ' at ' + P0 + ' kPa. All of the ' + rx[0].split(',')[0] + ' decomposes, ' + rx[1] + ' (all gases), and the pressure rises to ' + Pf + ' kPa at the same temperature. The ' + inert + ' does not react. What was the mole fraction of ' + rx[0].split(',')[0] + ' at the start? Give 2 significant figures.', sig(ans, 2),
      'At fixed T and V, pressure tracks moles. Count the gain in gas molecules per molecule that decomposes.', 'Each molecule that decomposes adds ' + rx[2] + ' gas molecule' + (rx[2] > 1 ? 's' : '') + '. So ' + rx[2] + 'P = ' + Pf + ' − ' + P0 + ' = ' + sig(Pf - P0, 3) + ' kPa, P = ' + sig((Pf - P0) / rx[2], 3) + ' kPa, and y = that / ' + P0 + ' = ' + sig(ans, 2) + '.', null, null, { sf: 2 });
  } },
  { t: 'h10', make: function (R) {
    var g = R.p(GASES), T = R.i(200, 900), u = Math.sqrt(3 * 8.314 * T / (molar(g[1]) / 1000));
    return num(nid('urms'), 'h10', 'What is the rms speed of ' + g[0] + ' at ' + T + ' K, in m/s? Give 3 significant figures.', sig(u, 3),
      'u(rms) = √(3RT/M) with R = 8.314 J/(mol·K) and M in kg/mol.', 'M = ' + (molar(g[1]) / 1000).toFixed(5) + ' kg/mol. √(3 × 8.314 × ' + T + ' / ' + (molar(g[1]) / 1000).toFixed(5) + ') = ' + sig(u, 3) + ' m/s.', null, null, { sf: 3, unit: 'm/s' });
  } },
  { t: 'h10', make: function (R) {
    var p = R.sh(GASES).slice(0, 2), r = Math.sqrt(molar(p[1][1]) / molar(p[0][1]));
    return num(nid('urr'), 'h10', 'At the same temperature, what is u(rms) of ' + p[0][0] + ' divided by u(rms) of ' + p[1][0] + '? Give 3 significant figures.', sig(r, 3),
      'u(rms) is proportional to 1/√M.', '√(' + molar(p[1][1]).toFixed(2) + ' / ' + molar(p[0][1]).toFixed(2) + ') = ' + sig(r, 3) + '.', null, null, { sf: 3 });
  } }
];

/* ==================== MATH 116 ==================== */
function poly(cs, v) { /* cs: [[coef, power]] */
  var s = '';
  cs.forEach(function (t) {
    var c = t[0], p = t[1]; if (!c) return;
    var a = Math.abs(c), sign = c < 0 ? (s ? ' − ' : '−') : (s ? ' + ' : '');
    var body = p === 0 ? String(a) : (a === 1 ? '' : a) + (v || 'x') + (p === 1 ? '' : '<sup>' + p + '</sup>');
    s += sign + body;
  });
  return s || '0';
}
function lin(k) { return poly([[1, 1], [-k, 0]]); }
var TRIPS = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29]];
course('math116').gens = [
  { t: 'k8', make: function (R) {
    var a = R.nz(-5, 5), b = R.nz(-6, 6), v = R.i(0, 2), q, ans, why;
    if (b === a) b = a + 1;
    if (v === 0) { q = '#lim{x→' + minus(a) + '} #frac{' + poly([[1, 2], [-(a + b), 1], [a * b, 0]]) + '}{' + poly([[1, 1], [-a, 0]]) + '}'; ans = String(a - b); why = 'Factor: (' + lin(a) + ')(' + lin(b) + ') / (' + lin(a) + ') = ' + lin(b) + ' → ' + minus(a - b) + '.'; }
    else if (v === 1) { q = '#lim{x→' + minus(a) + '} #frac{x<sup>3</sup> ' + (a * a * a < 0 ? '+ ' + (-a * a * a) : '− ' + a * a * a) + '}{' + poly([[1, 1], [-a, 0]]) + '}'; ans = String(3 * a * a); why = 'Difference of cubes: x³ − a³ = (x − a)(x² + ax + a²). Cancel and substitute: 3a² = ' + 3 * a * a + '.'; }
    else { q = '#lim{x→' + minus(a) + '} #frac{' + poly([[1, 2], [-a * a, 0]]) + '}{' + poly([[1, 2], [-(a + b), 1], [a * b, 0]]) + '}'; ans = frac(2 * a, a - b); why = '(' + lin(a) + ')(' + lin(-a) + ') / ((' + lin(a) + ')(' + lin(b) + ')) = (' + lin(-a) + ')/(' + lin(b) + ') → ' + fracHTML(2 * a, a - b) + '.'; }
    var F = v === 0 ? function (x) { return (x * x - (a + b) * x + a * b) / (x - a); } : v === 1 ? function (x) { return (x * x * x - a * a * a) / (x - a); } : function (x) { return (x * x - a * a) / (x * x - (a + b) * x + a * b); };
    return num(nid('lf'), 'k8', 'Evaluate ' + q + '.', ans, 'Direct substitution gives 0/0. Factor and cancel.', why, null, null, { lim: true, chk: { f: F, at: a } });
  } },
  { t: 'k8', make: function (R) {
    var p = R.nz(-6, 6), r = R.nz(1, 6), s = R.i(-5, 5), q2 = R.i(-9, 9), v = R.i(0, 1), dir = R.chance(0.5) ? '∞' : '−∞';
    if (v === 0) return num(nid('li'), 'k8', 'Evaluate #lim{x→' + dir + '} #frac{' + poly([[p, 2], [q2, 0]]) + '}{' + poly([[r, 2], [s, 1]]) + '}.', frac(p, r), 'Divide top and bottom by x².', 'The x² terms dominate: ' + p + '/' + r + ' = ' + fracHTML(p, r) + '.', null, null, { lim: true, chk: { f: function (x) { return (p * x * x + q2) / (r * x * x + s * x); }, at: dir === '∞' ? 1e7 : -1e7, inf: true } });
    var a = R.nz(-6, 6), c = R.i(1, 5), d = R.i(1, 9), sgn = dir === '∞' ? 1 : -1, e0 = R.i(-5, 5);
    return num(nid('lsq'), 'k8', 'Evaluate #lim{x→' + dir + '} #frac{' + poly([[a, 1], [e0, 0]]) + '}{#sqrt{' + c * c + 'x<sup>2</sup> + ' + d + '}}.', frac(sgn * a, c),
      '√(x²) = |x|, which is ' + (sgn > 0 ? 'x' : '−x') + ' here.', 'Divide by |x|: the top → ' + (sgn > 0 ? a : -a) + ' and the bottom → √' + c * c + ' = ' + c + '. Limit ' + fracHTML(sgn * a, c) + '.', null, null, { lim: true, chk: { f: function (x) { return (a * x + e0) / Math.sqrt(c * c * x * x + d); }, at: sgn * 1e7, inf: true } });
  } },
  { t: 'k8', make: function (R) {
    var k = R.nz(1, 7), m = R.nz(1, 7), v = R.i(0, 2), q, ans, why;
    if (v === 0) { q = '#frac{sin(' + k + 'x)}{' + m + 'x}'; ans = frac(k, m); why = '(' + k + '/' + m + ') · sin(' + k + 'x)/(' + k + 'x) → ' + fracHTML(k, m) + '.'; }
    else if (v === 1) { q = '#frac{tan(' + k + 'x)}{' + m + 'x}'; ans = frac(k, m); why = 'tan(' + k + 'x) = sin(' + k + 'x)/cos(' + k + 'x), and cos → 1. Limit ' + fracHTML(k, m) + '.'; }
    else { q = '#frac{1 − cos(' + k + 'x)}{x<sup>2</sup>}'; ans = frac(k * k, 2); why = 'Multiply by 1 + cos(' + k + 'x): sin²(' + k + 'x)/(x²(1 + cos(' + k + 'x))) → ' + k * k + ' · 1/2 = ' + fracHTML(k * k, 2) + '.'; }
    var F2 = v === 0 ? function (x) { return Math.sin(k * x) / (m * x); } : v === 1 ? function (x) { return Math.tan(k * x) / (m * x); } : function (x) { return (1 - Math.cos(k * x)) / (x * x); };
    return num(nid('ltr'), 'k8', 'Evaluate #lim{x→0} ' + q + '.', ans, 'Use sin(u)/u → 1 as u → 0.', why, null, null, { lim: true, chk: { f: F2, at: 0 } });
  } },
  { t: 'k8', make: function (R) {
    var a = R.i(-4, 8), sq = R.i(2, 5), c = sq * sq - a, inner = poly([[1, 1], [c, 0]]);
    return num(nid('lcj'), 'k8', 'Evaluate #lim{x→' + minus(a) + '} #frac{#sqrt{' + inner + '} − ' + sq + '}{' + lin(a) + '}.', frac(1, 2 * sq),
      'Multiply top and bottom by the conjugate √(' + inner + ') + ' + sq + '.', 'The top becomes (' + inner + ') − ' + sq * sq + ' = ' + lin(a) + ', which cancels with the bottom. What is left is 1/(√(' + inner + ') + ' + sq + ') → 1/' + 2 * sq + '.', null, null, { lim: true, chk: { f: function (x) { return (Math.sqrt(x + c) - sq) / (x - a); }, at: a } });
  } },
  { t: 'k8', make: function (R) {
    var a = R.nz(-5, 5);
    return num(nid('labs'), 'k8', 'Evaluate #lim{x→' + minus(a) + '} #frac{x<sup>2</sup> − ' + a * a + '}{|' + lin(a) + '|}.', 'dne',
      'Check each side: |' + lin(a) + '| = ' + lin(a) + ' on the right and −(' + lin(a) + ') on the left.', 'From the right the expression is ' + lin(-a) + ' → ' + minus(2 * a) + '. From the left it is −(' + lin(-a) + ') → ' + minus(-2 * a) + '. They differ, so the limit does not exist.', null, null, { lim: true, chk: { f: function (x) { return (x * x - a * a) / Math.abs(x - a); }, at: a } });
  } },
  { t: 'k10', make: function (R) {
    var a = R.nz(-4, 4), n = R.i(2, 5), b = R.nz(-6, 6), m = R.i(1, n - 1), c = R.i(-9, 9), x0 = R.i(-2, 2);
    var d = a * n * Math.pow(x0, n - 1) + b * m * Math.pow(x0, m - 1);
    return num(nid('dp'), 'k10', 'If f(x) = ' + poly([[a, n], [b, m], [c, 0]]) + ', what is f′(' + minus(x0) + ')?', String(d), 'Power rule term by term.',
      'f′(x) = ' + poly([[a * n, n - 1], [b * m, m - 1]]) + '. At x = ' + minus(x0) + ': ' + d + '.', null, null, { chk: { d: function (x) { return a * Math.pow(x, n) + b * Math.pow(x, m) + c; }, at: x0 } });
  } },
  { t: 'k10', make: function (R) {
    var a = R.nz(-4, 4), b = R.nz(-5, 5), c = R.nz(-5, 5), d = R.nz(-5, 5), x0 = R.i(-2, 3);
    if (c * x0 + d === 0) d += 1;
    if (a * d - b * c === 0) b += 1;
    return num(nid('dq'), 'k10', 'If f(x) = #frac{' + poly([[a, 1], [b, 0]]) + '}{' + poly([[c, 1], [d, 0]]) + '}, what is f′(' + minus(x0) + ')?', frac(a * d - b * c, (c * x0 + d) * (c * x0 + d)),
      'Quotient rule: (top′·bottom − top·bottom′)/bottom².', 'f′(x) = (' + a + '(' + poly([[c, 1], [d, 0]]) + ') − (' + c + ')(' + poly([[a, 1], [b, 0]]) + '))/(' + poly([[c, 1], [d, 0]]) + ')² = ' + minus(a * d - b * c) + '/(' + poly([[c, 1], [d, 0]]) + ')². At ' + minus(x0) + ': ' + fracHTML(a * d - b * c, (c * x0 + d) * (c * x0 + d)) + '.', null, null, { chk: { d: function (x) { return (a * x + b) / (c * x + d); }, at: x0 } });
  } },
  { t: 'k10', make: function (R) {
    var a = R.nz(-3, 3), b = R.nz(-4, 4), n = R.i(2, 5), x0 = R.i(-1, 2);
    var d = n * Math.pow(a * x0 + b, n - 1) * a;
    return num(nid('dc'), 'k10', 'If f(x) = (' + poly([[a, 1], [b, 0]]) + ')<sup>' + n + '</sup>, what is f′(' + minus(x0) + ')?', String(d), 'Chain rule.', 'f′(x) = ' + n + '(' + poly([[a, 1], [b, 0]]) + ')<sup>' + (n - 1) + '</sup> · ' + a + '. At ' + minus(x0) + ': ' + n + '(' + (a * x0 + b) + ')<sup>' + (n - 1) + '</sup>(' + a + ') = ' + d + '.', null, null, { chk: { d: function (x) { return Math.pow(a * x + b, n); }, at: x0 } });
  } },
  { t: 'k10', make: function (R) {
    var tr = R.p(TRIPS), sx = R.sg(), sy = R.sg(), p = tr[0] * sx, q = tr[1] * sy;
    if (R.chance(0.5)) { var t = p; p = q; q = t; }
    return num(nid('dimp'), 'k10', 'Find the slope of the tangent line to x<sup>2</sup> + y<sup>2</sup> = ' + tr[2] * tr[2] + ' at (' + minus(p) + ', ' + minus(q) + ').', frac(-p, q),
      'Differentiate implicitly: 2x + 2y y′ = 0.', 'y′ = −x/y = −(' + p + ')/(' + q + ') = ' + fracHTML(-p, q) + '.', null, null, { chk: { d: function (x) { return Math.sign(q) * Math.sqrt(tr[2] * tr[2] - x * x); }, at: p } });
  } },
  { t: 'k10', make: function (R) {
    var b = R.i(-6, 6), c = R.i(-9, 9), x0 = R.i(-3, 3), m = 2 * x0 + b, y0 = x0 * x0 + b * x0 + c, bb = y0 - m * x0;
    return multi(nid('tl'), 'k10', 'Find the tangent line to y = ' + poly([[1, 2], [b, 1], [c, 0]]) + ' at x = ' + minus(x0) + ', in the form y = mx + b.', [
      { ask: 'Find m.', ans: String(m), hint: 'm = y′(' + minus(x0) + ').', why: 'y′ = 2x + ' + b + ', so m = ' + m + '.' },
      { ask: 'Find b.', ans: String(bb), hint: 'The line passes through (' + minus(x0) + ', y(' + minus(x0) + ')).', why: 'y(' + minus(x0) + ') = ' + y0 + '. b = ' + y0 + ' − (' + m + ')(' + x0 + ') = ' + bb + '.' }
    ], 'deriv', { chk: { tl: function (x) { return x * x + b * x + c; }, at: x0 } });
  } },
  { t: 'k2', make: function (R) {
    var a, b, c, d;
    do { a = R.nz(-4, 4); b = R.i(-5, 5); c = R.nz(-3, 3); d = R.i(-5, 5); } while (a * d - b * c === 0);
    var pts = [-3.5, -1.5, 0.5, 1.7, 2.9, 4.3, 6.1].filter(function (x) { return Math.abs(c * x - a) > 0.3; });
    return num(nid('inv'), 'k2', 'Let f(x) = #frac{' + poly([[a, 1], [b, 0]]) + '}{' + poly([[c, 1], [d, 0]]) + '}. Find f<sup>−1</sup>(x).', '(' + b + '-(' + d + ')*x)/((' + c + ')*x-(' + a + '))',
      'Write y = f(x) and solve for x.', 'y(' + poly([[c, 1], [d, 0]]) + ') = ' + poly([[a, 1], [b, 0]]) + ' gives x(' + poly([[c, 1], [-a, 0]], 'y') + ') = ' + poly([[-d, 1], [b, 0]], 'y') + ', so f<sup>−1</sup>(x) = (' + poly([[-d, 1], [b, 0]]) + ')/(' + poly([[c, 1], [-a, 0]]) + ').', null, null, { kind: 'expr', pts: pts, chk: { inv: function (x) { return (a * x + b) / (c * x + d); } } });
  } },
  { t: 'k2', make: function (R) {
    var a = R.nz(-4, 4), b = R.i(-5, 5), c = R.i(-5, 5), k = R.i(-3, 3);
    var fg = a * (k * k + c) + b, gf = (a * k + b) * (a * k + b) + c;
    return num(nid('comp'), 'k2', 'Let f(x) = ' + poly([[a, 1], [b, 0]]) + ' and g(x) = ' + poly([[1, 2], [c, 0]]) + '. Compute (f∘g)(' + minus(k) + ') − (g∘f)(' + minus(k) + ').', String(fg - gf),
      'Do the inside function first each time.', '(f∘g)(' + minus(k) + ') = f(' + (k * k + c) + ') = ' + fg + '. (g∘f)(' + minus(k) + ') = g(' + (a * k + b) + ') = ' + gf + '. Difference ' + (fg - gf) + '.');
  } },
  { t: 'k6', make: function (R) {
    var ph = R.p([[1, 6], [1, 4], [1, 3], [2, 3], [3, 4], [5, 6], [-1, 6], [-1, 4], [-1, 3], [-2, 3], [-3, 4], [-5, 6]]), k = R.i(1, 3), w = R.i(1, 4);
    var quarter = ph[1] === 4, phi = ph[0] * Math.PI / ph[1], A, B, As, Bs, Cs, Ca;
    function sgnStr(v, mag, first) { return (v < 0 ? (first ? '−' : ' − ') : (first ? '' : ' + ')) + mag; }
    if (quarter) { A = Math.sign(Math.cos(phi)) * k; B = Math.sign(Math.sin(phi)) * k; As = k === 1 ? '' : String(k); Bs = As; Cs = (k === 1 ? '' : k) + '√2'; Ca = (k === 1 ? '' : k + '*') + 'sqrt(2)'; }
    else {
      var c6 = Math.cos(phi) * 2, s6 = Math.sin(phi) * 2; /* one of these is ±√3, the other ±1 */
      A = c6 * k; B = s6 * k;
      function mag(v) { return Math.abs(Math.abs(v) - Math.sqrt(3)) < 1e-9 ? (k === 1 ? '' : k) + '√3' : (k === 1 ? '' : String(k)); }
      As = mag(c6); Bs = mag(s6); Cs = String(2 * k); Ca = String(2 * k);
    }
    var wx = (w === 1 ? '' : w) + 'x', phS = (ph[0] < 0 ? '-' : '') + (Math.abs(ph[0]) === 1 ? '' : Math.abs(ph[0])) + 'pi/' + ph[1];
    var q = 'Write f(x) = ' + sgnStr(A, As, true) + ' sin(' + wx + ')' + sgnStr(B, Bs, false) + ' cos(' + wx + ') as C sin(' + wx + ' + φ), with C &gt; 0 and −π &lt; φ ≤ π.';
    return multi(nid('gs'), 'k6', q, [
      { ask: 'Find C.', ans: Ca, hint: 'C = √(A² + B²), where A and B are the coefficients of sin and cos.', why: 'C = √(' + sig(A * A, 3) + ' + ' + sig(B * B, 3) + ') = ' + Cs + '.' },
      { ask: 'Find φ. Exact forms like 5pi/6 are fine.', ans: phS, chkAB: [A, B, w], hint: 'C cos φ = coefficient of sin and C sin φ = coefficient of cos. Check the quadrant.', why: 'cos φ = ' + (A < 0 ? '−' : '') + (quarter ? '√2/2' : (Math.abs(Math.abs(A / k) - Math.sqrt(3)) < 1e-9 ? '√3/2' : '1/2')) + ' and sin φ = ' + (B < 0 ? '−' : '') + (quarter ? '√2/2' : (Math.abs(Math.abs(B / k) - Math.sqrt(3)) < 1e-9 ? '√3/2' : '1/2')) + ', so φ = ' + phS.replace('pi', 'π').replace('-', '−') + '.' }
    ], 'trig');
  } },
  { t: 'k6', make: function (R) {
    var tr = R.p(TRIPS), v = R.i(0, 2), p = tr[0], q = tr[1], h = tr[2], s, ans, why;
    if (R.chance(0.5)) { var t = p; p = q; q = t; }
    if (v === 0) { s = 'cos(tan<sup>−1</sup>(' + p + '/' + q + '))'; ans = frac(q, h); why = 'Opposite ' + p + ', adjacent ' + q + ', hypotenuse ' + h + '. cos = ' + q + '/' + h + '.'; }
    else if (v === 1) { s = 'sin(cos<sup>−1</sup>(' + q + '/' + h + '))'; ans = frac(p, h); why = 'Adjacent ' + q + ', hypotenuse ' + h + ', so opposite = ' + p + '. sin = ' + p + '/' + h + '.'; }
    else { s = 'tan(sin<sup>−1</sup>(' + p + '/' + h + '))'; ans = frac(p, q); why = 'Opposite ' + p + ', hypotenuse ' + h + ', so adjacent = ' + q + '. tan = ' + p + '/' + q + '.'; }
    var val = v === 0 ? Math.cos(Math.atan(p / q)) : v === 1 ? Math.sin(Math.acos(q / h)) : Math.tan(Math.asin(p / h));
    return num(nid('it'), 'k6', 'Find the exact value of ' + s + '.', ans, 'Draw the right triangle.', why, null, null, { chk: { val: val } });
  } },
  { t: 'k5', make: function (R) {
    var base = R.p([2, 3, 5, 10]), p = R.i(1, 4), q = R.i(1, 3), r = (p + q) * R.i(1, 3);
    var ex = r / (p + q);
    return num(nid('lg'), 'k5', 'Solve log<sub>' + base + '</sub>(x<sup>' + p + '</sup>) + log<sub>' + base + '</sub>(x<sup>' + q + '</sup>) = ' + r + ' for x &gt; 0.', String(Math.pow(base, ex)),
      'Combine: (' + p + ' + ' + q + ')·log<sub>' + base + '</sub>x.', (p + q) + ' log<sub>' + base + '</sub>x = ' + r + ', so log<sub>' + base + '</sub>x = ' + ex + ' and x = ' + base + '<sup>' + ex + '</sup> = ' + Math.pow(base, ex) + '.', null, null, { chk: { root: function (x) { return Math.log(Math.pow(x, p)) / Math.log(base) + Math.log(Math.pow(x, q)) / Math.log(base) - r; } } });
  } },
  { t: 'k4', make: function (R) {
    var a = R.i(-6, 6), b = R.i(1, 6), strict = R.chance(0.5), n = strict ? 2 * b - 1 : 2 * b + 1;
    return num(nid('abs'), 'k4', 'How many integers x satisfy |' + lin(a) + '| ' + (strict ? '&lt;' : '≤') + ' ' + b + '?', String(n),
      'Turn it into a double inequality.', minus(a - b) + ' ' + (strict ? '&lt;' : '≤') + ' x ' + (strict ? '&lt;' : '≤') + ' ' + minus(a + b) + ' contains ' + n + ' integers.');
  } },
  { t: 'k7', make: function (R) {
    var a = R.i(-3, 3), b = R.i(-2, 2), c = R.nz(-4, 4), d = R.i(0, 4), e = R.i(-3, 3), xs = R.sh([-3, -2, -1, 0, 1, 2, 3, 4]).slice(0, 3);
    function f(x) { return (x + a) * (x - b >= 0 ? 1 : 0) + c * (x - d >= 0 ? 1 : 0) + e; }
    var tot = xs.reduce(function (s, x) { return s + f(x); }, 0);
    return num(nid('hv'), 'k7', 'Let h be the Heaviside function (h(t) = 1 for t ≥ 0, else 0) and f(x) = (' + lin(-a) + ')h(' + lin(b) + ') ' + (c < 0 ? '− ' + (-c) : '+ ' + c) + 'h(' + lin(d) + ')' + (e ? (e < 0 ? ' − ' + (-e) : ' + ' + e) : '') + '. Compute ' + xs.map(function (x) { return 'f(' + minus(x) + ')'; }).join(' + ') + '.', String(tot),
      'Evaluate each h term as 0 or 1 at each point.', xs.map(function (x) { return 'f(' + minus(x) + ') = ' + f(x); }).join(', ') + '. Total ' + tot + '.');
  } },
  { t: 'k9', make: function (R) {
    var a = R.i(-2, 3), m = R.i(-5, 5), c = R.i(-6, 6), r = a * a + m;
    if (a === 0) a = 1;
    return num(nid('cont'), 'k9', 'Find k so that f is continuous at x = ' + minus(a) + ':<br>f(x) = #cases{kx ' + (c < 0 ? '− ' + (-c) : '+ ' + c) + ' | x &lt; ' + minus(a) + ';; x<sup>2</sup> ' + (m < 0 ? '− ' + (-m) : '+ ' + m) + ' | x ≥ ' + minus(a) + '}', frac(a * a + m - c, a),
      'Set the left-hand limit equal to f(' + minus(a) + ').', 'Right side: ' + minus(a) + '² + ' + m + ' = ' + (a * a + m) + '. Left side: ' + minus(a) + 'k + ' + c + '. So k = (' + (a * a + m) + ' − ' + c + ')/' + a + ' = ' + fracHTML(a * a + m - c, a) + '.', null, null, { chk: { cont: function (k, x) { return x < a ? k * x + c : x * x + m; }, at: a } });
  } },
  { t: 'k3', make: function (R) {
    var B = [['x', 1], ['x<sup>2</sup>', 0], ['x<sup>3</sup>', 1], ['sin x', 1], ['cos x', 0], ['tan x', 1], ['|x|', 0], ['sinh x', 1], ['cosh x', 0], ['e<sup>x<sup>2</sup></sup>', 0], ['x<sup>4</sup>', 0]];
    var a = R.p(B), b = R.p(B.filter(function (t) { return t !== a; })), prod = R.chance(0.6), par;
    if (prod) par = (a[1] + b[1]) % 2 === 1 ? 'Odd' : 'Even';
    else par = a[1] === b[1] ? (a[1] ? 'Odd' : 'Even') : 'Neither';
    var f = prod ? a[0] + ' · ' + b[0] : a[0] + ' + ' + b[0];
    return gmc(R, nid('par'), 'k3', 'Is f(x) = ' + f + ' even, odd, or neither?', par, ['Even', 'Odd', 'Neither'].filter(function (x) { return x !== par; }),
      prod ? 'Odd × odd and even × even give even; odd × even gives odd. ' + a[0] + ' is ' + (a[1] ? 'odd' : 'even') + ' and ' + b[0] + ' is ' + (b[1] ? 'odd' : 'even') + '.' : 'A sum of two odd functions is odd and two even is even, but odd + even is neither. ' + a[0] + ' is ' + (a[1] ? 'odd' : 'even') + ' and ' + b[0] + ' is ' + (b[1] ? 'odd' : 'even') + '.');
  } }
];

/* ==================== MTE 100 ==================== */
var CYCLE = ['Need', 'Synthesis', 'Ideation', 'Selection', 'Design', 'Analysis', 'Prototype', 'Validation'];
var HIER = ['Public welfare', 'Employer', 'Client', 'Colleagues', 'Subordinates', 'Yourself'];
var LW = [['Cutting plane line', 0.80], ['Object line', 0.60], ['Hidden line', 0.30], ['Centerline', 0.05], ['Dimension line', 0.05]];
var FK = [['F3', 'Object Snap'], ['F7', 'Grid display'], ['F8', 'Ortho mode'], ['F10', 'Polar Tracking'], ['F11', 'Object Snap Tracking'], ['F12', 'Dynamic Input'], ['F2', 'Command line history']];
course('mte100').gens = [
  { t: 'd9', make: function (R) {
    if (R.chance(0.5)) { var d = R.p([[3, 0.5], [4, 0.7], [5, 0.8], [6, 1], [8, 1.25], [10, 1.5], [12, 1.75], [16, 2]]), turns = R.i(4, 16), L = Number((turns * d[1]).toFixed(2));
      return num(nid('mt'), 'd9', 'How many full turns does an M' + d[0] + ' × ' + d[1] + ' screw need to advance ' + L + ' mm?', String(turns), 'Pitch is the advance per turn.', L + ' mm ÷ ' + d[1] + ' mm per turn = ' + turns + ' turns.'); }
    var u = R.p([['1/4', 20, 'UNC'], ['1/4', 28, 'UNF'], ['3/8', 16, 'UNC'], ['3/8', 24, 'UNF'], ['1/2', 13, 'UNC'], ['1/2', 20, 'UNF']]), inch = R.p([0.25, 0.5, 0.75, 1]), t2 = u[1] * inch;
    return num(nid('ut'), 'd9', 'How many turns move a ' + u[0] + '-' + u[1] + ' ' + u[2] + ' screw ' + inch + ' in deeper?', String(t2), u[1] + ' is threads per inch.', inch + ' in × ' + u[1] + ' threads/in = ' + t2 + ' turns.');
  } },
  { t: 'd10', make: function (R) {
    var n = R.p([2, 4, 5, 8, 10, 16, 20]), L = R.p([2.5, 4, 5, 6, 8, 10, 12, 20, 40, 80]), up = R.chance(0.25);
    var on = up ? L * n : L / n;
    return num(nid('sc'), 'd10', 'A drawing is plotted at ' + (up ? n + ':1' : '1:' + n) + '. How long does a ' + L + ' in edge appear on the paper, in inches?', String(on),
      up ? n + ':1 means the drawing is ' + n + ' times bigger than the part.' : '1:' + n + ' means the real part is ' + n + ' times bigger than the drawing.', (up ? L + ' × ' + n : L + ' ÷ ' + n) + ' = ' + on + ' in on paper. It is still dimensioned as ' + L + '.', null, null, { tol: 0.001 });
  } },
  { t: 'd10', make: function (R) {
    var x0 = R.i(-5, 5), y0 = R.i(-5, 5), L = R.i(2, 12), th = R.p([30, 45, 60, 90, 120, 135, 150, 180, 210, 270, 300]);
    var x = x0 + L * Math.cos(th * Math.PI / 180), y = y0 + L * Math.sin(th * Math.PI / 180);
    return multi(nid('pol'), 'd10', 'A line starts at (' + minus(x0) + ', ' + minus(y0) + ') and you type @' + L + '&lt;' + th + '.', [
      { ask: 'What is the x-coordinate of the end point? Give 3 decimal places.', ans: x.toFixed(3), tol: 0.0006, hint: 'x = x₀ + L cos θ.', why: minus(x0) + ' + ' + L + ' cos ' + th + '° = ' + minus(x.toFixed(3)) + '.' },
      { ask: 'What is the y-coordinate? Give 3 decimal places.', ans: y.toFixed(3), tol: 0.0006, hint: 'y = y₀ + L sin θ.', why: minus(y0) + ' + ' + L + ' sin ' + th + '° = ' + minus(y.toFixed(3)) + '.' }
    ], 'num');
  } },
  { t: 'd2', make: function (R) {
    var raw = [R.i(1, 5), R.i(1, 5), R.i(1, 5)], tot = raw[0] + raw[1] + raw[2], names = R.sh(['cost', 'mass', 'reliability', 'safety', 'looks', 'ease of assembly']).slice(0, 3);
    var sa = [R.i(3, 10), R.i(3, 10), R.i(3, 10)], score = (raw[0] * sa[0] + raw[1] * sa[1] + raw[2] * sa[2]) / tot;
    return num(nid('wdm'), 'd2', 'Raw weights: ' + names.map(function (n, i) { return n + ' ' + raw[i]; }).join(', ') + '. A design scores ' + sa.join(', ') + ' (out of 10) on those criteria. What is its weighted score? Give 2 decimal places.', score.toFixed(2),
      'Normalize each weight by dividing by the sum (' + tot + '), then take the weighted sum.', 'Normalized weights: ' + raw.map(function (w) { return (w / tot).toFixed(3); }).join(', ') + '. Score = ' + sa.map(function (s, i) { return (raw[i] / tot).toFixed(3) + '(' + s + ')'; }).join(' + ') + ' = ' + score.toFixed(2) + '.', null, null, { tol: 0.002 });
  } },
  { t: 'd9', make: function (R) {
    var whole = R.i(1, 40), n16 = R.i(1, 15), dec = whole + n16 / 16, g = gcd(n16, 16);
    var right = whole + ' ' + (n16 / g) + '/' + (16 / g) + ' in';
    function fr(k) { var gg = gcd(k, 16); return whole + ' ' + (k / gg) + '/' + (16 / gg) + ' in'; }
    return gmc(R, nid('tape'), 'd9', 'A tape measure reads in 1/16 in steps. How is ' + dec + ' in written on it?', right,
      [fr(n16 === 15 ? 14 : n16 + 1), fr(n16 === 1 ? 2 : n16 - 1), fr(Math.max(1, Math.min(15, Math.round((dec - whole) * 10))))], (dec - whole) + ' × 16 = ' + n16 + ', so ' + n16 + '/16 = ' + (n16 / g) + '/' + (16 / g) + '.');
  } },
  { t: 'd1', make: function (R) {
    var i = R.i(0, CYCLE.length - 2), after = R.chance(0.6);
    var right = after ? CYCLE[i + 1] : CYCLE[i], asked = after ? CYCLE[i] : CYCLE[i + 1];
    return gmc(R, nid('cyc'), 'd1', 'In the design cycle from lecture, which stage comes right ' + (after ? 'after ' : 'before ') + asked + '?', right, R.sh(CYCLE.filter(function (s) { return s !== right && s !== asked; })).slice(0, 3),
      'The order is ' + CYCLE.join(' → ') + '.');
  } },
  { t: 'd3', make: function (R) {
    var p = R.sh([0, 1, 2, 3, 4, 5]).slice(0, 2), hi = Math.min(p[0], p[1]);
    return gmc(R, nid('hier'), 'd3', 'Under the hierarchy of obligations in the Code of Ethics, which ranks higher: ' + HIER[p[0]].toLowerCase() + ' or ' + HIER[p[1]].toLowerCase() + '?', HIER[hi], [HIER[Math.max(p[0], p[1])], 'They rank equally'],
      'From the top: ' + HIER.join(', ') + '. Public welfare is paramount.');
  } },
  { t: 'd6', make: function (R) {
    var pr = R.sh(LW.filter(function (l, i) { return i < 4; })).slice(0, 2), heavy = pr[0][1] > pr[1][1] ? pr[0] : pr[1];
    return gmc(R, nid('lw'), 'd6', 'Which line is drawn heavier: a ' + pr[0][0].toLowerCase() + ' or a ' + pr[1][0].toLowerCase() + '?', heavy[0], [(heavy === pr[0] ? pr[1] : pr[0])[0], 'They are the same weight'],
      'From the slides: cutting plane 0.80 mm, object 0.60 mm, hidden 0.30 mm, center and dimension 0.05 mm.');
  } },
  { t: 'd10', make: function (R) {
    var k = R.p(FK);
    return gmc(R, nid('fk'), 'd10', 'In AutoCAD, what does ' + k[0] + ' toggle?', k[1], R.sh(FK.filter(function (x) { return x !== k; })).slice(0, 3).map(function (x) { return x[1]; }),
      FK.map(function (x) { return x[0] + ' is ' + x[1]; }).join('; ') + '.');
  } }
];
})();
