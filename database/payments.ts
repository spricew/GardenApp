import type { SQLiteDatabase } from "expo-sqlite";

export interface PaymentDate {
  id: number;
  client_name: string;
  amount: number | null;
  estimated_date: string; // YYYY-MM-DD
  notes: string | null;
  is_paid: number; // 0 or 1
  created_at: string;
  updated_at: string;
}

export interface PaymentDateFormData {
  client_name: string;
  amount: number | null;
  estimated_date: string;
  notes: string;
}

export async function getAllPaymentDates(db: SQLiteDatabase): Promise<PaymentDate[]> {
  return await db.getAllAsync<PaymentDate>(
    `SELECT * FROM payment_dates ORDER BY estimated_date ASC;`
  );
}

export async function getPaymentDateById(db: SQLiteDatabase, id: number): Promise<PaymentDate | null> {
  return await db.getFirstAsync<PaymentDate>(
    `SELECT * FROM payment_dates WHERE id = ?;`,
    [id]
  );
}

export async function createPaymentDate(db: SQLiteDatabase, data: PaymentDateFormData): Promise<number> {
  const result = await db.runAsync(
    `INSERT INTO payment_dates (client_name, amount, estimated_date, notes) VALUES (?, ?, ?, ?);`,
    [data.client_name, data.amount, data.estimated_date, data.notes || null]
  );
  return result.lastInsertRowId;
}

export async function getPaymentDatesByDate(db: SQLiteDatabase, date: string): Promise<PaymentDate[]> {
  return await db.getAllAsync<PaymentDate>(
    `SELECT * FROM payment_dates WHERE estimated_date = ? ORDER BY id DESC;`,
    [date]
  );
}

export async function getPaymentDatesInMonth(db: SQLiteDatabase, year: number, month: number): Promise<string[]> {
  const monthStr = String(month).padStart(2, '0');
  const prefix = `${year}-${monthStr}`;
  const rows = await db.getAllAsync<{ estimated_date: string }>(
    `SELECT DISTINCT estimated_date FROM payment_dates WHERE estimated_date LIKE ?;`,
    [`${prefix}%`]
  );
  return rows.map((r) => r.estimated_date);
}

export async function togglePaymentPaid(db: SQLiteDatabase, id: number, isPaid: boolean): Promise<void> {
  await db.runAsync(
    `UPDATE payment_dates SET is_paid = ?, updated_at = datetime('now', 'localtime') WHERE id = ?;`,
    [isPaid ? 1 : 0, id]
  );
}

export async function deletePaymentDate(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync(`DELETE FROM payment_dates WHERE id = ?;`, [id]);
}

