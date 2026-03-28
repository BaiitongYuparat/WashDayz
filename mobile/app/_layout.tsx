import { Stack } from "expo-router";
import { UserProvider } from "@/provider/UserProvider";
import { Provider } from "react-redux";
import { store } from "./redux/store";
export default function RootLayout() {
  return (
    <Provider store={store}>
      <UserProvider>
        <Stack 
      screenOptions={{headerShown: false}}
      >
        <Stack.Screen name="index" options={{title: "Home"}} />
      </Stack>
    </UserProvider>
    </Provider>
  )
}