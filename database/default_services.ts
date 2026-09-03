import type { SQLiteDatabase } from "expo-sqlite";
import type { DefaultService, DatabaseResult } from "@/types";
import { createDatabaseResult, createDatabaseError } from "@/types";

export async function getDefaultServices(db: SQLiteDatabase): Promise<DatabaseResult<DefaultService[]>> {
  try {
    const data = await db.getAllAsync<DefaultService>(
      `SELECT * FROM default_services ORDER BY name ASC;`
    );
    return createDatabaseResult(data);
  } catch (error) {
    return createDatabaseError('DB_ERROR', 'Error al obtener servicios por defecto', error);
  }
}

export async function addDefaultService(
  db: SQLiteDatabase,
  name: string
): Promise<DatabaseResult<number>> {
  try {
    const result = await db.runAsync(
      `INSERT OR IGNORE INTO default_services (name) VALUES (?);`,
      [name]
    );
    return createDatabaseResult(result.lastInsertRowId);
  } catch (error) {
    return createDatabaseError('DB_ERROR', 'Error al agregar servicio por defecto', error);
  }
}

export async function removeDefaultService(
  db: SQLiteDatabase,
  id: number
): Promise<DatabaseResult<void>> {
  try {
    await db.runAsync(`DELETE FROM default_services WHERE id = ?;`, [id]);
    return createDatabaseResult(undefined);
  } catch (error) {
    return createDatabaseError('DB_ERROR', 'Error al eliminar servicio por defecto', error);
  }
}
