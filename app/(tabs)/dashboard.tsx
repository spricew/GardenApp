import { Card } from '@/components/Card';
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
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { getMonthName } from "@/utils/dates";
import { STATUS_CONFIG } from "@/types";
import type { ServiceStatus } from "@/types";

// ── Category definition ─────────────────────────────────────────────────────

type DashboardCategory = "services" | "payments" | "expenses";

const CATEGORIES: { value: DashboardCategory; label: string; icon: typeof IconHammer; color: string }[] = [
  { value: "services", label: "Servicios", icon: IconHammer, color: "#ff3e00" }, // Ember Orange
  { value: "payments", label: "Cobros", icon: IconReceipt2, color: "#00ca48" }, // Meadow Green
  { value: "expenses", label: "Inversión", icon: IconCurrencyDollar, color: "#0090ff" }, // Sky Blue
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
    <View className="flex-row items-center justify-between py-3.5 border-b border-[#f2f0ed]">
      <Text className="font-sans text-[15px] text-[#474645] tracking-[-0.2px] flex-1">
        {label}
      </Text>
      <Text
        className={`font-sans text-[15px] font-medium tracking-[-0.2px] ${color || "text-[#343433]"}`}
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
      <Text className="font-sans text-[15px] text-[#848281] tracking-[-0.2px] py-2">
        Sin datos este mes.
      </Text>
    );
  }

  const maxValue = Math.max(...items.map((i) => i.value));

  return (
    <View className="gap-5">
      {items.map((item, i) => (
        <View key={item.name} className="gap-2.5">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3 flex-1">
              <View className="w-7 h-7 rounded-full items-center justify-center bg-[#f8f7f4]">
                <ListIcon size={16} color={iconColor} strokeWidth={2.5} />
              </View>
              <Text
                className="font-sans text-[15px] text-[#474645] tracking-[-0.2px] flex-1"
                numberOfLines={1}
              >
                {item.name}
              </Text>
            </View>
            <Text className="font-sans text-[15px] font-medium text-[#343433] tracking-[-0.2px]">
              {formatValue(item.value)}
            </Text>
          </View>
          {/* Progress bar */}
          <View className="h-1 bg-[#f2f0ed] rounded-full overflow-hidden ml-[40px]">
            <View
              className="h-full rounded-full"
              style={{
                width: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%`,
                backgroundColor: iconColor,
              }}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

// ── Empty State Helper ──────────────────────────────────────────────────────
function EmptyState({ title, description, color }: { title: string; description: string; color: string }) {
  return (
    <View className="items-center justify-center py-16 bg-[#f8f7f4] rounded-[12px] mt-4 mb-8 mx-1">
      <View 
        className="w-[72px] h-[72px] rounded-[72px] items-center justify-center mb-6"
        style={{ backgroundColor: color }}
      >
        <IconChartBar size={32} color="#ffffff" strokeWidth={2} />
      </View>
      <Text className="font-sans text-[19px] font-semibold text-[#343433] tracking-[-0.25px] text-center mb-2">
        {title}
      </Text>
      <Text className="font-sans text-[15px] text-[#474645] tracking-[-0.2px] text-center max-w-[240px] leading-[22px]">
        {description}
      </Text>
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

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <ScrollView className="flex-1 bg-[#fbfaf9] pt-12">
        <View className="px-6 pb-24">
          {/* ── Hero: Month Navigation ── */}
          <View className="flex-row items-center justify-between pt-8 pb-10">
            <Pressable
              onPress={goToPrevMonth}
              className="p-3 bg-white border border-[#f2f0ed] rounded-full active:bg-[#f8f7f4]"
            >
              <IconChevronLeft size={20} color="#343433" strokeWidth={2.5} />
            </Pressable>
            
            <View className="items-center">
              <Text className="font-display font-medium text-[44px] text-[#343433] tracking-[-1.14px] capitalize leading-[48px]">
                {getMonthName(currentMonth)}
              </Text>
              <Text className="font-sans text-[17px] text-[#848281] tracking-[-0.22px] mt-1">
                {currentYear}
              </Text>
            </View>

            <Pressable
              onPress={goToNextMonth}
              className="p-3 bg-white border border-[#f2f0ed] rounded-full active:bg-[#f8f7f4]"
            >
              <IconChevronRight size={20} color="#343433" strokeWidth={2.5} />
            </Pressable>
          </View>

          {/* ── Category Selector Pills ── */}
          <View className="flex-row gap-3 mb-10">
            {CATEGORIES.map((cat) => {
              const isActive = category === cat.value;
              const CIcon = cat.icon;
              return (
                <Pressable
                  key={cat.value}
                  onPress={() => setCategory(cat.value)}
                  className={`flex-1 flex-row items-center justify-center gap-2 py-3 rounded-[32px] ${
                    isActive ? "bg-[#121212]" : "bg-[#f6f4ef]"
                  } active:scale-[0.98]`}
                >
                  {isActive && (
                    <CIcon size={16} color="#ffffff" strokeWidth={2.5} />
                  )}
                  <Text
                    className={`font-sans text-[14px] font-medium tracking-[-0.18px] ${
                      isActive ? "text-[#ffffff]" : "text-[#121212]"
                    }`}
                  >
                    {cat.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* ── Content ── */}
          {loading ? (
            <View className="py-20 items-center justify-center">
              <ActivityIndicator size="large" color="#ff3e00" />
            </View>
          ) : (
            <>
              {/* ════════ SERVICES CATEGORY ════════ */}
              {category === "services" && (
                <>
                  {serviceStats.total === 0 ? (
                    <EmptyState 
                      title="Sin servicios este mes"
                      description="Los datos aparecerán cuando registres servicios en el mes seleccionado."
                      color="#ff3e00"
                    />
                  ) : (
                    <>
                      <Card title="Resumen de Servicios">
                        <View>
                          <StatRow label="Total de servicios" value={String(serviceStats.total)} />
                          {(Object.entries(serviceStats.byStatus) as [ServiceStatus, number][]).map(([status, count]) => {
                            const config = STATUS_CONFIG[status];
                            const IconComp = STATUS_ICONS[config.iconName];
                            return (
                              <View key={status} className="flex-row items-center justify-between py-3.5 border-b border-[#f2f0ed]">
                                <View className="flex-row items-center gap-3 flex-1">
                                  <IconComp size={16} color={config.iconColor} strokeWidth={2.5} />
                                  <Text className="font-sans text-[15px] text-[#474645] tracking-[-0.2px]">
                                    {config.label}
                                  </Text>
                                </View>
                                <Text className="font-sans text-[15px] font-medium tracking-[-0.2px]" style={{ color: config.iconColor }}>
                                  {count}
                                </Text>
                              </View>
                            );
                          })}
                        </View>
                      </Card>

                      <Card title="Clientes Frecuentes">
                        <RankedList
                          items={serviceStats.topClients.map((c) => ({ name: c.name, value: c.count }))}
                          formatValue={(v) => `${v} servicio${v !== 1 ? "s" : ""}`}
                          icon={IconUser}
                          iconColor="#ff3e00"
                        />
                      </Card>

                      <Card title="Servicios Más Realizados">
                        <RankedList
                          items={serviceStats.topServices.map((s) => ({ name: s.name, value: s.count }))}
                          formatValue={(v) => `${v} ${v !== 1 ? "veces" : "vez"}`}
                          icon={IconAlignLeft}
                          iconColor="#00ca48"
                        />
                      </Card>
                    </>
                  )}
                </>
              )}

              {/* ════════ PAYMENTS CATEGORY ════════ */}
              {category === "payments" && (
                <>
                  {paymentStats.total === 0 ? (
                    <EmptyState 
                      title="Sin cobros este mes"
                      description="Los datos aparecerán cuando haya cobros registrados."
                      color="#00ca48"
                    />
                  ) : (
                    <>
                      <Card title="Resumen de Cobros">
                        <View>
                          <StatRow label="Total de cobros" value={String(paymentStats.total)} />
                          <StatRow label="Monto total" value={`$${paymentStats.totalAmount.toFixed(2)}`} />
                          <StatRow label="Cobrados" value={`${paymentStats.paidCount} ($${paymentStats.paidAmount.toFixed(2)})`} color="text-[#00c454]" />
                          <StatRow label="Pendientes" value={`${paymentStats.unpaidCount} ($${paymentStats.unpaidAmount.toFixed(2)})`} color="text-[#ff2b3a]" />
                        </View>
                      </Card>

                      <Card title="Clientes por Monto">
                        <RankedList
                          items={paymentStats.topClients.map((c) => ({ name: c.name, value: c.total }))}
                          formatValue={(v) => `$${v.toFixed(2)}`}
                          icon={IconUser}
                          iconColor="#0090ff"
                        />
                      </Card>
                    </>
                  )}
                </>
              )}

              {/* ════════ EXPENSES CATEGORY ════════ */}
              {category === "expenses" && (
                <>
                  {expenseStats.servicesWithExpense === 0 ? (
                    <EmptyState 
                      title="Sin gastos este mes"
                      description="Los datos aparecerán cuando registres gastos en servicios."
                      color="#0090ff"
                    />
                  ) : (
                    <>
                      <Card title="Resumen de Inversión">
                        <View>
                          <StatRow label="Gasto total" value={`$${expenseStats.totalExpense.toFixed(2)}`} color="text-[#ff2b3a]" />
                          <StatRow label="Servicios con gasto" value={String(expenseStats.servicesWithExpense)} />
                          <StatRow label="Promedio por servicio" value={`$${expenseStats.avgExpense.toFixed(2)}`} />
                          {paymentStats.totalAmount > 0 && (
                            <StatRow
                              label="Margen (cobros − gastos)"
                              value={`$${(paymentStats.paidAmount - expenseStats.totalExpense).toFixed(2)}`}
                              color={paymentStats.paidAmount - expenseStats.totalExpense >= 0 ? "text-[#00c454]" : "text-[#ff2b3a]"}
                            />
                          )}
                        </View>
                      </Card>

                      <Card title="Gasto por Tipo de Servicio">
                        <RankedList
                          items={expenseStats.expenseByService.map((s) => ({ name: s.name, value: s.total }))}
                          formatValue={(v) => `$${v.toFixed(2)}`}
                          icon={IconAlignLeft}
                          iconColor="#ff3e00"
                        />
                      </Card>

                      <Card title="Gasto por Cliente">
                        <RankedList
                          items={expenseStats.expenseByClient.map((c) => ({ name: c.name, value: c.total }))}
                          formatValue={(v) => `$${v.toFixed(2)}`}
                          icon={IconUser}
                          iconColor="#00ca48"
                        />
                      </Card>
                    </>
                  )}
                </>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </>
  );
}
