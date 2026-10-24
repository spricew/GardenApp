import {
  View,
  Text,
  SectionList,
  FlatList,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useCallback, useMemo, useState } from "react";
import {
  IconCalendarEvent,
  IconChevronDown,
  IconHistory,
  IconInbox,
  IconReceipt2,
} from "@tabler/icons-react-native";
import { useAllServices } from "@/hooks/useServices";
import { usePayments } from "@/hooks/usePayments";
import { ServiceCard } from "@/components/ServiceCard";
import { PaymentCard } from "@/components/PaymentCard";
import { ServiceDateHeader } from "@/components/ServiceDateHeader";
import { Card } from "@/components/Card";
import { FABMenu } from "@/components/FABMenu";
import { getTodayISO } from "@/utils/dates";
import {
  filterServicesByStatus,
  splitServiceAgenda,
  type ServiceDateGroup,
} from "@/utils/service";
import type { Service, ServiceStatus } from "@/types";

const FILTER_OPTIONS: { label: string; value: ServiceStatus | "all" }[] = [
  { label: "Todos", value: "all" },
  { label: "Pendientes", value: "pending" },
  { label: "En Proceso", value: "in_progress" },
  { label: "Realizados", value: "done" },
  { label: "Pospuestos", value: "postponed" },
  { label: "No Realizados", value: "not_done" },
];

/** SectionList needs `data`, so the date groups are adapted at this boundary. */
interface AgendaSection {
  date: string;
  data: Service[];
  kind: "upcoming" | "past";
}

function ServiceSeparator() {
  return <View className="h-1.5" />;
}

