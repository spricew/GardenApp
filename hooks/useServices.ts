import { useCallback } from "react";
import type { SQLiteDatabase } from "expo-sqlite";
import type { DatabaseResult, Service } from "@/types";
import * as servicesDb from "@/database/services";
import { getTodayISO } from "@/utils/dates";
import { useListData } from "./useListData";
import { useMonthDates } from "./useMonthDates";

export function useServices(date?: string) {
  const targetDate = date || getTodayISO();

  const load = useCallback(
    (db: SQLiteDatabase): Promise<DatabaseResult<Service[]>> =>
      servicesDb.getServicesByDate(db, targetDate),
    [targetDate]
  );

  const { data: services, loading, error, refresh } = useListData<Service>(
    load,
    "Error al cargar servicios"
  );

  return { services, loading, error, refresh };
}

export function useServiceDates(year: number, month: number) {
  const load = useCallback(
    (db: SQLiteDatabase): Promise<DatabaseResult<string[]>> =>
      servicesDb.getServiceDatesInMonth(db, year, month),
    [year, month]
  );

  const { dates, error } = useMonthDates(load, "Error al cargar fechas");

  return { dates, error };
}
