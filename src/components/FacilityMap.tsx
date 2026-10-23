import { forwardRef, useImperativeHandle, useRef } from "react";
import { StyleSheet } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";

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

/**
 * Native map. Web uses FacilityMap.web.tsx so the dev server and static
 * export never load react-native-maps, which calls codegenNativeComponent
 * at import time and crashes react-native-web.
 */
export const FacilityMap = forwardRef<FacilityMapHandle, FacilityMapProps>(function FacilityMap(
  { destination, destinationTitle, origin, route },
  ref,
) {
  const mapRef = useRef<MapView>(null);

  useImperativeHandle(ref, () => ({
    fitToCoordinates: (coordinates, options) => {
      mapRef.current?.fitToCoordinates(coordinates, options);
    },
  }));

  return (
    <MapView
      ref={mapRef}
      provider={PROVIDER_GOOGLE}
      style={StyleSheet.absoluteFill}
      initialRegion={{
        latitude: destination.latitude,
        longitude: destination.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }}
    >
      {origin ? <Marker coordinate={origin} title="You" pinColor="#1565C0" /> : null}
      <Marker coordinate={destination} title={destinationTitle} />
      {route ? <Polyline coordinates={route} strokeColor="#1565C0" strokeWidth={4} /> : null}
    </MapView>
  );
});
