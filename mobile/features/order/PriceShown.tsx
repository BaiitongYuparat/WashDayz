import { Text , View } from "react-native";

type PriceShownProps = {
  pricePerUnit: number;
  quantity: number;
};

export function PriceShown({ pricePerUnit, quantity }: PriceShownProps) {
  const totalPrice = pricePerUnit * quantity;
  return (
    <View className="px-4 py-2 rounded-md border-2 border-blue-main bg-white shadow-md shadow-blue-main"
    style={{borderRadius: 6}}>
        <Text className="text-blue-main font-bold">{totalPrice} ฿</Text>
    </View>
  );
}