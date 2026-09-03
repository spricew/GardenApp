import { View, Text, ScrollView, Pressable, TextInput, Alert, ActivityIndicator } from "react-native";
import { Stack } from "expo-router";
import { useState, useCallback } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { useFocusEffect } from "expo-router";
import { IconTrash, IconPlus, IconAlignLeft } from '@tabler/icons-react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { getDefaultServices, addDefaultService, removeDefaultService } from "../../database/default_services";
import type { DefaultService } from "@/types";
import { Card } from "../../components/Card";

export default function DefaultServicesSettingsScreen() {
  const db = useSQLiteContext();
  const [services, setServices] = useState<DefaultService[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const loadServices = useCallback(async () => {
    try {
      const result = await getDefaultServices(db);
      if (result.success && result.data) {
        setServices(result.data);
      }
    } catch (e) {
      // Error handled by state
    } finally {
      setLoading(false);
    }
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      loadServices();
    }, [loadServices])
  );

  const handleAdd = async () => {
    if (!newName.trim()) {
      Alert.alert("Error", "El nombre del servicio es obligatorio");
      return;
    }
    
    setIsAdding(true);
    try {
      const result = await addDefaultService(db, newName.trim());
      if (!result.success) {
        Alert.alert("Error", result.error?.message || "No se pudo agregar el servicio");
        return;
      }
      setNewName("");
      await loadServices();
    } catch (e) {
      Alert.alert("Error", "No se pudo agregar el servicio");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = (id: number, name: string) => {
    Alert.alert(
      "Eliminar servicio",
      `¿Estás seguro de que deseas eliminar "${name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          style: "destructive",
          onPress: async () => {
            try {
              const result = await removeDefaultService(db, id);
              if (!result.success) {
                Alert.alert("Error", result.error?.message || "No se pudo eliminar el servicio");
                return;
              }
              await loadServices();
            } catch (e) {
              Alert.alert("Error", "No se pudo eliminar el servicio");
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
          title: "Servicios Predeterminados",
          headerTitleAlign: "center",
          headerBackTitle: "Atrás",
        }}
      />
      <SafeAreaView className="flex-1 bg-warm-canvas" edges={['left', 'right']}>
        <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
          <View className="px-6 pt-6 pb-12 gap-6">
            
            {/* Add New Service Form */}
            <View>
              <Text className="font-sans text-[13px] font-semibold text-graphite/70 uppercase tracking-wider mb-2 ml-2">
                Nuevo Servicio
              </Text>
              <Card>
                <View className="mb-4">
                  <View className="flex-row items-center gap-1.5 mb-2">
                    <IconAlignLeft size={14} color="#343433" strokeWidth={2} />
                    <Text className="font-sans font-semibold text-[15px] text-charcoal-primary tracking-tight">
                      Nombre del servicio *
                    </Text>
                  </View>
                  <TextInput
                    value={newName}
                    onChangeText={setNewName}
                    placeholder="Ej. Limpieza general"
                    className="bg-white border border-stone-surface rounded-lg px-4 py-3 font-sans text-[15px] text-graphite"
                    style={{ borderCurve: 'continuous' }}
                    placeholderTextColor="#a7a7a7"
                  />
                </View>

                <Pressable
                  onPress={handleAdd}
                  disabled={isAdding || !newName.trim()}
                  className={`rounded-xl py-3.5 items-center justify-center flex-row gap-2 ${
                    !newName.trim() || isAdding ? "bg-stone-surface" : "bg-midnight active:opacity-80"
                  }`}
                  style={{ borderCurve: 'continuous' }}
                >
                  {isAdding ? (
                    <ActivityIndicator size="small" color="#a7a7a7" />
                  ) : (
                    <>
                      <IconPlus size={18} color={!newName.trim() ? "#a7a7a7" : "#ffffff"} strokeWidth={2} />
                      <Text className={`font-sans font-medium text-[15px] ${!newName.trim() ? "text-graphite" : "text-white"}`}>
                        Agregar Servicio
                      </Text>
                    </>
                  )}
                </Pressable>
              </Card>
            </View>

            {/* List of Services */}
            <View>
              <Text className="font-sans text-[13px] font-semibold text-graphite/70 uppercase tracking-wider mb-2 ml-2">
                Servicios Guardados ({services.length})
              </Text>
              
              {loading ? (
                <View className="py-8 items-center">
                  <ActivityIndicator size="small" color="#343433" />
                </View>
              ) : services.length === 0 ? (
                <Text className="font-sans text-[15px] text-graphite/70 text-center py-8">
                  No hay servicios guardados
                </Text>
              ) : (
                <View className="bg-white rounded-2xl overflow-hidden border border-stone-surface" style={{ borderCurve: 'continuous' }}>
                  {services.map((service, index) => (
                    <View 
                      key={service.id}
                      className={`flex-row items-center justify-between p-4 ${
                        index !== services.length - 1 ? "border-b border-stone-surface" : ""
                      }`}
                    >
                      <View className="flex-1 pr-4">
                        <Text className="font-sans text-[16px] font-medium text-charcoal-primary">
                          {service.name}
                        </Text>
                      </View>
                      
                      <Pressable 
                        onPress={() => handleDelete(service.id, service.name)}
                        className="p-2 rounded-full bg-coral-red/10 active:opacity-50"
                      >
                        <IconTrash size={18} color="#ff2b3a" strokeWidth={2} />
                      </Pressable>
                    </View>
                  ))}
                </View>
              )}
            </View>

          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
