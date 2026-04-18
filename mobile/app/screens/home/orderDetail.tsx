import { View, Text, ScrollView, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { getOrderById, OrderDetail } from "@/services/orderService";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ComponentProps } from "react";
import { CustomButton } from "@/components/ui/CustomButton";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import { Payment ,getPaymentByOrderId } from "@/services/paymentService";
import { LinearGradient } from "expo-linear-gradient";
type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

const MACHINE_TYPE_LABELS: Record<string, string> = {
  WASHER: "เครื่องซัก",
  DRYER: "เครื่องอบ",
};

const MACHINE_ICONS: Record<string, IconName> = {
  WASHER: "washing-machine",
  DRYER: "tumble-dryer",
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: "เงินสด",
  QR: "QR Code",
}

const PAYMENT_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: "รอชำระ", color: "#854F0B", bg: "#FAEEDA" },
  PAID:    { label: "ชำระแล้ว", color: "#0F6E56", bg: "#E1F5EE" },
  FAILED:  { label: "ล้มเหลว", color: "#A32D2D", bg: "#FCEBEB" },
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View 
      className="bg-white rounded-2xl p-6 mb-2 border border-gray-50"
      style={{
        // เพิ่มเงาให้ดูมีมิติแบบนุ่มนวล (iOS/Android Support)
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
        elevation: 2,
      }}
    >
      <View className="flex-row items-center mb-4">
        <View className="w-1 h-3 bg-blue-main rounded-full mr-2" /> 
        <Text className="text-[11px] text-gray-400 font-black uppercase tracking-[1.5px]">
          {title}
        </Text>
      </View>
      {children}
    </View>
  );
}

function Row({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View className="flex-row justify-between items-center py-1.5">
      <Text className="text-sm text-gray-400">{label}</Text>
      <Text
        className={`text-sm font-bold ${highlight ? "text-blue-main" : "text-gray-800"}`}
      >
        {value}
      </Text>
    </View>
  );
}

