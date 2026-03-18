import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import {
  Button,
  ScrollView,
  Platform,
  Keyboard,
  View,
  Text,
  Image,
  Pressable,
  KeyboardAvoidingView,
  Alert,
  TouchableWithoutFeedback,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import CustomInput from "@/components/ui/CustomInput";
import { CustomButton } from "@/components/ui/CustomButton";
import { useEffect, useState } from "react";
import { login, sendTokenToBackend } from "@/services/authService";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import axios from "axios";
import { useRouter } from "expo-router";
import * as AuthSession from "expo-auth-session";

WebBrowser.maybeCompleteAuthSession();

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId:
      "835147090474-43uc89ghnlej9lj0a75cdnukvqi53mi0.apps.googleusercontent.com",
    androidClientId:
      "835147090474-43uc89ghnlej9lj0a75cdnukvqi53mi0.apps.googleusercontent.com",
    webClientId:  "835147090474-43uc89ghnlej9lj0a75cdnukvqi53mi0.apps.googleusercontent.com",
    responseType: "id_token",
  });
  const router = useRouter();

  useEffect(() => {
    
    if (response?.type === "success") {
      const idToken = response.params?.id_token;
      console.log("RESPONSE:", response);
      if (idToken) {
        handleGoogleLogin(idToken);
      } else {
        console.log("NO ID TOKEN");
      }
    }
  }, [response]);

  const handleGoogleLogin = async (idToken: string) => {
  try {
    const result = await sendTokenToBackend(idToken);

    console.log("backend result:", result);

    if (result.isNewUser || !result.hasAddress) {
      router.push({
        pathname:("/address"),
        params: {userId: result.user.userId}
      })
      console.log("backend result:", result);
    } else {
      router.replace("/(tabs)");
    }

  } catch (err) {
    console.log(err);
  }
};

  const handleSubmit = async () => {
    console.log("press handlesubmit");
    if (!email || !password) {
      Alert.alert("Require");
      console.log("alert");
      return;
    }
    try {
      console.log("wait for resource");
      await login(email, password);
      router.replace("/(tabs)");
      console.log();
    } catch (error: any) {
      if (error.response) {
        const status = error.response.status;

        if (status === 401 || status == 404) {
          alert("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
        } else {
          alert("เกิดข้อผิดพลาด")
        }
      } else {
        alert("เชื่อมต่อ server ไม่ได้");
      }
    }
  };

  return (
    <LinearGradient colors={["#00ACC3", "#C7ECF7"]} className="flex-1">
      <KeyboardAwareScrollView
        enableOnAndroid
        extraScrollHeight={100}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Image
          source={require("../../assets/images/Logo_WDZ.png")}
          style={{ width: "100%", aspectRatio: 1 }}
          resizeMode="contain"
        />

        <View className="p-8 h-full rounded-t-3xl bg-white">
          <Text className="font-bold text-4xl mb-6">Login</Text>

          <CustomInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
          />

          <CustomInput
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
          />

          <CustomButton
            variant="primary"
            size="md"
            title="Log in"
            onPress={handleSubmit}
          />

          <Pressable
            className="flex-row py-2 px-4 mt-6 justify-center items-center gap-3 border rounded-lg border-gray-500"
            disabled={!request}
            onPress={() => promptAsync()}
          >
            <Ionicons name="logo-google" size={18} />
            <Text className="text-gray-500">Continue With Google</Text>
          </Pressable>
        </View>
      </KeyboardAwareScrollView>
    </LinearGradient>
  );
}
