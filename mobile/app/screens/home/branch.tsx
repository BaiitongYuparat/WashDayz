import { useRouter, useLocalSearchParams } from "expo-router";
import MachineCard from "@/components/MachineCard";
import { CustomButton } from "@/components/ui/CustomButton";
import { View } from "react-native";
import { useState } from "react";

export default function BranchSelectScreen() {
  const router = useRouter();
  const { serviceId } = useLocalSearchParams();
  const [selected, setSelected] = useState<boolean>(true);

  const [selectedMachines, setSelectedMachines] = useState<string[]>([]);

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
        <MachineCard
          type="ซัก"
          time="23.44"
          isSelected={selectedMachines.includes("ซัก")}
          onPress={() => toggleMachine("ซัก")}
        />
      </View>
      <CustomButton title="ถัดไป" onPress={onPress} />
    </View>
  );
}
