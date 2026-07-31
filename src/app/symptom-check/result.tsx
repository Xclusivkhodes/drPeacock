import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { Mascot } from "@/components/Mascot";

export default function ResultScreen() {
  return (
    <View className="flex-1 gap-4 bg-bg-page px-6 pt-16">
      <Pressable onPress={() => router.replace("/(tabs)")}>
        <Text className="font-poppins-medium text-primary-dark">Back</Text>
      </Pressable>
      <Text className="font-poppins-medium text-xs uppercase text-neutral-400">Step 3 of 3</Text>

      <View className="gap-2 rounded-card bg-bg-card p-4">
        <Text className="font-poppins-medium text-xs uppercase text-neutral-400">Possible concern</Text>
        <View className="flex-row items-center gap-3">
          <Mascot pose="explaining" size={56} />
          <Text className="flex-1 font-poppins-semibold text-lg text-primary-dark">Malaria-like symptoms</Text>
        </View>
        <View className="self-start rounded-pill bg-warning px-3 py-1">
          <Text className="font-poppins-semibold text-xs text-white">Moderate risk</Text>
        </View>
        <Text className="font-poppins text-neutral-600">
          Recommended action: visit a healthcare facility within 24 hours.
        </Text>
      </View>

      <View className="flex-1" />

      <Pressable
        onPress={() => router.push("/emergency")}
        className="items-center rounded-card bg-danger py-4"
      >
        <Text className="font-poppins-semibold text-white">It got worse</Text>
      </Pressable>
    </View>
  );
}
