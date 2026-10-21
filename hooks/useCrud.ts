import { useCallback, useState } from "react";
import type { DatabaseResult } from "@/types";
import { createDatabaseError } from "@/types";

export interface CrudRunOptions {
  /** Fallback shown when the operation fails or throws. */
  errorMessage: string;
  /** Called after a successful operation, typically a list `refresh`. */
  invalidate?: () => void | Promise<void>;
}

export interface CrudState {
  saving: boolean;
  error: string | null;
  /** Clears the mutation error (e.g. when the owning list reloads). */
  reset: () => void;
  run: <TResult>(
    operation: () => Promise<DatabaseResult<TResult>>,
    options: CrudRunOptions
  ) => Promise<DatabaseResult<TResult>>;
}

/**
 * Runs mutations with consistent saving/error state and optional automatic
 * invalidation (refresh) of the list that owns the mutated record.
 */
export function useCrud(): CrudState {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setError(null);
  }, []);

  const run = useCallback(
    async <TResult>(
      operation: () => Promise<DatabaseResult<TResult>>,
      options: CrudRunOptions
    ): Promise<DatabaseResult<TResult>> => {
      setSaving(true);
      setError(null);
      try {
        const result = await operation();
        if (!result.success) {
          setError(result.error?.message ?? options.errorMessage);
          return result;
        }
        if (options.invalidate) {
          try {
            await options.invalidate();
          } catch {
            // A refresh failure must not report a successful mutation as
            // failed; the list hook owns its own load error state.
          }
        }
        return result;
      } catch {
        setError(options.errorMessage);
        return createDatabaseError<TResult>(
          "UNEXPECTED_ERROR",
          options.errorMessage
        );
      } finally {
        setSaving(false);
      }
    },
    []
  );

  return { saving, error, reset, run };
}
