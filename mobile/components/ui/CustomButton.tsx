import { Text, TouchableOpacity } from "react-native";

type CustomButtonProp = {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  className?: string;
};

export const CustomButton = ({
  title,
  onPress,
  variant = "primary",
  size = "md",
  className = "",
}: CustomButtonProp) => {
  const variantClasses = {
    primary: "bg-blue-second border-2 border-blue-main active:bg-blue-700",
    secondary: "bg-gray-500 active:bg-gray-700",
    danger: "bg-red-500 active:bg-red-700",
  };
  const sizeClasses = {
    sm: "px-2 py-1 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-2xl",
  };
    const textSizeClasses = {
    sm: "text-sm",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <TouchableOpacity
      className={[
        variantClasses[variant],
        sizeClasses[size],
        "rounded-3xl active:bg-opacity-70 w-full items-center",
        className
      ].join(" ")}
      onPress={onPress}
    >
      <Text className={["text-white font-semibold", textSizeClasses[size]].join(" ")}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};
