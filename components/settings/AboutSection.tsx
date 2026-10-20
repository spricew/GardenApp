import { View, Text } from "react-native";
import { IconInfoCircle } from '@tabler/icons-react-native';
import Constants from "expo-constants";
import { Card } from "@/components/Card";

const APP_VERSION: string = Constants.expoConfig?.version ?? "1.0.0";

export function AboutSection() {
  return (
    <Card extraClassName="bg-parchment-card">
      <View className="flex-row items-center gap-2 mb-3">
        <IconInfoCircle size={16} color="#343433" strokeWidth={2} />
        <Text className="font-sans font-semibold text-[17px] text-charcoal-primary tracking-tight">
          Acerca de
        </Text>
      </View>
      <Text className="font-sans text-body font-semibold text-graphite mb-1">GardenApp </Text>
      <Text className="font-sans text-caption text-ash ">
        Versión {APP_VERSION}
      </Text>
    </Card>
  );
}