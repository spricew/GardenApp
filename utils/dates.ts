export function getTodayISO(): string {
  const now = new Date();
  return formatDateISO(now);
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
