/* ==========================================================================
   АЛГОРИТЪМ НА ЗОДИИТЕ ПО ЕЛЕМЕНТИ
   Вход: DD, MM от датата на раждане + пол (male/female)
   Изход: елемент (Огън/Земя/Въздух/Вода) → съответна кралска карта
   (Queen/King of Fire/Earth/Air/Water) от 8-те галерии.

   Диапазоните по-долу са редактируеми — при нужда просто ги промени тук
   (по-нататък ще се зареждат от контролния панел).
   ========================================================================== */

const ZODIAC_RANGES = [
  { element: 'Огън',   elementEn: 'Fire',  sign: 'Овен',      start: [21,3],  end: [19,4]  },
  { element: 'Земя',   elementEn: 'Earth', sign: 'Телец',     start: [20,4],  end: [20,5]  },
  { element: 'Въздух', elementEn: 'Air',   sign: 'Близнаци',  start: [21,5],  end: [20,6]  },
  { element: 'Вода',   elementEn: 'Water', sign: 'Рак',       start: [21,6],  end: [22,7]  },
  { element: 'Огън',   elementEn: 'Fire',  sign: 'Лъв',       start: [23,7],  end: [22,8]  },
  { element: 'Земя',   elementEn: 'Earth', sign: 'Дева',      start: [23,8],  end: [22,9]  },
  { element: 'Въздух', elementEn: 'Air',   sign: 'Везни',     start: [23,9],  end: [22,10] },
  { element: 'Вода',   elementEn: 'Water', sign: 'Скорпион',  start: [23,10], end: [21,11] },
  { element: 'Огън',   elementEn: 'Fire',  sign: 'Стрелец',   start: [22,11], end: [21,12] },
  { element: 'Земя',   elementEn: 'Earth', sign: 'Козирог',   start: [22,12], end: [19,1]  }, // прехвърля годината
  { element: 'Въздух', elementEn: 'Air',   sign: 'Водолей',   start: [20,1],  end: [18,2]  },
  { element: 'Вода',   elementEn: 'Water', sign: 'Риби',      start: [19,2],  end: [20,3]  },
];

/** Сравнява (dd,mm) с диапазон, вкл. диапазони, прехвърлящи границата на годината (напр. Козирог). */
function inRange(dd, mm, [sd, sm], [ed, em]) {
  const val = mm * 100 + dd;
  const start = sm * 100 + sd;
  const end = em * 100 + ed;
  if (start <= end) return val >= start && val <= end;
  return val >= start || val <= end; // прехвърля през нова година
}

/**
 * Разчита текста от контролния панел, формат:
 * "Огън: 21/03–19/04, 23/07–22/08, 22/11–21/12" (по един ред на елемент).
 * Връща масив от диапазони във формàта на ZODIAC_RANGES (без имена на знаци).
 */
function parseZodiacRangesText(text) {
  const out = [];
  const elMap = { 'Огън':'Fire', 'Земя':'Earth', 'Въздух':'Air', 'Вода':'Water' };
  text.split('\n').forEach(line => {
    const m = line.match(/^\s*(Огън|Земя|Въздух|Вода)\s*:\s*(.+)$/);
    if (!m) return;
    const element = m[1];
    m[2].split(',').forEach(range => {
      const rm = range.trim().match(/(\d{2})\/(\d{2})\s*[–\-]\s*(\d{2})\/(\d{2})/);
      if (!rm) return;
      out.push({
        element, elementEn: elMap[element], sign: '',
        start: [Number(rm[1]), Number(rm[2])], end: [Number(rm[3]), Number(rm[4])],
      });
    });
  });
  return out.length ? out : null;
}

/** Взима диапазоните от контролния панел (ако са запазени), иначе вградените по подразбиране. */
function getActiveRanges() {
  const text = typeof cpGet === 'function' ? cpGet('zodiacRanges', null) : null;
  if (text) {
    const parsed = parseZodiacRangesText(text);
    if (parsed) return parsed;
  }
  return ZODIAC_RANGES;
}

/** Връща елемента и зодиакалния знак за дадена дата. */
function getZodiacElement(dd, mm) {
  const ranges = getActiveRanges();
  const match = ranges.find(r => inRange(dd, mm, r.start, r.end));
  if (!match) throw new Error('Датата не попада в нито един диапазон.');
  return { element: match.element, elementEn: match.elementEn, sign: match.sign || '' };
}

/**
 * Връща кралската карта (от 8-те галерии) за елемента и пола.
 * @param {string} element - 'Огън' | 'Земя' | 'Въздух' | 'Вода'
 * @param {string} gender  - 'male' | 'female'
 */
function getCourtCard(element, gender) {
  const isMale = gender === 'male';
  const titleBg = isMale ? 'Крал' : 'Кралица';
  const titleEn = isMale ? 'King' : 'Queen';
  const elementEnMap = { 'Огън':'Fire', 'Земя':'Earth', 'Въздух':'Air', 'Вода':'Water' };
  return {
    nameBg: `${titleBg} ${element}`,
    nameEn: `${titleEn} of ${elementEnMap[element]}`,
    galleryKey: `${titleEn.toLowerCase()}-${elementEnMap[element].toLowerCase()}`, // напр. "king-fire"
  };
}

/** Удобна обвивка: дата + пол → елемент, знак и кралска карта наведнъж. */
function calculateZodiac(dd, mm, gender) {
  const { element, elementEn, sign } = getZodiacElement(dd, mm);
  const court = getCourtCard(element, gender);
  return { element, elementEn, sign, court };
}
