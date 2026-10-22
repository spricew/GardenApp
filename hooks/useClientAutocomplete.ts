import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

import { addClient, getClients } from '@/database/clients';
import type { Client } from '@/types';

interface UseClientAutocompleteOptions {
  /** Current text in the client input. */
  value: string;
  /** Address saved when the user creates a new frequent client. */
  address?: string;
  /** Applies the selected client to the owning form. */
  onSelect: (client: Client) => void;
}

interface UseClientAutocompleteResult {
  filteredClients: Client[];
  exactMatch: Client | undefined;
  showDropdown: boolean;
  inputBottom: number;
  clientsError: string | null;
  saveClientError: string | null;
  savingClient: boolean;
  handleSaveClient: () => Promise<void>;
  handleSelectClient: (client: Client) => void;
  handleFocus: () => void;
  handleBlur: () => void;
  handleInputLayout: (bottom: number) => void;
}

const BLUR_DELAY_MS = 200;

/**
 * Shared client autocomplete behavior for the service and payment forms.
 *
 * The input stays controlled by the caller; this hook owns the saved-client
 * list, filtering, focus/blur timing and the optional "save frequent client"
 * action.
 */
export function useClientAutocomplete({
  value,
  address,
  onSelect,
}: UseClientAutocompleteOptions): UseClientAutocompleteResult {
  const db = useSQLiteContext();
  const [savedClients, setSavedClients] = useState<Client[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [inputBottom, setInputBottom] = useState(0);
  const [clientsError, setClientsError] = useState<string | null>(null);
  const [saveClientError, setSaveClientError] = useState<string | null>(null);
  const [savingClient, setSavingClient] = useState(false);
  const blurTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearBlurTimeout = useCallback((): void => {
    if (blurTimeout.current !== null) {
      clearTimeout(blurTimeout.current);
      blurTimeout.current = null;
    }
  }, []);

  const refreshClients = useCallback(async (): Promise<void> => {
    try {
      const result = await getClients(db);
      if (result.success) {
        setSavedClients(result.data ?? []);
        setClientsError(null);
      } else {
        setClientsError(
          result.error?.message ?? 'No se pudieron cargar los clientes'
        );
      }
    } catch {
      setClientsError('No se pudieron cargar los clientes');
    }
  }, [db]);

  useEffect(() => {
    void refreshClients();
  }, [refreshClients]);

  useEffect(
    () => () => {
      clearBlurTimeout();
    },
    [clearBlurTimeout]
  );

  const normalizedValue = value.trim().toLowerCase();

  const exactMatch = useMemo(
    () =>
      savedClients.find(
        (client) => client.name.toLowerCase() === normalizedValue
      ),
    [normalizedValue, savedClients]
  );

  const filteredClients = useMemo(
    () =>
      savedClients.filter((client) =>
        client.name.toLowerCase().includes(normalizedValue)
      ),
    [normalizedValue, savedClients]
  );

  const showDropdown =
    isFocused && filteredClients.length > 0 && !exactMatch;

  const handleSelectClient = useCallback(
    (client: Client): void => {
      clearBlurTimeout();
      onSelect(client);
      setIsFocused(false);
    },
    [clearBlurTimeout, onSelect]
  );

  const handleFocus = useCallback((): void => {
    clearBlurTimeout();
    setIsFocused(true);
  }, [clearBlurTimeout]);

  const handleBlur = useCallback((): void => {
    clearBlurTimeout();
    blurTimeout.current = setTimeout(() => {
      setIsFocused(false);
      blurTimeout.current = null;
    }, BLUR_DELAY_MS);
  }, [clearBlurTimeout]);

  const handleInputLayout = useCallback((bottom: number): void => {
    setInputBottom(bottom);
  }, []);

  const handleSaveClient = useCallback(async (): Promise<void> => {
    const name = value.trim();
    if (!name) return;

    setSavingClient(true);
    setSaveClientError(null);

    try {
      const result = await addClient(db, name, address?.trim() || undefined);
      if (!result.success) {
        setSaveClientError(
          result.error?.message ?? 'No se pudo guardar el cliente'
        );
        return;
      }

      await refreshClients();
    } catch {
      setSaveClientError('No se pudo guardar el cliente');
    } finally {
      setSavingClient(false);
    }
  }, [address, db, refreshClients, value]);

  return {
    filteredClients,
    exactMatch,
    showDropdown,
    inputBottom,
    clientsError,
    saveClientError,
    savingClient,
    handleSaveClient,
    handleSelectClient,
    handleFocus,
    handleBlur,
    handleInputLayout,
  };
}
