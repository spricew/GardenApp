import { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import type { Service, PaymentDate, ServiceStatus } from "@/types";
import { getServicesInMonth, getPaymentsInMonth } from "@/database/stats";

// ── Derived stat types ──────────────────────────────────────────────────────

export interface ServiceStats {
  total: number;
  byStatus: Record<ServiceStatus, number>;
  totalExpense: number;
  avgExpense: number;
  servicesWithExpense: number;
  topClients: { name: string; count: number }[];
  topServices: { name: string; count: number }[];
}

export interface PaymentStats {
  total: number;
  totalAmount: number;
  paidCount: number;
  unpaidCount: number;
  paidAmount: number;
  unpaidAmount: number;
  topClients: { name: string; total: number }[];
}

export interface ExpenseStats {
  totalExpense: number;
  servicesWithExpense: number;
  avgExpense: number;
  expenseByService: { name: string; total: number }[];
  expenseByClient: { name: string; total: number }[];
}

// ── Hook ────────────────────────────────────────────────────────────────────

export function useDashboardStats(year: number, month: number) {
  const db = useSQLiteContext();
  const [services, setServices] = useState<Service[]>([]);
  const [payments, setPayments] = useState<PaymentDate[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [sResult, pResult] = await Promise.all([
        getServicesInMonth(db, year, month),
        getPaymentsInMonth(db, year, month),
      ]);
      if (sResult.success && sResult.data) setServices(sResult.data);
      if (pResult.success && pResult.data) setPayments(pResult.data);
    } catch {
      // Error handled by empty state
    } finally {
      setLoading(false);
    }
  }, [db, year, month]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  // ── Compute service stats ───────────────────────────────────────────────

  const serviceStats: ServiceStats = (() => {
    const byStatus: Record<ServiceStatus, number> = {
      pending: 0,
      in_progress: 0,
      postponed: 0,
      done: 0,
      not_done: 0,
    };
    let totalExpense = 0;
    let servicesWithExpense = 0;
    const clientMap = new Map<string, number>();
    const serviceMap = new Map<string, number>();

    for (const s of services) {
      byStatus[s.status]++;
      if (s.expense !== null && s.expense > 0) {
        totalExpense += s.expense;
        servicesWithExpense++;
      }
      clientMap.set(s.client_name, (clientMap.get(s.client_name) || 0) + 1);
      if (s.description) {
        const names = s.description.split(",").map((n) => n.trim()).filter(Boolean);
        for (const name of names) {
          serviceMap.set(name, (serviceMap.get(name) || 0) + 1);
        }
      }
    }

    const topClients = [...clientMap.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const topServices = [...serviceMap.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      total: services.length,
      byStatus,
      totalExpense,
      avgExpense: servicesWithExpense > 0 ? totalExpense / servicesWithExpense : 0,
      servicesWithExpense,
      topClients,
      topServices,
    };
  })();

  // ── Compute payment stats ───────────────────────────────────────────────

  const paymentStats: PaymentStats = (() => {
    let totalAmount = 0;
    let paidCount = 0;
    let unpaidCount = 0;
    let paidAmount = 0;
    let unpaidAmount = 0;
    const clientMap = new Map<string, number>();

    for (const p of payments) {
      const amt = p.amount ?? 0;
      totalAmount += amt;
      if (p.is_paid) {
        paidCount++;
        paidAmount += amt;
      } else {
        unpaidCount++;
        unpaidAmount += amt;
      }
      clientMap.set(p.client_name, (clientMap.get(p.client_name) || 0) + amt);
    }

    const topClients = [...clientMap.entries()]
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    return {
      total: payments.length,
      totalAmount,
      paidCount,
      unpaidCount,
      paidAmount,
      unpaidAmount,
      topClients,
    };
  })();

  // ── Compute expense stats ───────────────────────────────────────────────

  const expenseStats: ExpenseStats = (() => {
    let totalExpense = 0;
    let servicesWithExpense = 0;
    const serviceMap = new Map<string, number>();
    const clientMap = new Map<string, number>();

    for (const s of services) {
      if (s.expense !== null && s.expense > 0) {
        totalExpense += s.expense;
        servicesWithExpense++;

        clientMap.set(s.client_name, (clientMap.get(s.client_name) || 0) + s.expense);

        if (s.description) {
          const names = s.description.split(",").map((n) => n.trim()).filter(Boolean);
          const perService = s.expense / names.length;
          for (const name of names) {
            serviceMap.set(name, (serviceMap.get(name) || 0) + perService);
          }
        }
      }
    }

    const expenseByService = [...serviceMap.entries()]
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    const expenseByClient = [...clientMap.entries()]
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    return {
      totalExpense,
      servicesWithExpense,
      avgExpense: servicesWithExpense > 0 ? totalExpense / servicesWithExpense : 0,
      expenseByService,
      expenseByClient,
    };
  })();

  return { loading, serviceStats, paymentStats, expenseStats, refresh };
}
