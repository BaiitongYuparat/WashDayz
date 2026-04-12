import { View, Text } from "react-native"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { ComponentProps } from "react"

type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"]

type Step = {
  id: string
  label: string
  description: string
  icon: IconName
}

const STEPS: Step[] = [
  {
    id: "WAITING",
    label: "รอคิว",
    description: "คำสั่งซื้อของคุณกำลังรอดำเนินการ",
    icon: "clock-outline",
  },
  {
    id: "WASHING",
    label: "กำลังซัก",
    description: "เครื่องกำลังทำงานอยู่",
    icon: "washing-machine",
  },
  {
    id: "FINISHED",
    label: "พร้อมรับผ้า",
    description: "ผ้าของคุณพร้อมแล้ว กรุณามารับได้เลย",
    icon: "hanger",
  },
]

const STATUS_ORDER = ["WAITING", "WASHINGG", "FINISHED"]

type Props = {
  currentStatus: string
}

export default function TrackingTimeline({ currentStatus }: Props) {
  const currentIndex = STATUS_ORDER.indexOf(currentStatus)

  return (
    <View className="px-2">
      {STEPS.map((step, index) => {
        const isDone = index < currentIndex
        const isActive = index === currentIndex
        const isPending = index > currentIndex

        return (
          <View key={step.id} className="flex-row gap-4">

            {/* left: icon + line */}
            <View className="items-center">
              <View className={`w-10 h-10 rounded-full items-center justify-center ${
                isDone ? "bg-blue-main" :
                isActive ? "bg-blue-main" :
                "bg-gray-100"
              }`}>
                <MaterialCommunityIcons
                  name={isDone ? "check" : step.icon}
                  size={20}
                  color={isPending ? "#B4B2A9" : "white"}
                />
              </View>

              {/* connector line */}
              {index < STEPS.length - 1 && (
                <View className={`w-0.5 flex-1 my-1 min-h-8 ${
                  isDone ? "bg-blue-main" : "bg-gray-100"
                }`} />
              )}
            </View>

            {/* right: text */}
            <View className="flex-1 pb-6">
              <View className="flex-row items-center gap-2 mb-1">
                <Text className={`font-bold text-sm ${
                  isPending ? "text-gray-300" : "text-gray-800"
                }`}>
                  {step.label}
                </Text>
                {isActive && (
                  <View className="px-2 py-0.5 rounded-full bg-blue-light">
                    <Text className="text-xs font-bold text-blue-main">กำลังดำเนินการ</Text>
                  </View>
                )}
              </View>
              <Text className={`text-xs ${isPending ? "text-gray-300" : "text-gray-400"}`}>
                {step.description}
              </Text>
            </View>

          </View>
        )
      })}
    </View>
  )
}