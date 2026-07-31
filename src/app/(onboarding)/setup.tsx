import { router } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { useProfileStore } from "@/store/useProfileStore";

const SETUP_STEPS = ["identity", "body", "conditions", "allergies", "lifestyle", "family", "access"];

export default function SetupScreen() {
  const [step, setStep] = useState(0);
  const completeOnboarding = useProfileStore((state) => state.completeOnboarding);
  const isSummary = step >= SETUP_STEPS.length;

  const handleNext = () => {
    if (isSummary) {
      completeOnboarding();
      router.replace("/(tabs)");
      return;
    }
    setStep((current) => current + 1);
  };

  const handleBack = () => {
    if (step === 0) {
      router.back();
      return;
    }
    setStep((current) => current - 1);
  };

  return (
    <View className="flex-1 gap-6 bg-bg-page px-6 pt-16">
      <Pressable onPress={handleBack}>
        <Text className="font-poppins-medium text-primary-dark">Back</Text>
      </Pressable>

      <Text className="font-poppins-semibold text-2xl text-primary-dark">
        {isSummary ? "Your profile is ready" : `Step ${step + 1} of ${SETUP_STEPS.length}`}
      </Text>
      <Text className="font-poppins text-neutral-600">
        {isSummary ? "You can edit this anytime from your health record." : SETUP_STEPS[step]}
      </Text>

      <View className="flex-1" />

      <Pressable
        onPress={handleNext}
        className="items-center rounded-card bg-primary py-4"
      >
        <Text className="font-poppins-semibold text-white">
          {isSummary ? "Start using Dr. Peacock" : "Continue"}
        </Text>
      </Pressable>
    </View>
  );
}
