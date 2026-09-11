import { View, Text, FlatList, Pressable, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { IconInbox, IconReceipt2 } from '@tabler/icons-react-native';
import { useServices } from "@/hooks/useServices";
import { usePayments } from "@/hooks/usePayments";
import { ServiceCard } from "@/components/ServiceCard";
import { PaymentCard } from "@/components/PaymentCard";
import { StatusBadge } from "@/components/StatusBadge";
import { getTodayISO, formatDateDisplay } from "@/utils/dates";
import { SafeAreaView } from "react-native-safe-area-context";
import type { ServiceStatus } from "@/types";
import { Card } from "@/components/Card";
import { FABMenu } from "@/components/FABMenu";

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
  const { services, loading: servicesLoading } = useServices(today);
  const { payments, loading: paymentsLoading, togglePaid, removePayment } = usePayments(today);
  const [filter, setFilter] = useState<ServiceStatus | "all">("all");

  const loading = servicesLoading || paymentsLoading;

  const filteredServices =
    filter === "all" ? services : services.filter((s) => s.status === filter);

  return (
    <View className="flex-1 bg-warm-canvas mt-4">
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

      {/* Services & Payments List */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#ff3e00" />
        </View>
      ) : (
        <FlatList
          data={filteredServices}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100, gap: 6 }}
          ListHeaderComponent={
            payments.length > 0 ? (
              <View className="mb-4">
                <View className="flex-row items-center gap-1.5 mb-2 pl-2">
                  <IconReceipt2 size={16} color="#d48f00" strokeWidth={2.2} />
                  <Text className="font-display font-medium text-[18px] text-charcoal-primary tracking-tight">
                    Cobros para hoy ({payments.length})
                  </Text>
                </View>
                {payments.map((payment) => (
                  <PaymentCard
                    key={payment.id}
                    payment={payment}
                    onTogglePaid={togglePaid}
                    onDelete={removePayment}
                  />
                ))}
                {filteredServices.length > 0 && (
                  <View className="border-b border-stone-surface/70 mt-2 mb-3" />
                )}
              </View>
            ) : null
          }
          ListEmptyComponent={
            <Card className="items-center py-12">
              <View
                className="w-16 h-16 rounded-full bg-stone-surface items-center justify-center mb-5"
                style={{ borderCurve: "continuous" }}
              >
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
          }
          renderItem={({ item }) => <ServiceCard service={item} />}
        />
      )}

      {/* FAB Menu */}
      <FABMenu />
    </View>
  );
}
