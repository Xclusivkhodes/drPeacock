import { forwardRef, useImperativeHandle } from "react";
import { StyleSheet, Text, View } from "react-native";

import type { Coordinates } from "@/lib/places";

export interface FacilityMapHandle {
  fitToCoordinates: (
    coordinates: Coordinates[],
    options: {
      edgePadding: { top: number; right: number; bottom: number; left: number };
      animated: boolean;
    },
  ) => void;
}

interface FacilityMapProps {
  destination: Coordinates;
  destinationTitle?: string;
  origin: Coordinates | null;
  route: Coordinates[] | null;
}

export const FacilityMap = forwardRef<FacilityMapHandle, FacilityMapProps>(function FacilityMap(_props, ref) {
  useImperativeHandle(ref, () => ({
    fitToCoordinates: () => {},
  }));

  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        { alignItems: "center", justifyContent: "center", backgroundColor: "#D6E2F2", paddingHorizontal: 32 },
      ]}
    >
      <Text className="text-center font-poppins-medium text-[15px] leading-6 text-primary-dark">
        The live map is in the Android and iOS app. Start navigation opens Google Maps.
      </Text>
    </View>
  );
});
