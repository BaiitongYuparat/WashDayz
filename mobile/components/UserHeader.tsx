import { Ionicons } from "@expo/vector-icons";
import { View, Text, Pressable } from "react-native";
import { useUser } from "@/provider/UserProvider";
import { useSelector } from "react-redux";
import { RootState } from "@/app/redux/store";
import { useRouter } from "expo-router";

export const UserHeader = () => {
  const router = useRouter();
  const { user } = useUser();
  const selectedAddress = useSelector(
    (state: RootState) => state.address.selectedAddress,
  );

  return (
    <Pressable onPress={() => router.push("/screens/AddressListScreen")}>
      <View className="rounded-full px-4 py-3 flex-row items-center bg-white border-b border-gray-100">

        {/* Avatar */}
        <View className="w-11 h-11 rounded-full bg-blue-light items-center justify-center border-2 border-blue-main">
          <Ionicons name="person" size={20} color="#00ACC3" />
        </View>

        {/* Info */}
        <View className="flex-1 ml-3 gap-0.5">
          <Text className="font-bold text-blue-main text-base">{user?.name}</Text>

          {selectedAddress ? (
            <View className="gap-0.5">
              <View className="flex-row items-center gap-1">
                <Ionicons name="location-outline" size={11} color="#9CA3AF" />
                <Text className="text-gray-400 text-xs flex-1" numberOfLines={1}>
                  {selectedAddress.houseNo} {selectedAddress.subDistrict} {selectedAddress.district} {selectedAddress.province} {selectedAddress.postal_code}
                </Text>
              </View>
              <View className="flex-row items-center gap-1">
                <Ionicons name="call-outline" size={11} color="#9CA3AF" />
                <Text className="text-gray-400 text-xs">
                  {selectedAddress.receiver_name} · {selectedAddress.phone}
                </Text>
              </View>
            </View>
          ) : (
            <Text className="text-gray-400 text-xs">เพิ่มที่อยู่จัดส่ง</Text>
          )}
        </View>

        {/* Chevron */}
        <Ionicons name="chevron-forward-outline" size={18} color="#D1D5DB" />

      </View>
    </Pressable>
  );
};