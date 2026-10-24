import type { Service, ServiceStatus } from '@/types';
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

export interface ServiceDateGroup {
  /** ISO date (`YYYY-MM-DD`) shared by every service in the group. */
  date: string;
  services: Service[];
}

export interface ServiceAgenda {
  /** Today and future dates, ascending. */
  upcoming: ServiceDateGroup[];
  /** Dates before today, descending (most recent first). */
  past: ServiceDateGroup[];
}

/** Keeps the agenda order stable even if the caller passes unsorted rows. */
function compareServicesByDateAndTime(a: Service, b: Service): number {
  if (a.scheduled_date !== b.scheduled_date) {
    return a.scheduled_date.localeCompare(b.scheduled_date);
  }

  // Services without a time belong to the end of the day.
  const timeA = a.scheduled_time ?? '99:99';
  const timeB = b.scheduled_time ?? '99:99';
  return timeA.localeCompare(timeB);
}

/**
 * Groups services by their scheduled date, preserving ascending date/time
 * order inside each group.
 */
export function groupServicesByDate(
  services: readonly Service[]
): ServiceDateGroup[] {
  const ordered = [...services].sort(compareServicesByDateAndTime);
  const groups: ServiceDateGroup[] = [];

  for (const service of ordered) {
    const currentGroup = groups[groups.length - 1];
    if (currentGroup && currentGroup.date === service.scheduled_date) {
      currentGroup.services.push(service);
    } else {
      groups.push({ date: service.scheduled_date, services: [service] });
    }
  }

  return groups;
}

/**
 * Splits a service list into the two halves the agenda home screen renders:
 * upcoming dates (today included) and past dates.
 */
export function splitServiceAgenda(
  services: readonly Service[],
  todayISO: string = getTodayISO()
): ServiceAgenda {
  const upcoming: ServiceDateGroup[] = [];
  const past: ServiceDateGroup[] = [];

  for (const group of groupServicesByDate(services)) {
    if (group.date >= todayISO) {
      upcoming.push(group);
    } else {
      past.push(group);
    }
  }

  // Past dates read better from the most recent one backwards.
  past.reverse();

  return { upcoming, past };
}

/** Applies the status chip selection without touching the database. */
export function filterServicesByStatus(
  services: readonly Service[],
  status: ServiceStatus | 'all'
): Service[] {
  if (status === 'all') return [...services];
  return services.filter((service) => service.status === status);
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
