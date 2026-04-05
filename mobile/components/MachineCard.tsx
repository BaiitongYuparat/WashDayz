import { View , Text ,Pressable} from "react-native";


interface MachineCardProps {
    img?: string;
    type: string;
    time: string;
    onPress: () => void;
    isSelected?: boolean;
}

export default function MachineCard({img, type , time, isSelected ,onPress}: MachineCardProps) {
    return(
        <Pressable 
            onPress={onPress}
            className="w-full rounded-md p-2 bg-white"
           style={{
            borderWidth: isSelected ? 2 : 0,           
            borderColor: isSelected ? "#00ACC3" : "transparent",
        }}>
            <View className="">
                <View>
                    {img}
                </View>
                <View>
                    <Text className="font-bold">{type}</Text>
                     <Text>เวลาซัก: {time}</Text>
                </View>
            </View>
        </Pressable>
    )
}