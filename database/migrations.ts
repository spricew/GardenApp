import type { SQLiteDatabase } from 'expo-sqlite';
import {
  CREATE_SERVICES_TABLE,
  CREATE_SERVICES_DATE_INDEX,
  CREATE_SERVICES_STATUS_INDEX,
  CREATE_RECURRING_SERVICES_TABLE,
  CREATE_CLIENTS_TABLE,
  CREATE_DEFAULT_SERVICES_TABLE,
  CREATE_PAYMENT_DATES_TABLE,
} from './schema';

export async function migrateDb(db: SQLiteDatabase): Promise<void> {
  // Create tables
  await db.execAsync(CREATE_SERVICES_TABLE);
  await db.execAsync(CREATE_SERVICES_DATE_INDEX);
  await db.execAsync(CREATE_SERVICES_STATUS_INDEX);
  await db.execAsync(CREATE_RECURRING_SERVICES_TABLE);
  await db.execAsync(CREATE_CLIENTS_TABLE);
  await db.execAsync(CREATE_DEFAULT_SERVICES_TABLE);
  await db.execAsync(CREATE_PAYMENT_DATES_TABLE);

  // Seed default services if empty
  const defaultServicesCount = await db.getFirstAsync<{ count: number }>(`SELECT COUNT(*) as count FROM default_services;`);
  if (defaultServicesCount && defaultServicesCount.count === 0) {
    await db.execAsync(`
      INSERT INTO default_services (name) VALUES 
      ('Corte de césped'), 
      ('Poda de árboles'), 
      ('Limpieza de jardín'),
      ('Aplicación de fertilizante');
    `);
  }

  // Add recurring_service_id column if missing (upgrade path)
  try {
    await db.execAsync(
      `ALTER TABLE services ADD COLUMN recurring_service_id INTEGER REFERENCES recurring_services(id);`
    );
  } catch {
    // Column already exists — ignore
  }
}
