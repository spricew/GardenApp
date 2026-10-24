import { useCallback } from "react";
import type { SQLiteDatabase } from "expo-sqlite";
import type { DatabaseResult, Service } from "@/types";
import * as servicesDb from "@/database/services";
import { dbCacheKeys } from "@/utils/dbCache";
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
    "Error al cargar servicios",
    { cacheKey: dbCacheKeys.servicesByDate(targetDate) }
  );

  return { services, loading, error, refresh };
}

/**
 * Loads every scheduled service for the agenda home screen.
 * Grouping by date and filtering by status happen in memory so the database
 * is only queried when the screen gains focus or data is mutated.
 */
export function useAllServices() {
  const load = useCallback(
    (db: SQLiteDatabase): Promise<DatabaseResult<Service[]>> =>
      servicesDb.getAllServices(db),
    []
  );

  const { data: services, loading, error, refresh } = useListData<Service>(
    load,
    "Error al cargar servicios",
    { cacheKey: dbCacheKeys.allServices }
  );

  return { services, loading, error, refresh };
}

export function useServiceDates(year: number, month: number) {
  const load = useCallback(
    (db: SQLiteDatabase): Promise<DatabaseResult<string[]>> =>
      servicesDb.getServiceDatesInMonth(db, year, month),
    [year, month]
  );

  const { dates, error, refresh } = useMonthDates(
    load,
    "Error al cargar fechas",
    dbCacheKeys.serviceDatesByMonth(year, month)
  );

  return { dates, error, refresh };
}
