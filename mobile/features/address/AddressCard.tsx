import { UserAddress } from "@/services/address";
import { Ionicons } from "@expo/vector-icons";
import { Pressable , View , Text, Button } from "react-native";


interface UserAddressProp {
    address: UserAddress;
    onPress: () => void;
    onEdit: () => void;
    onDelete:() => void;
    isSelected?: boolean;
}

export default function AddressCard({address , onPress, onEdit,onDelete ,isSelected}: UserAddressProp ) {
    return (
        <Pressable onPress={onPress} className={`flex-1 flex-row bg-white p-4 `} 
           style={{
    borderWidth: isSelected ? 2 : 0,               // 0 ถ้าไม่เลือก
    borderColor: isSelected ? "#00ACC3" : "transparent", // สีเขียวอ่อน
  }}>
            <View className="justify-start flex-1">
                <View className="flex-row items-center">
                    <Ionicons name="pin" size={20} className="text-blue-main" />
                    <Text className="font-bold text-xl">{address.label}</Text>
                </View>
                <Text className="text-gray-500">{address.houseNo} {address.district} {address.subDistrict} {address.province} {address.postal_code} {address.receiver_name}</Text>
                <Text className="text-gray-500">{address.phone}</Text>
            </View>
            <View className="justify-between">
                <Pressable onPress={onEdit} >
                    <Text className="text-sm text-gray-400">Edit</Text>
                </Pressable>
                <Pressable onPress={onDelete} >
                    <Text className="text-sm text-red-400">delete</Text>
                </Pressable>
            </View>
        </Pressable>
    )
}