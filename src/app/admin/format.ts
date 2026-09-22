const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export type Year = {
  id: number;
  year: string | number;
  eventDate: string | null;
  backgroundImage?: string | null;
};

export type Trail = {
  id: number;
  yearId: number;
  title: string;
  description: string | null;
  distance: number | null;
  elevation: number | null;
  gpxFileUrl: string | null;
  type: 'hiking' | 'cycling' | string;
  participant_count: number | null;
};

export type Blaze = { key: string; hex: string; soft: string };

// Czech trail-blaze colours, assigned in order within a year (display only, not persisted).
export const BLAZES: Blaze[] = [
  { key: 'red', hex: '#d21f1f', soft: '#f5c9c9' },
  { key: 'blue', hex: '#1f5fd2', soft: '#c9d8f5' },
  { key: 'green', hex: '#1f9a3a', soft: '#c9ecd2' },
  { key: 'yellow', hex: '#e0b400', soft: '#f5ecc0' },
];

export const STAMPS = ['#f2c418', '#cfe3c0', '#f7c9b6', '#bfd9ee', '#e6dcf5'];

const wrap = (index: number, length: number) => ((index % length) + length) % length;

export const blazeAt = (index: number): Blaze => BLAZES[wrap(index, BLAZES.length)];
export const stampAt = (index: number) => STAMPS[wrap(index, STAMPS.length)];

export const parseDate = (iso?: string | null): Date | null => {
  if (!iso) return null;
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
};

export const toIsoDate = (date: Date) => {
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${mm}-${dd}`;
};

export const formatShort = (iso?: string | null) => {
  const date = parseDate(iso);
  return date ? `${date.getDate()} ${MONTHS[date.getMonth()].slice(0, 3)}` : '';
};

export const formatLong = (iso?: string | null) => {
  const date = parseDate(iso);
  return date ? `${date.getDate()} ${MONTHS[date.getMonth()].slice(0, 3)} ${date.getFullYear()}` : '';
};

export const formatWeekdayShort = (iso?: string | null) => {
  const date = parseDate(iso);
  return date ? `${WEEKDAYS[date.getDay()].slice(0, 3)} ${date.getDate()} ${MONTHS[date.getMonth()].slice(0, 3)} ${date.getFullYear()}` : '';
};

export const formatWeekday = (iso?: string | null) => {
  const date = parseDate(iso);
  return date ? `${WEEKDAYS[date.getDay()]} ${date.getDate()} ${MONTHS[date.getMonth()]}` : '';
};

const THIN_SPACE = ' ';

export const formatNumber = (value: number | null | undefined) => {
  if (value == null || Number.isNaN(value)) return '–';
  return Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, THIN_SPACE);
};

export const formatDistance = (value: number | null | undefined) => {
  if (value == null || Number.isNaN(value)) return '–';
  return (Math.round(value * 10) / 10).toString();
};

export const yearNumber = (year: Year) => Number(year.year);

export const sortYears = (list: Year[]) => [...list].sort((a, b) => yearNumber(b) - yearNumber(a));

export const sortTrails = (list: Trail[]) => [...list].sort((a, b) => {
  if (a.type !== b.type) return a.type === 'cycling' ? 1 : -1;
  return (a.distance ?? 0) - (b.distance ?? 0);
});

export const sumParticipants = (list: Trail[]) => list.reduce((sum, trail) => sum + (trail.participant_count ?? 0), 0);

export const typeLabel = (type: string) => type === 'cycling' ? 'Cycling' : 'Hiking';

// All Saturdays in May of the given year, as ISO dates.
export const saturdaysInMay = (year: number) => {
  const result: string[] = [];
  if (!year || year < 1970 || year > 9999) return result;
  for (let day = 1; day <= 31; day++) {
    const date = new Date(year, 4, day);
    if (date.getMonth() !== 4) break;
    if (date.getDay() === 6) result.push(toIsoDate(date));
  }
  return result;
};

export const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');
