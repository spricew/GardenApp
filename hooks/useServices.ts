import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import type { Service } from "@/types";
import * as servicesDb from "@/database/services";
import { getTodayISO } from "@/utils/dates";

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

  return { services, loading, error, refresh };
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
