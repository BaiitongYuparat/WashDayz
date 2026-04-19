import { View, Text, ScrollView, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { getOrdersByUser, OrderDetail } from "@/services/orderService";
import { useUser } from "@/provider/UserProvider";
import OrderHistoryCard from "@/components/OrderHistoryCard";
import { useFocusEffect } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
const ACTIVE_STATUSES = ["WAITING", "WASHING"];

export default function OrderActiveTrackingScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [orders, setOrders] = useState<OrderDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
  useCallback(() => {
    if (!user?.user_id) return;

    setLoading(true);

    const fetchOrders = async () => {
      try {
        const data = await getOrdersByUser(user.user_id);

        setOrders(
          data.filter((o) => ACTIVE_STATUSES.includes(o.status))
        );
      } catch (err) {
        Alert.alert("Error", "โหลดข้อมูลไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user?.user_id])
);
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#00ACC3" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        {orders.length === 0 ? (
          <View className="items-center justify-center mt-20 gap-3">
            <MaterialCommunityIcons name="check-circle-outline" size={64} color="#9CA3AF" />
            <Text className="text-gray-400 text-sm">
              ไม่มีคำสั่งซื้อที่กำลังดำเนินการ
            </Text>
          </View>
        ) : (
          orders.map((order) => (
            <OrderHistoryCard
              key={order.order_id}
              order={order}
              onPress={() =>
                router.push({
                  pathname: "/screens/track/orderTracking", // ← ไป tracking
                  params: { orderId: order.order_id },
                })
              }
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}
