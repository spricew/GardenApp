import type { SQLiteDatabase } from "expo-sqlite";
import type { DatabaseResult } from "@/types";
import { useListData } from "./useListData";

export type MonthDatesLoader = (
  db: SQLiteDatabase
) => Promise<DatabaseResult<string[]>>;

export interface MonthDatesState {
  dates: string[];
  error: string | null;
}

/**
 * Loads the distinct dates that have records in a month (for calendar dots).
 * Thin wrapper over `useListData<string>` so loading/refresh/focus handling
 * lives in one place.
 */
export function useMonthDates(
  load: MonthDatesLoader,
  errorMessage: string
): MonthDatesState {
  const { data, error } = useListData<string>(load, errorMessage);
  return { dates: data, error };
}
