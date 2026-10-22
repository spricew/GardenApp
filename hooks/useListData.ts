import { useCallback, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import type { SQLiteDatabase } from "expo-sqlite";
import type { DatabaseResult, FormState } from "@/types";
import {
  invalidateDbCache,
  readDbCache,
  writeDbCache,
} from "@/utils/dbCache";

export type ListLoader<T> = (
  db: SQLiteDatabase
) => Promise<DatabaseResult<T[]>>;

export interface UseListDataOptions {
  /**
   * Cache key for the query. When provided, a recent result is reused on focus
   * instead of refetching immediately after returning from a detail screen.
   */
  cacheKey?: string;
  /** Maximum cache age in milliseconds. */
  cacheMaxAgeMs?: number;
}

/**
 * Same `loading`/`error` contract as {@link FormState}, but a list hook always
 * exposes an array (never `null`) and can be refreshed on demand.
 */
export interface ListDataState<T> extends Omit<FormState<T[]>, "data"> {
  data: T[];
  refresh: () => Promise<void>;
}

/**
 * Loads a list from SQLite and refreshes it whenever the screen gains focus.
 *
 * The loader must be memoized by the caller (`useCallback`) so changing its
 * dependencies (e.g. the selected date) triggers a new load without causing
 * an infinite render loop.
 *
 * When `cacheKey` is supplied, focus reads the short-lived cache first. Manual
 * refreshes and mutations still hit the database, and mutation helpers
 * invalidate the relevant cache entries.
 */
export function useListData<T>(
  load: ListLoader<T>,
  errorMessage: string,
  options: UseListDataOptions = {}
): ListDataState<T> {
  const db = useSQLiteContext();
  const { cacheKey, cacheMaxAgeMs } = options;
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const refresh = useCallback(async () => {
    const request = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const result = await load(db);
      if (request !== requestId.current) return;
      if (result.success && result.data) {
        setData(result.data);
        if (cacheKey) writeDbCache(cacheKey, result.data);
      } else {
        if (cacheKey) invalidateDbCache(cacheKey);
        setError(result.error?.message ?? errorMessage);
      }
    } catch {
      if (request !== requestId.current) return;
      if (cacheKey) invalidateDbCache(cacheKey);
      setError(errorMessage);
    } finally {
      if (request === requestId.current) {
        setLoading(false);
      }
    }
  }, [db, load, errorMessage, cacheKey]);

  useFocusEffect(
    useCallback(() => {
      const cached = cacheKey
        ? readDbCache<T[]>(cacheKey, cacheMaxAgeMs)
        : undefined;

      if (cached) {
        // Invalidate any in-flight request before using the cache.
        requestId.current++;
        setData(cached);
        setError(null);
        setLoading(false);
        return () => {
          requestId.current++;
        };
      }

      void refresh();
      return () => {
        // Invalidate in-flight loads when the screen blurs or unmounts so a
        // slow old response cannot overwrite newer data.
        requestId.current++;
      };
    }, [cacheKey, cacheMaxAgeMs, refresh])
  );

  return { data, loading, error, refresh };
}
