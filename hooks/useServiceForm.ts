import { useCallback } from 'react';

import { useClientAutocomplete } from '@/hooks/useClientAutocomplete';
import { useServiceFormFields } from '@/hooks/useServiceFormFields';
import { useServiceMultiSelect } from '@/hooks/useServiceMultiSelect';
import type { Client, ServiceFormData, ServiceFormValues } from '@/types';

interface UseServiceFormOptions {
  initialValues?: Partial<ServiceFormValues>;
  onSubmit: (data: ServiceFormData) => void;
}

/**
 * Composes the service form behavior from focused hooks:
 * field state/validation, client autocomplete and default-service selection.
 */
export function useServiceForm({
  initialValues,
  onSubmit,
}: UseServiceFormOptions) {
  const fields = useServiceFormFields({ initialValues, onSubmit });
  const { setAddress, setClientName } = fields;

  const handleClientSelect = useCallback(
    (client: Client): void => {
      setClientName(client.name);
      if (client.address) setAddress(client.address);
    },
    [setAddress, setClientName]
  );

  const clients = useClientAutocomplete({
    value: fields.clientName,
    address: fields.address,
    onSelect: handleClientSelect,
  });

  const services = useServiceMultiSelect(
    fields.description,
    fields.setDescription
  );

  return {
    // Fields
    clientName: fields.clientName,
    setClientName: fields.setClientName,
    address: fields.address,
    setAddress: fields.setAddress,
    description: fields.description,
    setDescription: fields.setDescription,
    notes: fields.notes,
    setNotes: fields.setNotes,
    expense: fields.expense,
    setExpense: fields.setExpense,
    reminderMinutes: fields.reminderMinutes,
    setReminderMinutes: fields.setReminderMinutes,
    scheduledDate: fields.scheduledDate,
    scheduledTime: fields.scheduledTime,
    scheduledDateObj: fields.scheduledDateObj,
    scheduledTimeObj: fields.scheduledTimeObj,

    // Client autocomplete
    filteredClients: clients.filteredClients,
    exactMatch: clients.exactMatch,
    showDropdown: clients.showDropdown,
    clientInputBottom: clients.inputBottom,
    clientsError: clients.clientsError,
    saveClientError: clients.saveClientError,
    savingClient: clients.savingClient,
    handleSaveClient: clients.handleSaveClient,
    handleSelectClient: clients.handleSelectClient,
    handleClientFocus: clients.handleFocus,
    handleClientBlur: clients.handleBlur,
    handleClientInputLayout: clients.handleInputLayout,

    // Default services
    defaultServices: services.defaultServices,
    servicesError: services.servicesError,
    selectedServices: services.selectedServices,
    isServiceSelected: services.isServiceSelected,
    handleToggleService: services.handleToggleService,

    // Date / time
    onDateChange: fields.onDateChange,
    onTimeChange: fields.onTimeChange,

    // Submit
    handleSubmit: fields.handleSubmit,
  };
}
