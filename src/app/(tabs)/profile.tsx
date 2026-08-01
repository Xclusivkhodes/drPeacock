import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Share, Text, View } from "react-native";

import { Mascot } from "@/components/Mascot";
import { RecordEditModal, type RecordEditField } from "@/components/RecordEditModal";
import type { UserProfile } from "@/data/types";
import { buildRecordSummary, calculateBmi, formatList } from "@/lib/recordSummary";
import { useProfileStore } from "@/store/useProfileStore";
import { useSettingsStore } from "@/store/useSettingsStore";

const cardShadow = { shadowColor: "#0D47A1", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.07, shadowRadius: 18 };

type SectionKey = "allergies" | "conditions" | "meds" | "vitals" | "lifestyle" | "family" | "visits" | "languages";

const SECTION_TITLES: Record<SectionKey, string> = {
  allergies: "Edit allergies",
  conditions: "Edit existing conditions",
  meds: "Edit medications",
  vitals: "Edit body & vitals",
  lifestyle: "Edit lifestyle",
  family: "Edit family history",
  visits: "Edit recent visits",
  languages: "Edit languages",
};

function isFilled(value: unknown): boolean {
  if (Array.isArray(value)) return value.length > 0;
  return value !== undefined && value !== null && value !== "";
}

function calculateCompleteness(profile: UserProfile | null): number {
  if (!profile) return 0;
  const fields = [
    profile.sex,
    profile.heightCm,
    profile.weightKg,
    profile.bloodGroup,
    profile.conditions,
    profile.pregnancy,
    profile.allergies,
    profile.meds,
    profile.smoking,
    profile.alcohol,
    profile.activity,
    profile.sleep,
    profile.family,
    profile.recentVisits,
  ];
  const filled = fields.filter(isFilled).length;
  return Math.round((filled / fields.length) * 100);
}

function toNumberOrUndefined(text: string): number | undefined {
  const trimmed = text.trim();
  if (!trimmed) return undefined;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : undefined;
}

