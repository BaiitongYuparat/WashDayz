import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
    const router = useRouter();

    return (
        <ScrollView className='flex-1'>
           <Text className='text-red-400'>
                Hi Form Profile
           </Text>
        </ScrollView>
    );
}


