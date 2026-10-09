/* ==========================================================================
   МАТРИЦА НА СЪДБАТА — алгоритъм за големите аркани
   Вход: дата на раждане DD/MM/YYYY
   Изход: число 1–22, което сочи една от 22-те карти по-долу.

   Стъпки (в този ред, всяка стойност се редуцира до число 1–22 преди
   да се използва в следващата стъпка):
     A  = DD
     C  = MM
     E  = YYYY
     G  = A + C + E
     I  = A + C + E + G
     e2 = E + I
     x2 = reduce( e2 + G + I ) + e2   →  after that, reduce again to 1–22

   Този файл е нарочно отделен и коментиран стъпка по стъпка, за да може
   лесно да се коригира/зарежда от контролния панел по-нататък.
   ========================================================================== */

/** Редуцира число до диапазон 1–22 чрез сбор на цифрите, повторен колкото пъти е нужно. */
function reduceTo22(n) {
  n = Math.abs(Math.trunc(n));
  while (n > 22) {
    n = String(n).split('').reduce((sum, digit) => sum + Number(digit), 0);
  }
  return n === 0 ? 22 : n; // 0 се третира като 22 (цикличност на Глупакът)
}

/** Имена на 22-та голям аркан, индекс 0..21 (0 = Глупакът/Пътник, 21 = Светът/Мегдан). */
const MAJOR_ARCANA = [
  { roman: '0',    classic: 'Глупакът',         local: 'Пътник' },
  { roman: 'I',    classic: 'Магьосникът',      local: 'Илюзионистът' },
  { roman: 'II',   classic: 'Висшата жрица',    local: 'Знахарката' },
  { roman: 'III',  classic: 'Императрицата',    local: 'Царица Рози' },
  { roman: 'IV',   classic: 'Императорът',      local: 'Кханът' },
  { roman: 'V',    classic: 'Жрецът',           local: 'Колобърът' },
  { roman: 'VI',   classic: 'Влюбените',        local: 'Орисаните' },
  { roman: 'VII',  classic: 'Колесницата',      local: 'Каруцата' },
  { roman: 'VIII', classic: 'Силата',           local: 'Мечкарката' },
  { roman: 'IX',   classic: 'Отшелникът',       local: 'Пазителят на живия огън' },
  { roman: 'X',    classic: 'Колелото на съдбата', local: 'Чакръкът на съдбата' },
  { roman: 'XI',   classic: 'Справедливостта',  local: 'Видов ден' },
  { roman: 'XII',  classic: 'Обесеният',        local: 'Посветеният' },
  { roman: 'XIII', classic: 'Смъртта',          local: 'Жар Птица' },
  { roman: 'XIV',  classic: 'Умереността',      local: 'Живата вода' },
  { roman: 'XV',   classic: 'Дяволът',          local: 'Кукерът' },
  { roman: 'XVI',  classic: 'Кулата',           local: 'Кулата' },
  { roman: 'XVII', classic: 'Звездата',         local: 'Вечерница' },
  { roman: 'XVIII',classic: 'Луната',           local: 'Месечина' },
  { roman: 'XIX',  classic: 'Слънцето',         local: 'Райко' },
  { roman: 'XX',   classic: 'Страшният съд',    local: 'Пробуждане' },
  { roman: 'XXI',  classic: 'Светът',           local: 'Мегдан' },
];

/* ---------- безопасен парсер на формули (без eval) ----------
   Поддържа: имена на променливи (A,C,E,G,I,e2,x2), числа, + и -, скоби,
   и reduce(...) — точно колкото е нужно за този алгоритъм, нищо повече.
   ------------------------------------------------------------ */
function evalFormula(expr, vars) {
  let i = 0;
  function skipWs(){ while (expr[i] === ' ') i++; }
  function parseExpr() {
    skipWs();
    let sign = 1;
    if (expr[i] === '+' || expr[i] === '-') { sign = expr[i] === '-' ? -1 : 1; i++; }
    let val = sign * parseTerm();
    skipWs();
    while (expr[i] === '+' || expr[i] === '-') {
      const op = expr[i]; i++;
      const t = parseTerm();
      val = op === '+' ? val + t : val - t;
      skipWs();
    }
    return val;
  }
  function parseTerm() {
    skipWs();
    if (expr[i] === '(') { i++; const v = parseExpr(); skipWs(); if (expr[i] === ')') i++; return v; }
    if (expr.slice(i, i+6) === 'reduce') {
      i += 6; skipWs();
      if (expr[i] === '(') i++;
      const v = parseExpr(); skipWs(); if (expr[i] === ')') i++;
      return reduceTo22(v);
    }
    const m = /^[A-Za-z0-9]+/.exec(expr.slice(i));
    if (!m) throw new Error('Невалиден израз в позиция ' + i);
    const token = m[0]; i += token.length;
    if (/^\d+$/.test(token)) return Number(token);
    if (!(token in vars)) throw new Error('Непозната променлива: ' + token);
    return vars[token];
  }
  return parseExpr();
}

/** Разчита текста от контролния панел (редове "ИМЕ = израз") в наредена стъпков списък. */
function parseMatrixAlgoText(text) {
  const steps = [];
  text.split('\n').forEach(line => {
    const m = line.match(/^\s*(G|I|e2|x2)\s*=\s*(.+?)\s*$/);
    if (m) steps.push({ name: m[1], expr: m[2] });
  });
  return steps.length ? steps : null;
}

/** Взима запазения алгоритъм от панела (site-data.json или localStorage); при липса — null (вграден). */
function getActiveMatrixSteps() {
  const text = typeof cpGet === 'function' ? cpGet('matrixAlgo', null) : null;
  return text ? parseMatrixAlgoText(text) : null;
}

/**
 * Пресмята стъпка по стъпка Матрицата на съдбата за дадена дата.
 * Ако в панела е запазен коригиран алгоритъм (G/I/e2/x2 = израз), той се ползва;
 * иначе се прилага вграденият по подразбиране.
 * @param {string} dobStr - дата във формат DD/MM/YYYY
 * @returns {object} всички междинни стойности + финалната карта
 */
function calculateDestinyMatrix(dobStr) {
  const parts = dobStr.split('/').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) {
    throw new Error('Невалидна дата — очаква се формат DD/MM/YYYY');
  }
  const [dd, mm, yyyy] = parts;

  const A = reduceTo22(dd);
  const C = reduceTo22(mm);
  const E = reduceTo22(yyyy);
  const vars = { A, C, E };

  const steps = getActiveMatrixSteps();
  if (steps) {
    steps.forEach(({ name, expr }) => { vars[name] = reduceTo22(evalFormula(expr, vars)); });
  } else {
    vars.G  = reduceTo22(A + C + E);
    vars.I  = reduceTo22(A + C + E + vars.G);
    vars.e2 = reduceTo22(E + vars.I);
    vars.x2 = reduceTo22(reduceTo22(vars.e2 + vars.G + vars.I) + vars.e2);
  }

  const { G, I, e2, x2 } = vars;
  const cardIndex = x2 === 22 ? 0 : x2;      // 22 цикля обратно към Глупакът (индекс 0)
  const card = MAJOR_ARCANA[cardIndex];

  return { A, C, E, G, I, e2, x2, cardIndex, card };
}
