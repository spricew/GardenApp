import { useCallback, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import type { ServiceStatus } from "@/types";
import {
  getExpenseByClient,
  getExpenseByServiceType,
  getExpenseTotals,
  getPaymentTotals,
  getServiceStatusCounts,
  getTopPaymentClients,
  getTopServiceClients,
  getTopServiceTypes,
} from "@/database/stats";
import type {
  ClientCount,
  ClientTotal,
  ExpenseTotals,
  NamedCount,
  NamedTotal,
  PaymentTotals,
} from "@/database/stats";

// ── Derived stat types ──────────────────────────────────────────────────────

interface ServiceStats {
  total: number;
  byStatus: Record<ServiceStatus, number>;
  topClients: ClientCount[];
  topServices: NamedCount[];
}

interface PaymentStats extends PaymentTotals {
  topClients: ClientTotal[];
}

interface ExpenseStats extends ExpenseTotals {
  avgExpense: number;
  expenseByService: NamedTotal[];
  expenseByClient: ClientTotal[];
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

function createEmptyServiceStats(): ServiceStats {
  return {
    total: 0,
    byStatus: {
      pending: 0,
      in_progress: 0,
      postponed: 0,
      done: 0,
      not_done: 0,
    },
    topClients: [],
    topServices: [],
  };
}

function createEmptyPaymentStats(): PaymentStats {
  return { ...EMPTY_PAYMENT_TOTALS, topClients: [] };
}

function createEmptyExpenseStats(): ExpenseStats {
  return {
    ...EMPTY_EXPENSE_TOTALS,
    avgExpense: 0,
    expenseByService: [],
    expenseByClient: [],
  };
}

// ── Hook ────────────────────────────────────────────────────────────────────

export function useDashboardStats(year: number, month: number) {
  const db = useSQLiteContext();
  const [serviceStats, setServiceStats] = useState<ServiceStats>(
    createEmptyServiceStats
  );
  const [paymentStats, setPaymentStats] = useState<PaymentStats>(
    createEmptyPaymentStats
  );
  const [expenseStats, setExpenseStats] = useState<ExpenseStats>(
    createEmptyExpenseStats
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const refresh = useCallback(async () => {
    const request = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const [
        statusResult,
        serviceClientsResult,
        serviceTypesResult,
        paymentTotalsResult,
        paymentClientsResult,
        expenseTotalsResult,
        expenseByClientResult,
        expenseByServiceResult,
      ] = await Promise.all([
        getServiceStatusCounts(db, year, month),
        getTopServiceClients(db, year, month),
        getTopServiceTypes(db, year, month),
        getPaymentTotals(db, year, month),
        getTopPaymentClients(db, year, month),
        getExpenseTotals(db, year, month),
        getExpenseByClient(db, year, month),
        getExpenseByServiceType(db, year, month),
      ]);

      if (request !== requestId.current) return;

      const failure = [
        statusResult,
        serviceClientsResult,
        serviceTypesResult,
        paymentTotalsResult,
        paymentClientsResult,
        expenseTotalsResult,
        expenseByClientResult,
        expenseByServiceResult,
      ].find((result) => !result.success);

      if (failure) {
        setError(failure.error?.message ?? "Error al cargar estadísticas");
        return;
      }

      // Service stats
      const byStatus = createEmptyServiceStats().byStatus;
      for (const row of statusResult.data ?? []) {
        byStatus[row.status] = row.count;
      }

      setServiceStats({
        total: Object.values(byStatus).reduce((sum, count) => sum + count, 0),
        byStatus,
        topClients: serviceClientsResult.data ?? [],
        topServices: serviceTypesResult.data ?? [],
      });

      // Payment stats
      setPaymentStats({
        ...(paymentTotalsResult.data ?? EMPTY_PAYMENT_TOTALS),
        topClients: paymentClientsResult.data ?? [],
      });

      // Expense stats
      const totals = expenseTotalsResult.data ?? EMPTY_EXPENSE_TOTALS;
      setExpenseStats({
        ...totals,
        avgExpense:
          totals.servicesWithExpense > 0
            ? totals.totalExpense / totals.servicesWithExpense
            : 0,
        expenseByService: expenseByServiceResult.data ?? [],
        expenseByClient: expenseByClientResult.data ?? [],
      });
    } catch {
      if (request !== requestId.current) return;
      setError("Error inesperado al cargar estadísticas");
    } finally {
      if (request === requestId.current) {
        setLoading(false);
      }
    }
  }, [db, year, month]);

  useFocusEffect(
    useCallback(() => {
      refresh();
      return () => {
        // Invalidate in-flight queries when the screen blurs or unmounts so a
        // previous month cannot overwrite the currently selected one.
        requestId.current++;
      };
    }, [refresh])
  );

  return { loading, serviceStats, paymentStats, expenseStats, refresh, error };
}
