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
import {
  dbCacheKeys,
  invalidateDbCache,
  readDbCache,
  writeDbCache,
} from "@/utils/dbCache";

// ── Derived stat types ──────────────────────────────────────────────────────

export interface ServiceStats {
  total: number;
  byStatus: Record<ServiceStatus, number>;
  topClients: ClientCount[];
  topServices: NamedCount[];
}

export interface PaymentStats extends PaymentTotals {
  topClients: ClientTotal[];
}

export interface ExpenseStats extends ExpenseTotals {
  avgExpense: number;
  expenseByService: NamedTotal[];
  expenseByClient: ClientTotal[];
}

interface DashboardCacheData {
  serviceStats: ServiceStats;
  paymentStats: PaymentStats;
  expenseStats: ExpenseStats;
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
  const cacheKey = dbCacheKeys.dashboard(year, month);
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
        invalidateDbCache(cacheKey);
        setError(failure.error?.message ?? "Error al cargar estadísticas");
        return;
      }

      // Service stats
      const byStatus = createEmptyServiceStats().byStatus;
      for (const row of statusResult.data ?? []) {
        byStatus[row.status] = row.count;
      }

      const nextServiceStats: ServiceStats = {
        total: Object.values(byStatus).reduce((sum, count) => sum + count, 0),
        byStatus,
        topClients: serviceClientsResult.data ?? [],
        topServices: serviceTypesResult.data ?? [],
      };

      // Payment stats
      const nextPaymentStats: PaymentStats = {
        ...(paymentTotalsResult.data ?? EMPTY_PAYMENT_TOTALS),
        topClients: paymentClientsResult.data ?? [],
      };

      // Expense stats
      const totals = expenseTotalsResult.data ?? EMPTY_EXPENSE_TOTALS;
      const nextExpenseStats: ExpenseStats = {
        ...totals,
        avgExpense:
          totals.servicesWithExpense > 0
            ? totals.totalExpense / totals.servicesWithExpense
            : 0,
        expenseByService: expenseByServiceResult.data ?? [],
        expenseByClient: expenseByClientResult.data ?? [],
      };

      setServiceStats(nextServiceStats);
      setPaymentStats(nextPaymentStats);
      setExpenseStats(nextExpenseStats);
      writeDbCache<DashboardCacheData>(cacheKey, {
        serviceStats: nextServiceStats,
        paymentStats: nextPaymentStats,
        expenseStats: nextExpenseStats,
      });
    } catch {
      if (request !== requestId.current) return;
      invalidateDbCache(cacheKey);
      setError("Error inesperado al cargar estadísticas");
    } finally {
      if (request === requestId.current) {
        setLoading(false);
      }
    }
  }, [cacheKey, db, year, month]);

  useFocusEffect(
    useCallback(() => {
      const cached = readDbCache<DashboardCacheData>(cacheKey);
      if (cached) {
        requestId.current++;
        setServiceStats(cached.serviceStats);
        setPaymentStats(cached.paymentStats);
        setExpenseStats(cached.expenseStats);
        setLoading(false);
        setError(null);
        return () => {
          requestId.current++;
        };
      }

      void refresh();
      return () => {
        // Invalidate in-flight queries when the screen blurs or unmounts so a
        // previous month cannot overwrite the currently selected one.
        requestId.current++;
      };
    }, [cacheKey, refresh])
  );

  return { loading, serviceStats, paymentStats, expenseStats, refresh, error };
}
