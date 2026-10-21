import {
  IconCircleCheck,
  IconCircleX,
  IconClock,
  IconPlayerPause,
  IconRefresh,
} from '@tabler/icons-react-native';
import type { Icon } from '@tabler/icons-react-native';

import type { TablerIconName } from '@/types';

/**
 * Single source of truth for the icon component behind each service status.
 *
 * `STATUS_CONFIG` keeps serializable data (labels/colors) in `types`; this map
 * lives separately because it depends on React Native icon components.
 */
export const STATUS_ICONS: Record<TablerIconName, Icon> = {
  IconClock,
  IconRefresh,
  IconPlayerPause,
  IconCircleCheck,
  IconCircleX,
};
