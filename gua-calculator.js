/* ==========================================================================
   ГУА КАЛКУЛАТОР (Фън Шуй)
   Вход: година на раждане + пол
   Изход: САМО положителните посоки (без самото Гуа число), в табличен вид,
   озаглавени "Благословени лични посоки".

   Всички числа по-долу (прагове, посоки) могат да се коригират от
   контролния панел — четат се от localStorage при всяко изчисление.
   ========================================================================== */

const GUA_DEFAULTS = {
  subtractBefore2000: 10,
  subtractAfter2000: 9,
  addBefore2000: 5,
  addAfter2000: 6,
  yearThreshold: 2000,
  gua5Male: 2,
  gua5Female: 8,
  directions: {
    1: { success:'Югоизток',    support:'Изток',       love:'Юг',          balance:'Север' },
    2: { success:'Североизток', support:'Запад',       love:'Северозапад', balance:'Югозапад' },
    3: { success:'Юг',          support:'Север',       love:'Югоизток',    balance:'Изток' },
    4: { success:'Север',       support:'Юг',          love:'Изток',       balance:'Югоизток' },
    6: { success:'Запад',       support:'Североизток', love:'Югозапад',    balance:'Северозапад' },
    7: { success:'Северозапад', support:'Югозапад',    love:'Североизток', balance:'Запад' },
    8: { success:'Югозапад',    support:'Северозапад', love:'Запад',       balance:'Североизток' },
    9: { success:'Изток',       support:'Югоизток',    love:'Север',       balance:'Юг' },
  },
};

/** Взима конфигурацията от контролния панел (site-data.json или localStorage), сляна с вградената по подразбиране. */
function getActiveGuaConfig() {
  const parsed = typeof cpGet === 'function' ? cpGet('guaConfig', null) : null;
  if (parsed) {
    return {
      ...GUA_DEFAULTS, ...parsed,
      directions: { ...GUA_DEFAULTS.directions, ...(parsed.directions || {}) },
    };
  }
  return GUA_DEFAULTS;
}

/** Сбор от цифрите на число, повторен до едноцифрено. */
function digitSumToSingle(n) {
  n = Math.abs(Math.trunc(n));
  while (n > 9) {
    n = String(n).split('').reduce((s, d) => s + Number(d), 0);
  }
  return n;
}

/** Изчислява Гуа числото по правилата, запазени в панела (или вградените по подразбиране). */
function calculateGuaNumber(year, gender) {
  const cfg = getActiveGuaConfig();
  const single = digitSumToSingle(year);
  const isMale = gender === 'male';
  const before = year < cfg.yearThreshold;
  let gua;
  if (isMale) gua = before ? cfg.subtractBefore2000 - single : cfg.subtractAfter2000 - single;
  else        gua = before ? single + cfg.addBefore2000       : single + cfg.addAfter2000;

  if (gua <= 0) gua = 9 + gua === 0 ? 9 : 9 + gua;
  if (gua > 9) gua = digitSumToSingle(gua);
  return gua;
}

/** Връща само таблицата с положителни посоки — без да разкрива Гуа числото. */
function calculateBlessedDirections(year, gender) {
  const cfg = getActiveGuaConfig();
  let gua = calculateGuaNumber(year, gender);
  if (gua === 5) gua = gender === 'male' ? cfg.gua5Male : cfg.gua5Female;
  return cfg.directions[gua];
}
