import { View, Pressable, Text } from "react-native";
type QuantityButtonProps = {
  value: number;
  onChange: (newValue: number) => void;
};

export const QuantityButton = ({ value, onChange }: QuantityButtonProps) => {
  const min = 1;
  const max = 20;
  return (
    <View className="flex-row items-center justify-center ">
      <Pressable
        onPress={() => onChange(Math.max(value - 1, min))}
        style={{
          backgroundColor: "#01CCE6",
          borderRadius: 8,
          borderWidth: 2,
          borderColor: "#90ECF9",
        }}
        className="p-2"
      >
        <Text>-</Text>
      </Pressable>

      <Text className="mx-2 p-2 ">{value}</Text>

      <Pressable
        onPress={() => onChange(Math.min(value + 1, max))}
        style={{
          backgroundColor: "#01CCE6",
          borderRadius: 8,
          borderWidth: 2,
          borderColor: "#90ECF9",
        }}
        className="p-2"
      >
        <Text>+</Text>
      </Pressable>
    </View>
  );
};
