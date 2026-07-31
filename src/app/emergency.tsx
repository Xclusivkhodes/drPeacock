import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { Mascot } from "@/components/Mascot";
import { Colors } from "@/constants/theme";

// Full-bleed dark gradient per the design reference — a StyleSheet-exception
// case (AGENTS.md) since it's a dynamic gradient background.
export default function EmergencyScreen() {
  return (
    <View className="flex-1 gap-4 px-6 pt-16" style={{ backgroundColor: Colors.primaryDark }}>
      <Pressable onPress={() => router.replace("/(tabs)")} className="self-end">
        <Text className="font-poppins-semibold text-white">Close</Text>
      </Pressable>

      <Mascot pose="shield" size={120} />
      <Text className="font-poppins-bold text-3xl text-white">Go now.</Text>
      <Text className="font-poppins text-white/80">
        Chest pain with breathing difficulty can be life-threatening.
      </Text>

      <View className="gap-1 rounded-card bg-white/10 p-4">
        <Text className="font-poppins-semibold text-white">Korle Bu Teaching Hospital</Text>
        <Text className="font-poppins text-sm text-white/70">4.2 km · Open 24h · A&E ready</Text>
      </View>

      <View className="flex-1" />

      <Pressable className="items-center rounded-card bg-danger py-4">
        <Text className="font-poppins-semibold text-white">Call ambulance · 112</Text>
      </Pressable>
    </View>
  );
}
