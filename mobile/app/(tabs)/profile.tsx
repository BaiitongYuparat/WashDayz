import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Button,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useUser } from "@/provider/UserProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import axios from "axios";
import ProfileMenuButton from "@/components/ProfileMenuButton";
import { CustomButton } from "@/components/ui/CustomButton";

export default function ProfileScreen() {
  const [addresses, setAddresses] = useState<any[]>([]);
  const router = useRouter();
  const { user, setUser } = useUser();

  console.log(user);
  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    setUser(null); // ล้าง user context
    router.replace("/(auth)/login");
  };


  return (
    <View className="flex-1">
      <Text className="text-red-400"></Text>
      <Text>{user?.email}</Text>
      <View className="flex-1 p-4">
        <ProfileMenuButton 
        title="ที่อยู่"
        icon = {<Ionicons name="home" size={20} color="#00ACC3" />}
        onPress={() => router.push('/screens/AddressListScreen')}
        />
         <ProfileMenuButton 
        title="ข้อมูลส่วนตัว"
        icon = {<Ionicons name="person" size={20}  color="#00ACC3"/>}
        onPress={() => router.push('/screens/profile/user/user_edit')}
        />
      </View>
      <View className="p-2">
          <CustomButton title="Log Out" onPress={handleLogout} variant="danger"/>
      </View>
      
    </View>
  );
}
