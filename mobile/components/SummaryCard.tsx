import { View, Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ComponentProps } from "react";
import SummaryRow from "./SummaryRow";
import { Machine } from "@/services/machineService";
import { AddonType } from "@/services/addonService";
import { UserAddress } from "@/services/address";
type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

type Props = {
  serviceName: string;
  branchName: string;
  address?: UserAddress | null;
  machines: Machine[];
  addons: AddonType[];
  totalPrice: number;
  handleEditAddon: () => void;
  handleEditBranch: () => void;
};

const MACHINE_TYPE_LABELS: Record<string, string> = {
  WASHER: "เครื่องซัก",
  DRYER: "เครื่องอบ",
};

const MACHINE_ICONS: Record<string, IconName> = {
  WASHER: "washing-machine",
  DRYER: "tumble-dryer",
};

export default function SummaryCard({
  serviceName,
  branchName,
  machines,
  addons,
  totalPrice,
  address,
  handleEditAddon,
  handleEditBranch,
}: Props) {
  return (
    <View className="bg-white rounded-3xl overflow-hidden border border-gray-100">
      {/* header */}
      <View className="bg-blue-main px-5 py-4">
        <Text className="text-white/70 text-xs mb-1">บริการที่เลือก</Text>
        <Text className="text-white text-xl font-bold">{serviceName}</Text>
      </View>

      <View className="p-5 gap-4">
        {/* สาขา + ที่อยู่ */}
        <View className="gap-3">
          <View className="flex-row justify-between">
            <Text className="text-sm text-gray-400 font-bold uppercase tracking-wide">
              สถานที่
            </Text>
            <TouchableOpacity onPress={handleEditBranch}>
              <Text className="text-cyan-500 text-sm">แก้ไข</Text>
            </TouchableOpacity>
          </View>

          {/* สาขา */}
          <View className="flex-row items-center gap-3 p-3 rounded-2xl bg-gray-50">
            <View className="w-9 h-9 rounded-xl bg-blue-light items-center justify-center">
              <MaterialCommunityIcons name="store" size={18} color="#00ACC3" />
            </View>
            <View className="flex-1">
              <Text className="text-xs text-gray-400 mb-0.5">สาขา</Text>
              <Text className="text-gray-800 font-bold text-sm">
                {branchName}
              </Text>
            </View>
          </View>

          {/* ที่อยู่ */}
          {address && (
            <View className="flex-row items-center gap-3 p-3 rounded-2xl bg-gray-50">
              <View className="w-9 h-9 rounded-xl bg-blue-light items-center justify-center">
                <MaterialCommunityIcons
                  name="home-outline"
                  size={18}
                  color="#00ACC3"
                />
              </View>
              <View className="flex-1">
                <Text className="text-xs text-gray-400 mb-0.5">
                  ที่อยู่จัดส่ง
                </Text>
                <Text className="text-gray-800 font-bold text-sm">
                  {address.label}
                </Text>
                {address.details ? (
                  <Text className="text-gray-400 text-xs mt-0.5">
                    {address.details}
                  </Text>
                ) : null}
                {address.receiver_name ? (
                  <Text className="text-gray-400 text-xs mt-0.5">
                    {address.receiver_name}
                    {address.phone ? ` · ${address.phone}` : ""}
                  </Text>
                ) : null}
                <Text className="text-gray-400 text-xs mt-0.5">
                  {[
                    address.houseNo,
                    address.district,
                    address.subDistrict,
                    address.province,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* เครื่องที่เลือก */}
        <View>
          <Text className="text-xs text-gray-400 font-bold mb-3 uppercase tracking-wide">
            เครื่องที่เลือก
          </Text>
          <View className="gap-2">
            {machines.map((m) => (
              <View key={m.machine_id} className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-xl bg-blue-light items-center justify-center">
                  <MaterialCommunityIcons
                    name={MACHINE_ICONS[m.type] ?? "washing-machine"}
                    size={20}
                    color="#00ACC3"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-gray-800">
                    {MACHINE_TYPE_LABELS[m.type] ?? m.type}
                  </Text>
                  <Text className="text-xs text-gray-400">
                    {m.capacity} กก. · {m.duration_minutes} นาที
                  </Text>
                </View>
                <Text className="text-sm font-bold">{m.price} ฿</Text>
              </View>
            ))}
          </View>
        </View>

        {/* addon */}
         <View className="h-px bg-gray-100" />

  <View>
    <View className="flex-row justify-between">
      <Text className="text-sm text-gray-400 font-bold mb-2 uppercase tracking-wide">
        บริการเสริม
      </Text>

      <TouchableOpacity onPress={handleEditAddon}>
        <Text className="text-cyan-500 text-sm">แก้ไข</Text>
      </TouchableOpacity>
    </View>

    {addons.length > 0 ? (
      addons.map((a) => (
        <SummaryRow
          key={a.addon_service_id}
          label={a.name}
          value={`${a.price} ฿`}
        />
      ))
    ) : (
      <Text className="text-sm text-gray-400 italic">
        ยังไม่ได้เลือกบริการเสริม
      </Text>
    )}
  </View>

        <View className="h-px bg-gray-100" />

        {/* ราคารวม */}
        <SummaryRow
          label="ราคารวมทั้งหมด"
          value={`${totalPrice.toLocaleString()} ฿`}
          highlight
        />
      </View>
    </View>
  );
}