function toList(text: string): string[] {
  return text
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function ProfileScreen() {
  const profile = useProfileStore((state) => state.profile);
  const setProfile = useProfileStore((state) => state.setProfile);
  const resetProfile = useProfileStore((state) => state.reset);
  const language = useSettingsStore((state) => state.language);
  const setLanguage = useSettingsStore((state) => state.setLanguage);

  const [editingSection, setEditingSection] = useState<SectionKey | null>(null);

  const patientName = profile?.name || "Guest";
  const initials =
    (profile?.name ?? "")
      .split(" ")
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";
  const profileLine = [profile?.age, profile?.sex, profile?.city, language].filter(Boolean).join(" · ");

  const completeness = calculateCompleteness(profile);
  const completenessNote = profile?.recentVisits ? "Your profile is fully up to date." : "Add past visits to\nimprove advice";

  const bmi = calculateBmi(profile?.heightCm, profile?.weightKg);
  const vitalsValue =
    [
      profile?.heightCm ? `${profile.heightCm} cm` : null,
      profile?.weightKg ? `${profile.weightKg} kg` : null,
      bmi ? `BMI ${bmi}` : null,
      profile?.bloodGroup ? `blood ${profile.bloodGroup}` : null,
    ]
      .filter(Boolean)
      .join(" · ") || "Not provided";

  const lifestyleValue =
    [
      profile?.smoking ? `${profile.smoking} smoking` : null,
      profile?.alcohol ? `${profile.alcohol} alcohol` : null,
      profile?.activity ?? null,
      profile?.sleep ? `${profile.sleep} sleep` : null,
    ]
      .filter(Boolean)
      .join(" · ") || "Not provided";

  const sections: { key: SectionKey; label: string; value: string }[] = [
    { key: "allergies", label: "Allergies", value: formatList(profile?.allergies) },
    { key: "conditions", label: "Existing conditions", value: formatList(profile?.conditions, "None recorded") },
    { key: "meds", label: "Medications", value: profile?.meds || "None recorded" },
    { key: "vitals", label: "Body & vitals", value: vitalsValue },
    { key: "lifestyle", label: "Lifestyle", value: lifestyleValue },
    { key: "family", label: "Family history", value: formatList(profile?.family, "None reported") },
    { key: "visits", label: "Recent visits", value: profile?.recentVisits || "No visits recorded yet" },
    { key: "languages", label: "Languages", value: `${language} · Twi` },
  ];

  const getEditFields = (key: SectionKey): RecordEditField[] => {
    switch (key) {
      case "allergies":
        return [
          {
            key: "allergies",
            label: "Allergies (comma separated)",
            value: (profile?.allergies ?? []).join(", "),
            placeholder: "e.g. Penicillin, Peanuts",
          },
        ];
      case "conditions":
        return [
          {
            key: "conditions",
            label: "Existing conditions (comma separated)",
            value: (profile?.conditions ?? []).join(", "),
            placeholder: "e.g. Asthma, Diabetes",
          },
        ];
      case "meds":
        return [
          { key: "meds", label: "Medications", value: profile?.meds ?? "", placeholder: "e.g. Salbutamol inhaler, as needed", multiline: true },
        ];
      case "vitals":
        return [
          { key: "heightCm", label: "Height (cm)", value: profile?.heightCm ? String(profile.heightCm) : "", keyboardType: "numeric" },
          { key: "weightKg", label: "Weight (kg)", value: profile?.weightKg ? String(profile.weightKg) : "", keyboardType: "numeric" },
          { key: "bloodGroup", label: "Blood group", value: profile?.bloodGroup ?? "", placeholder: "e.g. O+" },
        ];
      case "lifestyle":
        return [
          { key: "smoking", label: "Smoking", value: profile?.smoking ?? "" },
          { key: "alcohol", label: "Alcohol", value: profile?.alcohol ?? "" },
          { key: "activity", label: "Activity", value: profile?.activity ?? "" },
          { key: "sleep", label: "Sleep", value: profile?.sleep ?? "" },
        ];
      case "family":
        return [
          {
            key: "family",
            label: "Family history (comma separated)",
            value: (profile?.family ?? []).join(", "),
            placeholder: "e.g. Diabetes, High blood pressure",
          },
        ];
      case "visits":
        return [{ key: "recentVisits", label: "Recent visits", value: profile?.recentVisits ?? "", placeholder: "e.g. Ridge Hospital · 12 May 2026" }];
      case "languages":
        return [{ key: "language", label: "Preferred language", value: language }];
    }
  };

  const handleSaveEdit = (values: Record<string, string>) => {
    if (editingSection === "languages") {
      if (values.language?.trim()) setLanguage(values.language.trim());
      return;
    }
    if (!profile || !editingSection) return;

    switch (editingSection) {
      case "allergies":
        setProfile({ ...profile, allergies: toList(values.allergies ?? "") });
        break;
      case "conditions":
        setProfile({ ...profile, conditions: toList(values.conditions ?? "") });
        break;
      case "meds":
        setProfile({ ...profile, meds: values.meds ?? "" });
        break;
      case "vitals":
        setProfile({
          ...profile,
          heightCm: toNumberOrUndefined(values.heightCm ?? ""),
          weightKg: toNumberOrUndefined(values.weightKg ?? ""),
          bloodGroup: values.bloodGroup?.trim() || undefined,
        });
        break;
      case "lifestyle":
        setProfile({
          ...profile,
          smoking: values.smoking?.trim() || undefined,
          alcohol: values.alcohol?.trim() || undefined,
          activity: values.activity?.trim() || undefined,
          sleep: values.sleep?.trim() || undefined,
        });
        break;
      case "family":
        setProfile({ ...profile, family: toList(values.family ?? "") });
        break;
      case "visits":
        setProfile({ ...profile, recentVisits: values.recentVisits?.trim() || undefined });
        break;
    }
  };

  const handleShare = async () => {
    const message = buildRecordSummary(profile, language);
    try {
      await Share.share({ message, title: "Health record" });
    } catch (error) {
      console.warn("Failed to share health record:", error);
    }
  };

  const handleRestartDemo = () => {
    resetProfile();
    router.replace("/(auth)/welcome");
  };

  return (
    <View className="flex-1 bg-bg-page">
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 62, paddingBottom: 32 }}>
        <View className="flex-row items-center gap-3">
          <View className="h-14 w-14 items-center justify-center rounded-[18px] bg-primary-dark">
            <Text className="font-poppins-semibold text-[19px] text-white">{initials}</Text>
          </View>
          <View className="flex-1">
            <Text className="font-poppins-bold text-[22px] tracking-[-0.5px] text-primary-dark">{patientName}</Text>
            <Text className="mt-0.5 font-poppins-medium text-[13px] text-[rgba(45,55,72,0.5)]">{profileLine}</Text>
          </View>
        </View>

        <LinearGradient
          colors={["#1565C0", "#26A69A"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ marginTop: 16, borderRadius: 20, paddingVertical: 16, paddingLeft: 18, paddingRight: 4, flexDirection: "row", alignItems: "flex-end", gap: 4 }}
        >
          <View style={{ flex: 1, paddingBottom: 4 }}>
            <Text className="font-poppins-semibold text-[11px] uppercase tracking-[1px]" style={{ color: "rgba(255,255,255,0.72)" }}>
              Record completeness
            </Text>
            <View className="mt-2 flex-row items-end gap-2">
              <Text className="font-poppins-bold text-[30px] leading-[30px] text-white">{completeness}%</Text>
              <Text className="pb-1 font-poppins text-[12.5px] leading-[16px]" style={{ color: "rgba(255,255,255,0.82)" }}>
                {completenessNote}
              </Text>
            </View>
            <View style={{ marginTop: 11, height: 7, borderRadius: 99, backgroundColor: "rgba(255,255,255,0.28)", overflow: "hidden" }}>
              <View style={{ width: `${completeness}%`, height: "100%", backgroundColor: "#FFB300" }} />
            </View>
          </View>
          <View style={{ width: 72, height: 132, marginBottom: -16 }}>
            <Mascot pose="confident" width={72} height={132} />
          </View>
        </LinearGradient>

        <View className="mt-3.5 gap-2.5">
          {sections.map((section) => (
            <View key={section.key} className="rounded-[18px] bg-bg-card px-4 py-[15px]" style={cardShadow}>
              <View className="flex-row items-center justify-between gap-2.5">
                <Text className="flex-1 font-poppins-semibold text-[11px] uppercase tracking-[1px] text-faint">{section.label}</Text>
                <Pressable onPress={() => setEditingSection(section.key)}>
                  <Text className="font-poppins-semibold text-[12.5px] text-primary">Edit</Text>
                </Pressable>
              </View>
              <Text className="mt-[7px] font-poppins-medium text-[15px] leading-[21.75px] text-ink">{section.value}</Text>
            </View>
          ))}
        </View>

        <Pressable
          onPress={handleShare}
          className="mt-3.5 h-[54px] items-center justify-center rounded-2xl bg-primary"
          style={{ shadowColor: "#1565C0", shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.24, shadowRadius: 24 }}
        >
          <Text className="font-poppins-semibold text-[15px] text-white">Share record with a facility</Text>
        </Pressable>

        <Pressable onPress={handleRestartDemo} className="mt-[11px] items-center py-2">
          <Text className="font-poppins-semibold text-[13.5px] text-faint">Restart the demo</Text>
        </Pressable>
      </ScrollView>

      <RecordEditModal
        visible={editingSection !== null}
        title={editingSection ? SECTION_TITLES[editingSection] : ""}
        fields={editingSection ? getEditFields(editingSection) : []}
        onClose={() => setEditingSection(null)}
        onSave={handleSaveEdit}
      />
    </View>
  );
}
