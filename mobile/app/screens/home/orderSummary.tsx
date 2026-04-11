import { View, Text, ScrollView, Alert, ActivityIndicator } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useEffect, useState } from "react"
import { CustomButton } from "@/components/ui/CustomButton"
import SummaryCard from "@/components/SummaryCard"
import { createOrder } from "@/services/orderService"
import { getMachinesByIds, Machine } from "@/services/machineService"
import { getAddonByIds, AddonType } from "@/services/addonService"
import { getMainServicesById, MainService } from "@/services/mainServices"
import { getBranchById, Branch } from "@/services/branchService"
import { useUser } from "@/provider/UserProvider"

export default function OrderSummaryScreen() {
  const router = useRouter()
  const { serviceId, branchId, machineIds, addonIds, totalPrice } = useLocalSearchParams()
      const { user } = useUser();
  const [service, setService] = useState<MainService | null>(null)
  const [branch, setBranch] = useState<Branch | null>(null)
  const [machines, setMachines] = useState<Machine[]>([])
  const [addons, setAddons] = useState<AddonType[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const machineIdList = (machineIds as string)?.split(",").filter(Boolean)
        const addonIdList = (addonIds as string)?.split(",").filter(Boolean)

        const [serviceData, branchData, machineData] = await Promise.all([
          getMainServicesById(serviceId as string),
          getBranchById(branchId as string),
          getMachinesByIds(machineIdList),
        ])

        setService(serviceData)
        setBranch(branchData)
        setMachines(machineData)

        if (addonIdList?.length) {
          const addonData = await getAddonByIds(addonIdList)
          setAddons(addonData)
        }
      } catch (err) {
        Alert.alert("Error", "โหลดข้อมูลไม่สำเร็จ")
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const handleConfirm = async () => {
  try {
    setSubmitting(true)
    const machineIdList = (machineIds as string)?.split(",").filter(Boolean)
    const addonIdList = (addonIds as string)?.split(",").filter(Boolean) ?? []

    const result = await createOrder(user!.user_id, {
      branch_id: branchId as string,
      machine_ids: machineIdList,
      addon_ids: addonIdList,
    })

    router.replace({
      pathname: "/screens/home/orderSuccess",
      params: { orderId: result.order_id },
    })
  } catch (err) {
    Alert.alert("Error", "สร้างคำสั่งซื้อไม่สำเร็จ")
  } finally {
    setSubmitting(false)
  }
}

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center gap-2">
        <ActivityIndicator size="large" color="#00ACC3" />
        <Text className="text-gray-400 text-sm">กำลังโหลดข้อมูล...</Text>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <Text className="font-bold text-2xl text-gray-800 mb-4">สรุปคำสั่งซื้อ</Text>

        <SummaryCard
          serviceName={service?.name ?? ""}
          branchName={branch?.branch_name ?? ""}
          machines={machines}
          addons={addons}
          totalPrice={Number(totalPrice)}
        />
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100">
        <CustomButton
          title={submitting ? "กำลังจอง..." : "ยืนยันการจอง"}
          disabled={submitting}
          onPress={handleConfirm}
        />
      </View>
    </View>
  )
}