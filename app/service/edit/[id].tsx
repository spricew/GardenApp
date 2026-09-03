import { View, ScrollView, Alert, ActivityIndicator } from "react-native";
import { useRouter, Stack, useLocalSearchParams } from "expo-router";
import { useState, useEffect, useCallback } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { updateService, getServiceById, updateServiceNotificationId } from "@/database/services";
import { scheduleServiceReminder, cancelServiceReminder } from "@/utils/notifications";
import { combineDateAndTime } from "@/utils/dates";
import type { ServiceFormData, Service } from "@/types";
import { SafeAreaView } from "react-native-safe-area-context";
import { ServiceForm, type ServiceFormValues } from "@/components/ServiceForm";

export default function EditServiceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const db = useSQLiteContext();
  const [saving, setSaving] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [originalService, setOriginalService] = useState<Service | null>(null);
  const [initialValues, setInitialValues] = useState<ServiceFormValues | null>(null);

  const loadService = useCallback(async () => {
    if (!id) return;
    try {
      const result = await getServiceById(db, Number(id));
      if (result.success && result.data) {
        const service = result.data;
        setOriginalService(service);
        
        const dateObj = combineDateAndTime(service.scheduled_date, service.scheduled_time || "12:00") || new Date();
        
        setInitialValues({
          client_name: service.client_name,
          address: service.address || "",
          description: service.description || "",
          notes: service.notes || "",
          reminder_minutes: service.reminder_minutes,
          scheduled_date: dateObj,
          scheduled_time: dateObj,
        });
      }
    } catch (error) {
      // Error handled by state
    } finally {
      setLoading(false);
    }
  }, [db, id]);

  useEffect(() => {
    loadService();
  }, [loadService]);

  const handleSave = async (data: ServiceFormData) => {
    if (!id || !originalService) return;

    setSaving(true);
    try {
      const updateResult = await updateService(db, Number(id), data);
      if (!updateResult.success) {
        Alert.alert("Error", updateResult.error?.message || "No se pudo actualizar el servicio");
        return;
      }

      if (originalService.notification_id) {
        await cancelServiceReminder(originalService.notification_id);
      }
      
      const serviceResult = await getServiceById(db, Number(id));
      if (serviceResult.success && serviceResult.data) {
        const notificationId = await scheduleServiceReminder(serviceResult.data);
        await updateServiceNotificationId(db, Number(id), notificationId || null);
      }

      router.back();
    } catch (error) {
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
        <ScrollView keyboardShouldPersistTaps="handled">
          {initialValues && (
            <ServiceForm 
              initialValues={initialValues}
              onSubmit={handleSave} 
              saving={saving}
              buttonLabel="Guardar Cambios"
            />
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
