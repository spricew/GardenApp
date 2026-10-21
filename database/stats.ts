import type { SQLiteDatabase } from "expo-sqlite";
import type {
  Service,
  PaymentDate,
  ServiceStatus,
  DatabaseResult,
} from "@/types";
import { createDatabaseResult } from "@/types";
import { getMonthRange } from "@/utils/dates";
import { getRepository } from "./repository";

// ── Aggregation result types ────────────────────────────────────────────────

export interface ServiceStatusCount {
  status: ServiceStatus;
  count: number;
}

export interface PaymentTotals {
  total: number;
  totalAmount: number;
  paidCount: number;
  unpaidCount: number;
  paidAmount: number;
  unpaidAmount: number;
}

export interface ClientCount {
  name: string;
  count: number;
}

export interface ClientTotal {
  name: string;
  total: number;
}

export interface ExpenseTotals {
  totalExpense: number;
  servicesWithExpense: number;
}

const EMPTY_PAYMENT_TOTALS: PaymentTotals = {
  total: 0,
  totalAmount: 0,
  paidCount: 0,
  unpaidCount: 0,
  paidAmount: 0,
  unpaidAmount: 0,
};

const EMPTY_EXPENSE_TOTALS: ExpenseTotals = {
  totalExpense: 0,
  servicesWithExpense: 0,
};

// ── Monthly services ────────────────────────────────────────────────────────

export async function getServicesInMonth(
  db: SQLiteDatabase,
  year: number,
  month: number
): Promise<DatabaseResult<Service[]>> {
  const { start, end } = getMonthRange(year, month);
  return getRepository(db).all<Service>(
    `SELECT * FROM services
     WHERE scheduled_date >= ? AND scheduled_date < ?
     ORDER BY scheduled_date ASC, scheduled_time ASC`,
    [start, end],
    "Error al obtener servicios del mes"
  );
}

/** Counts services grouped by status for the month (SQL aggregation). */
export async function getServiceStatusCounts(
  db: SQLiteDatabase,
  year: number,
  month: number
): Promise<DatabaseResult<ServiceStatusCount[]>> {
  const { start, end } = getMonthRange(year, month);
  return getRepository(db).all<ServiceStatusCount>(
    `SELECT status, COUNT(*) AS count
     FROM services
     WHERE scheduled_date >= ? AND scheduled_date < ?
     GROUP BY status`,
    [start, end],
    "Error al obtener conteo de servicios por estado"
  );
}

/** Top clients by number of services in the month. */
export async function getTopServiceClients(
  db: SQLiteDatabase,
  year: number,
  month: number,
  limit = 5
): Promise<DatabaseResult<ClientCount[]>> {
  const { start, end } = getMonthRange(year, month);
  return getRepository(db).all<ClientCount>(
    `SELECT client_name AS name, COUNT(*) AS count
     FROM services
     WHERE scheduled_date >= ? AND scheduled_date < ?
     GROUP BY client_name
     ORDER BY count DESC
     LIMIT ?`,
    [start, end, limit],
    "Error al obtener clientes frecuentes"
  );
}

/** Total expenses and number of services with an expense in the month. */
export async function getExpenseTotals(
  db: SQLiteDatabase,
  year: number,
  month: number
): Promise<DatabaseResult<ExpenseTotals>> {
  const { start, end } = getMonthRange(year, month);
  const result = await getRepository(db).first<ExpenseTotals>(
    `SELECT
       COALESCE(SUM(CASE WHEN expense > 0 THEN expense ELSE 0 END), 0) AS totalExpense,
       COALESCE(SUM(CASE WHEN expense > 0 THEN 1 ELSE 0 END), 0) AS servicesWithExpense
     FROM services
     WHERE scheduled_date >= ? AND scheduled_date < ?`,
    [start, end],
    "Error al obtener totales de gastos"
  );

  if (!result.success) return { success: false, error: result.error };
  return createDatabaseResult(result.data ?? { ...EMPTY_EXPENSE_TOTALS });
}

/** Top clients by accumulated expense in the month. */
export async function getExpenseByClient(
  db: SQLiteDatabase,
  year: number,
  month: number,
  limit = 5
): Promise<DatabaseResult<ClientTotal[]>> {
  const { start, end } = getMonthRange(year, month);
  return getRepository(db).all<ClientTotal>(
    `SELECT client_name AS name, COALESCE(SUM(expense), 0) AS total
     FROM services
     WHERE scheduled_date >= ? AND scheduled_date < ? AND expense > 0
     GROUP BY client_name
     ORDER BY total DESC
     LIMIT ?`,
    [start, end, limit],
    "Error al obtener gastos por cliente"
  );
}

// ── Monthly payments ────────────────────────────────────────────────────────

export async function getPaymentsInMonth(
  db: SQLiteDatabase,
  year: number,
  month: number
): Promise<DatabaseResult<PaymentDate[]>> {
  const { start, end } = getMonthRange(year, month);
  return getRepository(db).all<PaymentDate>(
    `SELECT * FROM payment_dates
     WHERE estimated_date >= ? AND estimated_date < ?
     ORDER BY estimated_date ASC`,
    [start, end],
    "Error al obtener pagos del mes"
  );
}

/** Payment totals for the month in a single aggregate query. */
export async function getPaymentTotals(
  db: SQLiteDatabase,
  year: number,
  month: number
): Promise<DatabaseResult<PaymentTotals>> {
  const { start, end } = getMonthRange(year, month);
  const result = await getRepository(db).first<PaymentTotals>(
    `SELECT
       COUNT(*) AS total,
       COALESCE(SUM(amount), 0) AS totalAmount,
       COALESCE(SUM(CASE WHEN is_paid = 1 THEN 1 ELSE 0 END), 0) AS paidCount,
       COALESCE(SUM(CASE WHEN is_paid = 0 THEN 1 ELSE 0 END), 0) AS unpaidCount,
       COALESCE(SUM(CASE WHEN is_paid = 1 THEN amount ELSE 0 END), 0) AS paidAmount,
       COALESCE(SUM(CASE WHEN is_paid = 0 THEN amount ELSE 0 END), 0) AS unpaidAmount
     FROM payment_dates
     WHERE estimated_date >= ? AND estimated_date < ?`,
    [start, end],
    "Error al obtener totales de pagos"
  );

  if (!result.success) return { success: false, error: result.error };
  return createDatabaseResult(result.data ?? { ...EMPTY_PAYMENT_TOTALS });
}

/** Top clients by collected amount in the month. */
export async function getTopPaymentClients(
  db: SQLiteDatabase,
  year: number,
  month: number,
  limit = 5
): Promise<DatabaseResult<ClientTotal[]>> {
  const { start, end } = getMonthRange(year, month);
  return getRepository(db).all<ClientTotal>(
    `SELECT client_name AS name, COALESCE(SUM(amount), 0) AS total
     FROM payment_dates
     WHERE estimated_date >= ? AND estimated_date < ?
     GROUP BY client_name
     ORDER BY total DESC
     LIMIT ?`,
    [start, end, limit],
    "Error al obtener clientes por monto"
  );
}
