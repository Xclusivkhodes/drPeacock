import { router } from "expo-router";
import { useEffect } from "react";
import { Text, View } from "react-native";

import { Mascot } from "@/components/Mascot";
import { useChatStore } from "@/store/useChatStore";

const EMERGENCY_SYMPTOMS = ["Chest pain", "Difficulty breathing"];

export default function AnalyzingScreen() {
  const selectedSymptoms = useChatStore((state) => state.symptomDraft?.selectedSymptoms ?? []);

  useEffect(() => {
    const isEmergency = selectedSymptoms.some((symptom) => EMERGENCY_SYMPTOMS.includes(symptom));
    const timeout = setTimeout(() => {
      router.replace(isEmergency ? "/emergency" : "/symptom-check/result");
    }, 2300);
    return () => clearTimeout(timeout);
  }, [selectedSymptoms]);

  return (
    <View className="flex-1 items-center justify-center gap-4 bg-bg-page px-6">
      <Mascot pose="thinking" size={120} />
      <Text className="font-poppins-semibold text-xl text-primary-dark">Thinking it through…</Text>
    </View>
  );
}
