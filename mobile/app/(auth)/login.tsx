import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import {
  Button,
  View,
  Text,
  Image,
  Pressable,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import CustomInput from "@/components/ui/CustomInput";
import { CustomButton } from "@/components/ui/CustomButton";
import { useEffect, useState } from "react";
import { createUser, getUserInfo, sendTokenToBackend } from "@/services/userService";

WebBrowser.maybeCompleteAuthSession();

export default function Login() {
    const [email,setEmail] = useState('');
    const [password,setPassword] = useState('');
    const [request, response, promptAsync] = Google.useAuthRequest({
    clientId:
      "835147090474-43uc89ghnlej9lj0a75cdnukvqi53mi0.apps.googleusercontent.com",
  });

  useEffect(() => {
      if (response?.type === "success") {
    const accessToken = response.authentication?.accessToken;

    if (accessToken) {
      getUserInfo(accessToken);
    }
  }
  })

  const handleSubmit = async () => {
    console.log('press handlesubmit')
    if(!email || !password) {
        Alert.alert("Require")
        console.log('alert')
        return;
    }
  }

  return (
    <LinearGradient
      colors={["#00ACC3", "#C7ECF7"]}
      className="flex-1 bg-blue-light justify-between"
    >
      <Image
        source={require("../../assets/images/Logo_WDZ.png")}
        style={{ width: "100%", aspectRatio: 1 }}
        resizeMode="contain"
      />
      {/* Form */}
      <View className="flex-1 p-8 rounded-t-3xl justify-between bg-white shadow-xl shadow-blue-main">
        <Text className="font-bold text-4xl text-start">Login</Text>
        {/* Login Form */}
        <View className="mt-4 mb-4">
          
          <KeyboardAvoidingView>
            <View className="">
              <CustomInput 
              value={email}
              onChangeText={setEmail}
              placeholder="Email" />

              <CustomInput 
              secureTextEntry
                 value={password}
              onChangeText={setPassword}
              placeholder="PassWord" />
            </View>
          </KeyboardAvoidingView>

          <CustomButton
            variant="primary"
            size="md"
            title="Log in"
            onPress={handleSubmit}
          />
        </View>

        {/* login with google */}
        <View>
            <Pressable
          className="flex-row py-2 px-4 justify-center items-center gap-3 border rounded-lg border-gray-500"
          disabled={!request}
          onPress={() => {
            promptAsync();
          }}
        >
          <Ionicons
            name="logo-google"
            className="text-red-500 "
            size={18}
          ></Ionicons>
          <Text className="text-gray-500 ">Continue With Google</Text>
        </Pressable>
        </View>
      </View>
    </LinearGradient>
  );
}
