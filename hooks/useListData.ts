import { useCallback, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import type { SQLiteDatabase } from "expo-sqlite";
import type { DatabaseResult, FormState } from "@/types";

export type ListLoader<T> = (
  db: SQLiteDatabase
) => Promise<DatabaseResult<T[]>>;

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
 */
export function useListData<T>(
  load: ListLoader<T>,
  errorMessage: string
): ListDataState<T> {
  const db = useSQLiteContext();
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
      } else {
        setError(result.error?.message ?? errorMessage);
      }
    } catch {
      if (request !== requestId.current) return;
      setError(errorMessage);
    } finally {
      if (request === requestId.current) {
        setLoading(false);
      }
    }
  }, [db, load, errorMessage]);

  useFocusEffect(
    useCallback(() => {
      refresh();
      return () => {
        // Invalidate in-flight loads when the screen blurs or unmounts so a
        // slow old response cannot overwrite newer data.
        requestId.current++;
      };
    }, [refresh])
  );

  return { data, loading, error, refresh };
}
