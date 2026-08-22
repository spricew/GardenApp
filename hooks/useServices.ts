import { useState, useEffect, useCallback } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import type { Service, ServiceFormData, ServiceStatus } from '../types';
import * as servicesDb from '../database/services';
import { getTodayISO } from '../utils/dates';
import { scheduleServiceReminder, cancelServiceReminder, rescheduleReminder } from '../utils/notifications';

export function useServices(date?: string) {
  const db = useSQLiteContext();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const targetDate = date || getTodayISO();

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const result = await servicesDb.getServicesByDate(db, targetDate);
      setServices(result);
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
    }
  }, [db, targetDate]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addService = useCallback(async (data: ServiceFormData) => {
    const id = await servicesDb.createService(db, data);
    const service = await servicesDb.getServiceById(db, id);
    if (service) {
      const notificationId = await scheduleServiceReminder(service);
      if (notificationId) {
        await servicesDb.updateServiceNotificationId(db, id, notificationId);
      }
    }
    await refresh();
    return id;
  }, [db, refresh]);

  const changeStatus = useCallback(async (id: number, status: ServiceStatus) => {
    await servicesDb.updateServiceStatus(db, id, status);
    if (status === 'done' || status === 'not_done') {
      const service = await servicesDb.getServiceById(db, id);
      if (service?.notification_id) {
        await cancelServiceReminder(service.notification_id);
        await servicesDb.updateServiceNotificationId(db, id, null);
      }
    }
    await refresh();
  }, [db, refresh]);

  const editService = useCallback(async (id: number, data: Partial<ServiceFormData>) => {
    await servicesDb.updateService(db, id, data);
    const service = await servicesDb.getServiceById(db, id);
    if (service) {
      const notificationId = await rescheduleReminder(service);
      await servicesDb.updateServiceNotificationId(db, id, notificationId);
    }
    await refresh();
  }, [db, refresh]);

  const removeService = useCallback(async (id: number) => {
    const service = await servicesDb.getServiceById(db, id);
    if (service?.notification_id) {
      await cancelServiceReminder(service.notification_id);
    }
    await servicesDb.deleteService(db, id);
    await refresh();
  }, [db, refresh]);

  return { services, loading, refresh, addService, changeStatus, editService, removeService };
}

export function useServiceDates(year: number, month: number) {
  const db = useSQLiteContext();
  const [dates, setDates] = useState<string[]>([]);

  useEffect(() => {
    servicesDb.getServiceDatesInMonth(db, year, month).then(setDates);
  }, [db, year, month]);

  return dates;
}
