import CustomInput from "@/components/ui/CustomInput";
import { useState } from "react";
import { CustomButton } from "@/components/ui/CustomButton";
import { View, Text, ScrollView } from "react-native";
import { router } from "expo-router";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { clearGeoAddress } from "@/redux/addressSlice";
import { useEffect } from "react";

type Props = {
  initialData?: any;
  onSubmit: (data: any) => void;
};

export default function AddressForm({ initialData, onSubmit }: Props) {
  const [houseNo, setHouseNo] = useState(initialData?.houseNo || "");
  const [dist, setDist] = useState(initialData?.district || "");
  const [subdist, setSubDist] = useState(initialData?.subDistrict || "");
  const [province, setProvince] = useState(initialData?.province || "");
  const [postCode, setPostCode] = useState(initialData?.postal_code || "");
  const [phone, setPhone] = useState(initialData?.phone || "");
  const [details, setDetails] = useState(initialData?.details || "");
  const [label, setLabel] = useState(initialData?.label || "");
  const [name, setName] = useState(initialData?.receiver_name || "");

  const dispatch = useDispatch();
  const geoAddress = useSelector((state: RootState) => state.address.geoAddress);

  useEffect(() => {
    if (!geoAddress) return;
    if (geoAddress.district) setDist(geoAddress.district);
    if (geoAddress.subDistrict) setSubDist(geoAddress.subDistrict);
    if (geoAddress.province) setProvince(geoAddress.province);
    if (geoAddress.postal_code) setPostCode(geoAddress.postal_code);
    if (geoAddress.details) setDetails(geoAddress.details);

    dispatch(clearGeoAddress()); // clear หลังเติมแล้ว
  }, [geoAddress]);
  
  return (
    <View className="flex-1 bg-white">
      <ScrollView
        className="flex-1 px-4 pt-4"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >

        {/* ผู้รับ */}
        <View className="mb-5">
          <View className="gap-3">
            <CustomInput label="ชื่อผู้รับ" value={name} onChangeText={setName} placeholder="ชื่อผู้รับ" />
            <CustomInput label="เบอร์โทร" value={phone} onChangeText={setPhone} placeholder="เบอร์โทร" />
          </View>
        </View>

        {/* ที่อยู่ */}
        <View className="mb-5">
          <View className="gap-3">
            <CustomInput label="บ้านเลขที่" value={houseNo} onChangeText={setHouseNo} placeholder="บ้านเลขที่" />
            <View className="flex-row gap-3">
              <View className="flex-1">
                <CustomInput label="แขวง/ตำบล" value={subdist} onChangeText={setSubDist} placeholder="แขวง/ตำบล" />
              </View>
              <View className="flex-1">
                <CustomInput label="เขต" value={dist} onChangeText={setDist} placeholder="เขต" />
              </View>
            </View>
            <View className="flex-row gap-3">
              <View className="flex-1">
                <CustomInput label="จังหวัด" value={province} onChangeText={setProvince} placeholder="จังหวัด" />
              </View>
              <View className="w-32">
                <CustomInput label="รหัส" value={postCode} onChangeText={setPostCode} placeholder="รหัสไปรษณีย์" />
              </View>
            </View>
          </View>
        </View>

        {/* เพิ่มเติม */}
        <View className="mb-5">
          <View className="gap-3">
            <CustomInput label="เพิ่มเติม" value={details} onChangeText={setDetails} placeholder="รายละเอียดเพิ่มเติม" />
            <CustomInput  label="บันทึกชื่อที่อยู่" value={label} onChangeText={setLabel} placeholder="ป้ายกำกับ เช่น บ้าน, ที่ทำงาน" />
          </View>
        </View>

         <CustomButton
              className="mb-4"
              title="📍 ปักหมุดบนแผนที่"
              onPress={() => router.push("/map-picker")}
            />

      </ScrollView>

      {/* ปุ่มบันทึก */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4">
        <CustomButton
          title="บันทึก"
          onPress={() =>
            onSubmit({
              houseNo,
              district: dist,
              subDistrict: subdist,
              province,
              postal_code: postCode,
              phone,
              details,
              label,
              receiver_name: name,
            })
          }
        />
      </View>
    </View>
  );
}