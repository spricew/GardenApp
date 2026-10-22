import { useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import {
  IconAlignLeft,
  IconBell,
  IconCalendar,
  IconClock,
  IconCurrencyDollar,
  IconDots,
  IconEdit,
  IconFileText,
  IconMapPin,
  IconTrash,
} from '@tabler/icons-react-native';
import type { Icon } from '@tabler/icons-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/Card';
import { PostponeModal } from '@/components/PostponeModal';
import { showServiceActionsMenu } from '@/components/ServiceActionsMenu';
import { StatusBadge } from '@/components/StatusBadge';
import { STATUS_ICONS } from '@/constants/status';
import { useServiceDetail } from '@/hooks/useServiceDetail';
import { formatDateDisplay, formatTimeDisplay } from '@/utils/dates';
import { formatReminderDisplay, getStatusTransitions } from '@/utils/service';
import { STATUS_CONFIG } from '@/types';
import type { ServiceStatus } from '@/types';

interface DetailFieldProps {
  icon: Icon;
  label: string;
  children: ReactNode;
  valueClassName?: string;
}

/** Label/value row shared by the service detail cards. */
function DetailField({
  icon: FieldIcon,
  label,
  children,
  valueClassName = '',
}: DetailFieldProps) {
  return (
    <View className="flex-row items-center">
      <View className="flex-row items-center gap-1.5 w-28">
        <FieldIcon size={14} color="#848281" strokeWidth={2} />
        <Text className="font-sans text-[14px] text-ash">{label}</Text>
      </View>
      <Text
        className={`font-sans text-[15px] text-graphite flex-1 ${valueClassName}`}
      >
        {children}
      </Text>
    </View>
  );
}

export default function ServiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const detail = useServiceDetail(id);
  const [showPostponeModal, setShowPostponeModal] = useState(false);
  const service = detail.data;

  const handleStatusChange = async (status: ServiceStatus): Promise<void> => {
    const result = await detail.changeStatus(status);

    if (result.outcome === 'postpone-required') {
      setShowPostponeModal(true);
      return;
    }

    if (result.outcome === 'error') {
      Alert.alert('Error', result.message);
    }
  };

  const handleConfirmPostpone = async (date: string): Promise<void> => {
    const result = await detail.postpone(date);
    if (!result.success) {
      Alert.alert('Error', result.message ?? 'No se pudo posponer el servicio');
      return;
    }

    setShowPostponeModal(false);
    router.back();
  };

  const confirmDelete = async (): Promise<void> => {
    const result = await detail.remove();
    if (!result.success) {
      Alert.alert('Error', result.message ?? 'No se pudo eliminar el servicio');
      return;
    }

    router.back();
  };

  const handleDelete = (): void => {
    Alert.alert(
      'Eliminar Servicio',
      '¿Estás seguro de que deseas eliminar este servicio? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            void confirmDelete();
          },
        },
      ]
    );
  };

  if (detail.loading) {
    return (
      <View className="flex-1 items-center justify-center bg-warm-canvas">
        <ActivityIndicator size="large" color="#ff3e00" />
      </View>
    );
  }

  if (!service) {
    return (
      <View className="flex-1 items-center justify-center bg-warm-canvas px-6">
        <Text className="font-sans text-[15px] text-graphite mb-4 text-center">
          {detail.error ?? 'Servicio no encontrado'}
        </Text>
        {detail.error ? (
          <Pressable
            onPress={() => {
              void detail.refresh();
            }}
            className="px-4 py-2 bg-midnight rounded-full overflow-hidden active:opacity-80 mb-2"
            style={{ borderCurve: 'continuous' }}
          >
            <Text className="font-sans font-medium text-[14px] text-white">
              Reintentar
            </Text>
          </Pressable>
        ) : null}
        <Pressable
          onPress={() => router.back()}
          className="px-4 py-2 bg-stone-surface rounded-full overflow-hidden"
          style={{ borderCurve: 'continuous' }}
        >
          <Text className="font-sans font-medium text-[14px] text-charcoal-primary">
            Volver
          </Text>
        </Pressable>
      </View>
    );
  }

  const availableTransitions = getStatusTransitions(service.status);

  const handleOpenActions = (): void => {
    if (detail.saving) return;

    showServiceActionsMenu({
      service,
      transitions: availableTransitions,
      onEdit: () => router.push(`/service/edit/${service.id}`),
      onStatusChange: (status) => {
        void handleStatusChange(status);
      },
      onDelete: handleDelete,
    });
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
                disabled={detail.saving}
                className={`p-2 ${
                  detail.saving ? 'opacity-50' : 'active:opacity-50'
                }`}
              >
                <IconEdit size={22} color="#ff3e00" strokeWidth={2} />
              </Pressable>
              <Pressable
                onPress={handleOpenActions}
                disabled={detail.saving}
                className={`p-2 ${
                  detail.saving ? 'opacity-50' : 'active:opacity-50'
                }`}
              >
                <IconDots size={22} color="#343433" strokeWidth={2} />
              </Pressable>
            </View>
          ),
        }}
      />
      <SafeAreaView
        className="flex-1 bg-warm-canvas"
        edges={['bottom', 'left', 'right']}
      >
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
                <DetailField
                  icon={IconCalendar}
                  label="Fecha"
                  valueClassName="font-medium capitalize"
                >
                  {formatDateDisplay(service.scheduled_date)}
                </DetailField>

                <DetailField
                  icon={IconClock}
                  label="Hora"
                  valueClassName="font-medium"
                >
                  {formatTimeDisplay(service.scheduled_time)}
                </DetailField>

                {service.address ? (
                  <DetailField icon={IconMapPin} label="Dirección">
                    {service.address}
                  </DetailField>
                ) : null}

                {service.description ? (
                  <DetailField icon={IconAlignLeft} label="Servicio">
                    {service.description}
                  </DetailField>
                ) : null}

                <DetailField icon={IconBell} label="Aviso">
                  {formatReminderDisplay(service.reminder_minutes)}
                </DetailField>

                {service.expense !== null && service.expense !== undefined ? (
                  <DetailField
                    icon={IconCurrencyDollar}
                    label="Gasto extra"
                    valueClassName="font-medium text-emerald-600"
                  >
                    ${service.expense.toFixed(2)}
                  </DetailField>
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
                    const StatusIcon = STATUS_ICONS[config.iconName];

                    return (
                      <Pressable
                        key={status}
                        onPress={() => {
                          void handleStatusChange(status);
                        }}
                        disabled={detail.saving}
                        className={`flex-row items-center px-4 py-3 rounded-lg overflow-hidden ${config.bgColor} ${
                          detail.saving ? 'opacity-60' : 'active:opacity-80'
                        } gap-2.5`}
                        style={{ borderCurve: 'continuous' }}
                      >
                        <StatusIcon
                          size={16}
                          color={config.iconColor}
                          strokeWidth={2.2}
                        />
                        <Text
                          className={`font-sans text-[15px] font-medium tracking-tight ${config.color}`}
                        >
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
              disabled={detail.saving}
              className={`bg-coral-red/10 rounded-full py-4 items-center justify-center flex-row gap-2 overflow-hidden mt-2 ${
                detail.saving ? 'opacity-60' : 'active:opacity-80'
              }`}
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

      <PostponeModal
        visible={showPostponeModal}
        scheduledDate={service.scheduled_date}
        saving={detail.saving}
        onClose={() => setShowPostponeModal(false)}
        onConfirm={(date) => {
          void handleConfirmPostpone(date);
        }}
      />
    </>
  );
}
