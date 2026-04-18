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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUser } from "@/provider/UserProvider";
import { useDispatch } from "react-redux";
import { setSelectedAddress, setSelectedLocation } from "@/redux/addressSlice";

WebBrowser.maybeCompleteAuthSession();

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId:
      "835147090474-mqutule76dtajpbkbobgdlijbnjdtv62.apps.googleusercontent.com",
  });
  const router = useRouter();
  const { user, setUser } = useUser();
  const dispatch = useDispatch();

  useEffect(() => {
  console.log("request redirect =", request?.redirectUri);
}, [request]);
useEffect(() => {
  console.log("login")
  const uri = AuthSession.makeRedirectUri()
  console.log("redirect URI:", uri)
}, [])
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

  const setDefaultAddress = (user: any) => {
    const addresses = user.addresses;
    if (!addresses?.length) return;

    const preferred =
      addresses.find((a: any) => a.lat && a.lng) ?? addresses[0];

    dispatch(setSelectedAddress(preferred));

    if (preferred.lat && preferred.lng) {
      dispatch(
        setSelectedLocation({
          latitude: preferred.lat,
          longitude: preferred.lng,
        }),
      );
    }
  };

  const handleGoogleLogin = async (idToken: string) => {
    try {
      const result = await sendTokenToBackend(idToken);
      await AsyncStorage.setItem("token", result.token);

      console.log("result:", result.token);
      if (result.isNewUser || !result.hasAddress) {
        router.push("/address");
      } else {
        router.replace("/(tabs)");
      }
      setUser(result.user);
      setDefaultAddress(result.user);
    
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
      const result = await login(email, password); // login → response จาก backend
      console.log("login result:", result);

      // เก็บ token
      await AsyncStorage.setItem("token", result.token);

      // เก็บ user ใน context
      setUser(result.user);
      setUser(result.user);
      setDefaultAddress(result.user);

      // redirect ตาม hasAddress
      if (!result.hasAddress) {
        router.push("/address");
      } else {
        router.replace("/(tabs)");
      }
    } catch (error: any) {
      if (error.response) {
        const status = error.response.status;

        if (status === 401 || status == 404) {
          console.log(response);
          alert("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
        } else {
          alert("เกิดข้อผิดพลาด");
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

          <View className="flex-row gap-2 justify-center mt-6">
            <Text className="text-gray-400">No account?</Text>
            <Pressable onPress={() => router.push("/register")}>
              <Text className="font-bold text-blue-main">Sign up</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </LinearGradient>
  );
}
