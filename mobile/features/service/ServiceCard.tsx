import { Pressable, Text, View,Image } from "react-native";
import { Service } from "@/types/service";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

type ServiceCardProps = {
  service: Service;
  onPress: () => void;
};
export const ServiceCard = ({ service , onPress }: ServiceCardProps) => {
  return (
    <Pressable className="w-full aspect-square rounded-xl shadow-md shadow-blue-main overflow-hidden" onPress={onPress}>
      <LinearGradient
        colors={["#90ECF9", "#00ACC3"]}
        className="p-4  rounded-xl items-center overflow-hidden"
      >
        <View className="p-2 items-center gap-3">
            <Ionicons name="shirt" size={52} className="text-white" />
            <Text className="text-white font-bold text-xl" numberOfLines={1} >{service.name}</Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
};
