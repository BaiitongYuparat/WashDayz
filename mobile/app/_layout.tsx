import { Stack } from "expo-router";
import { UserProvider } from "@/provider/UserProvider";

export default function RootLayout() {
  return (
    <UserProvider>
        <Stack 
      screenOptions={{headerShown: false}}
      >
        <Stack.Screen name="index" options={{title: "Home"}} />
      </Stack>
    </UserProvider>
  )
}