import { View, Text } from "react-native";
import { OrderDetail } from "@/services/orderService";

type Props = {
  orders: OrderDetail[];
};

const StatCard = ({
  value,
  label,
  color,
}: {
  value: number;
  label: string;
  color: string;
}) => (
  <View
    className="flex-1 bg-white rounded-2xl p-3 items-center"
    style={{
      shadowColor: "#94A3B8",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 2,
    }}
  >
    <Text className={`font-black text-xl ${color}`}>{value}</Text>
    <Text className="text-gray-400 text-xs mt-0.5">{label}</Text>
  </View>
);

export const OrderStats = ({ orders }: Props) => {
  const total = orders.length;
  const finished = orders.filter((o) => o.status === "FINISHED").length;
  const cancelled = orders.filter((o) => o.status === "CANCELLED").length;

  return (
    <View className="flex-row gap-3 mt-3">
      <StatCard value={total} label="คำสั่งซื้อทั้งหมด" color="text-blue-main" />
      <StatCard value={finished} label="เสร็จสิ้นแล้ว" color="text-green-500" />
      <StatCard value={cancelled} label="ยกเลิก" color="text-orange-400" />
    </View>
  );
};