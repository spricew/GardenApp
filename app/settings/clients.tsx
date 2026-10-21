import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { ClientsManager } from "@/components/settings/ClientsManager";

export default function ClientsSettingsScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: "Clientes Frecuentes",
          headerTitleAlign: "center",
          headerBackTitle: "Atrás",
        }}
      />
      <SafeAreaView className="flex-1 bg-warm-canvas" edges={["left", "right"]}>
        <ClientsManager />
      </SafeAreaView>
    </>
  );
}
