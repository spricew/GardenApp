import { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import type { PaymentDate } from "@/types";
import * as paymentsDb from "@/database/payments";
import { getTodayISO } from "@/utils/dates";

export function usePayments(date?: string) {
  const db = useSQLiteContext();
  const [payments, setPayments] = useState<PaymentDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const targetDate = date || getTodayISO();

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await paymentsDb.getPaymentDatesByDate(db, targetDate);
      if (result.success && result.data) {
        setPayments(result.data);
      } else {
        setError(result.error?.message || 'Error al cargar cobros');
      }
    } catch (err) {
      setError('Error inesperado al cargar cobros');
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
    async (id: number, isPaid: boolean): Promise<boolean> => {
      try {
        const result = await paymentsDb.togglePaymentPaid(db, id, isPaid);
        if (!result.success) {
          setError(result.error?.message || 'Error al actualizar pago');
          return false;
        }
        await refresh();
        return true;
      } catch (err) {
        setError('Error inesperado al actualizar pago');
        return false;
      }
    },
    [db, refresh]
  );

  const removePayment = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        const result = await paymentsDb.deletePaymentDate(db, id);
        if (!result.success) {
          setError(result.error?.message || 'Error al eliminar cobro');
          return false;
        }
        await refresh();
        return true;
      } catch (err) {
        setError('Error inesperado al eliminar cobro');
        return false;
      }
    },
    [db, refresh]
  );

  return { payments, loading, error, refresh, togglePaid, removePayment };
}

export function usePaymentDates(year: number, month: number) {
  const db = useSQLiteContext();
  const [dates, setDates] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadDates = useCallback(async () => {
    try {
      const result = await paymentsDb.getPaymentDatesInMonth(db, year, month);
      if (result.success && result.data) {
        setDates(result.data);
      } else {
        setError(result.error?.message || 'Error al cargar fechas');
      }
    } catch (err) {
      setError('Error inesperado al cargar fechas');
    }
  }, [db, year, month]);

  useFocusEffect(useCallback(() => { loadDates(); }, [loadDates]));

  return { dates, error };
}
