import { View } from 'react-native';
import { IconAlignLeft, IconUser } from '@tabler/icons-react-native';

import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { RankedList } from '@/components/RankedList';
import { StatRow } from '@/components/StatRow';
import type { ExpenseStats } from '@/hooks/useDashboardStats';

interface ExpensesOverviewProps {
  stats: ExpenseStats;
  paidAmount: number;
  paymentTotalAmount: number;
}

/** Expenses/investment category content for the monthly dashboard. */
export function ExpensesOverview({
  stats,
  paidAmount,
  paymentTotalAmount,
}: ExpensesOverviewProps) {
  if (stats.servicesWithExpense === 0) {
    return (
      <EmptyState
        title="Sin gastos este mes"
        description="Los datos aparecerán cuando registres gastos en servicios."
        color="#0090ff"
      />
    );
  }

  const margin = paidAmount - stats.totalExpense;

  return (
    <View className="gap-y-2">
      <Card title="Resumen de Inversión">
        <View>
          <StatRow
            label="Gasto total"
            value={`$${stats.totalExpense.toFixed(2)}`}
            valueClassName="text-coral-red"
          />
          <StatRow
            label="Servicios con gasto"
            value={String(stats.servicesWithExpense)}
          />
          <StatRow
            label="Promedio por servicio"
            value={`$${stats.avgExpense.toFixed(2)}`}
          />
          {paymentTotalAmount > 0 && (
            <StatRow
              label="Margen (cobros − gastos)"
              value={`$${margin.toFixed(2)}`}
              valueClassName={
                margin >= 0 ? 'text-valid-green' : 'text-coral-red'
              }
            />
          )}
        </View>
      </Card>

      <Card title="Gasto por Tipo de Servicio">
        <RankedList
          items={stats.expenseByService.map((service) => ({
            name: service.name,
            value: service.total,
          }))}
          formatValue={(value) => `$${value.toFixed(2)}`}
          icon={IconAlignLeft}
          iconColor="#ff3e00"
        />
      </Card>

      <Card title="Gasto por Cliente">
        <RankedList
          items={stats.expenseByClient.map((client) => ({
            name: client.name,
            value: client.total,
          }))}
          formatValue={(value) => `$${value.toFixed(2)}`}
          icon={IconUser}
          iconColor="#00ca48"
        />
      </Card>
    </View>
  );
}
