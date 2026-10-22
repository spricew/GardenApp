import { memo, useCallback, useMemo } from "react";
import { View, Text, Pressable } from "react-native";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react-native";
import { CalendarDay } from "./CalendarDay";
import { Card } from "./Card";
import {
  getMonthName,
  getDaysInMonth,
  getFirstDayOfMonth,
} from "@/utils/dates";

const WEEKDAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

interface CalendarWidgetProps {
  currentYear: number;
  currentMonth: number;
  selectedDate: string;
  serviceDates?: string[];
  paymentDates?: string[];
  todayISO?: string;
  minDate?: string;
  onMonthChange: (year: number, month: number) => void;
  onDateSelect: (date: string) => void;
  hideCardWrapper?: boolean;
}

export const CalendarWidget = memo(function CalendarWidget({
  currentYear,
  currentMonth,
  selectedDate,
  serviceDates = [],
  paymentDates = [],
  todayISO,
  minDate,
  onMonthChange,
  onDateSelect,
  hideCardWrapper = false,
}: CalendarWidgetProps) {
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const monthPrefix = useMemo(
    () => `${currentYear}-${String(currentMonth).padStart(2, "0")}`,
    [currentYear, currentMonth]
  );
  const serviceDateSet = useMemo(() => new Set(serviceDates), [serviceDates]);
  const paymentDateSet = useMemo(() => new Set(paymentDates), [paymentDates]);

  const goToPrevMonth = () => {
    if (currentMonth === 1) {
      onMonthChange(currentYear - 1, 12);
    } else {
      onMonthChange(currentYear, currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 12) {
      onMonthChange(currentYear + 1, 1);
    } else {
      onMonthChange(currentYear, currentMonth + 1);
    }
  };

  const handleDayPress = useCallback(
    (day: number) => {
      onDateSelect(`${monthPrefix}-${String(day).padStart(2, "0")}`);
    },
    [monthPrefix, onDateSelect]
  );

  // Build calendar grid
  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  }, [daysInMonth, firstDay]);

  const content = (
    <>
      {/* Month Navigation */}
      <View className="flex-row items-center justify-between pb-4">
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
        {calendarDays.map((day, index) => {
          if (!day) {
            return (
              <View key={index} className="w-[14.28%] py-1.5">
                <View className="w-10 h-10 mx-auto" />
              </View>
            );
          }

          const dateStr = `${monthPrefix}-${String(day).padStart(2, "0")}`;

          return (
            <View key={index} className="w-[14.28%] py-1.5">
              <CalendarDay
                day={day}
                isToday={todayISO !== undefined && dateStr === todayISO}
                isSelected={dateStr === selectedDate}
                hasServices={serviceDateSet.has(dateStr)}
                hasPayments={paymentDateSet.has(dateStr)}
                isDisabled={minDate !== undefined && dateStr < minDate}
                onPress={handleDayPress}
              />
            </View>
          );
        })}
      </View>
    </>
  );

  if (hideCardWrapper) {
    return <View>{content}</View>;
  }

  return <Card>{content}</Card>;
});
