import { useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import type { SQLiteDatabase } from "expo-sqlite";
import type { DatabaseResult, PaymentDate } from "@/types";
import * as paymentsDb from "@/database/payments";
import {
  dbCacheKeys,
  invalidatePaymentDataCache,
} from "@/utils/dbCache";
import { getTodayISO } from "@/utils/dates";
import { useCrud } from "./useCrud";
import { useListData } from "./useListData";
import { useMonthDates } from "./useMonthDates";

export function usePayments(date?: string) {
  const db = useSQLiteContext();
  const targetDate = date || getTodayISO();

  const load = useCallback(
    (database: SQLiteDatabase): Promise<DatabaseResult<PaymentDate[]>> =>
      paymentsDb.getPaymentDatesByDate(database, targetDate),
    [targetDate]
  );

  const {
    data: payments,
    loading,
    error: loadError,
    refresh,
  } = useListData<PaymentDate>(load, "Error al cargar cobros", {
    cacheKey: dbCacheKeys.paymentsByDate(targetDate),
  });

  const { error: mutationError, reset: resetMutationError, run } = useCrud();

  // A list reload owns the current state, so a mutation error from a previous
  // visit should not linger after the screen regains focus.
  useFocusEffect(
    useCallback(() => {
      resetMutationError();
    }, [resetMutationError])
  );

  const togglePaid = useCallback(
    async (id: number, isPaid: boolean): Promise<boolean> => {
      const result = await run(
        async () => {
          const mutation = await paymentsDb.togglePaymentPaid(
            db,
            id,
            isPaid
          );
          if (mutation.success) {
            invalidatePaymentDataCache();
          }
          return mutation;
        },
        {
          errorMessage: "Error al actualizar pago",
          invalidate: refresh,
        }
      );
      return result.success;
    },
    [db, refresh, run]
  );

  const removePayment = useCallback(
    async (id: number): Promise<boolean> => {
      const result = await run(
        async () => {
          const mutation = await paymentsDb.deletePaymentDate(db, id);
          if (mutation.success) {
            invalidatePaymentDataCache();
          }
          return mutation;
        },
        {
          errorMessage: "Error al eliminar cobro",
          invalidate: refresh,
        }
      );
      return result.success;
    },
    [db, refresh, run]
  );

  return {
    payments,
    loading,
    error: loadError ?? mutationError,
    refresh,
    togglePaid,
    removePayment,
  };
}

export function usePaymentDates(year: number, month: number) {
  const load = useCallback(
    (db: SQLiteDatabase): Promise<DatabaseResult<string[]>> =>
      paymentsDb.getPaymentDatesInMonth(db, year, month),
    [year, month]
  );

  const { dates, error, refresh } = useMonthDates(
    load,
    "Error al cargar fechas",
    dbCacheKeys.paymentDatesByMonth(year, month)
  );

  return { dates, error, refresh };
}
