import { UserAddress } from "@/services/address";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, View, Text, Button } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface UserAddressProp {
  address: UserAddress;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isSelected?: boolean;
}

export default function AddressCard({
  address,
  onPress,
  onEdit,
  onDelete,
  isSelected,
}: UserAddressProp) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-1 flex-row justify-between bg-white p-4 rounded-2xl mb-3 ${
    isSelected
      ? "border-2 border-blue-main "
      : "border border-gray-100"
  }`}
    >
      <View className="justify-start flex-1">
        <View className="flex-row items-center">
          <MaterialCommunityIcons name="map-marker" size={18} color="#00ACC3" />
          <Text className="font-bold text-xl">{address.label}</Text>
        </View>
        <Text className="text-gray-500 text-s">
          {address.houseNo} {address.district} {address.subDistrict}{" "}
          {address.province} {address.postal_code} {address.receiver_name}
        </Text>
        <Text className="text-gray-500">{address.phone}</Text>
      </View>

      <View className="justify-between items-end">
        <Pressable onPress={onEdit}>
          <MaterialCommunityIcons name="pencil-outline" size={20} color="#9CA3AF" />
        </Pressable>
        <Pressable onPress={onDelete}>
           <MaterialCommunityIcons name="trash-can-outline" size={20} color="#F87171" />
        </Pressable>
      </View>
    </Pressable>
  );
}
