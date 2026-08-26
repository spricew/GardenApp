import type { SQLiteDatabase } from "expo-sqlite";

export interface DefaultService {
  id: number;
  name: string;
}

export async function getDefaultServices(db: SQLiteDatabase): Promise<DefaultService[]> {
  return await db.getAllAsync<DefaultService>(
    `SELECT * FROM default_services ORDER BY name ASC;`
  );
}

export async function addDefaultService(
  db: SQLiteDatabase,
  name: string
): Promise<number> {
  const result = await db.runAsync(
    `INSERT OR IGNORE INTO default_services (name) VALUES (?);`,
    [name]
  );
  return result.lastInsertRowId;
}

export async function removeDefaultService(
  db: SQLiteDatabase,
  id: number
): Promise<void> {
  await db.runAsync(`DELETE FROM default_services WHERE id = ?;`, [id]);
}
