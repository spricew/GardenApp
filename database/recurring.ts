import type { SQLiteDatabase } from 'expo-sqlite';
import type { RecurringService, Service } from "@/types";
import { formatDateISO } from "@/utils/dates";
import { scheduleServiceReminder } from "@/utils/notifications";

/**
 * Get all active recurring services.
 */
export async function getActiveRecurringServices(db: SQLiteDatabase): Promise<RecurringService[]> {
  return await db.getAllAsync<RecurringService>(
    'SELECT * FROM recurring_services WHERE is_active = 1'
  );
}

/**
 * Check if a service already exists for a given date + recurring_service_id.
 */
async function serviceExistsForDate(
  db: SQLiteDatabase,
  recurringId: number,
  date: string
): Promise<boolean> {
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM services WHERE recurring_service_id = ? AND scheduled_date = ?',
    [recurringId, date]
  );
  return (row?.count ?? 0) > 0;
}

/**
 * Calculate all occurrence dates for a recurring service within a date range.
 * Handles the "interval_weeks" pattern (e.g., every 2 weeks = 1 on, 1 off).
 */
function getOccurrences(recurring: RecurringService, untilDate: Date): string[] {
  const dates: string[] = [];
  const start = new Date(recurring.start_date + 'T00:00:00');
  const intervalMs = recurring.interval_weeks * 7 * 24 * 60 * 60 * 1000;

  let current = new Date(start);

  while (current <= untilDate) {
    if (current >= start) {
      dates.push(formatDateISO(current));
    }
    current = new Date(current.getTime() + intervalMs);
  }

  return dates;
}

/**
 * Generate individual service entries for all active recurring services.
 * Looks ahead `weeksAhead` weeks from today.
 */
export async function generateRecurringServices(
  db: SQLiteDatabase,
  weeksAhead: number = 26
): Promise<number> {
  const recurringServices = await getActiveRecurringServices(db);
  const untilDate = new Date();
  untilDate.setDate(untilDate.getDate() + weeksAhead * 7);

  let created = 0;

  for (const recurring of recurringServices) {
    const dates = getOccurrences(recurring, untilDate);

    for (const date of dates) {
      const exists = await serviceExistsForDate(db, recurring.id, date);
      if (!exists) {
        const result = await db.runAsync(
          `INSERT INTO services (client_name, address, description, scheduled_date, scheduled_time, notes, reminder_minutes, recurring_service_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            recurring.client_name,
            recurring.address,
            recurring.description,
            date,
            recurring.scheduled_time,
            recurring.notes,
            recurring.reminder_minutes,
            recurring.id,
          ]
        );
        
        // Schedule notification for the newly auto-generated service
        const newServiceId = result.lastInsertRowId;
        const newService = await db.getFirstAsync<Service>('SELECT * FROM services WHERE id = ?', [newServiceId]);
        
        if (newService) {
          const notifId = await scheduleServiceReminder(newService);
          if (notifId) {
            await db.runAsync('UPDATE services SET notification_id = ? WHERE id = ?', [notifId, newServiceId]);
          }
        }
        
        created++;
      }
    }
  }

  return created;
}

/**
 * Seed the "Don Alex" recurring service if it doesn't exist yet.
 * Pattern: every Saturday, biweekly (1 on, 1 off), starting 2026-08-29.
 * Reminder: 1 week before (10080 minutes).
 */
export async function seedDonAlex(db: SQLiteDatabase): Promise<void> {
  const existing = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM recurring_services WHERE client_name = 'Don Alex'"
  );

  if ((existing?.count ?? 0) > 0) return;

  await db.runAsync(
    `INSERT INTO recurring_services (client_name, description, day_of_week, interval_weeks, start_date, reminder_minutes)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      'Don Alex',
      'Corte de césped',
      6, // Saturday
      2, // Every 2 weeks (1 active, 1 inactive)
      '2026-08-29', // First Saturday
      10080, // 1 week = 7 * 24 * 60
    ]
  );
}

/**
 * Full initialization: seed + generate.
 * Call this on app startup after migrations.
 */
export async function initRecurringServices(db: SQLiteDatabase): Promise<void> {
  await seedDonAlex(db);
  await generateRecurringServices(db);
}
