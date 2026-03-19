import { Ionicons } from "@expo/vector-icons";
import { View , Text } from "react-native";
import { useUser } from "@/provider/UserProvider";

export const UserHeader = () => {
    const {user} = useUser();
    return(
        <View className=" p-4 flex-row items-center bg-white shadow-md shadow-gray-300">
            <View className=" p-2 rounded-full border-2 border-blue-main">
                <Ionicons name="person" size={24} className="text-blue-main" />
            </View>
            <View className="flex-1 ml-4">
                <Text className="font-bold text-blue-main text-xl">{user?.name}</Text>
                <Text className="text-gray-300">{user?.phone}</Text>
            </View>
        </View>
    )
}