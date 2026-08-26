import { View, Text, Pressable } from "react-native";
import { IconListCheck, IconChevronRight } from '@tabler/icons-react-native';
import { Card } from "@/components/Card";
import { useRouter } from "expo-router";

export function DefaultServicesSection() {
  const router = useRouter();

  return (
    <View className="py-4">
      {/* <Card extraClassName="bg-parchment-card"> */}
        <Pressable
          onPress={() => router.push('/settings/services')}
          className="flex-row items-center justify-between active:opacity-50"
        >
          <View className="flex-row items-center gap-2">
            <IconListCheck size={16} color="#343433" strokeWidth={2} />
            <Text className="font-sans font-semibold text-[17px] text-charcoal-primary tracking-tight">
              Servicios Predeterminados
            </Text>
          </View>
          <IconChevronRight size={20} color="#a7a7a7" strokeWidth={2} />
        </Pressable>
      {/* </Card> */}
    </View>

  );
}
