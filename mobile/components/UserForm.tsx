import { View, Text } from "react-native";
import { Controller, useForm } from "react-hook-form";
import CustomInput from "@/components/ui/CustomInput";
import { CustomButton } from "@/components/ui/CustomButton";
import { UserFormData } from "@/services/userService";
import { useEffect } from "react";

type UserFormProps = {
  defaultValues?: {
    name?: string;
    phone?: string;
    email?: string;
    password?: string;
  };
  onSubmit: (data: UserFormData) => void;
  submitText: string;
  mode?: "register" | "edit"  // ← เพิ่ม
};

export default function UserForm({
  defaultValues,
  onSubmit,
  submitText,
  mode = "register",  // ← default เป็น register
}: UserFormProps) {
  const {
    control,
    reset,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData & { confirmPassword?: string }>({
    defaultValues: {
      name: defaultValues?.name || "",
      phone: defaultValues?.phone || "",
      email: defaultValues?.email || "",
      password: "",
      confirmPassword: "",
    },
  });

  const passwordValue = watch("password")

  useEffect(() => {
    if (defaultValues) {
      reset({
        name: defaultValues.name || "",
        phone: defaultValues.phone || "",
        email: defaultValues.email || "",
        password: "",
        confirmPassword: "",
      });
    }
  }, [defaultValues]);

  return (
    <View className="gap-4">

      {/* NAME */}
      <Controller
        control={control}
        name="name"
        rules={{ required: "กรุณากรอกชื่อ" }}
        render={({ field: { onChange, value } }) => (
          <View>
            <CustomInput value={value} onChangeText={onChange} placeholder="ชื่อผู้รับ" label="ชื่อ" />
            {errors.name && <Text className="text-red-500">{errors.name.message}</Text>}
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
            <CustomInput value={value} onChangeText={onChange} placeholder="เบอร์โทร" label="เบอร์โทร" />
            {errors.phone && <Text className="text-red-500">{errors.phone.message}</Text>}
          </View>
        )}
      />

      {/* EMAIL */}
      <Controller
        control={control}
        name="email"
        rules={{
          required: "กรุณากรอกอีเมล",
          pattern: { value: /^\S+@\S+$/i, message: "รูปแบบอีเมลไม่ถูกต้อง" },
        }}
        render={({ field: { onChange, value } }) => (
          <View>
            <CustomInput value={value} onChangeText={onChange} placeholder="example@email.com" label="อีเมล" keyboardType="email-address" />
            {errors.email && <Text className="text-red-500">{errors.email.message}</Text>}
          </View>
        )}
      />

      {/* PASSWORD */}
      <Controller
        control={control}
        name="password"
        rules={{
          required: mode === "register" ? "กรุณากรอกรหัสผ่าน" : false,
          minLength: { value: 6, message: "รหัสผ่านต้องอย่างน้อย 6 ตัว" },
        }}
        render={({ field: { onChange, value } }) => (
          <View>
            <CustomInput
              value={value}
              onChangeText={onChange}
              placeholder={mode === "edit" ? "กรอกเพื่อเปลี่ยนรหัสผ่าน (ถ้าต้องการ)" : "รหัสผ่าน"}
              label={mode === "edit" ? "รหัสผ่านใหม่ (ไม่บังคับ)" : "รหัสผ่าน"}
              secureTextEntry
            />
            {errors.password && <Text className="text-red-500">{errors.password.message}</Text>}
          </View>
        )}
      />

      {/* CONFIRM PASSWORD — แสดงเมื่อ register หรือเมื่อ edit แล้วกรอก password */}
      {(mode === "register" || passwordValue) && (
        <Controller
          control={control}
          name="confirmPassword"
          rules={{
            required: "กรุณายืนยันรหัสผ่าน",
            validate: (val) => val === passwordValue || "รหัสผ่านไม่ตรงกัน",
          }}
          render={({ field: { onChange, value } }) => (
            <View>
              <CustomInput
                value={value}
                onChangeText={onChange}
                placeholder="ยืนยันรหัสผ่าน"
                label="ยืนยันรหัสผ่าน"
                secureTextEntry
              />
              {errors.confirmPassword && (
                <Text className="text-red-500">{errors.confirmPassword.message}</Text>
              )}
            </View>
          )}
        />
      )}

      <CustomButton
        title={isSubmitting ? "กำลังบันทึก..." : submitText}
        onPress={handleSubmit(onSubmit)}
      />
    </View>
  );
}