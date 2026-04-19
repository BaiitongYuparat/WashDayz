import { useRouter, useLocalSearchParams } from "expo-router";
import MachineCard from "@/components/MachineCard";
import RecommendedBranchCard from "@/components/RecommendedBranchCard";
import { CustomButton } from "@/components/ui/CustomButton";
import {
  View,
  ScrollView,
  Text,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getMachinesByMainService, Machine } from "@/services/machineService";
import {
  Branch,
  recommendBranch,
  RecommendResult,
} from "@/services/branchService";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useRef } from "react";
import { UserHeader } from "@/components/UserHeader";

const MACHINE_TYPE_ORDER: Record<string, number> = {
  WASHER: 0,
  DRYER: 1,
};

export default function BranchSelectScreen() {
  const router = useRouter();
  const { serviceId, machineIds, editMode, addonIds, totalPrice } =
    useLocalSearchParams();

  const selectedLocation = useSelector(
    (state: RootState) => state.address.selectedLocation,
  );

  const [machines, setMachines] = useState<Machine[]>([]);
  const [selectedMachines, setSelectedMachines] = useState<string[]>([]);
  const [recommendResult, setRecommendResult] =
    useState<RecommendResult | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [allBranches, setAllBranches] = useState<Branch[]>([]);
  const [showAllBranches, setShowAllBranches] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getMachinesByMainService(serviceId as string);
        const sorted = [...data].sort(
          (a, b) =>
            (MACHINE_TYPE_ORDER[a.type] ?? 99) -
            (MACHINE_TYPE_ORDER[b.type] ?? 99),
        );
        setMachines(sorted);

        if (machineIds) {
          const ids =
            typeof machineIds === "string"
              ? machineIds.split(",").filter(Boolean)
              : Array.isArray(machineIds)
                ? machineIds
                : [];

          if (ids.length > 0) {
            setSelectedMachines(ids);
            await fetchRecommend(ids, data); // ส่ง data ตรงๆ ไม่ใช้ state
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const fetchRecommend = async (
    selected: string[],
    machinesData: Machine[],
  ) => {
    if (selected.length === 0) {
      setRecommendResult(null);
      return;
    }
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const selectedMachinesData = machinesData.filter((m) =>
        selected.includes(m.machine_id),
      );
      const result = await recommendBranch(
        {
          userLat: selectedLocation?.latitude ?? 13.7563,
          userLng: selectedLocation?.longitude ?? 100.5018,
          machineTypes: selectedMachinesData.map((m) => ({
            type: m.type,
            capacity: m.capacity,
          })),
          mainServiceId: serviceId as string,
        },
        token,
      );
      setRecommendResult(result);
      setSelectedBranchId(result.recommendedBranchId);
    } catch (err) {
      console.log("fetchRecommend error:", err); // เพิ่ม
      console.log("fetchRecommend error JSON:", JSON.stringify(err));
      Alert.alert("Error", "ไม่สามารถโหลดข้อมูลสาขาได้");
    } finally {
      setLoading(false);
    }
  };

  const toggleMachine = (id: string) => {
    setSelectedMachines((prev) => {
      const next = prev.includes(id)
        ? prev.filter((m) => m !== id)
        : [...prev, id];

      // ยกเลิก timer เก่า แล้วตั้งใหม่
      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (next.length === 0) {
        setRecommendResult(null);
        return next;
      }

      debounceRef.current = setTimeout(() => {
        fetchRecommend(next, machines);
      }, 1000); // รอ 1 วินาทีหลังจากเลือกครั้งสุดท้าย

      return next;
    });
  };

  // branch.tsx
  const handleConfirm = () => {
    if (!selectedBranchId) return;

    const isEditMode = editMode === "true";

    if (isEditMode) {
      router.replace({
        pathname: "/screens/home/orderSummary",
        params: {
          serviceId,
          branchId: selectedBranchId,
          machineIds: selectedMachines.join(","),
          addonIds: addonIds ?? "",
          totalPrice: totalPrice ?? "",
        },
      });
    } else {
      router.push({
        pathname: "/screens/order",
        params: {
          serviceId,
          branchId: selectedBranchId,
          machineIds: selectedMachines.join(","),
        },
      });
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <UserHeader />

        <Text className="font-bold text-lg text-gray-800 mb-3">
          เลือกประเภทเครื่อง
        </Text>
        <View className="gap-3">
          {machines.length === 0 ? (
            <Text className="text-center text-gray-400 mt-4">
              ไม่พบข้อมูลเครื่อง
            </Text>
          ) : (
            machines.map((item) => (
              <MachineCard
                key={item.machine_id}
                type={item.type}
                capacity={item.capacity}
                duration_minutes={item.duration_minutes}
                isSelected={selectedMachines.includes(item.machine_id)}
                onPress={() => toggleMachine(item.machine_id)}
              />
            ))
          )}
        </View>

        {loading && (
          <View className="items-center gap-2 mt-6">
            <ActivityIndicator size="large" color="#00ACC3" />
            <Text className="text-gray-400 text-sm">
              AI กำลังวิเคราะห์สาขาที่ดีที่สุด...
            </Text>
          </View>
        )}

        {!loading && recommendResult && (
          <View className="mt-6">
            <Text className="font-bold text-lg text-gray-800 mb-3">
              สาขาแนะนำ
            </Text>
            <RecommendedBranchCard
              result={recommendResult}
              onSelect={(id) => setSelectedBranchId(id)}
              selectedBranchId={selectedBranchId ?? undefined}
            />
          </View>
        )}
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100">
        <CustomButton
          title="ยืนยันสาขา"
          disabled={!selectedBranchId || loading}
          onPress={handleConfirm}
        />
      </View>
    </View>
  );
}
