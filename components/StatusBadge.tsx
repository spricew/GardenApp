import { View, Text } from 'react-native';
import { IconClock, IconRefresh, IconPlayerPause, IconCircleCheck, IconCircleX } from '@tabler/icons-react-native';
import { STATUS_CONFIG, type ServiceStatus } from "@/types";

const STATUS_ICONS = {
  IconClock,
  IconRefresh,
  IconPlayerPause,
  IconCircleCheck,
  IconCircleX,
};

interface StatusBadgeProps {
  status: ServiceStatus;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5' : 'px-2.5 py-1';
  const textSize = size === 'sm' ? 'text-[12px]' : 'text-[13px]';
  const iconSize = size === 'sm' ? 11 : 13;
  const IconComponent = STATUS_ICONS[config.iconName];

  return (
    <View 
      className={`rounded-md flex-row items-center gap-1.5 overflow-hidden ${config.bgColor} ${sizeClasses}`}
      style={{ borderCurve: 'continuous' }}
    >
      <IconComponent size={iconSize} color={config.iconColor} strokeWidth={2.2} />
      <Text className={`font-sans font-medium ${config.color} ${textSize}`}>{config.label}</Text>
    </View>
  );
}
