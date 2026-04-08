import { useRouter, useLocalSearchParams } from "expo-router";
import MachineCard from "@/components/MachineCard";
import { CustomButton } from "@/components/ui/CustomButton";
import { View , FlatList ,Text} from "react-native";
import { useState } from "react";
import { getMachinesByMainService } from "@/services/machineService";
import { Machine } from "@/services/machineService";
import { useEffect } from "react";

export default function BranchSelectScreen() {
  const router = useRouter();
  const { serviceId } = useLocalSearchParams();
  const [machines, setMachines] = useState<Machine[]>([]);
  const [selected, setSelected] = useState<boolean>(true);

  const [selectedMachines, setSelectedMachines] = useState<string[]>([]);

  useEffect(() => {
  const fetchData = async () => {
    try {
      const data = await getMachinesByMainService(serviceId as string);
      console.log("machines data:", JSON.stringify(data, null, 2));
      setMachines(data);
    } catch (err) {
      console.error(err);
    }
  };

  fetchData();
}, []);

  // ฟังก์ชัน toggle เลือก/ไม่เลือกเครื่อง
  const toggleMachine = (type: string) => {
    setSelectedMachines((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const onPress = () => {
    router.push({
      pathname: "/screens/order",
      params: {
        serviceId: serviceId,
      },
    });
  };
  const isSelected = () => {
    setSelected(false);
  };

  return (
    <View>
      <View className="p-4">
        <FlatList
    data={machines}
    keyExtractor={(item) => item.machine_id}
    renderItem={({ item }) => (
      <MachineCard
        type={item.type}
        capacity={item.capacity}
        duration_minutes={item.duration_minutes}
        isSelected={selectedMachines.includes(item.machine_id)}
        onPress={() => toggleMachine(item.machine_id)}
      />
    )}
    ListEmptyComponent={<Text>Loading...</Text>}
  />
      </View>
      <CustomButton title="ถัดไป" onPress={onPress} />
    </View>
  );
}
