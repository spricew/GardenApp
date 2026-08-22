import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import type { Service } from '../types';
import { StatusBadge } from './StatusBadge';
import { formatTimeDisplay } from '../utils/dates';
import { Card } from './Card';

interface ServiceCardProps {
  service: Service;
}

export function ServiceCard({ service }: ServiceCardProps) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push(`/service/${service.id}`)}
      className="active:scale-[0.98]"
    >
      <Card>
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1 mr-4">
            <Text className="font-sans font-semibold text-[19px] text-charcoal-primary tracking-tight" numberOfLines={1}>
              {service.client_name}
            </Text>
            {service.address ? (
              <Text className="font-sans text-[15px] text-graphite mt-1" numberOfLines={1}>
                📍 {service.address}
              </Text>
            ) : null}
          </View>
          <StatusBadge status={service.status} size="sm" />
        </View>

        <View className="flex-row items-center justify-between mt-3">
          <View className="flex-row items-center">
            <Text className="text-sm">🕐</Text>
            <Text className="font-sans text-[15px] text-graphite ml-1">
              {formatTimeDisplay(service.scheduled_time)}
            </Text>
          </View>
          {service.description ? (
            <Text className="font-sans text-[15px] text-ash flex-1 ml-4" numberOfLines={1}>
              {service.description}
            </Text>
          ) : null}
        </View>
      </Card>
    </Pressable>
  );
}
