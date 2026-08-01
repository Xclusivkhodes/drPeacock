import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { Mascot } from "@/components/Mascot";
import { buildFallbackBaseline } from "@/data/healthBaseline";
import type { BaselineCard, Sex, UserProfile } from "@/data/types";
import { generateHealthBaseline } from "@/lib/gemma";
import { useProfileStore } from "@/store/useProfileStore";
import { useSettingsStore } from "@/store/useSettingsStore";

const SEX_LABEL_TO_VALUE: Record<string, Sex> = {
  Female: "female",
  Male: "male",
  "Prefer not to say": "prefer_not_to_say",
};

interface DraftProfile {
  name: string;
  age: string;
  city: string;
  sex: string;
  heightCm: number;
  weightKg: number;
  bloodGroup: string;
  conditions: string[];
  pregnancy: string;
  allergies: string[];
  meds: string;
  smoking: string;
  alcohol: string;
  activity: string;
  sleep: string;
  family: string[];
  consentStore: boolean;
  consentShare: boolean;
}

const DEFAULT_DRAFT: DraftProfile = {
  name: "",
  age: "",
  city: "",
  sex: "",
  heightCm: 164,
  weightKg: 62,
  bloodGroup: "",
  conditions: [],
  pregnancy: "",
  allergies: [],
  meds: "",
  smoking: "",
  alcohol: "",
  activity: "",
  sleep: "",
  family: [],
  consentStore: true,
  consentShare: false,
};

const LANGUAGES = ["English", "Twi", "Ewe", "Ga", "Hausa", "Dagbani"];

type StepFields = "identity" | "body" | "meds" | "consent" | undefined;

const STEP_META: { fields: StepFields; cta: string; bubble: string; title: string; sub: string }[] = [
  {
    fields: "identity",
    cta: "Continue",
    bubble: "Let's start with the basics — 2 minutes, and my advice gets far sharper.",
    title: "Who you are",
    sub: "Your age and where you live change which illnesses are likely.",
  },
  {
    fields: "body",
    cta: "Continue",
    bubble: "Height and weight let me judge doses and fever thresholds.",
    title: "Your body",
    sub: "I use this to spot doses that are wrong for your build.",
  },
  {
    fields: undefined,
    cta: "Continue",
    bubble: "This is the part that changes my advice the most.",
    title: "Ongoing conditions",
    sub: "Anything a health worker has told you that you have.",
  },
  {
    fields: "meds",
    cta: "Continue",
    bubble: "I will never suggest something you react to.",
    title: "Allergies & medicines",
    sub: "Reactions and current medicines, so nothing clashes.",
  },
  {
    fields: undefined,
    cta: "Continue",
    bubble: "No judgement — habits shape risk as much as history does.",
    title: "Daily life",
    sub: "Four quick taps. This tunes how urgent I make things.",
  },
  {
    fields: undefined,
    cta: "Continue",
    bubble: "Blood relatives only — parents, siblings, children.",
    title: "Family history",
    sub: "Conditions that run in your family bring screening forward.",
  },
  {
    fields: "consent",
    cta: "Build my profile",
    bubble: "You stay in control of everything I keep.",
    title: "Language & consent",
    sub: "How I speak to you, and what I am allowed to store.",
  },
];

const cardShadow = { shadowColor: "#0D47A1", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 14 };

function getBmiBand(bmi: number) {
  if (bmi < 18.5) return "Below healthy range";
  if (bmi < 25) return "Healthy range";
  if (bmi < 30) return "Above healthy range";
  return "High — worth a check";
}

function withoutNone(list: string[]) {
  return list.filter((item) => !item.startsWith("None"));
}

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className={`rounded-[13px] px-[15px] py-2.5 ${selected ? "bg-primary" : "border border-[#E3E9F2] bg-bg-card"}`}
    >
      <Text className={`font-poppins-semibold text-[13.5px] ${selected ? "text-white" : "text-ink"}`}>{label}</Text>
    </Pressable>
  );
}

interface GroupSpec {
  label: string;
  options: string[];
  multi?: boolean;
  value: string | string[];
  onPick: (option: string) => void;
}

function ChipGroup({ label, options, value, multi, onPick }: GroupSpec) {
  const isSelected = (option: string) => (multi ? (value as string[]).includes(option) : value === option);
  return (
    <View className="mt-4">
      <Text className="font-poppins-semibold text-[13px] text-[rgba(45,55,72,0.6)]">{label}</Text>
      <View className="mt-2.5 flex-row flex-wrap gap-2">
        {options.map((option) => (
          <Chip key={option} label={option} selected={isSelected(option)} onPress={() => onPick(option)} />
        ))}
      </View>
    </View>
  );
}

