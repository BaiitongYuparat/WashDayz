import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import { useEffect,useState } from 'react';
import { getMainServicesById, MainService } from '@/services/mainServices';
import { QuantityButton } from '@/features/order/QuantityButton';
import { PriceShown } from '@/features/order/PriceShown';

export default function OrderScreen() {
    const router = useRouter();
    const { serviceId } = useLocalSearchParams();
    const [service, setService] = useState<MainService | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [price, setPrice] = useState<number>(0)


    useEffect(() => {
        const fetchServices = async() =>{
            if (!serviceId) return; 
            const service = await getMainServicesById(serviceId as string)
            setService(service)
        };
        fetchServices();
        console.log("Service",service)
    },[])

    return (
        <ScrollView className='flex-1 bg-white'>
            {/* ขื่อ service กับ รูป */}
           <View className='flex-1 items-center gap-4 m-3 '>
                <Text className='font-bold text-2xl text-blue-main'>{service?.name}</Text>
                <Ionicons name="shirt" className='text-blue-main' size={54}/>
           </View>

           <LinearGradient
           colors={["#86F0FF", "#C7ECF7", "#FFFFFF"]}
              className="bg-blue-light justify-between overflow-hidden p-4 "
           >
                <View className='items-center gap-2 mb-2'>
                    <Text className='font-bold text-xl'>เลือกจำนวนชิ้น</Text>
                    <Text className='text-gray-500 px-4 text-center'>{service?.description}</Text>
                </View>
                
                <View className='flex-row gap-2 justify-center items-center'>
                    <PriceShown pricePerUnit={service?.price_per_unit ?? 0} quantity={quantity} />
                    <QuantityButton value={quantity} onChange={setQuantity} />
                </View>
           </LinearGradient>
           
        </ScrollView>
    );
}


