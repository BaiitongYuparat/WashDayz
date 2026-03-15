import React from "react";

type CustomButtonProps = {
    title: string;
    onPress: () => void;
    variant?: "primary" | "secondary" | "success" | "danger";
    size?: "md" | "lg";
};

export const CustomButton = ({
    title,
    onPress,
    variant = "primary",
    size = "md",
}: CustomButtonProps) => {

    const variantClasses = {
        primary: "bg-blue-400 hover:bg-blue-500 text-white",
        secondary: "bg-blue-50 hover:bg-blue-100 text-white",
        success: "bg-green-500 hover:bg-green-600 text-white",
        danger: "bg-red-500 hover:bg-red-600 text-white",

    };

    const sizeClasses = {
        md: "px-4 py-2 text-base",
        lg: "px-6 py-3 text-lg",
    };

    return (
        <button
            onClick={onPress}
            className={`${variantClasses[variant]} ${sizeClasses[size]} rounded-lg`}
        >
            {title}
        </button>
    );
};