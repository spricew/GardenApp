import type { ServiceStatus } from '@/types';
import { formatDateISO, getTodayISO, parseISODateLocal } from '@/utils/dates';

/**
 * Valid status transitions for the service detail screen.
 *
 * Kept out of the screen so the graph can be reused by the action menu and
 * tested independently from the presentation layer.
 */
export const STATUS_TRANSITIONS: Record<
  ServiceStatus,
  readonly ServiceStatus[]
> = {
  pending: ['in_progress', 'postponed', 'not_done'],
  in_progress: ['done', 'postponed', 'not_done'],
  postponed: ['pending', 'in_progress', 'not_done'],
  done: ['pending'],
  not_done: ['pending', 'postponed'],
};

/** Returns the statuses a service can transition to from its current one. */
export function getStatusTransitions(
  status: ServiceStatus
): readonly ServiceStatus[] {
  return STATUS_TRANSITIONS[status] ?? [];
}

/** Human-readable reminder lead time used by the service detail screen. */
export function formatReminderDisplay(minutes: number): string {
  if (!minutes || minutes <= 0) {
    return 'Sin recordatorio';
  }

  if (minutes < 60) {
    return `${minutes} minuto(s) antes`;
  }

  if (minutes < 1440) {
    const hours = Math.round(minutes / 60);
    return `${hours} hora${hours > 1 ? 's' : ''} antes`;
  }

  if (minutes === 10080) {
    return '1 semana antes';
  }

  const days = Math.round(minutes / 1440);
  return `${days} día${days > 1 ? 's' : ''} antes`;
}

/** Adds whole days to a `YYYY-MM-DD` string without timezone shifts. */
export function addDaysToISO(date: string, days: number): string {
  const dateObj = parseISODateLocal(date);
  dateObj.setDate(dateObj.getDate() + days);
  return formatDateISO(dateObj);
}

/**
 * Bounds for postponing a service.
 *
 * The new date must be after the original service and cannot be in the past,
 * so both the default and the minimum date use the later of those limits.
 */
export function getPostponeDateBounds(
  scheduledDate: string,
  todayISO: string = getTodayISO()
): { defaultDate: string; minDate: string } {
  const dayAfterService = addDaysToISO(scheduledDate, 1);
  const minDate = dayAfterService > todayISO ? dayAfterService : todayISO;

  return { defaultDate: minDate, minDate };
}
