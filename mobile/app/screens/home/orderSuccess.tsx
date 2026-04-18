import { View, Text } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CustomButton } from "@/components/ui/CustomButton";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function OrderSuccessScreen() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams();
  console.log("orderId:", orderId)

  return (
    <View className="flex-1 bg-white items-center justify-center p-6 gap-6">
      {/* icon */}
      <View className="w-24 h-24 rounded-full bg-blue-light items-center justify-center">
        <MaterialCommunityIcons name="check-circle" size={56} color="#00ACC3" />
      </View>

      {/* text */}
      <View className="items-center gap-2">
        <Text className="text-2xl font-bold text-gray-800">จองคิวสำเร็จ!</Text>
        <Text className="text-gray-400 text-sm text-center">
          คำสั่งซื้อของคุณถูกบันทึกแล้ว
        </Text>
        <Text className="text-xs text-gray-300">#{orderId}</Text>
      </View>

      {/* ปุ่ม */}
      <View className="w-full gap-3 mt-4">
        <CustomButton
          title="กลับหน้าหลัก"
          onPress={() =>
            router.push({
              pathname: "/(tabs)",
              params: { orderId },
            })
          }
        />
        <CustomButton
          title="ติดตามคำสั่งซื้อ"
          onPress={() => {
            router.dismissAll()
            router.replace("/(tabs)/track")
            router.push({
              pathname: "/screens/track/orderTracking",
              params: { orderId },
            })
          }    
          }
        />
      </View>
    </View>
  );
}
