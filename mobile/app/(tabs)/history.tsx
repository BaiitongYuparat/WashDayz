import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function HistoryScreen() {
    const router = useRouter();

    return (
        <LinearGradient
              colors={["#00ACC3", "#C7ECF7"]}
              className="flex-1 bg-blue-light justify-between"
            >
        </LinearGradient>
    );
}
