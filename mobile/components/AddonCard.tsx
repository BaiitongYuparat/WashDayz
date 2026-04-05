import { AddonType } from "@/services/addonService";
import { Pressable, Text, View } from "react-native";

interface AddonCardProps {
    addon: AddonType
    onPress: () => void;
    isSelected?: boolean; 
}

export default function AddonCard({addon, onPress, isSelected}: AddonCardProps) {
    return(
        <Pressable 
        onPress={onPress}
        className="p-4 rounded-2xl justify-center items-center"
        style={{
        borderWidth: isSelected ? 2 : 0,
        borderColor: isSelected ? "#00ACC3" : "transparent",
        backgroundColor: isSelected ? "#E0F7FA" : "#F0F0F0",
      }}
        >
            <View className="justify-center items-center">
                <Text className="font-bold">{addon.name}</Text>
                <Text className="text-gray-400">{addon.description}</Text>
                <Text className="text-green-600">+ {addon.price} ฿</Text>
            </View>
        </Pressable>
    )
}