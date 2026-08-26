import { View, Text, Pressable } from "react-native";
import { IconUsers, IconChevronRight } from '@tabler/icons-react-native';
import { Card } from "@/components/Card";
import { useRouter } from "expo-router";

export function ClientsSection() {
  const router = useRouter();

  return (
    <View className="border-b border-stone-surface py-4">
      {/* <Card extraClassName="bg-parchment-card rounded-full"> */}
        <Pressable
          onPress={() => router.push('/settings/clients')}
          className="flex-row items-center justify-between active:opacity-50"
        >
          <View className="flex-row items-center gap-2">
            <IconUsers size={16} color="#343433" strokeWidth={2} />
            <Text className="font-sans font-semibold text-[17px] text-charcoal-primary tracking-tight">
              Clientes Frecuentes
            </Text>
          </View>
          <IconChevronRight size={20} color="#a7a7a7" strokeWidth={2} />
        </Pressable>
      {/* </Card> */}
    </View>
  );
}
