import type { SQLiteDatabase } from "expo-sqlite";
import type { DefaultService, DatabaseResult } from "@/types";
import { getRepository } from "./repository";

export async function getDefaultServices(db: SQLiteDatabase): Promise<DatabaseResult<DefaultService[]>> {
  return getRepository(db).all<DefaultService>(
    `SELECT * FROM default_services ORDER BY name ASC;`,
    [],
    'Error al obtener servicios por defecto'
  );
}

export async function addDefaultService(
  db: SQLiteDatabase,
  name: string
): Promise<DatabaseResult<number>> {
  return getRepository(db).insert(
    `INSERT OR IGNORE INTO default_services (name) VALUES (?);`,
    [name],
    'Error al agregar servicio por defecto'
  );
}

export async function removeDefaultService(
  db: SQLiteDatabase,
  id: number
): Promise<DatabaseResult<void>> {
  return getRepository(db).execute(
    `DELETE FROM default_services WHERE id = ?;`,
    [id],
    'Error al eliminar servicio por defecto'
  );
}
