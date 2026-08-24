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
import { IconArrowLeft, IconCalendar, IconClock, IconMapPin, IconAlignLeft, IconBell, IconFileText, IconTrash, IconCircleCheck, IconPlayerPause, IconRefresh, IconCircleX, Icon } from '@tabler/icons-react-native';
import { useSQLiteContext } from "expo-sqlite";
import { StatusBadge } from "../../components/StatusBadge";
import { Card } from "../../components/Card";
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
import { SafeAreaView } from "react-native-safe-area-context";

const STATUS_ICONS = {
  IconClock,
  IconRefresh,
  IconPlayerPause,
  IconCircleCheck,
  IconCircleX,
};

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
        <Pressable 
          onPress={() => router.back()} 
          className="px-4 py-2 bg-stone-surface rounded-full overflow-hidden"
          style={{ borderCurve: 'continuous' }}
        >
          <Text className="font-sans font-medium text-[14px] text-charcoal-primary">Volver</Text>
        </Pressable>
      </View>
    );
  }

  const availableTransitions = STATUS_TRANSITIONS[service.status] || [];
  const timeTransform = (service.reminder_minutes/60)/24;
  return (
    <SafeAreaView className="flex-1 bg-warm-canvas" edges={['top']}>
      <ScrollView className="flex-1 bg-warm-canvas">
        <View className="px-6 pt-6 pb-12 gap-3">
          {/* Header */}
          <View className="flex-row items-center mb-8">
            <Pressable onPress={() => router.back()} className="mr-4 p-2 rounded-full active:bg-stone-surface">
              <IconArrowLeft size={22} color="#474645" strokeWidth={2} />
            </Pressable>
            <Text className="font-display font-medium text-heading-lg text-charcoal-primary flex-1 tracking-[-1.14px]" numberOfLines={1}>
              {service.client_name}
            </Text>
          </View>

          {/* Status */}
          <Card title="Estado Actual">
            <View className="items-start">
              <StatusBadge status={service.status} />
            </View>
          </Card>

          {/* Details */}
          <Card title="Detalles">
            <View className="gap-4">
              <View className="flex-row items-center">
                <View className="flex-row items-center gap-1.5 w-28">
                  <IconCalendar size={14} color="#848281" strokeWidth={2} />
                  <Text className="font-sans text-[14px] text-ash">Fecha</Text>
                </View>
                <Text className="font-sans text-[15px] text-graphite flex-1 font-medium capitalize">
                  {formatDateDisplay(service.scheduled_date)}
                </Text>
              </View>

              <View className="flex-row items-center">
                <View className="flex-row items-center gap-1.5 w-28">
                  <IconClock size={14} color="#848281" strokeWidth={2} />
                  <Text className="font-sans text-[14px] text-ash">Hora</Text>
                </View>
                <Text className="font-sans text-[15px] text-graphite flex-1 font-medium">
                  {formatTimeDisplay(service.scheduled_time)}
                </Text>
              </View>

              {service.address ? (
                <View className="flex-row items-center">
                  <View className="flex-row items-center gap-1.5 w-28">
                    <IconMapPin size={14} color="#848281" strokeWidth={2} />
                    <Text className="font-sans text-[14px] text-ash">Dirección</Text>
                  </View>
                  <Text className="font-sans text-[15px] text-graphite flex-1">
                    {service.address}
                  </Text>
                </View>
              ) : null}

              {service.description ? (
                <View className="flex-row items-center">
                  <View className="flex-row items-center gap-1.5 w-28">
                    <IconAlignLeft size={14} color="#848281" strokeWidth={2} />
                    <Text className="font-sans text-[14px] text-ash">Servicio</Text>
                  </View>
                  <Text className="font-sans text-[15px] text-graphite flex-1">
                    {service.description}
                  </Text>
                </View>
              ) : null}

              <View className="flex-row items-center">
                <View className="flex-row items-center gap-1.5 w-28">
                  <IconBell size={14} color="#848281" strokeWidth={2} />
                  <Text className="font-sans text-[14px] text-ash">Aviso</Text>
                </View>
                <Text className="font-sans text-[15px] text-graphite flex-1">
                  {timeTransform} día(s) antes
                </Text>
              </View>
            </View>
          </Card>

          {/* Notes */}
          {service.notes ? (
            <Card>
              <View className="flex-row items-center gap-2 mb-3">
                <IconFileText size={16} color="#343433" strokeWidth={2} />
                <Text className="font-sans font-semibold text-[17px] text-charcoal-primary tracking-tight">
                  Notas
                </Text>
              </View>
              <Text className="font-sans text-[15px] text-graphite leading-[1.47]">
                {service.notes}
              </Text>
            </Card>
          ) : null}

          {/* Status Transitions */}
          {availableTransitions.length > 0 && (
            <Card title="Cambiar Estado">
              <View className="gap-3">
                {availableTransitions.map((status) => {
                  const config = STATUS_CONFIG[status];
                  const IconComp = STATUS_ICONS[config.iconName];
                  return (
                    <Pressable
                      key={status}
                      onPress={() => handleStatusChange(status)}
                      className={`flex-row items-center px-4 py-3 rounded-lg overflow-hidden ${config.bgColor} active:opacity-80 gap-2.5`}
                      style={{ borderCurve: 'continuous' }}
                    >
                      <IconComp size={16} color={config.iconColor} strokeWidth={2.2} />
                      <Text className={`font-sans text-[15px] font-medium tracking-tight ${config.color}`}>
                        Marcar como {config.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </Card>
          )}

          {/* Delete */}
          <Pressable
            onPress={handleDelete}
            className="bg-coral-red/10 rounded-full py-4 items-center justify-center flex-row gap-2 overflow-hidden active:opacity-80 mt-2"
            style={{ borderCurve: 'continuous' }}
          >
            <IconTrash size={16} color="#ff2b3a" strokeWidth={2} />
            <Text className="text-coral-red font-sans font-medium text-[15px] tracking-tight">
              Eliminar Servicio
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
