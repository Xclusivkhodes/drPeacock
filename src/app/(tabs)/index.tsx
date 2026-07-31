import { Link } from "expo-router";
import { Text, View } from "react-native";

import { Mascot } from "@/components/Mascot";

export default function HomeScreen() {
  return (
    <View className="flex-1 gap-4 bg-bg-page px-6 pt-16">
      <Text className="font-poppins-semibold text-2xl text-primary-dark">Good morning</Text>

      <View className="flex-row items-center gap-3 rounded-card bg-primary p-4">
        <Mascot pose="confident" size={64} />
        <Text className="flex-1 font-poppins-semibold text-white">Start a conversation</Text>
      </View>

      <Link href="/symptom-check/symptoms" className="rounded-card bg-bg-card p-4 font-poppins-medium text-primary-dark">
        Check symptoms
      </Link>
      <Link href="/(tabs)/care" className="rounded-card bg-bg-card p-4 font-poppins-medium text-primary-dark">
        Find care
      </Link>
      <Link href="/(tabs)/chat" className="rounded-card bg-bg-card p-4 font-poppins-medium text-primary-dark">
        Ask a question
      </Link>
      <Link href="/(tabs)/profile" className="rounded-card bg-bg-card p-4 font-poppins-medium text-primary-dark">
        Health record
      </Link>
      <Link href="/emergency" className="rounded-card bg-danger p-4 text-center font-poppins-semibold text-white">
        SOS
      </Link>
      <Link href="/celebrate" className="rounded-card bg-bg-card p-4 font-poppins-medium text-primary-dark">
        Taken (mark dose)
      </Link>
    </View>
  );
}
