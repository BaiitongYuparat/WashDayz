import { View, Text } from "react-native"

type Props = {
  label: string
  value: string
  highlight?: boolean
}

export default function SummaryRow({ label, value, highlight }: Props) {
  return (
    <View className="flex-row justify-between items-center py-2">
      <Text className="text-sm text-gray-400">{label}</Text>
      <Text className={`text-sm font-bold ${highlight ? "text-orange-400 text-base" : "text-gray-800"}`}>
        {value}
      </Text>
    </View>
  )
}