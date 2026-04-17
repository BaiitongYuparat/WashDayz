import { View, Text, ScrollView, Alert, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState, useRef } from "react";
import {
  getOrderById,
  OrderDetail,
  putOrderStatus,
} from "@/services/orderService";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { CustomButton } from "@/components/ui/CustomButton";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import TrackingTimeline from "@/components/TrackingTimeline";
import { getQueueByOrderId, Queue } from "@/services/queueService";

const MACHINE_TYPE_LABELS: Record<string, string> = {
  WASHER: "เครื่องซัก",
  DRYER: "เครื่องอบ",
};

const CANCELLABLE_STATUSES = ["WAITING"];

export default function OrderTrackingScreen() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [queues, setQueues] = useState<Queue[]>([]);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const [data, queueData] = await Promise.all([
        getOrderById(orderId as string),
        getQueueByOrderId(orderId as string), // ← เพิ่ม
      ]);
      console.log("queueData:", queueData);
      setOrder(data);
      setQueues(queueData);

      // หยุด polling ถ้าเสร็จแล้ว
      if (data.status === "COMPLETED" || data.status === "CANCELLED") {
        if (pollingRef.current) clearInterval(pollingRef.current);
      }
    } catch (err) {
      console.log("fetch order error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    // polling ทุก 30 วินาที
    pollingRef.current = setInterval(fetchOrder, 30000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [orderId]);

  const handleCancel = () => {
    Alert.alert("ยกเลิกคำสั่งซื้อ", "คุณต้องการยกเลิกคำสั่งซื้อนี้ใช่ไหม?", [
      { text: "ไม่", style: "cancel" },
      {
        text: "ยืนยัน",
        style: "destructive",
        onPress: async () => {
          try {
            setCancelling(true);
            await putOrderStatus(orderId as string, "CANCELLED"); //แก้ order status เป็น cancelled
            await fetchOrder();
            Alert.alert("สำเร็จ", "ยกเลิกคำสั่งซื้อแล้ว");
          } catch (err) {
            Alert.alert("Error", "ยกเลิกไม่สำเร็จ กรุณาลองใหม่");
          } finally {
            setCancelling(false);
          }
        },
      },
    ]);
  };

  if (loading || !order) {
    return (
      <View className="flex-1 items-center justify-center gap-2">
        <ActivityIndicator size="large" color="#00ACC3" />
        <Text className="text-gray-400 text-sm">กำลังโหลด...</Text>
      </View>
    );
  }

  const canCancel = CANCELLABLE_STATUSES.includes(order.status);

  const sortedQueues = [...queues].sort((a, b) => {
    const order: Record<string, number> = {
      WASHER: 0,
      DRYER: 1,
    };

    return (
      (order[a.machine_type ?? ""] ?? 99) - (order[b.machine_type ?? ""] ?? 99)
    );
  });

  const washerQueues = queues.filter((q) => q.machine_type === "WASHER");

  const washerDone =
    washerQueues.length === 0
      ? true
      : washerQueues.every((q) => !!q.finished_at);

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        {/* แสดงคิว */}
        {queues.length > 0 && (
          <View className="bg-white rounded-3xl p-5 mb-4 border border-gray-100">
            <Text className="font-bold text-gray-800 mb-3">คิวของคุณ</Text>

            <View className="gap-3">
              {sortedQueues.map((q) => {
                const isDryer = q.machine_type === "DRYER";
                const isWaiting = isDryer && !washerDone && !q.finished_at;
                console.log("washerDone:", washerDone);
                console.log("queues:", JSON.stringify(queues, null, 2));

                return (
                  <View
                    key={q.queue_id}
                    className={`flex-row items-center justify-between p-4 rounded-2xl border border-gray-100 ${
                      isWaiting ? "opacity-50 bg-gray-100" : "bg-gray-50"
                    }`}
                  >
                    {/* ซ้าย */}
                    <View className="flex-row items-center gap-3">
                      <View className="bg-blue-100 p-2 rounded-full">
                        <MaterialCommunityIcons
                          name="ticket-outline"
                          size={18}
                          color="#00ACC3"
                        />
                      </View>
                      <View>
                        <Text className="font-bold text-gray-800">
                          {q.machine_type === "WASHER"
                            ? "เครื่องซัก"
                            : "เครื่องอบ"}
                        </Text>
                        <Text className="text-gray-400 text-xs">
                          คิวที่ {q.queue_number}
                        </Text>
                      </View>
                    </View>

                    {/* ขวา */}
                    <View
                      className={`px-3 py-1.5 rounded-full ${
                        q.finished_at
                          ? "bg-gray-100"
                          : isWaiting
                            ? "bg-gray-200"
                            : q.branch_machine_id
                              ? "bg-green-100"
                              : "bg-yellow-100"
                      }`}
                    >
                      <Text
                        className={`text-xs font-bold ${
                          q.finished_at
                            ? "text-gray-500"
                            : isWaiting
                              ? "text-gray-400"
                              : q.branch_machine_id
                                ? "text-green-700"
                                : "text-yellow-700"
                        }`}
                      >
                        {q.finished_at
                          ? "เสร็จสิ้น"
                          : isWaiting
                            ? "รอซักเสร็จก่อน"
                            : q.branch_machine_id
                              ? "กำลังใช้งาน"
                              : "รอเครื่องว่าง"}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}
        <View className="bg-blue-main rounded-3xl p-5 mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-white/70 text-xs">หมายเลขคำสั่งซื้อ</Text>
            <Text className="text-white/70 text-xs">
              #{order.order_id.slice(0, 8)}
            </Text>
          </View>

          <Text className="text-white font-bold text-xl mb-1">
            {order.branch.branch_name}
          </Text>

          <View className="flex-row items-center gap-2 mt-2">
            <OrderStatusBadge status={order.status} />
          </View>

          {/* เครื่องที่ใช้ */}
          <View className="mt-4 gap-1">
            {order.items.map((item) => (
              <View
                key={item.order_item_id}
                className="flex-row items-center gap-2"
              >
                <MaterialCommunityIcons
                  name="washing-machine"
                  size={14}
                  color="rgba(255,255,255,0.7)"
                />
                <Text className="text-white/70 text-xs">
                  {MACHINE_TYPE_LABELS[item.machine.type] ?? item.machine.type}{" "}
                  · {item.machine.capacity} กก.
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Tracking Timeline */}

        <View className="bg-white rounded-3xl p-5 mb-4 border border-gray-100">
          <Text className="font-bold text-gray-800 mb-4">สถานะคำสั่งซื้อ</Text>
          <TrackingTimeline currentStatus={order.status} />
        </View>

        {order.status === "COMPLETED" && (
          <View className="bg-green-50 rounded-3xl p-5 mb-4 border border-green-100 flex-row items-center gap-3">
            <MaterialCommunityIcons name="hanger" size={28} color="#0F6E56" />
            <View className="flex-1">
              <Text className="font-bold text-green-800 text-sm">
                ผ้าพร้อมรับแล้ว!
              </Text>
              <Text className="text-green-600 text-xs mt-0.5">
                กรุณามารับผ้าที่สาขา {order.branch.branch_name}
              </Text>
            </View>
          </View>
        )}

        {order.status === "CANCELLED" && (
          <View className="bg-red-50 rounded-3xl p-5 mb-4 border border-red-100 flex-row items-center gap-3">
            <MaterialCommunityIcons
              name="close-circle-outline"
              size={28}
              color="#A32D2D"
            />
            <View className="flex-1">
              <Text className="font-bold text-red-800 text-sm">
                คำสั่งซื้อถูกยกเลิกแล้ว
              </Text>
              <Text className="text-red-400 text-xs mt-0.5">
                หากมีข้อสงสัยกรุณาติดต่อสาขา
              </Text>
            </View>
          </View>
        )}

        {/* ราคารวม */}
        <View className="bg-white rounded-3xl p-5 border border-gray-100">
          <View className="flex-row justify-between">
            <Text className="text-gray-400 text-sm">ราคารวม</Text>
            <Text className="font-bold text-blue-main">
              {order.total_price.toLocaleString()} ฿
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* ยกเลิกคำสั่งซื้อ */}
      <View className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 gap-3">
        {canCancel && (
          <CustomButton
            title={cancelling ? "กำลังยกเลิก..." : "ยกเลิกคำสั่งซื้อ"}
            variant="danger"
            disabled={cancelling}
            onPress={handleCancel}
          />
        )}
        <CustomButton
          title="กลับหน้าหลัก"
          variant={canCancel ? "secondary" : "primary"}
          onPress={() => router.replace("/(tabs)")}
        />
      </View>
    </View>
  );
}
