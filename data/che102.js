/* ================= CHE 102 ================= */
(function () {
var T = [
  { id: 'h1', name: 'Atoms, ions and the mole', sec: 'Counting particles' },
  { id: 'h2', name: 'Units and conversions', sec: 'Data sheet' },
  { id: 'h3', name: 'Balancing and stoichiometry', sec: 'Mole ratios' },
  { id: 'h4', name: 'Limiting reactant and excess', sec: 'Which runs out' },
  { id: 'h5', name: 'Yield and atom economy', sec: 'Efficiency' },
  { id: 'h6', name: 'Solutions', sec: 'Molarity, w/w, dilution' },
  { id: 'h7', name: 'Empirical and molecular formulas', sec: 'Combustion analysis' },
  { id: 'h8', name: 'Ideal gas law and pressure', sec: 'PV = nRT' },
  { id: 'h9', name: 'Gas mixtures and reacting gases', sec: 'Dalton\'s law' },
  { id: 'h10', name: 'Kinetic theory and real gases', sec: 'Speeds, van der Waals' }
];

/* --- diagrams --- */
function mbPath(a, h, x0, y0, w, ht) {
  var pts = [];
  for (var i = 0; i <= 80; i++) {
    var u = i / 80 * 3.2, f = u * u * Math.exp(-u * u / (a * a)) / (a * a * a);
    pts.push((x0 + u / 3.2 * w).toFixed(1) + ',' + (y0 - f * h * ht).toFixed(1));
  }
  return 'M' + pts.join(' L');
}
var MB = '<svg class="dg" viewBox="0 0 300 170" role="img" aria-label="Two speed distribution curves. Curve A is tall and narrow with its peak at low speed. Curve B is lower and broader with its peak at a higher speed.">' +
  '<path class="dg-ax" d="M30 10 V140 H290"/>' +
  '<path class="dg-c1" d="' + mbPath(0.75, 1.9, 30, 140, 255, 60) + '"/>' +
  '<path class="dg-c2" d="' + mbPath(1.35, 1.9, 30, 140, 255, 60) + '"/>' +
  '<text class="dg-t" x="86" y="74">A</text><text class="dg-t" x="150" y="100">B</text>' +
  '<text class="dg-s" x="160" y="160" text-anchor="middle">Molecular speed</text>' +
  '<text class="dg-s" x="14" y="80" text-anchor="middle" transform="rotate(-90 14 80)">Fraction of molecules</text></svg>';
var MANO = '<svg class="dg" viewBox="0 0 260 214" role="img" aria-label="Open-end mercury manometer. A gas bulb connects to the left arm. The right arm is open to the air at 760 mmHg. The mercury on the open right side stands 120 mm higher than on the left side.">' +
  '<circle class="dg-l" cx="45" cy="70" r="28"/><text class="dg-t" x="45" y="75" text-anchor="middle">Gas</text>' +
  '<path class="dg-l" d="M73 70 H120 V170 A20 20 0 0 0 160 170 V20"/>' +
  '<path class="dg-l" d="M128 70 V170 A12 12 0 0 0 152 170 V20"/>' +
  '<path class="dg-hg" d="M120 130 V170 A20 20 0 0 0 160 170 V80 H152 V170 A12 12 0 0 1 128 170 V130 Z"/>' +
  '<path class="dg-dim" d="M170 80 H200 M170 130 H200 M190 84 V126"/><path class="dg-arr" d="M186 90 L190 82 L194 90 M186 120 L190 128 L194 120"/>' +
  '<text class="dg-t" x="206" y="110">120 mm</text>' +
  '<text class="dg-s" x="156" y="14" text-anchor="middle">open, P₀ = 760 mmHg</text>' +
  '<path class="dg-dim" d="M134 182 L106 200"/><text class="dg-s" x="102" y="205" text-anchor="end">mercury</text></svg>';

var Q = [
/* ---------- Atoms and the mole ---------- */
mc('h1-1', 'h1', 'How many protons, neutrons and electrons are in one ion of <sup>56</sup>Fe<sup>3+</sup>?',
  ['26 p, 30 n, 23 e', '26 p, 30 n, 29 e', '23 p, 30 n, 26 e', '26 p, 56 n, 23 e', '30 p, 26 n, 23 e'], 0,
  'Iron is element 26, so 26 protons. Neutrons = 56 − 26 = 30. A 3+ charge means 3 fewer electrons than protons: 23.', { k: 'c' }),
mc('h1-2', 'h1', 'How many atoms are in 0.500 mol of $Ca(NO3)2$?',
  ['3.01 × 10²³', '2.71 × 10²⁴', '5.42 × 10²⁴', '4.50', '1.81 × 10²⁴'], 1,
  'One formula unit has 1 Ca + 2 N + 6 O = 9 atoms. 0.500 mol × 9 × 6.022 × 10²³ = 2.71 × 10²⁴.', { k: 'c' }),
mc('h1-3', 'h1', 'An ion X<sup>2−</sup> has 18 electrons and a mass number of 32. What is X?',
  ['S', 'Ar', 'Ca', 'Cl', 'O'], 0,
  'A 2− ion has 2 more electrons than protons, so it has 16 protons. Element 16 is sulfur, and 32 − 16 = 16 neutrons fits.', { k: 'c' }),
num('h1-4', 'h1', 'How many molecules are in 9.00 g of $H2O$? Give 3 significant figures, like 1.23E23.', '3.01E23',
  'Grams to moles with the molar mass, then multiply by Avogadro\'s number.',
  '9.00 g ÷ 18.015 g/mol = 0.4996 mol. 0.4996 × 6.02214 × 10²³ = 3.01 × 10²³ molecules.', null, null, { sf: 3 }),
mc('h1-5', 'h1', '<sup>35</sup>Cl and <sup>37</sup>Cl are isotopes. Which statement is true?',
  ['They have different numbers of protons but the same mass number', 'They have the same number of neutrons but different charges', 'They have the same number of protons but different numbers of neutrons', 'They have different numbers of electrons as neutral atoms'], 2,
  'Isotopes are the same element, so the proton count (17) is the same. The mass numbers differ because <sup>35</sup>Cl has 18 neutrons and <sup>37</sup>Cl has 20.', { k: 'c' }),

/* ---------- Units ---------- */
mc('h2-1', 'h2', 'The temperature rises by 25 °C over the day. What is that rise in °F?',
  ['45 °F', '77 °F', '13.9 °F', '57 °F', '25 °F'], 0,
  'A temperature change only uses the scale factor: ΔT(°F) = 1.8 × ΔT(°C) = 45 °F. The +32 is an offset between the zero points, so it cancels in a difference. 77 °F is what 25 °C is as a temperature, not as a change.', { k: 'c' }),
num('h2-2', 'h2', 'Convert 3.50 atm to psi. Give 3 significant figures.', '51.4',
  'The data sheet gives 1 atm = 14.6959 psi.',
  '3.50 × 14.6959 = 51.4 psi.', null, null, { sf: 3, unit: 'psi' }),
num('h2-3', 'h2', 'Convert a force of 12.0 lbf to newtons. Give 3 significant figures.', '53.4',
  'The data sheet gives 1 N = 0.224809 lbf.',
  '12.0 lbf ÷ 0.224809 lbf/N = 53.4 N.', null, null, { sf: 3, unit: 'N' }),
mc('h2-4', 'h2', 'Convert a density of 1.50 g/cm³ to lbm/ft³.',
  ['93.6', '0.0240', '41.6', '1500', '3.31'], 0,
  'The data sheet row for density gives 1 g/cm³ = 62.4280 lbm/ft³. 1.50 × 62.4280 = 93.6 lbm/ft³.', { k: 'n' }),
num('h2-5', 'h2', 'Convert 0.40 kg·m/s² to lbm·ft/min². Give 2 significant figures.', '1.0E4',
  '1 kg·m/s² = 7.23301 lbm·ft/s². Then 1/s² = 3600/min², because 1 min² = 3600 s².',
  '0.40 × 7.23301 = 2.893 lbm·ft/s². Multiply by 3600 to switch s² to min²: 1.04 × 10⁴, which is 1.0E4 to 2 significant figures.', null, null, { sf: 2 }),
mc('h2-6', 'h2', 'What is 68.0 °F in kelvin?',
  ['293 K', '341 K', '20.0 K', '528 K', '253 K'], 0,
  'T(°C) = (68.0 − 32) / 1.8 = 20.0 °C. T(K) = 20.0 + 273.15 = 293 K. 528 is the Rankine value.', { k: 'c' }),

/* ---------- Balancing and stoichiometry ---------- */
mc('h3-1', 'h3', 'Balance with the smallest whole numbers: $C5H12$ + $O2$ → $CO2$ + $H2O$. What is the coefficient of $O2$?',
  ['5', '6', '8', '11', '16'], 2,
  'C₅H₁₂ + 8 O₂ → 5 CO₂ + 6 H₂O. Carbon gives 5 CO₂ and hydrogen gives 6 H₂O. That is 10 + 6 = 16 O atoms, so 8 O₂.', { k: 'c' }),
mc('h3-2', 'h3', 'Balance with the smallest whole numbers: $C3H8O3$ + $O2$ → $CO2$ + $H2O$. What is the coefficient of $O2$?',
  ['3.5', '7', '4', '6', '14'], 1,
  'With 1 glycerol: 3 CO₂ and 4 H₂O need 10 O atoms, and the fuel supplies 3, so 7 O atoms = 3.5 O₂. Double everything to clear the half: 2 C₃H₈O₃ + 7 O₂ → 6 CO₂ + 8 H₂O.', { k: 'c' }),
mc('h3-3', 'h3', 'These reactions run in sequence with 100% yield:<br>A + 2B → C<br>2C → D + E<br>E → 3F<br>How many moles of B are needed to make 6.0 mol of F?',
  ['2.0 mol', '4.0 mol', '8.0 mol', '12 mol', '18 mol'], 2,
  'Work backward. 6.0 mol F needs 2.0 mol E. 2.0 mol E needs 4.0 mol C. 4.0 mol C needs 2 × 4.0 = 8.0 mol B.', { k: 'c' }),
num('h3-4', 'h3', 'What mass of $CO2$ forms when 45.0 g of propane ($C3H8$) burns completely? Give 3 significant figures.', '135',
  'C₃H₈ + 5 O₂ → 3 CO₂ + 4 H₂O. Each mole of propane gives 3 mol CO₂.',
  '45.0 g ÷ 44.10 g/mol = 1.020 mol C₃H₈. × 3 = 3.061 mol CO₂. × 44.01 g/mol = 135 g.', null, null, { sf: 3, unit: 'g' }),
mc('h3-5', 'h3', 'Balance $Fe2O3$ + CO → Fe + $CO2$ with the smallest whole numbers. What is the coefficient of CO?',
  ['1', '2', '3', '4', '6'], 2,
  'Fe₂O₃ + 3 CO → 2 Fe + 3 CO₂. Each CO picks up one O to become CO₂, and Fe₂O₃ has 3 O to give away.', { k: 'c' }),
mc('h3-6', 'h3', 'A + B → C has an 80.% yield, and C → E has a 90.% yield. Starting from 2.0 mol A with excess B, how much E forms?',
  ['1.4 mol', '1.6 mol', '1.8 mol', '2.0 mol', '1.7 mol'], 0,
  'Yields multiply through a sequence: 2.0 × 0.80 = 1.6 mol C, then 1.6 × 0.90 = 1.44 mol E, which is 1.4 mol.', { k: 'n' }),

/* ---------- Limiting reactant and excess ---------- */
mc('h4-1', 'h4', '4.00 mol $N2$ and 9.00 mol $H2$ react: $N2$ + 3 $H2$ → 2 $NH3$. What is the percent excess of $N2$?',
  ['25.0%', '33.3%', '11.1%', '75.0%', '133%'], 1,
  '9.00 mol H₂ only needs 3.00 mol N₂, so H₂ is limiting. Percent excess = (fed − needed) / needed = (4.00 − 3.00) / 3.00 = 33.3%.', { k: 'c' }),
mc('h4-2', 'h4', '10.0 g $H2$ and 64.0 g $O2$ react: 2 $H2$ + $O2$ → 2 $H2O$. What mass of water can form?',
  ['72.1 g', '89.4 g', '36.0 g', '74.0 g', '64.0 g'], 0,
  'n(H₂) = 4.96 mol and n(O₂) = 2.00 mol. The O₂ would need 4.00 mol H₂, and there is more than that, so O₂ is limiting. It gives 4.00 mol H₂O × 18.02 g/mol = 72.1 g.', { k: 'n' }),
num('h4-3', 'h4', '20.0 g of $CaCO3$ is added to 150. mL of 2.00 M HCl: 2 HCl + $CaCO3$ → $CaCl2$ + $CO2$ + $H2O$. What mass of $CO2$ forms? Give 3 significant figures.', '6.60',
  'Find moles of each reactant, then check which one runs out using the 2 : 1 ratio.',
  'n(CaCO₃) = 20.0 / 100.09 = 0.1998 mol. n(HCl) = 0.150 L × 2.00 M = 0.300 mol. All the CaCO₃ would need 0.3997 mol HCl, so HCl is limiting. CO₂ = 0.300 / 2 = 0.150 mol × 44.01 = 6.60 g.', null, null, { sf: 3, unit: 'g' }),
multi('h4-4', 'h4', 'A 5.00 g zinc–aluminum alloy reacts completely with hydrochloric acid and releases 0.250 g of $H2$:<br>Zn + 2 HCl → $ZnCl2$ + $H2$<br>2 Al + 6 HCl → 2 $AlCl3$ + 3 $H2$', [
  { ask: 'What is the mass fraction of Al in the alloy? Give 3 significant figures.', ans: '0.236', sf: 3,
    hint: 'Let x be the mass of Al. Al gives 1.5 mol H₂ per mol, and Zn gives 1 mol H₂ per mol. Set the total equal to 0.250 / 2.016.',
    why: 'n(H₂) = 0.250 / 2.016 = 0.1240 mol. 1.5x / 26.98 + (5.00 − x) / 65.39 = 0.1240. That is 0.05559x + 0.07646 − 0.01529x = 0.1240, so x = 1.180 g. Mass fraction = 1.180 / 5.00 = 0.236.' },
  { ask: '300. mL of 1.00 M HCl was used. What is the percent excess of HCl? Give 2 significant figures.', ans: '21', sf: 2, unit: '%',
    hint: 'In both reactions, 2 mol HCl makes 1 mol H₂.',
    why: 'Both reactions use 2 HCl per H₂, so HCl needed = 2 × 0.1240 = 0.2480 mol. Fed = 0.300 mol. Excess = (0.300 − 0.2480) / 0.2480 = 21%.' }
], 'C'),
mc('h4-5', 'h4', 'Which statement about the limiting reactant is always true?',
  ['It is the reactant with the smallest mass', 'It is the reactant with the fewest moles', 'It is the reactant that would make the least product', 'It is the reactant with the smallest coefficient'], 2,
  'Mass and moles alone ignore the mole ratio. Convert each reactant to the amount of product it could make. The one that makes the least runs out first.', { k: 'c' }),

/* ---------- Yield and atom economy ---------- */
num('h5-1', 'h5', '5.00 g of $S8$ reacts with excess $Cl2$ and gives 8.10 g of $S2Cl2$: $S8$ + 4 $Cl2$ → 4 $S2Cl2$. What is the percent yield? Give 3 significant figures.', '76.9',
  'Theoretical yield first: each mol of S₈ makes 4 mol S₂Cl₂.',
  'n(S₈) = 5.00 / 256.53 = 0.01949 mol, so 0.07797 mol S₂Cl₂ × 135.04 g/mol = 10.53 g theoretical. 8.10 / 10.53 = 76.9%.', null, null, { sf: 3, unit: '%' }),
mc('h5-2', 'h5', 'Route 1 makes a product by an addition reaction, A + B → P. Route 2 makes the same product by A + C → P + $H2O$. Which has the better atom economy?',
  ['Route 1', 'Route 2', 'They are the same', 'It depends on the yield'], 0,
  'In Route 1 every reactant atom ends up in P, so its atom economy is 100%. Route 2 sends some mass into water. Atom economy comes from the balanced equation, not from the yield.', { k: 'c' }),
num('h5-3', 'h5', 'What is the atom economy for making $CH3Cl$ by $CH4$ + $Cl2$ → $CH3Cl$ + HCl? Give 3 significant figures.', '58.1',
  'Atom economy = mass of desired product ÷ mass of all reactants, using the balanced coefficients.',
  'M(CH₃Cl) = 50.49. Reactants: 16.04 + 70.91 = 86.95. 50.49 / 86.95 = 58.1%.', null, null, { sf: 3, unit: '%' }),
mc('h5-4', 'h5', 'Aspirin is made by $C7H6O3$ + $C4H6O3$ → $C9H8O4$ + $C2H4O2$ with a 75% yield. What mass of salicylic acid ($C7H6O3$) is needed to make 50.0 g of aspirin ($C9H8O4$)?',
  ['51.1 g', '38.3 g', '68.1 g', '28.8 g', '66.7 g'], 0,
  'n(aspirin) = 50.0 / 180.16 = 0.2775 mol. At 75% yield you must start with 0.2775 / 0.75 = 0.3700 mol salicylic acid × 138.12 = 51.1 g. Multiplying by 0.75 instead of dividing gives the 28.8 g trap.', { k: 'n' }),
multi('h5-5', 'h5', 'Rust forms by 4 Fe + 3 $O2$ + 6 $H2O$ → 4 $Fe(OH)3$. A 2.00 kg iron block left outside later weighs 2.60 kg. Assume the gain is only the $O2$ and water that reacted.', [
  { ask: 'What is the mass percent of $Fe(OH)3$ in the final block? Give 3 significant figures.', ans: '48.3', sf: 3, unit: '%',
    hint: 'Per 4 mol Fe(OH)₃ the block gains 3 mol O₂ and 6 mol H₂O. Find the gain per mole of Fe(OH)₃.',
    why: 'Gain per mol Fe(OH)₃ = (3 × 32.00 + 6 × 18.02) / 4 = 51.02 g. 600. g / 51.02 = 11.76 mol Fe(OH)₃ × 106.87 = 1257 g. 1257 / 2600 = 48.3%.' },
  { ask: 'What volume of $O2$ reacted, measured at 1.00 atm and 300. K? Give 3 significant figures.', ans: '217', sf: 3, unit: 'L',
    hint: 'n(O₂) = ¾ of n(Fe(OH)₃). Then V = nRT/P.',
    why: 'n(O₂) = 0.75 × 11.76 = 8.820 mol. V = 8.820 × 0.082057 × 300. / 1.00 = 217 L.' }
], 'C'),

/* ---------- Solutions ---------- */
mc('h6-1', 'h6', 'What is the molarity of a 6.00% (w/w) NaCl solution with density 1.04 g/mL?',
  ['1.07 M', '0.0600 M', '1.03 M', '62.4 M', '0.107 M'], 0,
  'Take 1 L = 1040 g of solution. 6.00% of that is 62.4 g NaCl ÷ 58.44 g/mol = 1.07 mol, in 1 L, so 1.07 M.', { k: 'n' }),
num('h6-2', 'h6', '25.0 mL of 6.00 M HCl is diluted to 400. mL. What is the new concentration in M? Give 3 significant figures.', '0.375',
  'Moles of solute stay the same: M₁V₁ = M₂V₂.',
  'M₂ = 6.00 × 25.0 / 400. = 0.375 M.', null, null, { sf: 3, unit: 'M' }),
mc('h6-3', 'h6', 'What volume of 12.0 M stock solution is needed to make 2.00 L of 0.300 M solution?',
  ['50.0 mL', '80.0 mL', '20.0 mL', '500. mL', '7.20 mL'], 0,
  'V₁ = M₂V₂ / M₁ = 0.300 × 2.00 / 12.0 = 0.0500 L = 50.0 mL.', { k: 'c' }),
num('h6-4', 'h6', 'What mass of $CaCl2$ is needed to make 250. mL of 0.150 M solution? Give 3 significant figures.', '4.16',
  'Moles = M × V in litres, then multiply by the molar mass.',
  '0.250 L × 0.150 M = 0.0375 mol × 110.98 g/mol = 4.16 g.', null, null, { sf: 3, unit: 'g' }),
mc('h6-5', 'h6', 'Equal volumes of 1.0 M NaCl and 3.0 M NaCl are mixed. What is the concentration of the mixture?',
  ['1.5 M', '2.0 M', '4.0 M', '3.0 M'], 1,
  'With 1 L of each, you have 1.0 + 3.0 = 4.0 mol in 2 L, so 2.0 M. Concentrations do not add.', { k: 'c' }),

/* ---------- Formulas ---------- */
mc('h7-1', 'h7', 'A hydrocarbon burns completely and produces 13.2 g $CO2$ and 5.40 g $H2O$. What is its empirical formula?',
  ['CH', '$CH2$', '$CH3$', '$C2H5$', '$CH4$'], 1,
  'n(C) = 13.2 / 44.01 = 0.300 mol. n(H) = 2 × 5.40 / 18.02 = 0.599 mol. H : C = 2 : 1, so CH₂.', { k: 'n' }),
mc('h7-2', 'h7', 'A 2.50 g sample containing only C, H and O burns to give 3.67 g $CO2$ and 1.50 g $H2O$. What is its empirical formula?',
  ['$CH2O$', '$C2H4O$', '$CH4O$', '$C2H2O$', '$CHO2$'], 0,
  'n(C) = 0.0834 mol (1.00 g). n(H) = 0.1665 mol (0.168 g). O by difference: 2.50 − 1.00 − 0.168 = 1.33 g = 0.0832 mol. C : H : O = 1 : 2 : 1.', { k: 'n' }),
mc('h7-3', 'h7', 'A compound has empirical formula $CH2O$ and a molar mass of about 180 g/mol. What is its molecular formula?',
  ['$CH2O$', '$C3H6O3$', '$C6H12O6$', '$C6H6O6$'], 2,
  'CH₂O has a mass of 30.0 g/mol. 180 / 30.0 = 6, so multiply every subscript by 6: C₆H₁₂O₆.', { k: 'c' }),
mc('h7-4', 'h7', 'A sulfur oxide is 40.0% S and 60.0% O by mass. What is its empirical formula?',
  ['SO', '$SO2$', '$SO3$', '$S2O3$'], 2,
  'In 100 g: 40.0 / 32.07 = 1.25 mol S and 60.0 / 16.00 = 3.75 mol O. O : S = 3 : 1, so SO₃.', { k: 'c' }),
multi('h7-5', 'h7', 'A gas has empirical formula $CH2$. A 0.459 g sample fills 0.200 L at 1.00 atm and 25.0 °C.', [
  { ask: 'What is its molar mass in g/mol? Give 3 significant figures.', ans: '56.1', sf: 3, unit: 'g/mol',
    hint: 'n = PV/RT with T in kelvin, then M = m/n.',
    why: 'n = (1.00)(0.200) / (0.082057 × 298.15) = 0.008175 mol. M = 0.459 / 0.008175 = 56.1 g/mol.' },
  { ask: 'How many carbon atoms are in its molecular formula?', ans: '4',
    hint: 'Divide the molar mass by the mass of one CH₂ unit.',
    why: '56.1 / 14.03 = 4.00, so the molecular formula is C₄H₈.' }
], 'C'),
mc('h7-6', 'h7', 'A 5.00 g sample containing only C, H and S burns in excess oxygen and gives 10.46 g $CO2$, 2.14 g $H2O$ and some $SO2$. What is the empirical formula?',
  ['CHS', '$C2H2S$', '$C4H4S$', '$CH4S$', '$C4H8S$'], 2,
  'n(C) = 10.46 / 44.01 = 0.2377 mol (2.855 g). n(H) = 2 × 2.14 / 18.02 = 0.2376 mol (0.239 g). S by difference: 5.00 − 2.855 − 0.239 = 1.906 g = 0.0594 mol. C : H : S = 4 : 4 : 1.', { k: 'n' }),

/* ---------- Ideal gas law ---------- */
mc('h8-1', 'h8', 'A cylinder with a freely moving piston holds 1.00 g of $H2$ at 1 atm and 20 °C. The $H2$ is replaced with 1.00 g of He at the same temperature and pressure. What happens to the volume?',
  ['It halves', 'It doubles', 'It stays the same', 'It quadruples'], 0,
  'At fixed T and P, V is proportional to n. 1.00 g H₂ is 0.50 mol, while 1.00 g He is only 0.25 mol. Half the moles means half the volume.', { k: 'c' }),
mc('h8-2', 'h8', 'A rigid container of an ideal gas is heated from 100 °C to 200 °C. What happens to the pressure?',
  ['It doubles, because the temperature doubles', 'It increases, but to less than double', 'It stays the same, because the volume is fixed', 'It increases to more than double'], 1,
  'At fixed V and n, P is proportional to the absolute temperature. 473 K / 373 K = 1.27, so the pressure rises by 27%. Doubling in °C is not doubling in kelvin.', { k: 'c' }),
num('h8-3', 'h8', 'A 2.50 L rigid tank holds $N2$ at 25.0 °C and 3.00 atm. What mass of $N2$ is inside? Give 3 significant figures.', '8.59',
  'n = PV/RT with R = 0.082057 L·atm/(mol·K).',
  'n = (3.00)(2.50) / (0.082057 × 298.15) = 0.3066 mol × 28.01 g/mol = 8.59 g.', null, null, { sf: 3, unit: 'g' }),
mc('h8-4', 'h8', 'What is the density of $CO2$ at 1.00 atm and 0 °C?',
  ['1.96 g/L', '0.509 g/L', '44.0 g/L', '1.80 g/L', '22.4 g/L'], 0,
  'Density = PM / RT = (1.00)(44.01) / (0.082057 × 273.15) = 1.96 g/L.', { k: 'n' }),
mc('h8-5', 'h8', 'In this open-end mercury manometer, the outside pressure is 760 mmHg. What is the pressure of the gas?' + MANO,
  ['640 mmHg', '880 mmHg', '120 mmHg', '760 mmHg', '1000 mmHg'], 1,
  'The gas pushes the mercury down on its own side and up the open side. So when the open side stands 120 mm higher, the gas pressure is 120 mmHg above the air pressure: 760 + 120 = 880 mmHg. If the mercury were higher on the gas side, you would subtract instead.', { k: 'c' }),
mc('h8-6', 'h8', 'A rigid vessel holds 1.00 g of $O2$ at 300. K and 1.00 atm. It is emptied and refilled with 1.00 g of an unknown gas at 600. K, and the pressure is again 1.00 atm. Which gas is it?',
  ['$SO2$', '$CH4$', '$CO2$', '$O3$', 'Ar'], 0,
  'Same V and P, so n is proportional to 1/T. At double the temperature there are half as many moles. Same mass with half the moles means double the molar mass: 2 × 32.0 = 64.0 g/mol, which is SO₂.', { k: 'n' }),
mc('h8-7', 'h8', 'A balloon holds 1 mol of argon. 1 mol of helium is added at constant temperature and pressure. What happens to the density of the gas in the balloon?',
  ['It decreases', 'It increases', 'It stays the same', 'It cannot be determined'], 0,
  'The volume doubles because the moles double. The mass only goes from 39.9 g to 43.9 g, so mass ÷ volume drops.', { k: 'c' }),

/* ---------- Gas mixtures ---------- */
mc('h9-1', 'h9', 'A 2.00 L tank of neon at 4.00 atm is connected to a 3.00 L tank of argon at 1.00 atm. The valve is opened and the temperature stays constant. What is the final total pressure?',
  ['2.20 atm', '2.50 atm', '5.00 atm', '1.60 atm', '0.600 atm'], 0,
  'Each gas expands into 5.00 L. Ne: 4.00 × 2.00 / 5.00 = 1.60 atm. Ar: 1.00 × 3.00 / 5.00 = 0.600 atm. Total 2.20 atm.', { k: 'n' }),
num('h9-2', 'h9', 'A mixture of 4.00 g He and 32.0 g $O2$ has a total pressure of 3.00 atm. What is the partial pressure of He, in atm? Give 3 significant figures.', '1.50',
  'P(He) = y(He) × P(total). Find the mole fraction first.',
  'n(He) = 4.00 / 4.003 = 0.999 mol. n(O₂) = 32.0 / 32.00 = 1.000 mol. y(He) = 0.4998. P(He) = 0.4998 × 3.00 = 1.50 atm.', null, null, { sf: 3, unit: 'atm' }),
mc('h9-3', 'h9', 'A rigid vessel holds $CH4$ at a partial pressure of 0.50 atm and $O2$ at 2.00 atm. The methane burns completely: $CH4$ + 2 $O2$ → $CO2$ + 2 $H2O$(l). The vessel is cooled back to the start temperature and the water condenses. What is the final pressure?',
  ['1.50 atm', '2.50 atm', '2.00 atm', '0.50 atm', '3.50 atm'], 0,
  'At fixed V and T, partial pressures act like moles. 0.50 atm CH₄ uses 1.00 atm O₂ and makes 0.50 atm CO₂. Left: 1.00 atm O₂ + 0.50 atm CO₂ = 1.50 atm. Liquid water adds no gas pressure.', { k: 'n' }),
multi('h9-4', 'h9', 'A rigid vessel holds propane and 50% excess oxygen at 1.00 atm and 300. K. The propane burns completely: $C3H8$ + 5 $O2$ → 3 $CO2$ + 4 $H2O$(g). The final temperature is 900. K and all the water stays as vapour.', [
  { ask: 'What was the mole fraction of propane before the reaction? Give 3 significant figures.', ans: '0.118', sf: 3,
    hint: 'Use 1 mol of propane as a basis. 50% excess means 1.5 × the 5 mol O₂ it needs.',
    why: '1 mol C₃H₈ needs 5 mol O₂, so 7.5 mol O₂ is fed. Total 8.5 mol. y = 1 / 8.5 = 0.118.' },
  { ask: 'What is the final pressure in atm? Give 3 significant figures.', ans: '3.35', sf: 3, unit: 'atm',
    hint: 'Count the moles after: CO₂, H₂O and the leftover O₂. Then P is proportional to nT.',
    why: 'After: 3 CO₂ + 4 H₂O + 2.5 O₂ = 9.5 mol. P = 1.00 × (9.5 / 8.5) × (900. / 300.) = 3.35 atm.' }
], 'C'),
mc('h9-5', 'h9', 'A vessel at room temperature holds equal numbers of moles of $H2$ and He. The percentage by volume of He is ____ that of $H2$.',
  ['less than', 'greater than', 'equal to'], 2,
  'For ideal gases, volume percent equals mole percent. Equal moles means equal volume percent, whatever the molar masses are.', { k: 'c' }),
num('h9-6', 'h9', '0.400 mol of $A2$ sits in a rigid 10.0 L vessel at 300. K. It decomposes completely, $A2$ → 2 A, and the temperature rises by 60.0 K. By how much does the pressure increase, in atm? Give 3 significant figures.', '1.38',
  'Compute the starting and final pressures separately. The moles double and T changes.',
  'Start: P = 0.400 × 0.082057 × 300. / 10.0 = 0.985 atm. End: 0.800 mol at 360. K gives P = 2.363 atm. Increase: 1.38 atm.', null, null, { sf: 3, unit: 'atm' }),
multi('h9-7', 'h9', 'A rigid vessel at 25 °C holds 1.00 mol $C2H4$ and 4.00 mol $O2$ at 5.00 atm. All the ethylene burns by two reactions:<br>$C2H4$ + 3 $O2$ → 2 $CO2$ + 2 $H2O$(l)<br>$C2H4$ + 2 $O2$ → 2 CO + 2 $H2O$(l)<br>After cooling to 25 °C (water condensed), the pressure is 3.80 atm.', [
  { ask: 'What fraction of the ethylene went to CO? Give 3 significant figures.', ans: '0.800', sf: 3,
    hint: 'Let x mol go to CO. Count the final gas moles in terms of x: CO₂, CO and the leftover O₂.',
    why: 'CO₂ = 2(1 − x), CO = 2x, leftover O₂ = 4 − 3(1 − x) − 2x = 1 + x. Total = 3 + x. P is proportional to n, so (3 + x) / 5.00 = 3.80 / 5.00 and x = 0.800.' },
  { ask: 'What is the mole fraction of $CO2$ in the final gas? Give 3 significant figures.', ans: '0.105', sf: 3,
    hint: 'Use x = 0.800 in your mole counts.',
    why: 'CO₂ = 2(0.200) = 0.400 mol of 3.80 mol total. y = 0.400 / 3.80 = 0.105.' }
], 'C'),
multi('h9-8', 'h9', 'A rigid vessel is filled with only $N2$ and $H2$ at 200. atm. The feed is 30.0 mol-% $N2$. Some ammonia forms, $N2$ + 3 $H2$ → 2 $NH3$, and the pressure drops to 180. atm at the starting temperature.', [
  { ask: 'What is the partial pressure of $NH3$ at the end, in atm? Give 3 significant figures.', ans: '20.0', sf: 3, unit: 'atm',
    hint: 'Each time the reaction runs once, 4 mol of gas become 2 mol, a drop of 2.',
    why: 'Let the extent be ξ (in atm). The total drops by 2ξ, so 2ξ = 20.0 and ξ = 10.0. NH₃ = 2ξ = 20.0 atm.' },
  { ask: 'What is the percent yield? Give 3 significant figures.', ans: '21.4', sf: 3, unit: '%',
    hint: 'The feed is 60.0 atm N₂ and 140. atm H₂. Which one runs out first?',
    why: 'H₂ would need 3 × 60.0 = 180 atm, but only 140. atm is there, so H₂ is limiting. The maximum extent is 140. / 3 = 46.7 atm, which would make 93.3 atm NH₃. Actual / theoretical = 20.0 / 93.3 = 21.4%.' }
], 'C'),

/* ---------- Kinetic theory and real gases ---------- */
mc('h10-1', 'h10', 'True or false: in a sealed mixture of He and Ar at one temperature, every He atom moves faster than every Ar atom.',
  ['True', 'False'], 1,
  'He has the higher average speed, but each gas has a whole distribution of speeds. Some Ar atoms are moving faster than some He atoms.', { k: 'c' }),
mc('h10-2', 'h10', 'The curves show the speed distributions of two samples of the same gas. Which statement is true?' + MB,
  ['A is at the higher temperature', 'B is at the higher temperature', 'They are at the same temperature', 'It cannot be determined'], 1,
  'For one gas, a higher temperature shifts the peak to higher speeds and spreads the curve out, so it gets lower and broader. That describes B.', { k: 'c' }),
mc('h10-3', 'h10', 'True or false: for a given gas, the Maxwell–Boltzmann speed distribution gets narrower as the temperature increases.',
  ['True', 'False'], 1,
  'It gets broader. Hotter gases have a wider range of speeds, and the peak moves to higher speeds.', { k: 'c' }),
num('h10-4', 'h10', 'What is the root-mean-square speed of $N2$ at 300. K, in m/s? Give 3 significant figures.', '517',
  'u(rms) = √(3RT/M). Use R = 8.314 J/(mol·K) and M in kg/mol.',
  'M = 0.02801 kg/mol. √(3 × 8.314 × 300. / 0.02801) = 517 m/s. Leaving M in g/mol gives a speed √1000 times too small.', null, null, { sf: 3, unit: 'm/s' }),
mc('h10-5', 'h10', 'At the same temperature, about how many times faster is the rms speed of He than that of $CH4$?',
  ['2.0', '4.0', '0.50', '1.4'], 0,
  'u(rms) is proportional to 1/√M. √(16.04 / 4.003) = √4.01 = 2.0.', { k: 'c' }),
mc('h10-6', 'h10', 'At 0 °C and 50.0 atm, 1.00 mol of a gas occupies 0.380 L. The ideal gas law predicts 0.448 L. Which statement is correct?',
  ['The gas behaves ideally', 'Attractive forces dominate', 'Repulsive forces dominate', 'The gas is less dense than an ideal gas would be'], 1,
  'The real volume is smaller than the ideal volume, so the molecules are being pulled together. Attractions dominate. If repulsion (molecular size) dominated, the real volume would be larger than ideal.', { k: 'c' }),
mc('h10-7', 'h10', 'Real gases behave most like ideal gases at…',
  ['high temperature and low pressure', 'low temperature and high pressure', 'high temperature and high pressure', 'low temperature and low pressure'], 0,
  'Low pressure means molecules are far apart, so their own volume matters little. High temperature means they move fast enough that attractions matter little. As density increases, real gases move away from ideal behaviour.', { k: 'c' }),
mc('h10-8', 'h10', 'In the van der Waals equation, P = nRT/(V − nb) − an²/V², what does b correct for?',
  ['Attractions pulling the molecules toward each other', 'The volume taken up by the molecules themselves', 'Collisions of the molecules with the container walls', 'Temperature changes as the gas is compressed'], 1,
  'Subtracting nb from V removes the space the molecules occupy, leaving the free volume they move in. The an²/V² term corrects for attractions.', { k: 'c' }),
num('h10-9', 'h10', 'Use the van der Waals equation for 1.00 mol $CO2$ in 0.500 L at 300. K, with a = 3.59 L²·atm/mol² and b = 0.0427 L/mol. What is the pressure in atm? Give 3 significant figures.', '39.5',
  'Compute each term separately. R = 0.082057 L·atm/(mol·K).',
  'nRT/(V − nb) = 24.62 / 0.4573 = 53.83 atm. an²/V² = 3.59 / 0.250 = 14.36 atm. P = 53.83 − 14.36 = 39.5 atm. The ideal gas law would give 49.2 atm.', null, null, { sf: 3, unit: 'atm' }),
mc('h10-10', 'h10', 'Helium and xenon are at the same temperature. Which statement is true?',
  ['They have the same average kinetic energy per molecule', 'Xenon has the larger average kinetic energy, being heavier', 'Helium has the larger average kinetic energy, being faster', 'They have the same rms speed at the same temperature'], 0,
  'Average kinetic energy depends only on temperature: E = (3/2)RT per mole. The lighter helium makes up for its small mass with a higher speed.', { k: 'c' }),
mc('h10-11', 'h10', 'True or false: the pressure in a liquid comes mainly from molecules colliding with the container walls.',
  ['True', 'False'], 1,
  'The collision picture is how kinetic theory explains gas pressure. Liquid pressure is hydrostatic: it depends on the height and density of the liquid above, P = ρgh, which is why a mercury column can measure pressure.', { k: 'c' }),
/* ---------- added from the Unit 1 and Unit 2 concept checks and examples ---------- */
mc('h1-6', 'h1', 'An atom has 15 electrons, 15 protons and 16 neutrons. What are its mass number and atomic number?',
  ['46 and 15', '46 and 16', '31 and 15', '30 and 16'], 2,
  'The atomic number is the number of protons, 15. The mass number counts protons plus neutrons: 15 + 16 = 31. Electrons are not counted in either. (It is phosphorus-31.)', { k: 'c' }),
mc('h1-7', 'h1', 'Distilled water ice cubes floating in distilled water are…',
  ['a heterogeneous mixture', 'a homogeneous mixture', 'a pure substance', 'impossible to classify'], 2,
  'Ice and liquid water are two phases of the same compound, H₂O. Two phases do not make a mixture: a mixture needs two or more substances.', { k: 'c' }),
mc('h1-8', 'h1', 'Without more information, a piece of metal is…',
  ['a pure substance', 'a homogeneous mixture', 'a heterogeneous mixture', 'impossible to classify'], 3,
  'It could be a pure element (copper wire) or an alloy, which is a mixture (brass, steel). The concept check answer is "cannot say".', { k: 'c' }),
mc('h1-9', 'h1', 'Which compound has a different empirical formula from the others?',
  ['Glucose, $C6H12O6$', 'Ribose, $C5H10O5$', 'Sorbitol, $C6H14O6$', 'Acetic acid, $C2H4O2$'], 2,
  'Glucose, ribose and acetic acid all reduce to $CH2O$. Sorbitol has two extra H, and $C6H14O6$ reduces to $C3H7O3$.', { k: 'c' }),
num('h1-10', 'h1', 'Copper has two main isotopes, with 34 and 36 neutrons. The periodic table gives copper an average mass of 63.546 u. Taking each isotope\'s mass as its mass number, what percentage of copper atoms have 34 neutrons? Give 3 significant figures.', '72.7',
  'Cu has 29 protons, so the isotopes are ⁶³Cu and ⁶⁵Cu. Let x be the fraction of ⁶³Cu.',
  '63x + 65(1 − x) = 63.546 gives 65 − 2x = 63.546, so x = 0.727, or 72.7%.', null, null, { sf: 3, unit: '%' }),
multi('h1-11', 'h1', 'A bee sting releases about 1.0 µg of isopentyl acetate, $C7H14O2$, the compound that smells like bananas.', [
  { ask: 'How many molecules is that? Give 2 significant figures.', ans: '4.6E15', sf: 2, hint: 'µg → g → mol (M = 130.19 g/mol) → molecules.', why: '1.0 × 10⁻⁶ g / 130.19 g/mol = 7.68 × 10⁻⁹ mol. × 6.022 × 10²³ = 4.6 × 10¹⁵ molecules.' },
  { ask: 'How many carbon atoms is that? Give 2 significant figures.', ans: '3.2E16', sf: 2, hint: 'Each molecule has 7 C atoms.', why: '7 × 4.63 × 10¹⁵ = 3.2 × 10¹⁶ C atoms. Keep the unrounded count until the end.' }
]),
multi('h1-12', 'h1', 'A natural gas is 70.0 mol-% methane ($CH4$) and 30.0 mol-% ethane ($C2H6$).', [
  { ask: 'What is the average molar mass of the gas, in g/mol? Give 3 significant figures.', ans: '20.3', sf: 3, unit: 'g/mol', hint: 'Take a basis of 1 mol of gas.', why: '0.700 × 16.04 + 0.300 × 30.07 = 11.23 + 9.02 = 20.25 g/mol, so 20.3.' },
  { ask: 'What is the mass percentage of methane? Give 3 significant figures.', ans: '55.5', sf: 3, unit: '%', hint: 'Mass of methane in 1 mol of gas ÷ mass of 1 mol of gas.', why: '11.23 g / 20.25 g = 55.5% methane by mass. Mol-% and mass-% differ because ethane molecules are heavier.' }
]),
num('h1-13', 'h1', 'Penicillin F is $C14H20N2SO4$. What is the mass percent of carbon? Give 4 significant figures.', '53.83',
  'Mass of C in one mole ÷ molar mass.',
  'M = 14(12.011) + 20(1.008) + 2(14.007) + 32.066 + 4(15.999) = 312.39 g/mol. C: 168.15 / 312.39 = 53.83%.', null, null, { sf: 4, unit: '%' }),

mc('h2-7', 'h2', 'Which of these would you NOT write for an acceleration?',
  ['9.8 ms⁻²', '9.8 m s⁻²', '9.8 m·s⁻²', '9.8 m/s²'], 0,
  'With no space or dot, "ms" reads as milliseconds, so ms⁻² means per millisecond squared. Separate unit symbols with a space or a centred dot.', { k: 'c' }),
multi('h2-8', 'h2', 'You drive 14000 km a year. Your gas car gets 28 miles per gallon, and gasoline emits 2.3 kg $CO2$ per litre. An electric car uses 157 Wh/km, and Ontario power emits 25 g $CO2$ per kWh. Use the data sheet conversions.', [
  { ask: 'How much $CO2$ does the gas car emit per year, in kg? Give 3 significant figures.', ans: '2.70E3', sf: 3, unit: 'kg', hint: 'km → mi → gal → L → kg CO₂. 1 m³ = 264.172 US gal.', why: '14000 km × 0.621371 mi/km = 8699 mi. ÷ 28 = 310.7 gal. × 3.785 L/gal = 1176 L. × 2.3 = 2705 kg, or 2.70E3 with 3 significant figures.' },
  { ask: 'How much does the electric car emit per year, in kg? Give 3 significant figures.', ans: '55.0', sf: 3, unit: 'kg', hint: 'km × Wh/km → kWh → g CO₂.', why: '14000 × 157 Wh = 2.198 × 10⁶ Wh = 2198 kWh. × 25 g = 54950 g = 55.0 kg.' },
  { ask: 'By how much does switching cut emissions, in kg per year? Give 3 significant figures.', ans: '2.65E3', sf: 3, unit: 'kg', hint: 'Subtract, using the unrounded values.', why: '2705 − 55 = 2650 kg per year, or 2.65E3.' }
], 'C'),
num('h2-9', 'h2', 'Express a heat capacity of 7.20 Btu/(lbm·°F) in J/(g·K). Give 3 significant figures.', '30.1',
  '1 Btu = 1055.06 J, 1 lbm = 453.592 g, and a change of 1 °F is a change of 5/9 K.',
  '7.20 × 1055.06 / 453.592 = 16.75 J/(g·°F). Per kelvin is 9/5 as much, since 1 K = 1.8 °F as a change: 16.75 × 1.8 = 30.1 J/(g·K).', null, null, { sf: 3, unit: 'J/(g·K)' }),

mc('h3-7', 'h3', 'How many moles of $NaClO3$ are needed to make 6.00 mol of $SO2$ by these two steps?<br>2 $NaClO3$ → 2 NaCl + 3 $O2$<br>S + $O2$ → $SO2$',
  ['2.00 mol', '4.00 mol', '3.00 mol', '18.00 mol'], 1,
  '6.00 mol $SO2$ needs 6.00 mol $O2$. Each 2 mol $NaClO3$ gives 3 mol $O2$, so 6.00 × 2/3 = 4.00 mol $NaClO3$.', { k: 'n' }),
num('h3-8', 'h3', 'Balance with the smallest whole numbers: FeS + $O2$ → $Fe2O3$ + $SO2$. What is the coefficient of $O2$?', '7',
  'Balance Fe and S first, then count O.',
  '4 FeS + 7 $O2$ → 2 $Fe2O3$ + 4 $SO2$. Right side O: 2 × 3 + 4 × 2 = 14, so 7 $O2$.'),
num('h3-9', 'h3', 'Carbon capture: $CO2$ dissolved in water reacts with basalt, $Mg2SiO4$ + $CO2$ → $SiO2$ + $MgCO3$ (not balanced). What mass of $CO2$, in g, can 1.00 tonne of $Mg2SiO4$ store? Give 3 significant figures.', '6.26E5',
  'Balance first. 1 tonne = 10⁶ g.',
  'Balanced: $Mg2SiO4$ + 2 $CO2$ → $SiO2$ + 2 $MgCO3$. 10⁶ g / 140.69 g/mol = 7108 mol $Mg2SiO4$. × 2 × 44.01 g/mol = 6.26 × 10⁵ g $CO2$.', null, null, { sf: 3, unit: 'g' }),
num('h3-10', 'h3', 'A bottled gas is 72.7% propane ($C3H8$) and 27.3% butane ($C4H10$) by mass. What mass of $CO2$ forms when 406 g of it burns completely? Give 3 significant figures.', '1.22E3',
  'Split the 406 g into the two fuels. Each C atom in a fuel becomes one $CO2$.',
  'Propane: 295.2 g / 44.10 = 6.694 mol, × 3 = 20.08 mol $CO2$. Butane: 110.8 g / 58.12 = 1.907 mol, × 4 = 7.628 mol. Total 27.71 mol × 44.01 = 1219 g, or 1.22E3 g.', null, null, { sf: 3, unit: 'g' }),

mc('h4-6', 'h4', '2.0 mol each of A, B and C react by 2A + 4B + C → 2D + 4E. Which is the limiting reactant?',
  ['A', 'B', 'C', 'None, they run out together'], 1,
  'Divide each amount by its coefficient: A 2.0/2 = 1.0, B 2.0/4 = 0.5, C 2.0/1 = 2.0. The smallest is B, so B runs out first.', { k: 'c' }),
mc('h4-7', 'h4', 'For the same mixture (2.0 mol each of A, B and C, with 2A + 4B + C → 2D + 4E), what is the percent excess of A?',
  ['50%', '100%', '200%', '0%'], 1,
  'B is limiting. 2.0 mol B needs 2.0 × 2/4 = 1.0 mol A. A has 2.0 mol, so the excess is (2.0 − 1.0)/1.0 = 100%.', { k: 'n' }),
mc('h4-8', 'h4', 'HCl reacts with 125% excess aluminum: 2 Al + 6 HCl → 2 $AlCl3$ + 3 $H2$. How many moles of Al should be supplied for 6 mol HCl?',
  ['2.0 mol', '2.5 mol', '3.0 mol', '4.0 mol', '4.5 mol'], 4,
  '6 mol HCl needs exactly 2 mol Al. 125% excess means 125% more than that: 2 × (1 + 1.25) = 4.5 mol.', { k: 'n' }),
mc('h4-9', 'h4', '18.1 g of $NH3$ reacts with 90.4 g of CuO: 2 $NH3$ + 3 CuO → $N2$ + 3 Cu + 3 $H2O$. What is the theoretical yield of $N2$?',
  ['10.6 g', '14.9 g', '31.8 g', '7.07 g'], 0,
  '$NH3$: 18.1 / 17.03 = 1.063 mol, which could make 0.531 mol $N2$. CuO: 90.4 / 79.55 = 1.136 mol, which could make 0.379 mol $N2$. CuO is limiting: 0.379 × 28.01 = 10.6 g. 14.9 g is what you get if you wrongly use $NH3$.', { k: 'n' }),
num('h4-10', 'h4', 'Excess aluminum foil reacts with 225 mL of hydrochloric acid that has a density of 1.088 g/mL and is 18% HCl by mass: 2 Al + 6 HCl → 2 $AlCl3$ + 3 $H2$. What mass of $H2$ forms? Give 2 significant figures.', '1.2',
  'Volume → mass of solution → mass of HCl → mol.',
  '225 × 1.088 = 244.8 g solution. × 0.18 = 44.06 g HCl. / 36.46 = 1.209 mol HCl. × 3/6 = 0.604 mol $H2$. × 2.016 = 1.2 g.', null, null, { sf: 2, unit: 'g' }),

mc('h5-6', 'h5', 'A mixture has equal moles of Ca and S, and Ca + S → CaS runs with an 80.0% yield. The mass of CaS formed equals…',
  ['the sum of the masses of Ca and S', '80.0% of the sum of the masses of Ca and S', '20.0% of the sum of the masses of Ca and S', 'none of these'], 1,
  'With equal moles there is no excess, so at 100% yield all the mass would become CaS (mass is conserved). At 80.0% yield you get 80.0% of that.', { k: 'c' }),
num('h5-7', 'h5', 'These reactions run one after the other, each with an 84% yield:<br>$CH4$ + $Cl2$ → $CH3Cl$ + HCl<br>$CH3Cl$ + $Cl2$ → $CH2Cl2$ + HCl<br>Starting from 112 g of $CH4$ with excess $Cl2$, what mass of $CH2Cl2$ forms? Give 3 significant figures.', '418',
  'Apply the 84% twice.',
  '112 / 16.04 = 6.981 mol $CH4$. × 0.84 × 0.84 = 4.926 mol $CH2Cl2$. × 84.93 g/mol = 418 g.', null, null, { sf: 3, unit: 'g' }),
multi('h5-8', 'h5', 'Two routes to phenol, $C6H5OH$:<br>Route 1: $C6H5SO3H$ + 2 NaOH → $C6H5OH$ + $Na2SO3$ + $H2O$<br>Route 2 (cumene): $C9H12$ + $O2$ → $C6H5OH$ + $C3H6O$ (acetone)', [
  { ask: 'What is the atom economy of route 1, in %? Give 3 significant figures.', ans: '39.5', sf: 3, unit: '%', hint: 'Mass of desired product ÷ total mass of reactants, per mole of reaction.', why: 'Reactants: 158.18 + 2(40.00) = 238.17 g. Phenol: 94.11 g. 94.11 / 238.17 = 39.5%.' },
  { ask: 'What is the atom economy of route 2, counting only phenol as the product? Give 3 significant figures.', ans: '61.8', sf: 3, unit: '%', hint: 'Cumene is 120.19 g/mol.', why: 'Reactants: 120.19 + 32.00 = 152.19 g. 94.11 / 152.19 = 61.8%. If acetone is also counted as a product, it is 100%.' }
]),

num('h6-6', 'h6', 'Instant coffee is 3.142% caffeine by mass ($M$ = 194.19 g/mol). You stir 2.00 g of it into 250. mL of water. What is the caffeine concentration, in mol/L? Assume the volume stays 250. mL. Give 3 significant figures.', '1.29E-3',
  'g coffee → g caffeine → mol → mol/L.',
  '2.00 × 0.03142 = 0.06284 g caffeine. / 194.19 = 3.236 × 10⁻⁴ mol. / 0.250 L = 1.29 × 10⁻³ M.', null, null, { sf: 3, unit: 'M' }),

mc('h7-7', 'h7', 'A 10.20 g sample containing only C, H and O burns completely to 23.10 g $CO2$ and 4.72 g $H2O$. What is its empirical formula?',
  ['$C5H5O2$', '$C2H2O$', '$C5H10O2$', '$C3H3O$'], 0,
  'C: 23.10 / 44.01 = 0.5249 mol (6.304 g). H: 2 × 4.72 / 18.02 = 0.5240 mol (0.528 g). O: 10.20 − 6.304 − 0.528 = 3.368 g = 0.2105 mol. Ratio 2.49 : 2.49 : 1, and × 2 gives $C5H5O2$. The data are not enough for the molecular formula.', { k: 'n' }),
multi('h7-8', 'h7', 'A 0.596 g sample of a gaseous boron hydride fills 484 cm³ at 0 °C and 1 atm. Burned in excess oxygen, all its hydrogen becomes 1.17 g of $H2O$ and all its boron becomes $B2O3$. (B = 10.811 g/mol.)', [
  { ask: 'What is its molar mass, in g/mol? Give 3 significant figures.', ans: '27.6', sf: 3, unit: 'g/mol', hint: 'n = PV/RT, then M = m/n.', why: 'n = (1 atm)(0.484 L) / (0.082057 × 273.15) = 0.02159 mol. M = 0.596 / 0.02159 = 27.6 g/mol.' },
  { ask: 'How many hydrogen atoms are in one molecule?', ans: '6', hint: 'Find the B : H mole ratio, then compare the empirical formula mass to 27.6.', why: 'H: 2 × 1.17 / 18.02 = 0.1299 mol (0.131 g). B: (0.596 − 0.131) / 10.811 = 0.0430 mol. H/B = 3.02, so the empirical formula is $BH3$ (13.8 g/mol). 27.6 / 13.8 = 2, so the molecule is $B2H6$.' },
  { ask: 'What mass of $B2O3$ forms, in g? Give 3 significant figures.', ans: '1.50', sf: 3, unit: 'g', hint: 'Every 2 B atoms make one $B2O3$.', why: '0.0430 mol B / 2 = 0.02151 mol $B2O3$. × 69.62 g/mol = 1.50 g.' }
], 'C'),

mc('h8-8', 'h8', 'Two cylinders have the same mass. One stands on a narrow end, the other on a wide end. Which exerts the greater pressure on the table?',
  ['The one on the narrow end', 'The one on the wide end', 'They exert the same pressure', 'It depends on the material'], 0,
  'Both push down with the same force, their weight. Pressure is force per area, P = F/A, so the smaller contact area gives the larger pressure.', { k: 'c' }),
mc('h8-9', 'h8', 'At 400 K and 1 atm, 1 mole of which gas occupies the largest volume?',
  ['$H2$, the lightest molecule', '$O2$, the heaviest molecule', 'He, the smallest atom', '$N2$, the most common gas in air', 'All occupy the same volume'], 4,
  'For an ideal gas V = nRT/P. With the same n, T and P, the volume is the same whatever the gas. Avogadro\'s law.', { k: 'c' }),
num('h8-10', 'h8', 'A student swallows a 0.50 mL drop of liquid oxygen (density 1.149 g/mL). What volume of gas does it become at body temperature, 37 °C, and 1 atm, in L? Give 2 significant figures.', '0.46',
  'Volume → mass → moles, then V = nRT/P with T in kelvin.',
  '0.50 × 1.149 = 0.5745 g. / 32.00 = 0.01795 mol. V = 0.01795 × 0.082057 × 310.15 / 1 = 0.46 L, a 900-fold expansion. Forgetting to convert to kelvin gives a value about 8 times too small.', null, null, { sf: 2, unit: 'L' }),
multi('h8-11', 'h8', 'Two evacuated bulbs of equal volume are joined by a thin tube. One sits in a bath at 225 K and the other at 350. K. Exactly 1 mol of ideal gas is let in.', [
  { ask: 'How many moles end up in the 225 K bulb? Give 3 significant figures.', ans: '0.609', sf: 3, unit: 'mol', hint: 'The pressures are equal and so are the volumes, so n₁T₁ = n₂T₂, with n₁ + n₂ = 1.', why: 'n₁(225) = (1 − n₁)(350), so n₁ = 350 / 575 = 0.609 mol. The cold bulb holds more gas.' },
  { ask: 'How many moles are in the 350. K bulb? Give 3 significant figures.', ans: '0.391', sf: 3, unit: 'mol', hint: 'The total is 1 mol.', why: '1 − 0.609 = 0.391 mol, which is 225 / 575.' }
], 'C'),
num('h8-12', 'h8', 'A 3.57 g mixture of KCl and $KClO3$ is heated. The $KClO3$ decomposes, 2 $KClO3$ → 2 KCl + 3 $O2$, giving 119 mL of $O2$ at 22.4 °C and 738 mmHg. What was the mass percent of $KClO3$? Give 3 significant figures.', '10.9',
  'n(O₂) = PV/RT with P in atm and V in L. Only the KClO₃ makes O₂.',
  'P = 738/760 = 0.9711 atm. n = 0.9711 × 0.119 / (0.082057 × 295.55) = 4.765 × 10⁻³ mol $O2$. × 2/3 = 3.177 × 10⁻³ mol $KClO3$, × 122.55 = 0.389 g. 0.389 / 3.57 = 10.9%.', null, null, { sf: 3, unit: '%' }),

multi('h9-9', 'h9', '2.00 g of He and 2.00 g of $H2$ are placed in a 15.0 L container at 30.0 °C.', [
  { ask: 'What is the partial pressure of He, in atm? Give 3 significant figures.', ans: '0.829', sf: 3, unit: 'atm', hint: 'Each gas acts as if it were alone: P = nRT/V.', why: 'n = 2.00 / 4.003 = 0.4997 mol. P = 0.4997 × 0.082057 × 303.15 / 15.0 = 0.829 atm.' },
  { ask: 'What is the partial pressure of $H2$, in atm? Give 3 significant figures.', ans: '1.65', sf: 3, unit: 'atm', hint: 'Same mass, but H₂ is about half the molar mass of He.', why: 'n = 2.00 / 2.016 = 0.9921 mol. P = 1.65 atm.' },
  { ask: 'What is the total pressure, in atm? Give 3 significant figures.', ans: '2.47', sf: 3, unit: 'atm', hint: 'Dalton\'s law.', why: '0.829 + 1.645 = 2.47 atm.' }
]),
num('h9-10', 'h9', 'A 2 L container of $H2$ at 0.5 atm is joined to a 1 L container of $N2$ at 2 atm, at the same temperature. The barrier between them is removed. What is the final total pressure, in atm?', '1',
  'Each gas expands into the full 3 L. Use P₁V₁ = P₂V₂ for each, then add.',
  '$H2$: 0.5 × 2 / 3 = 0.333 atm. $N2$: 2 × 1 / 3 = 0.667 atm. Total 1 atm.', null, null, { unit: 'atm' }),
mc('h9-11', 'h9', 'Exhaled air has less $N2$ and $O2$ than ordinary air, but more $CO2$ and water vapour (18 g/mol). At the same temperature and pressure, is exhaled air denser than ordinary air?',
  ['Less dense: its average molar mass is lower, mostly from the water vapour', 'Denser, because the extra $CO2$ raises its average molar mass', 'The same, because density at fixed T and P does not depend on the gas', 'Denser, because exhaled air is warmer and holds more water'], 0,
  'Gas density is PM/RT, so at the same T and P it follows the average molar mass. Using the table: exhaled air is about 28.74 g/mol versus 28.96 g/mol for ordinary air. The added water vapour outweighs the added $CO2$.', { k: 'c' }),
multi('h9-12', 'h9', 'A rigid vessel at 100 °C holds a mixture of acetylene ($C2H2$) and CO at 1.20 atm. It burns in excess $O2$:<br>2 $C2H2$ + 5 $O2$ → 4 $CO2$ + 2 $H2O$(g)<br>2 CO + $O2$ → 2 $CO2$<br>The $CO2$ and $H2O$ formed have a total pressure of 2.88 atm in the same vessel at 100 °C.', [
  { ask: 'What was the partial pressure of $C2H2$ in the original mixture, in atm? Give 2 significant figures.', ans: '0.84', sf: 2, unit: 'atm', hint: 'At constant T and V, partial pressures behave like moles. Each $C2H2$ gives 2 $CO2$ + 1 $H2O$; each CO gives 1 $CO2$.', why: 'P(C₂H₂) + P(CO) = 1.20 and 3P(C₂H₂) + P(CO) = 2.88. Subtract: 2P(C₂H₂) = 1.68, so P(C₂H₂) = 0.84 atm.' },
  { ask: 'What was the mole fraction of CO in the original mixture? Give 2 significant figures.', ans: '0.30', sf: 2, hint: 'y = P(CO) / P(total).', why: 'P(CO) = 1.20 − 0.84 = 0.36 atm. y = 0.36 / 1.20 = 0.30.' }
], 'C'),
multi('h9-13', 'h9', 'A 10 L vessel holds ethene ($C2H4$), ethane ($C2H6$) and $O2$ at 2.0 atm and 25 °C. Everything burns completely to $CO2$ and liquid water. After cooling to 25 °C and removing the water, only $CO2$ is left, at 0.95 atm.', [
  { ask: 'What was the partial pressure of ethane, in atm? Give 2 significant figures.', ans: '0.20', sf: 2, unit: 'atm', hint: 'Balance both: $C2H4$ + 3 $O2$ → 2 $CO2$ + 2 $H2O$ and 2 $C2H6$ + 7 $O2$ → 4 $CO2$ + 6 $H2O$. All the O₂ is used up.', why: 'Total: P(C₂H₄) + P(C₂H₆) + 3P(C₂H₄) + 3.5P(C₂H₆) = 2.0. CO₂: 2P(C₂H₄) + 2P(C₂H₆) = 0.95. Subtract twice the second from the first: 0.5P(C₂H₆) = 0.10, so P(C₂H₆) = 0.20 atm.' },
  { ask: 'What was the mole fraction of $O2$ in the original mixture? Give 2 significant figures.', ans: '0.76', sf: 2, hint: 'Find P(C₂H₄) next, then P(O₂).', why: 'P(C₂H₄) = 0.475 − 0.20 = 0.275 atm. P(O₂) = 3(0.275) + 3.5(0.20) = 1.525 atm. y = 1.525 / 2.0 = 0.76.' }
], 'C'),

mc('h10-12', 'h10', 'Two containers of different size hold the same number of moles of argon at the same temperature. True or false: the rms speed of the argon is the same in both.',
  ['True', 'False'], 0,
  'u(rms) = √(3RT/M) depends only on temperature and molar mass. The volume does not appear.', { k: 'c' }),
mc('h10-13', 'h10', 'Same two containers (same n and T, different volumes). True or false: argon atoms hit the walls equally often in both.',
  ['True', 'False'], 1,
  'In the bigger container the atoms travel farther between walls and the wall area is larger, so each bit of wall is hit less often. That is why its pressure is lower.', { k: 'c' }),
mc('h10-14', 'h10', 'Same two containers (same n and T, different volumes). True or false: the average force of each collision with the wall is the same in both.',
  ['True', 'False'], 0,
  'The force of one collision depends on the atom\'s mass and speed, and both are the same at the same temperature. Only the number of collisions per second differs.', { k: 'c' }),
mc('h10-15', 'h10', 'Same two containers (same n and T). True or false: every argon atom has the same kinetic energy.',
  ['True', 'False'], 1,
  'Temperature fixes the average kinetic energy. Individual atoms follow the Maxwell–Boltzmann distribution, so their energies vary widely.', { k: 'c' }),
mc('h10-16', 'h10', 'All at 273 K. Which is described worst by the ideal gas law?',
  ['$N2$ at 10 atm', '$N2$ at 1 atm', 'He at 1000 atm', 'He at 10 atm'], 2,
  'Higher pressure packs molecules closer, so their size and attractions matter more. At 1000 atm even helium is far from ideal. The full ranking from the slides, best to worst: He 1 atm, $N2$ 1 atm, He 10 atm, $N2$ 10 atm, He 1000 atm.', { k: 'c' }),
mc('h10-17', 'h10', 'All at 10 atm. Which is described worst by the ideal gas law?',
  ['$N2$ at 273 K', '$N2$ at 150 K', 'He at 273 K', 'He at 150 K'], 1,
  'Lower temperature means slower molecules, so attractions matter more, and $N2$ attracts more strongly than He (it is larger and more polarizable). Cold $N2$ is the least ideal.', { k: 'c' }),
mc('h10-18', 'h10', 'One mole of $SO2$ occupies 1.85 L at 0 °C and 10 atm. An ideal gas would occupy 2.24 L. Which statement is true?',
  ['$SO2$ behaves as an ideal gas', 'Its density is less than the ideal gas law predicts', 'The $SO2$ molecules attract each other', 'Repulsive forces dominate'], 2,
  'The real volume is smaller than the ideal one, so the gas is denser than predicted: the molecules pull each other closer. Repulsion would make the volume larger than ideal.', { k: 'c' }),
num('h10-19', 'h10', 'For that $SO2$ (1 mol in 1.85 L at 0 °C and 10 atm), what is the compressibility factor Z = PV/(nRT)? Give 3 significant figures.', '0.825',
  'Z = 1 for an ideal gas.',
  'Z = 10 × 1.85 / (1 × 0.082057 × 273.15) = 18.5 / 22.41 = 0.825. Z below 1 means attractions dominate.', null, null, { sf: 3 }),
mc('h10-20', 'h10', 'Which molecule can form hydrogen bonds with itself?',
  ['$CH3OH$', '$CH3OCH3$', '$CH3F$', '$CH4$'], 0,
  'Hydrogen bonding needs an H attached directly to N, O or F. Methanol has an O–H. In $CH3OCH3$ and $CH3F$ every H is on carbon.', { k: 'c' }),
mc('h10-21', 'h10', 'Which has the strongest London dispersion forces?',
  ['$CH4$', '$C2H6$', '$C3H8$', '$C4H10$'], 3,
  'Dispersion forces grow with the number of electrons and the size of the molecule, which make it more polarizable. Butane is the largest, which is also why it has the highest boiling point of the four.', { k: 'c' }),
mc('h10-22', 'h10', 'HCl is polar and Ar is not. Besides dispersion, which force acts between an HCl molecule and an Ar atom?',
  ['Dipole–induced dipole', 'Dipole–dipole', 'Hydrogen bonding', 'Induced dipole–induced dipole'], 0,
  'The HCl dipole distorts the electron cloud of Ar and induces a temporary dipole, which it then attracts. Dipole–dipole needs two permanent dipoles.', { k: 'c' }),
num('h10-23', 'h10', 'By how much does the pressure increase 10.0 m below the surface of water (ρ = 1000 kg/m³, g = 9.81 m/s²), in kPa? Give 3 significant figures.', '98.1',
  'P = ρgh gives pascals.',
  '1000 × 9.81 × 10.0 = 98100 Pa = 98.1 kPa, almost one extra atmosphere.', null, null, { sf: 3, unit: 'kPa' }),


];

/* $C6H12O6$ marks a chemical formula: digits after an element or bracket become subscripts */
function chem(s) { return typeof s === 'string' ? s.replace(/\$([^$]+)\$/g, function (m, f) { return f.replace(/([A-Za-z\)\]])(\d+)/g, '$1<sub>$2</sub>'); }) : s; }
Q.forEach(function (q) {
  q.q = chem(q.q); q.why = chem(q.why); q.hint = chem(q.hint);
  if (q.opts) q.opts = q.opts.map(chem);
  if (q.parts) q.parts.forEach(function (p) { p.ask = chem(p.ask); p.why = chem(p.why); p.hint = chem(p.hint); });
});

