import { router, useFocusEffect } from "expo-router";
import {
  Button,
  Pressable,
  ScrollView,
  View,
  Text,
  FlatList,
} from "react-native";
import { ServiceCard } from "@/features/service/ServiceCard";
import { UserHeader } from "@/components/UserHeader";
import { useCallback, useEffect, useState } from "react";
import { getMainServices } from "@/services/mainServices";
import { MainService } from "@/services/mainServices";
import { getOrdersByUser, OrderDetail } from "@/services/orderService";
import { useUser } from "@/provider/UserProvider";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ActiveOrderBanner } from "@/components/ActiveOrderBanner";
import { LinearGradient } from "expo-linear-gradient";
import { OrderStats } from "@/components/OrderStats";

export default function Index() {
  const [services, setServices] = useState<MainService[]>([]);
  const { user } = useUser();
  const [activeOrders, setActiveOrders] = useState<OrderDetail[]>([]);
  const [allOrders, setAllOrders] = useState<OrderDetail[]>([]);

  useFocusEffect(
    useCallback(() => {
      const fetchMainService = async () => {
        if (!user?.user_id) return;

        try {
          const services = await getMainServices();
          const orders = await getOrdersByUser(user.user_id);

          const active = orders.filter((o) =>
            ["WAITING", "WASHING"].includes(o.status),
          );

          setActiveOrders(active);
          setServices(services);
          setAllOrders(orders);
        } catch (error) {
          console.log("Error while fetch MainService data:", error);
        }
      };

      fetchMainService();
    }, [user?.user_id]),
  );

  const onPress = (services: MainService) => {
    router.push({
      pathname: "/screens/home/branch",
      params: {
        serviceId: services.main_service_id,
      },
    });
  };

  return (
    <View className="flex-1 justify-between bg-white">
      <LinearGradient
        colors={["#00ACC3", "#90ECF9","#E0F7FA"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        className="p-4"
      >
       <UserHeader />
      </LinearGradient>

      <LinearGradient
        colors={["#E0F7FA", "#E0F7FA", "#FFFF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        className="p-4"
      >
         <ActiveOrderBanner activeOrders={activeOrders} />
        <OrderStats orders={allOrders} />
      </LinearGradient>

      

      <View className="flex-1 p-2 rounded-xl">
        <Text className="font-bold text-xl px-4">เลือกบริการ</Text>
        <FlatList
          data={services}
          numColumns={2}
          contentContainerStyle={{ padding: 3 }}
          columnWrapperStyle={{ justifyContent: "center" }}
          keyExtractor={(item) => item.main_service_id}
          renderItem={({ item }) => (
            <View className="w-1/2 p-2">
              <ServiceCard service={item} onPress={() => onPress(item)} />
            </View>
          )}
        />
      </View>
    </View>
  );
}
