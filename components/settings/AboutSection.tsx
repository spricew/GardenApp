import { Text } from "react-native";
import { SettingsCard } from "./SettingsCard";

export function AboutSection() {
  return (
    <SettingsCard title="🌿 Acerca de" titleClassName="mb-2">
      <Text className="font-sans text-[15px] font-medium text-graphite mb-1">GardenApp</Text>
      <Text className="font-sans text-[13px] text-ash leading-[1.58]">
        Versión 1.26.08.22
      </Text>
    </SettingsCard>
  );
}