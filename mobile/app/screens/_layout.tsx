// app/screens/_layout.tsx
import { Stack } from 'expo-router';

export default function ScreensLayout() {
  return (
    <Stack 
  screenOptions={{
    headerTitle: '',            
  }} 
    >
      <Stack.Screen name="order" options={{ title: "Order" }} />
    </Stack>
  );
}