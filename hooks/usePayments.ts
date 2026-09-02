import { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import type { PaymentDate } from "@/database/payments";
import * as paymentsDb from "@/database/payments";
import { getTodayISO } from "@/utils/dates";

export function usePayments(date?: string) {
  const db = useSQLiteContext();
  const [payments, setPayments] = useState<PaymentDate[]>([]);
  const [loading, setLoading] = useState(true);

  const targetDate = date || getTodayISO();

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const result = await paymentsDb.getPaymentDatesByDate(db, targetDate);
      setPayments(result);
    } catch (error) {
      console.error("Error loading payments:", error);
    } finally {
      setLoading(false);
    }
  }, [db, targetDate]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const togglePaid = useCallback(
    async (id: number, isPaid: boolean) => {
      await paymentsDb.togglePaymentPaid(db, id, isPaid);
      await refresh();
    },
    [db, refresh]
  );

  const removePayment = useCallback(
    async (id: number) => {
      await paymentsDb.deletePaymentDate(db, id);
      await refresh();
    },
    [db, refresh]
  );

  return { payments, loading, refresh, togglePaid, removePayment };
}

export function usePaymentDates(year: number, month: number) {
  const db = useSQLiteContext();
  const [dates, setDates] = useState<string[]>([]);

  const loadDates = useCallback(() => {
    paymentsDb.getPaymentDatesInMonth(db, year, month).then(setDates);
  }, [db, year, month]);

  useFocusEffect(loadDates);

  return dates;
}
