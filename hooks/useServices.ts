import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import type { Service, ServiceFormData, ServiceStatus } from "@/types";
import * as servicesDb from "@/database/services";
import { getTodayISO } from "@/utils/dates";
import { scheduleServiceReminder, cancelServiceReminder, rescheduleReminder } from "@/utils/notifications";

export function useServices(date?: string) {
  const db = useSQLiteContext();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const targetDate = date || getTodayISO();

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await servicesDb.getServicesByDate(db, targetDate);
      if (result.success && result.data) {
        setServices(result.data);
      } else {
        setError(result.error?.message || 'Error al cargar servicios');
      }
    } catch (err) {
      setError('Error inesperado al cargar servicios');
    } finally {
      setLoading(false);
    }
  }, [db, targetDate]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const addService = useCallback(async (data: ServiceFormData): Promise<number | null> => {
    try {
      const createResult = await servicesDb.createService(db, data);
      if (!createResult.success || createResult.data === undefined) {
        setError(createResult.error?.message || 'Error al crear servicio');
        return null;
      }
      const id = createResult.data;
      const serviceResult = await servicesDb.getServiceById(db, id);
      if (serviceResult.success && serviceResult.data) {
        const notificationId = await scheduleServiceReminder(serviceResult.data);
        if (notificationId) {
          await servicesDb.updateServiceNotificationId(db, id, notificationId);
        }
      }
      await refresh();
      return id;
    } catch (err) {
      setError('Error inesperado al crear servicio');
      return null;
    }
  }, [db, refresh]);

  const changeStatus = useCallback(async (id: number, status: ServiceStatus): Promise<boolean> => {
    try {
      const updateResult = await servicesDb.updateServiceStatus(db, id, status);
      if (!updateResult.success) {
        setError(updateResult.error?.message || 'Error al actualizar estado');
        return false;
      }
      if (status === 'done' || status === 'not_done') {
        const serviceResult = await servicesDb.getServiceById(db, id);
        if (serviceResult.success && serviceResult.data?.notification_id) {
          await cancelServiceReminder(serviceResult.data.notification_id);
          await servicesDb.updateServiceNotificationId(db, id, null);
        }
      }
      await refresh();
      return true;
    } catch (err) {
      setError('Error inesperado al cambiar estado');
      return false;
    }
  }, [db, refresh]);

  const editService = useCallback(async (id: number, data: Partial<ServiceFormData>): Promise<boolean> => {
    try {
      const updateResult = await servicesDb.updateService(db, id, data);
      if (!updateResult.success) {
        setError(updateResult.error?.message || 'Error al actualizar servicio');
        return false;
      }
      const serviceResult = await servicesDb.getServiceById(db, id);
      if (serviceResult.success && serviceResult.data) {
        const notificationId = await rescheduleReminder(serviceResult.data);
        await servicesDb.updateServiceNotificationId(db, id, notificationId);
      }
      await refresh();
      return true;
    } catch (err) {
      setError('Error inesperado al editar servicio');
      return false;
    }
  }, [db, refresh]);

  const removeService = useCallback(async (id: number): Promise<boolean> => {
    try {
      const serviceResult = await servicesDb.getServiceById(db, id);
      if (serviceResult.success && serviceResult.data?.notification_id) {
        await cancelServiceReminder(serviceResult.data.notification_id);
      }
      const deleteResult = await servicesDb.deleteService(db, id);
      if (!deleteResult.success) {
        setError(deleteResult.error?.message || 'Error al eliminar servicio');
        return false;
      }
      await refresh();
      return true;
    } catch (err) {
      setError('Error inesperado al eliminar servicio');
      return false;
    }
  }, [db, refresh]);

  return { services, loading, error, refresh, addService, changeStatus, editService, removeService };
}

export function useServiceDates(year: number, month: number) {
  const db = useSQLiteContext();
  const [dates, setDates] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadDates = useCallback(async () => {
    try {
      const result = await servicesDb.getServiceDatesInMonth(db, year, month);
      if (result.success && result.data) {
        setDates(result.data);
      } else {
        setError(result.error?.message || 'Error al cargar fechas');
      }
    } catch (err) {
      setError('Error inesperado al cargar fechas');
    }
  }, [db, year, month]);

  useFocusEffect(useCallback(() => { loadDates(); }, [loadDates]));

  return { dates, error };
}
