import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { Mascot } from "@/components/Mascot";

export default function CelebrateScreen() {
  return (
    <View className="flex-1 items-center justify-center gap-4 bg-bg-page px-6">
      <Mascot pose="celebrating" size={140} />
      <Text className="font-poppins-bold text-2xl text-primary-dark">Dose 4 of 6 done</Text>
      <Text className="text-center font-poppins text-neutral-600">
        Great job staying on track with your medication.
      </Text>

      <Pressable
        onPress={() => router.replace("/(tabs)")}
        className="mt-6 items-center rounded-card bg-primary px-8 py-4"
      >
        <Text className="font-poppins-semibold text-white">Back home</Text>
      </Pressable>
    </View>
  );
}