export default function AgendaScreen() {
  const today = getTodayISO();
  const { services, loading: servicesLoading, error: servicesError } =
    useAllServices();
  const {
    payments,
    loading: paymentsLoading,
    togglePaid,
    removePayment,
  } = usePayments(today);

  const [filter, setFilter] = useState<ServiceStatus | "all">("all");
  const [showHistory, setShowHistory] = useState(false);

  const loading = servicesLoading || paymentsLoading;

  const filteredServices = useMemo(
    () => filterServicesByStatus(services, filter),
    [filter, services]
  );

  const { upcoming, past } = useMemo(
    () => splitServiceAgenda(filteredServices, today),
    [filteredServices, today]
  );

  const pastServiceCount = useMemo(
    () => past.reduce((total, group) => total + group.services.length, 0),
    [past]
  );

  const sections = useMemo<AgendaSection[]>(() => {
    const toSection = (
      group: ServiceDateGroup,
      kind: AgendaSection["kind"]
    ): AgendaSection => ({
      date: group.date,
      data: group.services,
      kind,
    });

    const upcomingSections = upcoming.map((group) =>
      toSection(group, "upcoming")
    );

    if (!showHistory) return upcomingSections;

    return [
      ...upcomingSections,
      ...past.map((group) => toSection(group, "past")),
    ];
  }, [past, showHistory, upcoming]);

  const toggleHistory = useCallback(() => {
    setShowHistory((current) => !current);
  }, []);

  const hasPayments = payments.length > 0;
  const canShowHistory = pastServiceCount > 0;

  const emptyState = useMemo(() => {
    if (servicesError) {
      return {
        title: "No se pudieron cargar los servicios",
        description: servicesError,
      };
    }

    if (services.length === 0) {
      return {
        title: "Aún no hay servicios",
        description: "Agenda tu primer servicio con el botón +.",
      };
    }

    if (canShowHistory && !showHistory) {
      return {
        title:
          filter === "all"
            ? "No hay servicios próximos"
            : "No hay servicios próximos con ese estado",
        description: "Consulta los servicios anteriores desde el historial.",
      };
    }

    return {
      title: "No hay servicios con ese estado",
      description: "Cambia el filtro o agenda un nuevo servicio.",
    };
  }, [canShowHistory, filter, services.length, servicesError, showHistory]);

  const listHeader = (
    <View>
      {hasPayments ? (
        <View className="mb-3">
          <View className="flex-row items-center gap-1.5 mb-3 pl-2">
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
        </View>
      ) : null}

      <View
        className={`flex-row items-center justify-between pl-2 ${
          hasPayments ? "mt-3" : "mt-1"
        }`}
      >
        <View className="flex-row items-center gap-1.5">
          <IconCalendarEvent size={16} color="#0090ff" strokeWidth={2.2} />
          <Text className="font-display font-medium text-[18px] text-charcoal-primary tracking-tight">
            Servicios
          </Text>
        </View>

        {canShowHistory ? (
          <Pressable
            onPress={toggleHistory}
            accessibilityRole="button"
            accessibilityLabel={
              showHistory
                ? "Ocultar historial de servicios"
                : `Mostrar historial de ${pastServiceCount} servicios`
            }
            accessibilityState={{ expanded: showHistory }}
            className="flex-row items-center gap-1.5 px-2 py-1.5 rounded-full active:bg-stone-surface"
            style={{ borderCurve: "continuous" }}
          >
            <IconHistory size={14} color="#474645" strokeWidth={2} />
            <Text className="font-sans text-[13px] font-medium text-graphite">
              {showHistory
                ? "Ocultar historial"
                : `Historial (${pastServiceCount})`}
            </Text>
            <IconChevronDown
              size={14}
              color="#848281"
              strokeWidth={2.2}
              style={{
                transform: [{ rotate: showHistory ? "180deg" : "0deg" }],
              }}
            />
          </Pressable>
        ) : null}
      </View>
    </View>
  );

  const listEmpty = (
    <Card extraClassName="items-center py-12 mt-2">
      <View
        className="w-16 h-16 rounded-full bg-stone-surface items-center justify-center mb-5"
        style={{ borderCurve: "continuous" }}
      >
        <IconInbox size={28} color="#848281" strokeWidth={1.8} />
      </View>
      <Text className="font-sans text-[20px] font-semibold text-charcoal-primary tracking-tight text-center">
        {emptyState.title}
      </Text>
      <Text className="font-sans text-[14px] text-ash text-center mt-2">
        {emptyState.description}
      </Text>
    </Card>
  );

  const listFooter =
    showHistory && canShowHistory ? (
      <Pressable
        onPress={toggleHistory}
        accessibilityRole="button"
        accessibilityLabel="Ocultar historial de servicios"
        className="items-center py-5 active:opacity-70"
      >
        <Text className="font-sans text-[13px] font-medium text-ash">
          Ocultar historial
        </Text>
      </Pressable>
    ) : (
      <View className="h-4" />
    );

  return (
    <View className="flex-1 bg-warm-canvas mt-4">
      {/* Filter chips */}
      <View className="pb-2">
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
              accessibilityRole="button"
              accessibilityState={{ selected: filter === item.value }}
              className={`mr-3 px-4 py-2 rounded-full overflow-hidden ${
                filter === item.value ? "bg-midnight" : "bg-stone-surface"
              }`}
              style={{ borderCurve: "continuous" }}
            >
              <Text
                className={`font-sans font-medium text-[14px] tracking-tight ${
                  filter === item.value ? "text-white" : "text-midnight"
                }`}
              >
                {item.label}
              </Text>
            </Pressable>
          )}
        />
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#ff3e00" />
        </View>
      ) : (
        <SectionList<Service, AgendaSection>
          sections={sections}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <ServiceCard service={item} />}
          renderSectionHeader={({ section }) => (
            <ServiceDateHeader
              date={section.date}
              count={section.data.length}
              todayISO={today}
              isPast={section.kind === "past"}
            />
          )}
          ItemSeparatorComponent={ServiceSeparator}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={listEmpty}
          ListFooterComponent={listFooter}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled
        />
      )}

      {/* FAB Menu */}
      <FABMenu />
    </View>
  );
}
