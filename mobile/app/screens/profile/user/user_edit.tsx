import { View, Text, TextInput, Alert, Image, TouchableOpacity  } from "react-native";
import { useState } from "react";
import { useUser } from "@/provider/UserProvider";
import { CustomButton } from "@/components/ui/CustomButton";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { updateUser, UserFormData } from "@/services/userService";
import CustomInput from "@/components/ui/CustomInput";
import UserForm from "@/components/UserForm";
import * as ImagePicker from "expo-image-picker"
import { uploadProfileImage } from "@/services/profileService"

export default function EditProfileScreen() {
  const { user, setUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(user?.profile_image || null);
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("ต้องการสิทธิ์เข้าถึงรูปภาพ");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) return;
        const updated = await uploadProfileImage(uri, token);
        setUser(updated);
      } catch (err) {
        Alert.alert("Error", "อัพโหลดรูปไม่สำเร็จ");
      }
    }
  };
  
  // รับ data จาก UserForm แทน useState
  const handleUpdate = async (data: UserFormData) => {
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

      const payload = {
        ...user,
        name: data.name,
        phone: data.phone,
        email: data.email,
        // ส่ง password เฉพาะเมื่อกรอกมา
        ...(data.password ? { password: data.password } : {}),
      };

      const updatedUser = await updateUser(user.user_id, payload, token);
      console.log("updatedUser:", updatedUser)
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
      <TouchableOpacity onPress={pickImage} className="items-center mb-6">
        <View className="w-24 h-24 rounded-full bg-gray-100 items-center justify-center overflow-hidden border-2 border-blue-main">
          {imageUri ? (
            <Image source={{ uri: imageUri }} className="w-full h-full" />
          ) : (
            <Text className="text-3xl">👤</Text>
          )}
        </View>
        <Text className="text-blue-main text-sm mt-2">เปลี่ยนรูปโปรไฟล์</Text>
      </TouchableOpacity>

      <UserForm
        mode="edit"
        defaultValues={{
          name: user?.name,
          phone: user?.phone,
          email: user?.email,
          googleId: user?.googleId
        }}
        onSubmit={handleUpdate}  // ← ส่ง data มาจาก form โดยตรง
        submitText={loading ? "กำลังบันทึก..." : "บันทึก"}
      />
    </View>
  );
}