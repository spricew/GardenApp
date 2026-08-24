import { View, ScrollView, Alert } from "react-native";
import { useRouter, Stack } from "expo-router";
import { useState } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { createService } from "@/database/services";
import { scheduleServiceReminder } from "@/utils/notifications";
import { updateServiceNotificationId, getServiceById } from "@/database/services";
import type { ServiceFormData } from "@/types";
import { SafeAreaView } from "react-native-safe-area-context";
import { ServiceForm } from "@/components/ServiceForm";

export default function NewServiceScreen() {
  const router = useRouter();
  const db = useSQLiteContext();
  const [saving, setSaving] = useState(false);

  const handleSave = async (data: ServiceFormData) => {
    setSaving(true);
    try {
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
    <>
      <Stack.Screen
        options={{
          title: "Nuevo servicio",
          headerTitleAlign: "center",
          headerBackTitle: "Atrás",
        }}
      />
      <SafeAreaView className="flex-1 bg-warm-canvas" edges={['bottom', 'left', 'right']}>
        <ScrollView keyboardShouldPersistTaps="handled">
          <ServiceForm 
            onSubmit={handleSave} 
            saving={saving} 
            buttonLabel="Guardar Servicio"
          />
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
