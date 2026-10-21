import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { DefaultServicesManager } from "@/components/settings/DefaultServicesManager";

export default function DefaultServicesSettingsScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: "Servicios Predeterminados",
          headerTitleAlign: "center",
          headerBackTitle: "Atrás",
        }}
      />
      <SafeAreaView className="flex-1 bg-warm-canvas" edges={["left", "right"]}>
        <DefaultServicesManager />
      </SafeAreaView>
    </>
  );
}
