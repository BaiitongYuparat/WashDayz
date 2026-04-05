import { router } from "expo-router";
import {
  Button,
  Pressable,
  ScrollView,
  View,
  Text,
  FlatList,
} from "react-native";
import { ServiceCard } from "@/features/service/ServiceCard";
import { UserHeader } from "@/components/UserHeader";
import { useEffect , useState} from "react";
import { getMainServices } from "@/services/mainServices";
import { MainService } from "@/services/mainServices";


const userInfo = {
  name: "Yuparat",
  surname: "love numtee",
  address : "ถนนประชาชื่น ทุ่งสองห้อง เขตหลักสี่ กรุงเทพฯ 10210"
}
export default function Index() {
  const [services, setServices] = useState<MainService[]>([]);

  useEffect(() => {
  const fetchMainService = async() => {
    try {
      const services = await getMainServices();
      setServices(services)
      console.log("Fetch services Info success")
    } catch (error) {
      console.log("Error while fetch MainService data: ", error)
    }
  }
  fetchMainService();
},[])

  const onPress = (services: MainService) => {
    router.push({
      pathname: '/screens/home/branch',
      params: {
        serviceId: services.main_service_id,
      }
    })
  }

  return (
    <View className="flex-1 justify-between">
     
      <UserHeader />

      <View className="flex-1 mt-3 p-2 rounded-xl">
        <Text className="font-bold text-xl px-4">All Service</Text>
      <FlatList
        data={services}
        numColumns={2}
        contentContainerStyle={{ padding: 3 }}
        keyExtractor={(item) => item.main_service_id}
        renderItem={({ item }) => (
          <View className="w-1/2 p-2">   
            <ServiceCard 
            service={item} 
            onPress={() => onPress(item)}/>
          </View>
        )}
      />
      </View>

       <Button
        title="Go to Order"
        onPress={() => router.push('./screens/order')}
      />
      
    </View>
  );
}
