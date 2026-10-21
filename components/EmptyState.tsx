import { View, Text } from 'react-native';
import { IconChartBar } from '@tabler/icons-react-native';
import type { Icon } from '@tabler/icons-react-native';

interface EmptyStateProps {
  title: string;
  description: string;
  color: string;
  icon?: Icon;
}

/**
 * Shared empty state for dashboard sections. The icon is configurable so
 * future sections can reuse it without duplicating the layout.
 */
export function EmptyState({
  title,
  description,
  color,
  icon: EmptyIcon = IconChartBar,
}: EmptyStateProps) {
  return (
    <View className="items-center justify-center py-16 bg-[#f8f7f4] rounded-[12px] mt-4 mb-8 mx-1">
      <View
        className="w-[72px] h-[72px] rounded-[72px] items-center justify-center mb-6"
        style={{ backgroundColor: color }}
      >
        <EmptyIcon size={32} color="#ffffff" strokeWidth={2} />
      </View>
      <Text className="font-sans text-[19px] font-semibold text-charcoal-primary tracking-[-0.25px] text-center mb-2">
        {title}
      </Text>
      <Text className="font-sans text-[15px] text-graphite tracking-[-0.2px] text-center max-w-[240px] leading-[22px]">
        {description}
      </Text>
    </View>
  );
}
