import type { SQLiteDatabase } from "expo-sqlite";
import type { DatabaseResult } from "@/types";
import { useListData } from "./useListData";

export type MonthDatesLoader = (
  db: SQLiteDatabase
) => Promise<DatabaseResult<string[]>>;

export interface MonthDatesState {
  dates: string[];
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Loads the distinct dates that have records in a month (for calendar dots).
 * Thin wrapper over `useListData<string>` so loading/refresh/focus handling
 * lives in one place. `cacheKey` is forwarded to the shared focus cache.
 */
export function useMonthDates(
  load: MonthDatesLoader,
  errorMessage: string,
  cacheKey?: string
): MonthDatesState {
  const { data, error, refresh } = useListData<string>(load, errorMessage, {
    cacheKey,
  });
  return { dates: data, error, refresh };
}
