/* ============================================================
   SHARED HELPERS (used by the course data files)
   ============================================================ */
var COURSES = [];
function dedent(s) {
  s = String(s).replace(/^\n+/, '').replace(/\s+$/, '');
  var lines = s.split('\n'), min = Infinity;
  lines.forEach(function (l) { if (l.trim()) min = Math.min(min, l.match(/^ */)[0].length); });
  if (min === Infinity) min = 0;
  return lines.map(function (l) { return l.slice(min); }).join('\n');
}
function rawTag(strs, args) { var out = ''; for (var i = 0; i < strs.raw.length; i++) { out += strs.raw[i]; if (i < args.length) out += args[i]; } return out; }
/* C`code` is a code block, K`code` is inline code */
function C(strs) { return '\u0001' + dedent(rawTag(strs, [].slice.call(arguments, 1))) + '\u0002'; }
function K(strs) { return '\u0003' + rawTag(strs, [].slice.call(arguments, 1)) + '\u0004'; }

function ext(o, x) { if (x) for (var k in x) if (k !== 'test') o[k] = x[k]; return o; }
function mc(id, t, q, opts, a, why, x) { return ext({ id: id, t: t, type: 'mc', q: q, opts: opts, a: a, why: why }, x); }
function num(id, t, q, ans, hint, why, labels, lp, x) { return ext({ id: id, t: t, type: 'num', q: q, ans: ans, hint: hint, why: why, labels: labels, lp: lp }, x); }
function multi(id, t, stem, parts, lp, x) { return ext({ id: id, t: t, type: 'multi', q: stem, parts: parts, lp: lp }, x); }
function proof(id, t, q, steps, extra, why) { return { id: id, t: t, type: 'proof', q: q, steps: steps, extra: extra, why: why, lp: 'proof' }; }
function order(id, t, q, steps, extra, why, x) { return ext({ id: id, t: t, type: 'order', q: q, steps: steps, extra: extra || [], why: why, lp: 'order' }, x); }
function txt(id, t, q, ans, hint, why, x) { return ext({ id: id, t: t, type: 'txt', q: q, ans: ans, hint: hint, why: why, lp: 'txt' }, x); }

/* small function plots for multiple-choice graph options */
function plot(segs, o) {
  o = o || {};
  var xr = o.xr || [-4, 4], yr = o.yr || [-3, 3], W = 240, H = 180, p = 14;
  function X(x) { return (p + (x - xr[0]) / (xr[1] - xr[0]) * (W - 2 * p)).toFixed(1); }
  function Y(y) { return (H - p - (y - yr[0]) / (yr[1] - yr[0]) * (H - 2 * p)).toFixed(1); }
  var s = '<svg class="dg pl" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + (o.label || 'graph') + '">';
  for (var gx = Math.ceil(xr[0]); gx <= xr[1]; gx++) if (gx) s += '<path class="pl-g" d="M' + X(gx) + ' ' + p + ' V' + (H - p) + '"/>';
  for (var gy = Math.ceil(yr[0]); gy <= yr[1]; gy++) if (gy) s += '<path class="pl-g" d="M' + p + ' ' + Y(gy) + ' H' + (W - p) + '"/>';
  s += '<path class="pl-ax" d="M' + p + ' ' + Y(0) + ' H' + (W - p) + ' M' + X(0) + ' ' + p + ' V' + (H - p) + '"/>';
  [-4, -2, 2, 4].forEach(function (t) { if (t > xr[0] && t < xr[1]) s += '<text class="pl-t" x="' + X(t) + '" y="' + (+Y(0) + 15) + '" text-anchor="middle">' + String(t).replace('-', '−') + '</text>'; });
  [-2, 2].forEach(function (t) { if (t > yr[0] && t < yr[1]) s += '<text class="pl-t" x="' + (+X(0) - 5) + '" y="' + (+Y(t) + 4.5) + '" text-anchor="end">' + String(t).replace('-', '−') + '</text>'; });
  segs.forEach(function (g) {
    var pts = g.pts;
    if (!pts) { pts = []; for (var i = 0; i <= 60; i++) { var x = g.a + (g.b - g.a) * i / 60; pts.push([x, g.f(x)]); } }
    s += '<path class="pl-c" d="M' + pts.map(function (q) { return X(q[0]) + ' ' + Y(q[1]); }).join(' L') + '"/>';
  });
  (o.dots || []).forEach(function (d) { s += '<circle class="' + (d[2] ? 'pl-open' : 'pl-dot') + '" cx="' + X(d[0]) + '" cy="' + Y(d[1]) + '" r="3.6"/>'; });
  return s + '</svg>';
}

/* ============================================================
   FORMATTING: code, TeX-lite (#frac #sqrt #lim #cases), matrices
   ============================================================ */
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
var KW = {};
('int double float bool char string void return if else for while do const true false using namespace std cout cin endl ' +
 'ifstream ofstream break continue auto long short unsigned').split(' ').forEach(function (k) { KW[k] = 1; });
