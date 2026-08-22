// @ts-ignore - NativeWind CSS import
import "../global.css";
import { Slot } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { Suspense } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { migrateDb } from "../database/migrations";

function LoadingScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-warm-canvas">
      <ActivityIndicator size="large" color="#ff3e00" />
      <Text className="mt-4 text-charcoal-primary font-sans font-medium">Cargando...</Text>
    </View>
  );
}

export default function RootLayout() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <SQLiteProvider databaseName="gardenapp.db" onInit={migrateDb}>
        <Slot />
      </SQLiteProvider>
    </Suspense>
  );
}
