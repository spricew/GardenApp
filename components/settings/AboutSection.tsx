import { Text } from "react-native";
import { Card } from "../Card";

export function AboutSection() {
  return (
    <Card title="🌿 Acerca de" titleClassName="mb-2" extraClassName="bg-parchment-card">
      <Text className="font-sans text-[15px] font-medium text-graphite mb-1">GardenApp v1.0.0</Text>
      <Text className="font-sans text-[13px] text-ash leading-[1.58]">
        Gestión de servicios de jardinería 100% offline.{"\n"}
        Tus datos se almacenan localmente en tu dispositivo.
      </Text>
    </Card>
  );
}