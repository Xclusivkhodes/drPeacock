import { MaterialCommunityIcons } from "@expo/vector-icons";
import { requestRecordingPermissionsAsync } from "expo-audio";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import * as Speech from "expo-speech";
import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { Mascot } from "@/components/Mascot";
import { SYMPTOMS } from "@/data/symptoms";
import { useChatStore } from "@/store/useChatStore";

const cardShadow = { shadowColor: "#0D47A1", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.07, shadowRadius: 18 };

export default function SymptomsScreen() {
  const symptomDraft = useChatStore((state) => state.symptomDraft);
  const setSymptomText = useChatStore((state) => state.setSymptomText);
  const toggleSymptom = useChatStore((state) => state.toggleSymptom);
  const setSymptomPhoto = useChatStore((state) => state.setSymptomPhoto);
  const selected = symptomDraft?.selectedSymptoms ?? [];
  const [isListening, setIsListening] = useState(false);

  const handleSpeakInTwi = async () => {
    const { granted } = await requestRecordingPermissionsAsync();
    if (!granted) {
      Speech.speak("Microphone permission is needed to use voice input.");
      return;
    }
    setIsListening(true);
    Speech.speak("Voice input in Twi is coming soon.");
    setTimeout(() => setIsListening(false), 1500);
  };

  const handlePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") return;
    const result = await ImagePicker.launchCameraAsync({ quality: 0.6, allowsEditing: false });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setSymptomPhoto(result.assets[0].uri);
    }
  };

  return (
    <View className="flex-1 bg-bg-page">
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 58, paddingBottom: 24 }}>
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => router.back()}
            className="h-[38px] w-[38px] items-center justify-center rounded-xl bg-bg-card"
            style={{ shadowColor: "#0D47A1", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.07, shadowRadius: 12 }}
          >
            <MaterialCommunityIcons name="chevron-left" size={20} color="#0D47A1" />
          </Pressable>
          <Text className="font-poppins-semibold text-[11px] uppercase tracking-wide text-faint">Step 1 of 3</Text>
        </View>

        <View className="mt-4 flex-row items-center gap-3">
          <Mascot pose="explaining" width={72} height={88} />
          <View className="flex-1 rounded-tl-[18px] rounded-tr-[18px] rounded-bl-[4px] rounded-br-[18px] bg-bg-card px-4 py-3.5" style={cardShadow}>
            <Text className="font-poppins-semibold text-[16px] text-primary-dark">What are you experiencing?</Text>
          </View>
        </View>

        <View className="mt-4 rounded-2xl bg-bg-card p-4" style={cardShadow}>
          <TextInput
            value={symptomDraft?.symptomText ?? ""}
            onChangeText={setSymptomText}
            placeholder="Fever, Chills · started 2-3 days ago"
            placeholderTextColor="#96650B"
            multiline
            className="font-poppins-medium text-[15px] text-ink"
          />
          <View className="mt-3.5 flex-row gap-2.5">
            <Pressable
              onPress={handleSpeakInTwi}
              className={`flex-row items-center gap-1.5 rounded-xl px-3.5 py-2.5 ${isListening ? "bg-primary" : "bg-[#E3EFFB]"}`}
            >
              <MaterialCommunityIcons name="microphone" size={16} color={isListening ? "#FFFFFF" : "#1565C0"} />
              <Text className={`font-poppins-semibold text-[13px] ${isListening ? "text-white" : "text-primary"}`}>
                {isListening ? "Listening…" : "Speak in Twi"}
              </Text>
            </Pressable>
            <Pressable onPress={handlePhoto} className="flex-row items-center gap-1.5 rounded-xl bg-chip-inactive px-3.5 py-2.5">
              <MaterialCommunityIcons
                name={symptomDraft?.photoUri ? "check-circle" : "camera-outline"}
                size={16}
                color={symptomDraft?.photoUri ? "#2E7D32" : "#2D3748"}
              />
              <Text className={`font-poppins-semibold text-[13px] ${symptomDraft?.photoUri ? "text-success-dark" : "text-ink"}`}>
                {symptomDraft?.photoUri ? "Photo added" : "Photo"}
              </Text>
            </Pressable>
          </View>
        </View>

        <Text className="mt-5 font-poppins-medium text-[13px] text-[rgba(45,55,72,0.55)]">Common where you are</Text>
        <View className="mt-2.5 flex-row flex-wrap gap-2">
          {SYMPTOMS.map((symptom) => {
            const isSelected = selected.includes(symptom);
            return (
              <Pressable
                key={symptom}
                onPress={() => toggleSymptom(symptom)}
                className={`rounded-[13px] px-4 py-2.5 ${isSelected ? "bg-primary" : "border border-[#E3E9F2] bg-bg-card"}`}
              >
                <Text className={`font-poppins-semibold text-[13.5px] ${isSelected ? "text-white" : "text-ink"}`}>{symptom}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View className="px-5 pb-8 pt-3">
        <Pressable
          onPress={() => router.push("/symptom-check/followup")}
          className="items-center rounded-card bg-primary py-4"
          style={{ shadowColor: "#1565C0", shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.24, shadowRadius: 24 }}
        >
          <Text className="font-poppins-semibold text-base text-white">Continue</Text>
        </Pressable>
      </View>
    </View>
  );
}
