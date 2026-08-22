import { View, Text, Pressable, Alert } from "react-native";
import { useNotifications } from "../../hooks/useNotifications";
import { SettingsCard } from "./SettingsCard";

export function NotificationsSection() {
  const { hasPermission, requestPermission } = useNotifications();

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
    <SettingsCard title="🔔 Notificaciones">
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
    </SettingsCard>
  );
}
