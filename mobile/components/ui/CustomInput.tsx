import React from "react";
import { Text, TextInput, TextInputProps, View } from "react-native";

interface CustomInputProps extends TextInputProps {
  label?: string;
  error?: string;
  touched?: boolean;
}

export default function CustomInput({
  label,
  error,
  touched,
  ...props
}: CustomInputProps) {
  const hasError = touched && error;

  return (
    <View className="w-full mb-4">
      {/* Label */}
      {label && (
        <Text className="text-gray-700 font-semibold mb-2 text-base">
          {label}
        </Text>
      )}

      {/* Input Field */}
      <TextInput
        className={`
          w-full py-1 px-2 rounded-lg border-2 border-gray-100 bg-gray-light shadow-sm shadow-gray-200
          ${hasError ? "border-red-500" : "border-gray-200"}
          ${props.editable === false ? "bg-gray-100" : "bg-white"}
          text-base text-gray-800
        `}
        placeholderTextColor="#9CA3AF"
        {...props}
      />

      {/* Error Message */}
      {hasError && <Text className="text-red-500 text-sm mt-1">{error}</Text>}
    </View>
  );
}
