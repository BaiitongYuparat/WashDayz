import { View, Text, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { getMainServicesById, MainService } from "@/services/mainServices";
import { AddonType, getAddonByMainServiceId } from "@/services/addonService";
import AddonCard from "@/components/AddonCard";
import { CustomButton } from "@/components/ui/CustomButton";
import { getMachinesByIds, Machine } from "@/services/machineService";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ComponentProps } from "react";

function chunkArray<T>(arr: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size),
  );
}
type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

const MACHINE_TYPE_LABELS: Record<string, string> = {
  WASHER: "เครื่องซัก",
  DRYER: "เครื่องอบ",
};

const MACHINE_ICONS: Record<string, IconName> = {
  WASHER: "washing-machine",
  DRYER: "tumble-dryer",
};

const SERVICE_ICONS: Record<string, IconName> = {
  WASHER: "washing-machine",
  DRYER: "tumble-dryer",
};

export default function OrderScreen() {
  const router = useRouter();
  const { serviceId, branchId, machineIds, addonIds } = useLocalSearchParams();
  const [service, setService] = useState<MainService | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState<number>(0);
  const [addon, setAddon] = useState<AddonType[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<string[]>(() => {
    return (addonIds as string)?.split(",").filter(Boolean) ?? [];
  });
  const [machinePrice, setMachinePrice] = useState<number>(0);
  const [selectedMachines, setSelectedMachines] = useState<Machine[]>([]);

  useEffect(() => {
    const fetchServices = async () => {
      if (!serviceId) return;
      const s = await getMainServicesById(serviceId as string);
      setService(s);
      const addonData = await getAddonByMainServiceId(serviceId as string);
      setAddon(addonData);

      const ids = (machineIds as string)?.split(",").filter(Boolean);

      if (ids?.length) {
        const machineData = await getMachinesByIds(ids);
        setSelectedMachines(machineData);
        console.log(selectedMachines);
        const total = machineData.reduce((sum, m) => sum + m.price, 0);
        setMachinePrice(total);
      }
    };
    fetchServices();
  }, [serviceId]);

  useEffect(() => {
    if (!service) return;
    const selectedAddonPrice = addon
      .filter((a) => selectedAddons.includes(a.addon_service_id))
      .reduce((sum, a) => sum + a.price, 0);
    setPrice(machinePrice + selectedAddonPrice);
  }, [quantity, selectedAddons, service, addon, machinePrice]);

  const toggleAddon = (id: string) => {
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id],
    );
  };

  const renderGrid = (items: AddonType[]) =>
    chunkArray(items, 2).map((row, i) => (
      <View key={i} className="flex-row gap-3 mb-3">
        {row.map((item) => (
          <AddonCard
            key={item.addon_service_id}
            addon={item}
            isSelected={selectedAddons.includes(item.addon_service_id)}
            onPress={() => toggleAddon(item.addon_service_id)}
          />
        ))}
        {row.length === 1 && <View className="flex-1" />}
      </View>
    ));

  const addonList = addon.filter((a) => a.type === "ADDON");
  const extraList = addon.filter((a) => a.type === "EXTRA");

  return (
    <View className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Header Section */}
        <View className="items-center pt-6 pb-4 px-4 gap-3">
          {/* Icon with glow background */}
          <View
            className="w-20 h-20 rounded-3xl bg-blue-50 items-center justify-center shadow-sm"
            style={{
              shadowColor: "#00ACC3",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 12,
              elevation: 6,
            }}
          >
            <MaterialCommunityIcons
              name={
                SERVICE_ICONS[selectedMachines[0]?.type] ?? "washing-machine"
              }
              size={44}
              color="#00ACC3"
            />
          </View>

          <Text
            className="font-bold text-3xl text-blue-main tracking-tight"
            style={{ letterSpacing: -0.5 }}
          >
            {service?.name}
          </Text>
        </View>

        {/* Machine summary card */}
        <LinearGradient
          colors={["#E0F9FF", "#EEF8FC", "#F8FEFF"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          className="mx-4 rounded-3xl p-5 mb-4"
          style={{
            borderWidth: 1,
            borderColor: "rgba(0, 172, 195, 0.15)",
            elevation: 3,
          }}
        >
          <View className="w-10 h-1 rounded-full bg-blue-main mb-4 self-center opacity-60" />

          {selectedMachines.length > 0 ? (
            <View className="gap-3">
              <Text className="font-bold text-center text-xl">
                เครื่องที่เลือก
              </Text>
              {selectedMachines.map((m) => (
                <View
                  key={m.machine_id}
                  className="flex-row items-center gap-3"
                >
                  {/* icon */}
                  <View className="w-12 h-12 rounded-2xl bg-blue-main/10 items-center justify-center">
                    <MaterialCommunityIcons
                      name={MACHINE_ICONS[m.type] ?? "washing-machine"}
                      size={26}
                      color="#00ACC3"
                    />
                  </View>
                  {/* info */}
                  <View className="flex-1">
                    <Text className="font-bold text-gray-800 text-sm">
                      {MACHINE_TYPE_LABELS[m.type] ?? m.type}
                    </Text>
                    <Text className="text-gray-400 text-xs">
                      ความจุ {m.capacity} กก. · {m.duration_minutes} นาที
                    </Text>
                  </View>
                  {/* ราคา */}
                  <Text className="font-bold text-blue-main">{m.price} ฿</Text>
                </View>
              ))}
            </View>
          ) : (
            <View className="items-center gap-1">
              <Text className="font-bold text-xl text-gray-800">
                เครื่องที่เลือก
              </Text>
              <Text className="text-gray-400 text-sm">ไม่พบข้อมูลเครื่อง</Text>
            </View>
          )}
        </LinearGradient>

        {addonList.length > 0 && (
          <View className="px-4 pt-4">
            <Text className="font-bold text-xl mb-3">บริการเสริม</Text>
            {renderGrid(addonList)}
          </View>
        )}

        {extraList.length > 0 && (
          <View className="px-4 pt-2">
            <Text className="font-bold text-xl mb-3">เลือกเพิ่มเติม</Text>
            {renderGrid(extraList)}
          </View>
        )}
      </ScrollView>

      {/* ราคา + ปุ่ม */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <Text className="text-xl font-bold text-right mb-3">
          รวม: {price.toLocaleString()} ฿
        </Text>
        <CustomButton
          title="สั่งซื้อ"
          onPress={() =>
            router.push({
              pathname: "/screens/home/orderSummary",
              params: {
                serviceId,
                branchId,
                machineIds,
                addonIds: selectedAddons.join(","),
                totalPrice: price,
              },
            })
          }
          className="p-4 rounded-lg"
        />
      </View>
    </View>
  );
}
