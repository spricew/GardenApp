import { View, Text, Pressable } from 'react-native';
import { useMemo, useEffect } from 'react';
import { IconBell } from '@tabler/icons-react-native';
import { REMINDER_OPTIONS } from "@/types";

interface ReminderPickerProps {
  value: number;
  onChange: (minutes: number) => void;
  scheduledDate?: Date;
  scheduledTime?: Date;
}

export function ReminderPicker({ value, onChange, scheduledDate, scheduledTime }: ReminderPickerProps) {
  const availableOptions = useMemo(() => {
    if (!scheduledDate || !scheduledTime) {
      return REMINDER_OPTIONS;
    }

    const targetDate = new Date(
      scheduledDate.getFullYear(),
      scheduledDate.getMonth(),
      scheduledDate.getDate(),
      scheduledTime.getHours(),
      scheduledTime.getMinutes(),
      0,
      0
    );

    const now = new Date();
    const diffMinutes = Math.floor((targetDate.getTime() - now.getTime()) / (60 * 1000));

    return REMINDER_OPTIONS.filter((option) => {
      // "Sin recordatorio" siempre está disponible
      if (option.value === 0) return true;
      // Solo mostrar recordatorios que ocurran antes del servicio y en el futuro
      return diffMinutes > option.value;
    });
  }, [scheduledDate, scheduledTime]);

  // Si el valor seleccionado actualmente ya no es válido (ej. 2 días antes para un servicio de hoy),
  // ajustar automáticamente al recordatorio válido más cercano o a "Sin recordatorio" (0)
  useEffect(() => {
    const isValueAvailable = availableOptions.some((opt) => opt.value === value);
    if (!isValueAvailable) {
      const validOptions = availableOptions.filter((opt) => opt.value <= value && opt.value > 0);
      const fallback = validOptions.length > 0
        ? validOptions[validOptions.length - 1].value
        : 0;
      onChange(fallback);
    }
  }, [availableOptions, value, onChange]);

  return (
    <View>
      <View className="flex-row items-center gap-1.5 mb-2">
        <IconBell size={14} color="#343433" strokeWidth={2} />
        <Text className="font-sans font-semibold text-[15px] text-charcoal-primary tracking-tight">
          Recordatorio
        </Text>
      </View>
      <View className="flex-row flex-wrap gap-2">
        {availableOptions.map((option) => (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            className={`px-4 py-2 rounded-full overflow-hidden ${value === option.value
                ? 'bg-midnight'
                : 'bg-stone-surface'
              }`}
            style={{ borderCurve: 'continuous' }}
          >
            <Text
              className={`font-sans font-medium text-[14px] tracking-tight ${value === option.value ? 'text-white' : 'text-midnight'
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
