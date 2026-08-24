import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { useState } from "react";
import { IconCalendar as CalendarIcon } from '@tabler/icons-react-native';
import { useServices, useServiceDates } from "@/hooks/useServices";
import { ServiceCard } from "@/components/ServiceCard";
import { CalendarWidget } from "@/components/CalendarWidget";
import { Card } from "@/components/Card";
import { getTodayISO } from "@/utils/dates";

export default function CalendarScreen() {
  const today = getTodayISO();
  const todayDate = new Date();
  
  const [currentYear, setCurrentYear] = useState(todayDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(todayDate.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState(today);

  const serviceDates = useServiceDates(currentYear, currentMonth);
  const { services, loading } = useServices(selectedDate);

  const handleMonthChange = (year: number, month: number) => {
    setCurrentYear(year);
    setCurrentMonth(month);
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  const [yearStr, monthStr, dayStr] = selectedDate.split("-");

  return (
    <ScrollView className="flex-1 bg-warm-canvas">
      {/* Calendar Section */}
      <View className="px-6 pt-6">
        <CalendarWidget 
          currentYear={currentYear}
          currentMonth={currentMonth}
          selectedDate={selectedDate}
          serviceDates={serviceDates}
          todayISO={today}
          onMonthChange={handleMonthChange}
          onDateSelect={handleDateSelect}
        />
      </View>

      {/* Selected Day Services */}
      <View className="px-6 pb-12 pt-8 gap-3">
        <Text className="font-display font-medium text-[23px] text-charcoal-primary tracking-tight mb-2 pl-2">
          Servicios del {dayStr}/{monthStr}
        </Text>
        
        {loading ? (
          <View className="py-8 items-center justify-center">
            <ActivityIndicator size="large" color="#ff3e00" />
          </View>
        ) : services.length === 0 ? (
          <Card extraClassName="items-center justify-center py-16">
            <View className="w-16 h-16 rounded-full bg-stone-surface items-center justify-center mb-4" style={{ borderCurve: 'continuous' }}>
              <CalendarIcon size={26} color="#848281" strokeWidth={1.8} />
            </View>
            <Text className="font-sans text-[18px] font-semibold text-charcoal-primary tracking-tight">
              Sin servicios para este día
            </Text>
            <Text className="font-sans text-[14px] text-ash text-center mt-1">
              Selecciona otro día o agrega un nuevo servicio
            </Text>
          </Card>
        ) : (
          services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))
        )}
      </View>
    </ScrollView>
  );
}
