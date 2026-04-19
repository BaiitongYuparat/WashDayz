import { View, Text } from "react-native";
import { Controller, useForm } from "react-hook-form";
import CustomInput from "@/components/ui/CustomInput";
import { CustomButton } from "@/components/ui/CustomButton";
import { UserFormData } from "@/services/userService";
import { useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";

type UserFormProps = {
  defaultValues?: {
    name?: string;
    phone?: string;
    email?: string;
    password?: string;
    googleId?: string;
  };
  onSubmit: (data: UserFormData) => void;
  submitText: string;
  mode?: "register" | "edit";
};

export default function UserForm({
  defaultValues,
  onSubmit,
  submitText,
  mode = "register", // ← default เป็น register
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

  const passwordValue = watch("password");
  const isGoogleUser = !!defaultValues?.googleId;

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
        rules={{
          required: "กรุณากรอกเบอร์โทร",
          pattern: {
            value: /^[0-9]{10}$/,
            message: "เบอร์โทรต้องเป็นตัวเลข 10 หลัก",
          },
        }}
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
      {isGoogleUser ? (
        <View className="bg-gray-100 rounded-xl p-4 flex-row items-center gap-2">
          <Ionicons name="logo-google" size={16} color="#888" />
          <Text className="text-gray-500 text-sm">
            เข้าสู่ระบบด้วย {defaultValues?.email}
          </Text>
        </View>
      ) : (
        <Controller
          control={control}
          name="email"
          rules={{
            required: "กรุณากรอกอีเมล",
            pattern: { value: /^\S+@\S+$/i, message: "รูปแบบอีเมลไม่ถูกต้อง" },
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
      )}

      {/* PASSWORD */}
      {!isGoogleUser && (
        <>
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
                  placeholder={
                    mode === "edit"
                      ? "กรอกเพื่อเปลี่ยนรหัสผ่าน (ถ้าต้องการ)"
                      : "รหัสผ่าน"
                  }
                  label={
                    mode === "edit" ? "รหัสผ่านใหม่ (ไม่บังคับ)" : "รหัสผ่าน"
                  }
                  secureTextEntry
                />
                {errors.password && (
                  <Text className="text-red-500">
                    {errors.password.message}
                  </Text>
                )}
              </View>
            )}
          />

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
                    <Text className="text-red-500">
                      {errors.confirmPassword.message}
                    </Text>
                  )}
                </View>
              )}
            />
          )}
        </>
      )}

      <CustomButton
        title={isSubmitting ? "กำลังบันทึก..." : submitText}
        onPress={handleSubmit(onSubmit)}
      />
    </View>
  );
}