function hl(code) {
  var re = /(\/\/[^\n]*)|("(?:[^"\\\n]|\\.)*")|('(?:[^'\\\n]|\\.)*')|(#[ \t]*include[^\n]*)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_]\w*)|([\s\S])/g, m, out = '';
  while ((m = re.exec(code))) {
    if (m[1]) out += '<span class="tk-c">' + esc(m[1]) + '</span>';
    else if (m[2] || m[3]) out += '<span class="tk-s">' + esc(m[2] || m[3]) + '</span>';
    else if (m[4]) out += '<span class="tk-p">' + esc(m[4]) + '</span>';
    else if (m[5]) out += '<span class="tk-n">' + m[5] + '</span>';
    else if (m[6]) out += KW[m[6]] ? '<span class="tk-k">' + m[6] + '</span>' : m[6];
    else out += esc(m[7]);
  }
  return out;
}
function grab(s, j) {
  var d = 0, k = j;
  for (; k < s.length; k++) { if (s.charAt(k) === '{') d++; else if (s.charAt(k) === '}') { d--; if (d === 0) break; } }
  return { body: s.slice(j + 1, k), end: k + 1 };
}
function tex(s) {
  var out = '', i = 0, ARGS = { frac: 2, sqrt: 1, lim: 1, cases: 1 };
  while (i < s.length) {
    var ch = s.charAt(i);
    if (ch === '#') {
      var m = /^#([a-z]+)\{/.exec(s.slice(i));
      if (m && ARGS[m[1]]) {
        var j = i + m[0].length - 1, args = [];
        for (var a = 0; a < ARGS[m[1]] && s.charAt(j) === '{'; a++) { var r = grab(s, j); args.push(r.body); j = r.end; }
        out += texCmd(m[1], args); i = j; continue;
      }
    }
    out += ch; i++;
  }
  return out;
}
function texCmd(name, a) {
  if (name === 'frac') return '<span class="fr"><span>' + tex(a[0]) + '</span><span>' + tex(a[1] || '') + '</span></span>';
  if (name === 'sqrt') return '<span class="sq">√<span class="sq-a">' + tex(a[0]) + '</span></span>';
  if (name === 'lim') return '<span class="lm"><span>lim</span><span class="lm-s">' + tex(a[0]) + '</span></span>';
  var rows = a[0].split(';;');
  return '<span class="cs"><svg class="cs-b" viewBox="0 0 10 100" preserveAspectRatio="none" aria-hidden="true"><path d="M9 1 C4 1 5 8 5 18 V38 C5 46 3 49 1 50 C3 51 5 54 5 62 V82 C5 92 4 99 9 99"/></svg><span class="cs-g">' + rows.map(function (r) {
    var k = r.lastIndexOf(' | '), e = k < 0 ? r : r.slice(0, k), c = k < 0 ? '' : r.slice(k + 3);
    return '<span>' + tex(e.trim()) + '</span><span>if ' + tex(c.trim()) + '</span>';
  }).join('') + '</span></span>';
}
function minus(s) { return String(s).replace(/-/g, '−'); }
function matHTML(body, aug) {
  var rows = body.split(';').map(function (r) { return r.split(',').map(function (c) { return c.trim(); }); });
  var cols = rows[0].length, h = '<span class="mat" style="--cols:' + cols + '">';
  rows.forEach(function (r) { r.forEach(function (c, j) { h += '<span' + (aug && j === cols - 2 ? ' class="sep"' : '') + '>' + minus(c) + '</span>'; }); });
  return h + '</span>';
}
function vecHTML(body) {
  return '<span class="mat" style="--cols:1">' + body.split(',').map(function (c) { return '<span>' + minus(c.trim()) + '</span>'; }).join('') + '</span>';
}
function fmt(s) {
  if (s == null) return '';
  var keep = [];
  s = String(s)
    .replace(/\u0001([\s\S]*?)\u0002/g, function (m, c) { keep.push('<pre class="code">' + hl(c) + '</pre>'); return '\u0005' + (keep.length - 1) + '\u0006'; })
    .replace(/\u0003([\s\S]*?)\u0004/g, function (m, c) { keep.push('<code class="ic">' + hl(c) + '</code>'); return '\u0005' + (keep.length - 1) + '\u0006'; });
  s = tex(s)
    .replace(/\[\[(\|)?([^\]]+)\]\]/g, function (m, aug, b) { return matHTML(b, !!aug); })
    .replace(/\{\{([^}]*)\}\}/g, function (m, b) { return vecHTML(b); })
    .replace(/~([^~]+)~/g, '<span class="vv">$1</span>')
    .replace(/\^\{([^}]*)\}/g, '<sup>$1</sup>')
    .replace(/_\{([^}]*)\}/g, '<sub>$1</sub>');
  return s.replace(/\u0005(\d+)\u0006/g, function (m, i) { return keep[+i]; });
}
function codeTile(s) { return hl(String(s)); }
