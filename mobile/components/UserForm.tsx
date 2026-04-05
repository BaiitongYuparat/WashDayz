import { View, Text } from "react-native";
import { Controller, useForm } from "react-hook-form";
import CustomInput from "@/components/ui/CustomInput";
import { CustomButton } from "@/components/ui/CustomButton";
import { UserFormData } from "@/services/userService";


type UserFormProps = {
  defaultValues?: {
    name?: string;
    phone?: string;
    email?: string;
    password?: string;
  };
  onSubmit: (data: UserFormData) => void;
  submitText: string;
};

export default function UserForm({
  defaultValues,
  onSubmit,
  submitText,
}: UserFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    defaultValues: {
      name: defaultValues?.name || "",
      phone: defaultValues?.phone || "",
      email: defaultValues?.email || "",
      password: defaultValues?.password || "",
    },
  });

  return (
    <View>
      {/* NAME */}
      <Controller
        control={control}
        name="name"
        rules={{ required: "กรุณากรอกชื่อ" }}
        render={({ field: { onChange, value } }) => (
          <View>
            <CustomInput
              value={value}
              onChangeText={onChange}
              placeholder="ชื่อผู้รับ"
              label="ชื่อ"
            />
            {errors.name && (
              <Text className="text-red-500">{errors.name.message}</Text>
            )}
          </View>
        )}
      />

      {/* PHONE */}
      <Controller
        control={control}
        name="phone"
        rules={{ required: "กรุณากรอกเบอร์โทร" }}
        render={({ field: { onChange, value } }) => (
          <View>
            <CustomInput
              value={value}
              onChangeText={onChange}
              placeholder="เบอร์โทร"
              label="เบอร์โทร"
            />
            {errors.phone && (
              <Text className="text-red-500">{errors.phone.message}</Text>
            )}
          </View>
        )}
      />

      {/* EMAIL */}
      <Controller
        control={control}
        name="email"
        rules={{
          required: "กรุณากรอกอีเมล",
          pattern: {
            value: /^\S+@\S+$/i,
            message: "รูปแบบอีเมลไม่ถูกต้อง",
          },
        }}
        render={({ field: { onChange, value } }) => (
          <View>
            <CustomInput
              value={value}
              onChangeText={onChange}
              placeholder="example@email.com"
              label="อีเมล"
              keyboardType="email-address"
            />
            {errors.email && (
              <Text className="text-red-500">{errors.email.message}</Text>
            )}
          </View>
        )}
      />

      {/* PASSWORD */}
      <Controller
        control={control}
        name="password"
        rules={{
          required: "กรุณากรอกรหัสผ่าน",
          minLength: {
            value: 6,
            message: "รหัสผ่านต้องอย่างน้อย 6 ตัว",
          },
        }}
        render={({ field: { onChange, value } }) => (
          <View>
            <CustomInput
              value={value}
              onChangeText={onChange}
              placeholder="รหัสผ่าน"
              label="รหัสผ่าน"
              secureTextEntry
            />
            {errors.password && (
              <Text className="text-red-500">{errors.password.message}</Text>
            )}
          </View>
        )}
      />

      <CustomButton
        title={isSubmitting ? "กำลังบันทึก..." : submitText}
        onPress={handleSubmit(onSubmit)}
      />
    </View>
  );
}