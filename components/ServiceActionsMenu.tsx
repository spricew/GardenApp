import { ActionSheetIOS, Alert, Platform } from 'react-native';

import type { Service, ServiceStatus } from '@/types';
import { STATUS_CONFIG } from '@/types';

export interface ServiceActionsMenuOptions {
  service: Service;
  transitions: readonly ServiceStatus[];
  onEdit: () => void;
  onStatusChange: (status: ServiceStatus) => void;
  onDelete: () => void;
}

/**
 * Opens the native service actions menu.
 *
 * This is an imperative helper rather than a rendered component because
 * `ActionSheetIOS` and `Alert` are imperative platform APIs.
 *
 * Android's `Alert` supports three buttons, so it only exposes Edit/Delete;
 * the valid status transitions remain available as buttons on the screen.
 * A cross-platform action sheet is tracked for Phase 7.
 */
export function showServiceActionsMenu({
  service,
  transitions,
  onEdit,
  onStatusChange,
  onDelete,
}: ServiceActionsMenuOptions): void {
  if (Platform.OS === 'ios') {
    const statusLabels = transitions.map(
      (status) => `Marcar como ${STATUS_CONFIG[status].label}`
    );
    const options = [
      'Cancelar',
      'Editar Servicio',
      ...statusLabels,
      'Eliminar Servicio',
    ];
    const destructiveIndex = options.length - 1;

    ActionSheetIOS.showActionSheetWithOptions(
      {
        title: service.client_name,
        message: 'Opciones del servicio',
        options,
        cancelButtonIndex: 0,
        destructiveButtonIndex: destructiveIndex,
      },
      (buttonIndex) => {
        if (buttonIndex === 1) {
          onEdit();
        } else if (buttonIndex > 1 && buttonIndex < destructiveIndex) {
          const nextStatus = transitions[buttonIndex - 2];
          if (nextStatus) onStatusChange(nextStatus);
        } else if (buttonIndex === destructiveIndex) {
          onDelete();
        }
      }
    );
    return;
  }

  Alert.alert('Opciones', service.client_name, [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Editar Servicio', onPress: onEdit },
    { text: 'Eliminar Servicio', style: 'destructive', onPress: onDelete },
  ]);
}
