import { Pressable, Text, View } from 'react-native';
import {
  IconCurrencyDollar,
  IconHammer,
  IconReceipt2,
} from '@tabler/icons-react-native';
import type { Icon } from '@tabler/icons-react-native';

export type DashboardCategory = 'services' | 'payments' | 'expenses';

interface CategoryOption {
  value: DashboardCategory;
  label: string;
  icon: Icon;
}

const CATEGORIES: CategoryOption[] = [
  { value: 'services', label: 'Servicios', icon: IconHammer },
  { value: 'payments', label: 'Cobros', icon: IconReceipt2 },
  { value: 'expenses', label: 'Inversión', icon: IconCurrencyDollar },
];

interface CategorySelectorProps {
  value: DashboardCategory;
  onChange: (category: DashboardCategory) => void;
}

/** Category pills that switch the dashboard content. */
export function CategorySelector({
  value,
  onChange,
}: CategorySelectorProps) {
  return (
    <View className="flex-row gap-3 mb-10">
      {CATEGORIES.map((category) => {
        const isActive = value === category.value;
        const CategoryIcon = category.icon;

        return (
          <Pressable
            key={category.value}
            onPress={() => onChange(category.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            className={`flex-1 flex-row items-center justify-center gap-2 py-3 rounded-[32px] ${
              isActive ? 'bg-[#121212]' : 'bg-[#f6f4ef]'
            } active:scale-[0.98]`}
          >
            {isActive && (
              <CategoryIcon size={16} color="#ffffff" strokeWidth={2.5} />
            )}
            <Text
              className={`font-sans text-[14px] font-medium tracking-[-0.18px] ${
                isActive ? 'text-[#ffffff]' : 'text-[#121212]'
              }`}
            >
              {category.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
