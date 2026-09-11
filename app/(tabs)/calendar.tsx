import { View, Text, ScrollView, ActivityIndicator, Pressable, FlatList } from "react-native";
import { useState } from "react";
import { IconCalendar as CalendarIcon, IconReceipt2, IconHammer } from "@tabler/icons-react-native";
import { useServices, useServiceDates } from "@/hooks/useServices";
import { usePayments, usePaymentDates } from "@/hooks/usePayments";
import { ServiceCard } from "@/components/ServiceCard";
import { PaymentCard } from "@/components/PaymentCard";
import { CalendarWidget } from "@/components/CalendarWidget";
import { Card } from "@/components/Card";
import { getTodayISO } from "@/utils/dates";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack } from "expo-router";

type CalendarFilter = "main" | "services" | "payments";

const CALENDAR_FILTERS: { label: string; value: CalendarFilter }[] = [
  { label: "General", value: "main" },
  { label: "Servicios", value: "services" },
  { label: "Cobros", value: "payments" },
];

export default function CalendarScreen() {
  const today = getTodayISO();
  const todayDate = new Date();

  const [currentYear, setCurrentYear] = useState(todayDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(todayDate.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState(today);
  const [filter, setFilter] = useState<CalendarFilter>("main");

  const { dates: serviceDates } = useServiceDates(currentYear, currentMonth);
  const { dates: paymentDates } = usePaymentDates(currentYear, currentMonth);

  const { services, loading: servicesLoading } = useServices(selectedDate);
  const {
    payments,
    loading: paymentsLoading,
    togglePaid,
    removePayment,
  } = usePayments(selectedDate);

  const loading = servicesLoading || paymentsLoading;

  const handleMonthChange = (year: number, month: number) => {
    setCurrentYear(year);
    setCurrentMonth(month);
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  const [yearStr, monthStr, dayStr] = selectedDate.split("-");

  const displayServiceDates = filter === "payments" ? [] : serviceDates;
  const displayPaymentDates = filter === "services" ? [] : paymentDates;

  const displayServices = filter === "payments" ? [] : services;
  const displayPayments = filter === "services" ? [] : payments;

  const hasItems = displayServices.length > 0 || displayPayments.length > 0;

  return (
    <>
      {/* <Stack.Screen
        options={{
          headerTitle: "Calendario",
          headerTitleAlign: "center",
        }}
      /> */}

        <ScrollView className="flex-1 bg-warm-canvas">
          {/* Calendar Section */}
          <View className="px-6 pt-2">
            <CalendarWidget
              currentYear={currentYear}
              currentMonth={currentMonth}
              selectedDate={selectedDate}
              serviceDates={displayServiceDates}
              paymentDates={displayPaymentDates}
              todayISO={today}
              onMonthChange={handleMonthChange}
              onDateSelect={handleDateSelect}
            />
          </View>

          {/* Selected Day Agenda */}
          <View className="px-6 pb-14 pt-6 gap-6">
            {loading ? (
              <View className="py-8 items-center justify-center">
                <ActivityIndicator size="large" color="#ff3e00" />
              </View>
            ) : !hasItems ? (
              <Card extraClassName="items-center justify-center py-12">
                <View
                  className="w-16 h-16 rounded-full bg-stone-surface items-center justify-center mb-4"
                  style={{ borderCurve: "continuous" }}
                >
                  <CalendarIcon size={26} color="#848281" strokeWidth={1.8} />
                </View>
                <Text className="font-sans text-[18px] font-semibold text-charcoal-primary tracking-tight text-center">
                  Sin actividad para el {dayStr}/{monthStr}
                </Text>
                <Text className="font-sans text-[14px] text-ash text-center mt-1">
                  No hay resultados para esta vista.
                </Text>
              </Card>
            ) : (
              <>
                {/* Payments / Cobros Section */}
                {displayPayments.length > 0 && (
                  <View>
                    <View className="flex-row items-center gap-1.5 mb-2.5 pl-2">
                      <IconReceipt2 size={18} color="#d48f00" strokeWidth={2.2} />
                      <Text className="font-display font-medium text-[20px] text-charcoal-primary tracking-tight">
                        Cobros Programados ({displayPayments.length})
                      </Text>
                    </View>
                    {displayPayments.map((payment) => (
                      <PaymentCard
                        key={payment.id}
                        payment={payment}
                        onTogglePaid={togglePaid}
                        onDelete={removePayment}
                      />
                    ))}
                  </View>
                )}

                {/* Services Section */}
                {displayServices.length > 0 && (
                  <View>
                    <View className="flex-row items-center gap-1.5 mb-2.5 pl-2">
                      <IconHammer size={18} color="#0090ff" strokeWidth={2.2} />
                      <Text className="font-display font-medium text-[20px] text-charcoal-primary tracking-tight">
                        Servicios ({displayServices.length})
                      </Text>
                    </View>
                    {displayServices.map((service) => (
                      <ServiceCard key={service.id} service={service} />
                    ))}
                  </View>
                )}
              </>
            )}
          </View>
        </ScrollView>
    </>
  );
}