export default function OrderDetailScreen() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState<Payment | null>(null) 

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const [data, paymentData] = await Promise.all([
          getOrderById(orderId as string),
          getPaymentByOrderId(orderId as string),  // ← เพิ่ม
        ])
        setOrder(data)
        setPayment(paymentData)
      } catch (err) {
        console.log("fetchOrder error:", err) 
        Alert.alert("Error", "โหลดข้อมูลคำสั่งซื้อไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);
  const handleReorder = () => {
    if (!order) return;

    const machineIds = order.items.map((i) => i.machine.machine_id).join(",");

    const addonIds = order.items
      .flatMap((i) =>
        i.orderItemAddons.map((a) => a.addonService.addon_service_id),
      )
      .join(",");

    const totalPrice = order.total_price;

    router.push({
      pathname: "/screens/home/orderSummary",
      params: {
        serviceId:
          order.service ?? (order.items[0].machine as any).main_service_id,
        orderId: order.order_id,
        branchId: order.branch.branch_id,
        machineIds,
        addonIds,
        totalPrice,
      },
    });
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center gap-2">
        <ActivityIndicator size="large" color="#00ACC3" />
        <Text className="text-gray-400 text-sm">กำลังโหลด...</Text>
      </View>
    );
  }

  if (!order) return null;

  const machineTotal = order.items.reduce(
    (sum, item) => sum + item.machine.price,
    0,
  );
  const addonTotal = order.items.reduce(
    (sum, item) =>
      sum + item.orderItemAddons.reduce((s, a) => s + a.addonService.price, 0),
    0,
  );

  return (
    <View className="flex-1 bg-gray-50">
        <LinearGradient
        colors={["#E0F7FA", "#F8FAFC", "#F8FAFC"]} // สีฟ้าอ่อนด้านบน ไล่ไปสีเทาขาว
        className="flex-1"
      >
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        {/* สถานะ + order id */}
        <SectionCard title="คำสั่งซื้อ">
          <View className="flex-row items-center justify-between mb-3">
            <OrderStatusBadge status={order.status} />
            <Text className="text-xs text-gray-300">
              #{order.order_id.slice(0, 8)}
            </Text>
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


        {/* รวมสาขาและที่อยู่เข้าด้วยกัน - ปรับขนาดให้เท่ากัน */}
<SectionCard title="ข้อมูลสถานที่">
  <View className="gap-y-4">
    {/* ส่วนสาขา */}
    <View className="flex-row items-center">
      <View className="w-10 h-10 rounded-2xl bg-blue-main items-center justify-center shadow-sm shadow-blue-200">
        <MaterialCommunityIcons name="storefront" size={20} color="white" />
      </View>
      <View className="ml-4">
        <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-tight">สาขาที่ใช้บริการ</Text>
        <Text className="font-bold text-gray-800 text-[15px]">
          {order.branch.branch_name}
        </Text>
      </View>
    </View>

    {/* เส้นคั่นบางๆ */}
    <View className="h-[1px] bg-gray-50 w-full" />

    {/* ส่วนที่อยู่ - ปรับขนาดตัวอักษรให้เท่ากับสาขา */}
    {order.address && (
      <View className="flex-row items-start">
        <View className="w-10 h-10 rounded-2xl bg-blue-50 items-center justify-center border border-blue-100">
          <MaterialCommunityIcons name="map-marker-outline" size={20} color="#00ACC3" />
        </View>
        <View className="ml-4 flex-1">
          <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-tight">ที่อยู่จัดส่ง/รับคืน</Text>
          <Text className="font-bold text-gray-700 text-[15px] mb-1">
            {order.address.label}
          </Text>
          <Text className="text-gray-500 text-[14px] leading-6">
            {[
              order.address.houseNo,
              order.address.district,
              order.address.subDistrict,
              order.address.province,
            ]
              .filter(Boolean)
              .join(" ")}
          </Text>
        </View>
      </View>
    )}
  </View>
</SectionCard>

        {/* เครื่องที่เลือก */}
        <SectionCard title="เครื่องที่เลือก">
          <View className="gap-3">
            {order.items.map((item) => (
              <View
                key={item.order_item_id}
                className="flex-row items-center gap-3"
              >
                <View className="w-10 h-10 rounded-xl bg-blue-light items-center justify-center">
                  <MaterialCommunityIcons
                    name={MACHINE_ICONS[item.machine.type] ?? "washing-machine"}
                    size={20}
                    color="#00ACC3"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-gray-800">
                    {MACHINE_TYPE_LABELS[item.machine.type] ??
                      item.machine.type}
                  </Text>
                  <Text className="text-xs text-gray-400">
                    {item.machine.capacity} กก. ·{" "}
                    {item.machine.duration_minutes} นาที
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
              )),
            )}
          </SectionCard>
        )}

        {/* สรุปราคา */}
        <SectionCard title="สรุปราคา">
          <Row
            label="ค่าเครื่อง"
            value={`${machineTotal.toLocaleString()} ฿`}
          />
          {addonTotal > 0 && (
            <Row
              label="บริการเสริม"
              value={`${addonTotal.toLocaleString()} ฿`}
            />
          )}
          <View className="h-px bg-gray-100 my-2" />
          <Row
            label="รวมทั้งหมด"
            value={`${order.total_price.toLocaleString()} ฿`}
            highlight
          />
        </SectionCard>

        {/* ข้อมูลการชำระเงิน */}
        {payment && (
          <SectionCard title="การชำระเงิน">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center gap-2">
                <MaterialCommunityIcons
                  name={payment.payment_method === "QR" ? "qrcode-scan" : "cash"}
                  size={18} color="#00ACC3"
                />
                <Text className="font-bold text-gray-800 text-sm">
                  {PAYMENT_METHOD_LABELS[payment.payment_method] ?? payment.payment_method}
                </Text>
              </View>
              <View
                className="px-3 py-1 rounded-full"
                style={{ backgroundColor: PAYMENT_STATUS_CONFIG[payment.status]?.bg }}
              >
                <Text
                  className="text-xs font-bold"
                  style={{ color: PAYMENT_STATUS_CONFIG[payment.status]?.color }}
                >
                  {PAYMENT_STATUS_CONFIG[payment.status]?.label}
                </Text>
              </View>
            </View>
            {payment.paid_at && (
              <Row
                label="ชำระเมื่อ"
                value={new Date(payment.paid_at).toLocaleDateString("th-TH", {
                  day: "numeric", month: "long", year: "numeric",
                  hour: "2-digit", minute: "2-digit",
                })}
              />
            )}
          </SectionCard>
        )}
      </ScrollView>
      </LinearGradient>

      <View className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100">
        <CustomButton title="สั่งซื้อซ้ำ" onPress={handleReorder} />
      </View>
    </View>
  );
}