export default function SetupScreen() {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<DraftProfile>(DEFAULT_DRAFT);
  const [language, setLanguageChoice] = useState("English");
  const [baselineCards, setBaselineCards] = useState<BaselineCard[]>([]);
  const [baselineLoading, setBaselineLoading] = useState(false);

  const setProfile = useProfileStore((state) => state.setProfile);
  const completeOnboarding = useProfileStore((state) => state.completeOnboarding);
  const setHealthBaseline = useProfileStore((state) => state.setHealthBaseline);
  const setLanguage = useSettingsStore((state) => state.setLanguage);

  const isSummary = step >= STEP_META.length;
  const currentMeta = STEP_META[step];

  const setField = <K extends keyof DraftProfile>(key: K, value: DraftProfile[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const toggleMulti = (key: "conditions" | "allergies" | "family", value: string) => {
    setDraft((prev) => {
      const cur = prev[key];
      const isNone = value.startsWith("None");
      const next = isNone
        ? cur.includes(value)
          ? []
          : [value]
        : withoutNone(cur.includes(value) ? cur.filter((x) => x !== value) : [...cur, value]);
      return { ...prev, [key]: next };
    });
  };

  const bumpHeight = (delta: number) =>
    setField("heightCm", Math.min(210, Math.max(120, draft.heightCm + delta)));
  const bumpWeight = (delta: number) =>
    setField("weightKg", Math.min(200, Math.max(30, draft.weightKg + delta)));

  const getGroups = (): GroupSpec[] => {
    switch (step) {
      case 0:
        return [{ label: "Sex at birth", options: ["Female", "Male", "Prefer not to say"], value: draft.sex, onPick: (o) => setField("sex", o) }];
      case 1:
        return [
          {
            label: "Blood group",
            options: ["A+", "A−", "B+", "B−", "O+", "O−", "AB+", "AB−", "Not sure"],
            value: draft.bloodGroup,
            onPick: (o) => setField("bloodGroup", o),
          },
        ];
      case 2:
        return [
          {
            label: "Conditions",
            multi: true,
            options: ["Asthma", "Diabetes", "High blood pressure", "Sickle cell", "Epilepsy", "HIV", "Ulcer", "Kidney disease", "None"],
            value: draft.conditions,
            onPick: (o) => toggleMulti("conditions", o),
          },
          {
            label: "Pregnant or breastfeeding?",
            options: ["No", "Pregnant", "Breastfeeding", "Not sure"],
            value: draft.pregnancy,
            onPick: (o) => setField("pregnancy", o),
          },
        ];
      case 3:
        return [
          {
            label: "Allergies",
            multi: true,
            options: ["Penicillin", "Sulfa drugs", "Aspirin", "Peanuts", "Latex", "Dust", "None known"],
            value: draft.allergies,
            onPick: (o) => toggleMulti("allergies", o),
          },
        ];
      case 4:
        return [
          { label: "Smoking", options: ["Never", "Occasionally", "Daily", "Quit"], value: draft.smoking, onPick: (o) => setField("smoking", o) },
          { label: "Alcohol", options: ["Never", "Sometimes", "Weekly", "Daily"], value: draft.alcohol, onPick: (o) => setField("alcohol", o) },
          {
            label: "Activity",
            options: ["Mostly sitting", "Light", "Active", "Very active"],
            value: draft.activity,
            onPick: (o) => setField("activity", o),
          },
          { label: "Sleep", options: ["Under 5h", "5–6h", "7–8h", "Over 8h"], value: draft.sleep, onPick: (o) => setField("sleep", o) },
        ];
      case 5:
        return [
          {
            label: "In my close family",
            multi: true,
            options: ["Diabetes", "High blood pressure", "Heart disease", "Stroke", "Cancer", "Sickle cell", "Asthma", "None"],
            value: draft.family,
            onPick: (o) => toggleMulti("family", o),
          },
        ];
      case 6:
        return [{ label: "Preferred language", options: LANGUAGES, value: language, onPick: (o) => setLanguageChoice(o) }];
      default:
        return [];
    }
  };

  const saveProfile = (): UserProfile => {
    const profile: UserProfile = {
      name: draft.name.trim(),
      age: Number(draft.age) || 0,
      city: draft.city.trim(),
      sex: draft.sex ? SEX_LABEL_TO_VALUE[draft.sex] : undefined,
      heightCm: draft.heightCm,
      weightKg: draft.weightKg,
      bloodGroup: draft.bloodGroup || undefined,
      conditions: draft.conditions,
      pregnancy: draft.pregnancy || undefined,
      allergies: draft.allergies,
      meds: draft.meds || undefined,
      smoking: draft.smoking || undefined,
      alcohol: draft.alcohol || undefined,
      activity: draft.activity || undefined,
      sleep: draft.sleep || undefined,
      family: draft.family,
      consentStore: draft.consentStore,
      consentShare: draft.consentShare,
    };
    setProfile(profile);
    setLanguage(language);
    completeOnboarding();
    return profile;
  };

  const handleNext = () => {
    if (isSummary) {
      router.replace("/(tabs)");
      return;
    }
    if (step === STEP_META.length - 1) {
      const profile = saveProfile();
      // Show the instant offline baseline right away, then swap in the cloud
      // AI's personalized cards the moment app/api/baseline+api.ts responds.
      setBaselineCards(buildFallbackBaseline(profile));
      setBaselineLoading(true);
      generateHealthBaseline(profile, language)
        .then((cards) => {
          setBaselineCards(cards);
          setHealthBaseline(cards);
        })
        .finally(() => setBaselineLoading(false));
    }
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step === 0) {
      router.back();
      return;
    }
    setStep((s) => s - 1);
  };

  const handleSkip = () => {
    saveProfile();
    router.replace("/(tabs)");
  };

  const setupPct = isSummary ? 100 : Math.round(((step + 1) / (STEP_META.length + 1)) * 100);
  const stepLabel = isSummary ? "Profile ready" : `Step ${step + 1} of ${STEP_META.length}`;
  const cta = isSummary ? "Start using Dr. Peacock" : currentMeta.cta;
  const skipLabel = isSummary ? "Review later" : "Skip for now";

  return (
    <KeyboardAvoidingView className="flex-1 bg-bg-page" behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 58, paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
      >
        <View className="flex-row items-center gap-3">
          <Pressable
            onPress={handleBack}
            className="h-[38px] w-[38px] items-center justify-center rounded-xl bg-bg-card"
            style={{ shadowColor: "#0D47A1", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.07, shadowRadius: 12 }}
          >
            <MaterialCommunityIcons name="chevron-left" size={20} color="#0D47A1" />
          </Pressable>
          <View className="h-1.5 flex-1 overflow-hidden rounded-pill bg-[#E3E9F2]">
            <LinearGradient
              colors={["#1565C0", "#26A69A"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ height: "100%", width: `${setupPct}%`, borderRadius: 99 }}
            />
          </View>
          <Text className="font-poppins-semibold text-[11px] uppercase tracking-wide text-faint">{stepLabel}</Text>
        </View>

        <View className="mt-3.5 flex-row items-end gap-2.5">
          <View className="h-[88px] w-[72px]">
            <Mascot pose="caring" width={72} height={88} />
          </View>
          <View
            className="flex-1 rounded-tl-[18px] rounded-tr-[18px] rounded-bl-[4px] rounded-br-[18px] bg-bg-card px-4 py-3"
            style={{ shadowColor: "#0D47A1", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.07, shadowRadius: 18 }}
          >
            <Text className="font-poppins text-[13.5px] leading-[19px] text-ink">
              {isSummary ? "You stay in control of everything I keep." : currentMeta.bubble}
            </Text>
          </View>
        </View>

        {!isSummary && (
          <>
            <Text className="mt-[18px] font-poppins-bold text-[26px] leading-[30px] tracking-[-0.7px] text-primary-dark">
              {currentMeta.title}
            </Text>
            <Text className="mt-1.5 font-poppins text-[13.5px] leading-5 text-[rgba(45,55,72,0.55)]">{currentMeta.sub}</Text>

            {currentMeta.fields === "identity" && (
              <View className="mt-4 gap-2.5">
                <View className="rounded-2xl bg-bg-card px-4 py-3.5" style={cardShadow}>
                  <Text className="font-poppins-semibold text-[11px] uppercase tracking-wide text-faint">Full name</Text>
                  <TextInput
                    value={draft.name}
                    onChangeText={(v) => setField("name", v)}
                    placeholder="Your name"
                    placeholderTextColor="#94A3B8"
                    className="mt-1 font-poppins-semibold text-base text-ink"
                  />
                </View>
                <View className="flex-row gap-2.5">
                  <View className="flex-1 rounded-2xl bg-bg-card px-4 py-3.5" style={cardShadow}>
                    <Text className="font-poppins-semibold text-[11px] uppercase tracking-wide text-faint">Age</Text>
                    <TextInput
                      value={draft.age}
                      onChangeText={(v) => setField("age", v)}
                      keyboardType="number-pad"
                      className="mt-1 font-poppins-semibold text-base text-ink"
                    />
                  </View>
                  <View className="flex-[1.5] rounded-2xl bg-bg-card px-4 py-3.5" style={cardShadow}>
                    <Text className="font-poppins-semibold text-[11px] uppercase tracking-wide text-faint">Town or city</Text>
                    <TextInput
                      value={draft.city}
                      onChangeText={(v) => setField("city", v)}
                      className="mt-1 font-poppins-semibold text-base text-ink"
                    />
                  </View>
                </View>
              </View>
            )}

            {currentMeta.fields === "body" && (
              <View className="mt-4 gap-2.5">
                <View className="flex-row items-center gap-3 rounded-2xl bg-bg-card px-4 py-3.5" style={cardShadow}>
                  <View className="flex-1">
                    <Text className="font-poppins-semibold text-[11px] uppercase tracking-wide text-faint">Height</Text>
                    <Text className="mt-[3px] font-poppins-semibold text-lg text-ink">{draft.heightCm} cm</Text>
                  </View>
                  <Pressable onPress={() => bumpHeight(-1)} className="h-10 w-10 items-center justify-center rounded-[13px] bg-chip-inactive">
                    <Text className="font-poppins-semibold text-lg text-primary-dark">−</Text>
                  </Pressable>
                  <Pressable onPress={() => bumpHeight(1)} className="h-10 w-10 items-center justify-center rounded-[13px] bg-[#E3EFFB]">
                    <Text className="font-poppins-semibold text-lg text-primary-dark">+</Text>
                  </Pressable>
                </View>
                <View className="flex-row items-center gap-3 rounded-2xl bg-bg-card px-4 py-3.5" style={cardShadow}>
                  <View className="flex-1">
                    <Text className="font-poppins-semibold text-[11px] uppercase tracking-wide text-faint">Weight</Text>
                    <Text className="mt-[3px] font-poppins-semibold text-lg text-ink">{draft.weightKg} kg</Text>
                  </View>
                  <Pressable onPress={() => bumpWeight(-1)} className="h-10 w-10 items-center justify-center rounded-[13px] bg-chip-inactive">
                    <Text className="font-poppins-semibold text-lg text-primary-dark">−</Text>
                  </Pressable>
                  <Pressable onPress={() => bumpWeight(1)} className="h-10 w-10 items-center justify-center rounded-[13px] bg-[#E3EFFB]">
                    <Text className="font-poppins-semibold text-lg text-primary-dark">+</Text>
                  </Pressable>
                </View>
                <View className="flex-row items-center gap-2 px-1">
                  <View className="rounded-[9px] bg-info-bg px-2.5 py-[5px]">
                    <Text className="font-poppins-semibold text-xs text-info-text">
                      BMI {(draft.weightKg / Math.pow(draft.heightCm / 100, 2)).toFixed(1)}
                    </Text>
                  </View>
                  <Text className="font-poppins-medium text-[12.5px] text-[rgba(45,55,72,0.55)]">
                    {getBmiBand(draft.weightKg / Math.pow(draft.heightCm / 100, 2))}
                  </Text>
                </View>
              </View>
            )}

            <View className="mt-[18px] gap-4">
              {getGroups().map((group) => (
                <ChipGroup key={group.label} {...group} />
              ))}
            </View>

            {currentMeta.fields === "meds" && (
              <View className="mt-4 rounded-2xl bg-bg-card px-4 py-3.5" style={cardShadow}>
                <Text className="font-poppins-semibold text-[11px] uppercase tracking-wide text-faint">Medicines you take now</Text>
                <TextInput
                  value={draft.meds}
                  onChangeText={(v) => setField("meds", v)}
                  placeholder="e.g. Salbutamol inhaler, as needed"
                  placeholderTextColor="#94A3B8"
                  className="mt-1 font-poppins-medium text-[15px] text-ink"
                />
              </View>
            )}

            {currentMeta.fields === "consent" && (
              <View className="mt-4 gap-2.5">
                <Pressable
                  onPress={() => setField("consentStore", !draft.consentStore)}
                  className="flex-row items-center gap-3 rounded-2xl bg-bg-card px-4 py-3.5"
                  style={cardShadow}
                >
                  <View className="flex-1">
                    <Text className="font-poppins-semibold text-[14.5px] text-ink">Keep my record on this phone</Text>
                    <Text className="mt-0.5 font-poppins text-[12.5px] leading-[17px] text-[rgba(45,55,72,0.5)]">
                      Encrypted, works offline, never sold.
                    </Text>
                  </View>
                  <View
                    className={`h-7 w-[46px] flex-none flex-row items-center rounded-pill p-[3px] ${
                      draft.consentStore ? "justify-end bg-success" : "justify-start bg-[#DDE4EE]"
                    }`}
                  >
                    <View className="h-[22px] w-[22px] rounded-pill bg-white" />
                  </View>
                </Pressable>
                <Pressable
                  onPress={() => setField("consentShare", !draft.consentShare)}
                  className="flex-row items-center gap-3 rounded-2xl bg-bg-card px-4 py-3.5"
                  style={cardShadow}
                >
                  <View className="flex-1">
                    <Text className="font-poppins-semibold text-[14.5px] text-ink">Share a summary with clinics I visit</Text>
                    <Text className="mt-0.5 font-poppins text-[12.5px] leading-[17px] text-[rgba(45,55,72,0.5)]">
                      Only when you tap share at the facility.
                    </Text>
                  </View>
                  <View
                    className={`h-7 w-[46px] flex-none flex-row items-center rounded-pill p-[3px] ${
                      draft.consentShare ? "justify-end bg-success" : "justify-start bg-[#DDE4EE]"
                    }`}
                  >
                    <View className="h-[22px] w-[22px] rounded-pill bg-white" />
                  </View>
                </Pressable>
              </View>
            )}
          </>
        )}

        {isSummary && (
          <View>
            <View className="mt-1.5 flex-row items-end gap-1.5">
              <View className="flex-1 pb-2.5">
                <Text className="font-poppins-bold text-[27px] leading-[30px] tracking-[-0.8px] text-primary-dark">
                  Your profile is{"\n"}ready, {draft.name.trim().split(" ")[0] || "friend"}
                </Text>
                <Text className="mt-2 font-poppins text-[13.5px] leading-5 text-[rgba(45,55,72,0.58)]">
                  Here&apos;s what changes now that I know you.
                </Text>
              </View>
              <View className="h-[210px] w-[118px] flex-none" style={{ marginRight: -10 }}>
                <Mascot pose="celebrating" width={118} height={210} />
              </View>
            </View>

            {baselineLoading && (
              <View className="mt-2 flex-row items-center gap-2 px-1">
                <ActivityIndicator size="small" color="#1565C0" />
                <Text className="font-poppins-medium text-[12.5px] text-[rgba(45,55,72,0.55)]">
                  Personalizing your baseline with Dr. Peacock AI…
                </Text>
              </View>
            )}

            <View className="mt-2 gap-2.5">
              {baselineCards.map((item) => (
                <View key={item.title} className="rounded-[18px] bg-bg-card px-4 py-3.5" style={{ shadowColor: "#0D47A1", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.07, shadowRadius: 18 }}>
                  <Text className="font-poppins-semibold text-[14.5px] text-primary-dark">{item.title}</Text>
                  <Text className="mt-1 font-poppins text-[13px] leading-5 text-[rgba(45,55,72,0.6)]">{item.desc}</Text>
                </View>
              ))}
            </View>

            <View className="mt-3 rounded-2xl bg-info-bg px-4 py-3.5">
              <Text className="font-poppins text-[12.5px] leading-5 text-info-text">
                You can change any of this later in your health record — and delete everything in one tap.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View className="px-5 pb-8 pt-3">
        <Pressable
          onPress={handleNext}
          className="items-center rounded-card bg-primary py-4"
          style={{ shadowColor: "#1565C0", shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.24, shadowRadius: 24 }}
        >
          <Text className="font-poppins-semibold text-base text-white">{cta}</Text>
        </Pressable>
        <Pressable onPress={handleSkip} className="mt-2.5 items-center py-1">
          <Text className="font-poppins-semibold text-[13.5px] text-faint">{skipLabel}</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
