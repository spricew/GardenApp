import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { ReminderPicker } from "../../components/ReminderPicker";
import { createService } from "../../database/services";
import { scheduleServiceReminder } from "../../utils/notifications";
import { updateServiceNotificationId } from "../../database/services";
import { getServiceById } from "../../database/services";
import { getTodayISO } from "../../utils/dates";
import type { ServiceFormData } from "../../types";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NewServiceScreen() {
  const router = useRouter();
  const db = useSQLiteContext();

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
    if (!clientName.trim()) {
      Alert.alert("Error", "El nombre del cliente es obligatorio");
      return;
    }

    setSaving(true);
    try {
      const data: ServiceFormData = {
        client_name: clientName.trim(),
        address: address.trim(),
        description: description.trim(),
        scheduled_date: formatDate(scheduledDate),
        scheduled_time: formatTime(scheduledTime),
        notes: notes.trim(),
        reminder_minutes: reminderMinutes,
      };

      const id = await createService(db, data);

      // Schedule notification
      const service = await getServiceById(db, id);
      if (service) {
        const notificationId = await scheduleServiceReminder(service);
        if (notificationId) {
          await updateServiceNotificationId(db, id, notificationId);
        }
      }

      router.back();
    } catch (error) {
      console.error("Error creating service:", error);
      Alert.alert("Error", "No se pudo guardar el servicio");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-warm-canvas" edges={['top']}>
      <ScrollView>
        <View className="px-6 pt-6 pb-12">
          {/* Header */}
          <View className="flex-row items-center mb-8">
            <Pressable onPress={() => router.back()} className="mr-4 p-1 active:opacity-50">
              <Text className="text-[28px] font-light text-graphite leading-none">←</Text>
            </Pressable>
            <Text className="font-display font-medium text-heading-lg text-charcoal-primary tracking-[-1.14px]">
              Nuevo
            </Text>
          </View>

          {/* Client Name */}
          <View className="mb-5">
            <Text className="font-sans font-semibold text-[15px] text-charcoal-primary tracking-tight mb-2">
              👤 Cliente *
            </Text>
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
            <Text className="font-sans font-semibold text-[15px] text-charcoal-primary tracking-tight mb-2">
              📍 Dirección
            </Text>
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
            <Text className="font-sans font-semibold text-[15px] text-charcoal-primary tracking-tight mb-2">
              📝 Descripción
            </Text>
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
          <View className="flex-row gap-4 mb-5">
            <View className="flex-1">
              <Text className="font-sans font-semibold text-[15px] text-charcoal-primary tracking-tight mb-2">
                📅 Fecha
              </Text>
              <Pressable
                onPress={() => setShowDatePicker(true)}
                className="bg-white border border-stone-surface rounded-lg px-4 py-3 overflow-hidden"
                style={{ borderCurve: 'continuous' }}
              >
                <Text className="font-sans text-[15px] text-graphite">
                  {formatDateForDisplay(scheduledDate)}
                </Text>
              </Pressable>
            </View>
            <View className="flex-1">
              <Text className="font-sans font-semibold text-[15px] text-charcoal-primary tracking-tight mb-2">
                🕐 Hora
              </Text>
              <Pressable
                onPress={() => setShowTimePicker(true)}
                className="bg-white border border-stone-surface rounded-lg px-4 py-3 overflow-hidden"
                style={{ borderCurve: 'continuous' }}
              >
                <Text className="font-sans text-[15px] text-graphite">
                  {formatTimeForDisplay(scheduledTime)}
                </Text>
              </Pressable>
            </View>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={scheduledDate}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={onDateChange}
              minimumDate={new Date()}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={scheduledTime}
              mode="time"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={onTimeChange}
              is24Hour={false}
            />
          )}

          {/* Notes */}
          <View className="mb-5">
            <Text className="font-sans font-semibold text-[15px] text-charcoal-primary tracking-tight mb-2">
              📋 Notas
            </Text>
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
            className={`rounded-full py-4 items-center overflow-hidden ${saving ? "bg-stone-surface" : "bg-midnight active:opacity-80"
              }`}
            style={{ borderCurve: 'continuous' }}
          >
            <Text className={`font-sans font-medium text-[15px] tracking-tight ${saving ? "text-ash" : "text-white"}`}>
              {saving ? "Guardando..." : "✅ Guardar Servicio"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>

  );
}
