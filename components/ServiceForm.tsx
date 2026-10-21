import { View, Text, TextInput, Pressable } from "react-native";
import {
  IconMapPin,
  IconAlignLeft,
  IconCalendar,
  IconClock,
  IconFileText,
  IconCheck,
  IconCurrencyDollar,
} from "@tabler/icons-react-native";

import { Card } from "./Card";
import { ClientAutocompleteDropdown, ClientAutocompleteField } from "./ClientAutocomplete";
import { DateTimeInput } from "./DateTimeInput";
import { ReminderPicker } from "./ReminderPicker";
import { useServiceForm } from "@/hooks/useServiceForm";
import type { ServiceFormData } from "@/types";

// Re-export so existing consumers don't break
export type { ServiceFormValues } from "@/types";

interface ServiceFormProps {
  initialValues?: Parameters<typeof useServiceForm>[0]["initialValues"];
  onSubmit: (data: ServiceFormData) => void;
  saving: boolean;
  buttonLabel?: string;
}

export function ServiceForm({
  initialValues,
  onSubmit,
  saving,
  buttonLabel = "Guardar Servicio",
}: ServiceFormProps) {
  const form = useServiceForm({ initialValues, onSubmit });

  return (
    <View className="px-6 pt-2 pb-12 gap-2">
      {/* Client Card + floating dropdown */}
      <View style={{ zIndex: 50 }}>
        <Card>
          {/* Client Name */}
          <ClientAutocompleteField
            value={form.clientName}
            onChangeText={form.setClientName}
            onFocus={form.handleClientFocus}
            onBlur={form.handleClientBlur}
            onLayoutBottom={form.handleClientInputLayout}
            showSaveAction={form.clientName.trim().length > 0 && !form.exactMatch}
            onSaveClient={form.handleSaveClient}
          />

          {/* Address */}
          <View className="mb-5">
            <View className="flex-row items-center gap-1.5 mb-2">
              <IconMapPin size={14} color="#343433" strokeWidth={2} />
              <Text className="font-sans font-semibold text-[15px] text-charcoal-primary tracking-tight">
                Dirección
              </Text>
            </View>
            <TextInput
              value={form.address}
              onChangeText={form.setAddress}
              placeholder="Dirección del servicio"
              className="bg-white border border-stone-surface rounded-lg px-4 py-3 font-sans text-[15px] text-graphite overflow-hidden"
              style={{ borderCurve: "continuous" }}
              placeholderTextColor="#a7a7a7"
            />
          </View>

          {/* Description / Services */}
          <View className="mb-5">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center gap-1.5">
                <IconAlignLeft size={14} color="#343433" strokeWidth={2} />
                <Text className="font-sans font-semibold text-[15px] text-charcoal-primary tracking-tight">
                  Servicios
                </Text>
              </View>
              {form.selectedServices.length > 0 && (
                <Text className="font-sans text-[12px] font-medium text-ash">
                  {form.selectedServices.length}{" "}
                  {form.selectedServices.length === 1
                    ? "seleccionado"
                    : "seleccionados"}
                </Text>
              )}
            </View>
            <TextInput
              value={form.description}
              onChangeText={form.setDescription}
              placeholder="Selecciona servicios o escribe aquí..."
              className="bg-white border border-stone-surface rounded-lg px-4 py-3 font-sans text-[15px] text-graphite overflow-hidden mb-3"
              style={{ borderCurve: "continuous" }}
              placeholderTextColor="#a7a7a7"
            />

            {/* Default Services Pills - Multi-select */}
            {form.defaultServices.length > 0 && (
              <View className="flex-row flex-wrap gap-2">
                {form.defaultServices.map((service) => {
                  const isSelected = form.isServiceSelected(service.name);
                  return (
                    <Pressable
                      key={service.id}
                      onPress={() => form.handleToggleService(service.name)}
                      className={`flex-row items-center gap-1.5 px-3.5 py-2 rounded-full border active:scale-95 ${isSelected
                          ? "bg-midnight border-midnight"
                          : "bg-stone-surface/60 border-stone-surface active:bg-stone-surface"
                        }`}
                      style={{ borderCurve: "continuous" }}
                    >
                      {isSelected && (
                        <IconCheck
                          size={13}
                          color="#ffffff"
                          strokeWidth={2.5}
                        />
                      )}
                      <Text
                        className={`font-sans text-[13px] ${isSelected
                            ? "text-white font-semibold"
                            : "text-charcoal-primary font-medium"
                          }`}
                      >
                        {service.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>
        </Card>

        {/* Floating Clients Dropdown — rendered outside Card to avoid overflow clip */}
        {form.showDropdown && (
          <ClientAutocompleteDropdown
            clients={form.filteredClients}
            top={form.clientInputBottom + 24 + 6}
            onSelect={form.handleSelectClient}
          />
        )}
      </View>

      {/* Date & Time */}
      <Card>
        <View className="gap-5 mb-5">
          <DateTimeInput
            label="Fecha"
            icon={IconCalendar}
            value={form.scheduledDateObj}
            mode="date"
            onChange={form.onDateChange}
            minimumDate={new Date()}
            accentColor="green"
          />
          <DateTimeInput
            label="Hora"
            icon={IconClock}
            value={form.scheduledTimeObj}
            mode="time"
            onChange={form.onTimeChange}
            accentColor="green"
          />
        </View>
      </Card>

      {/* Extra Expenses / Notes */}
      <Card>
        {/* Expense */}
        <View className="mb-5">
          <View className="flex-row items-center gap-1.5 mb-2">
            <IconCurrencyDollar size={14} color="#343433" strokeWidth={2} />
            <Text className="font-sans font-semibold text-[15px] text-charcoal-primary tracking-tight">
              Gastos extra / Inversión
            </Text>
          </View>
          <TextInput
            value={form.expense}
            onChangeText={form.setExpense}
            placeholder="Ej. 150.00 (gasolina, materiales...)"
            keyboardType="decimal-pad"
            className="bg-white border border-stone-surface rounded-lg px-4 py-3 font-sans text-[15px] text-graphite overflow-hidden"
            style={{ borderCurve: "continuous" }}
            placeholderTextColor="#a7a7a7"
          />
        </View>

        {/* Notes */}
        <View className="mb-5">
          <View className="flex-row items-center gap-1.5 mb-2">
            <IconFileText size={14} color="#343433" strokeWidth={2} />
            <Text className="font-sans font-semibold text-[15px] text-charcoal-primary tracking-tight">
              Notas
            </Text>
          </View>
          <TextInput
            value={form.notes}
            onChangeText={form.setNotes}
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
            value={form.reminderMinutes}
            onChange={form.setReminderMinutes}
            scheduledDate={form.scheduledDateObj}
            scheduledTime={form.scheduledTimeObj}
          />
        </View>
      </Card>

      {/* Save Button */}
      <Pressable
        onPress={form.handleSubmit}
        disabled={saving}
        className={`rounded-full py-4 items-center justify-center flex-row gap-2 overflow-hidden ${saving ? "bg-stone-surface" : "bg-midnight active:opacity-80"
          }`}
        style={{ borderCurve: "continuous" }}
      >
        {!saving && <IconCheck size={18} color="#ffffff" strokeWidth={2.5} />}
        <Text
          className={`font-sans font-medium text-[15px] tracking-tight ${saving ? "text-ash" : "text-white"
            }`}
        >
          {saving ? "Guardando..." : buttonLabel}
        </Text>
      </Pressable>
    </View>
  );
}
