import type { SQLiteDatabase } from 'expo-sqlite';
import { CREATE_SERVICES_TABLE, CREATE_SERVICES_DATE_INDEX, CREATE_SERVICES_STATUS_INDEX } from './schema';

export async function migrateDb(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(CREATE_SERVICES_TABLE);
  await db.execAsync(CREATE_SERVICES_DATE_INDEX);
  await db.execAsync(CREATE_SERVICES_STATUS_INDEX);
}
