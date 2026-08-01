import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

interface ActionButtonProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  iconColor: string;
  iconBg: string;
  label: string;
  subtitle: string;
  onPress: () => void;
}

const cardShadow = { shadowColor: "#0D47A1", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.07, shadowRadius: 18 };

export function ActionButton({ icon, iconColor, iconBg, label, subtitle, onPress }: ActionButtonProps) {
  return (
    <Pressable onPress={onPress} className="flex-1 rounded-[20px] bg-bg-card p-4" style={cardShadow}>
      <View className="h-[38px] w-[38px] items-center justify-center rounded-xl" style={{ backgroundColor: iconBg }}>
        <MaterialCommunityIcons name={icon} size={20} color={iconColor} />
      </View>
      <Text className="mt-[30px] font-poppins-semibold text-[15.5px] text-ink">{label}</Text>
      <Text className="mt-[3px] font-poppins text-[12.5px] leading-[16px] text-[rgba(45,55,72,0.5)]">{subtitle}</Text>
    </Pressable>
  );
}
