import { View, Alert } from "react-native";
import { useRouter } from "expo-router";
import UserForm from "@/components/UserForm";
import { createUser } from "@/services/userService";
import { UserFormData } from "@/services/userService";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from "@/provider/UserProvider";
import { login

 } from "@/services/authService";
export default function RegisterScreen() {
  const router = useRouter();
  const {user,setUser} = useUser();

  
const handleRegister = async (formData: UserFormData) => {
  try {
    await createUser(formData);

    const result = await login(formData.email, formData.password);

    await AsyncStorage.setItem("token", result.token);
    setUser(result.user);

    router.replace("/(auth)/address");

  } catch (error) {
    console.log(error);
    Alert.alert("Error", "สมัครไม่สำเร็จ");
  }
};

  return (
    <View className="flex-1 p-4 bg-white">
      <UserForm
        onSubmit={handleRegister}
        submitText="สมัครสมาชิก"
      />
    </View>
  );
}