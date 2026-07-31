import { Text, View } from "react-native";

import { Mascot } from "@/components/Mascot";

export default function ChatScreen() {
  return (
    <View className="flex-1 gap-4 bg-bg-page px-6 pt-16">
      <View className="flex-row items-center gap-3">
        <Mascot pose="happy" size={48} />
        <Text className="font-poppins-semibold text-xl text-primary-dark">Dr. Peacock</Text>
      </View>
      <Text className="font-poppins text-neutral-600">Chat with your AI health assistant will live here.</Text>
    </View>
  );
}
