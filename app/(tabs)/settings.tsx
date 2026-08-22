import { View, Text, Pressable, Switch, Alert, ScrollView } from "react-native";
import { useState } from "react";
import { useNotifications } from "../../hooks/useNotifications";
import { REMINDER_OPTIONS } from "../../types";

export default function SettingsScreen() {
  const { hasPermission, requestPermission } = useNotifications();
  const [defaultReminder, setDefaultReminder] = useState(30);

  const handleRequestPermission = async () => {
    const granted = await requestPermission();
    if (!granted) {
      Alert.alert(
        "Permisos Necesarios",
        "GardenApp necesita permisos de notificación para enviar recordatorios de tus servicios. Por favor, actívalos en la configuración del dispositivo.",
        [{ text: "Entendido" }]
      );
    }
  };

  return (
    <ScrollView className="flex-1 bg-warm-canvas">
      <View className="px-6 pt-6 pb-12">
        <Text className="font-display font-medium text-[44px] text-charcoal-primary tracking-[-1.14px] leading-[1.09] mb-8">
          Ajustes
        </Text>

        {/* Notifications Section */}
        <View className="bg-white rounded-lg p-6 mb-4 border border-stone-surface shadow-sm">
          <Text className="font-sans font-semibold text-[19px] text-charcoal-primary tracking-tight mb-4">
            🔔 Notificaciones
          </Text>

          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-4">
              <Text className="font-sans font-medium text-[15px] text-charcoal-primary">
                Permisos de notificación
              </Text>
              <Text className="font-sans text-[13px] text-ash mt-1">
                Necesarios para recordatorios
              </Text>
            </View>
            {hasPermission ? (
              <View className="bg-valid-green/10 px-4 py-1.5 rounded-full">
                <Text className="text-valid-green text-[14px] font-sans font-semibold">
                  ✅ Activos
                </Text>
              </View>
            ) : (
              <Pressable
                onPress={handleRequestPermission}
                className="bg-midnight px-5 py-2 rounded-full active:opacity-80"
              >
                <Text className="text-white text-[14px] font-sans font-medium tracking-tight">Activar</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Default Reminder */}
        <View className="bg-white rounded-lg p-6 mb-4 border border-stone-surface shadow-sm">
          <Text className="font-sans font-semibold text-[19px] text-charcoal-primary tracking-tight mb-2">
            ⏰ Recordatorio Predeterminado
          </Text>
          <Text className="font-sans text-[13px] text-ash mb-4">
            Tiempo de aviso previo al crear nuevos servicios
          </Text>

          <View className="gap-2">
            {REMINDER_OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => setDefaultReminder(option.value)}
                className={`flex-row items-center justify-between px-4 py-3 rounded-lg border ${
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
        </View>

        {/* About */}
        <View className="bg-parchment-card rounded-lg p-6 border border-stone-surface">
          <Text className="font-sans font-semibold text-[19px] text-charcoal-primary tracking-tight mb-2">
            🌿 Acerca de
          </Text>
          <Text className="font-sans text-[15px] font-medium text-graphite mb-1">GardenApp v1.0.0</Text>
          <Text className="font-sans text-[13px] text-ash leading-[1.58]">
            Gestión de servicios de jardinería 100% offline.{"\n"}
            Tus datos se almacenan localmente en tu dispositivo.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
