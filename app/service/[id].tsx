import {
  View,
  Text,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
  ActionSheetIOS,
  Platform,
  Modal,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { useState, useEffect, useCallback } from "react";
import { IconArrowLeft, IconCalendar, IconClock, IconMapPin, IconAlignLeft, IconBell, IconFileText, IconTrash, IconCircleCheck, IconPlayerPause, IconRefresh, IconCircleX, IconEdit, IconDots, IconCalendarPlus, IconCurrencyDollar } from '@tabler/icons-react-native';
import { useSQLiteContext } from "expo-sqlite";

import { StatusBadge } from "@/components/StatusBadge";
import { Card } from "@/components/Card";
import { CalendarWidget } from "@/components/CalendarWidget";
import {
  getServiceById,
  updateServiceStatus,
  updateServiceNotificationId,
  deleteService,
  postponeService,
} from "@/database/services";
import {
  cancelServiceReminder,
  rescheduleReminder,
} from "@/utils/notifications";
import { formatDateDisplay, formatTimeDisplay } from "@/utils/dates";
import type { Service, ServiceStatus } from "@/types";
import { STATUS_CONFIG } from "@/types";
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

  // Postpone modal state
  const [showPostponeModal, setShowPostponeModal] = useState(false);
  
  const today = new Date();
  const todayISO = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);
  const [postponeDateStr, setPostponeDateStr] = useState(todayISO);

  const loadService = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const result = await getServiceById(db, Number(id));
      if (result.success && result.data) {
        setService(result.data);
      }
    } catch (error) {
      // Error handled by state
    } finally {
      setLoading(false);
    }
  }, [db, id]);

  useFocusEffect(
    useCallback(() => {
      loadService();
    }, [loadService])
  );

  const handleStatusChange = async (newStatus: ServiceStatus) => {
    if (!service) return;

    if (newStatus === "postponed") {
      const parts = service.scheduled_date.split('-');
      const dateObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      dateObj.setDate(dateObj.getDate() + 1);
      const nextDayStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}-${String(dateObj.getDate()).padStart(2, "0")}`;
      
      const defaultDate = todayISO > nextDayStr ? todayISO : nextDayStr;
      const defaultDateObj = new Date(defaultDate + "T12:00:00");
      
      setPostponeDateStr(defaultDate);
      setCurrentYear(defaultDateObj.getFullYear());
      setCurrentMonth(defaultDateObj.getMonth() + 1);
      setShowPostponeModal(true);
      return;
    }

    try {
      const updateResult = await updateServiceStatus(db, service.id, newStatus);
      if (!updateResult.success) {
        Alert.alert("Error", updateResult.error?.message || "No se pudo actualizar el estado");
        return;
      }

      if (
        (newStatus === "done" || newStatus === "not_done") &&
        service.notification_id
      ) {
        await cancelServiceReminder(service.notification_id);
        await updateServiceNotificationId(db, service.id, null);
      }

      await loadService();
    } catch (error) {
      Alert.alert("Error", "No se pudo actualizar el estado");
    }
  };

  const handleConfirmPostpone = async () => {
    if (!service) return;
    setShowPostponeModal(false);

    try {
      // Cancel existing reminder for the original service
      if (service.notification_id) {
        await cancelServiceReminder(service.notification_id);
        await updateServiceNotificationId(db, service.id, null);
      }

      const result = await postponeService(db, service.id, postponeDateStr);
      if (!result.success) {
        Alert.alert("Error", result.error?.message || "No se pudo posponer el servicio");
        return;
      }

      // Navigate back — the list will refresh via useFocusEffect
      router.back();
    } catch (error) {
      Alert.alert("Error", "No se pudo posponer el servicio");
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
              const deleteResult = await deleteService(db, service.id);
              if (!deleteResult.success) {
                Alert.alert("Error", deleteResult.error?.message || "No se pudo eliminar el servicio");
                return;
              }
              router.back();
            } catch (error) {
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
  
  let reminderDisplay = "";
  if (!service.reminder_minutes || service.reminder_minutes <= 0) {
    reminderDisplay = "Sin recordatorio";
  } else if (service.reminder_minutes < 60) {
    reminderDisplay = `${service.reminder_minutes} minuto(s) antes`;
  } else if (service.reminder_minutes < 1440) {
    const hours = Math.round(service.reminder_minutes / 60);
    reminderDisplay = `${hours} hora${hours > 1 ? "s" : ""} antes`;
  } else if (service.reminder_minutes === 10080) {
    reminderDisplay = "1 semana antes";
  } else {
    const days = Math.round(service.reminder_minutes / 1440);
    reminderDisplay = `${days} día${days > 1 ? "s" : ""} antes`;
  }

  const handleOpenActionSheet = () => {
    if (!service) return;
    if (Platform.OS === 'ios') {
      const statusLabels = availableTransitions.map(
        (st) => `Marcar como ${STATUS_CONFIG[st].label}`
      );
      const options = ["Cancelar", "Editar Servicio", ...statusLabels, "Eliminar Servicio"];
      const destructiveIndex = options.length - 1;

      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: service.client_name,
          message: "Opciones del servicio",
          options,
          cancelButtonIndex: 0,
          destructiveButtonIndex: destructiveIndex,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            router.push(`/service/edit/${service.id}`);
          } else if (buttonIndex > 1 && buttonIndex < destructiveIndex) {
            const nextStatus = availableTransitions[buttonIndex - 2];
            handleStatusChange(nextStatus);
          } else if (buttonIndex === destructiveIndex) {
            handleDelete();
          }
        }
      );
    } else {
      Alert.alert("Opciones", service.client_name, [
        { text: "Cancelar", style: "cancel" },
        { text: "Editar Servicio", onPress: () => router.push(`/service/edit/${service.id}`) },
        { text: "Eliminar Servicio", style: "destructive", onPress: handleDelete },
      ]);
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: service.client_name,
          headerTitleAlign: 'center',
          headerRight: () => (
            <View className="flex-row items-center gap-1">
              <Pressable 
                onPress={() => router.push(`/service/edit/${service.id}`)} 
                className="p-2 active:opacity-50"
              >
                <IconEdit size={22} color="#ff3e00" strokeWidth={2} />
              </Pressable>
              <Pressable 
                onPress={handleOpenActionSheet} 
                className="p-2 active:opacity-50"
              >
                <IconDots size={22} color="#343433" strokeWidth={2} />
              </Pressable>
            </View>
          )
        }} 
      />
      <SafeAreaView className="flex-1 bg-warm-canvas" edges={['bottom', 'left', 'right']}>
        <ScrollView className="flex-1 bg-warm-canvas">
          <View className="px-6 pt-2 pb-12 gap-3">

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
                  {reminderDisplay}
                </Text>
              </View>

              {service.expense !== null && service.expense !== undefined ? (
                <View className="flex-row items-center">
                  <View className="flex-row items-center gap-1.5 w-28">
                    <IconCurrencyDollar size={14} color="#848281" strokeWidth={2} />
                    <Text className="font-sans text-[14px] text-ash">Gasto extra</Text>
                  </View>
                  <Text className="font-sans text-[15px] text-graphite flex-1 font-medium text-emerald-600">
                    ${service.expense.toFixed(2)}
                  </Text>
                </View>
              ) : null}
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

      {/* Postpone Modal */}
      <Modal
        visible={showPostponeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPostponeModal(false)}
      >
        <Pressable
          className="flex-1 bg-black/30"
          onPress={() => setShowPostponeModal(false)}
        />
        <View
          className="bg-white rounded-t-[32px] px-6 pt-6 pb-10"
          style={{ borderCurve: "continuous" }}
        >
          {/* Handle */}
          <View className="w-10 h-1 bg-stone-surface rounded-full self-center mb-5" />

          <View className="flex-row items-center gap-2 mb-1">
            <IconCalendarPlus size={20} color="#ff3e00" strokeWidth={2} />
            <Text className="font-sans font-semibold text-[19px] text-charcoal-primary tracking-tight">
              Posponer servicio
            </Text>
          </View>
          <Text className="font-sans text-[14px] text-ash mb-5">
            El servicio actual quedará marcado como pospuesto y se creará uno nuevo en la fecha seleccionada.
          </Text>

          <View className="mb-4">
            <CalendarWidget
              currentYear={currentYear}
              currentMonth={currentMonth}
              selectedDate={postponeDateStr}
              todayISO={todayISO}
              minDate={service?.scheduled_date ? (() => {
                const parts = service.scheduled_date.split('-');
                const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
                d.setDate(d.getDate() + 1);
                return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
              })() : undefined}
              onMonthChange={(year, month) => {
                setCurrentYear(year);
                setCurrentMonth(month);
              }}
              onDateSelect={(date) => setPostponeDateStr(date)}
              hideCardWrapper
            />
          </View>

          {/* Confirm button */}
          <Pressable
            onPress={handleConfirmPostpone}
            className="mt-4 bg-midnight rounded-full py-4 items-center justify-center flex-row gap-2 overflow-hidden active:opacity-80"
            style={{ borderCurve: "continuous" }}
          >
            <IconCalendarPlus size={17} color="#ffffff" strokeWidth={2.2} />
            <Text className="font-sans font-semibold text-[15px] text-white tracking-tight">
              Confirmar y posponer
            </Text>
          </Pressable>

          {/* Cancel */}
          <Pressable
            onPress={() => setShowPostponeModal(false)}
            className="mt-2 py-3 items-center active:opacity-50"
          >
            <Text className="font-sans text-[15px] text-ash font-medium">
              Cancelar
            </Text>
          </Pressable>
        </View>
      </Modal>
    </>
  );
}
