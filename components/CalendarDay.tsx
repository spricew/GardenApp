import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';

interface CalendarDayProps {
  day: number;
  isToday: boolean;
  isSelected: boolean;
  hasServices: boolean;
  hasPayments?: boolean;
  isDisabled?: boolean;
  onPress: (day: number) => void;
}

export const CalendarDay = memo(function CalendarDay({
  day,
  isToday,
  isSelected,
  hasServices,
  hasPayments = false,
  isDisabled = false,
  onPress,
}: CalendarDayProps) {
  const bgClass = isSelected
    ? 'bg-midnight'
    : isToday
    ? 'bg-stone-surface'
    : hasServices && !isDisabled
    ? 'bg-ember-orange/15'
    : hasPayments && !isDisabled
    ? 'bg-valid-green/15'
    : 'bg-transparent';

  const textClass = isDisabled
    ? 'text-ash/50 font-medium'
    : isSelected
    ? 'text-white font-bold'
    : isToday
    ? 'text-charcoal-primary font-bold'
    : hasServices
    ? 'text-ember-orange font-bold'
    : hasPayments
    ? 'text-valid-green font-bold'
    : 'text-charcoal-primary font-medium';

  return (
    <Pressable
      onPress={() => !isDisabled && onPress(day)}
      disabled={isDisabled}
      className={`w-10 h-10 rounded-full items-center justify-center mx-auto overflow-hidden ${bgClass} ${!isDisabled ? 'active:scale-95' : ''}`}
      style={{ borderCurve: 'continuous' }}
    >
      <Text className={`font-sans text-[15px] tracking-tight ${textClass}`}>{day}</Text>
      
      {/* Indicator dots */}
      <View className="flex-row items-center gap-0.5 absolute bottom-1">
        {hasServices && (
          <View
            className={`w-1.5 h-1.5 rounded-full ${
              isSelected ? 'bg-white' : 'bg-ember-orange'
            }`}
            style={{ borderCurve: 'continuous' }}
          />
        )}
        {hasPayments && (
          <View
            className={`w-1.5 h-1.5 rounded-full ${
              isSelected ? 'bg-white' : 'bg-valid-green'
            }`}
            style={{ borderCurve: 'continuous' }}
          />
        )}
      </View>
    </Pressable>
  );
});
