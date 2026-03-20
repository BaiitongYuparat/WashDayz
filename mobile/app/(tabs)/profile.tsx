import { View, Text, StyleSheet, ScrollView, TouchableOpacity , Button} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUser } from '@/provider/UserProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';

export default function ProfileScreen() {
    const router = useRouter();
    const {user , setUser} = useUser();

    console.log(user)
    const handleLogout = async () => {
        await AsyncStorage.removeItem("token");
        setUser(null); // ล้าง user context
        router.replace("/(auth)/login")
    }

useEffect(() => {
  console.log("User email:", user?.email);
  console.log("User :", user);
  console.log("FULL RESULT:", JSON.stringify(user, null, 2));

}, [user]);

if (!user) return <Text>Loading...</Text>;

    return (
        <View className='flex-1'>
           <Text className='text-red-400'>
                
           </Text>
           <Text>{user?.email}</Text>
           <Button title="LogOut" onPress={handleLogout}/>
        </View>
    );
}


