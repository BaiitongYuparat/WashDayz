import { LinearGradient } from "expo-linear-gradient"
import { View ,Text, KeyboardAvoidingView, Alert} from "react-native"
import CustomInput from "@/components/ui/CustomInput"
import { useState } from "react"
import { FlatList } from "react-native-reanimated/lib/typescript/Animated"
import { CustomButton } from "@/components/ui/CustomButton"

export default function AddressForm () {
    const [houseNo , setHouseNo] = useState('') //บ้านเลขที่
    const [dist , setDist] = useState('') //เขต อำเภอ
    const [subdist , setSubDist] = useState('') // แขวง/ตำบล
    const [province , setProvince] = useState('') //จังหวัด
    const [postCode, setPostCode] = useState('') //ไปรษณีย์
    const [phone , setPhone] = useState('')  
    const [details , setDetails] = useState('') 
    
    const handleSubmit = async () => {
        console.log('press handlesubmit')
        if(!houseNo || !dist || !subdist ||!province || !postCode || !phone) {
            Alert.alert("Require")
            console.log('alert')
            return;
        }

        try {

        } catch(error) {

        }
    }

    return (
        <LinearGradient
              colors={["#00ACC3", "#C7ECF7"]}
              className="flex-1 bg-blue-light justify-between"
            >
                <View className="flex-1 mt-14 p-8 rounded-t-3xl bg-white shadow-xl shadow-blue-main justify-between">
                    <View className="items-center gap-2 mb-4">
                        <Text className="text-lg font-semibold">กรอกที่อยู่จัดส่ง</Text>
                        <Text className="text-gray-400">กรุณากรอกที่อยู่จัดส่งเพื่อใช้ในการรับ-ส่ง</Text>
                    </View>

                    <KeyboardAvoidingView>

                        <View className="flex-1 justify-start">
                        {/* adddress field */}
                            <CustomInput 
                        value={houseNo}
                        onChangeText={setHouseNo}
                        placeholder="บ้านเลขที่"
                        
                        />
                            <CustomInput 
                            value={dist}
                            onChangeText={setDist}
                            placeholder="เขต"
                            />
                            <CustomInput 
                        value={subdist}
                        onChangeText={setSubDist}
                        placeholder="แขวง/ตำบล"
                        />
                            <CustomInput 
                            value={province}
                            onChangeText={setProvince}
                            placeholder="จังหวัด"
                            />
                             <CustomInput 
                        value={postCode}
                        onChangeText={setPostCode}
                        placeholder="รหัสไปรษณีย์"
                        keyboardType="numeric"
                        />
                            <CustomInput 
                            value={phone}
                            onChangeText={setPhone}
                            placeholder="เบอร์โทรศัพท์"
                            keyboardType="phone-pad"
                            />
                            {/* map */}


                            <CustomInput 
                            value={details}
                            onChangeText={setDetails}
                            placeholder="รายละเอียดเพิ่มเติม"
                            multiline
                            numberOfLines={3}
                            />
                        </View>
                    </KeyboardAvoidingView>
                    <CustomButton 
                    onPress={handleSubmit}
                    title="บันทึกที่อยู่่"
                    size="md"  
                    />
    
                </View>

                

        </LinearGradient>
    )
}