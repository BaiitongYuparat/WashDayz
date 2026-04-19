import {
  View,
  Text,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { getAllBranches, Branch } from "@/services/branchService";
import { LinearGradient } from "expo-linear-gradient";

const getMachineCountByType = (branch: Branch, type: string) =>
  branch.branchMachines?.filter((m) => m.machine.type === type).length ?? 0;

const getMachineAvailable = (branch: Branch) =>
  branch.branchMachines?.filter((m) => m.status === "AVAILABLE").length ?? 0;

const getQueueCountByType = (branch: Branch, type: string) =>
  branch.queue?.filter((q: any) => q.machine_type === type).length ?? 0;

export default function BranchesScreen() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const data = await getAllBranches();
        setBranches(data);
      } catch (err) {
        console.log("fetchBranches error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBranches();
  }, []);

  const filtered = branches.filter((b) =>
    b.branch_name.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#00ACC3" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <LinearGradient
        colors={["#90ECF9", "#90ECF9", "#E0F7FA", "#E0F7FA"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        className="px-4 pt-12 pb-6"
      >
        <Text className="text-blue-main font-bold text-2xl mb-1">
          สาขาทั้งหมด
        </Text>
        <Text className="text-blue-main/80 text-xs mb-4">
          {branches.length} สาขาทั่วกรุงเทพ
        </Text>
        <View
          className="flex-row items-center bg-white rounded-2xl px-4 py-3 gap-2"
          style={{
            elevation: 3,
            shadowColor: "#00ACC3",
            shadowOpacity: 0.2,
            shadowRadius: 8,
          }}
        >
          <MaterialCommunityIcons name="magnify" size={20} color="#9CA3AF" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="ค้นหาสาขา..."
            placeholderTextColor="#9CA3AF"
            style={{ flex: 1, color: "#1F2937" }}
          />
          {search.length > 0 && (
            <MaterialCommunityIcons
              name="close-circle"
              size={18}
              color="#9CA3AF"
              onPress={() => setSearch("")}
            />
          )}
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {filtered.length === 0 ? (
          <View className="items-center mt-20 gap-3">
            <MaterialCommunityIcons
              name="store-off-outline"
              size={48}
              color="#9CA3AF"
            />
            <Text className="text-gray-400">ไม่พบสาขา</Text>
          </View>
        ) : (
          filtered.map((branch) => {
            const machineAvailable = getMachineAvailable(branch);
            const washerCount = getMachineCountByType(branch, "WASHER");
            const dryerCount = getMachineCountByType(branch, "DRYER");
            const washerQueue = getQueueCountByType(branch, "WASHER");
            const dryerQueue = getQueueCountByType(branch, "DRYER");

            return (
              <View
                key={branch.branch_id}
                className="bg-white rounded-3xl mb-4 overflow-hidden border border-gray-100 flex-row"
                style={{ elevation: 2 }}
              >
                {/* ไอคอนสาขา ฝั่งซ้าย */}
                <LinearGradient
                  colors={["#00ACC3", "#90ECF9"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  className="w-24 items-center justify-center gap-1"
                >
                  <MaterialCommunityIcons
                    name="map-marker-radius"
                    size={36}
                    color="white"
                  />
                  <Text
                    className="text-white text-xs font-bold text-center px-2"
                    numberOfLines={2}
                  >
                    {branch.branch_name}
                  </Text>
                </LinearGradient>

                {/* เนื้อหา ฝั่งขวา */}
                <View className="flex-1 p-4 gap-3">
                  {/* ชื่อ , status */}
                  <View className="flex-row items-center justify-between">
                    <Text
                      className="font-bold text-gray-800 text-base flex-1"
                      numberOfLines={1}
                    >
                      {branch.branch_name}
                    </Text>
                    <View
                      className={`px-2 py-1 rounded-full ml-2 ${
                        machineAvailable > 0 ? "bg-green-100" : "bg-yellow-100"
                      }`}
                    >
                      <Text
                        className={`text-xs font-bold ${
                          machineAvailable > 0
                            ? "text-green-700"
                            : "text-yellow-700"
                        }`}
                      >
                        {machineAvailable > 0 ? "ว่าง" : "ไม่ว่าง"}
                      </Text>
                    </View>
                  </View>

                  {/* เครื่องซัก */}
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-1">
                      <MaterialCommunityIcons
                        name="washing-machine"
                        size={16}
                        color="#00ACC3"
                      />
                      <Text className="text-xs text-gray-500">
                        ซัก {washerCount} เครื่อง
                      </Text>
                    </View>
                    <Text className="text-xs text-gray-400">
                      คิว {washerQueue}
                    </Text>
                  </View>

                  {/* เครื่องอบ */}
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-1">
                      <MaterialCommunityIcons
                        name="tumble-dryer"
                        size={16}
                        color="#F59E0B"
                      />
                      <Text className="text-xs text-gray-500">
                        อบ {dryerCount} เครื่อง
                      </Text>
                    </View>
                    <Text className="text-xs text-gray-400">
                      คิว {dryerQueue}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
