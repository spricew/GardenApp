import type { SQLiteDatabase } from "expo-sqlite";
import type { PaymentDate, PaymentDateFormData, DatabaseResult } from "@/types";
import { createDatabaseResult } from "@/types";
import { getMonthRange } from "@/utils/dates";
import { getRepository } from "./repository";

export async function createPaymentDate(db: SQLiteDatabase, data: PaymentDateFormData): Promise<DatabaseResult<number>> {
  return getRepository(db).insert(
    `INSERT INTO payment_dates (client_name, amount, estimated_date, notes) VALUES (?, ?, ?, ?);`,
    [data.client_name, data.amount, data.estimated_date, data.notes || null],
    'Error al crear fecha de pago'
  );
}

export async function getPaymentDatesByDate(db: SQLiteDatabase, date: string): Promise<DatabaseResult<PaymentDate[]>> {
  return getRepository(db).all<PaymentDate>(
    `SELECT * FROM payment_dates WHERE estimated_date = ? ORDER BY id DESC;`,
    [date],
    'Error al obtener fechas de pago por fecha'
  );
}

export async function getPaymentDatesInMonth(db: SQLiteDatabase, year: number, month: number): Promise<DatabaseResult<string[]>> {
  const { start, end } = getMonthRange(year, month);
  const result = await getRepository(db).all<{ estimated_date: string }>(
    `SELECT DISTINCT estimated_date FROM payment_dates WHERE estimated_date >= ? AND estimated_date < ?;`,
    [start, end],
    'Error al obtener fechas de pago del mes'
  );

  if (!result.success) return { success: false, error: result.error };
  return createDatabaseResult((result.data ?? []).map((r) => r.estimated_date));
}

export async function togglePaymentPaid(db: SQLiteDatabase, id: number, isPaid: boolean): Promise<DatabaseResult<void>> {
  return getRepository(db).execute(
    `UPDATE payment_dates SET is_paid = ?, updated_at = datetime('now', 'localtime') WHERE id = ?;`,
    [isPaid ? 1 : 0, id],
    'Error al actualizar estado de pago'
  );
}

export async function deletePaymentDate(db: SQLiteDatabase, id: number): Promise<DatabaseResult<void>> {
  return getRepository(db).execute(
    `DELETE FROM payment_dates WHERE id = ?;`,
    [id],
    'Error al eliminar fecha de pago'
  );
}
