import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import { Text, View } from "react-native";

import { Mascot } from "@/components/Mascot";

export default function WelcomeScreen() {
  return (
    <LinearGradient
      colors={["#E3EDFB", "#F5F7FA", "#FFFFFF"]}
      locations={[0, 0.62, 1]}
      style={{ flex: 1, paddingHorizontal: 28, paddingBottom: 30, paddingTop: 64 }}
    >
      <View className="flex-row items-center gap-2">
        <MaterialCommunityIcons name="heart-pulse" size={26} color="#1565C0" />
        <Text className="font-poppins-bold text-[17px] tracking-tight text-primary-dark">
          Dr. <Text className="text-accent-teal">Peacock</Text>
        </Text>
      </View>

      <View className="mt-1 self-center">
        <Mascot pose="hello" width={190} height={388} />
      </View>

      <Text className="font-poppins-bold text-[38px] leading-[40px] tracking-[-1.1px] text-primary-dark">
        Your health,{"\n"}our pride.
      </Text>

      <Text className="mt-3 max-w-[308px] font-poppins text-[15.5px] leading-[24px] text-muted">
        I&apos;m Dr. Peacock. Tell me how you feel and I&apos;ll guide you to the right care — in your
        own language.
      </Text>

      <View className="flex-1" />

      <View className="gap-3">
        <Link
          href="/(onboarding)/setup"
          className="items-center justify-center rounded-card bg-primary py-4 text-center font-poppins-semibold text-base text-white"
          style={{
            shadowColor: "#1565C0",
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.28,
            shadowRadius: 24,
            elevation: 6,
          }}
        >
          Get started
        </Link>
        <Link
          href="/(auth)/sign-in"
          className="items-center justify-center rounded-card border border-subtle bg-bg-card py-[15px] text-center font-poppins-semibold text-primary-dark"
        >
          I already have an account
        </Link>
        <Text className="mt-0.5 text-center font-poppins text-[11.5px] text-faint">
          Guidance only — Dr. Peacock never replaces a doctor.
        </Text>
      </View>
    </LinearGradient>
  );
}
