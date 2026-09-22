// Czech date and plural helpers for the public site.

const MONTHS_GENITIVE = ['ledna', 'února', 'března', 'dubna', 'května', 'června', 'července', 'srpna', 'září', 'října', 'listopadu', 'prosince'];
const WEEKDAYS = ['Neděle', 'Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota'];

const parse = (iso?: string | null): Date | null => {
  if (!iso) return null;
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
};

// "23. května 2026"
export const formatCsDate = (iso?: string | null) => {
  const date = parse(iso);
  return date ? `${date.getDate()}. ${MONTHS_GENITIVE[date.getMonth()]} ${date.getFullYear()}` : '';
};

// "Sobota"
export const formatCsWeekday = (iso?: string | null) => {
  const date = parse(iso);
  return date ? WEEKDAYS[date.getDay()] : '';
};

export const pluralCs = (count: number, one: string, few: string, many: string) => {
  if (count === 1) return one;
  if (count >= 2 && count <= 4) return few;
  return many;
};

export const trailsLabel = (count: number) => `${count} ${pluralCs(count, 'trasa', 'trasy', 'tras')}`;
export const participantsLabel = (count: number) => `${formatCsNumber(count)} ${pluralCs(count, 'účastník', 'účastníci', 'účastníků')}`;

export const formatCsNumber = (value: number) => Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
