import { View, Text, Pressable } from "react-native"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import OrderStatusBadge from "./OrderStatusBadge"

type Props = {
  order: {
    order_id: string
    status: string
    total_price: number
    created_at: string
    branch: { branch_name: string }
    items: { machine: { type: string } }[]
  }
  onPress: () => void
}

const MACHINE_TYPE_LABELS: Record<string, string> = {
  WASHER: "เครื่องซัก",
  DRYER: "เครื่องอบ",
}

export default function OrderHistoryCard({ order, onPress }: Props) {
  const machineNames = order.items
    .map((i) => MACHINE_TYPE_LABELS[i.machine.type] ?? i.machine.type)
    .join(", ")

  return (
    <Pressable
      onPress={onPress}
      className="bg-white rounded-3xl p-4 mb-3 border border-gray-100"
    >
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1">
          <Text className="font-bold text-gray-800 mb-1">{order.branch.branch_name}</Text>
          <Text className="text-xs text-gray-400">#{order.order_id.slice(0, 8)}</Text>
        </View>
        <OrderStatusBadge status={order.status} size="sm" />
      </View>

      <View className="h-px bg-gray-100 mb-3" />

      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-1">
          <MaterialCommunityIcons name="washing-machine" size={14} color="#888" />
          <Text className="text-xs text-gray-400">{machineNames}</Text>
        </View>
        <Text className="font-bold text-blue-main">{order.total_price.toLocaleString()} ฿</Text>
      </View>

      <Text className="text-xs text-gray-300 mt-2">
        {new Date(order.created_at).toLocaleDateString("th-TH", {
          day: "numeric", month: "long", year: "numeric",
        })}
      </Text>
    </Pressable>
  )
}