import { Link } from "expo-router";
import { Text, View } from "react-native";

import { Mascot } from "@/components/Mascot";

export default function WelcomeScreen() {
  return (
    <View className="flex-1 items-center justify-center gap-6 bg-bg-page px-6">
      <Mascot pose="hello" size={140} />
      <Text className="font-poppins-bold text-3xl text-primary-dark">Your health, our pride.</Text>
      <Text className="text-center font-poppins text-neutral-600">
        I&apos;m Dr. Peacock. Tell me how you feel and I&apos;ll guide you to the right care.
      </Text>

      <Link
        href="/(onboarding)/setup"
        className="w-full rounded-card bg-primary py-4 text-center font-poppins-semibold text-white"
      >
        Get started
      </Link>
      <Link
        href="/(auth)/sign-in"
        className="w-full rounded-card border border-chip-inactive bg-bg-card py-4 text-center font-poppins-semibold text-primary-dark"
      >
        I already have an account
      </Link>
    </View>
  );
}
