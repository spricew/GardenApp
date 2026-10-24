import type { SQLiteDatabase } from 'expo-sqlite';
import type { Service, ServiceFormData, ServiceStatus, DatabaseResult } from "@/types";
import { createDatabaseResult, createDatabaseError } from "@/types";
import { getMonthRange } from "@/utils/dates";
import { getRepository } from "./repository";

/**
 * Every scheduled service, ordered by date and time.
 *
 * The home agenda loads the full set once and groups it by date in memory, so
 * switching status filters or expanding the history does not hit the database
 * again. `scheduled_time IS NULL` keeps services without a time at the end of
 * their day instead of before the first timed service.
 */
export async function getAllServices(db: SQLiteDatabase): Promise<DatabaseResult<Service[]>> {
  return getRepository(db).all<Service>(
    `SELECT * FROM services
     ORDER BY scheduled_date ASC, scheduled_time IS NULL ASC, scheduled_time ASC`,
    [],
    'Error al obtener todos los servicios'
  );
}

export async function getServicesByDate(db: SQLiteDatabase, date: string): Promise<DatabaseResult<Service[]>> {
  return getRepository(db).all<Service>(
    'SELECT * FROM services WHERE scheduled_date = ? ORDER BY scheduled_time ASC',
    [date],
    'Error al obtener servicios por fecha'
  );
}

export async function getServiceById(db: SQLiteDatabase, id: number): Promise<DatabaseResult<Service | null>> {
  return getRepository(db).first<Service>(
    'SELECT * FROM services WHERE id = ?',
    [id],
    'Error al obtener servicio'
  );
}

export async function createService(db: SQLiteDatabase, data: ServiceFormData): Promise<DatabaseResult<number>> {
  return getRepository(db).insert(
    `INSERT INTO services (client_name, address, description, scheduled_date, scheduled_time, notes, reminder_minutes, expense)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.client_name,
      data.address || null,
      data.description || null,
      data.scheduled_date,
      data.scheduled_time || null,
      data.notes || null,
      data.reminder_minutes,
      data.expense !== undefined ? data.expense : null,
    ],
    'Error al crear servicio'
  );
}

export async function updateServiceStatus(db: SQLiteDatabase, id: number, status: ServiceStatus): Promise<DatabaseResult<void>> {
  return getRepository(db).execute(
    "UPDATE services SET status = ?, updated_at = datetime('now', 'localtime') WHERE id = ?",
    [status, id],
    'Error al actualizar estado del servicio'
  );
}

export async function updateService(db: SQLiteDatabase, id: number, data: Partial<ServiceFormData>): Promise<DatabaseResult<void>> {
  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  if (data.client_name !== undefined) { fields.push('client_name = ?'); values.push(data.client_name); }
  if (data.address !== undefined) { fields.push('address = ?'); values.push(data.address || null); }
  if (data.description !== undefined) { fields.push('description = ?'); values.push(data.description || null); }
  if (data.scheduled_date !== undefined) { fields.push('scheduled_date = ?'); values.push(data.scheduled_date); }
  if (data.scheduled_time !== undefined) { fields.push('scheduled_time = ?'); values.push(data.scheduled_time || null); }
  if (data.notes !== undefined) { fields.push('notes = ?'); values.push(data.notes || null); }
  if (data.reminder_minutes !== undefined) { fields.push('reminder_minutes = ?'); values.push(data.reminder_minutes); }
  if (data.expense !== undefined) { fields.push('expense = ?'); values.push(data.expense !== null ? data.expense : null); }

  if (fields.length === 0) return createDatabaseResult(undefined);

  fields.push("updated_at = datetime('now', 'localtime')");
  values.push(id);

  return getRepository(db).execute(
    `UPDATE services SET ${fields.join(', ')} WHERE id = ?`,
    values,
    'Error al actualizar servicio'
  );
}

export async function updateServiceNotificationId(db: SQLiteDatabase, id: number, notificationId: string | null): Promise<DatabaseResult<void>> {
  return getRepository(db).execute(
    'UPDATE services SET notification_id = ? WHERE id = ?',
    [notificationId, id],
    'Error al actualizar notificación del servicio'
  );
}

export async function deleteService(db: SQLiteDatabase, id: number): Promise<DatabaseResult<void>> {
  return getRepository(db).execute(
    'DELETE FROM services WHERE id = ?',
    [id],
    'Error al eliminar servicio'
  );
}

export async function getServiceDatesInMonth(db: SQLiteDatabase, year: number, month: number): Promise<DatabaseResult<string[]>> {
  const { start, end } = getMonthRange(year, month);
  const result = await getRepository(db).all<{ scheduled_date: string }>(
    'SELECT DISTINCT scheduled_date FROM services WHERE scheduled_date >= ? AND scheduled_date < ?',
    [start, end],
    'Error al obtener fechas de servicios'
  );

  if (!result.success) return { success: false, error: result.error };
  return createDatabaseResult((result.data ?? []).map((r) => r.scheduled_date));
}

/**
 * Postpones a service: marks the original as 'postponed' and creates a new
 * clone with the given scheduled date (and optional time).
 * Both writes run in one transaction so a failed insert cannot leave the
 * original marked as postponed without its replacement.
 * Returns the ID of the newly created service.
 */
export async function postponeService(
  db: SQLiteDatabase,
  originalId: number,
  newDate: string,
  newTime?: string | null
): Promise<DatabaseResult<number>> {
  const repo = getRepository(db);

  const originalResult = await repo.first<Service>(
    'SELECT * FROM services WHERE id = ?',
    [originalId],
    'Error al posponer servicio'
  );
  if (!originalResult.success) return { success: false, error: originalResult.error };

  const original = originalResult.data;
  if (!original) {
    return createDatabaseError('NOT_FOUND', 'Servicio original no encontrado');
  }

  return repo.transaction(async (tx) => {
    // Mark original as postponed
    await tx.runAsync(
      "UPDATE services SET status = 'postponed', updated_at = datetime('now', 'localtime') WHERE id = ?",
      [originalId]
    );

    // Clone into a new pending service with the new date/time
    const insert = await tx.runAsync(
      `INSERT INTO services
         (client_name, address, description, scheduled_date, scheduled_time, notes, reminder_minutes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        original.client_name,
        original.address ?? null,
        original.description ?? null,
        newDate,
        newTime ?? original.scheduled_time ?? null,
        original.notes ?? null,
        original.reminder_minutes,
      ]
    );

    return insert.lastInsertRowId;
  }, 'Error al posponer servicio');
}
