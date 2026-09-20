import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useState } from "react";
import {
  IconChevronLeft,
  IconChevronRight,
  IconHammer,
  IconReceipt2,
  IconCurrencyDollar,
  IconCircleCheck,
  IconClock,
  IconRefresh,
  IconPlayerPause,
  IconCircleX,
  IconUser,
  IconAlignLeft,
  IconChartBar,
} from "@tabler/icons-react-native";
import { Stack } from "expo-router";
import { Card } from "@/components/Card";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { getMonthName } from "@/utils/dates";
import { STATUS_CONFIG } from "@/types";
import type { ServiceStatus } from "@/types";

// ── Category definition ─────────────────────────────────────────────────────

type DashboardCategory = "services" | "payments" | "expenses";

const CATEGORIES: { value: DashboardCategory; label: string; icon: typeof IconHammer; color: string }[] = [
  { value: "services", label: "Servicios", icon: IconHammer, color: "#0090ff" },
  { value: "payments", label: "Cobros", icon: IconReceipt2, color: "#d48f00" },
  { value: "expenses", label: "Inversión", icon: IconCurrencyDollar, color: "#00c454" },
];

// ── Status icons map ────────────────────────────────────────────────────────

const STATUS_ICONS: Record<string, typeof IconClock> = {
  IconClock,
  IconRefresh,
  IconPlayerPause,
  IconCircleCheck,
  IconCircleX,
};

// ── Stat row helper ─────────────────────────────────────────────────────────

function StatRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View className="flex-row items-center justify-between py-2.5 border-b border-stone-surface/60">
      <Text className="font-sans text-[14px] text-ash flex-1">{label}</Text>
      <Text
        className={`font-sans text-[15px] font-semibold tracking-tight ${color || "text-charcoal-primary"}`}
      >
        {value}
      </Text>
    </View>
  );
}

// ── Ranked list helper ──────────────────────────────────────────────────────

