import { View, Text } from 'react-native';
import { STATUS_CONFIG, type ServiceStatus } from '../types';

interface StatusBadgeProps {
  status: ServiceStatus;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5' : 'px-3 py-1';
  const textSize = size === 'sm' ? 'text-[12px]' : 'text-[13px]';

  return (
    <View className={`rounded-md flex-row items-center ${config.bgColor} ${sizeClasses}`}>
      <Text className={`mr-1 text-[12px]`}>{config.icon}</Text>
      <Text className={`font-sans font-medium ${config.color} ${textSize}`}>{config.label}</Text>
    </View>
  );
}
