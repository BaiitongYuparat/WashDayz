import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
    const router = useRouter();
    const menuItems = [
        { icon: 'person-circle', title: 'แก้ไขโปรไฟล์', subtitle: 'อัปเดตข้อมูลส่วนตัว' },
        { icon: 'lock-closed', title: 'ความเป็นส่วนตัว', subtitle: 'จัดการการตั้งค่าความเป็นส่วนตัว' },
        { icon: 'notifications', title: 'การแจ้งเตือน', subtitle: 'จัดการการแจ้งเตือน' },
        { icon: 'help-circle', title: 'ช่วยเหลือ', subtitle: 'คำถามที่พบบ่อย' },
    ];

    return (
        <ScrollView className='flex-1 bg-blue-100'>
           <Text className='text-red-400'>
                Hi Form Profile
           </Text>
        </ScrollView>
    );
}


