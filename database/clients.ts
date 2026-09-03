import type { SQLiteDatabase } from "expo-sqlite";
import type { Client, DatabaseResult } from "@/types";
import { createDatabaseResult, createDatabaseError } from "@/types";

export async function getClients(db: SQLiteDatabase): Promise<DatabaseResult<Client[]>> {
  try {
    const data = await db.getAllAsync<Client>(
      `SELECT * FROM clients ORDER BY name ASC;`
    );
    return createDatabaseResult(data);
  } catch (error) {
    return createDatabaseError('DB_ERROR', 'Error al obtener clientes', error);
  }
}

export async function addClient(
  db: SQLiteDatabase,
  name: string,
  address?: string
): Promise<DatabaseResult<number>> {
  try {
    const result = await db.runAsync(
      `INSERT OR REPLACE INTO clients (name, address) VALUES (?, ?);`,
      [name, address || null]
    );
    return createDatabaseResult(result.lastInsertRowId);
  } catch (error) {
    return createDatabaseError('DB_ERROR', 'Error al agregar cliente', error);
  }
}

export async function removeClient(
  db: SQLiteDatabase,
  id: number
): Promise<DatabaseResult<void>> {
  try {
    await db.runAsync(`DELETE FROM clients WHERE id = ?;`, [id]);
    return createDatabaseResult(undefined);
  } catch (error) {
    return createDatabaseError('DB_ERROR', 'Error al eliminar cliente', error);
  }
}
