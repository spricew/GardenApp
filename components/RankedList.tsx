import { View, Text } from 'react-native';
import type { Icon } from '@tabler/icons-react-native';

export interface RankedListItem {
  name: string;
  value: number;
}

interface RankedListProps {
  items: RankedListItem[];
  formatValue: (value: number) => string;
  icon: Icon;
  /** Inline color used by the icon and progress bar. */
  iconColor: string;
}

/** Ranked items with a proportional bar, used by dashboard breakdown cards. */
export function RankedList({
  items,
  formatValue,
  icon: ListIcon,
  iconColor,
}: RankedListProps) {
  if (items.length === 0) {
    return (
      <Text className="font-sans text-[15px] text-ash tracking-[-0.2px] py-2">
        Sin datos este mes.
      </Text>
    );
  }

  const maxValue = Math.max(...items.map((item) => item.value));

  return (
    <View className="gap-5">
      {items.map((item) => (
        <View key={item.name} className="gap-2.5">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3 flex-1">
              <View className="w-7 h-7 rounded-full items-center justify-center bg-[#f8f7f4]">
                <ListIcon size={16} color={iconColor} strokeWidth={2.5} />
              </View>
              <Text
                className="font-sans text-[15px] text-graphite tracking-[-0.2px] flex-1"
                numberOfLines={1}
              >
                {item.name}
              </Text>
            </View>
            <Text className="font-sans text-[15px] font-medium text-charcoal-primary tracking-[-0.2px]">
              {formatValue(item.value)}
            </Text>
          </View>
          <View className="h-1 bg-[#f2f0ed] rounded-full overflow-hidden ml-[40px]">
            <View
              className="h-full rounded-full"
              style={{
                width: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%`,
                backgroundColor: iconColor,
              }}
            />
          </View>
        </View>
      ))}
    </View>
  );
}
