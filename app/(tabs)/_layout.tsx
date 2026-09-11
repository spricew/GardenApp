import { Tabs } from "expo-router";
import { View, Text } from "react-native";
import { IconHome, IconCalendar, IconSettings } from '@tabler/icons-react-native';
import { getTodayISO, formatDateDisplay } from "@/utils/dates";

export default function TabsLayout() {
  const today = formatDateDisplay(getTodayISO());

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: "#f1f1f1", shadowColor: "transparent" },
        headerTintColor: "#343433",
        headerTitleAlign: "center",
        headerTitleStyle: { fontFamily: "Family", fontSize: 23, fontWeight: "500", letterSpacing: -0.44 },
        tabBarActiveTintColor: "#121212",
        tabBarInactiveTintColor: "#a7a7a7",
        tabBarStyle: {
          backgroundColor: "#fbfaf9",
          borderTopColor: "#f2f0ed",
          height: 80,
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
          headerStyle: {
            height: 125,
            backgroundColor: "#f1f1f1",
            shadowColor: "transparent",
            elevation: 0,
          },
          title: "Inicio",
          headerTitle: () => (
            <View>
              <Text style={{ fontFamily: "Family", fontSize: 23, fontWeight: "500", color: "#343433", letterSpacing: -0.44, textAlign: "center" }}>
                Hoy
              </Text>
              <Text style={{ fontFamily: "Inter", fontSize: 13, color: "#848281", marginTop: 2, textTransform: "capitalize", textAlign: "center" }}>
                {today}
              </Text>
            </View>
          ),
          tabBarIcon: ({ color, size }) => <IconHome size={size || 20} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendario",
          tabBarIcon: ({ color, size }) => <IconCalendar size={size || 20} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Ajustes",
          headerShown: false,
          tabBarIcon: ({ color, size }) => <IconSettings size={size || 20} color={color} strokeWidth={2} />,
        }}
      />
    </Tabs>
  );
}
