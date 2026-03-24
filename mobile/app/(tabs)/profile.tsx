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
        icon = {<Ionicons name="home" size={20} className="text-blue-main" />}
        onPress={() => router.push('/screens/AddressListScreen')}
        />
      </View>
      <Button title="LogOut" onPress={handleLogout} />
    </View>
  );
}
