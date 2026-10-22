import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';

import {
  formatDateISO,
  formatTimeHHmm,
  getTodayISO,
  parseISODateLocal,
  parseTimeToDate,
} from '@/utils/dates';
import type { ServiceFormData, ServiceFormValues } from '@/types';

interface UseServiceFormFieldsOptions {
  initialValues?: Partial<ServiceFormValues>;
  onSubmit: (data: ServiceFormData) => void;
}

/**
 * Field state and submit validation for the service form.
 *
 * Dates/times stay as ISO strings, matching `ServiceFormData`; the `Date`
 * objects are derived only for the native pickers.
 */
export function useServiceFormFields({
  initialValues,
  onSubmit,
}: UseServiceFormFieldsOptions) {
  const [clientName, setClientName] = useState(
    initialValues?.client_name ?? ''
  );
  const [address, setAddress] = useState(initialValues?.address ?? '');
  const [description, setDescription] = useState(
    initialValues?.description ?? ''
  );
  const [notes, setNotes] = useState(initialValues?.notes ?? '');
  const [expense, setExpense] = useState(initialValues?.expense ?? '');
  const [reminderMinutes, setReminderMinutes] = useState(
    initialValues?.reminder_minutes ?? 2880
  );
  const [scheduledDate, setScheduledDate] = useState(
    initialValues?.scheduled_date ?? getTodayISO()
  );
  const [scheduledTime, setScheduledTime] = useState(
    initialValues?.scheduled_time ?? formatTimeHHmm(new Date())
  );

  const scheduledDateObj = useMemo(
    () => parseISODateLocal(scheduledDate),
    [scheduledDate]
  );
  const scheduledTimeObj = useMemo(
    () => parseTimeToDate(scheduledTime),
    [scheduledTime]
  );

  const onDateChange = useCallback((selectedDate: Date): void => {
    setScheduledDate(formatDateISO(selectedDate));
  }, []);

  const onTimeChange = useCallback((selectedTime: Date): void => {
    setScheduledTime(formatTimeHHmm(selectedTime));
  }, []);

  const handleSubmit = useCallback((): void => {
    if (!clientName.trim()) {
      Alert.alert('Error', 'El nombre del cliente es obligatorio');
      return;
    }

    const trimmedExpense = expense.trim();
    const parsedExpense = trimmedExpense
      ? Number.parseFloat(trimmedExpense)
      : null;

    if (parsedExpense !== null && !Number.isFinite(parsedExpense)) {
      Alert.alert('Error', 'El gasto debe ser un número válido');
      return;
    }

    const data: ServiceFormData = {
      client_name: clientName.trim(),
      address: address.trim(),
      description: description.trim(),
      scheduled_date: scheduledDate,
      scheduled_time: scheduledTime,
      notes: notes.trim(),
      reminder_minutes: reminderMinutes,
      expense: parsedExpense,
    };

    onSubmit(data);
  }, [
    address,
    clientName,
    description,
    expense,
    notes,
    onSubmit,
    reminderMinutes,
    scheduledDate,
    scheduledTime,
  ]);

  return {
    clientName,
    setClientName,
    address,
    setAddress,
    description,
    setDescription,
    notes,
    setNotes,
    expense,
    setExpense,
    reminderMinutes,
    setReminderMinutes,
    scheduledDate,
    setScheduledDate,
    scheduledTime,
    setScheduledTime,
    scheduledDateObj,
    scheduledTimeObj,
    onDateChange,
    onTimeChange,
    handleSubmit,
  };
}
