import { Pressable, Text, View } from 'react-native';
import {
  IconChevronLeft,
  IconChevronRight,
} from '@tabler/icons-react-native';

import { getMonthName } from '@/utils/dates';

interface MonthNavigatorProps {
  year: number;
  month: number;
  onPrevious: () => void;
  onNext: () => void;
}

/** Month/year header with previous/next controls for the dashboard. */
export function MonthNavigator({
  year,
  month,
  onPrevious,
  onNext,
}: MonthNavigatorProps) {
  return (
    <View className="flex-row items-center justify-between pt-8 pb-10">
      <Pressable
        onPress={onPrevious}
        accessibilityRole="button"
        accessibilityLabel="Mes anterior"
        className="p-3 bg-white border border-[#f2f0ed] rounded-full active:bg-[#f8f7f4]"
      >
        <IconChevronLeft size={20} color="#343433" strokeWidth={2.5} />
      </Pressable>

      <View className="items-center">
        <Text className="font-display font-medium text-heading text-[#343433] tracking-tighter capitalize">
          {getMonthName(month)}
        </Text>
        <Text className="font-sans text-[17px] text-[#848281]">{year}</Text>
      </View>

      <Pressable
        onPress={onNext}
        accessibilityRole="button"
        accessibilityLabel="Mes siguiente"
        className="p-3 bg-white border border-[#f2f0ed] rounded-full active:bg-[#f8f7f4]"
      >
        <IconChevronRight size={20} color="#343433" strokeWidth={2.5} />
      </Pressable>
    </View>
  );
}
