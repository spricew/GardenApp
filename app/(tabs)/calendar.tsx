import { View, Text, Pressable, FlatList, ScrollView } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { IconChevronLeft, IconChevronRight, IconCalendar as CalendarIcon } from '@tabler/icons-react-native';
import { useServices, useServiceDates } from "../../hooks/useServices";
import { ServiceCard } from "../../components/ServiceCard";
import { CalendarDay } from "../../components/CalendarDay";
import { Card } from "../../components/Card";
import {
  getTodayISO,
  formatDateISO,
  getMonthName,
  getDaysInMonth,
  getFirstDayOfMonth,
} from "../../utils/dates";

const WEEKDAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export default function CalendarScreen() {
  const today = getTodayISO();
  const todayDate = new Date();
  const [currentYear, setCurrentYear] = useState(todayDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(todayDate.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState(today);

  const serviceDates = useServiceDates(currentYear, currentMonth);
  const { services, loading } = useServices(selectedDate);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const goToPrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleDayPress = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    setSelectedDate(dateStr);
  };

  // Build calendar grid
  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

  return (
    <ScrollView className="flex-1 bg-warm-canvas">
      {/* Calendar Card */}
      <View className="px-6 pt-6">
        <Card>
          {/* Month Navigation */}
          <View className="flex-row items-center justify-between pb-4">
            <Pressable onPress={goToPrevMonth} className="p-2 rounded-full active:bg-stone-surface">
              <IconChevronLeft size={20} color="#474645" strokeWidth={2} />
            </Pressable>
            <Text className="font-display font-medium text-[23px] text-charcoal-primary tracking-[-0.44px] capitalize">
              {getMonthName(currentMonth)} {currentYear}
            </Text>
            <Pressable onPress={goToNextMonth} className="p-2 rounded-full active:bg-stone-surface">
              <IconChevronRight size={20} color="#474645" strokeWidth={2} />
            </Pressable>
          </View>

          {/* Weekday Headers */}
          <View className="flex-row mb-2">
            {WEEKDAYS.map((day) => (
              <View key={day} className="flex-1 items-center">
                <Text className="font-sans text-[12px] font-semibold tracking-tight text-ash uppercase">
                  {day}
                </Text>
              </View>
            ))}
          </View>

          {/* Calendar Grid */}
          <View className="flex-row flex-wrap mb-2">
            {calendarDays.map((day, index) => (
              <View key={index} className="w-[14.28%] py-1.5">
                {day ? (
                  <CalendarDay
                    day={day}
                    isToday={
                      formatDateISO(
                        new Date(currentYear, currentMonth - 1, day)
                      ) === today
                    }
                    isSelected={
                      formatDateISO(
                        new Date(currentYear, currentMonth - 1, day)
                      ) === selectedDate
                    }
                    hasServices={serviceDates.includes(
                      `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                    )}
                    onPress={handleDayPress}
                  />
                ) : (
                  <View className="w-10 h-10 mx-auto" />
                )}
              </View>
            ))}
          </View>
        </Card>
      </View>

      {/* Selected Day Services */}
      <View className="px-6 pb-12 pt-8 gap-3">
        <Text className="font-display font-medium text-[23px] text-charcoal-primary tracking-tight mb-2 pl-2">
          Servicios del {selectedDate.split("-")[2]}/{selectedDate.split("-")[1]}
        </Text>
        {services.length === 0 ? (
          <Card extraClassName="items-center justify-center py-16">
            <View className="w-16 h-16 rounded-full bg-stone-surface items-center justify-center mb-4" style={{ borderCurve: 'continuous' }}>
              <CalendarIcon size={26} color="#848281" strokeWidth={1.8} />
            </View>
            <Text className="font-sans text-heading-sm font-semibold text-charcoal-primary">
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
