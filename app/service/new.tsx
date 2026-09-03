import { View, ScrollView, Alert, ActivityIndicator } from "react-native";
import { useRouter, Stack } from "expo-router";
import { useState, useEffect } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { createService, updateServiceNotificationId, getServiceById } from "@/database/services";
import { scheduleServiceReminder } from "@/utils/notifications";
import type { ServiceFormData } from "@/types";
import { SafeAreaView } from "react-native-safe-area-context";
import { ServiceForm } from "@/components/ServiceForm";
import { getDefaultReminder } from "@/utils/settings";

export default function NewServiceScreen() {
  const router = useRouter();
  const db = useSQLiteContext();
  const [saving, setSaving] = useState(false);
  const [initialReminder, setInitialReminder] = useState<number | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      const reminder = await getDefaultReminder();
      setInitialReminder(reminder);
    };
    loadSettings();
  }, []);

  const handleSave = async (data: ServiceFormData) => {
    setSaving(true);
    try {
      const createResult = await createService(db, data);
      if (!createResult.success || createResult.data === undefined) {
        Alert.alert("Error", createResult.error?.message || "No se pudo guardar el servicio");
        return;
      }
      const id = createResult.data;

      const serviceResult = await getServiceById(db, id);
      if (serviceResult.success && serviceResult.data) {
        const notificationId = await scheduleServiceReminder(serviceResult.data);
        if (notificationId) {
          await updateServiceNotificationId(db, id, notificationId);
        }
      }

      router.back();
    } catch (error) {
      Alert.alert("Error", "No se pudo guardar el servicio");
    } finally {
      setSaving(false);
    }
  };

  if (initialReminder === null) {
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
          title: "Nuevo servicio",
          headerTitleAlign: "center",
          headerBackTitle: "Atrás",
        }}
      />
      <SafeAreaView className="flex-1 bg-warm-canvas" edges={['left', 'right']}>
        <ScrollView keyboardShouldPersistTaps="handled">
          <ServiceForm 
            initialValues={{ reminder_minutes: initialReminder }}
            onSubmit={handleSave} 
            saving={saving} 
            buttonLabel="Guardar Servicio"
          />
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
