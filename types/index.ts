export type ServiceStatus = 'pending' | 'in_progress' | 'postponed' | 'done' | 'not_done';

export interface Service {
  id: number;
  client_name: string;
  address: string | null;
  description: string | null;
  scheduled_date: string;
  scheduled_time: string | null;
  status: ServiceStatus;
  notes: string | null;
  reminder_minutes: number;
  notification_id: string | null;
  recurring_service_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface RecurringService {
  id: number;
  client_name: string;
  address: string | null;
  description: string | null;
  scheduled_time: string | null;
  day_of_week: number;
  interval_weeks: number;
  start_date: string;
  reminder_minutes: number;
  notes: string | null;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface ServiceFormData {
  client_name: string;
  address: string;
  description: string;
  scheduled_date: string;
  scheduled_time: string;
  notes: string;
  reminder_minutes: number;
}

export interface PaymentDate {
  id: number;
  client_name: string;
  amount: number | null;
  estimated_date: string;
  notes: string | null;
  is_paid: number;
  created_at: string;
  updated_at: string;
}

export interface PaymentDateFormData {
  client_name: string;
  amount: number | null;
  estimated_date: string;
  notes: string;
}

export interface Client {
  id: number;
  name: string;
  address: string | null;
}

export interface DefaultService {
  id: number;
  name: string;
}

export interface AppError {
  code: string;
  message: string;
  details?: unknown;
}

export interface DatabaseResult<T> {
  success: boolean;
  data?: T;
  error?: AppError;
}

export type TablerIconName = 'IconClock' | 'IconRefresh' | 'IconPlayerPause' | 'IconCircleCheck' | 'IconCircleX';

export const STATUS_CONFIG: Record<
  ServiceStatus,
  {
    label: string;
    color: string;
    bgColor: string;
    iconName: TablerIconName;
    iconColor: string;
  }
> = {
  pending: { label: 'Pendiente', color: 'text-sky-blue', bgColor: 'bg-sky-blue/10', iconName: 'IconClock', iconColor: '#0090ff' },
  in_progress: { label: 'En Proceso', color: 'text-deep-amber', bgColor: 'bg-sunburst-yellow/20', iconName: 'IconRefresh', iconColor: '#d48f00' },
  postponed: { label: 'Pospuesto', color: 'text-ember-orange', bgColor: 'bg-ember-orange/10', iconName: 'IconPlayerPause', iconColor: '#ff3e00' },
  done: { label: 'Realizado', color: 'text-valid-green', bgColor: 'bg-valid-green/10', iconName: 'IconCircleCheck', iconColor: '#00c454' },
  not_done: { label: 'No Realizado', color: 'text-coral-red', bgColor: 'bg-coral-red/10', iconName: 'IconCircleX', iconColor: '#ff2b3a' },
};

export const REMINDER_OPTIONS = [
  { label: 'Sin recordatorio', value: 0 },
  { label: '30 min antes', value: 30 },
  { label: '1 hora antes', value: 60 },
  { label: '2 horas antes', value: 120 },
  { label: '1 día antes', value: 1440 },
  { label: '2 días antes', value: 2880 },
  { label: '5 días antes', value: 7200 },
  { label: '1 semana antes', value: 10080 },
];

export function createAppError(code: string, message: string, details?: unknown): AppError {
  return { code, message, details };
}

export function createDatabaseResult<T>(data: T): DatabaseResult<T> {
  return { success: true, data };
}

export function createDatabaseError<T>(code: string, message: string, details?: unknown): DatabaseResult<T> {
  return { success: false, error: createAppError(code, message, details) };
}
