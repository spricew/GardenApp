import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRouter, Stack, useLocalSearchParams } from "expo-router";
import { useState, useEffect, useCallback } from "react";
import { IconArrowLeft, IconUser, IconMapPin, IconAlignLeft, IconCalendar, IconClock, IconFileText, IconCheck } from '@tabler/icons-react-native';
import { useSQLiteContext } from "expo-sqlite";
import { ReminderPicker } from "../../../components/ReminderPicker";
import { updateService, getServiceById, updateServiceNotificationId } from "../../../database/services";
import { scheduleServiceReminder, cancelServiceReminder } from "../../../utils/notifications";
import { combineDateAndTime } from "../../../utils/dates";
import type { ServiceFormData, Service } from "../../../types";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditServiceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const db = useSQLiteContext();

  const [loading, setLoading] = useState(true);
  const [originalService, setOriginalService] = useState<Service | null>(null);

  const [clientName, setClientName] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [reminderMinutes, setReminderMinutes] = useState(2880);
  const [saving, setSaving] = useState(false);

  // Date/time state
  const [scheduledDate, setScheduledDate] = useState(new Date());
  const [scheduledTime, setScheduledTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const loadService = useCallback(async () => {
    if (!id) return;
    try {
      const service = await getServiceById(db, Number(id));
      if (service) {
        setOriginalService(service);
        setClientName(service.client_name);
        setAddress(service.address || "");
        setDescription(service.description || "");
        setNotes(service.notes || "");
        setReminderMinutes(service.reminder_minutes);

        const dateObj = combineDateAndTime(service.scheduled_date, service.scheduled_time || "12:00") || new Date();
        setScheduledDate(dateObj);
        setScheduledTime(dateObj);
      }
    } catch (error) {
      console.error("Error loading service:", error);
    } finally {
      setLoading(false);
    }
  }, [db, id]);

  useEffect(() => {
    loadService();
  }, [loadService]);

  const formatDate = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };

  const formatTime = (date: Date) => {
    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  };

  const formatDateForDisplay = (date: Date) => {
    return date.toLocaleDateString("es-MX", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTimeForDisplay = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${String(minutes).padStart(2, "0")} ${period}`;
  };

  const onDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) setScheduledDate(selectedDate);
  };

  const onTimeChange = (_event: DateTimePickerEvent, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) setScheduledTime(selectedTime);
  };

  const handleSave = async () => {
    if (!clientName.trim() || !id || !originalService) {
      Alert.alert("Error", "El nombre del cliente es obligatorio");
      return;
    }

    setSaving(true);
    try {
      const data: Partial<ServiceFormData> = {
        client_name: clientName.trim(),
        address: address.trim(),
        description: description.trim(),
        scheduled_date: formatDate(scheduledDate),
        scheduled_time: formatTime(scheduledTime),
        notes: notes.trim(),
        reminder_minutes: reminderMinutes,
      };

      await updateService(db, Number(id), data);

      // Re-schedule notification
      if (originalService.notification_id) {
        await cancelServiceReminder(originalService.notification_id);
      }
      
      const updatedService = await getServiceById(db, Number(id));
      if (updatedService) {
        const notificationId = await scheduleServiceReminder(updatedService);
        await updateServiceNotificationId(db, Number(id), notificationId || null);
      }

      router.back();
    } catch (error) {
      console.error("Error updating service:", error);
      Alert.alert("Error", "No se pudo actualizar el servicio");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-warm-canvas">
        <ActivityIndicator size="large" color="#ff3e00" />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{
          title: "Editar servicio",
          headerTitleAlign: "center",
        }}
      />
      <SafeAreaView className="flex-1 bg-warm-canvas" edges={['bottom', 'left', 'right']}>
        <ScrollView>
          <View className="px-6 pt-2 pb-12">

          {/* Client Name */}
          <View className="mb-5">
            <View className="flex-row items-center gap-1.5 mb-2">
              <IconUser size={14} color="#343433" strokeWidth={2} />
              <Text className="font-sans font-semibold text-[15px] text-charcoal-primary tracking-tight">
                Cliente *
              </Text>
            </View>
            <TextInput
              value={clientName}
              onChangeText={setClientName}
              placeholder="Nombre del cliente"
              className="bg-white border border-stone-surface rounded-lg px-4 py-3 font-sans text-[15px] text-graphite overflow-hidden"
              style={{ borderCurve: 'continuous' }}
              placeholderTextColor="#a7a7a7"
            />
          </View>

          {/* Address */}
          <View className="mb-5">
            <View className="flex-row items-center gap-1.5 mb-2">
              <IconMapPin size={14} color="#343433" strokeWidth={2} />
              <Text className="font-sans font-semibold text-[15px] text-charcoal-primary tracking-tight">
                Dirección
              </Text>
            </View>
            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder="Dirección del servicio"
              className="bg-white border border-stone-surface rounded-lg px-4 py-3 font-sans text-[15px] text-graphite overflow-hidden"
              style={{ borderCurve: 'continuous' }}
              placeholderTextColor="#a7a7a7"
            />
          </View>

          {/* Description */}
          <View className="mb-5">
            <View className="flex-row items-center gap-1.5 mb-2">
              <IconAlignLeft size={14} color="#343433" strokeWidth={2} />
              <Text className="font-sans font-semibold text-[15px] text-charcoal-primary tracking-tight">
                Descripción
              </Text>
            </View>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Tipo de servicio (poda, riego, limpieza...)"
              className="bg-white border border-stone-surface rounded-lg px-4 py-3 font-sans text-[15px] text-graphite overflow-hidden"
              style={{ borderCurve: 'continuous' }}
              placeholderTextColor="#a7a7a7"
            />
          </View>

          {/* Date & Time */}
          <View className="gap-5 mb-5">
            <View className="w-full">
              <View className="flex-row items-center gap-1.5 mb-2">
                <IconCalendar size={14} color="#343433" strokeWidth={2} />
                <Text className="font-sans font-semibold text-[15px] text-charcoal-primary tracking-tight">
                  Fecha
                </Text>
              </View>
              {Platform.OS === 'ios' ? (
                <DateTimePicker
                  value={scheduledDate}
                  mode="date"
                  display="spinner"
                  onChange={onDateChange}
                  minimumDate={new Date()}
                  style={{ alignSelf: 'flex-start' }}
                />
              ) : (
                <Pressable
                  onPress={() => setShowDatePicker(true)}
                  className="bg-white border border-stone-surface rounded-lg px-4 py-3 overflow-hidden"
                  style={{ borderCurve: 'continuous' }}
                >
                  <Text className="font-sans text-[15px] text-graphite">
                    {formatDateForDisplay(scheduledDate)}
                  </Text>
                </Pressable>
              )}
            </View>
            <View className="w-full">
              <View className="flex-row items-center gap-1.5 mb-2">
                <IconClock size={14} color="#343433" strokeWidth={2} />
                <Text className="font-sans font-semibold text-[15px] text-charcoal-primary tracking-tight">
                  Hora
                </Text>
              </View>
              {Platform.OS === 'ios' ? (
                <DateTimePicker
                  value={scheduledTime}
                  mode="time"
                  display="spinner"
                  onChange={onTimeChange}
                  style={{ alignSelf: 'flex-start' }}
                />
              ) : (
                <Pressable
                  onPress={() => setShowTimePicker(true)}
                  className="bg-white border border-stone-surface rounded-lg px-4 py-3 overflow-hidden"
                  style={{ borderCurve: 'continuous' }}
                >
                  <Text className="font-sans text-[15px] text-graphite">
                    {formatTimeForDisplay(scheduledTime)}
                  </Text>
                </Pressable>
              )}
            </View>
          </View>

          {showDatePicker && Platform.OS === 'android' && (
            <DateTimePicker
              value={scheduledDate}
              mode="date"
              display="default"
              onChange={onDateChange}
              minimumDate={new Date()}
            />
          )}

          {showTimePicker && Platform.OS === 'android' && (
            <DateTimePicker
              value={scheduledTime}
              mode="time"
              display="default"
              onChange={onTimeChange}
              is24Hour={false}
            />
          )}

          {/* Notes */}
          <View className="mb-5">
            <View className="flex-row items-center gap-1.5 mb-2">
              <IconFileText size={14} color="#343433" strokeWidth={2} />
              <Text className="font-sans font-semibold text-[15px] text-charcoal-primary tracking-tight">
                Notas
              </Text>
            </View>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Notas adicionales..."
              multiline
              numberOfLines={3}
              className="bg-white border border-stone-surface rounded-lg px-4 py-3 font-sans text-[15px] text-graphite min-h-[80px] overflow-hidden"
              style={{ borderCurve: 'continuous' }}
              placeholderTextColor="#a7a7a7"
              textAlignVertical="top"
            />
          </View>

          {/* Reminder */}
          <View className="mb-8">
            <ReminderPicker value={reminderMinutes} onChange={setReminderMinutes} />
          </View>

          {/* Save Button */}
          <Pressable
            onPress={handleSave}
            disabled={saving}
            className={`rounded-full py-4 items-center justify-center flex-row gap-2 overflow-hidden ${
              saving ? "bg-stone-surface" : "bg-midnight active:opacity-80"
            }`}
            style={{ borderCurve: 'continuous' }}
          >
            {!saving && <IconCheck size={18} color="#ffffff" strokeWidth={2.5} />}
            <Text className={`font-sans font-medium text-[15px] tracking-tight ${saving ? "text-ash" : "text-white"}`}>
              {saving ? "Guardando..." : "Guardar Servicio"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
    </>
  );
}
