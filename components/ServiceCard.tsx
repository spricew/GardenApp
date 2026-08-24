import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { IconMapPin, IconClock } from '@tabler/icons-react-native';
import type { Service } from "@/types";
import { StatusBadge } from './StatusBadge';
import { formatTimeDisplay } from "@/utils/dates";
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
              <View className="flex-row items-center gap-1.5 mt-1.5">
                <IconMapPin size={13} color="#848281" strokeWidth={2} />
                <Text className="font-sans text-[14px] text-graphite flex-1" numberOfLines={1}>
                  {service.address}
                </Text>
              </View>
            ) : null}
          </View>
          <StatusBadge status={service.status} size="sm" />
        </View>

        <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-stone-surface">
          <View className="flex-row items-center gap-1.5">
            <IconClock size={13} color="#848281" strokeWidth={2} />
            <Text className="font-sans text-[14px] text-graphite font-medium">
              {formatTimeDisplay(service.scheduled_time)}
            </Text>
          </View>
          {service.description ? (
            <Text className="font-sans text-[14px] text-ash flex-1 ml-4 text-right" numberOfLines={1}>
              {service.description}
            </Text>
          ) : null}
        </View>
      </Card>
    </Pressable>
  );
}
