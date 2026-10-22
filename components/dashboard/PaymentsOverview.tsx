import { View } from 'react-native';
import { IconUser } from '@tabler/icons-react-native';

import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { RankedList } from '@/components/RankedList';
import { StatRow } from '@/components/StatRow';
import type { PaymentStats } from '@/hooks/useDashboardStats';

interface PaymentsOverviewProps {
  stats: PaymentStats;
}

/** Payments category content for the monthly dashboard. */
export function PaymentsOverview({ stats }: PaymentsOverviewProps) {
  if (stats.total === 0) {
    return (
      <EmptyState
        title="Sin cobros este mes"
        description="Los datos aparecerán cuando haya cobros registrados."
        color="#00ca48"
      />
    );
  }

  return (
    <View className="gap-y-2">
      <Card title="Resumen de Cobros">
        <View>
          <StatRow label="Total de cobros" value={String(stats.total)} />
          <StatRow
            label="Monto total"
            value={`$${stats.totalAmount.toFixed(2)}`}
          />
          <StatRow
            label="Cobrados"
            value={`${stats.paidCount} ($${stats.paidAmount.toFixed(2)})`}
            valueClassName="text-valid-green"
          />
          <StatRow
            label="Pendientes"
            value={`${stats.unpaidCount} ($${stats.unpaidAmount.toFixed(2)})`}
            valueClassName="text-coral-red"
          />
        </View>
      </Card>

      <Card title="Clientes por Monto">
        <RankedList
          items={stats.topClients.map((client) => ({
            name: client.name,
            value: client.total,
          }))}
          formatValue={(value) => `$${value.toFixed(2)}`}
          icon={IconUser}
          iconColor="#0090ff"
        />
      </Card>
    </View>
  );
}
