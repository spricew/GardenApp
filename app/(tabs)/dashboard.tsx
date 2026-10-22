import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useState } from 'react';
import { Stack } from 'expo-router';

import { CategorySelector } from '@/components/dashboard/CategorySelector';
import type { DashboardCategory } from '@/components/dashboard/CategorySelector';
import { ExpensesOverview } from '@/components/dashboard/ExpensesOverview';
import { MonthNavigator } from '@/components/dashboard/MonthNavigator';
import { PaymentsOverview } from '@/components/dashboard/PaymentsOverview';
import { ServicesOverview } from '@/components/dashboard/ServicesOverview';
import { useDashboardStats } from '@/hooks/useDashboardStats';

export default function DashboardScreen() {
  const [currentYear, setCurrentYear] = useState(() =>
    new Date().getFullYear()
  );
  const [currentMonth, setCurrentMonth] = useState(() =>
    new Date().getMonth() + 1
  );
  const [category, setCategory] = useState<DashboardCategory>('services');

  const {
    loading,
    error,
    refresh,
    serviceStats,
    paymentStats,
    expenseStats,
  } = useDashboardStats(currentYear, currentMonth);

  const goToPrevMonth = (): void => {
    if (currentMonth === 1) {
      setCurrentYear((year) => year - 1);
      setCurrentMonth(12);
    } else {
      setCurrentMonth((month) => month - 1);
    }
  };

  const goToNextMonth = (): void => {
    if (currentMonth === 12) {
      setCurrentYear((year) => year + 1);
      setCurrentMonth(1);
    } else {
      setCurrentMonth((month) => month + 1);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View className="py-20 items-center justify-center">
          <ActivityIndicator size="large" color="#ff3e00" />
        </View>
      );
    }

    if (error) {
      return (
        <View className="items-center justify-center py-16 bg-[#f8f7f4] rounded-[12px] mt-4 mb-8 mx-1">
          <Text className="font-sans text-[17px] font-semibold text-charcoal-primary tracking-[-0.25px] text-center mb-2">
            No se pudieron cargar las estadísticas
          </Text>
          <Text className="font-sans text-[14px] text-graphite tracking-[-0.2px] text-center mb-4 max-w-[260px]">
            {error}
          </Text>
          <Pressable
            onPress={() => {
              void refresh();
            }}
            accessibilityRole="button"
            className="px-4 py-2 bg-midnight rounded-full active:opacity-80"
          >
            <Text className="font-sans font-medium text-[14px] text-white">
              Reintentar
            </Text>
          </Pressable>
        </View>
      );
    }

    switch (category) {
      case 'services':
        return <ServicesOverview stats={serviceStats} />;
      case 'payments':
        return <PaymentsOverview stats={paymentStats} />;
      case 'expenses':
        return (
          <ExpensesOverview
            stats={expenseStats}
            paidAmount={paymentStats.paidAmount}
            paymentTotalAmount={paymentStats.totalAmount}
          />
        );
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
          <MonthNavigator
            year={currentYear}
            month={currentMonth}
            onPrevious={goToPrevMonth}
            onNext={goToNextMonth}
          />
          <CategorySelector value={category} onChange={setCategory} />
          {renderContent()}
        </View>
      </ScrollView>
    </>
  );
}
