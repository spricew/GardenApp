import type { SQLiteBindValue, SQLiteDatabase } from "expo-sqlite";

import type { DatabaseResult } from "@/types";
import { createDatabaseResult, createDatabaseError } from "@/types";

/**
 * Thin wrapper around expo-sqlite that centralizes error handling and
 * transaction management while keeping SQL explicit in each table module.
 *
 * Why not generic `find/create/update/delete` helpers? Building SQL from
 * dynamic table/column names invites SQL injection and hides the actual
 * query from reviewers. Explicit SQL + bound parameters is safer and still
 * removes all the duplicated try/catch blocks.
 */
export class AppRepository {
  constructor(private readonly db: SQLiteDatabase) {}

  /** Runs a SELECT that returns zero or more rows. */
  async all<T>(
    sql: string,
    params: SQLiteBindValue[],
    errorMessage: string
  ): Promise<DatabaseResult<T[]>> {
    try {
      const data = await this.db.getAllAsync<T>(sql, params);
      return createDatabaseResult(data);
    } catch (error) {
      return createDatabaseError("DB_ERROR", errorMessage, error);
    }
  }

  /** Runs a SELECT that returns at most one row. */
  async first<T>(
    sql: string,
    params: SQLiteBindValue[],
    errorMessage: string
  ): Promise<DatabaseResult<T | null>> {
    try {
      const data = await this.db.getFirstAsync<T>(sql, params);
      return createDatabaseResult(data);
    } catch (error) {
      return createDatabaseError("DB_ERROR", errorMessage, error);
    }
  }

  /** Runs an INSERT and returns the new row id. */
  async insert(
    sql: string,
    params: SQLiteBindValue[],
    errorMessage: string
  ): Promise<DatabaseResult<number>> {
    try {
      const result = await this.db.runAsync(sql, params);
      return createDatabaseResult(result.lastInsertRowId);
    } catch (error) {
      return createDatabaseError("DB_ERROR", errorMessage, error);
    }
  }

  /** Runs an UPDATE/DELETE where the affected row count is not needed. */
  async execute(
    sql: string,
    params: SQLiteBindValue[],
    errorMessage: string
  ): Promise<DatabaseResult<void>> {
    try {
      await this.db.runAsync(sql, params);
      return createDatabaseResult(undefined);
    } catch (error) {
      return createDatabaseError("DB_ERROR", errorMessage, error);
    }
  }

  /**
   * Runs `task` inside a transaction and commits/rolls back automatically.
   *
   * The raw database handle is passed to `task` on purpose: the helpers above
   * catch errors and return a failed result, which would let the transaction
   * commit a partial change. Inside a transaction always use `db.runAsync`
   * (or throw) so a failure actually triggers the rollback.
   *
   * Uses `withTransactionAsync` (available on web too). It is not exclusive,
   * so other async queries can interleave — acceptable for this single-user
   * local database where a transaction only groups two related writes.
   */
  async transaction<T>(
    task: (db: SQLiteDatabase) => Promise<T>,
    errorMessage: string
  ): Promise<DatabaseResult<T>> {
    try {
      let value!: T;
      await this.db.withTransactionAsync(async () => {
        value = await task(this.db);
      });
      return createDatabaseResult(value);
    } catch (error) {
      return createDatabaseError("DB_ERROR", errorMessage, error);
    }
  }
}

// One repository per SQLiteDatabase instance, reused across calls.
const repositories = new WeakMap<SQLiteDatabase, AppRepository>();

export function getRepository(db: SQLiteDatabase): AppRepository {
  let repository = repositories.get(db);
  if (!repository) {
    repository = new AppRepository(db);
    repositories.set(db, repository);
  }
  return repository;
}
