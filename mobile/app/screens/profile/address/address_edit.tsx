import { View, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AddressForm from "@/features/address/AddressForm";
import { deleteAddress, updateAddress, UserAddress } from "@/services/address";
import { useEffect, useState } from "react";
import { CustomButton } from "@/components/ui/CustomButton";

export default function AddressEdit() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [address, setAddress] = useState<any>(null);

  // โหลดข้อมูลจาก params
  useEffect(() => {
    if (params.address) {
      try {
        const parsed = JSON.parse(params.address as string);
        setAddress(parsed);
      } catch (err) {
        console.log("parse error", err);
      }
    }
  }, []);

  const handleUpdateAddress = async (data: UserAddress) => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      Alert.alert("No User Found");
      return;
    }
    await updateAddress(address.address_id, data, token);

    Alert.alert("สำเร็จ", "แก้ไขที่อยู่เรียบร้อย");
    router.back();
  } catch (error: any) {
    console.log("update error", error.response?.data || error.message);
    Alert.alert("Error", "ไม่สามารถแก้ไขที่อยู่ได้");
  }
};

  if (!address) return null;

  return (
    
    <View className="flex-1 bg-white p-4">
      <AddressForm
        initialData={address}
        onSubmit={handleUpdateAddress}
      />
 
    </View>
  );
}