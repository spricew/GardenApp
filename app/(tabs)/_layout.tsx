import { Tabs } from "expo-router";
import { Text } from "react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: "#fbfaf9", shadowColor: "transparent" },
        headerTintColor: "#343433",
        headerTitleStyle: { fontFamily: "Family", fontSize: 23, fontWeight: "500", letterSpacing: -0.44 },
        tabBarActiveTintColor: "#121212",
        tabBarInactiveTintColor: "#a7a7a7",
        tabBarStyle: {
          backgroundColor: "#fbfaf9",
          borderTopColor: "#f2f0ed",
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
          elevation: 0,
        },
        tabBarLabelStyle: {
          fontFamily: "Inter",
          fontSize: 12,
          fontWeight: "500",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Hoy",
          headerTitle: "Family",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendario",
          headerTitle: "Calendario",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>📅</Text>,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Ajustes",
          headerTitle: "Ajustes",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>⚙️</Text>,
        }}
      />
    </Tabs>
  );
}
