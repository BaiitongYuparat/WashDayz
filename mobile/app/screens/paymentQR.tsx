import { View, Text, ActivityIndicator, Alert } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useEffect, useState } from "react"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { CustomButton } from "@/components/ui/CustomButton"
import { confirmPayment } from "@/services/paymentService"
const QR_TIMEOUT_SECONDS = 300 // 5 นาที

export default function PaymentQRScreen() {
  const router = useRouter()
  const { orderId, totalPrice,paymentId } = useLocalSearchParams()
  const [timeLeft, setTimeLeft] = useState(QR_TIMEOUT_SECONDS)
  const [checking, setChecking] = useState(false)
  

  // countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          Alert.alert("หมดเวลา", "QR Code หมดอายุแล้ว กรุณาลองใหม่")
          router.back()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0")
    const s = (seconds % 60).toString().padStart(2, "0")
    return `${m}:${s}`
  }

  const handleConfirmPayment = async () => {
     try {
      setChecking(true)
      await confirmPayment(paymentId as string)  // ← เรียก confirmPayment
      router.replace({
        pathname: "/screens/home/orderSuccess",
        params: { orderId },
      })
    } catch (err) {
      Alert.alert("Error", "ยังไม่พบการชำระเงิน กรุณาลองใหม่")
    } finally {
      setChecking(false)
    }
  }

  return (
    <View className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center px-6 gap-6">

        {/* header */}
        <View className="items-center gap-1">
          <Text className="font-bold text-2xl text-gray-800">สแกน QR Code</Text>
          <Text className="text-gray-400 text-sm text-center">
            เปิดแอป mobile banking แล้วสแกน QR ด้านล่าง
          </Text>
        </View>

        {/* QR box */}
        <View className="w-64 h-64 rounded-3xl bg-gray-50 border-2 border-blue-main items-center justify-center"
          style={{ borderStyle: "dashed" }}
        >
          <MaterialCommunityIcons name="qrcode" size={180} color="#00ACC3" />
        </View>

        {/* ราคา */}
        <View className="items-center gap-1">
          <Text className="text-gray-400 text-sm">ยอดชำระ</Text>
          <Text className="font-bold text-3xl text-blue-main">
            {Number(totalPrice).toLocaleString()} ฿
          </Text>
        </View>

        {/* countdown */}
        <View className={`flex-row items-center gap-2 px-4 py-2 rounded-full ${
          timeLeft < 60 ? "bg-red-50" : "bg-blue-light"
        }`}>
          <MaterialCommunityIcons
            name="clock-outline"
            size={16}
            color={timeLeft < 60 ? "#A32D2D" : "#00ACC3"}
          />
          <Text className={`text-sm font-bold ${
            timeLeft < 60 ? "text-red-500" : "text-blue-main"
          }`}>
            หมดอายุใน {formatTime(timeLeft)}
          </Text>
        </View>

        {/* order id */}
        <Text className="text-xs text-gray-300">#{(orderId as string)?.slice(0, 8)}</Text>

      </View>

      {/* ปุ่ม */}
      <View className="p-4 gap-3 border-t border-gray-100">
        <CustomButton
          title={checking ? "กำลังตรวจสอบ..." : "ฉันชำระเงินแล้ว"}
          disabled={checking}
          onPress={handleConfirmPayment}
        />
        <CustomButton
          title="ยกเลิก"
          variant="secondary"
          onPress={() => router.back()}
        />
      </View>
    </View>
  )
}