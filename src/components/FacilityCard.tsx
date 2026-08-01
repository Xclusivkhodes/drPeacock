import { Pressable, Text, View } from "react-native";

import type { Facility } from "@/data/types";

interface FacilityCardProps {
  facility: Facility;
  onPress?: () => void;
  /** "compact" (default) matches the Home Dashboard's preview card exactly.
   * "detailed" adds the match score, chip row, note, and action buttons used
   * on the Care screen's result list. */
  variant?: "compact" | "detailed";
  onDirections?: () => void;
  onBook?: () => void;
}

const cardShadow = { shadowColor: "#0D47A1", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.07, shadowRadius: 18 };

export function FacilityCard({ facility, onPress, variant = "compact", onDirections, onBook }: FacilityCardProps) {
  if (variant === "detailed") {
    return (
      <View className="rounded-[20px] bg-bg-card p-4" style={cardShadow}>
        <View className="flex-row items-start justify-between gap-2.5">
          <View className="flex-1">
            <Text className="font-poppins-semibold text-[15.5px] leading-[19px] text-ink">{facility.name}</Text>
            <Text className="mt-[3px] font-poppins-medium text-[12.5px] text-[rgba(45,55,72,0.5)]">{facility.type}</Text>
          </View>
          <View className="items-end">
            <Text className="font-poppins-bold text-base text-accent-teal">{facility.score}</Text>
            <Text className="font-poppins-semibold text-[10px] tracking-[0.5px] text-[rgba(45,55,72,0.42)]">MATCH</Text>
          </View>
        </View>

        <View className="mt-2.5 flex-row flex-wrap gap-[7px]">
          <View className="rounded-[9px] bg-chip-inactive px-2.5 py-[5px]">
            <Text className="font-poppins-medium text-[11.5px] text-[rgba(45,55,72,0.62)]">{facility.distance}</Text>
          </View>
          <View className="rounded-[9px] bg-chip-inactive px-2.5 py-[5px]">
            <Text className="font-poppins-medium text-[11.5px] text-[rgba(45,55,72,0.62)]">{facility.wait}</Text>
          </View>
          <View className="rounded-[9px] bg-chip-inactive px-2.5 py-[5px]">
            <Text className="font-poppins-medium text-[11.5px] text-[rgba(45,55,72,0.62)]">{facility.cost}</Text>
          </View>
          <View className="rounded-[9px] bg-[#E7F6E8] px-2.5 py-[5px]">
            <Text className="font-poppins-semibold text-[11.5px] text-success-dark">{facility.status}</Text>
          </View>
        </View>

        <Text className="mt-[9px] font-poppins text-[12.5px] leading-[18px] text-[rgba(45,55,72,0.55)]">{facility.note}</Text>

        <View className="mt-[13px] flex-row gap-[9px]">
          <Pressable onPress={onDirections} className="h-11 flex-1 items-center justify-center rounded-[13px] bg-primary">
            <Text className="font-poppins-semibold text-[13.5px] text-white">Directions</Text>
          </Pressable>
          <Pressable onPress={onBook} className="h-11 flex-1 items-center justify-center rounded-[13px] bg-chip-inactive">
            <Text className="font-poppins-semibold text-[13.5px] text-primary-dark">Book</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <Pressable onPress={onPress} className="rounded-[20px] bg-bg-card p-4" style={cardShadow}>
      <View className="flex-row items-start justify-between gap-2.5">
        <Text className="flex-1 font-poppins-semibold text-[15px] leading-[19px] text-ink">{facility.name}</Text>
        <View className="rounded-[9px] bg-[#E7F6E8] px-2.5 py-[5px]">
          <Text className="font-poppins-semibold text-[11px] text-success-dark">{facility.status}</Text>
        </View>
      </View>
      <View className="mt-2 flex-row gap-3.5">
        <Text className="font-poppins-medium text-[12.5px] text-[rgba(45,55,72,0.55)]">{facility.distance}</Text>
        <Text className="font-poppins-medium text-[12.5px] text-[rgba(45,55,72,0.55)]">{facility.wait} wait</Text>
        <Text className="font-poppins-medium text-[12.5px] text-[rgba(45,55,72,0.55)]">{facility.cost} cost</Text>
      </View>
    </Pressable>
  );
}
