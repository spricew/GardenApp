import type { SQLiteDatabase } from "expo-sqlite";
import type { PaymentDate, PaymentDateFormData, DatabaseResult } from "@/types";
import { createDatabaseResult, createDatabaseError } from "@/types";

export async function getAllPaymentDates(db: SQLiteDatabase): Promise<DatabaseResult<PaymentDate[]>> {
  try {
    const data = await db.getAllAsync<PaymentDate>(
      `SELECT * FROM payment_dates ORDER BY estimated_date ASC;`
    );
    return createDatabaseResult(data);
  } catch (error) {
    return createDatabaseError('DB_ERROR', 'Error al obtener fechas de pago', error);
  }
}

export async function getPaymentDateById(db: SQLiteDatabase, id: number): Promise<DatabaseResult<PaymentDate | null>> {
  try {
    const data = await db.getFirstAsync<PaymentDate>(
      `SELECT * FROM payment_dates WHERE id = ?;`,
      [id]
    );
    return createDatabaseResult(data);
  } catch (error) {
    return createDatabaseError('DB_ERROR', 'Error al obtener fecha de pago', error);
  }
}

export async function createPaymentDate(db: SQLiteDatabase, data: PaymentDateFormData): Promise<DatabaseResult<number>> {
  try {
    const result = await db.runAsync(
      `INSERT INTO payment_dates (client_name, amount, estimated_date, notes) VALUES (?, ?, ?, ?);`,
      [data.client_name, data.amount, data.estimated_date, data.notes || null]
    );
    return createDatabaseResult(result.lastInsertRowId);
  } catch (error) {
    return createDatabaseError('DB_ERROR', 'Error al crear fecha de pago', error);
  }
}

export async function getPaymentDatesByDate(db: SQLiteDatabase, date: string): Promise<DatabaseResult<PaymentDate[]>> {
  try {
    const data = await db.getAllAsync<PaymentDate>(
      `SELECT * FROM payment_dates WHERE estimated_date = ? ORDER BY id DESC;`,
      [date]
    );
    return createDatabaseResult(data);
  } catch (error) {
    return createDatabaseError('DB_ERROR', 'Error al obtener fechas de pago por fecha', error);
  }
}

export async function getPaymentDatesInMonth(db: SQLiteDatabase, year: number, month: number): Promise<DatabaseResult<string[]>> {
  try {
    const monthStr = String(month).padStart(2, '0');
    const prefix = `${year}-${monthStr}`;
    const rows = await db.getAllAsync<{ estimated_date: string }>(
      `SELECT DISTINCT estimated_date FROM payment_dates WHERE estimated_date LIKE ?;`,
      [`${prefix}%`]
    );
    return createDatabaseResult(rows.map((r) => r.estimated_date));
  } catch (error) {
    return createDatabaseError('DB_ERROR', 'Error al obtener fechas de pago del mes', error);
  }
}

export async function togglePaymentPaid(db: SQLiteDatabase, id: number, isPaid: boolean): Promise<DatabaseResult<void>> {
  try {
    await db.runAsync(
      `UPDATE payment_dates SET is_paid = ?, updated_at = datetime('now', 'localtime') WHERE id = ?;`,
      [isPaid ? 1 : 0, id]
    );
    return createDatabaseResult(undefined);
  } catch (error) {
    return createDatabaseError('DB_ERROR', 'Error al actualizar estado de pago', error);
  }
}

export async function deletePaymentDate(db: SQLiteDatabase, id: number): Promise<DatabaseResult<void>> {
  try {
    await db.runAsync(`DELETE FROM payment_dates WHERE id = ?;`, [id]);
    return createDatabaseResult(undefined);
  } catch (error) {
    return createDatabaseError('DB_ERROR', 'Error al eliminar fecha de pago', error);
  }
}

