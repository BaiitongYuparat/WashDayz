import { getAddress, UserAddresses } from "@/services/address";
import { useEffect, useState } from "react";
import { View , FlatList } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AddressCard from "@/features/address/AddressCard";
import { CustomButton } from "@/components/ui/CustomButton";

export default function AddressListScreen() {
    const [addresses , setAddresses] = useState<UserAddresses[]> ([])
    useEffect(() => {
    const fetchAddress = async() => {
        try{
                
                const token = await AsyncStorage.getItem("token");
                if (!token) {
                    console.log("No token found");
                    return;
                }
                const address = await getAddress(token)
                setAddresses(address)
        } catch (error) {
            console.log("fetch user address error:", error)
        }
    }
    fetchAddress();
},[addresses])
    return(
        <View className="flex-1">
            <FlatList 
            data = {addresses}
            keyExtractor={(item) => item.address_id}
            className="m-2 rounded-md shadow-md shadow-gray-300"
            renderItem={({ item }) => (
                <AddressCard address={item} onPress={() => console.log("press")}/>
            )}
            />
            <View className="bg-white p-2">
                <CustomButton 
            title="เพิ่มที่อยู่"
            onPress={() => console.log("press")}
            size="md"
            />
            </View>
        </View>
    )
}