import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function OrderScreen() {
    const router = useRouter();

    return (
        <ScrollView className='flex-1'>
            {/* ขื่อ service กับ รูป */}
           <View className='flex-1 items-center gap-4 m-3 '>
                <Text className='font-bold text-2xl text-blue-main'>ซักอบ (title)</Text>
                <Ionicons name="shirt" className='text-blue-main' size={54}/>
           </View>

           <LinearGradient
           colors={["#86F0FF", "#C7ECF7", "#FFFFFF"]}
              className="bg-blue-light justify-between"
           >
                <View className='p-2 items-center'>
                    <Text>คำอธิบาย</Text>
                    <Text>คำอธิบาย</Text>
                </View>
           </LinearGradient>
        </ScrollView>
    );
}


