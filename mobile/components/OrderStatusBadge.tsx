import { View, Text } from "react-native"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { ComponentProps } from "react"

type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"]

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: IconName }> = {
  WAITING:    { label: "รอดำเนินการ", color: "#854F0B", bg: "#FAEEDA", icon: "clock-outline" },
  PROCESSING: { label: "กำลังดำเนินการ", color: "#185FA5", bg: "#E6F1FB", icon: "washing-machine" },
  COMPLETED:  { label: "เสร็จสิ้น", color: "#0F6E56", bg: "#E1F5EE", icon: "check-circle-outline" },
  CANCELLED:  { label: "ยกเลิก", color: "#A32D2D", bg: "#FCEBEB", icon: "close-circle-outline" },
}

type Props = {
  status: string
  size?: "sm" | "md"
}

export default function OrderStatusBadge({ status, size = "md" }: Props) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.WAITING

  return (
    <View
      className={`flex-row items-center gap-1 rounded-full self-start ${
        size === "sm" ? "px-2 py-1" : "px-3 py-1.5"
      }`}
      style={{ backgroundColor: config.bg }}
    >
      <MaterialCommunityIcons
        name={config.icon}
        size={size === "sm" ? 12 : 14}
        color={config.color}
      />
      <Text
        className={`font-bold ${size === "sm" ? "text-xs" : "text-xs"}`}
        style={{ color: config.color }}
      >
        {config.label}
      </Text>
    </View>
  )
}