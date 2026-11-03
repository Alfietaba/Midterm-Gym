/* ================= MTE 121 ================= */
(function () {
var T = [
  { id: 'c1', name: 'C++ fundamentals', sec: 'Types and operators' },
  { id: 'c2', name: 'Decisions', sec: 'if, else, logic' },
  { id: 'c3', name: 'Loops and file reading', sec: 'for, while, do' },
  { id: 'c4', name: 'Functions', sec: 'Value and reference' },
  { id: 'c5', name: 'VEX robot programming', sec: 'Motors and sensors' }
];
var W = 'The code runs inside main(). Type the exact output.';
var P = 'Assume ' + K`#include <iostream>` + ' and ' + K`using namespace std;` + ' Type the exact output.';
var Q = [
/* ---------- C++ fundamentals ---------- */
mc('c1-1', 'c1', 'What does this print?' + C`
int a = 7, b = 2;
double c = a / b;
cout << c;`,
  [K`3.5`, K`3`, K`4`, K`3.0`, 'It does not compile'], 1,
  'Both operands are int, so a / b is integer division: 7 / 2 = 3. Only then is 3 stored in the double, and cout prints a whole-number double without a decimal point, so you see 3.', { test: { expect: true } }),
txt('c1-2', 'c1', W + C`
int a = 17, b = 5;
cout << a / b << " " << a % b << " " << (double)a / b;`,
  '3 2 3.4',
  'The cast applies to a before the division happens.',
  '17 / 5 is integer division, 3. 17 % 5 is the remainder, 2. (double)a / b turns a into 17.0 first, so the division is real: 3.4.'),
mc('c1-3', 'c1', 'After ' + K`int x = 3.99;` + ' runs, what is stored in x?',
  [K`4`, K`3`, K`3.99`, 'A compile error'], 1,
  'Converting a double to int truncates toward zero. Nothing is rounded, so 3.99 becomes 3. (Vevox had the same idea: int a = 3.5 stores 3.)'),
txt('c1-4', 'c1', W + C`
int i = 5;
int j = i++ + 2;
int k = ++i * 2;
cout << i << " " << j << " " << k;`,
  '7 7 14',
  'i++ uses the old value, then adds 1. ++i adds 1 first, then uses the new value.',
  'j = 5 + 2 = 7, and then i becomes 6. ++i makes i 7 before the multiply, so k = 7 · 2 = 14. Final: i = 7, j = 7, k = 14.'),
mc('c1-5', 'c1', 'What does ' + K`cout << 2 + 3 * 4 % 5 - 1;` + ' print?',
  [K`3`, K`-1`, K`4`, K`13`], 0,
  '*, / and % share the same precedence and run left to right before + and −. 3 * 4 = 12, then 12 % 5 = 2. So 2 + 2 − 1 = 3. The answer −1 comes from wrongly doing (2 + 3) first.', { test: { expect: true } }),
txt('c1-6', 'c1', W + C`
int total = 10;
total += 4;
total *= 2;
total -= total / 4;
total %= 9;
cout << total;`,
  '3',
  'Track total after each line. total / 4 is integer division.',
  '10 + 4 = 14. 14 · 2 = 28. 28 / 4 = 7, so total becomes 28 − 7 = 21. 21 % 9 = 3.'),
mc('c1-7', 'c1', 'A program computes ' + K`double avg = (90 + 85 + 82) / 3;` + ' and gets 85 instead of 85.667. Which change fixes it?',
  [K`double avg = (double)((90 + 85 + 82) / 3);`, K`double avg = (90 + 85 + 82) / 3.0;`, K`int avg = (90 + 85 + 82) / 3;`, K`double avg = (90 + 85 + 82) / (int)3.0;`], 1,
  'Make one operand a double before dividing. Dividing by 3.0 forces real division: 257 / 3.0 = 85.667. Casting after the division is too late, because 257 / 3 has already been truncated to 85.'),
txt('c1-8', 'c1', W + C`
string w = "robot";
cout << w.length() << w[0] << w[w.length() - 1];`,
  '5rt',
  'Indexes start at 0, so the last character is at length() − 1.',
  'w.length() is 5. w[0] is r. w[4] is t. Nothing separates them, so the output is 5rt.'),
mc('c1-9', 'c1', 'With ' + K`#include <cmath>` + ', what does this print?' + C`
cout << pow(2, 3) + sqrt(16.0) + fabs(-1.5);`,
  [K`13.5`, K`10.5`, K`11.5`, K`14`], 0,
  'pow(2, 3) = 8, sqrt(16.0) = 4 and fabs(−1.5) = 1.5. The sum is 13.5.', { test: { expect: true, inc: 'cmath' } }),
mc('c1-10', 'c1', 'What happens with this code?' + C`
const int GROUP = 4;
GROUP = GROUP + 1;
cout << GROUP;`,
  ['It prints 5', 'It prints 4', 'It does not compile', 'It crashes when it runs'], 2,
  'A const variable cannot be assigned after it is initialized, so the compiler rejects the second line. Use const for values like WHEEL_RADIUS that must never change.', { test: { err: true } }),
txt('c1-11', 'c1', W + C`
int m = 125;
int hours = m / 60;
int mins = m % 60;
cout << hours << ":" << mins / 10 << mins % 10;`,
  '2:05',
  '% 60 gives the leftover minutes. Then split the minutes into tens and ones.',
  '125 / 60 = 2 and 125 % 60 = 5. Then 5 / 10 = 0 and 5 % 10 = 5, so the minutes print as 05. Output: 2:05.'),

/* ---------- Decisions ---------- */
txt('c2-1', 'c2', W + C`
int a = 5, y = 10;
if (a = 0)
{
    y = 6;
}
cout << a << " " << y;`,
  '0 10',
  'Look closely: = assigns, == compares.',
  'a = 0 stores 0 in a, and the condition takes the value 0, which is false. So y stays 10, but a has been changed to 0. This is the Vevox trap: with if (a = 4) the condition would be true.'),
mc('c2-2', 'c2', 'What does this print?' + C`
int a = 4, b = 7, c = 2;
bool r = !(a > b) && (c < a || b < c);
cout << r;`,
  [K`1`, K`0`, K`true`, 'It does not compile'], 0,
  'a > b is false, so !(a > b) is true. c < a is true, so the || is true. true && true is true, and cout prints a bool as 1 (not the word true).', { test: { expect: true } }),
txt('c2-3', 'c2', W + C`
int x = 5;
if (x > 10)
    if (x > 20)
        cout << "A";
    else
        cout << "B";
cout << "C";`,
  'C',
  'An else always attaches to the nearest unmatched if, no matter how it is indented.',
  'The else belongs to if (x > 20), not to if (x > 10). Since x > 10 is false, the whole inner if/else is skipped. Only C prints. Use braces to avoid this.'),
txt('c2-4', 'c2', W + C`
int score = 85;
if (score >= 50)
    cout << "pass ";
else if (score >= 80)
    cout << "honours ";
if (score >= 80)
    cout << "A";
else
    cout << "B";`,
  'pass A',
  'In an else-if chain only the first true branch runs. The second if is a separate statement.',
  '85 >= 50 is true, so pass prints and the else-if is skipped, even though it is also true. That is why the bigger threshold should be checked first. The second if/else is independent: 85 >= 80, so A prints.'),
mc('c2-5', 'c2', 'Which condition is true exactly when x is between 1 and 10, inclusive?',
  [K`1 <= x <= 10`, K`x >= 1 && x <= 10`, K`x >= 1 || x <= 10`, K`!(x < 1 && x > 10)`], 1,
  '1 <= x <= 10 compiles but means (1 <= x) <= 10, and a bool (0 or 1) is always <= 10. The || version is true for every x. x < 1 && x > 10 can never be true, so its negation is always true.'),
txt('c2-6', 'c2', W + C`
int a = 0, b = 5;
if (a != 0 && b / a > 1)
    cout << "big";
else
    cout << "safe";
cout << " " << b;`,
  'safe 5',
  '&& stops as soon as the left side is false.',
  'a != 0 is false, so && short-circuits and b / a is never evaluated. No division by zero happens. The else branch prints safe, then " 5".'),
txt('c2-7', 'c2', W + C`
int k = 2;
bool t = (k > 5) && (++k > 2);
bool u = (k > 1) || (++k > 2);
cout << k << t << u;`,
  '201',
  'Short-circuiting means the right side might never run. Does k ever change?',
  'k > 5 is false, so && skips ++k and t is false (0). k > 1 is true, so || skips ++k and u is true (1). k is still 2. Output: 201.'),
order('c2-8', 'c2', 'The inventory charge is $20 per item for the first 5 items, $10 per item for items 6 to 10, and $5 per item after that. Build the code that sets charge from items. Some tiles are decoys.',
  ['double charge = 0;',
   'if (items <= 5)',
   '    charge = 20 * items;',
   'else if (items <= 10)',
   '    charge = 100 + 10 * (items - 5);',
   'else',
   '    charge = 150 + 5 * (items - 10);'],
  ['    charge = 20 * items + 10 * (items - 5);', 'else if (items >= 10)'],
  'The first 5 items always cost 5 · $20 = $100, and items 6 to 10 add 5 · $10 = $50 more. So past 10 items the base is $150. Check the smallest range first so each else-if only sees larger values.',
  { code: true, label: 'Your code, top to bottom', test: { pre: 'int items = 7;' } }),
num('c2-9', 'c2', 'SmoothMove charges $20 plus $0.25 per km for travel. Inventory is $20 per item for the first 5 items, then $10 per item up to 10. Saturday moves add 10% to the sum. What does a Saturday move of 40 km with 7 items cost, in dollars?', '165',
  'Travel first, then inventory, then the Saturday increase on the total.',
  'Travel: 20 + 0.25 · 40 = 30. Inventory: 5 · 20 + 2 · 10 = 120. Sum 150, plus 10% gives 150 · 1.1 = 165.', null, null, { tol: 0.001 }),
mc('c2-10', 'c2', 'Every 3rd customer who spends more than $100 gets 5% off. Costs arrive in order in a loop. Which body is correct?',
  [K`if (cost > 100) { big++; if (big % 3 == 0) cost *= 0.95; }`,
   K`if (cost > 100 && c % 3 == 0) cost *= 0.95;`,
   K`big++; if (cost > 100 && big % 3 == 0) cost *= 0.95;`,
   K`if (cost > 100) big++; if (big % 3 == 0) cost *= 0.95;`], 0,
  'Only customers over $100 should be counted, and only they can win. Testing c % 3 uses the customer number, not the count of big spenders. Putting big++ first counts everyone. Closing the first if before the % test lets a cheap customer win whenever big happens to sit on a multiple of 3. With costs $50, $120, $160, $110, $200, $170, $180, the correct body picks customers 4 and 7, like the exam example.'),
mc('c2-11', 'c2', 'What does this print?' + C`
int n = 7;
if (n % 2 == 0)
    cout << "even";
    cout << "!";`,
  [K`odd`, K`!`, 'Nothing', K`even!`], 1,
  'Without braces the if controls only the next statement. The indented cout << "!" always runs. 7 % 2 is 1, so even is skipped and only ! prints.', { test: { expect: true } }),

/* ---------- Loops and file reading ---------- */
txt('c3-1', 'c3', W + C`
int i = 1;
for ( ; i <= 3; i++)
{
    cout << i;
}
cout << i;`,
  '1234',
  'i was declared before the loop, so it still exists after the loop ends.',
  'The loop prints 1, 2 and 3. It stops when i becomes 4, and the last cout prints that 4.'),
mc('c3-2', 'c3', 'What happens?' + C`
for (int i = 0; i <= 2; i++)
{
    cout << i;
}
cout << i;`,
  ['It prints 0123 and ends', 'It prints 012 and ends', 'It prints 0122 and ends', 'It does not compile'], 3,
  'A variable declared in the for header only exists inside the loop. The last cout uses i out of scope, so the compiler rejects it.', { test: { err: true } }),
mc('c3-3', 'c3', 'What does this loop print?' + C`
for (int i = 1; i = 0; i++)
{
    cout << i;
}`,
  ['Nothing', '1 forever', 'Just 1', 'It does not compile'], 0,
  'The condition i = 0 assigns 0 and evaluates to 0, which is false. The body never runs. It compiles (with a warning at most).', { test: { out: '' } }),
mc('c3-4', 'c3', 'What does this print?' + C`
int i = 4;
while (i = 5)
{
    cout << i << endl;
    i++;
}`,
  ['4, then the loop stops', '4 and 5, then the loop stops', '5 on every line, forever', 'Nothing: the loop never runs'], 2,
  'i = 5 assigns 5 every time the condition is checked, and 5 is true. So i++ is undone each pass and the loop prints 5 forever.'),
txt('c3-5', 'c3', W + C`
int i = 3;
while (int x = --i)
{
    cout << x << " ";
}`,
  '2 1',
  '--i changes i first and then gives the new value. The loop stops when x is 0.',
  'First pass: i becomes 2, x = 2. Then i = 1, x = 1. Then i = 0, x = 0, which is false. Output: 2 1. With i-- instead you would get 3 2 1.'),
txt('c3-6', 'c3', W + C`
for (int r = 1; r <= 3; r++)
{
    for (int c = 1; c <= r; c++)
        cout << c;
    cout << " ";
}`,
  '1 12 123',
  'The inner loop runs r times on row r.',
  'Row 1 prints 1, row 2 prints 12, row 3 prints 123, with a space after each.'),
txt('c3-7', 'c3', W + C`
int n = 10;
do
{
    cout << n << " ";
    n -= 4;
} while (n > 5);
cout << n;`,
  '10 6 2',
  'A do-while checks its condition after the body.',
  'Prints 10, n = 6. 6 > 5, so it prints 6, n = 2. 2 > 5 is false, the loop ends, and the last cout prints 2.'),
num('c3-8', 'c3', 'What value of s does this compute?' + C`
int s = 0;
for (int k = 1; k <= 10; k += 3)
    s += k * k;`, '166',
  'List the values k takes before it passes 10.',
  'k = 1, 4, 7, 10. s = 1 + 16 + 49 + 100 = 166.', null, null, { test: { print: 's' } }),
num('c3-9', 'c3', 'How many times does ' + K`for (int i = 10; i > 0; i -= 3)` + ' run its body?', '4',
  'Write out each value of i.',
  'i = 10, 7, 4, 1 all pass the test. Then i = −2 fails. That is 4 passes.'),
txt('c3-10', 'c3', 'numbers.txt contains ' + K`1 2 3 4 5` + '. ' + P + C`
int main()
{
    ifstream fin;
    fin.open("numbers.txt");
    int num = 0;
    while (fin)
    {
        fin >> num;
        cout << num;
    }
    fin.close();
    return 0;
}`,
  '123455',
  'The stream only fails after a read fails. What does num hold when that read fails?',
  'After 5 is read the stream is still good, so the loop runs once more. That read hits the end of the file and fails, num keeps 5, and 5 prints a second time. Write while (fin >> num) to avoid this.', { test: { file: '1 2 3 4 5', inc: 'fstream' } }),
mc('c3-11', 'c3', 'A file holds an unknown number of integers. Which loop prints each one exactly once?',
  [K`while (fin) { fin >> num; cout << num; }`, K`while (fin >> num) { cout << num; }`, K`while (!fin.fail()) { cout << num; fin >> num; }`, K`for (int i = 0; i < 5; i++) { fin >> num; cout << num; }`], 1,
  'fin >> num reads and then tests the stream in one step, so the body only runs after a successful read. while (fin) checks before reading, so it prints the last value twice. The fail() version prints the starting value of num before reading anything. The for loop assumes the count is known.'),
order('c3-12', 'c3', 'data.txt holds an unknown number of readings, each greater than 0. Build a program part that prints their average and maximum. Some tiles are decoys.',
  ['ifstream fin("data.txt");',
   'double val = 0, sum = 0, maxVal = 0;\nint count = 0;',
   'while (fin >> val)',
   '{',
   '    sum += val;\n    count++;',
   '    if (val > maxVal)\n        maxVal = val;',
   '}',
   'cout << sum / count << " " << maxVal << endl;',
   'fin.close();'],
  ['while (!fin.eof())', '    maxVal = val;'],
  'Read inside the condition. Inside the loop, add to the running sum and count, and update the max. Print only after the loop ends.',
  { code: true, label: 'Your program, top to bottom', alt: [[0, 1, 2, 3, 5, 4, 6, 7, 8]] }),
txt('c3-13', 'c3', W + C`
int count = 0;
for (int a = 1; a <= 4; a++)
    for (int b = a; b <= 4; b++)
        count++;
cout << count;`,
  '10',
  'Count the inner passes for each a.',
  'For a = 1, b runs 4 times. Then 3, 2 and 1 times. 4 + 3 + 2 + 1 = 10.'),
txt('c3-14', 'c3', W + C`
int x = 1;
while (x < 50)
    x *= 3;
cout << x;`,
  '81',
  'The loop keeps multiplying until the condition fails.',
  'x goes 1, 3, 9, 27, 81. When x is 81 the test x < 50 fails, so 81 prints.'),

/* ---------- Functions ---------- */
txt('c4-1', 'c4', P + C`
int bump(int number)
{
    int num = 5;
    number += 1;
    num = num * 2;
    return number;
}
int main()
{
    int num = 7;
    cout << bump(num) << " " << num;
    return 0;
}`,
  '8 7',
  'bump gets a copy, and its num is a different variable from main\'s num.',
  'number is a copy of 7, so bump returns 8. The local num inside bump never affects main. main\'s num is still 7.'),
txt('c4-2', 'c4', P + C`
void updateFunction(int &a, int b)
{
    a = a + 1;
    b = b + 1;
}
int main()
{
    int x = 3, y = 9;
    updateFunction(x, y);
    cout << x << y;
    return 0;
}`,
  '49',
  'Which parameter is a reference?',
  'a is a reference to x, so x becomes 4. b is a copy of y, so y stays 9. They print with no space: 49.'),
txt('c4-3', 'c4', P + C`
int addNumbers(int &x, int &y)
{
    int sumNum = x + y;
    x = x + 1;
    y = y + 1;
    return sumNum;
    sumNum = x + y;
    return sumNum;
}
int main()
{
    int x = 3, y = 10;
    int sum = addNumbers(x, y);
    cout << sum << " " << x << " " << y;
    return 0;
}`,
  '13 4 11',
  'A function stops at the first return it reaches.',
  'sumNum = 13 is computed before the increments. x and y are references, so main\'s x and y become 4 and 11. The first return sends back 13 and the last two lines never run.'),
mc('c4-4', 'c4', 'What happens?' + C`
void swapNumbers(int &a, int &b)
{
    int temp = a;
    a = b;
    b = temp;
}
int main()
{
    int a = 3, b = 4;
    swapNumbers(3, 4);
    cout << a << b;
}`,
  ['It prints 34', 'It prints 43', 'It does not compile', 'It crashes when it runs'], 2,
  'A reference parameter must refer to a variable. The literals 3 and 4 are not variables, so they cannot bind to int &. The compiler rejects the call.', { test: { err: true } }),
mc('c4-5', 'c4', 'What does this print?' + C`
void swapNumbers(int &a, int &b)
{
    int temp = a; a = b; b = temp;
}
void swapNumbers(float &a, float &b)
{
    float temp = a; a = b; b = temp;
}
int main()
{
    int a = 3.5, b = 4.1;
    swapNumbers(a, b);
    cout << a << "," << b;
}`,
  [K`4,3`, K`4.1,3.5`, K`3,4`, 'It does not compile, the call is ambiguous'], 0,
  'a and b are ints, so they hold 3 and 4 (truncated). The int & version of the overloaded function is an exact match, so it is chosen and swaps them: 4,3.', { test: { expect: true } }),
txt('c4-6', 'c4', P + C`
int incrementNum(int &x)
{
    x = x + 1;
    return x;
}
int incrementNum2(int x)
{
    x = x + 2;
    return x;
}
int main()
{
    int x = 10;
    int number = incrementNum(x);
    cout << incrementNum2(incrementNum(x)) << endl;
    cout << x << " " << number;
    return 0;
}`,
  '14 12 11',
  'Which calls change main\'s x? A line break counts as a space in your answer.',
  'The first call makes x = 11 and number = 11. In the second line, incrementNum(x) makes x = 12 and returns 12. incrementNum2 adds 2 to its copy and returns 14. Then x is 12 and number is still 11.'),
txt('c4-7', 'c4', P + C`
int addSubtract(int a, int &b)
{
    a += 3;
    b -= 1;
    return a * 2;
}
int main()
{
    int w = 0, x = 4, y = 1;
    w = addSubtract(addSubtract(y, x), x) + y;
    cout << w << " and " << x << " and " << y << endl;
    return 0;
}`,
  '23 and 2 and 1',
  'The inner call finishes first. Its return value becomes a for the outer call. Only b is a reference.',
  'Inner: a = 1 + 3 = 4, x becomes 3, returns 8. Outer: a = 8 + 3 = 11, x becomes 2, returns 22. w = 22 + y = 23. y was only ever copied, so it is still 1.'),
mc('c4-8', 'c4', 'You need a function that takes "arriving" or "departing" and a mass in kg, and returns the change in force. Which header is correct?',
  [K`void forceChange(string dir, double mass)`, K`double forceChange(string dir, double mass)`, K`double forceChange(dir, mass)`, K`double forceChange(string dir; double mass)`], 1,
  'It returns a number, so the return type cannot be void. Every parameter needs a type, and parameters are separated by commas.'),
order('c4-9', 'c4', 'Build forceChange: return mass · 10 for an arriving ship and −mass · 10 for a departing one (a = 10 m/s²). Some tiles are decoys.',
  ['double forceChange(string dir, double mass)',
   '{',
   '    const double ACCEL = 10;',
   '    if (dir == "arriving")',
   '        return mass * ACCEL;',
   '    return -mass * ACCEL;',
   '}'],
  ['    else (dir == "departing")', '    cout << mass * ACCEL;'],
  'ΔF = (Δm)a, with Δm positive for arriving. Once the arriving branch returns, anything after the if only runs for departing ships. A function should return its result, not print it.',
  { code: true, label: 'Your function, top to bottom' }),
mc('c4-10', 'c4', 'main calls numInc(num), but numInc is defined below main. Without anything else, the compiler says numInc was not declared. What is the usual fix?',
  ['Put int numInc(int number); above main', 'Add #include "numInc" at the top', 'Call it as main.numInc(num) instead', 'Change numInc to return void instead'], 0,
  'A function prototype tells the compiler the function\'s name, return type and parameter types before main uses it. The full definition can then stay below main.'),
txt('c4-11', 'c4', P + C`
void order(int &lo, int &hi)
{
    if (lo > hi)
    {
        int t = lo;
        lo = hi;
        hi = t;
    }
}
int main()
{
    int a = 9, b = 4, c = 6;
    order(a, b);
    order(b, c);
    order(a, b);
    cout << a << b << c;
    return 0;
}`,
  '469',
  'Trace a, b and c after each call.',
  'order(a, b): 9 > 4, swap, so a = 4, b = 9. order(b, c): 9 > 6, swap, so b = 6, c = 9. order(a, b): 4 > 6 is false, no change. Output: 469.'),
txt('c4-12', 'c4', P + C`
int twice(int n)
{
    return n * 2;
}
int main()
{
    int v = 1;
    for (int i = 0; i < 3; i++)
        v = twice(v) + i;
    cout << v;
    return 0;
}`,
  '12',
  'Update v once per pass: v = 2v + i.',
  'i = 0: v = 2 + 0 = 2. i = 1: v = 4 + 1 = 5. i = 2: v = 10 + 2 = 12.'),

/* ---------- added: practice sets (if-else, decisions, loops and files, nested loops) ---------- */
mc('c1-12', 'c1', 'What does this print?' + C`
int x = 7 / 2 * 2.0;
cout << x;`,
  [K`7`, K`6`, K`7.0`, K`6.0`], 1,
  '7 / 2 is integer division, 3. Then 3 * 2.0 = 6.0, and storing 6.0 in an int gives 6. The order matters: 7 * 2.0 / 2 would give 7.', { test: { expect: true } }),
txt('c1-13', 'c1', W + C`
int val1 = 7, val2 = 2;
cout << val1 + val2 << " " << val1 - val2 << " " << val1 * val2 << " ";
cout << val1 / val2 << " " << (double)val1 / val2;`,
  '9 5 14 3 3.5',
  'Only the last value has a double in the division.',
  'Sum 9, difference 5, product 14. val1 / val2 is int division, 3. The cast makes the ratio 7.0 / 2 = 3.5. This is the val1/val2 question from the if-else practice set: report the ratio as a double.'),
mc('c1-14', 'c1', 'What does this print?' + C`
char c = 'a';
c = c + 2;
cout << c;`,
  [K`c`, K`99`, K`a2`, 'It does not compile'], 0,
  'A char is stored as a small integer code. Adding 2 moves two letters along, and because c is still a char, cout prints it as a letter: c.', { test: { expect: true } }),
mc('c1-15', 'c1', 'a, b and c are ints. Which expression gives their average as a double, with no rounding?',
  [K`(a + b + c) / 3`, K`(a + b + c) / 3.0`, K`(double)((a + b + c) / 3)`, K`a + b + c / 3.0`], 1,
  'Dividing by 3.0 makes the division real. (a + b + c) / 3 and the version cast afterwards both divide two ints first, so the fraction is lost before any conversion. a + b + c / 3.0 only divides c by 3.'),
txt('c1-16', 'c1', W + C`
double subtotal = 1 + 3 + 3;
double total = subtotal * 1.13;
cout << "$" << total;`,
  '$7.91',
  'cout shows up to 6 significant digits by default.',
  'subtotal = 7, and 7 × 1.13 = 7.91. Inside the computer this is 7.9099999…, but cout rounds to 6 significant digits, so it prints 7.91.'),

mc('c2-12', 'c2', 'Pool care: chlorine is added when the pool was cleaned 4 or more days ago, or when it is cloudy and was cleaned 2 or more days ago. Which condition is true exactly in those cases?',
  ['days >= 4 || (cloudy == 1 && days >= 2)', 'days >= 4 && (cloudy == 1 || days >= 2)', 'cloudy == 1 || days >= 4', 'days >= 2 || (cloudy == 1 && days >= 4)'], 0,
  'Read the table row by row. Not cloudy: chlorine only for 4 or more days. Cloudy: chlorine for 2 or more days. Combining them gives days ≥ 4 OR (cloudy AND days ≥ 2). cloudy == 1 || days >= 4 wrongly adds chlorine to a cloudy pool cleaned yesterday.'),
txt('c2-13', 'c2', 'This is a minimal-decision answer to the pool care question. ' + W + C`
int cloudy = 0, days = 3;
double temp = 25.0;
bool chlorine = false;
cout << "Skim" << endl;
if (days >= 4 || (cloudy == 1 && days >= 2))
{
    cout << "Add chlorine" << endl;
    chlorine = true;
}
else if (days >= 2)
    cout << "Vacuum" << endl;
if (!chlorine && temp <= 26.5)
    cout << "Turn on heater" << endl;`,
  'Skim Vacuum Turn on heater',
  'Not cloudy and 3 days: check the middle column of the table.',
  'Skim always prints. days ≥ 4 is false and the pool is not cloudy, so no chlorine. days ≥ 2 is true, so Vacuum. Chlorine was not added and 25.0 ≤ 26.5, so the heater goes on.'),
order('c2-14', 'c2', 'Friday food: with 1 or 2 people, order burgers. With 3 or more, order pizza if there is a discount code. With no code, 3 to 5 people get burgers and 6 or more get Chinese. Build the version with the fewest decisions. Some tiles are decoys.',
  ['if (people <= 2)\n    cout << "burgers";',
   'else if (discount == 1)\n    cout << "pizza";',
   'else if (people >= 6)\n    cout << "Chinese";',
   'else\n    cout << "burgers";'],
  ['else if (people >= 3 && people <= 5)\n    cout << "pizza";', 'if (discount == 1)\n    cout << "pizza";'],
  'Handle the column that ignores the code first: 1 or 2 people is always burgers. After that, any discount means pizza. With no code left, only the size matters: 6 or more is Chinese, otherwise burgers. Three decisions cover all six cells.',
  { code: true, label: 'Your code, top to bottom', test: { pre: 'int people = 4, discount = 0;' } }),
txt('c2-15', 'c2', 'Carol picks transport by country, distance and trip length. ' + W + C`
string country = "US";
double dist = 600;
int days = 20;
double rate = dist / days;
if ((country != "CAN" && country != "US") || dist > 2000 || rate > 750)
    cout << "Choose fly";
else if (rate >= 40)
    cout << "Choose drive";
else if (country == "CAN")
    cout << "Choose bike";
else
    cout << "Choose drive";`,
  'Choose drive',
  'Work out rate first, then go down the chain.',
  'rate = 600 / 20 = 30 km/day. The fly test is false. 30 ≥ 40 is false. The country is not CAN, so the last else runs: under 40 km/day in the US means drive.'),
mc('c2-16', 'c2', 'In the transport program, Carol stores the trip as ' + K`int dist = 1501, days = 2;` + ' and computes ' + K`double rate = dist / days;` + ' The trip is in the US. What happens?',
  ['It prints Choose drive, but the rule says fly', 'It prints Choose fly, which is right', 'It does not compile, because an int is stored in a double', 'It prints Choose bike'], 0,
  'dist / days is int division: 1501 / 2 = 750, not 750.5. The test rate > 750 is then false, so the program says drive even though the real rate is over 750 km/day. Write dist / (double)days, or store dist as a double.'),
mc('c2-17', 'c2', 'After a ride under 15 km Carol gets no ice cream. Otherwise she gets chocolate on Saturday, raspberry after more than 30 km, and strawberry for anything else. For which input does this code print Raspberry?' + C`
if (km < 15)
    cout << "No ice cream";
else if (day == "Saturday")
    cout << "Chocolate";
else if (km > 30)
    cout << "Raspberry";
else
    cout << "Strawberry";`,
  ['35 km on Saturday', '35 km on Sunday', '30 km on Monday', '12 km on Friday'], 1,
  'Saturday is tested before distance, so 35 km on Saturday gives Chocolate. 30 is not more than 30, so Monday gives Strawberry. 12 km is under 15, so no ice cream. Only 35 km on Sunday reaches the Raspberry line.'),
multi('c2-18', 'c2', 'Florida park points per day: ages 0 to 2 pay 40. Ages 3 to 9 pay 100. Ages 10 and up pay 100 to visit 1 park a day, or 140 to visit more. Trips longer than 4 days get 25% off, except for ages 0 to 2. Find the total points.', [
  { ask: 'An 8-year-old on a 6-day trip, 1 park a day.', ans: '450', hint: 'Points per day × days, then the discount.', why: '100 × 6 = 600. The trip is more than 4 days, so 600 × 0.75 = 450.' },
  { ask: 'A 30-year-old on a 5-day trip with 7 park visits in total.', ans: '525', hint: '7 visits in 5 days means at least one day had more than one park.', why: 'More than one park on some day, so 140 per day. 140 × 5 = 700, and 700 × 0.75 = 525.' },
  { ask: 'A 2-year-old on a 5-day trip.', ans: '200', hint: 'Check the discount column for this age.', why: '40 × 5 = 200, and ages 0 to 2 get 0% off.' }
]),
txt('c2-19', 'c2', W + C`
double a = 2.5, b = 4;
char op = '*';
if (op == '+')
    cout << "The sum of " << a << " and " << b << " is " << a + b;
else if (op == '-')
    cout << "The difference of " << a << " and " << b << " is " << a - b;
else if (op == '*')
    cout << "The product of " << a << " and " << b << " is " << a * b;
else if (op == '/' && b != 0)
    cout << "The quotient of " << a << " and " << b << " is " << a / b;
else
    cout << "Bad input";`,
  'The product of 2.5 and 4 is 10',
  'cout prints a whole-number double with no decimal point.',
  'op is \'*\', so the third branch runs. b prints as 4 and 2.5 × 4 = 10.0 prints as 10.'),
txt('c2-20', 'c2', 'Three words in ascending order, from the if-else practice set. ' + W + C`
string a = "tom", b = "bugs", c = "daffy", t;
if (a > b) { t = a; a = b; b = t; }
if (b > c) { t = b; b = c; c = t; }
if (a > b) { t = a; a = b; b = t; }
cout << a << ", " << b << ", " << c;`,
  'bugs, daffy, tom',
  'Strings compare alphabetically. Track a, b and c after each swap.',
  '"tom" > "bugs", so swap: a = bugs, b = tom. "tom" > "daffy", so swap: b = daffy, c = tom. "bugs" > "daffy" is false. Three compare-and-swaps always sort three values.'),

mc('c3-15', 'c3', 'A user gets at most 5 tries at a password, and you may not use break. tries starts at 0 and the loop body reads a guess and adds 1 to tries. Which loop header is right?',
  [K`while (tries < 5 && guess != PASSWORD)`, K`while (tries < 5 || guess != PASSWORD)`, K`while (tries <= 5 && guess != PASSWORD)`, K`for (int tries = 0; tries < 5; tries++)`], 0,
  'Keep going only while both are true: tries are left AND the guess is still wrong. With || a wrong guess keeps the loop alive forever. <= 5 allows a sixth try. The for loop cannot stop early on a right guess without break.'),
order('c3-16', 'c3', 'Build the password program: up to 5 tries, no break. Show the balance on a correct guess, otherwise lock the account. Some tiles are decoys.',
  ['string guess = "";\nint tries = 0;',
   'while (tries < 5 && guess != PASSWORD)',
   '{\n    cin >> guess;\n    tries++;\n}',
   'if (guess == PASSWORD)\n    cout << "Balance: $" << balance;',
   'else\n    cout << "Account locked";'],
  ['if (tries < 5)\n    cout << "Balance: $" << balance;', '{\n    cin >> guess;\n    if (guess == PASSWORD) break;\n}'],
  'After the loop, test the guess, not the count. Someone who gets it right on the 5th try leaves the loop with tries == 5, so if (tries < 5) would wrongly lock them out.',
  { code: true, label: 'Your code, top to bottom', test: { pre: 'const string PASSWORD = "pw"; double balance = 10;' } }),
txt('c3-17', 'c3', 'All primes up to 20. ' + W + C`
for (int n = 2; n <= 20; n++)
{
    bool prime = true;
    for (int d = 2; d * d <= n; d++)
        if (n % d == 0)
            prime = false;
    if (prime)
        cout << n << " ";
}`,
  '2 3 5 7 11 13 17 19',
  'A number is prime if no d from 2 up to √n divides it.',
  'Testing divisors only up to √n is enough: if n = a × b, one of a or b is at most √n. For 2 and 3 the inner loop never runs, so they stay prime.'),
mc('c3-18', 'c3', 'This version starts at n = 1. Why does 1 appear in the output?' + C`
for (int n = 1; n <= 20; n++)
{
    bool prime = true;
    for (int d = 2; d * d <= n; d++)
        if (n % d == 0)
            prime = false;
    if (prime)
        cout << n << " ";
}`,
  ['For n = 1 the inner loop never runs, so prime stays true', '1 % 2 is 1, and a nonzero remainder is read as prime', 'The outer loop runs 21 times, so 1 is tested twice', 'prime is set once before the loop and never reset to true'], 0,
  'With n = 1 the inner loop does not run at all, so nothing sets prime to false. 1 is not prime by definition, so start at 2 or add if (n < 2) prime = false.'),
txt('c3-19', 'c3', 'The first 6 primes. ' + W + C`
int found = 0, n = 2;
while (found < 6)
{
    bool prime = true;
    for (int d = 2; d * d <= n; d++)
        if (n % d == 0)
            prime = false;
    if (prime)
    {
        cout << n << " ";
        found++;
    }
    n++;
}`,
  '2 3 5 7 11 13',
  'You do not know in advance how many numbers to test, so the loop counts primes found.',
  'The while loop runs until 6 primes are found: 2, 3, 5, 7, 11, 13. This is "first n primes" from the loops practice set, as opposed to "all primes up to max", which is a counted for loop.'),
txt('c3-20', 'c3', 'The chess rice problem: 1 grain on square 1, 2 on square 2, 4 on square 3, doubling each time. ' + W + C`
int squares = 0;
long long onSquare = 1, total = 0;
while (total < 1000)
{
    total += onSquare;
    onSquare *= 2;
    squares++;
}
cout << squares << " " << total;`,
  '10 1023',
  'After k squares the total is 2^k − 1.',
  'Totals: 1, 3, 7, 15, …, 511 after 9 squares (still under 1000), then 1023 after 10. Stop: 10 squares, 1023 grains.'),
mc('c3-21', 'c3', 'The rice program is rewritten with ' + K`int total, onSquare` + ' and a target of 1,000,000,000,000 grains. What goes wrong?',
  ['An int holds at most about 2.1 billion, so the total overflows', 'Nothing: it prints 40, the number of squares needed', 'It does not compile, because the number has too many digits', 'The loop runs zero times, because the target is too large'], 0,
  'A 32-bit int tops out at 2,147,483,647. The total passes that around square 31 and overflows, so it never reaches 10^12. This is why the textbook asks you to "check what happens". Use long long, which goes up to about 9.2 × 10^18.'),
txt('c3-22', 'c3', 'Restaurant inventory: fries (dish 1) cost $1, hummus (2) $2, cake (3) $3, and tax is 13%. Stock is 2 of each here, to keep the trace short. numbers.txt holds the orders ' + K`1 3 7 3 2 1` + '. ' + W + C`
ifstream fin("numbers.txt");
int fries = 2, hummus = 2, cake = 2, dish;
double sales = 0;
while (fries > 0 && hummus > 0 && cake > 0 && fin >> dish)
{
    if (dish == 1) { fries--; sales += 1; }
    else if (dish == 2) { hummus--; sales += 2; }
    else if (dish == 3) { cake--; sales += 3; }
}
cout << sales * 1.13;
fin.close();`,
  '7.91',
  'Bad input (7) is ignored. The doors close when any dish runs out.',
  'Order 1: fries 1, $1. Order 3: cake 1, $4. Order 7: ignored. Order 3: cake 0, $7. Now cake is 0, so the loop condition is false before reading again. 7 × 1.13 = 7.91.', { test: { file: '1 3 7 3 2 1' } }),
txt('c3-23', 'c3', 'Each record is two lines: a count, then that many integers. numbers.txt holds:' + C`
4
5 1 7 2
1
9
3
10 20 30` + W + C`
ifstream fin("numbers.txt");
int count;
while (fin >> count)
{
    int sum = 0, v;
    for (int i = 0; i < count; i++)
    {
        fin >> v;
        sum += v;
    }
    cout << sum << " ";
}
fin.close();`,
  '15 9 60',
  'The outer loop reads a count; the inner loop reads exactly that many values.',
  'This is the file2.txt pattern: an unknown number of records (while), each with a known count (for). Sums: 5 + 1 + 7 + 2 = 15, then 9, then 60.', { test: { file: '4\n5 1 7 2\n1\n9\n3\n10 20 30\n' } }),
multi('c3-24', 'c3', 'A robot file has one record per line: an angle turned counter-clockwise (degrees), then a distance driven (m). The robot starts at (0, 0) facing the +x axis. The file is:<br>' + K`90 2` + '<br>' + K`90 3` + '<br>' + K`270 5`, [
  { ask: 'What is the total distance travelled, in m?', ans: '10', hint: 'Add the second number on each line.', why: '2 + 3 + 5 = 10 m. Turning does not add distance.' },
  { ask: 'What are the final coordinates (x, y)?', ans: '(-3,7)', labels: ['x', 'y'], hint: 'The angles add up. Keep a running heading.', why: 'Heading 90°: move up 2 to (0, 2). Heading 180°: move left 3 to (−3, 2). Heading 450°, the same as 90°: move up 5 to (−3, 7).' },
  { ask: 'Which way is it facing at the end, in degrees from the +x axis (0 to 360)?', ans: '90', hint: 'Add all the turns and reduce mod 360.', why: '90 + 90 + 270 = 450, and 450 − 360 = 90°.' }
]),
mc('c3-25', 'c3', 'In the robot file program, angle and dist are read from each line, and heading, x and y start at 0. Which loop body tracks the position correctly?',
  [K`heading += angle; x += dist * cos(heading * PI / 180); y += dist * sin(heading * PI / 180);`,
   K`x += dist * cos(angle * PI / 180); y += dist * sin(angle * PI / 180);`,
   K`heading += angle; x += dist * cos(heading); y += dist * sin(heading);`,
   K`heading += angle; x += dist * sin(heading * PI / 180); y += dist * cos(heading * PI / 180);`], 0,
  'Each angle is a turn relative to where the robot already points, so it must be added to a running heading. cos and sin take radians, so convert with PI / 180. x goes with cos and y with sin when the angle is measured from the +x axis.'),
txt('c3-26', 'c3', 'Humidity readings, where −1 marks an invalid reading. numbers.txt holds ' + K`35.8 42.1 -1 39.7 -1 34.9 40.2` + '. ' + W + C`
ifstream fin("numbers.txt");
double r, low = 101;
while (fin >> r)
{
    if (r != -1 && r < low)
        low = r;
}
cout << low;
fin.close();`,
  '34.9',
  'Skip the −1 values. Humidity is at most 100, so 101 is a safe starting value.',
  'The valid readings are 35.8, 42.1, 39.7, 34.9 and 40.2. The lowest is 34.9.', { test: { file: '35.8 42.1 -1 39.7 -1 34.9 40.2' } }),
mc('c3-27', 'c3', 'A classmate writes the humidity program like this, and it prints −1. Why?' + C`
double r, low = 101;
while (fin >> r)
{
    if (r < low)
        low = r;
}
cout << low;`,
  ['It never skips the −1 readings, and −1 is lower than any real one', 'low should start at 0, so the first reading is always lower', 'fin >> r reads the −1 as a 1, because the minus is skipped', 'The loop stops at the first −1, so later readings are lost'], 0,
  'The −1 values are flags, not measurements, but this loop compares them like readings. Add r != −1 to the condition. Starting low at 0 would be worse: nothing is lower than 0, so it would print 0.'),
mc('c3-28', 'c3', 'What does this print?' + C`
double f = 78;
double c = 5 / 9 * (f - 32);
cout << c;`,
  [K`0`, K`25.5556`, K`25`, 'It does not compile'], 0,
  '5 / 9 is int division, which is 0, and 0 times anything is 0. Write 5.0 / 9 * (f − 32), or (f − 32) * 5 / 9 so the double comes first.', { test: { expect: true } }),
txt('c3-29', 'c3', 'Warmest day, converting °F to °C. numbers.txt holds ' + K`78 81 79 83 80` + '. ' + W + C`
ifstream fin("numbers.txt");
double f, best = -1000;
int day = 0, bestDay = 0;
while (fin >> f)
{
    day++;
    double c = (f - 32) * 5 / 9;
    if (c > best)
    {
        best = c;
        bestDay = day;
    }
}
cout << bestDay << " " << best;
fin.close();`,
  '4 28.3333',
  '(f − 32) is a double, so the division is real here.',
  'Day 4 is 83 °F, the warmest. (83 − 32) × 5 / 9 = 255 / 9 = 28.333…, and cout shows 6 significant digits: 28.3333.', { test: { file: '78 81 79 83 80' } }),
txt('c3-30', 'c3', 'Number guessing, with the guesses read from numbers.txt instead of the keyboard. It holds ' + K`4 7 2 5 9` + '. ' + W + C`
ifstream fin("numbers.txt");
int num = 5, guess = 0, count = 0;
do
{
    fin >> guess;
    count++;
} while (guess != num);
cout << "Number of guesses " << count;
fin.close();`,
  'Number of guesses 4',
  'A do-while always runs at least once, which fits: you must guess before you can be right.',
  'Guesses 4, 7, 2, 5. The loop stops after 5, the 4th guess. The 9 is never read.', { test: { file: '4 7 2 5 9' } }),
txt('c3-31', 'c3', 'ION trains. Each line is a direction, then 5 times in minutes after the first train. numbers.txt holds ' + K`1 12 25 37 49 54` + '. ' + W + C`
ifstream fin("numbers.txt");
int dir, t, prev = 0, longest = 0;
fin >> dir;
for (int i = 0; i < 5; i++)
{
    fin >> t;
    if (t - prev > longest)
        longest = t - prev;
    prev = t;
}
cout << longest << " " << prev / 5.0;
fin.close();`,
  '13 10.8',
  'The first train is at time 0, so the first gap is 12.',
  'Gaps: 12, 13, 12, 12, 5. The longest is 13. After the loop prev is 54, and 54 / 5.0 = 10.8 minutes is the average wait.', { test: { file: '1 12 25 37 49 54' } }),
txt('c3-32', 'c3', 'Party planning. Each line is a date, a count, then that many Y or M replies. numbers.txt holds:' + C`
July_1 5 Y Y Y Y Y
July_2 10 Y Y Y M Y Y Y Y M Y
July_7 12 M M Y Y M Y M M M M M M
July_10 11 Y M Y M Y Y M Y Y M Y` + W + C`
ifstream fin("numbers.txt");
string date, best;
int n, most = 0;
while (fin >> date >> n)
{
    int yes = 0;
    char r;
    for (int i = 0; i < n; i++)
    {
        fin >> r;
        if (r == 'Y')
            yes++;
    }
    if (n >= 10 && yes > n / 2.0)
        cout << date << " ";
    if (n > most)
    {
        most = n;
        best = date;
    }
}
cout << best;
fin.close();`,
  'July_2 July_10 July_7',
  'Count the Y replies on each line. A date qualifies with at least 10 replies and more than half Y.',
  'July_1 has only 5 replies. July_2: 8 of 10 are Y, so it prints. July_7: 3 of 12, no. July_10: 7 of 11, more than 5.5, so it prints. The most replies is 12, on July_7.', { test: { file: 'July_1 5 Y Y Y Y Y\nJuly_2 10 Y Y Y M Y Y Y Y M Y\nJuly_7 12 M M Y Y M Y M M M M M M\nJuly_10 11 Y M Y M Y Y M Y Y M Y\n' } }),
txt('c3-33', 'c3', 'Election poll. Each line is a riding, the number of parties, then each party with its January and February percentages. numbers.txt holds:' + C`
Cambridge 3 LIB 20.7 15.6 GRN 8.7 12.9 PC 37.0 38.2
Waterloo 2 NDP 25.5 27.0 PC 30.1 29.4` + W + C`
ifstream fin("numbers.txt");
string riding, party, bestParty;
int k;
double jan, feb;
while (fin >> riding >> k)
{
    double best = -100;
    for (int i = 0; i < k; i++)
    {
        fin >> party >> jan >> feb;
        if (feb - jan > best)
        {
            best = feb - jan;
            bestParty = party;
        }
    }
    cout << riding << " " << bestParty << " " << best << " ";
}
fin.close();`,
  'Cambridge GRN 4.2 Waterloo NDP 1.5',
  'The trend is February minus January. Find the largest in each riding.',
  'Cambridge: LIB −5.1, GRN +4.2, PC +1.2, so GRN 4.2. Waterloo: NDP +1.5, PC −0.7, so NDP 1.5. best resets to −100 for each riding.', { test: { file: 'Cambridge 3 LIB 20.7 15.6 GRN 8.7 12.9 PC 37.0 38.2\nWaterloo 2 NDP 25.5 27.0 PC 30.1 29.4\n' } }),
mc('c3-34', 'c3', 'In the poll program, a classmate starts each riding with ' + K`double best = 0;` + ' What goes wrong for a riding where every party\'s trend is negative?',
  ['No trend beats 0, so the riding keeps the previous winner and 0 is printed', 'It prints the party with the smallest drop, which is what we want', 'It does not compile, because best is redeclared inside the loop', 'The inner loop is skipped, so that riding is never printed'], 0,
  'With best = 0, a trend of −0.7 never counts as larger, so nothing is updated. Start below any possible trend (like −100), or set best from the first party read.'),
mc('c3-35', 'c3', 'You do not know how many integers are in the file. Which loop prints every one of them?',
  [K`while (fin >> x) cout << x << " ";`, K`for (int i = 0; i < 10; i++) { fin >> x; cout << x << " "; }`, K`while (!fin.fail()) { fin >> x; cout << x << " "; }`, K`if (fin >> x) cout << x << " ";`], 0,
  'fin >> x is true while a value was read, so the loop stops exactly at the end. The for loop assumes 10 values. Checking fail() before reading prints the last value a second time. The if reads only one value.'),

txt('c4-13', 'c4', P + C`
int pointsPerDay(int age, bool manyParks)
{
    if (age <= 2)
        return 40;
    if (age >= 10 && manyParks)
        return 140;
    return 100;
}
double tripPoints(int age, bool manyParks, int days)
{
    double total = days * pointsPerDay(age, manyParks);
    if (days > 4 && age > 2)
        total *= 0.75;
    return total;
}
int main()
{
    cout << tripPoints(30, true, 5) << " " << tripPoints(8, false, 4) << " " << tripPoints(1, true, 6);
    return 0;
}`,
  '525 400 240',
  'Work out pointsPerDay first for each call.',
  '30, many parks: 140 × 5 = 700, more than 4 days, so 525. Age 8: 100 × 4 = 400, exactly 4 days so no discount. Age 1: 40 × 6 = 240, and ages 0 to 2 get no discount.'),
txt('c4-14', 'c4', P + C`
void order2(string &x, string &y)
{
    if (x > y)
    {
        string t = x;
        x = y;
        y = t;
    }
}
int main()
{
    string a = "daffy", b = "daffy", c = "bugs";
    order2(a, b);
    order2(b, c);
    order2(a, b);
    cout << a << ", " << b << ", " << c;
    return 0;
}`,
  'bugs, daffy, daffy',
  'The parameters are references, so the swaps change a, b and c.',
  'order2(a, b): equal, no swap. order2(b, c): "daffy" > "bugs", swap, so b = bugs, c = daffy. order2(a, b): "daffy" > "bugs", swap, so a = bugs, b = daffy. It works with repeated words too, as the practice set asks.'),
txt('c4-15', 'c4', P + C`
bool isPrime(int n)
{
    if (n < 2)
        return false;
    for (int d = 2; d * d <= n; d++)
        if (n % d == 0)
            return false;
    return true;
}
int main()
{
    int count = 0;
    for (int i = 1; i <= 30; i++)
        if (isPrime(i))
            count++;
    cout << count;
    return 0;
}`,
  '10',
  'return leaves the function at once, so the first divisor found ends the test.',
  'The primes up to 30 are 2, 3, 5, 7, 11, 13, 17, 19, 23 and 29: ten of them. 1 is handled by the n < 2 check.'),
txt('c4-16', 'c4', P + C`
int average(int a, int b)
{
    return (a + b) / 2.0;
}
int main()
{
    double m = average(3, 4);
    cout << m;
    return 0;
}`,
  '3',
  'Look at the return type.',
  '(3 + 4) / 2.0 is 3.5, but the function returns int, so 3.5 is truncated to 3 on the way out. Storing it in a double afterwards cannot bring the .5 back. Make the return type double.'),
mc('c4-17', 'c4', 'What happens with this code?' + C`
int recordSum(ifstream fin, int count)
{
    int sum = 0, v;
    for (int i = 0; i < count; i++)
    {
        fin >> v;
        sum += v;
    }
    return sum;
}
int main()
{
    ifstream fin("numbers.txt");
    int count;
    fin >> count;
    cout << recordSum(fin, count);
    return 0;
}`,
  ['It does not compile: a file stream cannot be passed by value', 'It compiles and prints the sum of the record correctly', 'It compiles, but fin in main does not move forward', 'It compiles, but it prints 0 because the copy is empty'], 0,
  'Passing by value makes a copy, and file streams cannot be copied, so the compiler rejects it. Pass streams by reference: int recordSum(ifstream &fin, int count).', { test: { err: true } }),
txt('c4-18', 'c4', P + C`
int squaresNeeded(long long target)
{
    long long total = 0, onSquare = 1;
    int squares = 0;
    while (total < target)
    {
        total += onSquare;
        onSquare *= 2;
        squares++;
    }
    return squares;
}
int main()
{
    cout << squaresNeeded(1000) << " " << squaresNeeded(1000000) << " " << squaresNeeded(1000000000);
    return 0;
}`,
  '10 20 30',
  'After k squares the total is 2^k − 1. 2^10 = 1024.',
  '2^10 − 1 = 1023 ≥ 1000, 2^20 − 1 = 1048575 ≥ 10^6, and 2^30 − 1 = 1073741823 ≥ 10^9. Each one fails at one square fewer, so the answers are 10, 20 and 30.'),
mc('c4-19', 'c4', 'A function must convert a temperature from °F to °C and also tell the caller whether it is above 25 °C. Which header fits best?',
  [K`bool toCelsius(double f, double &c)`, K`double toCelsius(double f, bool hot)`, K`void toCelsius(double f, double c)`, K`bool toCelsius(double &f, double c)`], 0,
  'A function returns one value. Return the bool, and send the °C value back through a reference parameter. The other headers either cannot send the °C value back (c is a copy) or change the input instead of the output.'),

/* ---------- VEX IQ: standard configuration, as on the past exam robot questions ---------- */
mc('c5-1', 'c5', 'One wheel turn moves the robot 200 mm. Which expression gives the motor target in degrees to drive dist_m metres?',
  [K`dist_m * 1000 / 200 * 360`, K`dist_m / 200 * 360`, K`dist_m * 1000 * 200 / 360`, K`dist_m * 1000 / (2 * PI * 200) * 360`], 0,
  'Metres to mm (× 1000), mm to turns (÷ 200), turns to degrees (× 360). dist_m / 200 * 360 forgets the mm. The version with 2 * PI treats 200 mm as a radius, but 200 mm is already the distance per turn, so there is no 2π to add.'),
num('c5-2', 'c5', 'With 200 mm of travel per wheel turn, how many degrees must the drive motors turn for the robot to move 1.5 m?', '2700',
  'm → mm → turns → degrees.',
  '1.5 m = 1500 mm. 1500 / 200 = 7.5 turns. 7.5 × 360 = 2700°.', null, null, { tol: 0.002 }),
mc('c5-3', 'c5', 'The robot only drives about 56% as far as it should. Why?' + C`
const int MM_PER_TURN = 200;
double degPerMm = 360 / MM_PER_TURN;
LeftMotor.setPosition(0, degrees);
LeftMotor.spin(forward, 50, percent);
RightMotor.spin(forward, 50, percent);
while (LeftMotor.position(degrees) < 1000 * degPerMm)
{
    wait(20, msec);
}
LeftMotor.stop();
RightMotor.stop();`,
  ['360 / MM_PER_TURN is int division, so degPerMm is 1, not 1.8', 'wait(20, msec) makes the loop check too slowly and miss the target', 'setPosition must come after spin, or the reset is ignored', 'Only the left motor is measured, so the right one keeps going'], 0,
  '360 / 200 is int division, which gives 1, not 1.8. The loop stops at 1000° instead of 1800°, and 1000 / 1800 is about 56%. Write 360.0 / MM_PER_TURN.'),
order('c5-4', 'c5', 'Build a function that drives forward dist_m metres (200 mm per wheel turn). Some tiles are decoys.',
  ['void driveDistance(double dist_m)\n{',
   '    LeftMotor.setPosition(0, degrees);',
   '    LeftMotor.spin(forward, 50, percent);\n    RightMotor.spin(forward, 50, percent);',
   '    while (LeftMotor.position(degrees) < dist_m * 1000 / 200 * 360)\n    {}',
   '    LeftMotor.stop();\n    RightMotor.stop();\n}'],
  ['    if (LeftMotor.position(degrees) < dist_m * 1000 / 200 * 360)\n    {}', '    wait(dist_m, seconds);'],
  'Reset the encoder, start both motors, wait in a loop until the target is reached, then stop. An if would check once and fall straight through. Waiting a number of seconds equal to the distance has nothing to do with how far the robot goes.',
  { code: true, label: 'Your code, top to bottom', alt: [[0, 2, 1, 3, 4]] }),
mc('c5-5', 'c5', 'Which command pair turns the robot clockwise (to the right) in place?',
  ['Left motor forward, right motor forward', 'Left motor forward, right motor reverse', 'Left motor reverse, right motor forward', 'Left motor stopped, right motor forward'], 1,
  'To spin right on the spot, the left wheel pushes forward while the right wheel pulls back at the same speed. Left reverse with right forward spins left. One wheel stopped makes a wide pivot, not an in-place turn.'),
mc('c5-6', 'c5', 'BrainInertial was set to 0 and the robot is spinning clockwise (rotation counts up). Which loop is the safest way to wait until it has turned 90°?',
  [K`while (BrainInertial.rotation(degrees) != 90) {}`, K`if (BrainInertial.rotation(degrees) < 90) {}`, K`while (BrainInertial.rotation(degrees) < 90) {}`, K`while (BrainInertial.rotation(degrees) > 90) {}`], 2,
  'The reading jumps between samples, so it may go from 89.6 straight to 90.4 and never equal 90 exactly. != 90 could loop forever. An if only checks once. The > 90 loop ends at once because 0 > 90 is false.'),
mc('c5-7', 'c5', 'The robot must wait for the touch sensor to be tapped. Why does this code use a second loop?' + C`
while (!TouchLED10.pressing()) {}
while (TouchLED10.pressing()) {}`,
  ['To debounce the motor encoder before the robot starts moving', 'To wait for the finger to come off, so one tap counts only once', 'To wait for a second tap, so a single bump does not start it', 'Nothing: it is redundant, since the first loop already waits'], 1,
  'A tap is a press and a release. The first loop waits for the press, the second for the release. Without the second loop, a program that waits for several taps would count one long press many times.'),
mc('c5-8', 'c5', 'A program drives 1 m, turns, then drives 1 m again using the motor encoder. The second leg stops right away. What was most likely forgotten?',
  ['Resetting the encoder with setPosition before the second leg', 'Calling wait(20, msec) inside the turn so it can finish', 'Using percent instead of rpm for the motor velocity', 'Declaring the conversion factor as const before using it'], 0,
  'The encoder keeps counting from where it was. If it is not reset, it already reads past the 1 m target at the start of the second leg, so the loop condition is false at once. Putting the reset inside driveDistance means you cannot forget it.'),
order('c5-9', 'c5', 'Build code that waits for 4 separate bumper presses, then starts driving forward at 40%. Some tiles are decoys.',
  ['int presses = 0;',
   'while (presses < 4)',
   '{',
   '    while (!Bumper8.pressing()) {}',
   '    while (Bumper8.pressing()) {}',
   '    presses++;',
   '}',
   'LeftMotor.spin(forward, 40, percent);\nRightMotor.spin(forward, 40, percent);'],
  ['while (presses <= 4)', '    if (Bumper8.pressing()) presses++;'],
  'Each pass of the outer loop is one full press: wait for the press, wait for the release, then count it. presses < 4 runs exactly 4 times starting from 0.',
  { code: true, label: 'Your code, top to bottom' }),
num('c5-10', 'c5', 'The drive motor encoder reads 1260° when the robot stops. With 200 mm of travel per wheel turn, how far did it go, in mm?', '700',
  'Degrees → turns → mm.',
  '1260 / 360 = 3.5 turns. 3.5 × 200 = 700 mm.', null, null, { tol: 0.002 }),
mc('c5-11', 'c5', 'Steps: (1) drive until an obstacle is seen, (2) raise the arm above it, (3) drive until it is gone, (4) lower the arm. These must repeat for 4 obstacles. What is the cleanest structure?',
  ['Copy the four steps four times in main, one block per obstacle', 'A for loop run 4 times, with each step a while loop on a sensor', 'One while loop that checks all four sensors at once, with no inner loops', 'Four functions, one per obstacle, each called once from main'], 1,
  'The steps repeat a known number of times, so a counted for loop fits. Each step means waiting for a sensor condition, which is a while loop. Copying code is graded as inefficient.'),
mc('c5-12', 'c5', 'What is wrong with this way of driving for 1 second?' + C`
LeftMotor.spin(forward, 50, percent);
RightMotor.spin(forward, 50, percent);
LeftMotor.stop();
RightMotor.stop();
wait(1, seconds);`,
  ['Nothing: spin keeps the motors on for one second by default', 'The wait is after the stop, so the robot stops almost instantly', 'spin needs a while loop around it, or the motors never start', 'wait only accepts msec, so wait(1, seconds) is ignored'], 1,
  'spin starts the motor and returns at once, and so does stop. With no wait between them the motors run for a split second. Move wait(1, seconds) between the spin and stop lines.'),
order('c5-13', 'c5', 'Build a function that waits until the touch sensor has been tapped (pressed and released). Some tiles are decoys.',
  ['void waitForTap()\n{', '    while (!TouchLED10.pressing())\n    {}', '    while (TouchLED10.pressing())\n    {}', '}'],
  ['    if (TouchLED10.pressing())\n    {}', '    while (TouchLED10.pressing() && !TouchLED10.pressing())\n    {}'],
  'First wait while it is NOT pressed, then wait while it IS pressed. When the second loop ends the finger has come off: one full tap.',
  { code: true, label: 'Your code, top to bottom' }),
mc('c5-14', 'c5', 'Beet juice driveway. Part (b) asks for an issue that may make the plan fail, other than sensor or motor accuracy, a failing component, a low battery or poorly written code. Which answer earns the mark?',
  ['Snow may hide the green turf, so the robot never detects the edge', 'The battery may run out halfway down the 8 m driveway', 'The encoders may drift, so each 1 m step comes out a bit short', 'I might forget to reset the encoder at the start of each pass'], 0,
  'The issue must come from the situation itself. The other three are exactly the excluded categories: battery, accuracy and code. Other good answers: the wheels slip on ice, or a parked car blocks the path.'),
mc('c5-15', 'c5', 'Hallway washer robot. Part (a) asks you to state an assumption. Which is a sensible one?',
  ['Nobody walks through the hallway while the robot is washing', 'The washer might run out of water before the third pass', 'The wet floor may make the wheels slip on the way back', 'My code will have no bugs, so the robot follows the plan'], 0,
  'An assumption is a condition you take as true so the plan can work. Running out of water and slipping are issues (things that could make it fail). Assuming bug-free code is not about the situation.'),
mc('c5-16', 'c5', 'The washer robot repeats passes until 3 passes are done OR the washer needs refilling (' + K`Volume.fill()` + ' returns 1). pass starts at 0. Which loop header is right?',
  [K`while (pass < 3 && Volume.fill() == 0)`, K`while (pass < 3 || Volume.fill() == 0)`, K`while (pass <= 3 && Volume.fill() == 1)`, K`while (!(pass < 3) && Volume.fill() == 0)`], 0,
  'Stop when (3 passes done) OR (refill needed). Keep going while NOT that, which by De Morgan is (fewer than 3 passes) AND (no refill needed). With || it would keep washing with an empty tank.'),
order('c5-17', 'c5', 'Build main for the hallway washer: wait for a tap, then do up to 3 passes, stopping early if the washer needs refilling, then go back to the office. washPass(), waitForTap() and returnToOffice() are already written. Some tiles are decoys.',
  ['int main()\n{',
   '    configureAllSensors();',
   '    waitForTap();',
   '    int pass = 0;',
   '    while (pass < 3 && Volume.fill() == 0)',
   '    {\n        washPass();\n        pass++;\n    }',
   '    returnToOffice();\n    return 0;\n}'],
  ['    for (int pass = 0; pass < 3; pass++)', '    while (pass < 3 || Volume.fill() == 0)'],
  'configureAllSensors() goes first, before any sensor is read. The for loop always does 3 passes and never checks the tank. Whichever way the loop ends, the robot goes back to the office, so that call comes after the loop.',
  { code: true, label: 'Your code, top to bottom', alt: [[0, 1, 3, 2, 4, 5, 6]] }),
mc('c5-18', 'c5', 'rotateRobot(-90, 30) is called to turn the robot left 90°. What happens?' + C`
void rotateRobot(int angle, int speed)
{
    BrainInertial.setRotation(0, degrees);
    LeftMotor.spin(forward, speed, percent);
    RightMotor.spin(reverse, speed, percent);
    while (BrainInertial.rotation(degrees) < angle)
    {}
    LeftMotor.stop();
    RightMotor.stop();
}`,
  ['The loop test 0 < −90 is false, so it stops right away', 'It turns left 90°, because the angle is negative', 'It turns right 90°, because speed is always positive', 'It turns right forever, since rotation never reaches −90'], 0,
  'This version only handles clockwise turns. For a negative angle it needs the opposite motor directions and the loop while (rotation > angle). Test the sign of angle with an if, or turn using the absolute value and a direction.'),
mc('c5-19', 'c5', 'Why does this function not compile?' + C`
void driveTime(int seconds)
{
    LeftMotor.spin(forward, 50, percent);
    RightMotor.spin(forward, 50, percent);
    wait(seconds, seconds);
    LeftMotor.stop();
    RightMotor.stop();
}`,
  ['The parameter named seconds hides the unit seconds in the wait call', 'wait cannot take a variable, only a number written in the code', 'The function must return the time it drove, not void', 'spin needs a third argument for the run time in seconds'], 0,
  'Inside the function, seconds now means the int parameter, so wait(seconds, seconds) passes two ints. Rename the parameter, for example void driveTime(int sec) and wait(sec, seconds).', { test: { vex: true, err: true } }),
mc('c5-20', 'c5', 'The plant stand turns the platform every 15 minutes. Which line waits 15 minutes?',
  [K`wait(15 * 60, seconds);`, K`wait(15, seconds);`, K`wait(15 * 60, msec);`, K`wait(15 * 60 * 1000, seconds);`], 0,
  '15 minutes is 15 × 60 = 900 seconds (or 900000 msec). The others wait 15 s, 0.9 s and 10 days.'),
mc('c5-21', 'c5', 'The plant robot drives until it finds a bright spot or hits the far edge. Right after this loop, how should it decide whether to turn around and go back?' + C`
LeftMotor.spin(forward, 30, percent);
RightMotor.spin(forward, 30, percent);
while (Optical3.brightness() <= 75 && !Bumper8.pressing())
{}
LeftMotor.stop();
RightMotor.stop();`,
  [K`if (Bumper8.pressing())`, K`if (Optical3.brightness() <= 75 && !Bumper8.pressing())`, K`while (Bumper8.pressing())`, 'It cannot tell which condition ended the loop'], 0,
  'The loop ends when either condition changes. Test one of them again with an if: if the bumper is pressed, it reached the edge, so turn around and return. The loop condition itself is always false once the loop has ended.'),
mc('c5-22', 'c5', 'The plant robot hit the far edge and must return to where it started. Why read ' + K`LeftMotor.position(degrees)` + ' right after it stops, before turning around?',
  ['To know how far it drove, so it can drive the same distance back', 'To reset the encoder to zero before the robot turns around', 'To check that the motor is still connected and turning', 'To measure the angle of the turn it is about to make'], 0,
  'The distance out is not known in advance, because it depends on when the bumper was hit. Save the encoder reading in a variable, turn 180°, reset, and drive until the encoder reaches the saved value.'),
order('c5-23', 'c5', 'Dinosaur prints: until 30 minutes have passed or green is seen, drive 5 s, make a print, move the foot to the other side, and turn 45° if something is closer than 1000 mm. driveTime, makePrint, moveFoot and rotateRobot are written. Some tiles are decoys.',
  ['Brain.Timer.clear();\nbool toBumper = true;',
   'while (Brain.Timer.time(seconds) < 30 * 60 && Optical3.color() != green)',
   '{',
   '    driveTime(5);\n    makePrint();',
   '    moveFoot(toBumper);\n    toBumper = !toBumper;',
   '    if (Distance7.objectDistance(mm) < 1000)\n        rotateRobot(45, 30);',
   '}'],
  ['while (Brain.Timer.time(seconds) < 30 * 60 || Optical3.color() != green)', '    if (Distance7.objectDistance(mm) > 1000)\n        rotateRobot(45, 30);'],
  'Stop when (time up) OR (green), so keep going while (time not up) AND (not green). The timer counts seconds, so 30 minutes is 30 * 60. The foot alternates sides, so flip the bool after each move.',
  { code: true, label: 'Your code, top to bottom' }),
mc('c5-24', 'c5', 'Poolside snacks: buttonValue() returns 1 to 3 for the button pressed, or 0 if nobody pressed one before it timed out. If a button was pressed, the tray turns 90° × the button number and the robot waits 1 minute. What should main do when it returns 0?',
  ['Skip the tray turn and the 1-minute wait, and drive on', 'Turn the tray 0° but still wait the full minute', 'Keep calling buttonValue() until it returns a button', 'End the program, since nobody wants snacks'], 0,
  'The wait is for someone taking a snack. With no press there is nobody to serve, so wrap both the turn and the wait in if (button > 0).'),
order('c5-25', 'c5', 'The beet juice valve opens with juiceMotor at 50% forward for 2 seconds, and closes at 50% reverse for 2 seconds. Build one function that does either. Some tiles are decoys.',
  ['void setValve(bool open)\n{',
   '    if (open)\n        juiceMotor.spin(forward, 50, percent);',
   '    else\n        juiceMotor.spin(reverse, 50, percent);',
   '    wait(2, seconds);',
   '    juiceMotor.stop();\n}'],
  ['    wait(2, msec);', '    if (!open)\n        juiceMotor.spin(forward, 50, percent);'],
  'A parameter picks the direction, and the timing is shared, so it comes after the if-else. One function with a parameter is what part (c) asks for, instead of two nearly identical functions.',
  { code: true, label: 'Your code, top to bottom' }),
mc('c5-26', 'c5', 'The driveway has green artificial turf on each side. The robot crosses the driveway "until it reaches the other side". Which loop does that?',
  [K`while (Optical3.color() != green) {}`, K`while (Optical3.color() == green) {}`, K`if (Optical3.color() != green) {}`, K`while (Distance7.objectDistance(mm) < 200) {}`], 0,
  'Start the motors, then wait while the sensor does NOT see green. The loop ends on reaching the turf, then stop. Looping while it IS green would end immediately, since the robot starts on the driveway.')
];

/* ---------- WRITE THE CODE: whole programs, marked by Claude (separate section) ---------- */
function RAW(strs) { return dedent(rawTag(strs, [].slice.call(arguments, 1))); }
var CODE = [
  { id: 'w1', title: 'Obstacle log', mins: 15, tags: 'Files · reference parameters · decisions',
    q: '<p>A robot\'s distance sensor saved its readings to <code>readings.txt</code>. The first line is an integer <b>n</b>, followed by <b>n</b> readings in cm (decimals), one per line.</p>' +
      '<p>Write a <b>complete C++ program</b> that:</p><ol>' +
      '<li>Opens <code>readings.txt</code>. If it fails to open, outputs <code>Error opening file</code> and ends the program.</li>' +
      '<li>Uses a function you write with this exact header:<br><code>void analyze(ifstream &amp; fin, int n, double &amp; closest, int &amp; numNear)</code><br>It reads the n readings and sets <code>closest</code> to the smallest reading and <code>numNear</code> to how many readings are under 20.0 cm.</li>' +
      '<li>Back in <code>main</code>, outputs <code>Closest: X cm</code> and <code>Near readings: Y</code> on separate lines, with X to 1 decimal place.</li>' +
      '<li>If more than half of the readings are near, also outputs <code>Warning: crowded</code>.</li></ol>',
    tests: [
      { name: 'Sample file', show: true, files: [['readings.txt', '6\n35.5\n18.2\n42.0\n12.6\n19.9\n50']], out: 'Closest: 12.6 cm\nNear readings: 3' },
      { name: 'Crowded file', files: [['readings.txt', '5\n10\n25.25\n3.4\n19.99\n20']], out: 'Closest: 3.4 cm\nNear readings: 3\nWarning: crowded' },
      { name: 'Missing file', files: [], out: 'Error opening file' }
    ],
    rubric: [[1, 'Includes iostream, fstream and iomanip, and main returns an int'], [2, 'Opens the file, checks it opened, prints the error and stops if not'], [1, 'Reads n from the first line before calling analyze'],
      [3, 'analyze uses the exact header, reads n values in a loop, sets closest from a real reading (not from 0) and counts readings under 20.0'], [2, 'Prints both lines exactly, with fixed and setprecision(1)'], [1, 'Warning only when numNear is MORE than half of n (3 of 6 is not)']],
    model: RAW`
      #include <iostream>
      #include <fstream>
      #include <iomanip>
      using namespace std;

      void analyze(ifstream & fin, int n, double & closest, int & numNear)
      {
          numNear = 0;
          for (int i = 0; i < n; i++)
          {
              double r = 0;
              fin >> r;
              if (i == 0 || r < closest)
                  closest = r;
              if (r < 20.0)
                  numNear++;
          }
      }

      int main()
      {
          ifstream fin("readings.txt");
          if (!fin)
          {
              cout << "Error opening file" << endl;
              return 1;
          }
          int n = 0;
          fin >> n;
          double closest = 0;
          int numNear = 0;
          analyze(fin, n, closest, numNear);
          cout << fixed << setprecision(1);
          cout << "Closest: " << closest << " cm" << endl;
          cout << "Near readings: " << numNear << endl;
          if (numNear > n / 2.0)
              cout << "Warning: crowded" << endl;
          fin.close();
          return 0;
      }` },

  { id: 'w2', title: 'Marks report', mins: 12, tags: 'Read until end of file · counters',
    q: '<p><code>marks.txt</code> holds an <b>unknown number</b> of whole-number marks out of 100, separated by whitespace.</p>' +
      '<p>Write a <b>complete C++ program</b> that:</p><ol>' +
      '<li>Opens <code>marks.txt</code>. If it fails to open, outputs <code>Cannot open marks.txt</code> and ends the program.</li>' +
      '<li>Reads marks until the end of the file.</li>' +
      '<li>If there were no marks, outputs <code>No marks</code> and nothing else.</li>' +
      '<li>Otherwise outputs, one per line: <code>Count: </code>, <code>Average: </code> (1 decimal place), <code>Highest: </code> and <code>Failing: </code> (marks below 50).</li></ol>',
    tests: [
      { name: 'Sample file', show: true, files: [['marks.txt', '72\n45\n88\n50\n39\n91']], out: 'Count: 6\nAverage: 64.2\nHighest: 91\nFailing: 2' },
      { name: 'Empty file', files: [['marks.txt', '']], out: 'No marks' },
      { name: 'Missing file', files: [], out: 'Cannot open marks.txt' }
    ],
    rubric: [[1, 'Includes iostream, fstream and iomanip'], [2, 'Opens the file and handles a failed open'], [2, 'Loops with while (fin >> mark) or an equivalent end-of-file check that does not count the last mark twice'],
      [2, 'Count, sum, highest (started from a real mark) and failing (below 50, so 50 passes) are all correct'], [2, 'Average uses double division and prints with fixed and setprecision(1)'], [1, 'Prints only No marks when the file is empty, with no division by zero']],
    model: RAW`
      #include <iostream>
      #include <fstream>
      #include <iomanip>
      using namespace std;

      int main()
      {
          ifstream fin("marks.txt");
          if (!fin)
          {
              cout << "Cannot open marks.txt" << endl;
              return 1;
          }
          int mark = 0, count = 0, sum = 0, highest = 0, failing = 0;
          while (fin >> mark)
          {
              count++;
              sum += mark;
              if (count == 1 || mark > highest)
                  highest = mark;
              if (mark < 50)
                  failing++;
          }
          fin.close();
          if (count == 0)
          {
              cout << "No marks" << endl;
              return 0;
          }
          cout << fixed << setprecision(1);
          cout << "Count: " << count << endl;
          cout << "Average: " << static_cast<double>(sum) / count << endl;
          cout << "Highest: " << highest << endl;
          cout << "Failing: " << failing << endl;
          return 0;
      }` },

  { id: 'w3', title: 'Triangle check', mins: 12, tags: 'Functions · pass by reference · bool',
    q: '<p>Write a <b>complete C++ program</b> with these two functions:</p><ol>' +
      '<li><code>void sortThree(int &amp; a, int &amp; b, int &amp; c)</code> rearranges the three values so that a ≤ b ≤ c.</li>' +
      '<li><code>bool isTriangle(int a, int b, int c)</code> assumes a ≤ b ≤ c and returns true when the sides can form a triangle: all positive, and a + b &gt; c.</li>' +
      '<li><code>main</code> prompts with <code>Enter three side lengths: </code>, reads three ints from the keyboard, sorts them with <code>sortThree</code>, outputs <code>Sorted: a b c</code>, then outputs <code>Triangle</code> or <code>Not a triangle</code>.</li></ol>',
    tests: [
      { name: 'Sample input 7 3 5', show: true, input: '7 3 5', out: 'Enter three side lengths: Sorted: 3 5 7\nTriangle' },
      { name: 'Input 1 2 3 (flat, a + b = c)', input: '1 2 3', out: 'Enter three side lengths: Sorted: 1 2 3\nNot a triangle' },
      { name: 'Input 10 4 4', input: '10 4 4', out: 'Enter three side lengths: Sorted: 4 4 10\nNot a triangle' }
    ],
    rubric: [[2, 'sortThree takes all three by reference and really changes the caller\'s variables'], [2, 'sortThree sorts every order correctly (three compare-and-swaps, or equivalent)'], [2, 'isTriangle returns a bool, uses a strict a + b > c and checks for positive sides'],
      [2, 'main reads with cin, calls sortThree before printing, and prints Sorted: with single spaces'], [1, 'Uses the return value of isTriangle in an if to choose the message'], [1, 'Compiles: functions declared before use, correct types, return 0']],
    model: RAW`
      #include <iostream>
      using namespace std;

      void swapInts(int & x, int & y)
      {
          int temp = x;
          x = y;
          y = temp;
      }

      void sortThree(int & a, int & b, int & c)
      {
          if (a > b) swapInts(a, b);
          if (b > c) swapInts(b, c);
          if (a > b) swapInts(a, b);
      }

      bool isTriangle(int a, int b, int c)
      {
          return a > 0 && a + b > c;
      }

      int main()
      {
          int a = 0, b = 0, c = 0;
          cout << "Enter three side lengths: ";
          cin >> a >> b >> c;
          sortThree(a, b, c);
          cout << "Sorted: " << a << " " << b << " " << c << endl;
          if (isTriangle(a, b, c))
              cout << "Triangle" << endl;
          else
              cout << "Not a triangle" << endl;
          return 0;
      }` },

  { id: 'w4', title: 'Park at the wall (VEX IQ)', mins: 15, tags: 'VEX IQ · loops · functions with parameters',
    vex: true,
    q: '<p>A VEX IQ robot is in the standard configuration: <code>LeftMotor</code>, <code>RightMotor</code>, <code>TouchLED10</code>, <code>Distance7</code>. One wheel turn moves the robot 200 mm. <code>rotateRobot(angle, speed)</code> is given; you do not write it.</p>' +
      '<p>Write a <b>complete program</b> that:</p><ol>' +
      '<li>Calls <code>configureAllSensors()</code> first.</li>' +
      '<li>Waits until the Touch LED is pressed.</li>' +
      '<li>Drives forward at 50% power until the distance sensor reads less than 150 mm, then stops.</li>' +
      '<li>Turns 90° clockwise with <code>rotateRobot(90, 40)</code>.</li>' +
      '<li>Drives forward exactly 400 mm using a function you write, <code>void driveDistance(double mm, int speed)</code>, that uses the left motor\'s encoder.</li></ol>',
    tests: [
      { name: 'Trace of the robot\'s actions', show: true, out: 'waits for the press, then drives, stops under 150 mm, turns 90, drives 400 mm (720 degrees), stops' }
    ],
    rubric: [[1, 'configureAllSensors() is the first line of main'], [2, 'Waits in a loop while the Touch LED is not pressed (with a short wait inside)'],
      [2, 'Spins BOTH motors forward at 50%, loops until objectDistance(mm) is under 150, then stops both'], [1, 'Calls rotateRobot(90, 40) instead of rewriting it'],
      [3, 'driveDistance resets the encoder with setPosition(0, degrees), converts mm to degrees as mm / 200 * 360 (720 for 400 mm, no int division), spins both motors at speed, loops until position reaches the target, stops both'], [1, 'Calls driveDistance(400, speed) with sensible parameters']],
    model: RAW`
      #include "vex.h"
      using namespace vex;

      // rotateRobot(angle, speed) is given on the exam

      void driveDistance(double mm, int speed)
      {
          double target = mm / 200 * 360;      // 200 mm per wheel turn
          LeftMotor.setPosition(0, degrees);
          LeftMotor.spin(forward, speed, percent);
          RightMotor.spin(forward, speed, percent);
          while (LeftMotor.position(degrees) < target)
          {
              wait(20, msec);
          }
          LeftMotor.stop();
          RightMotor.stop();
      }

      int main()
      {
          configureAllSensors();
          while (!TouchLED10.pressing())
          {
              wait(20, msec);
          }
          LeftMotor.spin(forward, 50, percent);
          RightMotor.spin(forward, 50, percent);
          while (Distance7.objectDistance(mm) >= 150)
          {
              wait(20, msec);
          }
          LeftMotor.stop();
          RightMotor.stop();
          rotateRobot(90, 40);
          driveDistance(400, 50);
          return 0;
      }` }
];

COURSES.push({
  id: 'mte121', code: 'MTE 121', name: 'Digital Computation', key: 'mte121-midterm-gym-v1', hue: 'c3',
  exam: { at: '2026-10-27T16:30:00-04:00', label: 'Tue Oct 27, 4:30 PM' },
  scope: 'C++ fundamentals to VEX IQ',
  progs: CODE,
  topics: T, Q: Q,
  titles: ['Hello World', 'Semicolon Survivor', 'Integer Divider', 'Branch Manager', 'Loop Wrangler', 'Off-by-One Hunter', 'Reference Ranger', 'Function Smith', 'Encoder Whisperer', 'Midterm Compiler'],
  formula: { kind: 'html', title: 'C++ syntax sheet', sub: 'C++ syntax quick reference', note: 'A C++ syntax quick reference, plus the VEX IQ calls this gym uses. It is not an official exam sheet.',
    items: [
      ['Libraries', K`iostream` + ', ' + K`fstream` + ', ' + K`cmath` + ', ' + K`using namespace std`],
      ['Function definition and call', C`
returnType functionName(type argument1, type argument2)
{
}
functionName(argument1, argument2);`],
      ['File input and output', C`
ifstream inputFile;
inputFile.open("file.txt");
// for output files use ofstream
fileObject.fail()
inputFile >> data;      // reading
outputFile << time;     // writing
fileObject.close();`],
      ['while, if, if-else, if-else if', C`
while (condition) { ... }
if (condition) { ... }
if (condition) { ... } else { ... }
if (condition1) { ... } else if (condition2) { ... }`],
      ['VEX IQ calls used in this gym', C`
configureAllSensors();               // first line of main
LeftMotor.spin(forward, 50, percent); // or reverse
LeftMotor.stop();
LeftMotor.setPosition(0, degrees);
LeftMotor.position(degrees)
TouchLED10.pressing()   Bumper8.pressing()
Distance7.objectDistance(mm)
Optical3.color() == green
Optical3.brightness()                 // 0 dark to 100 bright
BrainInertial.setRotation(0, degrees);
BrainInertial.rotation(degrees)       // clockwise is positive
Brain.Timer.clear();
Brain.Timer.time(seconds)
wait(20, msec);   wait(2, seconds);
rotateRobot(angle, speed);            // given on the exams
// 1 wheel turn = 200 mm:  degrees = mm / 200 * 360`]
    ] },
  mock: { minutes: 60, blurb: '6 multiple choice (2 points each), 2 output traces (5 points each) and 2 build-the-code puzzles (10 points each). Like the real midterm, the trace questions reward careful step-by-step tracking.',
    sections: [
      { label: 'Multiple choice', short: 'multiple choice', n: 6, pts: 2, pick: function (q) { return q.type === 'mc'; } },
      { label: 'Output trace', short: 'output trace', n: 2, pts: 5, pick: function (q) { return q.type === 'txt'; } },
      { label: 'Build the code', short: 'build the code', n: 2, pts: 10, pick: function (q) { return q.type === 'order'; } }
    ] },
  how: ['Output questions accept any spacing at the ends of lines, and a line break counts as a space. Spaces between values still matter.',
    'Writing questions turn into build-the-code puzzles: tap the lines in order, and leave the decoys out. On the real midterm you write the whole program, so also write the past-midterm programs out on paper.',
    'The VEX questions follow the robot questions on past exams: a VEX IQ robot in the standard configuration, configureAllSensors(), a given rotateRobot(angle, speed), and parts asking for an assumption, an issue and functions with parameters. Device names follow VEXcode IQ defaults. The logic carries over if your lab names them differently.']
});
})();
