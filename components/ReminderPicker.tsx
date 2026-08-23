import { View, Text, Pressable } from 'react-native';
import { REMINDER_OPTIONS } from '../types';

interface ReminderPickerProps {
  value: number;
  onChange: (minutes: number) => void;
}

export function ReminderPicker({ value, onChange }: ReminderPickerProps) {
  return (
    <View>
      <Text className="font-sans font-semibold text-[15px] text-charcoal-primary tracking-tight mb-2">⏰ Recordatorio</Text>
      <View className="flex-row flex-wrap gap-2">
        {REMINDER_OPTIONS.map((option) => (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            className={`px-4 py-2 rounded-full overflow-hidden ${
              value === option.value
                ? 'bg-midnight'
                : 'bg-stone-surface'
            }`}
            style={{ borderCurve: 'continuous' }}
          >
            <Text
              className={`font-sans font-medium text-[14px] tracking-tight ${
                value === option.value ? 'text-white' : 'text-midnight'
              }`}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
