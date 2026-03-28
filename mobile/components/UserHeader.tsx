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
  console.log("UserHeader user:", user);
  console.log("User addresses:", user?.addresses);
  return (
    <Pressable onPress={() => router.push("/screens/AddressListScreen")}>
      <View className=" p-4 flex-row items-center bg-white shadow-md shadow-gray-300">
        <View className=" p-2 rounded-full border-2 border-blue-main">
          <Ionicons name="person" size={24} className="text-blue-main" />
        </View>
        <View className="flex-1 ml-4">
          <Text className="font-bold text-blue-main text-xl">{user?.name}</Text>
          {selectedAddress && (
            <View>
              <View className="flex-row">
                <Text className="text-gray-300">
                  {selectedAddress.houseNo} {selectedAddress.subDistrict}
                </Text>
                <Text className="text-gray-300">
                  {selectedAddress.district} {selectedAddress.province}{" "}
                  {selectedAddress.postal_code}
                </Text>
              </View>
               <Text className="text-gray-300">{selectedAddress.phone}</Text>
            </View>
          )}
        </View>
        <Ionicons name="chevron-forward-outline" size={24} className="ml-auto text-gray-400" />
      </View>
    </Pressable>
  );
};
