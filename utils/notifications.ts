import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { Service } from "@/types";
import { combineDateAndTime } from './dates';

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Recordatorios de Servicio',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2D6A4F',
    });
  }

  return true;
}

export async function scheduleServiceReminder(service: Service): Promise<string | null> {
  if (!service.reminder_minutes || service.reminder_minutes <= 0) return null;

  const triggerDate = combineDateAndTime(service.scheduled_date, service.scheduled_time);
  if (!triggerDate) return null;

  const reminderDate = new Date(triggerDate.getTime() - service.reminder_minutes * 60 * 1000);

  if (reminderDate <= new Date()) return null;

  let timeText = `${service.reminder_minutes} minutos`;
  if (service.reminder_minutes >= 1440) {
    const days = Math.round(service.reminder_minutes / 1440);
    timeText = `${days} día${days > 1 ? 's' : ''}`;
  } else if (service.reminder_minutes >= 60) {
    const hours = Math.round(service.reminder_minutes / 60);
    timeText = `${hours} hora${hours > 1 ? 's' : ''}`;
  }

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: '🌿 Recordatorio de Servicio',
      body: `Servicio para ${service.client_name} en ${timeText}${service.address ? ` - ${service.address}` : ''}`,
      data: { serviceId: service.id },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: reminderDate,
      channelId: Platform.OS === 'android' ? 'reminders' : undefined,
    },
  });

  return id;
}

export async function cancelServiceReminder(notificationId: string | null): Promise<void> {
  if (notificationId) {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }
}

export async function rescheduleReminder(service: Service): Promise<string | null> {
  await cancelServiceReminder(service.notification_id);
  return await scheduleServiceReminder(service);
}
