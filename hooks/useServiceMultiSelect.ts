import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import type { Dispatch, SetStateAction } from 'react';

import { getDefaultServices } from '@/database/default_services';
import type { DefaultService } from '@/types';

/**
 * Default-service pills for the service form.
 *
 * The selected values are derived from the comma-separated `description`
 * field, so typing "Poda, Riego" and toggling pills stay in sync.
 */
export function useServiceMultiSelect(
  description: string,
  setDescription: Dispatch<SetStateAction<string>>
) {
  const db = useSQLiteContext();
  const [defaultServices, setDefaultServices] = useState<DefaultService[]>([]);
  const [servicesError, setServicesError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadDefaultServices = async (): Promise<void> => {
      try {
        const result = await getDefaultServices(db);
        if (cancelled) return;

        if (result.success) {
          setDefaultServices(result.data ?? []);
          setServicesError(null);
        } else {
          setServicesError(
            result.error?.message ??
              'No se pudieron cargar los servicios predeterminados'
          );
        }
      } catch {
        if (!cancelled) {
          setServicesError('No se pudieron cargar los servicios predeterminados');
        }
      }
    };

    void loadDefaultServices();

    return () => {
      cancelled = true;
    };
  }, [db]);

  const selectedServices = useMemo(
    () =>
      description
        .split(',')
        .map((service) => service.trim())
        .filter(Boolean),
    [description]
  );

  const isServiceSelected = useCallback(
    (serviceName: string): boolean => {
      const target = serviceName.trim().toLowerCase();
      return selectedServices.some(
        (selected) => selected.toLowerCase() === target
      );
    },
    [selectedServices]
  );

  const handleToggleService = useCallback(
    (serviceName: string): void => {
      const target = serviceName.trim();
      const selected = isServiceSelected(target);

      let updated: string[];
      if (selected) {
        updated = selectedServices.filter(
          (service) => service.toLowerCase() !== target.toLowerCase()
        );
      } else {
        updated = [...selectedServices, target];
      }

      setDescription(updated.join(', '));
    },
    [isServiceSelected, selectedServices, setDescription]
  );

  return {
    defaultServices,
    servicesError,
    selectedServices,
    isServiceSelected,
    handleToggleService,
  };
}
