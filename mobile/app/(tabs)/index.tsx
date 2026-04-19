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

      {/* Header */}
      <LinearGradient
        colors={["#00ACC3", "#90ECF9", "#E0F7FA", "#E0F7FA", "#FFFF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        className="p-4"
      >
        <UserHeader />
        <View className="p-2 mt-3">
          <ActiveOrderBanner activeOrders={activeOrders} />
          <OrderStats orders={allOrders} />
        </View>
      </LinearGradient>

     
      {/* ServiceCard */}
      <View className="p-2 rounded-xl">
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

      {/* advice */}
      <View
        className="bg-white p-4 mt-3 border border-gray-100"
        style={{ elevation: 2 }}
      >
        <Text className="font-bold text-gray-800 text-base mb-4">
          เริ่มใช้งานใน 5 ขั้นตอน
        </Text>
        <View className="flex-row justify-between">
          {[
            { icon: "format-list-bulleted", label: "เลือก\nบริการ" },
            { icon: "store", label: "เลือก\nสาขา" },
            { icon: "cash", label: "ชำระ\nเงิน" },
            { icon: "washing-machine", label: "รอ\nซัก" },
            { icon: "hanger", label: "รับ\nผ้า" },
          ].map((step, i) => (
            <View key={i} className="items-center gap-2 flex-1">
              <View className="bg-blue-50 p-3 rounded-full">
                <MaterialCommunityIcons
                  name={step.icon as any}
                  size={22}
                  color="#00ACC3"
                />
              </View>
              <Text className="text-gray-600 text-xs text-center">
                {step.label}
              </Text>
              {i < 4 && (
                <View className="absolute right-0 top-4 w-2 h-0.5 bg-gray-200" />
              )}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
