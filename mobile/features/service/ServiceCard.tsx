import { Pressable, Text, View,Image } from "react-native";
import { Service } from "@/types/service";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

type ServiceCardProps = {
  service: Service;
};
export const ServiceCard = ({ service }: ServiceCardProps) => {
  return (
    <Pressable className="flex-1 m-2 rounded-xl shadow-md shadow-blue-main overflow-hidden">
      <LinearGradient
        colors={["#90ECF9", "#00ACC3"]}
        className="p-4  rounded-xl items-center overflow-hidden"
      >
        <View className="p-2 items-center gap-3">
            <Ionicons name="shirt" size={52} className="text-white" />
            <Text className="text-white font-bold text-xl">{service.title}</Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
};
