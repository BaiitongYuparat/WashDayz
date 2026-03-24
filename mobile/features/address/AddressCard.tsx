import { UserAddress } from "@/services/address";
import { Ionicons } from "@expo/vector-icons";
import { Pressable , View , Text } from "react-native";


interface UserAddressProp {
    address: UserAddress;
    onPress: () => void;
}

export default function AddressCard({address , onPress}: UserAddressProp ) {
    return (
        <Pressable onPress={onPress} className="flex-1 bg-white p-4">
            <View className="justify-start flex-1">
                <View className="flex-row items-center">
                    <Ionicons name="pin" size={20} className="text-blue-main" />
                    <Text className="font-bold text-xl">{address.label}</Text>
                </View>
                <Text className="text-gray-500">{address.houseNo} {address.district} {address.subDistrict} {address.province} {address.postal_code} {address.receiver_name}</Text>
                <Text className="text-gray-500">{address.phone}</Text>
            </View>
        </Pressable>
    )
}