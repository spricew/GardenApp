import AsyncStorage from '@react-native-async-storage/async-storage';

export const SETTINGS_KEYS = {
  DEFAULT_REMINDER: 'default_reminder',
};

export const getDefaultReminder = async (): Promise<number> => {
  try {
    const value = await AsyncStorage.getItem(SETTINGS_KEYS.DEFAULT_REMINDER);
    if (value !== null) {
      return parseInt(value, 10);
    }
  } catch (error) {
    console.error('Error reading default reminder', error);
  }
  return 2880; // 2 days default
};

export const setDefaultReminderStore = async (value: number): Promise<void> => {
  try {
    await AsyncStorage.setItem(SETTINGS_KEYS.DEFAULT_REMINDER, value.toString());
  } catch (error) {
    console.error('Error saving default reminder', error);
  }
};
