import { AddonType } from "@/services/addonService";
import { Pressable, Text, View, Image } from "react-native";

interface AddonCardProps {
  addon: AddonType;
  onPress: () => void;
  isSelected?: boolean;
  img?: string;
}

export default function AddonCard({
  addon,
  onPress,
  isSelected,
}: AddonCardProps) {
  const isExtra = addon.type === "EXTRA";

  if (isExtra) {
    return (
      <Pressable
        onPress={onPress}
        className={`w-[48%] self-stretch flex-row items-center gap-3 p-2 rounded-2xl bg-purple-50 ${
          isSelected
            ? "border-2 border-purple-400 bg-purple-200"
            : "border-2 border-purple-50"
        }`}
      >
        {/* ไอคอน */}
        <View className={`w-12 h-12 rounded-2xl overflow-hidden items-center justify-center ${
          isSelected ? "bg-purple-100" : "bg-gray-100"
        }`}>
          {addon.image_url ? (
            <Image
              source={{ uri: addon.image_url }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <Text className="text-2xl">✨</Text>
          )}
        </View>

        {/* เนื้อหา */}
        <View className="flex-1 gap-0.5">
          <Text className={`text-sm font-bold ${
            isSelected ? "text-purple-700" : "text-gray-800"
          }`}>
            {addon.name}
          </Text>
          <Text className="text-xs text-gray-400" numberOfLines={2}>
            {addon.description}
          </Text>
          <Text className={`text-xs font-bold mt-1 ${
            isSelected ? "text-purple-500" : "text-green-600"
          }`}>
            +{addon.price} ฿
          </Text>
        </View>

        {/* checkmark */}
        <View className={`w-6 h-6 rounded-full items-center justify-center ${
          isSelected ? "bg-purple-400" : "bg-white"
        }`}>
          {isSelected && <Text className="text-white text-xs">✓</Text>}
        </View>
      </Pressable>
    );
  }
  return (
    <Pressable
      onPress={onPress}
      className={`flex-1 rounded-2xl overflow-hidden ${
        isSelected ? "border-2 border-blue-main" : "border border-gray-100"
      }`}
    >
      {/* รูป */}
      <View
        className={`w-full h-28 items-center justify-center ${
          isSelected ? "bg-blue-light" : "bg-gray-50"
        }`}
      >
        {addon.image_url ? (
          <Image
            source={{ uri: addon.image_url }}
            className="w-full h-full"
            resizeMode="contain"
          />
        ) : (
          <View className="w-14 h-14 rounded-full bg-gray-200 items-center justify-center">
            <Text className="text-2xl">🧺</Text>
          </View>
        )}
      </View>

      {/* เนื้อหา */}
      <View
        className={`p-3 gap-1 min-h-[100px] justify-between ${
          isSelected ? "bg-blue-light/30" : "bg-white"
        }`}
      >
        <View className="flex-row items-center justify-between">
          <Text
            className={`text-sm font-bold ${
              isSelected ? "text-blue-main" : "text-gray-800"
            }`}
          >
            {addon.name}
          </Text>

          {isSelected && (
            <View className="w-5 h-5 rounded-full bg-blue-main items-center justify-center">
              <Text className="text-white text-xs">✓</Text>
            </View>
          )}
        </View>

        <Text className="text-xs text-gray-400" numberOfLines={2}>
          {addon.description}
        </Text>

        <View className="flex-row items-center gap-1 mt-1">
          <Text className="text-xs text-gray-400">เพิ่ม</Text>
          <Text className="text-sm font-bold text-green-600">
            {addon.price} ฿
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
