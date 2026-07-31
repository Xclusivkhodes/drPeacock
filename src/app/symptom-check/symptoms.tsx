import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

import { Mascot } from "@/components/Mascot";
import { SYMPTOMS } from "@/data/symptoms";
import { useChatStore } from "@/store/useChatStore";

export default function SymptomsScreen() {
  const symptomDraft = useChatStore((state) => state.symptomDraft);
  const setSymptomDraft = useChatStore((state) => state.setSymptomDraft);
  const selected = symptomDraft?.selectedSymptoms ?? [];

  const toggleSymptom = (symptom: string) => {
    const next = selected.includes(symptom)
      ? selected.filter((item) => item !== symptom)
      : [...selected, symptom];
    setSymptomDraft({ symptomText: symptomDraft?.symptomText ?? "", selectedSymptoms: next, answers: {} });
  };

  return (
    <View className="flex-1 gap-4 bg-bg-page px-6 pt-16">
      <Pressable onPress={() => router.back()}>
        <Text className="font-poppins-medium text-primary-dark">Back</Text>
      </Pressable>
      <Text className="font-poppins-medium text-xs uppercase text-neutral-400">Step 1 of 3</Text>

      <View className="flex-row items-center gap-3">
        <Mascot pose="explaining" size={56} />
        <Text className="flex-1 font-poppins text-primary-dark">What are you experiencing?</Text>
      </View>

      <ScrollView contentContainerClassName="flex-row flex-wrap gap-2">
        {SYMPTOMS.map((symptom) => {
          const isSelected = selected.includes(symptom);
          return (
            <Pressable
              key={symptom}
              onPress={() => toggleSymptom(symptom)}
              className={`rounded-chip px-4 py-2 ${isSelected ? "bg-primary" : "bg-chip-inactive"}`}
            >
              <Text className={`font-poppins-medium text-sm ${isSelected ? "text-white" : "text-primary-dark"}`}>
                {symptom}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View className="flex-1" />

      <Pressable
        onPress={() => router.push("/symptom-check/followup")}
        className="items-center rounded-card bg-primary py-4"
      >
        <Text className="font-poppins-semibold text-white">Continue</Text>
      </Pressable>
    </View>
  );
}