function RankedList({
  items,
  formatValue,
  icon: ListIcon,
  iconColor,
}: {
  items: { name: string; value: number }[];
  formatValue: (v: number) => string;
  icon: typeof IconUser;
  iconColor: string;
}) {
  if (items.length === 0) {
    return (
      <Text className="font-sans text-[13px] text-ash py-3">Sin datos este mes.</Text>
    );
  }

  const maxValue = Math.max(...items.map((i) => i.value));

  return (
    <View className="gap-2.5">
      {items.map((item, i) => (
        <View key={item.name} className="gap-1.5">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2 flex-1">
              <ListIcon size={13} color={iconColor} strokeWidth={2} />
              <Text
                className="font-sans text-[14px] text-graphite flex-1"
                numberOfLines={1}
              >
                {item.name}
              </Text>
            </View>
            <Text className="font-sans text-[14px] font-semibold text-charcoal-primary tracking-tight">
              {formatValue(item.value)}
            </Text>
          </View>
          {/* Progress bar */}
          <View className="h-1.5 bg-stone-surface/60 rounded-full overflow-hidden">
            <View
              className="h-full rounded-full"
              style={{
                width: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%`,
                backgroundColor: iconColor,
                borderCurve: "continuous",
              }}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

// ── Main screen ─────────────────────────────────────────────────────────────

export default function DashboardScreen() {
  const todayDate = new Date();
  const [currentYear, setCurrentYear] = useState(todayDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(todayDate.getMonth() + 1);
  const [category, setCategory] = useState<DashboardCategory>("services");

  const { loading, serviceStats, paymentStats, expenseStats } = useDashboardStats(
    currentYear,
    currentMonth
  );

  const goToPrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentYear((y) => y - 1);
      setCurrentMonth(12);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentYear((y) => y + 1);
      setCurrentMonth(1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const currentCat = CATEGORIES.find((c) => c.value === category)!;
  const CatIcon = currentCat.icon;

  return (
    <>
      <Stack.Screen
        options={{
          title: "Reportes",
          headerTitleAlign: "center",
        }}
      />
      <ScrollView className="flex-1 bg-warm-canvas">
        <View className="px-6 pt-2 pb-14 gap-3">
          {/* Month Navigation */}
          <Card>
            <View className="flex-row items-center justify-between">
              <Pressable
                onPress={goToPrevMonth}
                className="p-2 rounded-full active:bg-stone-surface"
              >
                <IconChevronLeft size={20} color="#474645" strokeWidth={2} />
              </Pressable>
              <Text className="font-display font-medium text-[23px] text-charcoal-primary tracking-[-0.44px] capitalize">
                {getMonthName(currentMonth)} {currentYear}
              </Text>
              <Pressable
                onPress={goToNextMonth}
                className="p-2 rounded-full active:bg-stone-surface"
              >
                <IconChevronRight size={20} color="#474645" strokeWidth={2} />
              </Pressable>
            </View>
          </Card>

          {/* Category Selector — pills in header */}
          <View className="flex-row gap-2">
            {CATEGORIES.map((cat) => {
              const isActive = category === cat.value;
              const CIcon = cat.icon;
              return (
                <Pressable
                  key={cat.value}
                  onPress={() => setCategory(cat.value)}
                  className={`flex-1 flex-row items-center justify-center gap-1.5 py-3 rounded-full overflow-hidden ${
                    isActive ? "bg-midnight" : "bg-white border border-stone-surface"
                  } active:opacity-80`}
                  style={{ borderCurve: "continuous" }}
                >
                  <CIcon
                    size={15}
                    color={isActive ? "#ffffff" : cat.color}
                    strokeWidth={2.2}
                  />
                  <Text
                    className={`font-sans text-[13px] font-semibold tracking-tight ${
                      isActive ? "text-white" : "text-graphite"
                    }`}
                  >
                    {cat.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {loading ? (
            <View className="py-16 items-center justify-center">
              <ActivityIndicator size="large" color="#ff3e00" />
            </View>
          ) : (
            <>
              {/* ════════ SERVICES CATEGORY ════════ */}
              {category === "services" && (
                <>
                  {/* Summary Card */}
                  <Card title="Resumen de Servicios">
                    <View>
                      <StatRow
                        label="Total de servicios"
                        value={String(serviceStats.total)}
                      />
                      {(Object.entries(serviceStats.byStatus) as [ServiceStatus, number][]).map(
                        ([status, count]) => {
                          const config = STATUS_CONFIG[status];
                          const IconComp = STATUS_ICONS[config.iconName];
                          return (
                            <View
                              key={status}
                              className="flex-row items-center justify-between py-2.5 border-b border-stone-surface/60"
                            >
                              <View className="flex-row items-center gap-2 flex-1">
                                <IconComp
                                  size={14}
                                  color={config.iconColor}
                                  strokeWidth={2}
                                />
                                <Text className="font-sans text-[14px] text-ash">
                                  {config.label}
                                </Text>
                              </View>
                              <Text
                                className="font-sans text-[15px] font-semibold tracking-tight"
                                style={{ color: config.iconColor }}
                              >
                                {count}
                              </Text>
                            </View>
                          );
                        }
                      )}
                    </View>
                  </Card>

                  {/* Top Clients */}
                  <Card title="Clientes Frecuentes">
                    <RankedList
                      items={serviceStats.topClients.map((c) => ({
                        name: c.name,
                        value: c.count,
                      }))}
                      formatValue={(v) => `${v} servicio${v !== 1 ? "s" : ""}`}
                      icon={IconUser}
                      iconColor="#0090ff"
                    />
                  </Card>

                  {/* Top Services */}
                  <Card title="Servicios Más Realizados">
                    <RankedList
                      items={serviceStats.topServices.map((s) => ({
                        name: s.name,
                        value: s.count,
                      }))}
                      formatValue={(v) => `${v} vez${v !== 1 ? "es" : ""}`}
                      icon={IconAlignLeft}
                      iconColor="#ff3e00"
                    />
                  </Card>
                </>
              )}

              {/* ════════ PAYMENTS CATEGORY ════════ */}
              {category === "payments" && (
                <>
                  <Card title="Resumen de Cobros">
                    <View>
                      <StatRow
                        label="Total de cobros"
                        value={String(paymentStats.total)}
                      />
                      <StatRow
                        label="Monto total"
                        value={`$${paymentStats.totalAmount.toFixed(2)}`}
                        color="text-charcoal-primary"
                      />
                      <StatRow
                        label="Cobrados"
                        value={`${paymentStats.paidCount} ($${paymentStats.paidAmount.toFixed(2)})`}
                        color="text-valid-green"
                      />
                      <StatRow
                        label="Pendientes"
                        value={`${paymentStats.unpaidCount} ($${paymentStats.unpaidAmount.toFixed(2)})`}
                        color="text-coral-red"
                      />
                    </View>
                  </Card>

                  {/* Top Clients by Amount */}
                  <Card title="Clientes por Monto">
                    <RankedList
                      items={paymentStats.topClients.map((c) => ({
                        name: c.name,
                        value: c.total,
                      }))}
                      formatValue={(v) => `$${v.toFixed(2)}`}
                      icon={IconUser}
                      iconColor="#d48f00"
                    />
                  </Card>
                </>
              )}

              {/* ════════ EXPENSES CATEGORY ════════ */}
              {category === "expenses" && (
                <>
                  <Card title="Resumen de Inversión">
                    <View>
                      <StatRow
                        label="Gasto total"
                        value={`$${expenseStats.totalExpense.toFixed(2)}`}
                        color="text-coral-red"
                      />
                      <StatRow
                        label="Servicios con gasto"
                        value={String(expenseStats.servicesWithExpense)}
                      />
                      <StatRow
                        label="Promedio por servicio"
                        value={`$${expenseStats.avgExpense.toFixed(2)}`}
                      />
                      {paymentStats.totalAmount > 0 && (
                        <StatRow
                          label="Margen (cobros − gastos)"
                          value={`$${(paymentStats.paidAmount - expenseStats.totalExpense).toFixed(2)}`}
                          color={
                            paymentStats.paidAmount - expenseStats.totalExpense >= 0
                              ? "text-valid-green"
                              : "text-coral-red"
                          }
                        />
                      )}
                    </View>
                  </Card>

                  {/* By Service Type */}
                  <Card title="Gasto por Tipo de Servicio">
                    <RankedList
                      items={expenseStats.expenseByService.map((s) => ({
                        name: s.name,
                        value: s.total,
                      }))}
                      formatValue={(v) => `$${v.toFixed(2)}`}
                      icon={IconAlignLeft}
                      iconColor="#ff3e00"
                    />
                  </Card>

                  {/* By Client */}
                  <Card title="Gasto por Cliente">
                    <RankedList
                      items={expenseStats.expenseByClient.map((c) => ({
                        name: c.name,
                        value: c.total,
                      }))}
                      formatValue={(v) => `$${v.toFixed(2)}`}
                      icon={IconUser}
                      iconColor="#00c454"
                    />
                  </Card>
                </>
              )}

              {/* Empty state */}
              {category === "services" && serviceStats.total === 0 && (
                <Card extraClassName="items-center justify-center py-12">
                  <View
                    className="w-16 h-16 rounded-full bg-stone-surface items-center justify-center mb-4"
                    style={{ borderCurve: "continuous" }}
                  >
                    <IconChartBar size={26} color="#848281" strokeWidth={1.8} />
                  </View>
                  <Text className="font-sans text-[18px] font-semibold text-charcoal-primary tracking-tight text-center">
                    Sin servicios este mes
                  </Text>
                  <Text className="font-sans text-[14px] text-ash text-center mt-1">
                    Los datos aparecerán cuando haya servicios registrados.
                  </Text>
                </Card>
              )}
              {category === "payments" && paymentStats.total === 0 && (
                <Card extraClassName="items-center justify-center py-12">
                  <View
                    className="w-16 h-16 rounded-full bg-stone-surface items-center justify-center mb-4"
                    style={{ borderCurve: "continuous" }}
                  >
                    <IconChartBar size={26} color="#848281" strokeWidth={1.8} />
                  </View>
                  <Text className="font-sans text-[18px] font-semibold text-charcoal-primary tracking-tight text-center">
                    Sin cobros este mes
                  </Text>
                  <Text className="font-sans text-[14px] text-ash text-center mt-1">
                    Los datos aparecerán cuando haya cobros registrados.
                  </Text>
                </Card>
              )}
              {category === "expenses" && expenseStats.servicesWithExpense === 0 && (
                <Card extraClassName="items-center justify-center py-12">
                  <View
                    className="w-16 h-16 rounded-full bg-stone-surface items-center justify-center mb-4"
                    style={{ borderCurve: "continuous" }}
                  >
                    <IconChartBar size={26} color="#848281" strokeWidth={1.8} />
                  </View>
                  <Text className="font-sans text-[18px] font-semibold text-charcoal-primary tracking-tight text-center">
                    Sin gastos este mes
                  </Text>
                  <Text className="font-sans text-[14px] text-ash text-center mt-1">
                    Los datos aparecerán cuando registres gastos en servicios.
                  </Text>
                </Card>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </>
  );
}
