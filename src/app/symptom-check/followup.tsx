import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

import { Mascot } from "@/components/Mascot";
import { FOLLOW_UP_QUESTIONS } from "@/data/symptoms";
import { useChatStore } from "@/store/useChatStore";

export default function FollowupScreen() {
  const symptomDraft = useChatStore((state) => state.symptomDraft);
  const setSymptomDraft = useChatStore((state) => state.setSymptomDraft);
  const answers = symptomDraft?.answers ?? {};

  const selectAnswer = (key: string, value: string) => {
    setSymptomDraft({
      symptomText: symptomDraft?.symptomText ?? "",
      selectedSymptoms: symptomDraft?.selectedSymptoms ?? [],
      answers: { ...answers, [key]: value },
    });
  };

  return (
    <View className="flex-1 gap-4 bg-bg-page px-6 pt-16">
      <Pressable onPress={() => router.back()}>
        <Text className="font-poppins-medium text-primary-dark">Back</Text>
      </Pressable>
      <Text className="font-poppins-medium text-xs uppercase text-neutral-400">Step 2 of 3</Text>

      <View className="flex-row items-center gap-3">
        <Mascot pose="checking" size={56} />
        <Text className="flex-1 font-poppins-semibold text-lg text-primary-dark">A few follow-ups</Text>
      </View>

      <ScrollView contentContainerClassName="gap-4">
        {FOLLOW_UP_QUESTIONS.map((question) => (
          <View key={question.key} className="gap-2 rounded-card bg-bg-card p-4">
            <Text className="font-poppins-medium text-primary-dark">{question.label}</Text>
            <View className="flex-row flex-wrap gap-2">
              {question.options.map((option) => {
                const isSelected = answers[question.key] === option;
                return (
                  <Pressable
                    key={option}
                    onPress={() => selectAnswer(question.key, option)}
                    className={`rounded-chip px-3 py-2 ${isSelected ? "bg-primary" : "bg-chip-inactive"}`}
                  >
                    <Text className={`font-poppins-medium text-sm ${isSelected ? "text-white" : "text-primary-dark"}`}>
                      {option}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>

      <Pressable
        onPress={() => router.push("/symptom-check/analyzing")}
        className="items-center rounded-card bg-primary py-4"
      >
        <Text className="font-poppins-semibold text-white">Ask Dr. Peacock</Text>
      </Pressable>
    </View>
  );
}
