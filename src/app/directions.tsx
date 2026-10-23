import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Linking, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FacilityMap, type FacilityMapHandle } from "@/components/FacilityMap";

import { fetchDirections, type RouteResult } from "@/lib/directions";
import { getCurrentCoords, type Coordinates } from "@/lib/places";

const cardShadow = { shadowColor: "#0D47A1", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.1, shadowRadius: 18 };
const cardShadowUp = { shadowColor: "#0D47A1", shadowOffset: { width: 0, height: -6 }, shadowOpacity: 0.1, shadowRadius: 24 };

export default function DirectionsScreen() {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<FacilityMapHandle>(null);
  const params = useLocalSearchParams<{
    name: string;
    type: string;
    distance: string;
    wait: string;
    cost: string;
    status: string;
    note: string;
    latitude: string;
    longitude: string;
  }>();

  const destination: Coordinates = { latitude: Number(params.latitude), longitude: Number(params.longitude) };

  const [origin, setOrigin] = useState<Coordinates | null>(null);
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const coords = await getCurrentCoords();
        if (!coords) throw new Error("Location permission denied");
        if (cancelled) return;
        setOrigin(coords);
        const result = await fetchDirections(coords, destination);
        if (!cancelled) setRoute(result);
      } catch (error) {
        // No origin/route — the map still shows the destination marker on its
        // own, it just can't draw a path or show a real ETA.
        console.warn("Failed to load directions, showing destination only:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (origin && route && mapRef.current) {
      mapRef.current.fitToCoordinates([origin, destination, ...route.coordinates], {
        edgePadding: { top: 120, right: 60, bottom: 300, left: 60 },
        animated: true,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [origin, route]);

  const handleStartNavigation = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destination.latitude},${destination.longitude}&travelmode=driving`;
    Linking.openURL(url).catch((error) => console.warn("Failed to open navigation app:", error));
  };

  const handleBookInstead = () => {
    router.push("/(tabs)/care");
  };

  return (
    <View style={{ flex: 1 }}>
      <FacilityMap
        ref={mapRef}
        destination={destination}
        destinationTitle={params.name}
        origin={origin}
        route={route?.coordinates ?? null}
      />

      <Pressable
        onPress={() => router.back()}
        className="absolute h-10 w-10 items-center justify-center rounded-2xl bg-bg-card"
        style={[cardShadow, { top: insets.top + 12, left: 18 }]}
      >
        <MaterialCommunityIcons name="chevron-left" size={22} color="#0D47A1" />
      </Pressable>

      <View
        className="absolute flex-row items-center gap-1.5 rounded-full bg-bg-card px-4 py-2.5"
        style={[cardShadow, { top: insets.top + 12, right: 18 }]}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#1565C0" />
        ) : (
          <MaterialCommunityIcons name="clock-outline" size={14} color="#1565C0" />
        )}
        <Text className="font-poppins-bold text-[13.5px] text-primary-dark">{route?.durationText ?? (loading ? "Finding route…" : "—")}</Text>
      </View>

      <View
        className="absolute inset-x-0 bottom-0 gap-3 rounded-t-[28px] bg-bg-card px-5 pt-5"
        style={[cardShadowUp, { paddingBottom: insets.bottom + 20 }]}
      >
        <View className="flex-row items-start justify-between gap-2.5">
          <View className="flex-1">
            <Text className="font-poppins-bold text-[19px] leading-[24px] text-primary-dark">{params.name}</Text>
            <Text className="mt-[3px] font-poppins-medium text-[13px] text-[rgba(45,55,72,0.55)]">{params.type}</Text>
          </View>
          <View className="rounded-[9px] bg-[#E7F6E8] px-2.5 py-[5px]">
            <Text className="font-poppins-semibold text-[11.5px] text-success-dark">{params.status || "Open now"}</Text>
          </View>
        </View>

        <View className="flex-row flex-wrap gap-2">
          <View className="rounded-[9px] bg-chip-inactive px-2.5 py-[5px]">
            <Text className="font-poppins-medium text-[11.5px] text-[rgba(45,55,72,0.62)]">{params.distance}</Text>
          </View>
          <View className="rounded-[9px] bg-chip-inactive px-2.5 py-[5px]">
            <Text className="font-poppins-medium text-[11.5px] text-[rgba(45,55,72,0.62)]">{params.wait}</Text>
          </View>
          <View className="rounded-[9px] bg-chip-inactive px-2.5 py-[5px]">
            <Text className="font-poppins-medium text-[11.5px] text-[rgba(45,55,72,0.62)]">{params.cost}</Text>
          </View>
        </View>

        {params.note ? <Text className="font-poppins text-[12.5px] leading-[18px] text-[rgba(45,55,72,0.55)]">{params.note}</Text> : null}

        <View className="mt-1 flex-row gap-2.5">
          <Pressable onPress={handleStartNavigation} className="h-[52px] flex-1 items-center justify-center rounded-2xl bg-primary">
            <Text className="font-poppins-bold text-[15px] text-white">Start navigation</Text>
          </Pressable>
          <Pressable onPress={handleBookInstead} className="h-[52px] flex-1 items-center justify-center rounded-2xl bg-chip-inactive">
            <Text className="font-poppins-semibold text-[15px] text-primary-dark">Book instead</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
