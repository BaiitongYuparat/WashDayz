import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { Button, View, Text , Image, Pressable} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from '@expo/vector-icons';

WebBrowser.maybeCompleteAuthSession();

export default function Login() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId:
      "835147090474-43uc89ghnlej9lj0a75cdnukvqi53mi0.apps.googleusercontent.com",
  });

  return (
    <LinearGradient 
    colors={["#00ACC3", "#C7ECF7"]}
    className="flex-1 bg-blue-light justify-between">
       <Image
  source={require("../../assets/images/Logo_WDZ.png")}
  style={{ width: "100%", aspectRatio: 1 }}
  resizeMode="contain"
/>
      <View className="h-2/3 rounded-t-3xl justify-center items-center bg-white">
        
        <Pressable
        className="flex-row py-2 px-4 items-center gap-3 border rounded-xl border-gray-500"
          disabled={!request}
          onPress={() => {
            promptAsync();
          }}
        > 
        <Ionicons name="logo-google" className="text-red-500 " size={18}></Ionicons>
        <Text className="text-gray-500 ">Continue With Google</Text>
        </Pressable>
      </View>
      
    </LinearGradient>
  );
}
