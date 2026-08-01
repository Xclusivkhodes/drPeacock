import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";

import { ActionButton } from "@/components/ActionButton";
import { FacilityCard } from "@/components/FacilityCard";
import { Mascot } from "@/components/Mascot";
import { FACILITIES } from "@/data/facilities";
import type { Facility } from "@/data/types";
import { buildDirectionsParams } from "@/lib/directions";
import { fetchNearbyFacilities, getCurrentCoords } from "@/lib/places";
import { useProfileStore } from "@/store/useProfileStore";

const cardShadow = { shadowColor: "#0D47A1", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.07, shadowRadius: 18 };

export default function HomeScreen() {
  const profile = useProfileStore((state) => state.profile);

  const [nearbyFacilities, setNearbyFacilities] = useState<Facility[]>(() => FACILITIES.General.slice(0, 1));
  const [locationLoading, setLocationLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const coords = await getCurrentCoords();
        if (!coords) throw new Error("Location permission denied");
        const facilities = await fetchNearbyFacilities(coords, 3);
        if (!cancelled && facilities.length > 0) {
          setNearbyFacilities(facilities);
        }
      } catch (error) {
        // Keep the static fallback above — Overpass/location failures
        // shouldn't leave "Near you now" empty or broken.
        console.warn("Failed to load nearby facilities, using fallback:", error);
      } finally {
        if (!cancelled) setLocationLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const firstName = profile?.name?.trim().split(" ")[0] || "there";
  const initials =
    (profile?.name ?? "")
      .split(" ")
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";

  return (
    <View className="flex-1 bg-bg-page">
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 62, paddingBottom: 32 }}>
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="font-poppins-medium text-[13px] text-[rgba(45,55,72,0.5)]">Good morning</Text>
            <Text className="mt-0.5 font-poppins-bold text-[22px] tracking-[-0.5px] text-primary-dark">{firstName}</Text>
          </View>

          <View className="flex-row items-center gap-2">
            <Pressable onPress={() => router.push("/emergency")} className="h-10 items-center justify-center rounded-xl bg-[#FFE5E3] px-3.5">
              <Text className="font-poppins-bold text-xs text-danger-dark">SOS</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push("/(tabs)/profile")}
              className="h-[42px] w-[42px] items-center justify-center rounded-2xl bg-primary-dark"
            >
              <Text className="font-poppins-semibold text-sm text-white">{initials}</Text>
            </Pressable>
          </View>
        </View>

        <Pressable onPress={() => router.push("/(tabs)/chat")} className="mt-4">
          <LinearGradient
            colors={["#0D47A1", "#1565C0", "#26A69A"]}
            locations={[0, 0.62, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 24, padding: 18, overflow: "hidden" }}
          >
            <View className="flex-row items-end gap-1">
              <View className="flex-1 pb-1">
                <Text className="font-poppins-semibold text-[11px] uppercase tracking-[1.2px] text-white/70">Dr. Peacock</Text>
                <Text className="mt-2 font-poppins-semibold text-[19px] leading-[25px] tracking-[-0.3px] text-white">
                  How are you feeling today? Tell me in your own words.
                </Text>
                <View className="mt-3.5 flex-row items-center self-start gap-2 rounded-xl border border-white/25 bg-white/15 px-3.5 py-2.5">
                  <Text className="font-poppins-semibold text-[13px] text-white">Start a conversation</Text>
                </View>
              </View>
              <View className="-mb-8 -mr-3 h-[130px] w-[86px]">
                <Mascot pose="confident" width={86} height={130} />
              </View>
            </View>
          </LinearGradient>
        </Pressable>

        <View className="mt-[18px] gap-2.5">
          <View className="flex-row gap-2.5">
            <ActionButton
              icon="plus"
              iconColor="#1565C0"
              iconBg="#E3EFFB"
              label="Check symptoms"
              subtitle="Text, voice or a photo"
              onPress={() => router.push("/symptom-check/symptoms")}
            />
            <ActionButton
              icon="map-marker-radius"
              iconColor="#26A69A"
              iconBg="#E0F2F1"
              label="Find care"
              subtitle="Right facility, not just near"
              onPress={() => router.push("/(tabs)/care")}
            />
          </View>
          <View className="flex-row gap-2.5">
            <ActionButton
              icon="forum-outline"
              iconColor="#43A047"
              iconBg="#E7F6E8"
              label="Ask a question"
              subtitle="Prescriptions, terms, prep"
              onPress={() => router.push("/(tabs)/chat")}
            />
            <ActionButton
              icon="file-document-outline"
              iconColor="#F9A825"
              iconBg="#FFF4DE"
              label="Health record"
              subtitle="Profile, history, meds"
              onPress={() => router.push("/(tabs)/profile")}
            />
          </View>
        </View>

        <View className="mt-[18px] flex-row items-center gap-2.5 rounded-[20px] bg-bg-card p-3" style={cardShadow}>
          <View className="h-[70px] w-[56px]">
            <Mascot pose="reminder" width={56} height={70} />
          </View>
          <View className="flex-1">
            <Text className="font-poppins-semibold text-[14.5px] text-ink">Coartem — 2 tablets</Text>
            <Text className="mt-0.5 font-poppins text-[12.5px] text-[rgba(45,55,72,0.5)]">Today, 8:00 PM · with food</Text>
          </View>
          <Pressable onPress={() => router.push("/celebrate")} className="rounded-xl bg-[#E7F6E8] px-3.5 py-2.5">
            <Text className="font-poppins-semibold text-[13px] text-success-dark">Taken</Text>
          </Pressable>
        </View>

        <View className="mt-5 flex-row items-baseline justify-between">
          <Text className="font-poppins-semibold text-[17px] text-primary-dark">Near you now</Text>
          <Pressable onPress={() => router.push("/(tabs)/care")}>
            <Text className="font-poppins-semibold text-[13px] text-primary">See all</Text>
          </Pressable>
        </View>
        {locationLoading && (
          <View className="mt-2.5 flex-row items-center gap-2">
            <ActivityIndicator size="small" color="#1565C0" />
            <Text className="font-poppins-medium text-xs text-muted">Finding facilities near you…</Text>
          </View>
        )}
        <View className="mt-2.5 gap-2.5">
          {nearbyFacilities.map((facility) => (
            <FacilityCard
              key={facility.name}
              facility={facility}
              onPress={() => router.push({ pathname: "/directions", params: buildDirectionsParams(facility) })}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
