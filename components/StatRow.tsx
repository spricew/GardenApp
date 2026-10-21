import { View, Text } from 'react-native';

interface StatRowProps {
  label: string;
  value: string;
  /** Tailwind text color class for the value (e.g. `text-valid-green`). */
  valueClassName?: string;
}

/** Label/value row used by the dashboard summary cards. */
export function StatRow({
  label,
  value,
  valueClassName = 'text-charcoal-primary',
}: StatRowProps) {
  return (
    <View className="flex-row items-center justify-between py-3.5 border-b border-[#f2f0ed]">
      <Text className="font-sans text-[15px] text-graphite tracking-[-0.2px] flex-1">
        {label}
      </Text>
      <Text
        className={`font-sans text-[15px] font-medium tracking-[-0.2px] ${valueClassName}`}
      >
        {value}
      </Text>
    </View>
  );
}
