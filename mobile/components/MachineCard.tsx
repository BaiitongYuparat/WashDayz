import { View, Text, Pressable } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { ComponentProps } from "react";

interface MachineCardProps {
  img?: React.ReactNode;
  type: string;
  duration_minutes: number;
  capacity: number;
  onPress: () => void;
  isSelected?: boolean;
}
type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"]

const SERVICE_ICONS: Record<string, IconName> = {
  "WASHER": "washing-machine",
  "DRYER": "tumble-dryer",
}

export default function MachineCard({ img, type, duration_minutes, isSelected, onPress , capacity }: MachineCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`w-full rounded-3xl p-4 bg-white ${
        isSelected
          ? "border-2 border-blue-main"
          : "border border-gray-100"
      }`}
    >
      <View className="flex-row items-center gap-4">

        {/* Icon */}
        <View className={`w-16 h-16 rounded-2xl items-center justify-center ${
          isSelected ? "bg-blue-light border border-blue-main/20" : "bg-gray-200 border border-gray-100"
        }`}>
          <MaterialCommunityIcons
                        name={
                          (SERVICE_ICONS[type] ?? "washing-machine") as IconName
                        }
                        size={66}
                        color="white"
                      />
        </View>

        {/* Text */}
        <View className="flex-1 gap-1.5">
          <Text className={`text-base font-bold tracking-tight ${
            isSelected ? "text-blue-main" : "text-gray-800"
          }`}>
            {type}
          </Text>

          {/* Time badge */}
          <View className={`self-start flex-row items-center gap-1 px-2 py-0.5 rounded-full ${
            isSelected ? "bg-blue-main/10" : "bg-gray-100"
          }`}>
            <Text className="text-xs">🕐</Text>
            <Text className={`text-xs font-medium ${
              isSelected ? "text-blue-main" : "text-gray-400"
            }`}>
              {duration_minutes}
            </Text>
            
          </View>
        </View>

        {/* capacity */}
            <View className={`flex-row items-center gap-1 px-2 py-0.5 rounded-full ${
              isSelected ? "bg-blue-main/10" : "bg-gray-100"
            }`}>
              <Text className="text-xs">👕</Text>
              <Text className={`text-xs font-medium ${
                isSelected ? "text-blue-main" : "text-gray-400"
              }`}>
                {capacity} กก.
              </Text>
            </View>

        {/* Checkmark */}
        <View className={`w-6 h-6 rounded-full items-center justify-center ${
          isSelected ? "bg-blue-main" : "bg-gray-100"
        }`}>
          {isSelected && (
            <Text className="text-white text-xs font-bold">✓</Text>
          )}
        </View>

      </View>
    </Pressable>
  );
}