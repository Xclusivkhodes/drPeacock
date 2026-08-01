import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { FacilityCard } from "@/components/FacilityCard";
import { Mascot } from "@/components/Mascot";
import { FACILITIES } from "@/data/facilities";
import type { CareType } from "@/data/types";
import { buildDirectionsParams } from "@/lib/directions";

const CARE_TYPES: CareType[] = ["Emergency", "General", "Maternity", "Children", "Dental", "Laboratory", "Pharmacy"];

export default function CareScreen() {
  const [careType, setCareType] = useState<CareType>("General");
  const [search, setSearch] = useState("");

  const careHeading = careType === "General" ? "General consultation" : careType;

  const facilities = useMemo(() => {
    const list = FACILITIES[careType];
    const query = search.trim().toLowerCase();
    if (!query) return list;
    return list.filter((facility) => facility.name.toLowerCase().includes(query));
  }, [careType, search]);

  return (
    <View className="flex-1 bg-bg-page">
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 62, paddingBottom: 26 }}>
        <View className="flex-row items-end gap-2">
          <View className="flex-1">
            <Text className="font-poppins-bold text-[26px] tracking-[-0.7px] text-primary-dark">Find the right care</Text>
            <Text className="mt-[5px] font-poppins text-[13.5px] leading-[19px] text-[rgba(45,55,72,0.55)]">
              Ranked by what you need — not just what&apos;s closest.
            </Text>
          </View>
          <View className="h-[120px] w-[62px]">
            <Mascot pose="checking" width={62} height={120} />
          </View>
        </View>

        <View className="mt-3.5 flex-row items-center gap-[11px] rounded-2xl bg-bg-card px-4 py-3.5" style={{ shadowColor: "#0D47A1", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.07, shadowRadius: 18 }}>
          <MaterialCommunityIcons name="magnify" size={18} color="rgba(45,55,72,0.4)" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Clinic, service or facility name"
            placeholderTextColor="rgba(45,55,72,0.38)"
            className="flex-1 font-poppins text-[15px] text-ink"
          />
        </View>

        <View className="mt-4 flex-row flex-wrap gap-[9px]">
          {CARE_TYPES.map((type) => {
            const isSelected = type === careType;
            return (
              <Pressable
                key={type}
                onPress={() => setCareType(type)}
                className={`rounded-[13px] px-4 py-[11px] ${isSelected ? "bg-primary-dark" : "border border-[#E3E9F2] bg-bg-card"}`}
              >
                <Text className={`font-poppins-semibold text-sm ${isSelected ? "text-white" : "text-ink"}`}>{type}</Text>
              </Pressable>
            );
          })}
        </View>

        <View className="mt-[18px] flex-row items-center gap-2.5">
          <Text className="flex-1 font-poppins-semibold text-[17px] text-primary-dark">{careHeading}</Text>
          <Text className="font-poppins-semibold text-[12.5px] text-accent-teal">Best match first</Text>
        </View>

        <View className="mt-2.5 gap-[11px]">
          {facilities.length === 0 && (
            <Text className="mt-2 font-poppins text-sm text-muted">No facilities match your search yet.</Text>
          )}
          {facilities.map((facility) => (
            <FacilityCard
              key={facility.name}
              facility={facility}
              variant="detailed"
              onDirections={() => router.push({ pathname: "/directions", params: buildDirectionsParams(facility) })}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
