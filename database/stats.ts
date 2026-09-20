import type { SQLiteDatabase } from "expo-sqlite";
import type { Service, PaymentDate, DatabaseResult } from "@/types";
import { createDatabaseResult, createDatabaseError } from "@/types";

// ── Monthly services ────────────────────────────────────────────────────────

export async function getServicesInMonth(
  db: SQLiteDatabase,
  year: number,
  month: number
): Promise<DatabaseResult<Service[]>> {
  try {
    const prefix = `${year}-${String(month).padStart(2, "0")}`;
    const data = await db.getAllAsync<Service>(
      `SELECT * FROM services WHERE scheduled_date LIKE ? ORDER BY scheduled_date ASC, scheduled_time ASC`,
      [`${prefix}%`]
    );
    return createDatabaseResult(data);
  } catch (error) {
    return createDatabaseError("DB_ERROR", "Error al obtener servicios del mes", error);
  }
}

// ── Monthly payments ────────────────────────────────────────────────────────

export async function getPaymentsInMonth(
  db: SQLiteDatabase,
  year: number,
  month: number
): Promise<DatabaseResult<PaymentDate[]>> {
  try {
    const prefix = `${year}-${String(month).padStart(2, "0")}`;
    const data = await db.getAllAsync<PaymentDate>(
      `SELECT * FROM payment_dates WHERE estimated_date LIKE ? ORDER BY estimated_date ASC`,
      [`${prefix}%`]
    );
    return createDatabaseResult(data);
  } catch (error) {
    return createDatabaseError("DB_ERROR", "Error al obtener pagos del mes", error);
  }
}
