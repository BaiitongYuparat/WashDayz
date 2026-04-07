import { Pressable, Text, View, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { MainService } from "@/services/mainServices";

type ServiceCardProps = {
  service: MainService;
  onPress: () => void;
};

export const ServiceCard = ({ service, onPress }: ServiceCardProps) => {
  return (
    <Pressable
      className="w-full aspect-square rounded-3xl shadow-md shadow-blue-main overflow-hidden"
      onPress={onPress}
    >
      <LinearGradient
        colors={["#86F0FF", "#00ACC3"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="flex-1 rounded-3xl items-center justify-center overflow-hidden p-4"
      >
        {/* circle decorations */}
        <View className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
        <View className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/10" />

        <View className="items-center gap-3">
          <View className="w-16 h-16 rounded-2xl bg-white/20 items-center justify-center overflow-hidden">
            {service.img ? (
              <Image
                source={{ uri: service.img as string }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <Ionicons name="shirt" size={38} color="white" />
            )}
          </View>
          
          <Text
            className="text-white font-bold text-lg text-center"
            numberOfLines={2}
          >
            {service.name}
          </Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
};
