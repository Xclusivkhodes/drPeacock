import { Text, View } from "react-native";

import { Mascot } from "@/components/Mascot";

export default function CareScreen() {
  return (
    <View className="flex-1 gap-4 bg-bg-page px-6 pt-16">
      <Mascot pose="checking" size={72} />
      <Text className="font-poppins-semibold text-2xl text-primary-dark">Find the right care</Text>
      <Text className="font-poppins text-neutral-600">
        Facility search and filtering by care type will live here.
      </Text>
    </View>
  );
}
