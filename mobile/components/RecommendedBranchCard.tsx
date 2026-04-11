import { View, Text , Pressable} from "react-native"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { ComponentProps } from "react"

type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"]

type BranchScore = {
  branch_id: string
  branch_name: string
  travelMinutes: number
  waitMinutes: number
  totalExpectedMinutes: number
  machineAvailable: boolean
}

type RecommendResult = {
  recommendedBranchId: string
  recommendedBranchName: string
  totalExpectedMinutes: number
  waitMinutes: number
  travelMinutes: number
  machineAvailable: boolean
  reasoning: string
  allBranchesScored: BranchScore[]
}

type Props = {
  result: RecommendResult
  onSelect?: (branchId: string) => void
  selectedBranchId?: string
}

function StatBadge({ icon, label, value, isSelected }: {
  icon: IconName
  label: string
  value: string
  isSelected: boolean
}) {
  return (
    <View className={`flex-1 items-center gap-1 p-2 rounded-xl ${isSelected ? "bg-white/20" : "bg-gray-50"}`}>
      <MaterialCommunityIcons name={icon} size={18} color={isSelected ? "white" : "#00ACC3"} />
      <Text className={`text-xs font-bold ${isSelected ? "text-white" : "text-gray-800"}`}>{value}</Text>
      <Text className={`text-xs ${isSelected ? "text-white/70" : "text-gray-400"}`}>{label}</Text>
    </View>
  )
}

function BranchRow({ branch, isRecommended ,isSelected, onPress }: { branch: BranchScore; isRecommended: boolean;  isSelected: boolean
  onPress: () => void  }) {
  return (
    <Pressable onPress={onPress} className={`flex-row items-center p-3 rounded-2xl mb-2 ${
      isSelected? "bg-blue-main" : "bg-white border border-gray-100"
    }`}>
      {/* rank indicator */}
      <View className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
        isSelected ? "bg-white/20" : "bg-blue-light"
      }`}>
        {isSelected
          ? <MaterialCommunityIcons name="star" size={16} color="white" />
          : <MaterialCommunityIcons name="map-marker" size={16} color="#00ACC3" />
        }
      </View>

      {/* name + status */}
      <View className="flex-1">
        <Text className={`text-sm font-bold ${isSelected ? "text-white" : "text-gray-800"}`}>
          {branch.branch_name}
        </Text>
        <View className="flex-row items-center gap-1 mt-0.5">
          <View className={`w-2 h-2 rounded-full ${branch.machineAvailable ? "bg-green-400" : "bg-amber-400"}`} />
          <Text className={`text-xs ${isSelected ? "text-white/70" : "text-gray-400"}`}>
            {branch.machineAvailable ? "เครื่องว่าง" : `รอ ${branch.waitMinutes} นาที`}
          </Text>
        </View>
      </View>

      {/* total time */}
      <View className={`items-end`}>
        <Text className={`text-sm font-bold ${isSelected ? "text-white" : "text-blue-main"}`}>
          {branch.totalExpectedMinutes} นาที
        </Text>
        <Text className={`text-xs ${isSelected ? "text-white/60" : "text-gray-400"}`}>
          รวมเดินทาง
        </Text>
      </View>
    </Pressable>
  )
}

export default function RecommendedBranchCard({ result, onSelect, selectedBranchId }: Props) {
  return (
    <View className="gap-4">

      {/* recommended card */}
      <View className="bg-blue-main rounded-3xl p-4 gap-3">
        {/* header */}
        <View className="flex-row items-center gap-2">
          <View className="w-8 h-8 rounded-full bg-white/20 items-center justify-center">
            <MaterialCommunityIcons name="star" size={16} color="white" />
          </View>
          <Text className="text-white/70 text-sm">AI แนะนำ</Text>
        </View>

        <Text className="text-white text-xl font-bold">{result.recommendedBranchName}</Text>

        {/* stats */}
        <View className="flex-row gap-2">
          <StatBadge
            icon="clock-outline"
            label="รวม"
            value={`${result.totalExpectedMinutes} นาที`}
            isSelected
          />
          <StatBadge
            icon="car-outline"
            label="เดินทาง"
            value={`${result.travelMinutes} นาที`}
            isSelected
          />
          <StatBadge
            icon="account-clock-outline"
            label="รอคิว"
            value={result.machineAvailable ? "ไม่ต้องรอ" : `${result.waitMinutes} นาที`}
            isSelected
          />
        </View>

        {/* reasoning */}
        <View className="bg-white/10 rounded-2xl p-3">
          <Text className="text-white/80 text-xs leading-5">{result.reasoning}</Text>
        </View>

        {/* select button */}
        {onSelect && (
          <View
            className="bg-white rounded-2xl p-3 items-center"
            onTouchEnd={() => onSelect(result.recommendedBranchId)}
          >
            <Text className="text-blue-main font-bold">เลือกสาขานี้</Text>
          </View>
        )}
      </View>

      {/* all branches */}
      <View>
        <Text className="font-bold text-gray-800 mb-3">สาขาทั้งหมด</Text>
        {result.allBranchesScored
          .sort((a, b) => a.totalExpectedMinutes - b.totalExpectedMinutes)
          .map((branch) => (
                <BranchRow
                key={branch.branch_id}
                branch={branch}
                isRecommended={branch.branch_id === result.recommendedBranchId}
                isSelected={branch.branch_id === selectedBranchId}
                onPress={() => onSelect?.(branch.branch_id)}
                />
          ))}
      </View>

    </View>
  )
}