/* ==========================================================================
   Зарежда настройките на сайта от site-data.json (експортиран от
   control-panel.html чрез бутона "ИЗТЕГЛИ site-data.json"). Ако файлът липсва
   (напр. още не си експортирал), пада обратно към localStorage — това
   позволява преглед направо от control-panel.html, докато панелът никога
   не се качва публично.
   ========================================================================== */
let SITE_DATA = {};

async function loadSiteData() {
  try {
    const res = await fetch('site-data.json');
    if (res.ok) SITE_DATA = await res.json();
  } catch (e) {
    // няма експортиран файл (или страницата е отворена през file://) — добре е, ползвай localStorage
  }
}

/** Взима стойност: първо от заредения site-data.json, после от localStorage, накрая fallback. */
function cpGet(key, fallback) {
  if (SITE_DATA && Object.prototype.hasOwnProperty.call(SITE_DATA, key)) return SITE_DATA[key];
  try {
    const v = localStorage.getItem('cp.' + key);
    return v ? JSON.parse(v) : fallback;
  } catch (e) { return fallback; }
}
