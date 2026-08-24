import { View, Text, FlatList, Pressable, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { IconInbox, IconPlus } from '@tabler/icons-react-native';
import { useServices } from "../../hooks/useServices";
import { ServiceCard } from "../../components/ServiceCard";
import { StatusBadge } from "../../components/StatusBadge";
import { getTodayISO, formatDateDisplay } from "../../utils/dates";
import { SafeAreaView } from "react-native-safe-area-context";
import type { ServiceStatus } from "../../types";
import { Card } from "@/components/Card";

const FILTER_OPTIONS: { label: string; value: ServiceStatus | "all" }[] = [
  { label: "Todos", value: "all" },
  { label: "Pendientes", value: "pending" },
  { label: "En Proceso", value: "in_progress" },
  { label: "Realizados", value: "done" },
  { label: "Pospuestos", value: "postponed" },
  { label: "No Realizados", value: "not_done" },
];

export default function TodayScreen() {
  const router = useRouter();
  const today = getTodayISO();
  const { services, loading } = useServices(today);
  const [filter, setFilter] = useState<ServiceStatus | "all">("all");

  const filteredServices =
    filter === "all" ? services : services.filter((s) => s.status === filter);

  return (
    <SafeAreaView className="flex-1 bg-warm-canvas" edges={['top']}>
      <View className="flex-1 bg-warm-canvas">
        {/* Filter chips */}
        <View className="pb-4">
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={FILTER_OPTIONS}
            keyExtractor={(item) => item.value}
            style={{ flexGrow: 0 }}
            contentContainerStyle={{ paddingHorizontal: 24 }}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => setFilter(item.value)}
                className={`mr-3 px-4 py-2 rounded-full overflow-hidden ${filter === item.value
                    ? "bg-midnight"
                    : "bg-stone-surface"
                  }`}
                style={{ borderCurve: 'continuous' }}
              >
                <Text
                  className={`font-sans font-medium text-[14px] tracking-tight ${filter === item.value ? "text-white" : "text-midnight"
                    }`}
                >
                  {item.label}
                </Text>
              </Pressable>
            )}
          />
        </View>

        {/* Services List */}
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#ff3e00" />
          </View>
        ) : filteredServices.length === 0 ? (
          <View className="flex-1 px-6 pt-2">
            <Card className="items-center py-12">
              <View className="w-16 h-16 rounded-full bg-stone-surface items-center justify-center mb-5" style={{ borderCurve: 'continuous' }}>
                <IconInbox size={28} color="#848281" strokeWidth={1.8} />
              </View>
              <Text className="font-sans text-[20px] font-semibold text-charcoal-primary tracking-tight text-center">
                {filter === "all"
                  ? "No hay servicios agendados para hoy"
                  : "No hay servicios con ese estado"}
              </Text>
              <Text className="font-sans text-[14px] text-ash text-center mt-2">
                Presiona el botón + para agregar un servicio
              </Text>
            </Card>
          </View>
        ) : (
          <FlatList
            data={filteredServices}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100, gap: 6 }}
            renderItem={({ item }) => <ServiceCard service={item} />}
          />
        )}

        {/* FAB */}
        <Pressable
          onPress={() => router.push("/service/new")}
          className="absolute bottom-8 right-8 w-14 h-14 rounded-full bg-midnight items-center justify-center shadow-lg overflow-hidden active:bg-charcoal-primary"
          style={{ borderCurve: 'continuous' }}
        >
          <IconPlus size={24} color="#ffffff" strokeWidth={2.2} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
