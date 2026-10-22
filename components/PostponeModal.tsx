import { useEffect, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { IconCalendarPlus } from '@tabler/icons-react-native';

import { CalendarWidget } from '@/components/CalendarWidget';
import { getTodayISO, parseISODateLocal } from '@/utils/dates';
import { getPostponeDateBounds } from '@/utils/service';

interface PostponeModalProps {
  visible: boolean;
  scheduledDate: string;
  saving?: boolean;
  onClose: () => void;
  onConfirm: (date: string) => void;
}

/**
 * Date picker sheet for postponing a service.
 *
 * The confirm button is disabled while the parent is saving; the parent
 * closes the modal after the database mutation succeeds.
 */
export function PostponeModal({
  visible,
  scheduledDate,
  saving = false,
  onClose,
  onConfirm,
}: PostponeModalProps) {
  const [selectedDate, setSelectedDate] = useState(scheduledDate);
  const [currentYear, setCurrentYear] = useState(() =>
    parseISODateLocal(scheduledDate).getFullYear()
  );
  const [currentMonth, setCurrentMonth] = useState(
    () => parseISODateLocal(scheduledDate).getMonth() + 1
  );

  useEffect(() => {
    if (!visible) return;

    const { defaultDate } = getPostponeDateBounds(scheduledDate);
    const defaultDateObj = parseISODateLocal(defaultDate);

    setSelectedDate(defaultDate);
    setCurrentYear(defaultDateObj.getFullYear());
    setCurrentMonth(defaultDateObj.getMonth() + 1);
  }, [scheduledDate, visible]);

  const todayISO = getTodayISO();
  const { minDate } = getPostponeDateBounds(scheduledDate, todayISO);

  const handleClose = (): void => {
    if (!saving) onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Pressable
        className="flex-1 bg-black/30"
        onPress={handleClose}
        disabled={saving}
      />
      <View
        className="bg-white rounded-t-[32px] px-6 pt-6 pb-10"
        style={{ borderCurve: 'continuous' }}
      >
        {/* Handle */}
        <View className="w-10 h-1 bg-stone-surface rounded-full self-center mb-5" />

        <View className="flex-row items-center gap-2 mb-1">
          <IconCalendarPlus size={20} color="#ff3e00" strokeWidth={2} />
          <Text className="font-sans font-semibold text-[19px] text-charcoal-primary tracking-tight">
            Posponer servicio
          </Text>
        </View>
        <Text className="font-sans text-[14px] text-ash mb-5">
          El servicio actual quedará marcado como pospuesto y se creará uno
          nuevo en la fecha seleccionada.
        </Text>

        <View className="mb-4">
          <CalendarWidget
            currentYear={currentYear}
            currentMonth={currentMonth}
            selectedDate={selectedDate}
            todayISO={todayISO}
            minDate={minDate}
            onMonthChange={(year, month) => {
              setCurrentYear(year);
              setCurrentMonth(month);
            }}
            onDateSelect={setSelectedDate}
            hideCardWrapper
          />
        </View>

        {/* Confirm button */}
        <Pressable
          onPress={() => onConfirm(selectedDate)}
          disabled={saving}
          className={`mt-4 bg-midnight rounded-full py-4 items-center justify-center flex-row gap-2 overflow-hidden ${
            saving ? 'opacity-60' : 'active:opacity-80'
          }`}
          style={{ borderCurve: 'continuous' }}
        >
          <IconCalendarPlus size={17} color="#ffffff" strokeWidth={2.2} />
          <Text className="font-sans font-semibold text-[15px] text-white tracking-tight">
            {saving ? 'Guardando...' : 'Confirmar y posponer'}
          </Text>
        </Pressable>

        {/* Cancel */}
        <Pressable
          onPress={handleClose}
          disabled={saving}
          className="mt-2 py-3 items-center active:opacity-50"
        >
          <Text className="font-sans text-[15px] text-ash font-medium">
            Cancelar
          </Text>
        </Pressable>
      </View>
    </Modal>
  );
}
