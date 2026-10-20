import type { SQLiteDatabase } from "expo-sqlite";
import * as Notifications from "expo-notifications";

interface LegacyRecurringServiceRow {
  id: number;
  notification_id: string | null;
}

/**
 * One-time cleanup for installs that used the removed biweekly recurring-service
 * feature. Cancels the reminders already scheduled for those auto-generated
 * services before deleting them, then drops the leftover recurring table.
 */
export async function cleanupLegacyRecurringServices(db: SQLiteDatabase): Promise<void> {
  try {
    const legacyServices = await db.getAllAsync<LegacyRecurringServiceRow>(
      'SELECT id, notification_id FROM services WHERE recurring_service_id IS NOT NULL'
    );

    for (const service of legacyServices) {
      if (!service.notification_id) continue;

      try {
        await Notifications.cancelScheduledNotificationAsync(service.notification_id);
      } catch {
        // The notification may have already fired or been cancelled — ignore.
      }
    }

    await db.runAsync('DELETE FROM services WHERE recurring_service_id IS NOT NULL');
  } catch {
    // Fresh installs no longer have the recurring_service_id column.
  }

  try {
    await db.execAsync('DROP TABLE IF EXISTS recurring_services');
  } catch {
    // Table already removed or still referenced — ignore.
  }
}
