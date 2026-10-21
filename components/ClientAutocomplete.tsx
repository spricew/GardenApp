import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { IconStar, IconUser } from '@tabler/icons-react-native';

import type { Client } from '@/types';

interface ClientAutocompleteFieldProps {
  value: string;
  onChangeText: (value: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  /** Receives the input's bottom offset so the dropdown can be positioned. */
  onLayoutBottom: (bottom: number) => void;
  label?: string;
  placeholder?: string;
  showSaveAction?: boolean;
  onSaveClient?: () => void;
}

/**
 * Client name input with the optional "save frequent client" action.
 *
 * The dropdown is exported separately because both forms render it outside
 * their `Card` (which clips overflowing content) while the input stays inside.
 */
export function ClientAutocompleteField({
  value,
  onChangeText,
  onFocus,
  onBlur,
  onLayoutBottom,
  label = 'Cliente *',
  placeholder = 'Nombre del cliente',
  showSaveAction = false,
  onSaveClient,
}: ClientAutocompleteFieldProps) {
  const canSave = showSaveAction && onSaveClient !== undefined;

  return (
    <View className="mb-5">
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center gap-1.5">
          <IconUser size={14} color="#343433" strokeWidth={2} />
          <Text className="font-sans font-semibold text-[15px] text-charcoal-primary tracking-tight">
            {label}
          </Text>
        </View>
        {canSave && (
          <Pressable
            onPress={onSaveClient}
            className="flex-row items-center gap-1 active:opacity-50"
          >
            <IconStar size={14} color="#d48f00" strokeWidth={2} />
            <Text className="text-deep-amber font-sans text-[13px] font-medium">
              Guardar frecuente
            </Text>
          </Pressable>
        )}
      </View>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        onBlur={onBlur}
        onLayout={(event) => {
          const layout = event.nativeEvent.layout;
          onLayoutBottom(layout.y + layout.height);
        }}
        placeholder={placeholder}
        className="bg-white border border-stone-surface rounded-lg px-4 py-3 font-sans text-[15px] text-graphite overflow-hidden"
        style={{ borderCurve: 'continuous' }}
        placeholderTextColor="#a7a7a7"
      />
    </View>
  );
}

interface ClientAutocompleteDropdownProps {
  clients: Client[];
  /** Absolute offset from the parent wrapper. */
  top: number;
  onSelect: (client: Client) => void;
  showAddress?: boolean;
}

/** Floating client suggestions list rendered as a sibling of the card. */
export function ClientAutocompleteDropdown({
  clients,
  top,
  onSelect,
  showAddress = true,
}: ClientAutocompleteDropdownProps) {
  if (clients.length === 0) {
    return null;
  }

  return (
    <View
      className="absolute left-6 right-6 rounded-xl bg-white"
      style={{
        top,
        zIndex: 999,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.14,
        shadowRadius: 22,
        elevation: 12,
        borderCurve: 'continuous',
        borderWidth: 0.5,
        borderColor: 'rgba(0,0,0,0.06)',
      }}
    >
      <View className="rounded-xl overflow-hidden" style={{ borderCurve: 'continuous' }}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
          style={{ maxHeight: 324 }}
        >
          {clients.map((client, index) => (
            <Pressable
              key={client.id}
              onPress={() => onSelect(client)}
              className="active:bg-stone-surface/60"
              style={{
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderBottomWidth:
                  index !== clients.length - 1 ? 0.5 : 0,
                borderBottomColor: 'rgba(0,0,0,0.06)',
              }}
            >
              <Text className="font-sans text-[16px] text-charcoal-primary font-medium tracking-tight">
                {client.name}
              </Text>
              {showAddress && client.address ? (
                <Text
                  className="font-sans text-[13px] text-ash mt-0.5"
                  numberOfLines={1}
                >
                  {client.address}
                </Text>
              ) : null}
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}
