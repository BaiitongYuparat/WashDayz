import { View, Text, TextInput, Alert } from "react-native";
import { useState } from "react";
import { useUser } from "@/provider/UserProvider";
import { CustomButton } from "@/components/ui/CustomButton";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { updateUser } from "@/services/userService";
import CustomInput from "@/components/ui/CustomInput";
import UserForm from "@/components/UserForm";

export default function EditProfileScreen() {
  const { user, setUser } = useUser();

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!user?.user_id) {
      Alert.alert("Error", "User not found");
      return;
    }
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "No token");
        return;
      }
      const data = {
        ...user,
        name,
        phone,
      };

      const updatedUser = await updateUser(user.user_id, data, token);

      setUser(updatedUser);

      Alert.alert("สำเร็จ", "อัปเดตข้อมูลแล้ว");
    } catch (error) {
      console.log("update error", error);
      Alert.alert("Error", "แก้ไขไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 p-4 bg-white">
        <UserForm 
        defaultValues={{
          name: user?.name,
          phone: user?.phone,
          email: user?.email,
        }}
        onSubmit={handleUpdate}
        submitText="บันทึก"
        />
    </View>
  );
}