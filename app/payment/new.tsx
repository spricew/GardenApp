import { View, Text, TextInput, ScrollView, Alert, Button } from "react-native";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { IconCurrencyDollar, IconCalendar, IconFileText } from "@tabler/icons-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "@/components/Card";
import { ClientAutocompleteDropdown, ClientAutocompleteField } from "@/components/ClientAutocomplete";
import { DateTimeInput } from "@/components/DateTimeInput";
import { createPaymentDate } from "@/database/payments";
import { useClientAutocomplete } from "@/hooks/useClientAutocomplete";
import { formatDateISO } from "@/utils/dates";
import type { PaymentDateFormData } from "@/types";

export default function NewPaymentScreen() {
  const router = useRouter();
  const db = useSQLiteContext();

  const [clientName, setClientName] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [estimatedDate, setEstimatedDate] = useState(new Date());
  const [saving, setSaving] = useState(false);

  const autocomplete = useClientAutocomplete({
    value: clientName,
    onSelect: (client) => setClientName(client.name),
  });

  const handleSave = async () => {
    if (!clientName.trim()) {
      Alert.alert("Error", "El nombre del cliente es obligatorio");
      return;
    }

    const trimmedAmount = amount.trim();
    const parsedAmount = trimmedAmount
      ? Number.parseFloat(trimmedAmount)
      : null;

    if (parsedAmount !== null && !Number.isFinite(parsedAmount)) {
      Alert.alert("Error", "El monto debe ser un número válido");
      return;
    }

    setSaving(true);
    try {
      const data: PaymentDateFormData = {
        client_name: clientName.trim(),
        amount: parsedAmount,
        estimated_date: formatDateISO(estimatedDate),
        notes: notes.trim(),
      };

      const result = await createPaymentDate(db, data);
      if (!result.success) {
        Alert.alert("Error", result.error?.message || "No se pudo guardar la fecha de pago");
        return;
      }
      router.back();
    } catch {
      Alert.alert("Error", "No se pudo guardar la fecha de pago");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Fecha de Pago",
          headerTitleAlign: "center",
          headerBackTitle: "Atrás",
          headerRight: () => (
            <Button
              title={saving ? "Guardando..." : "Guardar"}
              onPress={handleSave}
              disabled={saving || !clientName.trim()}
            />
          ),
        }}
      />
      <SafeAreaView className="flex-1 bg-warm-canvas" edges={["bottom", "left", "right"]}>
        <ScrollView keyboardShouldPersistTaps="handled">
          <View className="px-6 pt-4 pb-12 gap-2">
            {/* Client + Amount Card with floating dropdown */}
            <View style={{ zIndex: 50 }}>
              <Card>
                {/* Client Name */}
                <ClientAutocompleteField
                  value={clientName}
                  onChangeText={setClientName}
                  onFocus={autocomplete.handleFocus}
                  onBlur={autocomplete.handleBlur}
                  onLayoutBottom={autocomplete.handleInputLayout}
                  error={autocomplete.clientsError ?? undefined}
                />

                {/* Amount */}
                <View className="mb-5">
                  <View className="flex-row items-center gap-1.5 mb-2">
                    <IconCurrencyDollar size={14} color="#343433" strokeWidth={2} />
                    <Text className="font-sans font-semibold text-[15px] text-charcoal-primary tracking-tight">
                      Monto (Opcional)
                    </Text>
                  </View>
                  <TextInput
                    value={amount}
                    onChangeText={setAmount}
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                    className="bg-white border border-stone-surface rounded-lg px-4 py-3 font-sans text-[15px] text-graphite overflow-hidden"
                    style={{ borderCurve: "continuous" }}
                    placeholderTextColor="#a7a7a7"
                  />
                </View>
              </Card>

              {/* Floating Clients Dropdown */}
              {autocomplete.showDropdown && (
                <ClientAutocompleteDropdown
                  clients={autocomplete.filteredClients}
                  top={autocomplete.inputBottom + 24 + 6}
                  onSelect={autocomplete.handleSelectClient}
                  showAddress={false}
                />
              )}
            </View>

            {/* Date */}
            <Card>
              <DateTimeInput
                label="Fecha Estimada de Pago"
                icon={IconCalendar}
                value={estimatedDate}
                mode="date"
                onChange={setEstimatedDate}
              />
            </Card>

            {/* Notes */}
            <Card>
              <View>
                <View className="flex-row items-center gap-1.5 mb-2">
                  <IconFileText size={14} color="#343433" strokeWidth={2} />
                  <Text className="font-sans font-semibold text-[15px] text-charcoal-primary tracking-tight">
                    Notas (Opcional)
                  </Text>
                </View>
                <TextInput
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Detalles del pago..."
                  multiline
                  numberOfLines={3}
                  className="bg-white border border-stone-surface rounded-lg px-4 py-3 font-sans text-[15px] text-graphite min-h-[80px] overflow-hidden"
                  style={{ borderCurve: "continuous" }}
                  placeholderTextColor="#a7a7a7"
                  textAlignVertical="top"
                />
              </View>
            </Card>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
