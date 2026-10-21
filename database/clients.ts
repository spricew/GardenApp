import type { SQLiteDatabase } from "expo-sqlite";
import type { Client, DatabaseResult } from "@/types";
import { getRepository } from "./repository";

export async function getClients(db: SQLiteDatabase): Promise<DatabaseResult<Client[]>> {
  return getRepository(db).all<Client>(
    `SELECT * FROM clients ORDER BY name ASC;`,
    [],
    'Error al obtener clientes'
  );
}

export async function addClient(
  db: SQLiteDatabase,
  name: string,
  address?: string
): Promise<DatabaseResult<number>> {
  return getRepository(db).insert(
    `INSERT OR REPLACE INTO clients (name, address) VALUES (?, ?);`,
    [name, address || null],
    'Error al agregar cliente'
  );
}

export async function removeClient(
  db: SQLiteDatabase,
  id: number
): Promise<DatabaseResult<void>> {
  return getRepository(db).execute(
    `DELETE FROM clients WHERE id = ?;`,
    [id],
    'Error al eliminar cliente'
  );
}
