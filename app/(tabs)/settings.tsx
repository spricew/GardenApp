import { View, Text, ScrollView } from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { NotificationsSection } from "../../components/settings/NotificationsSection";
import { DefaultReminderSection } from "../../components/settings/DefaultReminderSection";
import { AboutSection } from "../../components/settings/AboutSection";

export default function SettingsScreen() {
  const [defaultReminder, setDefaultReminder] = useState(2880);

  return (
    <SafeAreaView className="flex-1 bg-warm-canvas" edges={['top']}>
      <ScrollView className="flex-1 bg-warm-canvas">
        <View className="px-6 pt-12">
          <Text className="font-display font-medium text-display text-charcoal-primary tracking-[-1.14px] mb-8">
            Ajustes
          </Text>

          <NotificationsSection />
          
          <DefaultReminderSection 
            defaultReminder={defaultReminder} 
            setDefaultReminder={setDefaultReminder} 
          />
          
          <AboutSection />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
