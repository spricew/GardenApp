export const CREATE_SERVICES_TABLE = `
  CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_name TEXT NOT NULL,
    address TEXT,
    description TEXT,
    scheduled_date TEXT NOT NULL,
    scheduled_time TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    notes TEXT,
    reminder_minutes INTEGER DEFAULT 30,
    notification_id TEXT,
    expense REAL,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  );
`;

export const CREATE_SERVICES_DATE_INDEX = `
  CREATE INDEX IF NOT EXISTS idx_services_date ON services(scheduled_date);
`;

export const CREATE_SERVICES_STATUS_INDEX = `
  CREATE INDEX IF NOT EXISTS idx_services_status ON services(status);
`;

export const CREATE_SERVICES_CLIENT_INDEX = `
  CREATE INDEX IF NOT EXISTS idx_services_client_name ON services(client_name);
`;

export const CREATE_CLIENTS_TABLE = `
  CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    address TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  );
`;

export const CREATE_DEFAULT_SERVICES_TABLE = `
  CREATE TABLE IF NOT EXISTS default_services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  );
`;

export const CREATE_PAYMENT_DATES_TABLE = `
  CREATE TABLE IF NOT EXISTS payment_dates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_name TEXT NOT NULL,
    amount REAL,
    estimated_date TEXT NOT NULL,
    notes TEXT,
    is_paid INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  );
`;

export const CREATE_PAYMENT_DATES_DATE_INDEX = `
  CREATE INDEX IF NOT EXISTS idx_payment_dates_date ON payment_dates(estimated_date);
`;

export const CREATE_PAYMENT_DATES_CLIENT_INDEX = `
  CREATE INDEX IF NOT EXISTS idx_payment_dates_client_name ON payment_dates(client_name);
`;
