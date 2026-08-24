export type ServiceStatus = 'pending' | 'in_progress' | 'postponed' | 'done' | 'not_done';

export interface Service {
  id: number;
  client_name: string;
  address: string | null;
  description: string | null;
  scheduled_date: string; // YYYY-MM-DD
  scheduled_time: string | null; // HH:MM
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
  scheduled_time: string | null; // HH:MM
  day_of_week: number; // 0=Sunday ... 6=Saturday
  interval_weeks: number; // e.g. 2 = every 2 weeks (1 on, 1 off)
  start_date: string; // YYYY-MM-DD — first occurrence
  reminder_minutes: number;
  notes: string | null;
  is_active: number; // 1=active, 0=paused
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
  { label: '1 día antes', value: 1440 },
  { label: '2 días antes', value: 2880 },
  { label: '5 días antes', value: 7200 },
  { label: '1 semana antes', value: 10080 },
];
