import { View, Text, Pressable, Alert } from "react-native";
import { IconCurrencyDollar, IconCheck, IconTrash, IconClock } from "@tabler/icons-react-native";
import type { PaymentDate } from "@/types";
import { Card } from "./Card";

interface PaymentCardProps {
  payment: PaymentDate;
  onTogglePaid: (id: number, isPaid: boolean) => void;
  onDelete: (id: number) => void;
}

export function PaymentCard({ payment, onTogglePaid, onDelete }: PaymentCardProps) {
  const isPaid = payment.is_paid === 1;

  const handleDelete = () => {
    Alert.alert(
      "Eliminar cobro",
      `¿Deseas eliminar la fecha de pago de ${payment.client_name}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => onDelete(payment.id),
        },
      ]
    );
  };

  return (
    <Card extraClassName="mb-3">
      <View className="flex-row items-start justify-between">
        <View className="flex-1 mr-3">
          <View className="flex-row items-center gap-1.5 mb-1">
            <View
              className={`w-6 h-6 rounded-full items-center justify-center ${
                isPaid ? "bg-valid-green/15" : "bg-deep-amber/15"
              }`}
              style={{ borderCurve: "continuous" }}
            >
              <IconCurrencyDollar
                size={14}
                color={isPaid ? "#00c454" : "#d48f00"}
                strokeWidth={2.4}
              />
            </View>
            <Text
              className="font-sans font-semibold text-[17px] text-charcoal-primary tracking-tight"
              numberOfLines={1}
            >
              {payment.client_name}
            </Text>
          </View>

          <Text className="font-sans font-bold text-[20px] text-graphite pl-7 tracking-tight">
            {payment.amount !== null && payment.amount !== undefined
              ? `$${payment.amount.toLocaleString("es-MX", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`
              : "Monto a convenir"}
          </Text>

          {payment.notes ? (
            <Text className="font-sans text-[13px] text-ash pl-7 mt-1" numberOfLines={2}>
              {payment.notes}
            </Text>
          ) : null}
        </View>

        <Pressable
          onPress={handleDelete}
          className="p-2 rounded-full active:bg-stone-surface"
        >
          <IconTrash size={16} color="#a7a7a7" strokeWidth={1.8} />
        </Pressable>
      </View>

      <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-stone-surface/60">
        <View className="flex-row items-center gap-1.5">
          {isPaid ? (
            <IconCheck size={14} color="#00c454" strokeWidth={2.5} />
          ) : (
            <IconClock size={14} color="#d48f00" strokeWidth={2} />
          )}
          <Text
            className={`font-sans text-[13px] font-medium ${
              isPaid ? "text-valid-green" : "text-deep-amber"
            }`}
          >
            {isPaid ? "Cobrado / Pagado" : "Pendiente de cobro"}
          </Text>
        </View>

        <Pressable
          onPress={() => onTogglePaid(payment.id, !isPaid)}
          className={`px-3.5 py-1.5 rounded-full flex-row items-center gap-1 ${
            isPaid ? "bg-stone-surface" : "bg-midnight active:opacity-80"
          }`}
          style={{ borderCurve: "continuous" }}
        >
          <Text
            className={`font-sans text-[12px] font-semibold ${
              isPaid ? "text-graphite" : "text-white"
            }`}
          >
            {isPaid ? "Marcar pendiente" : "Marcar pagado"}
          </Text>
        </Pressable>
      </View>
    </Card>
  );
}
