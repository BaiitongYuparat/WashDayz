import { View, Text, Pressable } from "react-native"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { ComponentProps } from "react"

type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"]

type PaymentMethod = {
  id: string
  label: string
  description: string
  icon: IconName
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "CASH",
    label: "เงินสด",
    description: "ชำระที่เครื่องหยอดเหรียญ",
    icon: "cash",
  },
  {
    id: "QR",
    label: "QR Code",
    description: "สแกนจ่ายผ่าน mobile banking",
    icon: "qrcode-scan",
  },
]

type Props = {
  selected: string
  onSelect: (id: string) => void
}

export default function PaymentMethodSelector({ selected, onSelect }: Props) {
  return (
    <View className="gap-3">
      {PAYMENT_METHODS.map((method) => {
        const isSelected = selected === method.id
        return (
          <Pressable
            key={method.id}
            onPress={() => onSelect(method.id)}
            className={`flex-row items-center gap-4 p-4 rounded-2xl bg-white ${
              isSelected ? "border-2 border-blue-main" : "border border-gray-100"
            }`}
          >
            <View className={`w-12 h-12 rounded-xl items-center justify-center ${
              isSelected ? "bg-blue-main" : "bg-gray-50"
            }`}>
              <MaterialCommunityIcons
                name={method.icon}
                size={24}
                color={isSelected ? "white" : "#888"}
              />
            </View>

            <View className="flex-1">
              <Text className={`font-bold text-sm ${
                isSelected ? "text-blue-main" : "text-gray-800"
              }`}>
                {method.label}
              </Text>
              <Text className="text-xs text-gray-400">{method.description}</Text>
            </View>

            <View className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
              isSelected ? "border-blue-main  bg-blue-main" : "border-gray-300"
            }`}>
              {isSelected && (
                 <MaterialCommunityIcons name="check" size={12} color="white" />
              )}
            </View>
          </Pressable>
        )
      })}
    </View>
  )
}