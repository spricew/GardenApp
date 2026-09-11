import { View, Pressable, StyleSheet, ActionSheetIOS, Platform, Alert } from "react-native";
import { useRouter } from "expo-router";
import { IconPlus } from "@tabler/icons-react-native";

interface FABMenuProps {
  style?: object;
}

export function FABMenu({ style }: FABMenuProps) {
  const router = useRouter();

  const handlePress = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: "Acciones Rápidas",
          message: "¿Qué deseas agendar?",
          options: ["Cancelar", "Crear nuevo servicio", "Añadir fecha de pago"],
          cancelButtonIndex: 0,
        },
        (buttonIndex: number) => {
          if (buttonIndex === 1) {
            router.push("/service/new");
          } else if (buttonIndex === 2) {
            router.push("/payment/new");
          }
        }
      );
    } else {
      Alert.alert("Acciones Rápidas", "¿Qué deseas agendar?", [
        { text: "Cancelar", style: "cancel" },
        { text: "Crear nuevo servicio", onPress: () => router.push("/service/new") },
        { text: "Añadir fecha de pago", onPress: () => router.push("/payment/new") },
      ]);
    }
  };

  return (
    <View style={[styles.container, style]} pointerEvents="box-none">
      <Pressable
        onPress={handlePress}
        style={styles.fab}
        className="active:opacity-80 active:scale-95"
      >
        <IconPlus size={26} color="#ffffff" strokeWidth={2.2} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 32,
    right: 32,
    alignItems: "flex-end",
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#121212",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 8,
  },
});
