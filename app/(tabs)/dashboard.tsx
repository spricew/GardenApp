import { Card } from '@/components/Card';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useState } from "react";
import {
  IconChevronLeft,
  IconChevronRight,
  IconHammer,
  IconReceipt2,
  IconCurrencyDollar,
  IconUser,
  IconAlignLeft,
} from "@tabler/icons-react-native";
import { Stack } from "expo-router";
import { EmptyState } from "@/components/EmptyState";
import { RankedList } from "@/components/RankedList";
import { StatRow } from "@/components/StatRow";
import { STATUS_ICONS } from "@/constants/status";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { getMonthName } from "@/utils/dates";
import { STATUS_CONFIG } from "@/types";
import type { ServiceStatus } from "@/types";

// ── Category definition ─────────────────────────────────────────────────────

type DashboardCategory = "services" | "payments" | "expenses";

const CATEGORIES: { value: DashboardCategory; label: string; icon: typeof IconHammer }[] = [
  { value: "services", label: "Servicios", icon: IconHammer },
  { value: "payments", label: "Cobros", icon: IconReceipt2 },
  { value: "expenses", label: "Inversión", icon: IconCurrencyDollar },
];

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
              <Text className="font-display font-medium text-heading text-[#343433] tracking-tighter capitalize">
                {getMonthName(currentMonth)}
              </Text>
              <Text className="font-sans text-[17px] text-[#848281]">
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
                  className={`flex-1 flex-row items-center justify-center gap-2 py-3 rounded-[32px] ${isActive ? "bg-[#121212]" : "bg-[#f6f4ef]"
                    } active:scale-[0.98]`}
                >
                  {isActive && (
                    <CIcon size={16} color="#ffffff" strokeWidth={2.5} />
                  )}
                  <Text
                    className={`font-sans text-[14px] font-medium tracking-[-0.18px] ${isActive ? "text-[#ffffff]" : "text-[#121212]"
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
                    <View className='gap-y-2'>
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
                    </View>
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
                    <View className='gap-y-2'>

                      <Card title="Resumen de Cobros">
                        <View>
                          <StatRow label="Total de cobros" value={String(paymentStats.total)} />
                          <StatRow label="Monto total" value={`$${paymentStats.totalAmount.toFixed(2)}`} />
                          <StatRow label="Cobrados" value={`${paymentStats.paidCount} ($${paymentStats.paidAmount.toFixed(2)})`} valueClassName="text-valid-green" />
                          <StatRow label="Pendientes" value={`${paymentStats.unpaidCount} ($${paymentStats.unpaidAmount.toFixed(2)})`} valueClassName="text-coral-red" />
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
                    </View>
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
                    <View className='gap-y-2'>
                      <Card title="Resumen de Inversión">
                        <View>
                          <StatRow label="Gasto total" value={`$${expenseStats.totalExpense.toFixed(2)}`} valueClassName="text-coral-red" />
                          <StatRow label="Servicios con gasto" value={String(expenseStats.servicesWithExpense)} />
                          <StatRow label="Promedio por servicio" value={`$${expenseStats.avgExpense.toFixed(2)}`} />
                          {paymentStats.totalAmount > 0 && (
                            <StatRow
                              label="Margen (cobros − gastos)"
                              value={`$${(paymentStats.paidAmount - expenseStats.totalExpense).toFixed(2)}`}
                              valueClassName={paymentStats.paidAmount - expenseStats.totalExpense >= 0 ? "text-valid-green" : "text-coral-red"}
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
                    </View>
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
