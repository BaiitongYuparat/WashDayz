import { deleteAddress, getAddress, UserAddresses } from "@/services/address";
import { useEffect, useState, useCallback } from "react";
import { View, FlatList ,Alert} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AddressCard from "@/features/address/AddressCard";
import { CustomButton } from "@/components/ui/CustomButton";
import { useRouter, useFocusEffect } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedAddress } from "../redux/addressSlice";
import { RootState } from "../redux/store";

export default function AddressListScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const selectedAddress = useSelector(
  (state: RootState) => state.address.selectedAddress
);

  const [addresses, setAddresses] = useState<UserAddresses[]>([]);
  const [loadingDelete, setLoadingDelete] = useState<string | null>(null);
  

  const fetchAddress = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        console.log("No token found");
        return;
      }
      const address = await getAddress(token);
      setAddresses(address);
    } catch (error) {
      console.log("fetch user address error:", error);
    }
  };
  useEffect(() => {
    fetchAddress();
    console.log("Address", addresses);
  }, []);
  useFocusEffect(
    useCallback(() => {
      fetchAddress();
    }, []),
  );
  const handleEdit = (item: any) => {
    router.push({
      pathname: "/screens/profile/address/address_edit",
      params: { address: JSON.stringify(item) },
    });
  };
const handleDelete = (id: string) => {
    console.log("Press Delete")
  Alert.alert(
    "ยืนยันการลบ",
    "คุณต้องการลบที่อยู่นี้หรือไม่",
    [
      { text: "ยกเลิก", style: "cancel" },
      {
        text: "ลบ",
        style: "destructive",
        onPress: () => confirmDelete(id),
      },
    ]
  );
};

const confirmDelete = async (id: string) => {
  try {
    setLoadingDelete(id);

    const token = await AsyncStorage.getItem("token");
    if (!token) {
      Alert.alert("Error", "No token");
      return;
    }

    await deleteAddress(id, token);

    setAddresses((prev) => prev.filter((item) => item.address_id !== id));

  } catch (error: any) {
    console.log("delete error", error.response?.data || error.message);
    Alert.alert("Error", "ไม่สามารถลบได้");
  } finally {
    setLoadingDelete(null);
  }
};
  return (
    <View className="flex-1">
      <FlatList
        data={addresses}
        keyExtractor={(item) => item.address_id}
        className="m-2 rounded-md shadow-md shadow-gray-300"
        renderItem={({ item }) => (
          <AddressCard
            address={item}
            isSelected={item.address_id === selectedAddress?.address_id}
            onPress={() => dispatch(setSelectedAddress(item))}
            onEdit={() => handleEdit(item)}
            onDelete={() => handleDelete(item.address_id)}
          />
        )}
      />
      <View className="bg-white p-2">
        <CustomButton
          title="เพิ่มที่อยู่"
          onPress={() =>     router.push({
      pathname: "/(auth)/address",
      params: { from: "address_list" }, 
    })}
          size="md"
        />
      </View>
    </View>
  );
}
