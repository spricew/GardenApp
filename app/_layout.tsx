// @ts-ignore - NativeWind CSS import
import "../global.css";
import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { Suspense } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { migrateDb } from "../database/migrations";
import { initRecurringServices } from "../database/recurring";

async function initDb(db: import("expo-sqlite").SQLiteDatabase) {
  await migrateDb(db);
  await initRecurringServices(db);
}

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
      <SQLiteProvider databaseName="gardenapp.db" onInit={initDb}>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "default",
            gestureEnabled: true,
            fullScreenGestureEnabled: true,
            gestureDirection: "horizontal",
            contentStyle: { backgroundColor: "#f7f6f4" },
            headerStyle: { backgroundColor: "#f7f6f4" },
            headerShadowVisible: false,
            headerTintColor: "#474645",
            headerTitleStyle: { fontWeight: "600" },
          }}
        >
          <Stack.Screen 
            name="(tabs)" 
            options={{ 
              headerShown: false,
              title: "Atrás",
              headerBackTitle: "Atrás",
            }} 
          />
          <Stack.Screen 
            name="service/[id]" 
            options={{ 
              headerShown: true,
              title: "Detalles",
              headerBackTitle: "Atrás",
            }} 
          />
          <Stack.Screen 
            name="service/new" 
            options={{ 
              headerShown: true,
              title: "Nuevo servicio",
              headerTitleAlign: "center",
              headerBackTitle: "Atrás",
            }} 
          />
          <Stack.Screen 
            name="service/edit/[id]" 
            options={{ 
              headerShown: true,
              title: "Editar servicio",
              headerTitleAlign: "center",
              headerBackTitle: "Atrás",
            }} 
          />
        </Stack>
      </SQLiteProvider>
    </Suspense>
  );
}
