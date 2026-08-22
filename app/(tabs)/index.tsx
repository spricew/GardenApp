import { View, Text, FlatList, Pressable, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
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
                className={`mr-3 px-4 py-2 rounded-full border ${filter === item.value
                    ? "bg-midnight border-midnight"
                    : "bg-stone-surface border-transparent"
                  }`}
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
              <Text className="text-6xl mb-6">🌱</Text>
              <Text className="font-sans text-[23px] font-medium text-charcoal-primary tracking-tight text-center">
                {filter === "all"
                  ? "No hay servicios agendados para hoy"
                  : "No hay servicios con ese estado"}
              </Text>
              <Text className="font-sans text-[15px] text-graphite text-center mt-4">
                Presiona el botón + para agregar un servicio
              </Text>
            </Card>
          </View>
        ) : (
          <FlatList
            data={filteredServices}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
            renderItem={({ item }) => <ServiceCard service={item} />}
          />
        )}

        {/* FAB */}
        <Pressable
          onPress={() => router.push("/service/new")}
          className="absolute bottom-8 right-8 w-16 h-16 rounded-full bg-midnight items-center justify-center shadow-lg active:bg-charcoal-primary"
        >
          <Text className="text-white text-3xl font-light leading-none">+</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
