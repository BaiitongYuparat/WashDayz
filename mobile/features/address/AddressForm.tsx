import CustomInput from "@/components/ui/CustomInput";
import { useEffect, useState } from "react";
import { CustomButton } from "@/components/ui/CustomButton";
import { View } from "react-native";

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

  return (
    <View className="flex-1 justify-between">
      <View>
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
        <CustomInput value={dist} onChangeText={setDist} placeholder="เขต" />
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
        />
        <CustomInput
          value={phone}
          onChangeText={setPhone}
          placeholder="เบอร์โทร"
        />
        <CustomInput
          value={details}
          onChangeText={setDetails}
          placeholder="รายละเอียด"
        />
        <CustomInput
          value={label}
          onChangeText={setLabel}
          placeholder="label"
        />
      </View>

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
  );
}
