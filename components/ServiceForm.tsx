import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Platform,
} from "react-native";
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
import DateTimePicker from "@react-native-community/datetimepicker";

import { Card } from "./Card";
import { ReminderPicker } from "./ReminderPicker";
import {
  useServiceForm,
  formatDateForDisplay,
  formatTimeForDisplay,
} from "@/hooks/useServiceForm";
import type { ServiceFormData } from "@/types";

// Re-export so existing consumers don't break
export type { ServiceFormValues } from "@/hooks/useServiceForm";

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
          <View className="mb-5">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center gap-1.5">
                <IconUser size={14} color="#343433" strokeWidth={2} />
                <Text className="font-sans font-semibold text-[15px] text-charcoal-primary tracking-tight">
                  Cliente *
                </Text>
              </View>
              {form.clientName.trim().length > 0 && !form.exactMatch && (
                <Pressable
                  onPress={form.handleSaveClient}
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
              ref={(ref) => {
                form.clientInputRef.current = ref;
              }}
              value={form.clientName}
              onChangeText={form.setClientName}
              onFocus={form.handleClientFocus}
              onBlur={form.handleClientBlur}
              onLayout={(e) => {
                const layout = e.nativeEvent.layout;
                form.handleClientInputLayout(
                  layout.y + layout.height,
                  layout.x
                );
              }}
              placeholder="Nombre del cliente"
              className="bg-white border border-stone-surface rounded-lg px-4 py-3 font-sans text-[15px] text-graphite overflow-hidden"
              style={{ borderCurve: "continuous" }}
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
                      className={`flex-row items-center gap-1.5 px-3.5 py-2 rounded-full border active:scale-95 ${
                        isSelected
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
                        className={`font-sans text-[13px] ${
                          isSelected
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
          <View
            className="absolute left-6 right-6 rounded-xl overflow-hidden bg-white"
            style={{
              top: form.clientInputLayout.y + 24 + 6,
              zIndex: 999,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.15,
              shadowRadius: 16,
              elevation: 10,
              borderCurve: "continuous",
              borderWidth: 0.5,
              borderColor: "rgba(0,0,0,0.08)",
            }}
          >
            <ScrollView
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
              style={{ maxHeight: 220 }}
            >
              {form.filteredClients.map((client, index) => (
                <Pressable
                  key={client.id}
                  onPress={() => form.handleSelectClient(client)}
                  className="active:bg-stone-surface/60"
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderBottomWidth:
                      index !== form.filteredClients.length - 1 ? 0.5 : 0,
                    borderBottomColor: "rgba(0,0,0,0.06)",
                  }}
                >
                  <Text className="font-sans text-[16px] text-charcoal-primary font-medium tracking-tight">
                    {client.name}
                  </Text>
                  {client.address && (
                    <Text
                      className="font-sans text-[13px] text-ash mt-0.5"
                      numberOfLines={1}
                    >
                      {client.address}
                    </Text>
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

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
                value={form.scheduledDate}
                mode="date"
                display="inline"
                onChange={form.onDateChange}
                minimumDate={new Date()}
                style={{ alignSelf: "flex-start" }}
                accentColor="green"
              />
            ) : (
              <Pressable
                onPress={() => form.setShowDatePicker(true)}
                className="bg-white border border-stone-surface rounded-lg px-4 py-3 overflow-hidden"
                style={{ borderCurve: "continuous" }}
              >
                <Text className="font-sans text-[15px] text-graphite">
                  {formatDateForDisplay(form.scheduledDate)}
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
                value={form.scheduledTime}
                mode="time"
                display="compact"
                onChange={form.onTimeChange}
                style={{ alignSelf: "flex-start" }}
                accentColor="green"
              />
            ) : (
              <Pressable
                onPress={() => form.setShowTimePicker(true)}
                className="bg-white border border-stone-surface rounded-lg px-4 py-3 overflow-hidden"
                style={{ borderCurve: "continuous" }}
              >
                <Text className="font-sans text-[15px] text-graphite">
                  {formatTimeForDisplay(form.scheduledTime)}
                </Text>
              </Pressable>
            )}
          </View>
        </View>

        {form.showDatePicker && Platform.OS === "android" && (
          <DateTimePicker
            value={form.scheduledDate}
            mode="date"
            display="default"
            onChange={form.onDateChange}
            minimumDate={new Date()}
          />
        )}

        {form.showTimePicker && Platform.OS === "android" && (
          <DateTimePicker
            value={form.scheduledTime}
            mode="time"
            display="default"
            onChange={form.onTimeChange}
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
            scheduledDate={form.scheduledDate}
            scheduledTime={form.scheduledTime}
          />
        </View>
      </Card>

      {/* Save Button */}
      <Pressable
        onPress={form.handleSubmit}
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
