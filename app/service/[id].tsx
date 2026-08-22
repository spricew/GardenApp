import {
  View,
  Text,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect, useCallback } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { StatusBadge } from "../../components/StatusBadge";
import {
  getServiceById,
  updateServiceStatus,
  updateServiceNotificationId,
  deleteService,
} from "../../database/services";
import {
  cancelServiceReminder,
  rescheduleReminder,
} from "../../utils/notifications";
import { formatDateDisplay, formatTimeDisplay } from "../../utils/dates";
import type { Service, ServiceStatus } from "../../types";
import { STATUS_CONFIG } from "../../types";

const STATUS_TRANSITIONS: Record<ServiceStatus, ServiceStatus[]> = {
  pending: ["in_progress", "postponed", "not_done"],
  in_progress: ["done", "postponed", "not_done"],
  postponed: ["pending", "in_progress", "not_done"],
  done: ["pending"],
  not_done: ["pending", "postponed"],
};

export default function ServiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const db = useSQLiteContext();

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  const loadService = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const result = await getServiceById(db, Number(id));
      setService(result);
    } catch (error) {
      console.error("Error loading service:", error);
    } finally {
      setLoading(false);
    }
  }, [db, id]);

  useEffect(() => {
    loadService();
  }, [loadService]);

  const handleStatusChange = async (newStatus: ServiceStatus) => {
    if (!service) return;
    try {
      await updateServiceStatus(db, service.id, newStatus);

      // Cancel notification if completed or not done
      if (
        (newStatus === "done" || newStatus === "not_done") &&
        service.notification_id
      ) {
        await cancelServiceReminder(service.notification_id);
        await updateServiceNotificationId(db, service.id, null);
      }

      await loadService();
    } catch (error) {
      console.error("Error updating status:", error);
      Alert.alert("Error", "No se pudo actualizar el estado");
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Eliminar Servicio",
      "¿Estás seguro de que deseas eliminar este servicio? Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            if (!service) return;
            try {
              if (service.notification_id) {
                await cancelServiceReminder(service.notification_id);
              }
              await deleteService(db, service.id);
              router.back();
            } catch (error) {
              console.error("Error deleting service:", error);
              Alert.alert("Error", "No se pudo eliminar el servicio");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-warm-canvas">
        <ActivityIndicator size="large" color="#ff3e00" />
      </View>
    );
  }

  if (!service) {
    return (
      <View className="flex-1 items-center justify-center bg-warm-canvas">
        <Text className="font-sans text-[15px] text-graphite mb-4">Servicio no encontrado</Text>
        <Pressable onPress={() => router.back()} className="px-4 py-2 bg-stone-surface rounded-full">
          <Text className="font-sans font-medium text-[14px] text-charcoal-primary">Volver</Text>
        </Pressable>
      </View>
    );
  }

  const availableTransitions = STATUS_TRANSITIONS[service.status] || [];

  return (
    <ScrollView className="flex-1 bg-warm-canvas">
      <View className="px-6 pt-6 pb-12">
        {/* Header */}
        <View className="flex-row items-center mb-8">
          <Pressable onPress={() => router.back()} className="mr-4 p-1 active:opacity-50">
            <Text className="text-[28px] font-light text-graphite leading-none">←</Text>
          </Pressable>
          <Text className="font-display font-medium text-[44px] text-charcoal-primary flex-1 tracking-[-1.14px] leading-[1.09]" numberOfLines={1}>
            {service.client_name}
          </Text>
        </View>

        {/* Status */}
        <View className="bg-white rounded-lg p-6 mb-4 border border-stone-surface shadow-sm">
          <Text className="font-sans font-semibold text-[15px] text-charcoal-primary tracking-tight mb-3">
            Estado Actual
          </Text>
          <View className="items-start">
            <StatusBadge status={service.status} />
          </View>
        </View>

        {/* Details */}
        <View className="bg-white rounded-lg p-6 mb-4 border border-stone-surface shadow-sm">
          <Text className="font-sans font-semibold text-[15px] text-charcoal-primary tracking-tight mb-4">
            Detalles
          </Text>

          <View className="gap-4">
            <View className="flex-row">
              <Text className="font-sans text-[15px] text-ash w-28">📅 Fecha</Text>
              <Text className="font-sans text-[15px] text-graphite flex-1 font-medium capitalize">
                {formatDateDisplay(service.scheduled_date)}
              </Text>
            </View>

            <View className="flex-row">
              <Text className="font-sans text-[15px] text-ash w-28">🕐 Hora</Text>
              <Text className="font-sans text-[15px] text-graphite flex-1 font-medium">
                {formatTimeDisplay(service.scheduled_time)}
              </Text>
            </View>

            {service.address ? (
              <View className="flex-row">
                <Text className="font-sans text-[15px] text-ash w-28">📍 Dirección</Text>
                <Text className="font-sans text-[15px] text-graphite flex-1">
                  {service.address}
                </Text>
              </View>
            ) : null}

            {service.description ? (
              <View className="flex-row">
                <Text className="font-sans text-[15px] text-ash w-28">📝 Servicio</Text>
                <Text className="font-sans text-[15px] text-graphite flex-1">
                  {service.description}
                </Text>
              </View>
            ) : null}

            <View className="flex-row">
              <Text className="font-sans text-[15px] text-ash w-28">⏰ Aviso</Text>
              <Text className="font-sans text-[15px] text-graphite flex-1">
                {service.reminder_minutes} min antes
              </Text>
            </View>
          </View>
        </View>

        {/* Notes */}
        {service.notes ? (
          <View className="bg-parchment-card rounded-lg p-6 mb-4 border border-stone-surface shadow-sm">
            <Text className="font-sans font-semibold text-[15px] text-charcoal-primary tracking-tight mb-3">
              📋 Notas
            </Text>
            <Text className="font-sans text-[15px] text-graphite leading-[1.47]">
              {service.notes}
            </Text>
          </View>
        ) : null}

        {/* Status Transitions */}
        {availableTransitions.length > 0 && (
          <View className="bg-white rounded-lg p-6 mb-6 border border-stone-surface shadow-sm">
            <Text className="font-sans font-semibold text-[15px] text-charcoal-primary tracking-tight mb-4">
              Cambiar Estado
            </Text>
            <View className="gap-3">
              {availableTransitions.map((status) => {
                const config = STATUS_CONFIG[status];
                return (
                  <Pressable
                    key={status}
                    onPress={() => handleStatusChange(status)}
                    className={`flex-row items-center px-4 py-3 rounded-lg border border-transparent ${config.bgColor} active:opacity-80`}
                  >
                    <Text className="mr-3 text-[19px]">{config.icon}</Text>
                    <Text className={`font-sans text-[15px] font-medium tracking-tight ${config.color}`}>
                      Marcar como {config.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {/* Delete */}
        <Pressable
          onPress={handleDelete}
          className="bg-coral-red/10 rounded-full py-4 items-center active:opacity-80 mt-2"
        >
          <Text className="text-coral-red font-sans font-medium text-[15px] tracking-tight">
            🗑️ Eliminar Servicio
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
