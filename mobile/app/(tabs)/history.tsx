import { View, Text, ScrollView, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { getOrdersByUser, OrderDetail } from "@/services/orderService";
import { useUser } from "@/provider/UserProvider";
import OrderHistoryCard from "@/components/OrderHistoryCard";
import { LinearGradient } from "expo-linear-gradient";

export default function OrderHistoryScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [orders, setOrders] = useState<OrderDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.user_id) return;
    const fetchOrders = async () => {
      try {
        if (!user?.user_id) return;
        const data = await getOrdersByUser(user.user_id);
        setOrders(
          data.filter(
            (o) => o.status === "FINISHED" || o.status === "CANCELLED",
          ),
        );
      } catch (err) {
        Alert.alert("Error", "โหลดประวัติคำสั่งซื้อไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user?.user_id]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#00ACC3" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <LinearGradient
        colors={["#E0F7FA", "#F8FAFC", "#FFFF"]}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
          {orders.length === 0 ? (
            <View className="items-center justify-center mt-20 gap-3">
              <Text className="text-5xl">🧺</Text>
              <Text className="text-gray-400 text-sm">
                ยังไม่มีประวัติคำสั่งซื้อ
              </Text>
            </View>
          ) : (
            orders.map((order) => (
              <OrderHistoryCard
                key={order.order_id}
                order={order}
                onPress={() =>
                  router.push({
                    pathname: "/screens/home/orderDetail",
                    params: { orderId: order.order_id },
                  })
                }
              />
            ))
          )}
        </ScrollView>
      </LinearGradient>
    </View>
  );
}
