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

export const STATUS_CONFIG: Record<ServiceStatus, { label: string; color: string; bgColor: string; icon: string }> = {
  pending: { label: 'Pendiente', color: 'text-sky-blue', bgColor: 'bg-sky-blue/10', icon: '🕐' },
  in_progress: { label: 'En Proceso', color: 'text-deep-amber', bgColor: 'bg-sunburst-yellow/20', icon: '🔧' },
  postponed: { label: 'Pospuesto', color: 'text-ember-orange', bgColor: 'bg-ember-orange/10', icon: '📅' },
  done: { label: 'Realizado', color: 'text-valid-green', bgColor: 'bg-valid-green/10', icon: '✅' },
  not_done: { label: 'No Realizado', color: 'text-coral-red', bgColor: 'bg-coral-red/10', icon: '❌' },
};

export const REMINDER_OPTIONS = [
  { label: '1 día antes', value: 1440 },
  { label: '2 días antes', value: 2880 },
  { label: '5 días antes', value: 7200 },
  { label: '1 semana antes', value: 10080 },
];
