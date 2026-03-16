import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: '#00ACC3', // สีม่วงเข้มสำหรับไอคอนที่เลือก
                tabBarInactiveTintColor: '#9CA3AF', // สีเทาสำหรับไอคอนที่ไม่ถูกเลือก
                tabBarStyle: {
                    height: Platform.OS === 'ios' ? 85 : 65, // ปรับความสูงของ tab bar ตามแพลตฟอร์ม
                    paddingBottom: Platform.OS === 'ios' ? 25 : 10, // ปรับ padding ด้านล่างตามแพลตฟอร์ม
                    paddingTop: 4, // เพิ่ม padding ด้านบน
                },
                tabBarLabelStyle: {
                    fontSize: 12, 
                    fontWeight: '600',
                },
                headerShown: false,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons 
                        name={focused ? 'home' : 'home-outline'} // เปลี่ยนไอคอนเมื่อถูกเลือก
                        size={size} 
                        color={color} 
                        />
                    ),
                }}
            />
             <Tabs.Screen
                name="track"
                options={{
                    title: 'Track',
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons 
                        name={focused ? 'navigate' : 'navigate-outline'} // เปลี่ยนไอคอนเมื่อถูกเลือก 
                        size={size} 
                        color={color} 
                        />
                    ),
                }}
            />
             <Tabs.Screen
                name="history"
                options={{
                    title: 'History',
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons 
                        name={focused ? 'time' : 'time-outline'} // เปลี่ยนไอคอนเมื่อถูกเลือก 
                        size={size} 
                        color={color} 
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons 
                        name={focused ? 'person' : 'person-outline'} // เปลี่ยนไอคอนเมื่อถูกเลือก 
                        size={size} 
                        color={color} 
                        />
                    ),
                }}
            />
        </Tabs>
    );
}


