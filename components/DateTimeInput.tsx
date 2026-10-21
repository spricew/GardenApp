import { useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import type { Icon } from '@tabler/icons-react-native';

import { formatDateForDisplay, formatTimeForDisplay } from '@/utils/dates';

interface DateTimeInputProps {
  label: string;
  icon: Icon;
  value: Date;
  mode: 'date' | 'time';
  onChange: (date: Date) => void;
  minimumDate?: Date;
  accentColor?: string;
}

/**
 * Date/time field with a native picker.
 *
 * iOS renders the picker inline, while Android opens a dialog from the
 * displayed value. Keeping the Android picker state inside this component
 * lets callers treat both platforms the same way.
 */
export function DateTimeInput({
  label,
  icon: FieldIcon,
  value,
  mode,
  onChange,
  minimumDate,
  accentColor,
}: DateTimeInputProps) {
  const [showPicker, setShowPicker] = useState(false);

  const handleChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ): void => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    if (event.type === 'dismissed' || !selectedDate) {
      return;
    }
    onChange(selectedDate);
  };

  return (
    <View className="w-full">
      <View className="flex-row items-center gap-1.5 mb-2">
        <FieldIcon size={14} color="#343433" strokeWidth={2} />
        <Text className="font-sans font-semibold text-[15px] text-charcoal-primary tracking-tight">
          {label}
        </Text>
      </View>

      {Platform.OS === 'ios' ? (
        <DateTimePicker
          value={value}
          mode={mode}
          display={mode === 'date' ? 'inline' : 'compact'}
          onChange={handleChange}
          minimumDate={minimumDate}
          accentColor={accentColor}
          style={{ alignSelf: 'flex-start' }}
        />
      ) : (
        <>
          <Pressable
            onPress={() => setShowPicker(true)}
            className="bg-white border border-stone-surface rounded-lg px-4 py-3 overflow-hidden"
            style={{ borderCurve: 'continuous' }}
          >
            <Text className="font-sans text-[15px] text-graphite">
              {mode === 'date'
                ? formatDateForDisplay(value)
                : formatTimeForDisplay(value)}
            </Text>
          </Pressable>
          {showPicker && (
            <DateTimePicker
              value={value}
              mode={mode}
              display="default"
              onChange={handleChange}
              minimumDate={minimumDate}
              is24Hour={false}
            />
          )}
        </>
      )}
    </View>
  );
}
