// Les dates sont stockées au format ISO (« 2026-10-12 ») et formatées en français à l'affichage.

const MONTHS = {
  jan: 1,
  janv: 1,
  fev: 2,
  fevr: 2,
  feb: 2,
  mar: 3,
  mars: 3,
  avr: 4,
  apr: 4,
  mai: 5,
  may: 5,
  juin: 6,
  jun: 6,
  juil: 7,
  jul: 7,
  aout: 8,
  aug: 8,
  sep: 9,
  sept: 9,
  oct: 10,
  nov: 11,
  dec: 12
};

const pad = (value) => String(value).padStart(2, '0');

const toIso = (year, month, day) => {
  const date = new Date(year, month - 1, day);
  const isValid = date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  return isValid ? `${year}-${pad(month)}-${pad(day)}` : '';
};

const monthFromName = (name) => {
  const key = name
    .normalize('NFD')
    .replace(/[̀-ͯ.]/g, '')
    .toLowerCase();
  return MONTHS[key] || MONTHS[key.slice(0, 4)] || MONTHS[key.slice(0, 3)] || 0;
};

export function todayIso() {
  const now = new Date();
  return toIso(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

/** Accepte « 2026-10-12 », « 12 oct. 2026 » ou « 12/10/2026 » ; renvoie '' si la date est illisible. */
export function toIsoDate(value) {
  const text = String(value ?? '').trim();

  let match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    return toIso(Number(match[1]), Number(match[2]), Number(match[3]));
  }

  match = text.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
  if (match) {
    return toIso(Number(match[3]), Number(match[2]), Number(match[1]));
  }

  match = text.match(/^(\d{1,2})\s+([^\s\d]+)\s+(\d{4})$/);
  if (match) {
    const month = monthFromName(match[2]);
    return month ? toIso(Number(match[3]), month, Number(match[1])) : '';
  }

  return '';
}

/** « 2026-10-12 » → « 12 oct. 2026 ». Une valeur illisible est affichée telle quelle. */
export function formatDate(value) {
  const iso = toIsoDate(value);
  if (!iso) {
    return String(value ?? '');
  }
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

/** Clé de mois « YYYY-MM », ou '' si la date est illisible. */
export function monthKey(value) {
  return toIsoDate(value).slice(0, 7);
}

/** « 2026-10 » → « Octobre 2026 ». */
export function formatMonth(periodKey) {
  if (!periodKey || !/^\d{4}-\d{2}$/.test(periodKey)) {
    return periodKey || '';
  }
  const [year, month] = periodKey.split('-').map(Number);
  const label = new Date(year, month - 1, 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/** « 2026-10 » → « Oct ». */
export function formatMonthShort(periodKey) {
  const [year, month] = periodKey.split('-').map(Number);
  const label = new Date(year, month - 1, 1).toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '');
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/** Les `count` derniers mois, du plus ancien au mois de `from` inclus. */
export function lastMonthKeys(count, from = new Date()) {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(from.getFullYear(), from.getMonth() - (count - 1 - index), 1);
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
  });
}

/** Comparateur pour trier du plus récent au plus ancien ; les dates illisibles finissent en bas. */
export function compareIsoDesc(a, b) {
  return toIsoDate(b).localeCompare(toIsoDate(a));
}
