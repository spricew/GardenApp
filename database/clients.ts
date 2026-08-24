import type { SQLiteDatabase } from "expo-sqlite";

export interface Client {
  id: number;
  name: string;
  address: string | null;
}

export async function getClients(db: SQLiteDatabase): Promise<Client[]> {
  return await db.getAllAsync<Client>(
    `SELECT * FROM clients ORDER BY name ASC;`
  );
}

export async function addClient(
  db: SQLiteDatabase,
  name: string,
  address?: string
): Promise<number> {
  const result = await db.runAsync(
    `INSERT OR REPLACE INTO clients (name, address) VALUES (?, ?);`,
    [name, address || null]
  );
  return result.lastInsertRowId;
}

export async function removeClient(
  db: SQLiteDatabase,
  id: number
): Promise<void> {
  await db.runAsync(`DELETE FROM clients WHERE id = ?;`, [id]);
}
