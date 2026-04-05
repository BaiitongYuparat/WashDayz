import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { getMainServicesById, MainService } from "@/services/mainServices";
import { QuantityButton } from "@/features/order/QuantityButton";
import { PriceShown } from "@/features/order/PriceShown";
import { AddonType, getAddonByMainServiceId } from "@/services/addonService";
import AddonCard from "@/components/AddonCard";

export default function OrderScreen() {
  const router = useRouter();
  const { serviceId } = useLocalSearchParams();
  const [service, setService] = useState<MainService | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState<number>(0);
  const [addon, setAddon] = useState<AddonType[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  useEffect(() => {
    const fetchServices = async () => {
      if (!serviceId) return;
      const service = await getMainServicesById(serviceId as string);
      setService(service);
      const addonData = await getAddonByMainServiceId(serviceId as string);
      setAddon(addonData);
      setSelectedAddons(addonData.map((a) => a.addon_service_id));
    };
    fetchServices();
    console.log("Service", service);
  }, [serviceId]);

  const toggleAddon = (id: string) => {
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id],
    );
  };

  return (
    <View className="flex-1 bg-white">
      {/* ขื่อ service กับ รูป */}
      <View className="items-center gap-4 m-3 ">
        <Text className="font-bold text-2xl text-blue-main">
          {service?.name}
        </Text>
        <Ionicons name="shirt" className="text-blue-main" size={54} />
      </View>

      <LinearGradient
        colors={["#86F0FF", "#C7ECF7", "#FFFFFF"]}
        className="bg-blue-light justify-between overflow-hidden p-4"
      >
        <View className="items-center gap-2 mb-2">
          <Text className="font-bold text-xl">เลือกจำนวนชิ้น</Text>
          <Text className="text-gray-500 px-4 text-center">
            {service?.description}
          </Text>
        </View>

      </LinearGradient>

      <View className="flex-1 mb-4 p-2">
        <Text className="font-bold text-xl mb-2">Addon Services</Text>
        <FlatList
          data={addon}
          keyExtractor={(item) => item.addon_service_id}
          horizontal={false} 
          numColumns={2}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <AddonCard
              addon={item}
              isSelected={selectedAddons.includes(item.addon_service_id)}
              onPress={() => toggleAddon(item.addon_service_id)}
            />
          )}
        />
      </View>
    </View>
  );
}
