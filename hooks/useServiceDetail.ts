import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';

import {
  deleteService,
  getServiceById,
  postponeService,
  updateServiceNotificationId,
  updateServiceStatus,
} from '@/database/services';
import { useCrud } from '@/hooks/useCrud';
import { invalidateServiceDataCache } from '@/utils/dbCache';
import {
  cancelServiceReminder,
  scheduleServiceReminder,
} from '@/utils/notifications';
import type { FormState, Service, ServiceStatus } from '@/types';

export type ServiceStatusChangeOutcome =
  | { outcome: 'updated' }
  | { outcome: 'postpone-required' }
  | { outcome: 'error'; message: string };

export interface ServiceMutationResult {
  success: boolean;
  message?: string;
}

interface UseServiceDetailResult extends FormState<Service> {
  saving: boolean;
  refresh: () => Promise<void>;
  changeStatus: (
    status: ServiceStatus
  ) => Promise<ServiceStatusChangeOutcome>;
  postpone: (date: string) => Promise<ServiceMutationResult>;
  remove: () => Promise<ServiceMutationResult>;
}

/**
 * Owns the data and mutation flow for the service detail screen: loading,
 * status transitions, postponing and deletion.
 *
 * Notification cleanup/scheduling is best-effort: the database mutation is
 * the source of truth and must not be reported as failed because the OS
 * rejected a notification operation.
 */
export function useServiceDetail(
  serviceId: string | undefined
): UseServiceDetailResult {
  const db = useSQLiteContext();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);
  const { saving, run } = useCrud();

  const refresh = useCallback(async () => {
    const request = ++requestId.current;
    const numericId = serviceId ? Number(serviceId) : Number.NaN;

    if (!Number.isInteger(numericId) || numericId <= 0) {
      setService(null);
      setError('Servicio no encontrado');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await getServiceById(db, numericId);
      if (request !== requestId.current) return;

      if (!result.success) {
        setService(null);
        setError(result.error?.message ?? 'No se pudo cargar el servicio');
        return;
      }

      setService(result.data ?? null);
    } catch {
      if (request !== requestId.current) return;
      setService(null);
      setError('No se pudo cargar el servicio');
    } finally {
      if (request === requestId.current) {
        setLoading(false);
      }
    }
  }, [db, serviceId]);

  useFocusEffect(
    useCallback(() => {
      refresh();
      return () => {
        // Invalidate an in-flight load so a stale response cannot overwrite
        // the service after the screen blurs or unmounts.
        requestId.current++;
      };
    }, [refresh])
  );

  const clearReminder = useCallback(
    async (id: number, notificationId: string): Promise<void> => {
      try {
        await cancelServiceReminder(notificationId);
        await updateServiceNotificationId(db, id, null);
      } catch {
        // Status/postpone/delete already committed. A stale notification id
        // is retried on the next status transition.
      }
    },
    [db]
  );

  const scheduleReminderFor = useCallback(
    async (id: number): Promise<void> => {
      try {
        const result = await getServiceById(db, id);
        if (!result.success || !result.data) return;

        const notificationId = await scheduleServiceReminder(result.data);
        if (notificationId) {
          await updateServiceNotificationId(db, id, notificationId);
        }
      } catch {
        // The postponed clone already exists; scheduling can be retried by
        // editing the service.
      }
    },
    [db]
  );

  const changeStatus = useCallback(
    async (status: ServiceStatus): Promise<ServiceStatusChangeOutcome> => {
      if (!service) {
        return { outcome: 'error', message: 'Servicio no encontrado' };
      }

      if (status === 'postponed') {
        return { outcome: 'postpone-required' };
      }

      const shouldClearReminder =
        (status === 'done' || status === 'not_done') &&
        service.notification_id !== null;

      const result = await run(
        async () => {
          const updateResult = await updateServiceStatus(
            db,
            service.id,
            status
          );
          if (!updateResult.success) return updateResult;

          if (shouldClearReminder && service.notification_id) {
            await clearReminder(service.id, service.notification_id);
          }

          return updateResult;
        },
        { errorMessage: 'No se pudo actualizar el estado' }
      );

      if (!result.success) {
        return {
          outcome: 'error',
          message:
            result.error?.message ?? 'No se pudo actualizar el estado',
        };
      }

      invalidateServiceDataCache();
      setService((current) =>
        current
          ? {
              ...current,
              status,
              notification_id: shouldClearReminder
                ? null
                : current.notification_id,
            }
          : current
      );

      return { outcome: 'updated' };
    },
    [clearReminder, db, run, service]
  );

  const postpone = useCallback(
    async (date: string): Promise<ServiceMutationResult> => {
      if (!service) {
        return { success: false, message: 'Servicio no encontrado' };
      }

      const result = await run(
        async () => {
          const postponeResult = await postponeService(
            db,
            service.id,
            date
          );
          if (!postponeResult.success) return postponeResult;

          if (service.notification_id) {
            await clearReminder(service.id, service.notification_id);
          }

          // The clone copies reminder_minutes, so recreate its notification
          // once the original one has been cancelled.
          if (typeof postponeResult.data === 'number') {
            await scheduleReminderFor(postponeResult.data);
          }

          return postponeResult;
        },
        { errorMessage: 'No se pudo posponer el servicio' }
      );

      if (!result.success) {
        return {
          success: false,
          message: result.error?.message ?? 'No se pudo posponer el servicio',
        };
      }

      invalidateServiceDataCache();
      return { success: true };
    },
    [clearReminder, db, run, scheduleReminderFor, service]
  );

  const remove = useCallback(async (): Promise<ServiceMutationResult> => {
    if (!service) {
      return { success: false, message: 'Servicio no encontrado' };
    }

    const result = await run(
      async () => {
        if (service.notification_id) {
          await clearReminder(service.id, service.notification_id);
        }
        return deleteService(db, service.id);
      },
      { errorMessage: 'No se pudo eliminar el servicio' }
    );

    if (!result.success) {
      return {
        success: false,
        message: result.error?.message ?? 'No se pudo eliminar el servicio',
      };
    }

    invalidateServiceDataCache();
    return { success: true };
  }, [clearReminder, db, run, service]);

  return {
    data: service,
    loading,
    error,
    saving,
    refresh,
    changeStatus,
    postpone,
    remove,
  };
}
