import { View, Text } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Image } from "expo-image"
import { useUser } from "@/provider/UserProvider"
import { LinearGradient } from "expo-linear-gradient"

export default function UserProfileCard() {
  const { user } = useUser()

  return (
    <View className="m-4">
      <View 
        className="rounded-[35px] overflow-hidden shadow-sm"
        style={{
          shadowColor: "#00ACC3",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 4,
        }}
      >
        <LinearGradient
          colors={["#E0F7FA", "#F0FDFF"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="p-6 flex-row items-center"
        >
          <View className="w-20 h-20 rounded-full p-1 bg-white/50 items-center justify-center border border-white/60">
            <View className="w-full h-full rounded-full overflow-hidden border-2 border-white bg-white">
              {user?.profile_image ? (
                <Image
                  source={{ uri: user.profile_image }}
                  style={{ width: "100%", height: "100%" }}
                  contentFit="cover"
                />
              ) : (
                <View className="w-full h-full bg-slate-50 items-center justify-center">
                  <Ionicons name="person" size={32} color="#00ACC3" />
                </View>
              )}
            </View>
          </View>

          <View className="flex-1 ml-5">
            <Text className="font-black text-[#083344] text-[20px] tracking-tight">
              {user?.name ?? "ไม่ระบุชื่อ"}
            </Text>
            
            <View className="mt-1.5 gap-1.5">
              <View className="flex-row items-center">
                <Ionicons name="mail" size={13} color="#00ACC3" />
                <Text className="text-[#0E7490] text-xs ml-2 font-semibold">
                  {user?.email || "ไม่มีข้อมูลอีเมล"}
                </Text>
              </View>
              
              <View className="flex-row items-center">
                <Ionicons name="call" size={13} color="#00ACC3" />
                <Text className="text-[#0E7490] text-xs ml-2 font-semibold">
                  {user?.phone || "ไม่มีเบอร์โทรศัพท์"}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>
    </View>
  )
}