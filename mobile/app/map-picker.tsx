import { View } from "react-native";
import AddressMapPicker from "@/features/address/AddressMapPicker";

export default function MapPickerScreen() {
  return (
    <View style={{ flex: 1 }}>
      <AddressMapPicker />
    </View>
  );
}