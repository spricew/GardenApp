import { memo } from 'react';
import { View, Text } from 'react-native';
import { formatAgendaDate, getRelativeDateLabel } from '@/utils/dates';

interface ServiceDateHeaderProps {
  /** ISO date (`YYYY-MM-DD`) for the group. */
  date: string;
  /** Number of services scheduled for this date. */
  count: number;
  todayISO: string;
  /** Mutes the header when the date belongs to the history section. */
  isPast?: boolean;
}

/**
 * Sticky-looking date divider for the home agenda.
 *
 * The relative pill ("Hoy", "Mañana", "Ayer") carries the quick context while
 * the full date stays readable for any other day of the year.
 */
export const ServiceDateHeader = memo(function ServiceDateHeader({
  date,
  count,
  todayISO,
  isPast = false,
}: ServiceDateHeaderProps) {
  const relativeLabel = getRelativeDateLabel(date, todayISO);
  const isToday = relativeLabel === 'Hoy';
  const isMuted = isPast || relativeLabel === 'Ayer';

  return (
    <View className="flex-row items-center justify-between pt-5 pb-2 bg-warm-canvas">
      <View className="flex-row items-center gap-2 flex-1 mr-3">
        {relativeLabel ? (
          <View
            className={`px-2.5 py-1 rounded-full ${
              isToday ? 'bg-midnight' : 'bg-stone-surface'
            }`}
            style={{ borderCurve: 'continuous' }}
          >
            <Text
              className={`font-sans text-[11px] font-semibold tracking-wide ${
                isToday ? 'text-white' : 'text-graphite'
              }`}
            >
              {relativeLabel}
            </Text>
          </View>
        ) : null}

        <Text
          accessibilityRole="header"
          className={`font-sans text-[15px] font-semibold tracking-tight flex-1 ${
            isMuted ? 'text-ash' : 'text-charcoal-primary'
          }`}
          numberOfLines={1}
        >
          {formatAgendaDate(date, todayISO)}
        </Text>
      </View>

      <View
        className="px-2 py-0.5 rounded-full bg-stone-surface"
        style={{ borderCurve: 'continuous' }}
      >
        <Text className="font-sans text-[11px] font-semibold text-graphite">
          {count}
        </Text>
      </View>
    </View>
  );
});
