import { Link } from "expo-router";
import { Text, View } from "react-native";

import { Mascot } from "@/components/Mascot";

export default function ProfileScreen() {
  return (
    <View className="flex-1 gap-4 bg-bg-page px-6 pt-16">
      <Mascot pose="confident" size={72} />
      <Text className="font-poppins-semibold text-2xl text-primary-dark">Health record</Text>
      <Text className="font-poppins text-neutral-600">
        Allergies, conditions, medications, and history will live here.
      </Text>
      <Link href="/(auth)/welcome" className="font-poppins-medium text-primary">
        Restart the demo
      </Link>
    </View>
  );
}
