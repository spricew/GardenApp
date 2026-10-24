export function getTodayISO(): string {
  const now = new Date();
  return formatDateISO(now);
}

/** Capitalizes the first letter of a localized string ("sábado" → "Sábado"). */
export function capitalizeFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Day difference between two ISO dates (`to - from`).
 * Uses UTC day numbers so DST changes cannot produce 23/25-hour days.
 */
function getDayDifference(fromISO: string, toISO: string): number {
  const [fromYear, fromMonth, fromDay] = fromISO.split('-').map(Number);
  const [toYear, toMonth, toDay] = toISO.split('-').map(Number);
  const fromDayNumber = Date.UTC(fromYear, fromMonth - 1, fromDay);
  const toDayNumber = Date.UTC(toYear, toMonth - 1, toDay);
  return Math.round((toDayNumber - fromDayNumber) / 86_400_000);
}

/**
 * Relative label for agenda group headers.
 * Only the closest days get a label; older/future dates fall back to the
 * formatted calendar date.
 */
export function getRelativeDateLabel(
  dateStr: string,
  todayISO: string = getTodayISO()
): string | null {
  const difference = getDayDifference(todayISO, dateStr);

  if (difference === 0) return 'Hoy';
  if (difference === 1) return 'Mañana';
  if (difference === -1) return 'Ayer';
  return null;
}

/**
 * Long date for agenda section headers, e.g. "Sábado, 24 de octubre".
 * The year is included only when the date belongs to another year.
 */
export function formatAgendaDate(
  dateStr: string,
  todayISO: string = getTodayISO()
): string {
  const date = parseISODateLocal(dateStr);
  const currentYear = parseISODateLocal(todayISO).getFullYear();
  const formatted = date.toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    ...(date.getFullYear() !== currentYear ? { year: 'numeric' } : {}),
  });

  return capitalizeFirst(formatted);
}

export function formatDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** 24h time (HH:mm) used as the canonical storage format. */
export function formatTimeHHmm(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(
    date.getMinutes()
  ).padStart(2, '0')}`;
}

/**
 * Parses a `YYYY-MM-DD` string as a *local* date.
 * `new Date("2026-10-20")` would be UTC and can shift a day in negative
 * timezones, so we build the date from its parts explicitly.
 */
export function parseISODateLocal(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Converts a `HH:mm` string into a Date on today's calendar date.
 * Only the time part is meaningful; the date is a carrier for the picker.
 */
export function parseTimeToDate(timeStr: string): Date {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date();
  date.setHours(hours || 0, minutes || 0, 0, 0);
  return date;
}

/** Short localized date for form controls (e.g. "lun, 20 oct 2026"). */
export function formatDateForDisplay(date: Date): string {
  return date.toLocaleDateString('es-MX', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/** 12h time for form controls (e.g. "3:30 PM"). */
export function formatTimeForDisplay(date: Date): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
}

export function formatDateDisplay(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatTimeDisplay(timeStr: string | null): string {
  if (!timeStr) return 'Sin hora';
  const [hours, minutes] = timeStr.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
}

export function getMonthName(month: number): string {
  const date = new Date(2024, month - 1, 1);
  return date.toLocaleDateString('es-MX', { month: 'long' });
}

/**
 * Half-open date range (`>= start`, `< end`) for a month.
 * Range comparisons can use date indexes; `LIKE 'YYYY-MM%'` often cannot.
 */
export function getMonthRange(
  year: number,
  month: number
): { start: string; end: string } {
  const start = `${year}-${String(month).padStart(2, '0')}-01`;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const end = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;
  return { start, end };
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month - 1, 1).getDay();
}

export function combineDateAndTime(dateStr: string, timeStr: string | null): Date | null {
  if (!timeStr) return null;
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes, 0);
}
