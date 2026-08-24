import { View, Text, Pressable, Alert } from "react-native";
import { IconBell, IconCheck } from '@tabler/icons-react-native';
import { useNotifications } from "../../hooks/useNotifications";
import { Card } from "../Card";

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
    <Card>
      <View className="flex-row items-center gap-2 mb-4">
        <IconBell size={16} color="#343433" strokeWidth={2} />
        <Text className="font-sans font-semibold text-[17px] text-charcoal-primary tracking-tight">
          Notificaciones
        </Text>
      </View>
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
          <View 
            className="bg-valid-green/10 px-3.5 py-1.5 rounded-full overflow-hidden flex-row items-center gap-1.5"
            style={{ borderCurve: 'continuous' }}
          >
            <IconCheck size={13} color="#00c454" strokeWidth={2.5} />
            <Text className="text-valid-green text-[13px] font-sans font-semibold">
              Activos
            </Text>
          </View>
        ) : (
          <Pressable
            onPress={handleRequestPermission}
            className="bg-midnight px-5 py-2 rounded-full overflow-hidden active:opacity-80"
            style={{ borderCurve: 'continuous' }}
          >
            <Text className="text-white text-[14px] font-sans font-medium tracking-tight">Activar</Text>
          </Pressable>
        )}
      </View>
    </Card>
  );
}
