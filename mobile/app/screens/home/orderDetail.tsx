import { View, Text, ScrollView, ActivityIndicator, Alert } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useEffect, useState } from "react"
import { getOrderById, OrderDetail } from "@/services/orderService"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { ComponentProps } from "react"
import { CustomButton } from "@/components/ui/CustomButton"
import OrderStatusBadge from "@/components/OrderStatusBadge"

type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"]

const MACHINE_TYPE_LABELS: Record<string, string> = {
  WASHER: "เครื่องซัก",
  DRYER: "เครื่องอบ",
}

const MACHINE_ICONS: Record<string, IconName> = {
  WASHER: "washing-machine",
  DRYER: "tumble-dryer",
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="bg-white rounded-3xl p-5 mb-3 border border-gray-100">
      <Text className="text-xs text-gray-400 font-bold mb-3 uppercase tracking-wide">
        {title}
      </Text>
      {children}
    </View>
  )
}

function Row({ label, value, highlight }: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <View className="flex-row justify-between items-center py-1.5">
      <Text className="text-sm text-gray-400">{label}</Text>
      <Text className={`text-sm font-bold ${highlight ? "text-blue-main" : "text-gray-800"}`}>
        {value}
      </Text>
    </View>
  )
}

export default function OrderDetailScreen() {
  const router = useRouter()
  const { orderId } = useLocalSearchParams()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await getOrderById(orderId as string)
        setOrder(data)
      } catch (err) {
        Alert.alert("Error", "โหลดข้อมูลคำสั่งซื้อไม่สำเร็จ")
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [orderId])

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center gap-2">
        <ActivityIndicator size="large" color="#00ACC3" />
        <Text className="text-gray-400 text-sm">กำลังโหลด...</Text>
      </View>
    )
  }

  if (!order) return null

  const machineTotal = order.items.reduce((sum, item) => sum + item.machine.price, 0)
  const addonTotal = order.items.reduce(
    (sum, item) =>
      sum + item.orderItemAddons.reduce((s, a) => s + a.addonService.price, 0),
    0
  )

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>

        {/* สถานะ + order id */}
        <SectionCard title="คำสั่งซื้อ">
          <View className="flex-row items-center justify-between mb-3">
            <OrderStatusBadge status={order.status} />
            <Text className="text-xs text-gray-300">#{order.order_id.slice(0, 8)}</Text>
          </View>
          <Row
            label="วันที่จอง"
            value={new Date(order.created_at).toLocaleDateString("th-TH", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          />
        </SectionCard>

        {/* สาขา */}
        <SectionCard title="สาขา">
          <View className="flex-row items-center gap-2">
            <View className="w-9 h-9 rounded-xl bg-blue-light items-center justify-center">
              <MaterialCommunityIcons name="map-marker" size={18} color="#00ACC3" />
            </View>
            <Text className="font-bold text-gray-800">{order.branch.branch_name}</Text>
          </View>
        </SectionCard>

        {/* ที่อยู่ */}
        {order.address && (
          <SectionCard title="ที่อยู่">
            <View className="flex-row items-center gap-2">
              <View className="w-9 h-9 rounded-xl bg-blue-light items-center justify-center">
                <MaterialCommunityIcons name="home-outline" size={18} color="#00ACC3" />
              </View>
              <View className="flex-1">
                <Text className="font-bold text-gray-800 text-sm">{order.address.label}</Text>
                <Text className="text-gray-400 text-xs">{order.address.details}</Text>
              </View>
            </View>
          </SectionCard>
        )}

        {/* เครื่องที่เลือก */}
        <SectionCard title="เครื่องที่เลือก">
          <View className="gap-3">
            {order.items.map((item) => (
              <View key={item.order_item_id} className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-xl bg-blue-light items-center justify-center">
                  <MaterialCommunityIcons
                    name={MACHINE_ICONS[item.machine.type] ?? "washing-machine"}
                    size={20}
                    color="#00ACC3"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-gray-800">
                    {MACHINE_TYPE_LABELS[item.machine.type] ?? item.machine.type}
                  </Text>
                  <Text className="text-xs text-gray-400">
                    {item.machine.capacity} กก. · {item.machine.duration_minutes} นาที
                  </Text>
                </View>
                <Text className="text-sm font-bold text-blue-main">
                  {item.machine.price} ฿
                </Text>
              </View>
            ))}
          </View>
        </SectionCard>

        {/* บริการเสริม */}
        {addonTotal > 0 && (
          <SectionCard title="บริการเสริม">
            {order.items.flatMap((item) =>
              item.orderItemAddons.map((a) => (
                <Row
                  key={a.id}
                  label={a.addonService.name}
                  value={`${a.addonService.price} ฿`}
                />
              ))
            )}
          </SectionCard>
        )}

        {/* สรุปราคา */}
        <SectionCard title="สรุปราคา">
          <Row label="ค่าเครื่อง" value={`${machineTotal.toLocaleString()} ฿`} />
          {addonTotal > 0 && (
            <Row label="บริการเสริม" value={`${addonTotal.toLocaleString()} ฿`} />
          )}
          <View className="h-px bg-gray-100 my-2" />
          <Row
            label="รวมทั้งหมด"
            value={`${order.total_price.toLocaleString()} ฿`}
            highlight
          />
        </SectionCard>

      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100">
        <CustomButton
          title="กลับหน้าหลัก"
          onPress={() => router.replace("/(tabs)")}
        />
      </View>
    </View>
  )
}