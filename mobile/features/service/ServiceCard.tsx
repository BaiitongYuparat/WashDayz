import { Pressable, Text, View, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { MainService } from "@/services/mainServices";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ComponentProps } from "react";

type ServiceCardProps = {
  service: MainService;
  onPress: () => void;
};

type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

const SERVICE_ICONS: Record<string, IconName> = {
  ซัก: "washing-machine",
  ซักผ้าพิเศษ: "tumble-dryer",
  "เครื่องนอน / ผ้านวม": "bed",
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

        <View className="items-center">
          <View className="w-20 h-20 rounded-2xl bg-white/20 items-center justify-center overflow-hidden">
            <MaterialCommunityIcons
              name={
                (SERVICE_ICONS[service.name] ?? "washing-machine") as IconName
              }
              size={60}
              color="white"
            />
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
