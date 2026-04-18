import { Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type ActiveOrder = {
  order_id: string;
  branch: { branch_name: string };
};

export const ActiveOrderBanner = ({ activeOrders }: { activeOrders: ActiveOrder[] }) => {
  const count = activeOrders.length;

  return (
    <View className="w-full">
      <View 
        className="rounded-[32px] overflow-hidden"
        style={{
          shadowColor: count > 0 ? "#00ACC3" : "#000",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: count > 0 ? 0.3 : 0.05,
          shadowRadius: 15,
          elevation: count > 0 ? 10 : 2,
        }}
      >
        {count > 0 ? (
          <LinearGradient
           
           colors={["#00ACC3","#FCD34D",]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="p-5 flex-row items-center justify-between"
          >
           
            <View className="absolute -top-10 -right-5 w-32 h-32 rounded-full bg-white/05" />
            <View className="absolute top-8 left-1/3 w-12 h-12 rounded-full bg-white/10" />

            <View className="flex-row items-center flex-1">
    
              <View className="w-14 h-14 rounded-2xl bg-white/20 items-center justify-center border border-white/30 shadow-sm">
                <MaterialCommunityIcons name="sync" size={30} color="white" className="animate-spin" />
              </View>

              {/* Text Info */}
              <View className="ml-4 flex-1">
                <View className="flex-row items-center">
                  <View className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse" />
                  <Text className="text-white/70 text-[10px] font-black uppercase tracking-[2px]">
                    Active Status
                  </Text>
                </View>
                <Text className="font-black text-white text-lg leading-7 mt-0.5">
                  กำลังดำเนินการอยู่
                </Text>
              </View>
            </View>

            <View className="h-12 w-12 rounded-full bg-green-500 items-center justify-center shadow-lg">
              <Text className="text-white font-black text-xl">{count}</Text>
            </View>
          </LinearGradient>
        ) : (
        
          <View className="bg-white border border-gray-100 p-6 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="w-12 h-12 rounded-2xl bg-gray-50 items-center justify-center border border-gray-100">
                <MaterialCommunityIcons name="washing-machine" size={24} color="#CBD5E1" />
              </View>
              <View className="ml-4">
                <Text className="font-bold text-gray-400 text-sm italic">ไม่มีรายการที่กำลังทำงาน</Text>
                <Text className="text-gray-300 text-[10px] uppercase tracking-widest mt-0.5">Standby Mode</Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};