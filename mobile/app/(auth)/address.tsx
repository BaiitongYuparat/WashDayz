import { LinearGradient } from "expo-linear-gradient";
import {
  View,
  ScrollView,
  Text,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import CustomInput from "@/components/ui/CustomInput";
import { useEffect, useState } from "react";
import { FlatList } from "react-native-reanimated/lib/typescript/Animated";
import { CustomButton } from "@/components/ui/CustomButton";
import { useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useUser } from "@/provider/UserProvider";
import { createAddress } from "@/services/address";
import { useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedAddress, setSelectedLocation ,setGeoAddress , clearGeoAddress} from "../../redux/addressSlice";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { RootState } from "@/redux/store";

export default function AddressForm() {
  const router = useRouter();
  const [houseNo, setHouseNo] = useState(""); //บ้านเลขที่
  const [dist, setDist] = useState(""); //เขต อำเภอ
  const [subdist, setSubDist] = useState(""); // แขวง/ตำบล
  const [province, setProvince] = useState(""); //จังหวัด
  const [postCode, setPostCode] = useState(""); //ไปรษณีย์
  const [phone, setPhone] = useState("");
  const [details, setDetails] = useState("");
  const [label, setLabel] = useState("");
  const [name, setName] = useState("");
  const { user } = useUser();
  const dispatch = useDispatch();
  const selectedLocation = useSelector(
    (state: any) => state.address.selectedLocation,
  );
  const { from } = useLocalSearchParams();
  const geoAddress = useSelector((state: RootState) => state.address.geoAddress);

  useEffect(() => {
    const getToken = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        console.log("token:", token);

        const res = await axios.get("http://localhost:8080/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("res:", res.data);
      } catch (err) {
        console.log("ERROR:", err);
      }
    };
    getToken();
  }, []);

  useEffect(() => {
  if (!geoAddress) return;
  if (geoAddress.district) setDist(geoAddress.district);
  if (geoAddress.subDistrict) setSubDist(geoAddress.subDistrict);
  if (geoAddress.province) setProvince(geoAddress.province);
  if (geoAddress.postal_code) setPostCode(geoAddress.postal_code);
  if (geoAddress.details) setDetails(geoAddress.details);
  dispatch(clearGeoAddress());
}, [geoAddress]);

  const handleSubmit = async () => {
    console.log("press handlesubmit");
    if (!houseNo || !dist || !subdist || !province || !postCode || !phone) {
      Alert.alert("Require");
      console.log("alert");
      return;
    }
    if (!user?.user_id) {
      Alert.alert("User not found");
      return;
    }
    if (!selectedLocation) {
      Alert.alert("กรุณาเลือกตำแหน่งบนแผนที่");
      return;
    }
    if (from === "address_list") {
      router.back();
    } else {
      router.replace("/");
    }
    const data = {
      user_id: user?.user_id,
      label,
      houseNo,
      receiver_name: name,
      district: dist,
      subDistrict: subdist,
      province,
      postal_code: postCode,
      details,
      phone,

      lat: selectedLocation.latitude,
      lng: selectedLocation.longitude,
    };
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        alert("No token");
        return;
      }
      const res = await createAddress(data, token);
      dispatch(setSelectedAddress(res));
      router.replace("/(tabs)");
    } catch (error) {
      console.log("Error create Address", error);
    }
  };

  return (
    <LinearGradient
      colors={["#00ACC3", "#C7ECF7"]}
      className="flex-1 bg-blue-light justify-between"
    >
      <View
        style={{ flexShrink: 0, width: "100%" }}
        className="flex-1 mt-14 p-8 rounded-t-3xl bg-white shadow-xl shadow-blue-main justify-between"
      >
        <View className="items-center gap-2 mb-4">
          <Text className="text-lg font-semibold">กรอกที่อยู่จัดส่ง</Text>
          <Text className="text-gray-400">
            กรุณากรอกที่อยู่จัดส่งเพื่อใช้ในการรับ-ส่ง
          </Text>
        </View>

        <KeyboardAwareScrollView
          enableOnAndroid
          extraScrollHeight={100}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 justify-start">
            {/* adddress field */}
            <CustomInput
              value={name}
              onChangeText={setName}
              placeholder="ชื่อผู้รับ"
            />
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
            <CustomButton
              className="mb-4"
              title="📍 ปักหมุดบนแผนที่"
              onPress={() => router.push("/map-picker")}
            />
            <CustomInput
              value={details}
              onChangeText={setDetails}
              placeholder="รายละเอียดเพิ่มเติม"
              multiline
              numberOfLines={3}
            />
            <CustomInput
              value={label}
              onChangeText={setLabel}
              placeholder="บันทึกชื่อที่อยู่ เช่น บ้าน หอพัก"
            />
            {selectedLocation && (
              <Text>
                📍 เลือกแล้ว: {selectedLocation.latitude},{" "}
                {selectedLocation.longitude}
              </Text>
            )}
          </View>
        </KeyboardAwareScrollView>
        <CustomButton onPress={handleSubmit} title="บันทึกที่อยู่่" size="md" />
      </View>
    </LinearGradient>
  );
}
