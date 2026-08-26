import { View, Text, ScrollView } from "react-native";
import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { NotificationsSection } from "@/components/settings/NotificationsSection";
import { DefaultReminderSection } from "@/components/settings/DefaultReminderSection";
import { AboutSection } from "@/components/settings/AboutSection";
import { ClientsSection } from "@/components/settings/ClientsSection";
import { DefaultServicesSection } from "@/components/settings/DefaultServicesSection";
import { getDefaultReminder, setDefaultReminderStore } from "@/utils/settings";
import { Card } from "@/components/Card";

export default function SettingsScreen() {
  const [defaultReminder, setDefaultReminder] = useState(2880);

  useEffect(() => {
    const loadSettings = async () => {
      const reminder = await getDefaultReminder();
      setDefaultReminder(reminder);
    };
    loadSettings();
  }, []);

  const handleReminderChange = async (value: number) => {
    setDefaultReminder(value);
    await setDefaultReminderStore(value);
  };

  return (
    <SafeAreaView className="flex-1 bg-warm-canvas" edges={['top']}>
      <ScrollView className="flex-1 bg-warm-canvas">
        <View className="px-6 pt-12 gap-3 pb-12">
          <Text className="font-display font-medium text-display text-charcoal-primary tracking-[-1.14px] pl-2 mb-4">
            Ajustes
          </Text>

          <NotificationsSection />

          <Card extraClassName="py-2">
            <ClientsSection />
            <DefaultServicesSection />
          </Card>


          <DefaultReminderSection
            defaultReminder={defaultReminder}
            setDefaultReminder={handleReminderChange}
          />

          <AboutSection />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
