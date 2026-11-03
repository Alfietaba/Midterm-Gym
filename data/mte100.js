/* ================= MTE 100 ================= */
(function () {
var T = [
  { id: 'd1', name: 'Mechatronics and the design cycle', sec: 'DCAP' },
  { id: 'd2', name: 'Problem definition and selection', sec: 'DCAP' },
  { id: 'd3', name: 'Engineering in Canada and ethics', sec: 'DCAP' },
  { id: 'd4', name: 'Sketching and pictorials', sec: 'EGAD week 1' },
  { id: 'd5', name: 'Orthographic projection', sec: 'EGAD week 2' },
  { id: 'd6', name: 'Drawing standards and linetypes', sec: 'EGAD weeks 1, 3' },
  { id: 'd7', name: 'Dimensioning', sec: 'EGAD week 4' },
  { id: 'd8', name: 'Section views', sec: 'EGAD week 4' },
  { id: 'd9', name: 'Threads, holes and shop tools', sec: 'EGAD weeks 2, 3' },
  { id: 'd10', name: 'AutoCAD', sec: 'EGAD weeks 1 to 4' }
];

/* ---------- drawing helpers ---------- */
var uid = 0;
function iso(x, y, z) { return [(x + y) / Math.SQRT2, (x - y - 2 * z) / Math.sqrt(6)]; }
function isoSVG(faces, extra, label) {
  var S = 26, all = [];
  faces.forEach(function (f) { f.pts.forEach(function (p) { all.push(iso(p[0], p[1], p[2])); }); });
  var xs = all.map(function (p) { return p[0]; }), ys = all.map(function (p) { return p[1]; });
  var x0 = Math.min.apply(null, xs), y0 = Math.min.apply(null, ys), w = Math.max.apply(null, xs) - x0, hh = Math.max.apply(null, ys) - y0;
  function tp(p) { var q = iso(p[0], p[1], p[2]); return ((q[0] - x0) * S + 8).toFixed(1) + ' ' + ((q[1] - y0) * S + 8).toFixed(1); }
  var body = faces.map(function (f) { return '<path class="' + f.cls + '" d="M' + f.pts.map(tp).join(' L') + ' Z"/>'; }).join('');
  if (extra) body += extra(tp);
  return '<svg class="dg iso" viewBox="0 0 ' + (w * S + 16).toFixed(0) + ' ' + (hh * S + 16).toFixed(0) + '" role="img" aria-label="' + label + '">' + body + '</svg>';
}
/* orthographic view: w x h units, y up; items: [kind, ...coords] */
function view(w, h, items, label) {
  var S = 26, m = 10;
  function X(x) { return (x * S + m).toFixed(1); }
  function Y(y) { return ((h - y) * S + m).toFixed(1); }
  var b = '';
  items.forEach(function (it) {
    var k = it[0];
    if (k === 'poly') b += '<path class="dg-l" d="M' + it[1].map(function (p) { return X(p[0]) + ' ' + Y(p[1]); }).join(' L') + ' Z"/>';
    else b += '<path class="' + ({ line: 'dg-l', hid: 'dg-hid', cen: 'dg-cen' })[k] + '" d="M' + X(it[1]) + ' ' + Y(it[2]) + ' L' + X(it[3]) + ' ' + Y(it[4]) + '"/>';
  });
  return '<svg class="dg vw" viewBox="0 0 ' + (w * S + 2 * m) + ' ' + (h * S + 2 * m) + '" role="img" aria-label="' + label + '">' + b + '</svg>';
}
/* L-block: base 4 x 2 x 1, upright 1 x 2 x 2 on its left end */
var LBLOCK = isoSVG([
  { cls: 'f-front', pts: [[0, 0, 0], [4, 0, 0], [4, 0, 1], [1, 0, 1], [1, 0, 3], [0, 0, 3]] },
  { cls: 'f-side', pts: [[4, 0, 0], [4, 2, 0], [4, 2, 1], [4, 0, 1]] },
  { cls: 'f-side', pts: [[1, 0, 1], [1, 2, 1], [1, 2, 3], [1, 0, 3]] },
  { cls: 'f-top', pts: [[1, 0, 1], [4, 0, 1], [4, 2, 1], [1, 2, 1]] },
  { cls: 'f-top', pts: [[0, 0, 3], [1, 0, 3], [1, 2, 3], [0, 2, 3]] }
], null, 'Isometric view of an L-shaped block. A long low base runs to the right, and a tall upright rises at its left end. The front face is shaded blue.');
/* drilled block 4 x 2 x 1.5 with vertical hole d = 1 at (2, 1) */
var DRILL = isoSVG([
  { cls: 'f-front', pts: [[0, 0, 0], [4, 0, 0], [4, 0, 1.5], [0, 0, 1.5]] },
  { cls: 'f-side', pts: [[4, 0, 0], [4, 2, 0], [4, 2, 1.5], [4, 0, 1.5]] },
  { cls: 'f-top', pts: [[0, 0, 1.5], [4, 0, 1.5], [4, 2, 1.5], [0, 2, 1.5]] }
], function (tp) {
  var p = [];
  for (var i = 0; i <= 40; i++) { var a = i / 40 * 2 * Math.PI; p.push(tp([2 + 0.5 * Math.cos(a), 1 + 0.5 * Math.sin(a), 1.5])); }
  return '<path class="f-hole" d="M' + p.join(' L') + ' Z"/>';
}, 'Isometric view of a rectangular block with a round hole drilled straight down through the middle of the top face.');
var LINES = '<svg class="dg" viewBox="0 0 300 150" role="img" aria-label="Four line samples. 1 is a thick solid line. 2 is a medium dashed line. 3 is a thin line with alternating long and short dashes. 4 is an extra-thick line with long dashes and double short dashes, ending in arrows.">' +
  '<text class="dg-t" x="8" y="26">1</text><path class="ls1" d="M30 22 H290"/>' +
  '<text class="dg-t" x="8" y="60">2</text><path class="ls2" d="M30 56 H290"/>' +
  '<text class="dg-t" x="8" y="94">3</text><path class="ls3" d="M30 90 H290"/>' +
  '<text class="dg-t" x="8" y="132">4</text><path class="ls4" d="M40 128 H280"/><path class="ls4a" d="M40 128 V112 M280 128 V112"/><path class="ls4h" d="M34 116 L40 104 L46 116 Z M274 116 L280 104 L286 116 Z"/></svg>';
function hole(kind) {
  var id = 'hx' + (++uid), d;
  /* half-width units: plate 0..100 wide, 0..60 tall; hole centred at 50 */
  if (kind === 'cb') d = 'M10 10 H32 V30 H40 V70 H10 Z M68 10 H90 V70 H60 V30 H68 Z';
  else if (kind === 'cs') d = 'M10 10 H28 L40 26 V70 H10 Z M72 10 H90 V70 H60 V26 Z';
  else if (kind === 'blind') d = 'M10 10 H40 V50 L50 58 L60 50 V10 H90 V70 H10 Z';
  else d = 'M10 10 H40 V70 H10 Z M60 10 H90 V70 H60 Z';
  var names = { cb: 'counterbored', cs: 'countersunk', blind: 'blind', thru: 'through' };
  return '<svg class="dg hole" viewBox="0 0 100 80" role="img" aria-label="Cross-section of a plate with a ' + names[kind] + ' hole"><defs><pattern id="' + id + '" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path class="dg-hatch" d="M0 0 V7"/></pattern></defs>' +
    '<path d="' + d + '" fill="url(#' + id + ')" class="dg-cut"/><path class="dg-cen" d="M50 4 V76"/></svg>';
}
var LAYOUT = '<svg class="dg" viewBox="0 0 240 170" role="img" aria-label="Layout grid. The front view is in the centre. Box A is above it, box B below it, box C to its right and box D to its left.">' +
  '<rect class="dg-box f" x="90" y="62" width="60" height="44"/><text class="dg-s" x="120" y="88" text-anchor="middle">FRONT</text>' +
  '<rect class="dg-box" x="90" y="8" width="60" height="44"/><text class="dg-t" x="120" y="35" text-anchor="middle">A</text>' +
  '<rect class="dg-box" x="90" y="116" width="60" height="44"/><text class="dg-t" x="120" y="143" text-anchor="middle">B</text>' +
  '<rect class="dg-box" x="160" y="62" width="60" height="44"/><text class="dg-t" x="190" y="89" text-anchor="middle">C</text>' +
  '<rect class="dg-box" x="20" y="62" width="60" height="44"/><text class="dg-t" x="50" y="89" text-anchor="middle">D</text></svg>';

var Q = [
/* ---------- Mechatronics and the design cycle ---------- */
order('d1-1', 'd1', 'Put the stages of the design cycle from lecture in order. Some tiles are decoys.',
  ['Need', 'Synthesis', 'Ideation', 'Selection', 'Design', 'Analysis', 'Prototype', 'Validation'],
  ['Marketing', 'Patent filing'],
  'Start from the need (what is the pain, who is the end user), research it in synthesis, brainstorm in ideation, pick a concept in selection, then design, analyze, prototype and validate.',
  { label: 'Your cycle, first to last' }),
mc('d1-2', 'd1', 'Which of these is NOT a mechatronic system, by the definition used in lecture?',
  ['A flyball governor on a steam engine', 'An autofocus camera lens with a motor', 'The LUKE prosthetic arm with its sensors', 'A robot vacuum with bump sensors'], 0,
  'The flyball governor controls speed with springs and masses only. Mechanical control alone is not mechatronics. The control has to be electronic, either digital or analog.'),
mc('d1-3', 'd1', 'What is the major distinguishing feature of a mechatronic system?',
  ['It has moving parts', 'Its control is electronic', 'It is a robot', 'It uses a microcontroller'], 1,
  'Control is electronic. It can be digital (computerized) or purely electronic (analog). A microcontroller is one way to do that, not a requirement.'),
mc('d1-4', 'd1', 'Lecture split a mechatronic system into Move, Interact, Control and Connect. Sensors and actuators belong to…',
  ['Move', 'Interact', 'Control', 'Connect'], 1,
  'Interact: sensors get information from the environment, and actuators cause changes in it. Move is the mechanical side, Control is computers and logic, and Connect is the human and machine interfaces.'),
mc('d1-5', 'd1', 'Which statement about digital versus analog control matches lecture?',
  ['Digital is flexible and reprogrammable, but more complex and expensive', 'Analog is cheap and easy to modify, but less precise than digital', 'Digital is cheaper to build, but harder to reprogram than analog', 'Analog is not electronic, so it cannot count as mechatronic control'], 0,
  'Digital control is flexible and reprogrammable, but more complex and expensive. Analog is simple and cheap to build, but not simple to modify. Both count as electronic control.'),
mc('d1-6', 'd1', 'How did the LUKE arm deal with the hard problem of grasping?',
  ['It learns each new grasp from scratch, using EMG signals from the arm muscles', 'The user picks one of 10 common grasps, and sensors let the hand conform to the object', 'It offers one strong power grip and adjusts only the grip force to the object\'s weight', 'It mirrors the user\'s other hand, which wears a glove full of position sensors'], 1,
  'Humans use only a few prototype grasps. LUKE offers 10 of the most common ones through a simple interface, then uses sensors to adapt to the object, which cuts the input needed from the user.'),
mc('d1-7', 'd1', 'At which stage of the design cycle do you ask "Will they buy it? What features will they expect? Have you lived the problem?"',
  ['Need', 'Synthesis', 'Ideation', 'Validation'], 1,
  'Synthesis is where you talk to potential users and experts, look for patents and earlier attempts, set the scope, and sort features into constraints and criteria.'),
mc('d1-8', 'd1', 'According to the prototyping slide, roughly what share of your parts should be bought off the shelf?',
  ['10%', '30%', '50%', '70%'], 3,
  'About 70%. Do not reinvent standard components. Design for manufacture and assembly, and spend your effort on the parts that are actually new.'),
mc('d1-9', 'd1', 'In Test and Validate, what do you test first?',
  ['Reliability over 1000 cycles', 'The Minimum Viable Product', 'Appearance', 'Cost'], 1,
  'First test for the Minimum Viable Product, then test against your pre-designed test cases, then for reliability and robustness, and reflect on the results.'),
mc('d1-10', 'd1', 'In the software branch of Design, what comes right after "feature definition and specification of inputs, outputs and methods"?',
  ['Implement the code for each feature', 'Identify test cases for the features', 'Integrate the software with the hardware', 'Validate each feature against its spec'], 1,
  'The order on the slide is: block diagram, feature definition, identify test cases, implement, validate, integrate, test. You decide how you will test before you write the code.'),

/* ---------- Problem definition ---------- */
mc('d2-1', 'd2', 'In synthesis, what is the difference between constraints and criteria?',
  ['Constraints are must-have features, criteria are nice-to-have features', 'Constraints are nice-to-have features, criteria are must-have features', 'Constraints come from the client, criteria come from the engineering team', 'Constraints limit the cost, criteria set the safety and performance targets'], 0,
  'Constraints are must-haves: a design that misses one is out. Criteria are nice-to-haves that you score designs on in selection.'),
mc('d2-2', 'd2', 'The mousetrap examples (over 4000 patents, and only about 20 made money) were used to show what?',
  ['Most patented ideas never make money, so patents are rarely worth it', 'How you define the problem dictates the solution you end up with', 'Simple, cheap designs beat complex ones in a crowded market', 'Market research matters more than engineering for a new product'], 1,
  'Each trap solves a different perceived problem: kill a mouse, catch and release, catch many, and so on. How you define the problem decides what you build.'),
mc('d2-3', 'd2', 'BufferBox, the Waterloo capstone project that Google bought in 2012, started from which problem?',
  ['Parcels being stolen from doorsteps while people were at work', 'Missed deliveries when the customer was not home to sign', 'Slow shipping times between cities for small online stores', 'The high price of next-day delivery for students on campus'], 1,
  'A student kept missing FedEx deliveries while in class and had to travel 30 km to pick up a parcel. BufferBox built parcel kiosks with unlock codes so you could pick up packages any time.'),
mc('d2-4', 'd2', 'In the quality-manager case study, the marketing manager kept bringing defective parts to meetings. What did the quality manager end up being asked to do?',
  ['Hire more inspectors to sample parts at every station', 'Automate 100% inspection across the whole plant', 'Switch to a supplier with a lower defect rate', 'Retrain the operators on the lines with the most defects'], 1,
  'A consultant showed that without 100% inspection, defective parts cannot be eliminated. Sampling was the real problem, not a symptom to argue about, so the solution was automated inspection everywhere.'),
multi('d2-5', 'd2', 'A team ranks criteria with raw weights: cost 4, mass 3, reliability 2, looks 1. Design A scores 7, 5, 9, 6 on those criteria (out of 10). Design B scores 6, 8, 7, 9.', [
  { ask: 'What is the normalized weight of cost?', ans: '0.4', hint: 'Normalize by dividing each weight by the sum of the weights.', why: '4 / (4 + 3 + 2 + 1) = 0.4.' },
  { ask: 'What is Design A\'s weighted score?', ans: '6.7', hint: 'Normalized weights are 0.4, 0.3, 0.2, 0.1.', why: '0.4(7) + 0.3(5) + 0.2(9) + 0.1(6) = 2.8 + 1.5 + 1.8 + 0.6 = 6.7.' },
  { ask: 'What is Design B\'s weighted score?', ans: '7.1', hint: 'Same weights, B\'s scores.', why: '0.4(6) + 0.3(8) + 0.2(7) + 0.1(9) = 2.4 + 2.4 + 1.4 + 0.9 = 7.1. B wins, and the next step is a sensitivity analysis.' }
], 'num'),
mc('d2-6', 'd2', 'Which of these is NOT part of a good objectives statement, written at the end of problem identification?',
  ['It is a paragraph at most', 'The scope and limits are defined', 'The variables involved are specified', 'A full bill of materials'], 3,
  'The objectives statement is short and clear, maybe with a simple figure, and it defines scope and limits, variables and significance. A bill of materials belongs to a drawing much later on.'),
mc('d2-7', 'd2', 'Which is part of problem identification, according to lecture?',
  ['Isolate and identify the problem, not its symptoms', 'Choose the cheapest solution that meets the constraints', 'Build a quick prototype before defining the problem', 'Skip background research when the problem is obvious'], 0,
  'Ascertain the decision makers\' objectives, understand the background, isolate the problem rather than its symptoms, determine the unit of analysis, and state the objectives clearly.'),
mc('d2-8', 'd2', 'After you pick the design with the highest weighted score, why do a sensitivity analysis?',
  ['To check whether the winner changes when the weights shift a little', 'To measure how sensitive each design\'s sensors are to noise', 'To give the lower-ranked designs a second chance at winning', 'To replace the weighted sum with a more accurate final score'], 0,
  'Weights are judgment calls. If a small change in them flips the ranking, the decision is fragile and worth a closer look.'),
mc('d2-9', 'd2', 'Which is NOT one of the brainstorming rules from the ideation slides?',
  ['No criticism of any idea during the session', 'Mix participants from different backgrounds', 'Collect every idea, even the strange ones', 'Cut weak ideas early to keep things focused'], 3,
  'Brainstorming separates generating ideas from judging them: create the environment, no criticism, mix participants, be formal, have food and drinks, and collect every idea. Judging comes later with weighted features.'),

/* ---------- Ethics ---------- */
mc('d3-1', 'd3', 'Under Ontario\'s Professional Engineers Act, an activity is professional engineering if it meets three tests. Which set is right?',
  ['It is paid work; it uses technical knowledge; and it is signed and sealed by a licensed engineer for a client', 'It is planning, designing, evaluating and so on; it needs engineering principles; and it safeguards life, health, property or the environment', 'It is done by an engineering graduate; it takes place in Ontario; and it is delivered to a client under a written contract', 'It uses mathematics and computers; it follows recognised standards; and it affects members of the public or their property'], 1,
  'If what you do meets all three of those tests, you are practising professional engineering and must be licensed.'),
order('d3-2', 'd3', 'Order the hierarchy of obligations under the Code of Ethics, from highest to lowest.',
  ['Public welfare', 'Employer', 'Client', 'Colleagues', 'Subordinates', 'Yourself'],
  [],
  'Public welfare is paramount and sits at the top of the pyramid. Your own interests are at the bottom.',
  { label: 'Highest to lowest' }),
mc('d3-3', 'd3', 'Who accredits Canadian engineering programs?',
  ['Professional Engineers Ontario', 'Engineers Canada', 'The Ontario government', 'Each university'], 1,
  'Engineers Canada handles accreditation and coordination. The provincial regulators, like PEO, license engineers, under legal authority from their provincial governments, to protect the public.'),
mc('d3-4', 'd3', 'Which is NOT currently a requirement for a P.Eng. licence in Ontario?',
  ['An accredited bachelor\'s degree or equivalent', 'At least 24 months of engineering experience after the degree', 'Passing the professional practice exam', '12 months of Canadian experience'], 3,
  'The Canadian experience requirement was removed, and the experience requirement dropped from 4 years to 24 months. The degree, experience with a competency-based assessment, the PPE and good character remain.'),
mc('d3-5', 'd3', 'Under the PEO Code of Ethics, which duty must a practitioner regard as paramount?',
  ['Duty to the employer', 'Duty to the client', 'Duty to public welfare', 'Duty to colleagues'], 2,
  'Section 77.2.i: regard the practitioner\'s duty to public welfare as paramount.'),
mc('d3-6', 'd3', 'You are reviewing bids from several suppliers. One supplier hears it is your birthday and offers you two hockey tickets. What should you do?',
  ['Accept, since a birthday gift is personal and not related to the bid', 'Accept, but score that supplier slightly lower so you stay impartial', 'Decline, and disclose the offer if company policy requires it', 'Accept, and tell no one, since the tickets have no real influence'], 2,
  'Accepting creates a conflict of interest while you are evaluating that supplier. Avoid or disclose conflicts of interest, and follow your employer\'s gift policy.'),
mc('d3-7', 'd3', 'A P.Eng. colleague who did no work on your report asks you to add their name before their performance review. What should you do?',
  ['Add their name, since it costs nothing and helps a colleague', 'Refuse, because credit goes only to those who did the work', 'Add their name, but list them as a reviewer instead of an author', 'Ask the client to decide whether the name should be added'], 1,
  'Engineers must give due credit and act with personal honour and integrity. Listing someone who did not contribute misrepresents the work to the client.'),
mc('d3-8', 'd3', 'The Québec Bridge (1917) is the world\'s longest cantilever bridge. Why does it come up in a history of Canadian engineering?',
  ['It was the first major bridge in Canada designed entirely by a woman', 'Its collapses during construction are linked to the Iron Ring and regulation', 'It was the first bridge in North America built without any steel', 'It is the oldest bridge in Canada still carrying trains every day'], 1,
  'The bridge collapsed during construction (in 1907 and 1916), killing many workers. Those failures are tied to the Iron Ring tradition and to engineering becoming a regulated profession.'),
mc('d3-9', 'd3', 'Mike, a P.Eng., supervises co-op students and also teaches an evening course. His own co-op student enrolls in Mike\'s course. What should Mike do?',
  ['Nothing, since teaching and supervising are separate jobs', 'Disclose the conflict and have someone else grade that student', 'Grade that student more strictly to avoid any appearance of bias', 'Ask the student to drop the course so the conflict goes away'], 1,
  'This is a moonlighting conflict of interest. Disclose it and remove yourself from decisions where you cannot be impartial.'),
mc('d3-10', 'd3', 'What is the method from lecture for applying the Code of Ethics to a situation?',
  ['List the obligations, rank them by the hierarchy, then decide by that ranking', 'Follow your employer\'s instructions, since the employer carries the liability', 'Choose the option that costs the least, then document your reasoning', 'Ask a lawyer first, then do whatever the law strictly allows'], 0,
  'Obligations, then ranking, then decision. The hierarchy tells you which obligation wins when they conflict.'),

/* ---------- Sketching and pictorials ---------- */
mc('d4-1', 'd4', 'Which pictorial shows one face in its true shape, with the other faces projected back at an angle?',
  ['Isometric', 'Oblique', 'Orthographic', 'Perspective'], 1,
  'Oblique: one true face, the others projected at an angle. Isometric is a kind of axonometric view with equal proportions and true measurements along all three axes.'),
mc('d4-2', 'd4', 'Why is isometric the preferred pictorial in technical drawing?',
  ['True measurements along all three axes, drawn with equal proportions', 'One face is drawn in its true shape, so it is easy to dimension', 'It looks the most realistic, because it uses vanishing points', 'It needs only two axes, so it is the fastest pictorial to sketch'], 0,
  'In isometric the three axes are 120° apart and foreshortened equally, so you can measure along any of them directly.'),
mc('d4-3', 'd4', 'What text height does EGAD use on drawings?',
  ['1/16 in (1.5 mm)', '1/8 in (3 mm)', '1/4 in (6 mm)', '1/2 in (12 mm)'], 1,
  '1/8 in, about 3 mm, in all-caps engineering lettering, always written between light guidelines.'),
mc('d4-4', 'd4', 'Which lines are generally left out of an isometric view?',
  ['Object lines and outlines', 'Hidden lines and centerlines', 'Visible edges and corners', 'Outlines and front edges'], 1,
  'Isometric views show the overall look. The orthographic views carry the details like hidden features and centers.'),
mc('d4-5', 'd4', 'Which type of drawing is a fully dimensioned multi-view drawing used for manufacturing and inspection?',
  ['Concept drawing', 'Detail drawing', 'Assembly drawing', 'Isometric sketch'], 1,
  'Detail drawings are fully dimensioned for making and checking a part. Assembly drawings show how parts connect, and concept drawings communicate ideas.'),

/* ---------- Orthographic projection ---------- */
mc('d5-1', 'd5', 'Here is an isometric view of an L-block. The base is 4 wide, 2 deep and 1 tall, and the upright on the left end is 1 wide and 3 tall overall.' + LBLOCK + 'Which is the correct right side view (third angle)?',
  [view(2, 3, [['poly', [[0, 0], [2, 0], [2, 3], [0, 3]]], ['line', 0, 1, 2, 1]], 'A 2 by 3 rectangle with a horizontal line one unit up'),
   view(2, 3, [['poly', [[0, 0], [2, 0], [2, 3], [0, 3]]]], 'A plain 2 by 3 rectangle'),
   view(2, 3, [['poly', [[0, 0], [2, 0], [2, 3], [0, 3]]], ['line', 0, 2, 2, 2]], 'A 2 by 3 rectangle with a horizontal line two units up'),
   view(2, 3, [['poly', [[0, 0], [2, 0], [2, 1], [1, 1], [1, 3], [0, 3]]]], 'An L shape')], 0,
  'From the right you see the end of the base (1 tall) and, set back behind it, the right face of the upright, rising to 3. Both are 2 deep, so the outline is a 2 × 3 rectangle. The edge where the base\'s top meets its end is a hard edge, so it shows as a line 1 unit up.'),
mc('d5-2', 'd5', 'A block has a hole drilled straight down through its top.' + DRILL + 'Which is the correct front view?',
  [view(4, 1.5, [['poly', [[0, 0], [4, 0], [4, 1.5], [0, 1.5]]], ['hid', 1.5, 0, 1.5, 1.5], ['hid', 2.5, 0, 2.5, 1.5], ['cen', 2, -0.3, 2, 1.8]], 'Rectangle with two dashed vertical lines and a centerline between them'),
   view(4, 1.5, [['poly', [[0, 0], [4, 0], [4, 1.5], [0, 1.5]]], ['line', 1.5, 0, 1.5, 1.5], ['line', 2.5, 0, 2.5, 1.5]], 'Rectangle with two solid vertical lines'),
   view(4, 1.5, [['poly', [[0, 0], [4, 0], [4, 1.5], [0, 1.5]]]], 'Plain rectangle'),
   view(4, 1.5, [['poly', [[0, 0], [4, 0], [4, 1.5], [0, 1.5]]], ['hid', 1.5, 0, 1.5, 1.5], ['hid', 2.5, 0, 2.5, 1.5]], 'Rectangle with two dashed vertical lines and no centerline')], 0,
  'The hole is inside the block, so from the front its walls are hidden: two dashed lines. A cylindrical feature also gets a centerline in the view where it appears as a rectangle. Solid lines would mean visible edges.'),
mc('d5-3', 'd5', 'In third-angle projection, where does the right side view go?' + LAYOUT,
  ['A', 'B', 'C', 'D'], 2,
  'Everything is projected off the front view: the top view goes above it (A), and the right side view goes to its right (C).'),
mc('d5-4', 'd5', 'Which projection standard does North America typically use?',
  ['First angle', 'Third angle', 'Isometric', 'Oblique'], 1,
  'Third angle: the picture plane sits between the object and the observer, so each view lands on the side it is seen from. Europe and Asia typically use first angle.'),
mc('d5-5', 'd5', 'How many principal orthographic views does an object have?',
  ['3', '4', '6', '8'], 2,
  'Top, front, right side, left side, rear and bottom: 6 directions, each 90° apart. Most drawings use top, front and right side.'),
mc('d5-6', 'd5', 'Which is a good reason to choose a different set of views than top, front and right side?',
  ['It reduces hidden lines and shows the most relevant features', 'It makes the drawing look more interesting to the client', 'It avoids having to draw centerlines through any of the holes', 'It fits more views onto one sheet, which saves paper'], 0,
  'Maximize clarity: match an intuitive orientation, reduce hidden lines, and show the most relevant features.'),
mc('d5-7', 'd5', 'When do you need an auxiliary view?',
  ['When a surface is inclined, so no principal view shows its true shape', 'Whenever a part has more than one hole in the same face', 'When hidden lines would otherwise appear in the front view', 'When the part is too large to fit in the standard three views'], 0,
  'An auxiliary view is an orthographic projection at an angle to the principal views, onto a plane parallel to the inclined surface.'),
mc('d5-8', 'd5', 'A flat face blends smoothly into a curved face, with no edge. How is that blend shown in an orthographic view?',
  ['With a thin solid line', 'With a dashed hidden line', 'It is not drawn at all', 'With a thin centerline'], 2,
  'Orthographic views only include hard edges. A tangent change in curvature is not an edge.'),
mc('d5-9', 'd5', 'What is a miter line used for?',
  ['A 45° line used to transfer features between the top and side views', 'A line that marks where two parts are welded together', 'The thick line that separates the title block from the drawing', 'A line that shows where a cutting plane passes through the part'], 0,
  'Project from the top view to the 45° miter line, then turn down into the side view. Construction lines are the thin temporary lines you use along the way.'),

/* ---------- Standards and linetypes ---------- */
mc('d6-1', 'd6', 'Where is the title block on an engineering drawing?',
  ['Top left', 'Top right', 'Bottom left', 'Bottom right'], 3,
  'Bottom right. It holds the company name, title, date, scale, creator and approvals, and the drawing and revision numbers.'),
mc('d6-2', 'd6', 'Which item does NOT belong in a bill of materials?',
  ['The name of each part', 'The quantity of each part', 'The material of each part', 'The tolerances of each part'], 3,
  'A BOM lists each component\'s name, quantity, part number and material. Tolerances go on the detail drawings.'),
mc('d6-3', 'd6', 'What does the revision column record?',
  ['Every change since the drawing was first made, with dates and approvals', 'The scale of each view, and any views that are not drawn to scale', 'The materials list, with the quantity and part number of each item', 'The drawing number and the sheet size to use when printing it'], 0,
  'Revisions are numbered and dated, with a brief description and signatures. An ECN (Engineering Change Notice) explains the change in detail.'),
mc('d6-4', 'd6', 'Which line has the heaviest weight?',
  ['Object (visible) line', 'Hidden (dashed) line', 'Center (chain) line', 'Cutting plane line'], 3,
  'From the slides: cutting plane 0.80 mm (extra thick), object 0.60 mm (thick), hidden 0.30 mm (medium), and center and dimension lines 0.05 mm (thin).'),
mc('d6-5', 'd6', 'Which sample is a hidden line?' + LINES,
  ['1', '2', '3', '4'], 1,
  'Hidden lines are medium-weight, evenly dashed lines. Sample 1 is an object line, 3 is a centerline, and 4 is a cutting plane line with arrows.'),
mc('d6-6', 'd6', 'Which sample is a centerline?' + LINES,
  ['1', '2', '3', '4'], 2,
  'A centerline is thin, with alternating long and short dashes. It marks a circular or cylindrical feature.'),
mc('d6-7', 'd6', 'What is the difference between a chamfer and a fillet?',
  ['A chamfer is a bevelled edge at an angle; a fillet is a rounded edge', 'A chamfer is a rounded edge; a fillet is a bevelled edge at an angle', 'A chamfer is on an outside corner; a fillet is on an inside corner', 'A chamfer is cut by hand; a fillet is always machined on a lathe'], 0,
  'Both are usually small (under 1 in). A fillet is always tangent to both faces it joins.'),
mc('d6-8', 'd6', 'Why does a fillet at an inside corner make a part last longer?',
  ['It reduces the stress concentration, so cracks are less likely to start', 'It removes material, which makes the part lighter and less brittle', 'It hides the machining marks, which are where corrosion usually begins', 'It lets paint flow into the corner, which protects that spot from rust'], 0,
  'Sharp inside corners concentrate stress, and cracks start there. Fillets also improve appearance and safety, and leave material where a cutter naturally would.'),
mc('d6-9', 'd6', 'Which describes precision, technically?',
  ['Measurements that are close to the true value', 'Repeated measurements that are close to one another', 'The smallest increment a tool can display', 'The number of digits on a calculator'], 1,
  'Accuracy is closeness to the true value, and resolution is the smallest displayed increment. In EGAD dimensions, precision means the number of decimal places. Never use 4.'),

/* ---------- Dimensioning ---------- */
mc('d7-1', 'd7', 'What is a main advantage of baseline dimensioning from a datum?',
  ['Tolerance errors do not accumulate from one feature to the next', 'It needs the fewest dimensions of any dimensioning method', 'It removes the need for a scale in the title block', 'It lets every dimension be written without any units'], 0,
  'Every location is measured from the same datum, so errors do not stack up. It also means fewer calculations at the machine, where the machinist zeroes the readout on the datum.'),
mc('d7-2', 'd7', 'How do you dimension a through hole and a fillet?',
  ['Hole by radius (R), fillet by diameter (Ø)', 'Hole by diameter (Ø), fillet by radius (R)', 'Both by diameter', 'Both by radius'], 1,
  'A closed circular feature gets a diameter. An open curve or arc gets a radius.'),
mc('d7-3', 'd7', 'Which of these breaks a dimensioning rule?',
  ['Two extension lines cross', 'Two dimension lines cross', 'The longer dimension sits outside the shorter one', 'A small gap is left between the part and an extension line'], 1,
  'Extension lines may cross, but dimension lines never should. Placing longer dimensions outside shorter ones, and leaving a gap at the object, are both correct practice.'),
mc('d7-4', 'd7', 'To locate a hole horizontally and vertically, you dimension to…',
  ['its nearest edge', 'its centre', 'its far edge', 'the edge of the part only'], 1,
  'Always locate a hole to its centre mark, and give its size separately as a diameter.'),
mc('d7-5', 'd7', 'Where should the drawing\'s units go?',
  ['After every dimension', 'In the notes', 'In the bill of materials', 'Nowhere, units are assumed'], 1,
  'State the units once in the notes. Only add them to an individual dimension when needed for clarity, like 1" VALVE.'),
mc('d7-6', 'd7', 'What does "TYP" next to a fillet dimension mean?',
  ['The dimension applies to all the identical fillets', 'The dimension is a typical value, so it has no tolerance', 'The fillet is optional and can be left out when machining', 'The dimension is approximate and is checked at assembly'], 0,
  'TYP, or a note like "4 HOLES", means the same feature repeats. Only use it when there is no ambiguity about what it covers.'),
mc('d7-7', 'd7', 'What should you do instead of dimensioning to a hidden line?',
  ['Dimension it anyway, and add a note saying the line is hidden', 'Dimension the feature in a view where it is visible, or in a section', 'Leave the feature undimensioned and let the machinist decide', 'Redraw the hidden line as a solid line so it can be dimensioned'], 1,
  'Dimension each feature in the view where its shape is shown best, and avoid hidden lines. A section view often reveals the feature.'),
mc('d7-8', 'd7', 'A counterbored hole callout must include…',
  ['Only the small hole diameter and the depth', 'Both diameters and the depth of the larger hole', 'Both diameters and the countersink angle', 'The large diameter and the total depth'], 1,
  'Counterbore: both hole diameters and the depth of the larger one. Countersink: both diameters and the taper angle. Through holes say THRU ALL, and blind holes need a depth.'),
mc('d7-9', 'd7', 'Which rule about leaders is correct?',
  ['A leader should be horizontal and touch the dimension text', 'A leader should be vertical and end on the edge of the hole', 'A leader is angled and points to the centre of the hole', 'A leader can be at any angle and point anywhere on the hole'], 2,
  'Leaders are angled, point at the centre of the hole, and their horizontal shoulder comes off the mid-height of the note.'),
mc('d7-10', 'd7', 'What does NTS on a dimension mean?',
  ['Not to scale', 'Nominal thread size', 'No tolerance specified', 'Note to supplier'], 0,
  'A dimension that is not drawn to scale is marked NTS or NOT TO SCALE. Sometimes it is just underlined.'),

/* ---------- Section views ---------- */
mc('d8-1', 'd8', 'In a section view, what gets hatched?',
  ['Every surface visible in the section view', 'Only the surfaces the cutting plane passes through', 'Only the surfaces behind the cutting plane', 'Only the outline of the part in that view'], 1,
  'Imagine glass along the cutting plane: anything touching the glass is hatched with thin lines, usually at 45°.'),
mc('d8-2', 'd8', 'In a section view, hidden lines beyond the cutting plane are…',
  ['always drawn', 'usually not shown', 'drawn as centerlines', 'drawn extra thick'], 1,
  'The section exists to avoid a mess of hidden lines. Object lines behind the cutting plane are still drawn.'),
mc('d8-3', 'd8', 'In a half section, how are the two halves shown?',
  ['Both halves show hidden lines, split by a thick object line', 'Neither half shows hidden lines, and a centerline splits them', 'Only the sectioned half shows hidden lines, split by a centerline', 'Both halves are hatched, split by a cutting plane line'], 1,
  'The sectioned half already shows the inside, so hidden lines in the other half would repeat it.'),
mc('d8-4', 'd8', 'An aligned cutting plane passes lengthwise through a thin rib (under 1 cm thick). How is the rib drawn?',
  ['Fully hatched', 'Not hatched', 'With hidden lines', 'Left out completely'], 1,
  'Thin ribs and webs cut lengthwise are not hatched, even though the plane passes through them. Hatching them would make the part look solid.'),
mc('d8-5', 'd8', 'In an assembly section view, how should adjacent parts be hatched?',
  ['All at 45° in the same direction, so they look uniform', 'In opposite directions, at 90° to each other if possible', 'Only the largest part is hatched; the rest are left clear', 'With dashed lines for the parts that sit behind the others'], 1,
  'Opposite directions make it obvious where one part ends and the next begins.'),
mc('d8-6', 'd8', 'An offset cutting plane has jogs in it. In the section view, the jogs…',
  ['appear as thin solid lines across the section', 'do not appear, since they are not real edges', 'appear as hidden lines in the section view', 'are hatched twice to show the change in depth'], 1,
  'The jogs are drawn on the cutting plane line, but they are not real edges, so they do not show up in the section. Jogs must be perpendicular to the view.'),
mc('d8-7', 'd8', 'What do the arrows at the ends of a cutting plane line show?',
  ['The direction you look to see the section', 'The direction the saw moves to cut the part', 'Where the dimensions for the section start', 'The side of the part that gets hatched'], 0,
  'The line shows where the cut is, the arrows show the viewing direction, and the letters (A–A) name the section view.'),
mc('d8-8', 'd8', 'Which section type removes only a small local region to show something inside?',
  ['Full section', 'Half section', 'Broken-out section', 'Assembly section'], 2,
  'A broken-out section cuts away just a small area, bounded by a break line. A full section cuts all the way through, and a half section cuts a quarter of a symmetric part.'),

/* ---------- Threads, holes, tools ---------- */
mc('d9-1', 'd9', 'What does M12 × 1.75 mean?',
  ['12 threads per mm, 1.75 mm long', 'Major diameter 12 mm, pitch 1.75 mm', 'Minor diameter 12 mm, 1.75 threads per inch', 'Major diameter 1.75 mm, 12 threads'], 1,
  'Metric threads are named M (major diameter) × (pitch), both in mm. Pitch is the distance between adjacent threads.'),
num('d9-2', 'd9', 'A 3/8-24 UNF screw is turned into a tapped hole. How many full turns move it 0.50 in deeper?', '12',
  'The 24 is threads per inch, and one turn advances one thread.',
  '24 threads per inch means one turn advances 1/24 in. 0.50 in ÷ (1/24 in) = 12 turns.'),
num('d9-3', 'd9', 'How many full turns does an M8 × 1.25 screw need to advance 10 mm?', '8',
  'Pitch is the advance per turn.',
  '10 mm ÷ 1.25 mm per turn = 8 turns.'),
mc('d9-4', 'd9', 'When should you choose fine threads over coarse threads?',
  ['When the screw is wider than the hole is deep, or it may vibrate loose', 'When assembling soft materials like aluminium or plastic parts', 'When you need fast assembly with as few turns as possible', 'When a large screw must resist stripping and cross-threading'], 0,
  'Fine threads engage more threads per thickness and resist vibration loosening. Coarse threads suit soft materials and rugged use, resist stripping and cross-threading, and are faster. Rule from class: diameter &gt; depth, use fine.'),
mc('d9-5', 'd9', 'What does a tap do, and what does a die do?',
  ['A tap cuts internal threads; a die cuts external threads', 'A tap cuts external threads; a die cuts internal threads', 'Both cut internal threads', 'A tap drills holes; a die polishes them'], 0,
  'Taps thread holes. Dies thread rods and bolts.'),
mc('d9-6', 'd9', 'Why can\'t you tap threads all the way to the bottom of a blind hole?',
  ['The tap has a tapered tip', 'Blind holes are too shallow', 'Taps only work in metal', 'The chips melt'], 0,
  'The tap\'s tapered lead-in means the last few threads at the bottom of a blind hole are never fully formed.'),
mc('d9-7', 'd9', 'Which cross-section shows a counterbored hole?',
  [hole('cs'), hole('cb'), hole('blind'), hole('thru')], 1,
  'A counterbore is a larger flat-bottomed hole with a set depth over a smaller through hole, so a screw head sits flush. The conical recess is a countersink, the hole that stops partway is a blind hole, and the straight hole of one size is a plain through hole.'),
mc('d9-8', 'd9', 'What is a spotface?',
  ['A shallow counterbore that gives the head a flat surface to sit on', 'A conical recess that lets a flat head sit flush with the surface', 'A threaded hole that passes all the way through the part', 'A blind hole with a pointed bottom left by the drill tip'], 0,
  'Spotfaces clean up a rough or uneven surface so the fastener seats squarely.'),
mc('d9-9', 'd9', 'Which part of a vernier caliper measures the depth of a hole?',
  ['The external jaws', 'The internal jaws', 'The depth probe', 'The vernier scale'], 2,
  'External jaws measure outside sizes, internal jaws measure inside sizes, and the depth probe slides out the end to measure depth.'),
mc('d9-10', 'd9', 'On a manual vertical milling machine, how is the cut made?',
  ['The workpiece is clamped to the table and moved against a spinning tool', 'The workpiece spins in a chuck while a fixed tool cuts along its length', 'The tool moves over the part while the table stays clamped in place', 'The workpiece is pushed through a die that shapes it in a single pass'], 0,
  'Cranks move the table in x, y and z under the spinning end mill. Machinists set a datum by zeroing the digital readout, which is why baseline dimensioning suits machining.'),
mc('d9-11', 'd9', 'A tape measure reads in 1/16 in steps. How would you write 23.4375 in on it?',
  ['23 3/8 in', '23 7/16 in', '23 1/2 in', '23 9/16 in'], 1,
  '0.4375 × 16 = 7, so it is 7/16. Context matters: a tape measure is read in powers-of-two fractions, not decimals.'),

/* ---------- AutoCAD ---------- */
mc('d10-1', 'd10', 'In the LINE command, what does typing @3,4 do?',
  ['Goes to the absolute point (3, 4), measured from the origin', 'Goes 3 units right and 4 units up from the last point', 'Draws a line 3 units long at an angle of 4 degrees', 'Draws a line 4 units long at an angle of 3 degrees'], 1,
  'The @ makes the coordinates relative to the last point. Without @, 3,4 is absolute (measured from the origin).'),
multi('d10-2', 'd10', 'You start a line at (2, 1) and type @10&lt;30.', [
  { ask: 'What is the x-coordinate of the end point? Give 3 decimal places.', ans: '10.660', tol: 0.0005, hint: '@length&lt;angle is polar, measured from the positive x-axis.', why: 'x = 2 + 10 cos 30° = 2 + 8.660 = 10.660.' },
  { ask: 'What is the y-coordinate of the end point?', ans: '6', hint: 'sin 30° = 0.5.', why: 'y = 1 + 10 sin 30° = 1 + 5 = 6.' }
], 'num'),
mc('d10-3', 'd10', 'Which key toggles Ortho mode, which restricts the cursor to 90° directions?',
  ['F3', 'F7', 'F8', 'F12'], 2,
  'F8 is Ortho. F3 is Object Snap, F7 is the grid, F10 is Polar Tracking, F11 is Object Snap Tracking and F12 is Dynamic Input.'),
mc('d10-4', 'd10', 'What does locking a layer do?',
  ['Hides it, so its objects disappear from the screen', 'Keeps it visible but stops its objects being edited', 'Deletes it, along with every object drawn on it', 'Keeps it on screen but stops it from printing'], 1,
  'Off hides a layer. Freeze also hides it while saving memory in big drawings. Lock leaves it visible but uneditable. Plot settings control printing.'),
mc('d10-5', 'd10', 'What units does an AutoCAD model use?',
  ['Millimetres, since AutoCAD is a metric program', 'Inches, unless you change the drawing template', 'None: it is unitless, so you choose and draw at 1:1', 'Whatever units the printer is set up to use'], 2,
  'AutoCAD does not know or care about units, so you must. Draw everything at full size in your chosen units and scale only in the layout.'),
mc('d10-6', 'd10', 'Your hidden lines look like solid lines because the drawing is very large. What should you adjust?',
  ['LWEIGHT', 'LTSCALE', 'ZOOM', 'OSNAP'], 1,
  'LTSCALE sets the global linetype scale, so the dash pattern becomes visible at your drawing\'s size.'),
mc('d10-7', 'd10', 'You run FILLET on two lines and nothing seems to change. Why?',
  ['FILLET only works on arcs and circles, not lines', 'The default fillet radius is 0, so set it first', 'Ortho mode is on, so the corner cannot be rounded', 'The two lines are on different layers'], 1,
  'Both FILLET and CHAMFER default to 0. Set the radius (or distances) first, and set it again if you undo.'),
mc('d10-8', 'd10', 'In the ROTATE command, a positive angle turns objects…',
  ['clockwise', 'counter-clockwise', 'whichever way the cursor moves', 'about the origin only'], 1,
  'All AutoCAD rotations are counter-clockwise for positive angles, about the base point you pick.'),
mc('d10-9', 'd10', 'Where should you put the title block and notes?',
  ['In model space at 1:1, next to the part', 'In paper space (the layout), outside the viewport', 'On the same layer as the object lines', 'In a separate drawing file that gets inserted'], 1,
  'The model lives in model space at full size. The layout\'s paper space holds the title block and notes, and a viewport shows the model at a chosen scale.'),
num('d10-10', 'd10', 'A drawing is plotted at 1:4. How long, in inches, does a 10 in edge appear on the paper?', '2.5',
  '1:4 means the real object is 4 times the size shown.',
  '10 ÷ 4 = 2.5 in on paper. It is still dimensioned as 10.'),
mc('d10-11', 'd10', 'Why should you avoid turning on every Object Snap mode at once?',
  ['It slows AutoCAD down on large drawings', 'You may snap to a point you did not intend', 'It turns off the grid and ortho mode', 'Some snap modes cannot run at the same time'], 1,
  'The snap list works in priority order. Turn on only the snaps you need, and use Shift + right-click for a one-off snap.'),
order('d10-12', 'd10', 'Order the steps for setting up a drawing to plot, from the week 4 slides.',
  ['Complete the model at 1:1 scale', 'Set up the page layout: AutoCAD PDF printer, ANSI A paper, correct units', 'Size the viewport to fit the printable area', 'Set a whole-number scale for the viewport', 'Move the model into position on the page', 'Add notes and the title block in paper space'],
  [],
  'Model first at full size, then the page, then the viewport and its scale, and finally the annotations in paper space.',
  { label: 'First to last' }),
mc('d3-11', 'd3', 'Engineering is a self-regulated profession. According to lecture, what does that make engineers responsible for?',
  ['Protecting the profession, governing themselves and making their voices heard', 'Nothing: the provincial government handles all discipline for engineers', 'Setting their own fees by law and limiting how many people are licensed', 'Writing the laws that govern engineering and enforcing them in court'], 0,
  'Self-regulation means the profession polices itself: dealing with problems promptly (reported in the blue pages of Engineering Dimensions), electing its own council and speaking up in public policy.'),
mc('d3-12', 'd3', 'In practice, what does the hierarchy of obligations require of a practitioner?',
  ['Report unsafe work, explain consequences and inform the public objectively', 'Side with the employer, since the employer pays and carries the risk', 'Keep safety concerns inside the company until a manager approves', 'Refuse any pay for work that is done in the public interest'], 0,
  'Duty to the public comes first, so a practitioner must report unsafe work ("whistleblowing") and explain consequences. Accepting fair compensation is fine.'),
mc('d3-13', 'd3', 'Which of these comes with being a licensed engineer in Ontario, according to the slides?',
  ['A duty to stay current and to practise only within your field', 'The right to sign off on designs in any engineering discipline', 'No responsibility for the work done by your subordinates', 'The right to share client information with other engineers'], 0,
  'A P.Eng. may use the title and stamp designs, but takes responsibility for their own work and their subordinates\', keeps confidences, gives due credit, avoids or discloses conflicts of interest, and must practise only within their competence.'),
mc('d3-14', 'd3', 'Who may use the title "engineer" and stamp engineering designs in Ontario?',
  ['A licensed professional engineer (P.Eng.)', 'Anyone with an accredited engineering degree', 'Anyone working in a technical job', 'Any member of Engineers Canada'], 0,
  'The title and the right to sign and seal designs belong to licence holders. A degree alone is the academic requirement, not the licence.'),
mc('d7-11', 'd7', 'How should dimension figures be lettered on a drawing?',
  ['Horizontally, including angle dimensions', 'Aligned with each dimension line', 'Vertically for vertical dimensions', 'In any direction, as long as they are readable'], 0,
  'Best practice 2 from the week 4 slides: letter dimensions horizontally, so the drawing reads from the bottom without turning the page. That includes angles.'),
mc('d7-12', 'd7', 'Where should the units of a drawing appear?',
  ['Once in the notes, and on a dimension only when needed for clarity', 'After every dimension, so no measurement can be misread', 'In the scale field of the title block, next to the scale', 'Nowhere, because drawings are always in millimetres'], 0,
  'Repeating mm on every dimension adds clutter. State the units once in the notes, and add them to a single dimension only when it would otherwise be unclear.'),
mc('d7-13', 'd7', 'Where are the diameter and length of a solid cylinder preferably dimensioned?',
  ['In the rectangular view', 'In the circular view', 'In an isometric view', 'Split between the two views'], 0,
  'Best practice 16: show both in the rectangular (side-on) view. It does not apply to holes, which are called out with a leader to the circular view.'),
mc('d7-14', 'd7', 'Should a dimension that can be worked out from two others also be shown?',
  ['No: show only the dimensions needed to make or inspect the part', 'Yes: extra dimensions make the drawing safer to manufacture', 'Yes, but only if it is placed in a different view', 'Only if it is the overall length or the overall width'], 0,
  'Best practice 9. Redundant dimensions can conflict once tolerances come in, and they clutter the drawing.'),
mc('d7-15', 'd7', 'Which scales does the week 4 lecture suggest for a metric drawing?',
  ['Whole-number scales in steps of 5, like 1:10 or 1:25', 'Fractions of an inch, like 1:4, 1:8 or 1:16', 'Any scale that fills the page best, like 1:3.7', 'Always 1:1, so the part is shown at true size'], 0,
  'Use whole-number scales. Metric drawings use steps of 5 (1:10, 1:25), and imperial drawings use inch fractions (1:4, 1:8, 1:16). Whatever you pick, put it in the title block.'),
mc('d10-13', 'd10', 'In AutoCAD, at what scale should you draw the model?',
  ['1:1 in the Model tab, then set the print scale in the layout viewport', 'At the final print scale in the Model tab, so it fits the sheet', 'Any scale in the Model tab, then stretch the drawing to fit the page', '1:2 in the Model tab, so the part fits inside the title block'], 0,
  'Model space is drawn full size. The scale is chosen later in the Layout tab (bottom-right of the status bar) so the drawing prints well on the page.'),
mc('d10-14', 'd10', 'Which page setup do the slides call for when you print your layout?',
  ['The AutoCAD PDF printer, ANSI A (11 × 8.5 in) paper and 1-to-1 units', 'Your default printer, letter paper and the template\'s default units', 'The AutoCAD PDF printer, ANSI D paper and units set to 1:2', 'Any printer and paper size, as long as the viewport fits'], 0,
  'Open Page Setup Manager (or type PAGESETUP). Units must be 1-to-1, and that is units, not scale. Then size the viewport to fit inside the printable area.'),
];

COURSES.push({
  id: 'mte100', code: 'MTE 100', name: 'Mechatronics Engineering', key: 'mte100-midterm-gym-v1', hue: 'c5',
  exam: { at: '2026-10-22T14:30:00-04:00', label: 'Thu Oct 22, 2:30 PM · Term Test 1' },
  scope: 'EGAD weeks 1 to 4 and DCAP',
  topics: T, Q: Q,
  titles: ['Sketch Rookie', 'Line Weight Lifter', 'Iso Artist', 'View Projector', 'Datum Setter', 'Section Slicer', 'Thread Counter', 'Layer Manager', 'Ethics Steward', 'Design Cycle Pro'],
  formula: null,
  mock: { minutes: 40, blurb: '14 multiple choice (1 point each) and 3 calculation or ordering questions (2 points each). No past MTE 100 test was available, so this layout is a guess. The real term test is longer.',
    sections: [
      { label: 'Multiple choice', short: 'multiple choice', n: 14, pts: 1, pick: function (q) { return q.type === 'mc'; } },
      { label: 'Calculate or order', short: 'calculate or order', n: 3, pts: 2, pick: function (q) { return q.type !== 'mc'; } }
    ] },
  how: ['Questions come from the EGAD slides (weeks 1 to 4) and the DCAP decks: Introduction to Mechatronics, Design Cycle, and Engineering in Canada.',
    'The week 6 midterm review names the major topics as DCAP (ethics) and EGAD (dimensioning), with the EGAD slides as the source. Drill those two topics first.',
    'EGAD tests drawing skill too. Practise sketching orthographic views and section views on paper, since tapping an answer is not the same as drawing one.']
});
})();
