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
    recurring_service_id INTEGER,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (recurring_service_id) REFERENCES recurring_services(id)
  );
`;

export const CREATE_SERVICES_DATE_INDEX = `
  CREATE INDEX IF NOT EXISTS idx_services_date ON services(scheduled_date);
`;

export const CREATE_SERVICES_STATUS_INDEX = `
  CREATE INDEX IF NOT EXISTS idx_services_status ON services(status);
`;

export const CREATE_RECURRING_SERVICES_TABLE = `
  CREATE TABLE IF NOT EXISTS recurring_services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_name TEXT NOT NULL,
    address TEXT,
    description TEXT,
    scheduled_time TEXT,
    day_of_week INTEGER NOT NULL,
    interval_weeks INTEGER NOT NULL DEFAULT 2,
    start_date TEXT NOT NULL,
    reminder_minutes INTEGER DEFAULT 10080,
    notes TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  );
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
