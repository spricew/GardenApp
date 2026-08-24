import { View, Text, Pressable } from "react-native";
import { IconBell, IconCheck } from '@tabler/icons-react-native';
import { REMINDER_OPTIONS } from "@/types";
import { Card } from "@/components/Card";

interface DefaultReminderSectionProps {
  defaultReminder: number;
  setDefaultReminder: (value: number) => void;
}

export function DefaultReminderSection({ defaultReminder, setDefaultReminder }: DefaultReminderSectionProps) {
  return (
    <Card>
      <View className="flex-row items-center gap-2 mb-1">
        <IconBell size={16} color="#343433" strokeWidth={2} />
        <Text className="font-sans font-semibold text-[17px] text-charcoal-primary tracking-tight">
          Recordatorio Predeterminado
        </Text>
      </View>
      <Text className="font-sans text-[13px] text-ash mb-4">
        Tiempo de aviso previo al crear nuevos servicios
      </Text>

      <View className="gap-2">
        {REMINDER_OPTIONS.map((option) => (
          <Pressable
            key={option.value}
            onPress={() => setDefaultReminder(option.value)}
            className={`flex-row items-center justify-between px-4 py-3 rounded-lg overflow-hidden ${defaultReminder === option.value
                ? "bg-stone-surface"
                : "bg-transparent"
              }`}
            style={{ borderCurve: 'continuous' }}
          >
            <Text
              className={`font-sans text-[15px] ${defaultReminder === option.value
                  ? "text-charcoal-primary font-semibold tracking-tight"
                  : "text-graphite font-medium"
                }`}
            >
              {option.label}
            </Text>
            {defaultReminder === option.value && (
              <IconCheck size={16} color="#121212" strokeWidth={2.5} />
            )}
          </Pressable>
        ))}
      </View>
    </Card>
  );
}
