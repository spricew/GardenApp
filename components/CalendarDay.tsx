import { Pressable, Text, View } from 'react-native';

interface CalendarDayProps {
  day: number;
  isToday: boolean;
  isSelected: boolean;
  hasServices: boolean;
  onPress: (day: number) => void;
}

export function CalendarDay({ day, isToday, isSelected, hasServices, onPress }: CalendarDayProps) {
  const bgClass = isSelected
    ? 'bg-midnight'
    : isToday
    ? 'bg-stone-surface'
    : hasServices
    ? 'bg-ember-orange'
    : 'bg-transparent';
  const textClass = isSelected
    ? 'text-white font-bold'
    : isToday
    ? 'text-charcoal-primary font-bold'
    : 'text-charcoal-primary font-medium';

  return (
    <Pressable
      onPress={() => onPress(day)}
      className={`w-10 h-10 rounded-full items-center justify-center mx-auto overflow-hidden ${bgClass} active:scale-95`}
      style={{ borderCurve: 'continuous' }}
    >
      <Text className={`font-sans text-[15px] tracking-tight ${textClass}`}>{day}</Text>
      {hasServices && (isSelected || isToday) && (
        <View
          className={`w-1.5 h-1.5 rounded-full absolute bottom-1 ${
            isSelected ? 'bg-white' : 'bg-black'
          }`}
          style={{ borderCurve: 'continuous' }}
        />
      )}
    </Pressable>
  );
}
