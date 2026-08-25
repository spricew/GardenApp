import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import { useState, useEffect } from "react";
import {
  IconUser,
  IconMapPin,
  IconAlignLeft,
  IconCalendar,
  IconClock,
  IconFileText,
  IconCheck,
  IconStar,
} from "@tabler/icons-react-native";
import { useSQLiteContext } from "expo-sqlite";
import { BlurView } from "expo-blur";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

import { Card } from "./Card";
import { ReminderPicker } from "./ReminderPicker";
import { getClients, addClient, type Client } from "@/database/clients";
import type { ServiceFormData } from "@/types";

export interface ServiceFormValues {
  client_name: string;
  address: string;
  description: string;
  scheduled_date: Date;
  scheduled_time: Date;
  notes: string;
  reminder_minutes: number;
}

interface ServiceFormProps {
  initialValues?: Partial<ServiceFormValues>;
  onSubmit: (data: ServiceFormData) => void;
  saving: boolean;
  buttonLabel?: string;
}

const formatDate = (date: Date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
};

const formatTime = (date: Date) => {
  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}`;
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

export function ServiceForm({
  initialValues,
  onSubmit,
  saving,
  buttonLabel = "Guardar Servicio",
}: ServiceFormProps) {
  const db = useSQLiteContext();

  const [clientName, setClientName] = useState(initialValues?.client_name || "");
  const [address, setAddress] = useState(initialValues?.address || "");
  const [description, setDescription] = useState(initialValues?.description || "");
  const [notes, setNotes] = useState(initialValues?.notes || "");
  const [reminderMinutes, setReminderMinutes] = useState(
    initialValues?.reminder_minutes ?? 2880
  );

  const [scheduledDate, setScheduledDate] = useState(
    initialValues?.scheduled_date || new Date()
  );
  const [scheduledTime, setScheduledTime] = useState(
    initialValues?.scheduled_time || new Date()
  );

  const [savedClients, setSavedClients] = useState<Client[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    const loadClients = async () => {
      try {
        const clients = await getClients(db);
        setSavedClients(clients);
      } catch (e) {
        console.error("Error loading clients", e);
      }
    };
    loadClients();
  }, [db]);

  const handleSaveClient = async () => {
    if (!clientName.trim()) return;
    try {
      await addClient(db, clientName.trim(), address.trim());
      const clients = await getClients(db);
      setSavedClients(clients);
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "No se pudo guardar el cliente");
    }
  };

  const exactMatch = savedClients.find(
    (c) => c.name.toLowerCase() === clientName.trim().toLowerCase()
  );
  const filteredClients = savedClients.filter((c) =>
    c.name.toLowerCase().includes(clientName.trim().toLowerCase())
  );
  const showDropdown = isFocused && filteredClients.length > 0 && !exactMatch;

  const onDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) setScheduledDate(selectedDate);
  };

  const onTimeChange = (_event: DateTimePickerEvent, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) setScheduledTime(selectedTime);
  };

  const handleSubmit = () => {
    if (!clientName.trim()) {
      Alert.alert("Error", "El nombre del cliente es obligatorio");
      return;
    }

    const data: ServiceFormData = {
      client_name: clientName.trim(),
      address: address.trim(),
      description: description.trim(),
      scheduled_date: formatDate(scheduledDate),
      scheduled_time: formatTime(scheduledTime),
      notes: notes.trim(),
      reminder_minutes: reminderMinutes,
    };

    onSubmit(data);
  };

  return (
    <View className="px-6 pt-2 pb-12 gap-2">
      <Card>
        {/* Client Name */}
        <View className="mb-5 z-10">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center gap-1.5">
              <IconUser size={14} color="#343433" strokeWidth={2} />
              <Text className="font-sans font-semibold text-[15px] text-charcoal-primary tracking-tight">
                Cliente *
              </Text>
            </View>
            {clientName.trim().length > 0 && !exactMatch && (
              <Pressable
                onPress={handleSaveClient}
                className="flex-row items-center gap-1 active:opacity-50"
              >
                <IconStar size={14} color="#f59e0b" strokeWidth={2} />
                <Text className="text-amber-500 font-sans text-[13px] font-medium">
                  Guardar frecuente
                </Text>
              </Pressable>
            )}
          </View>
          <TextInput
            value={clientName}
            onChangeText={setClientName}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            placeholder="Nombre del cliente"
            className="bg-white border border-stone-surface rounded-lg px-4 py-3 font-sans text-[15px] text-graphite overflow-hidden"
            style={{ borderCurve: "continuous" }}
            placeholderTextColor="#a7a7a7"
          />

          {/* Saved Clients Dropdown */}
          {showDropdown && (
            <View
              className="absolute top-[76px] left-0 right-0 z-50 rounded-2xl overflow-hidden bg-white/40"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.1,
                shadowRadius: 24,
                elevation: 8,
              }}
            >
              <BlurView
                intensity={40}
                tint="light"
                className="border border-white/60 rounded-2xl max-h-[220px]"
              >
                <ScrollView keyboardShouldPersistTaps="handled" nestedScrollEnabled>
                  {filteredClients.map((client, index) => (
                    <Pressable
                      key={client.id}
                      onPress={() => {
                        setClientName(client.name);
                        if (client.address) setAddress(client.address);
                        setIsFocused(false);
                      }}
                      className={`px-4 py-3.5 active:bg-black/5 ${
                        index !== filteredClients.length - 1
                          ? "border-b border-black/5"
                          : ""
                      }`}
                    >
                      <Text className="font-sans text-[15px] text-charcoal-primary font-medium tracking-tight">
                        {client.name}
                      </Text>
                      {client.address && (
                        <Text
                          className="font-sans text-[13px] text-graphite/70 mt-1"
                          numberOfLines={1}
                        >
                          {client.address}
                        </Text>
                      )}
                    </Pressable>
                  ))}
                </ScrollView>
              </BlurView>
            </View>
          )}
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
            style={{ borderCurve: "continuous" }}
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
            style={{ borderCurve: "continuous" }}
            placeholderTextColor="#a7a7a7"
          />
        </View>
      </Card>

      {/* Date & Time */}
      <Card>
        <View className="gap-5 mb-5">
          <View className="w-full">
            <View className="flex-row items-center gap-1.5 mb-2">
              <IconCalendar size={14} color="#343433" strokeWidth={2} />
              <Text className="font-sans font-semibold text-[15px] text-charcoal-primary tracking-tight">
                Fecha
              </Text>
            </View>
            {Platform.OS === "ios" ? (
              <DateTimePicker
                value={scheduledDate}
                mode="date"
                display="inline"
                onChange={onDateChange}
                minimumDate={new Date()}
                style={{ alignSelf: "flex-start" }}
                accentColor="green"
              />
            ) : (
              <Pressable
                onPress={() => setShowDatePicker(true)}
                className="bg-white border border-stone-surface rounded-lg px-4 py-3 overflow-hidden"
                style={{ borderCurve: "continuous" }}
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
            {Platform.OS === "ios" ? (
              <DateTimePicker
                value={scheduledTime}
                mode="time"
                display="compact"
                onChange={onTimeChange}
                style={{ alignSelf: "flex-start" }}
                accentColor="green"
              />
            ) : (
              <Pressable
                onPress={() => setShowTimePicker(true)}
                className="bg-white border border-stone-surface rounded-lg px-4 py-3 overflow-hidden"
                style={{ borderCurve: "continuous" }}
              >
                <Text className="font-sans text-[15px] text-graphite">
                  {formatTimeForDisplay(scheduledTime)}
                </Text>
              </Pressable>
            )}
          </View>
        </View>

        {showDatePicker && Platform.OS === "android" && (
          <DateTimePicker
            value={scheduledDate}
            mode="date"
            display="default"
            onChange={onDateChange}
            minimumDate={new Date()}
          />
        )}

        {showTimePicker && Platform.OS === "android" && (
          <DateTimePicker
            value={scheduledTime}
            mode="time"
            display="default"
            onChange={onTimeChange}
            is24Hour={false}
          />
        )}
      </Card>

      {/* Notes */}
      <Card>
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
            style={{ borderCurve: "continuous" }}
            placeholderTextColor="#a7a7a7"
            textAlignVertical="top"
          />
        </View>

        {/* Reminder */}
        <View className="mb-8">
          <ReminderPicker
            value={reminderMinutes}
            onChange={setReminderMinutes}
          />
        </View>
      </Card>

      {/* Save Button */}
      <Pressable
        onPress={handleSubmit}
        disabled={saving}
        className={`rounded-full py-4 items-center justify-center flex-row gap-2 overflow-hidden ${
          saving ? "bg-stone-surface" : "bg-midnight active:opacity-80"
        }`}
        style={{ borderCurve: "continuous" }}
      >
        {!saving && <IconCheck size={18} color="#ffffff" strokeWidth={2.5} />}
        <Text
          className={`font-sans font-medium text-[15px] tracking-tight ${
            saving ? "text-ash" : "text-white"
          }`}
        >
          {saving ? "Guardando..." : buttonLabel}
        </Text>
      </Pressable>
    </View>
  );
}
