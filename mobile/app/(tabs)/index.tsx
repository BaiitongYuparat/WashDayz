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

const services = [
  {
    id: "1",
    title: "ซักอบ",
    img: require("/Users/jane/Desktop/PreProject/WashDayz/mobile/assets/icons/laudry_icon.png"),
  },
  {
    id: "2",
    title: "รีด",
    img: require("/Users/jane/Desktop/PreProject/WashDayz/mobile/assets/icons/laudry_icon.png"),
  },
];

const userInfo = {
  name: "Yuparat",
  surname: "love numtee",
  address : "ถนนประชาชื่น ทุ่งสองห้อง เขตหลักสี่ กรุงเทพฯ 10210"
}
export default function Index() {
  return (
    <View className="flex-1 justify-between">
      <UserHeader user={userInfo}/>


      <View className="flex-1 mt-3 p-2 rounded-xl">
        <Text className="font-bold text-xl px-4">All Service</Text>
      <FlatList
        data={services}
        numColumns={2}
        contentContainerStyle={{ padding: 3 }}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="flex-1 m-1">   
            <ServiceCard service={item} />
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
