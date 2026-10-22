import { Text, View } from 'react-native';
import { IconAlignLeft, IconUser } from '@tabler/icons-react-native';

import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { RankedList } from '@/components/RankedList';
import { StatRow } from '@/components/StatRow';
import { STATUS_ICONS } from '@/constants/status';
import type { ServiceStats } from '@/hooks/useDashboardStats';
import { STATUS_CONFIG } from '@/types';
import type { ServiceStatus } from '@/types';

interface ServicesOverviewProps {
  stats: ServiceStats;
}

/** Services category content for the monthly dashboard. */
export function ServicesOverview({ stats }: ServicesOverviewProps) {
  if (stats.total === 0) {
    return (
      <EmptyState
        title="Sin servicios este mes"
        description="Los datos aparecerán cuando registres servicios en el mes seleccionado."
        color="#ff3e00"
      />
    );
  }

  return (
    <View className="gap-y-2">
      <Card title="Resumen de Servicios">
        <View>
          <StatRow label="Total de servicios" value={String(stats.total)} />
          {(Object.entries(stats.byStatus) as [ServiceStatus, number][]).map(
            ([status, count]) => {
              const config = STATUS_CONFIG[status];
              const StatusIcon = STATUS_ICONS[config.iconName];

              return (
                <View
                  key={status}
                  className="flex-row items-center justify-between py-3.5 border-b border-[#f2f0ed]"
                >
                  <View className="flex-row items-center gap-3 flex-1">
                    <StatusIcon
                      size={16}
                      color={config.iconColor}
                      strokeWidth={2.5}
                    />
                    <Text className="font-sans text-[15px] text-[#474645] tracking-[-0.2px]">
                      {config.label}
                    </Text>
                  </View>
                  <Text
                    className="font-sans text-[15px] font-medium tracking-[-0.2px]"
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

      <Card title="Clientes Frecuentes">
        <RankedList
          items={stats.topClients.map((client) => ({
            name: client.name,
            value: client.count,
          }))}
          formatValue={(value) =>
            `${value} servicio${value !== 1 ? 's' : ''}`
          }
          icon={IconUser}
          iconColor="#ff3e00"
        />
      </Card>

      <Card title="Servicios Más Realizados">
        <RankedList
          items={stats.topServices.map((service) => ({
            name: service.name,
            value: service.count,
          }))}
          formatValue={(value) => `${value} ${value !== 1 ? 'veces' : 'vez'}`}
          icon={IconAlignLeft}
          iconColor="#00ca48"
        />
      </Card>
    </View>
  );
}
