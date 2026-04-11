import { Stack } from "expo-router";
import { UserProvider } from "@/provider/UserProvider";
import { Provider } from "react-redux";
import { store } from "../redux/store";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <UserProvider>

          <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" options={{ title: "Home" }} />
            </Stack>
          </SafeAreaView>

        </UserProvider>
      </Provider>
    </SafeAreaProvider>
  );
}