import { View, Text } from "react-native"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { ComponentProps } from "react"
import SummaryRow from "./SummaryRow"
import { Machine } from "@/services/machineService"
import { AddonType } from "@/services/addonService"
type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"]


type Props = {
  serviceName: string
  branchName: string
  machines: Machine[]
  addons: AddonType[]
  totalPrice: number
}

const MACHINE_TYPE_LABELS: Record<string, string> = {
  WASHER: "เครื่องซัก",
  DRYER: "เครื่องอบ",
}

const MACHINE_ICONS: Record<string, IconName> = {
  WASHER: "washing-machine",
  DRYER: "tumble-dryer",
}

export default function SummaryCard({ serviceName, branchName, machines, addons, totalPrice }: Props) {
  return (
    <View className="bg-white rounded-3xl overflow-hidden border border-gray-100">

      {/* header */}
      <View className="bg-blue-main px-5 py-4">
        <Text className="text-white/70 text-xs mb-1">บริการที่เลือก</Text>
        <Text className="text-white text-xl font-bold">{serviceName}</Text>
      </View>

      <View className="p-5 gap-4">

        {/* สาขา */}
        <View>
          <Text className="text-xs text-gray-400 font-bold mb-2 uppercase tracking-wide">สาขา</Text>
          <View className="flex-row items-center gap-2">
            <MaterialCommunityIcons name="map-marker" size={16} color="#00ACC3" />
            <Text className="text-gray-800 font-bold">{branchName}</Text>
          </View>
        </View>

        <View className="h-px bg-gray-100" />

        {/* เครื่องที่เลือก */}
        <View>
          <Text className="text-xs text-gray-400 font-bold mb-3 uppercase tracking-wide">เครื่องที่เลือก</Text>
          <View className="gap-2">
            {machines.map((m) => (
              <View key={m.machine_id} className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-xl bg-blue-light items-center justify-center">
                  <MaterialCommunityIcons
                    name={MACHINE_ICONS[m.type] ?? "washing-machine"}
                    size={20}
                    color="#00ACC3"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-gray-800">
                    {MACHINE_TYPE_LABELS[m.type] ?? m.type}
                  </Text>
                  <Text className="text-xs text-gray-400">
                    {m.capacity} กก. · {m.duration_minutes} นาที
                  </Text>
                </View>
                <Text className="text-sm font-bold text-blue-main">{m.price} ฿</Text>
              </View>
            ))}
          </View>
        </View>

        {/* addon */}
        {addons.length > 0 && (
          <>
            <View className="h-px bg-gray-100" />
            <View>
              <Text className="text-xs text-gray-400 font-bold mb-2 uppercase tracking-wide">บริการเสริม</Text>
              {addons.map((a) => (
                <SummaryRow key={a.addon_service_id} label={a.name} value={`${a.price} ฿`} />
              ))}
            </View>
          </>
        )}

        <View className="h-px bg-gray-100" />

        {/* ราคารวม */}
        <SummaryRow label="ราคารวมทั้งหมด" value={`${totalPrice.toLocaleString()} ฿`} highlight />

      </View>
    </View>
  )
}