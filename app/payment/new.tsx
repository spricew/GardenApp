import { View, Text, TextInput, ScrollView, Alert, Platform, Button, Pressable } from "react-native";
import { Stack, useRouter } from "expo-router";
import { useState, useEffect, useRef } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { IconUser, IconCurrencyDollar, IconCalendar, IconFileText } from "@tabler/icons-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Card } from "@/components/Card";
import { createPaymentDate } from "@/database/payments";
import { getClients } from "@/database/clients";
import type { PaymentDateFormData, Client } from "@/types";

export default function NewPaymentScreen() {
  const router = useRouter();
  const db = useSQLiteContext();

  const [clientName, setClientName] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [estimatedDate, setEstimatedDate] = useState(new Date());
  const [saving, setSaving] = useState(false);

  const [savedClients, setSavedClients] = useState<Client[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const clientInputRef = useRef<TextInput>(null);
  const [clientInputLayout, setClientInputLayout] = useState({ y: 0, x: 0 });

  useEffect(() => {
    const loadClients = async () => {
      try {
        const result = await getClients(db);
        if (result.success && result.data) {
          setSavedClients(result.data);
        }
      } catch (e) {
        // Error handled by state
      }
    };
    loadClients();
  }, [db]);

  const exactMatch = savedClients.find(
    (c) => c.name.toLowerCase() === clientName.trim().toLowerCase()
  );
  const filteredClients = savedClients.filter((c) =>
    c.name.toLowerCase().includes(clientName.trim().toLowerCase())
  );
  const showDropdown = isFocused && filteredClients.length > 0 && !exactMatch;

  const onDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (selectedDate) setEstimatedDate(selectedDate);
  };

  const formatDate = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };

  const handleSave = async () => {
    if (!clientName.trim()) {
      Alert.alert("Error", "El nombre del cliente es obligatorio");
      return;
    }

    setSaving(true);
    try {
      const data: PaymentDateFormData = {
        client_name: clientName.trim(),
        amount: amount.trim() ? parseFloat(amount.trim()) : null,
        estimated_date: formatDate(estimatedDate),
        notes: notes.trim(),
      };

      await createPaymentDate(db, data);
      router.back();
    } catch (error) {
      console.error("Error creating payment date:", error);
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
                <View className="mb-5">
                  <View className="flex-row items-center gap-1.5 mb-2">
                    <IconUser size={14} color="#343433" strokeWidth={2} />
                    <Text className="font-sans font-semibold text-[15px] text-charcoal-primary tracking-tight">
                      Cliente *
                    </Text>
                  </View>
                  <TextInput
                    ref={clientInputRef}
                    value={clientName}
                    onChangeText={setClientName}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                    onLayout={(e) => {
                      const layout = e.nativeEvent.layout;
                      setClientInputLayout({ y: layout.y + layout.height, x: layout.x });
                    }}
                    placeholder="Nombre del cliente"
                    className="bg-white border border-stone-surface rounded-lg px-4 py-3 font-sans text-[15px] text-graphite overflow-hidden"
                    style={{ borderCurve: "continuous" }}
                    placeholderTextColor="#a7a7a7"
                  />
                </View>

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
              {showDropdown && (
                <View
                  className="absolute left-6 right-6 rounded-xl bg-white"
                  style={{
                    top: clientInputLayout.y + 24 + 6,
                    zIndex: 999,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 10 },
                    shadowOpacity: 0.14,
                    shadowRadius: 22,
                    elevation: 12,
                    borderCurve: "continuous",
                    borderWidth: 0.5,
                    borderColor: "rgba(0,0,0,0.06)",
                  }}
                >
                  <View
                    className="rounded-xl overflow-hidden"
                    style={{ borderCurve: "continuous" }}
                  >
                    <ScrollView
                      keyboardShouldPersistTaps="handled"
                      nestedScrollEnabled
                      style={{ maxHeight: 324 }}
                    >
                      {filteredClients.map((client, index) => (
                        <Pressable
                          key={client.id}
                          onPress={() => {
                            setClientName(client.name);
                            setIsFocused(false);
                          }}
                          className="active:bg-stone-surface/60"
                          style={{
                            paddingHorizontal: 16,
                            paddingVertical: 12,
                            borderBottomWidth: index !== filteredClients.length - 1 ? 0.5 : 0,
                            borderBottomColor: "rgba(0,0,0,0.06)",
                          }}
                        >
                          <Text className="font-sans text-[16px] text-charcoal-primary font-medium tracking-tight">
                            {client.name}
                          </Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                </View>
              )}
            </View>

            {/* Date */}
            <Card>
              <View className="mb-2">
                <View className="flex-row items-center gap-1.5 mb-2">
                  <IconCalendar size={14} color="#343433" strokeWidth={2} />
                  <Text className="font-sans font-semibold text-[15px] text-charcoal-primary tracking-tight">
                    Fecha Estimada de Pago
                  </Text>
                </View>
                {Platform.OS === "ios" ? (
                  <DateTimePicker
                    value={estimatedDate}
                    mode="date"
                    display="inline"
                    onChange={onDateChange}
                    style={{ alignSelf: "flex-start" }}
                  />
                ) : (
                  <Text className="font-sans text-[15px] text-graphite">
                    {formatDate(estimatedDate)}
                  </Text>
                )}
              </View>
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
