import type { SQLiteDatabase } from 'expo-sqlite';
import type { Service, ServiceFormData, ServiceStatus, DatabaseResult } from "@/types";
import { createDatabaseResult, createDatabaseError } from "@/types";

export async function getAllServices(db: SQLiteDatabase): Promise<DatabaseResult<Service[]>> {
  try {
    const data = await db.getAllAsync<Service>('SELECT * FROM services ORDER BY scheduled_date ASC, scheduled_time ASC');
    return createDatabaseResult(data);
  } catch (error) {
    return createDatabaseError('DB_ERROR', 'Error al obtener servicios', error);
  }
}

export async function getServicesByDate(db: SQLiteDatabase, date: string): Promise<DatabaseResult<Service[]>> {
  try {
    const data = await db.getAllAsync<Service>(
      'SELECT * FROM services WHERE scheduled_date = ? ORDER BY scheduled_time ASC',
      [date]
    );
    return createDatabaseResult(data);
  } catch (error) {
    return createDatabaseError('DB_ERROR', 'Error al obtener servicios por fecha', error);
  }
}

export async function getServiceById(db: SQLiteDatabase, id: number): Promise<DatabaseResult<Service | null>> {
  try {
    const data = await db.getFirstAsync<Service>('SELECT * FROM services WHERE id = ?', [id]);
    return createDatabaseResult(data);
  } catch (error) {
    return createDatabaseError('DB_ERROR', 'Error al obtener servicio', error);
  }
}

export async function createService(db: SQLiteDatabase, data: ServiceFormData): Promise<DatabaseResult<number>> {
  try {
    const result = await db.runAsync(
      `INSERT INTO services (client_name, address, description, scheduled_date, scheduled_time, notes, reminder_minutes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        data.client_name,
        data.address || null,
        data.description || null,
        data.scheduled_date,
        data.scheduled_time || null,
        data.notes || null,
        data.reminder_minutes,
      ]
    );
    return createDatabaseResult(result.lastInsertRowId);
  } catch (error) {
    return createDatabaseError('DB_ERROR', 'Error al crear servicio', error);
  }
}

export async function updateServiceStatus(db: SQLiteDatabase, id: number, status: ServiceStatus): Promise<DatabaseResult<void>> {
  try {
    await db.runAsync(
      "UPDATE services SET status = ?, updated_at = datetime('now', 'localtime') WHERE id = ?",
      [status, id]
    );
    return createDatabaseResult(undefined);
  } catch (error) {
    return createDatabaseError('DB_ERROR', 'Error al actualizar estado del servicio', error);
  }
}

export async function updateService(db: SQLiteDatabase, id: number, data: Partial<ServiceFormData>): Promise<DatabaseResult<void>> {
  try {
    const fields: string[] = [];
    const values: (string | number | null)[] = [];

    if (data.client_name !== undefined) { fields.push('client_name = ?'); values.push(data.client_name); }
    if (data.address !== undefined) { fields.push('address = ?'); values.push(data.address || null); }
    if (data.description !== undefined) { fields.push('description = ?'); values.push(data.description || null); }
    if (data.scheduled_date !== undefined) { fields.push('scheduled_date = ?'); values.push(data.scheduled_date); }
    if (data.scheduled_time !== undefined) { fields.push('scheduled_time = ?'); values.push(data.scheduled_time || null); }
    if (data.notes !== undefined) { fields.push('notes = ?'); values.push(data.notes || null); }
    if (data.reminder_minutes !== undefined) { fields.push('reminder_minutes = ?'); values.push(data.reminder_minutes); }

    if (fields.length === 0) return createDatabaseResult(undefined);

    fields.push("updated_at = datetime('now', 'localtime')");
    values.push(id);

    await db.runAsync(`UPDATE services SET ${fields.join(', ')} WHERE id = ?`, values);
    return createDatabaseResult(undefined);
  } catch (error) {
    return createDatabaseError('DB_ERROR', 'Error al actualizar servicio', error);
  }
}

export async function updateServiceNotificationId(db: SQLiteDatabase, id: number, notificationId: string | null): Promise<DatabaseResult<void>> {
  try {
    await db.runAsync('UPDATE services SET notification_id = ? WHERE id = ?', [notificationId, id]);
    return createDatabaseResult(undefined);
  } catch (error) {
    return createDatabaseError('DB_ERROR', 'Error al actualizar notificación del servicio', error);
  }
}

export async function deleteService(db: SQLiteDatabase, id: number): Promise<DatabaseResult<void>> {
  try {
    await db.runAsync('DELETE FROM services WHERE id = ?', [id]);
    return createDatabaseResult(undefined);
  } catch (error) {
    return createDatabaseError('DB_ERROR', 'Error al eliminar servicio', error);
  }
}

export async function getServiceDatesInMonth(db: SQLiteDatabase, year: number, month: number): Promise<DatabaseResult<string[]>> {
  try {
    const monthStr = String(month).padStart(2, '0');
    const prefix = `${year}-${monthStr}`;
    const rows = await db.getAllAsync<{ scheduled_date: string }>(
      'SELECT DISTINCT scheduled_date FROM services WHERE scheduled_date LIKE ?',
      [`${prefix}%`]
    );
    return createDatabaseResult(rows.map((r) => r.scheduled_date));
  } catch (error) {
    return createDatabaseError('DB_ERROR', 'Error al obtener fechas de servicios', error);
  }
}
