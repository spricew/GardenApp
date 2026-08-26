import { View, Text, ScrollView, Pressable, TextInput, Alert, ActivityIndicator } from "react-native";
import { Stack, useRouter } from "expo-router";
import { useState, useCallback } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { useFocusEffect } from "expo-router";
import { IconTrash, IconUserPlus, IconMapPin, IconUser } from '@tabler/icons-react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { getClients, addClient, removeClient, type Client } from "../../database/clients";
import { Card } from "../../components/Card";

export default function ClientsSettingsScreen() {
  const db = useSQLiteContext();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const loadClients = useCallback(async () => {
    try {
      const data = await getClients(db);
      setClients(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      loadClients();
    }, [loadClients])
  );

  const handleAdd = async () => {
    if (!newName.trim()) {
      Alert.alert("Error", "El nombre del cliente es obligatorio");
      return;
    }

    setIsAdding(true);
    try {
      await addClient(db, newName.trim(), newAddress.trim());
      setNewName("");
      setNewAddress("");
      await loadClients();
    } catch (e) {
      Alert.alert("Error", "No se pudo agregar el cliente");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = (id: number, name: string) => {
    Alert.alert(
      "Eliminar cliente",
      `¿Estás seguro de que deseas eliminar a ${name}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await removeClient(db, id);
              await loadClients();
            } catch (e) {
              Alert.alert("Error", "No se pudo eliminar el cliente");
            }
          }
        }
      ]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Clientes Frecuentes",
          headerTitleAlign: "center",
          headerBackTitle: "Atrás",
        }}
      />
      <SafeAreaView className="flex-1 bg-warm-canvas" edges={['left', 'right']}>
        <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
          <View className="px-6 pt-6 pb-12 gap-6">

            {/* Add New Client Form */}
            <Card>
              <Text className="font-sans font-semibold text-[17px] text-charcoal-primary tracking-tight">
                Nuevo Cliente
              </Text>
              <View className="my-4">
                <View className="flex-row items-center gap-1.5 mb-2">
                  <IconUser size={14} color="#343433" strokeWidth={2} />
                  <Text className="font-sans font-semibold text-[15px] text-charcoal-primary tracking-tight">
                    Nombre *
                  </Text>
                </View>
                <TextInput
                  value={newName}
                  onChangeText={setNewName}
                  placeholder="Ej. Juan Pérez"
                  className="bg-white border border-stone-surface rounded-lg px-4 py-3 font-sans text-[15px] text-graphite"
                  style={{ borderCurve: 'continuous' }}
                  placeholderTextColor="#a7a7a7"
                />
              </View>

              <View className="mb-4">
                <View className="flex-row items-center gap-1.5 mb-2">
                  <IconMapPin size={14} color="#343433" strokeWidth={2} />
                  <Text className="font-sans font-semibold text-[15px] text-charcoal-primary tracking-tight">
                    Dirección (Opcional)
                  </Text>
                </View>
                <TextInput
                  value={newAddress}
                  onChangeText={setNewAddress}
                  placeholder="Ej. Calle Principal #123"
                  className="bg-white border border-stone-surface rounded-lg px-4 py-3 font-sans text-[15px] text-graphite"
                  style={{ borderCurve: 'continuous' }}
                  placeholderTextColor="#a7a7a7"
                />
              </View>

              <Pressable
                onPress={handleAdd}
                disabled={isAdding || !newName.trim()}
                className={`rounded-xl py-3.5 items-center justify-center flex-row gap-2 ${!newName.trim() || isAdding ? "bg-stone-surface" : "bg-midnight active:opacity-80"
                  }`}
                style={{ borderCurve: 'continuous' }}
              >
                {isAdding ? (
                  <ActivityIndicator size="small" color="#a7a7a7" />
                ) : (
                  <>
                    <IconUserPlus size={18} color={!newName.trim() ? "#a7a7a7" : "#ffffff"} strokeWidth={2} />
                    <Text className={`font-sans font-medium text-[15px] ${!newName.trim() ? "text-graphite" : "text-white"}`}>
                      Agregar Cliente
                    </Text>
                  </>
                )}
              </Pressable>
            </Card>

            {/* List of Clients */}
            <Card extraClassName="">
              <Text className="font-sans font-semibold text-[17px] text-charcoal-primary tracking-tight">
                Clientes Guardados ({clients.length})
              </Text>

              {loading ? (
                <View className="py-8 items-center">
                  <ActivityIndicator size="small" color="#343433" />
                </View>
              ) : clients.length === 0 ? (
                <Text className="font-sans text-[15px] text-graphite/70 text-center py-8">
                  No hay clientes guardados
                </Text>
              ) : (
                clients.map((client, index) => (
                  <View
                    key={client.id}
                    className={`flex-row items-center justify-between py-3.5 ${index !== clients.length - 1 ? "border-b border-stone-surface" : ""
                      }`}
                  >
                    <View className="flex-1 pr-4">
                      <Text className="font-sans text-[16px] font-medium text-charcoal-primary mb-1">
                        {client.name}
                      </Text>
                      {client.address ? (
                        <Text className="font-sans text-[14px] text-graphite/80" numberOfLines={1}>
                          {client.address}
                        </Text>
                      ) : null}
                    </View>

                    <Pressable
                      onPress={() => handleDelete(client.id, client.name)}
                      className="p-2 rounded-full bg-coral-red/10 active:opacity-50"
                    >
                      <IconTrash size={18} color="#ff2b3a" strokeWidth={2} />
                    </Pressable>
                  </View>
                ))
              )}
            </Card>


          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
