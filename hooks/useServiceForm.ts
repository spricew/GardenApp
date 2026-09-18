import { useState, useEffect, useRef, useCallback } from "react";
import { Alert, TextInput } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { DateTimePickerEvent } from "@react-native-community/datetimepicker";

import { getClients, addClient } from "@/database/clients";
import { getDefaultServices } from "@/database/default_services";
import type { ServiceFormData, Client, DefaultService } from "@/types";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface ServiceFormValues {
  client_name: string;
  address: string;
  description: string;
  scheduled_date: Date;
  scheduled_time: Date;
  notes: string;
  reminder_minutes: number;
}

interface UseServiceFormOptions {
  initialValues?: Partial<ServiceFormValues>;
  onSubmit: (data: ServiceFormData) => void;
}

// ── Formatters ─────────────────────────────────────────────────────────────────

export const formatDate = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
};

export const formatTime = (date: Date): string => {
  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}`;
};

export const formatDateForDisplay = (date: Date): string => {
  return date.toLocaleDateString("es-MX", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatTimeForDisplay = (date: Date): string => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${String(minutes).padStart(2, "0")} ${period}`;
};

// ── Hook ───────────────────────────────────────────────────────────────────────

export function useServiceForm({ initialValues, onSubmit }: UseServiceFormOptions) {
  const db = useSQLiteContext();

  // Form fields
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

  // UI state
  const [savedClients, setSavedClients] = useState<Client[]>([]);
  const [defaultServices, setDefaultServices] = useState<DefaultService[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const clientInputRef = useRef<TextInput>(null);
  const [clientInputLayout, setClientInputLayout] = useState({ y: 0, x: 0 });

  // ── Data loading ───────────────────────────────────────────────────────────

  useEffect(() => {
    const loadData = async () => {
      try {
        const [clientsResult, servicesResult] = await Promise.all([
          getClients(db),
          getDefaultServices(db),
        ]);
        if (clientsResult.success && clientsResult.data) {
          setSavedClients(clientsResult.data);
        }
        if (servicesResult.success && servicesResult.data) {
          setDefaultServices(servicesResult.data);
        }
      } catch (e) {
        // Error handled by state
      }
    };
    loadData();
  }, [db]);

  // ── Client logic ──────────────────────────────────────────────────────────

  const handleSaveClient = useCallback(async () => {
    if (!clientName.trim()) return;
    try {
      const result = await addClient(db, clientName.trim(), address.trim());
      if (!result.success) {
        Alert.alert("Error", result.error?.message || "No se pudo guardar el cliente");
        return;
      }
      const clientsResult = await getClients(db);
      if (clientsResult.success && clientsResult.data) {
        setSavedClients(clientsResult.data);
      }
    } catch (e) {
      Alert.alert("Error", "No se pudo guardar el cliente");
    }
  }, [db, clientName, address]);

  const exactMatch = savedClients.find(
    (c) => c.name.toLowerCase() === clientName.trim().toLowerCase()
  );

  const filteredClients = savedClients.filter((c) =>
    c.name.toLowerCase().includes(clientName.trim().toLowerCase())
  );

  const showDropdown = isFocused && filteredClients.length > 0 && !exactMatch;

  const handleSelectClient = useCallback((client: Client) => {
    setClientName(client.name);
    if (client.address) setAddress(client.address);
    setIsFocused(false);
  }, []);

  const handleClientFocus = useCallback(() => setIsFocused(true), []);
  const handleClientBlur = useCallback(
    () => setTimeout(() => setIsFocused(false), 200),
    []
  );

  const handleClientInputLayout = useCallback(
    (y: number, x: number) => setClientInputLayout({ y, x }),
    []
  );

  // ── Date / Time pickers ───────────────────────────────────────────────────

  const onDateChange = useCallback(
    (_event: DateTimePickerEvent, selectedDate?: Date) => {
      setShowDatePicker(false);
      if (selectedDate) setScheduledDate(selectedDate);
    },
    []
  );

  const onTimeChange = useCallback(
    (_event: DateTimePickerEvent, selectedTime?: Date) => {
      setShowTimePicker(false);
      if (selectedTime) setScheduledTime(selectedTime);
    },
    []
  );

  // ── Service multi-select ──────────────────────────────────────────────────

  const selectedServices = description
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const isServiceSelected = useCallback(
    (serviceName: string) => {
      const target = serviceName.trim().toLowerCase();
      return selectedServices.some((s) => s.toLowerCase() === target);
    },
    [selectedServices]
  );

  const handleToggleService = useCallback(
    (serviceName: string) => {
      const target = serviceName.trim();
      const selected = isServiceSelected(target);

      let updated: string[];
      if (selected) {
        updated = selectedServices.filter(
          (s) => s.toLowerCase() !== target.toLowerCase()
        );
      } else {
        updated = [...selectedServices, target];
      }

      setDescription(updated.join(", "));
    },
    [selectedServices, isServiceSelected]
  );

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = useCallback(() => {
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
  }, [clientName, address, description, scheduledDate, scheduledTime, notes, reminderMinutes, onSubmit]);

  // ── Return ────────────────────────────────────────────────────────────────

  return {
    // Form fields
    clientName,
    setClientName,
    address,
    setAddress,
    description,
    setDescription,
    notes,
    setNotes,
    reminderMinutes,
    setReminderMinutes,
    scheduledDate,
    scheduledTime,

    // Client autocomplete
    savedClients,
    filteredClients,
    exactMatch,
    showDropdown,
    clientInputRef,
    clientInputLayout,
    handleSaveClient,
    handleSelectClient,
    handleClientFocus,
    handleClientBlur,
    handleClientInputLayout,

    // Services
    defaultServices,
    selectedServices,
    isServiceSelected,
    handleToggleService,

    // Date / Time
    showDatePicker,
    setShowDatePicker,
    showTimePicker,
    setShowTimePicker,
    onDateChange,
    onTimeChange,

    // Submit
    handleSubmit,
  };
}