COURSES.push({
  id: 'che102', code: 'CHE 102', name: 'Chemistry for Engineers', key: 'che102-midterm-gym-v1', hue: 'c2', tol: 0.01,
  exam: { at: '2026-10-23T18:30:00-04:00', label: 'Fri Oct 23, 6:30 PM' },
  scope: 'Stoichiometry and gases (Units 1 and 2)',
  topics: T, Q: Q,
  titles: ['Mole Rookie', 'Unit Juggler', 'Balancer', 'Limiting Legend', 'Yield Chaser', 'Formula Finder', 'Gas Law Guru', 'Partial Pressure Pro', 'Kinetic Theorist', 'Midterm Catalyst'],
  formula: { kind: 'html', title: 'CHE 102 data sheet (typed)', note: 'A typed summary of the constants and equations the CHE 102 midterm provides. The official sheet and periodic table are not included in this public version, so use any periodic table.',
    items: [
      ['Constants', 'N<sub>A</sub> = 6.02214 × 10<sup>23</sup> mol<sup>−1</sup><br>k<sub>B</sub> = 1.38066 × 10<sup>−23</sup> J/K<br>F = 96485 C/mol'],
      ['Gas constant R', '8.314 J/(mol·K) = 8.314 m³·Pa/(mol·K)<br>0.082057 L·atm/(mol·K) · 0.08314 L·bar/(mol·K)<br>82.057 cm³·atm/(mol·K) · 1.9859 cal/(mol·K)<br>10.7316 ft³·psi/(lbmol·°R) · 0.73024 ft³·atm/(lbmol·°R)'],
      ['Unit conversions', '1 m = 3.28084 ft = 39.370 in = 10<sup>10</sup> Å<br>1 kg = 2.20462 lb<sub>m</sub> · 1 m³ = 1000 L = 264.172 US gal<br>1 g/cm³ = 1000 kg/m³ = 62.4280 lb<sub>m</sub>/ft³<br>1 N = 0.224809 lb<sub>f</sub> = 7.23301 lb<sub>m</sub>·ft/s²<br>1 atm = 101325 Pa = 1.01325 bar = 14.6959 psi = 760 mmHg<br>1 J = 0.239006 cal = 9.4782 × 10<sup>−4</sup> Btu · 1 W = 3.4121 Btu/h'],
      ['Temperature', 'T(°C) = (T(°F) − 32) / 1.8 · T(°F) = 1.8 T(°C) + 32<br>T(K) = T(°C) + 273.15 · T(°R) = T(°F) + 459.67'],
      ['Gas laws', 'PV = nRT · P<sub>i</sub> = y<sub>i</sub>P<br>van der Waals: P = nRT/(V − nb) − an²/V²'],
      ['Kinetic theory', 'u<sub>av</sub> = √(8RT/πM) · u<sub>rms</sub> = √(3RT/M) · u<sub>mp</sub> = √(2RT/M)<br>P = nMc²/(3V), with c² = 3RT/M · average kinetic energy = (3/2)nRT'],
      ['Dry air', 'M = 29 g/mol, 21 mol-% O<sub>2</sub> and 79 mol-% N<sub>2</sub>'],
      ['Atom economy', 'mass of desired product(s) ÷ mass of all reactants']
    ] },
  mock: { minutes: 90, blurb: 'Same layout as your Fall 2026 midterm: Part A has 8 conceptual multiple choice (2 points each), Part B has 4 numerical multiple choice (5 points each), and Part C has 2 open-ended calculations (10 points each), for 56 points.',
    sections: [
      { label: 'Part A · conceptual', short: 'Part A', n: 8, pts: 2, pick: function (q) { return q.type === 'mc' && q.k === 'c'; } },
      { label: 'Part B · numerical', short: 'Part B', n: 4, pts: 5, pick: function (q) { return q.type === 'mc' && q.k === 'n'; } },
      { label: 'Part C · open-ended', short: 'Part C', n: 2, pts: 10, pick: function (q) { return q.lp === 'C'; } }
    ] },
  how: ['Numeric answers are accepted within 1%, so small molar-mass rounding differences are fine.',
    'When a question asks for significant figures, give exactly that many, Mobius style: 1.0E4, not 1.0*10^4. The right value with the wrong sig figs earns half credit.',
    'Do past midterms by hand too. These questions are written in the same style, not copied from them.']
});
})();
