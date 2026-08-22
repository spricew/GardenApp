import { View, Text, Pressable } from "react-native";
import { REMINDER_OPTIONS } from "../../types";
import { SettingsCard } from "./SettingsCard";

interface DefaultReminderSectionProps {
  defaultReminder: number;
  setDefaultReminder: (value: number) => void;
}

export function DefaultReminderSection({ defaultReminder, setDefaultReminder }: DefaultReminderSectionProps) {
  return (
    <SettingsCard title="⏰ Recordatorio Predeterminado" titleClassName="mb-2">
      <Text className="font-sans text-[13px] text-ash mb-4">
        Tiempo de aviso previo al crear nuevos servicios
      </Text>

      <View className="gap-2">
        {REMINDER_OPTIONS.map((option) => (
          <Pressable
            key={option.value}
            onPress={() => setDefaultReminder(option.value)}
            className={`flex-row items-center justify-between px-4 py-3 rounded-xl border ${
              defaultReminder === option.value
                ? "bg-stone-surface border-stone-surface"
                : "bg-transparent border-transparent"
            }`}
          >
            <Text
              className={`font-sans text-[15px] ${
                defaultReminder === option.value
                  ? "text-charcoal-primary font-semibold tracking-tight"
                  : "text-graphite font-medium"
              }`}
            >
              {option.label}
            </Text>
            {defaultReminder === option.value && (
              <Text className="text-midnight text-[16px]">✓</Text>
            )}
          </Pressable>
        ))}
      </View>
    </SettingsCard>
  );
}
