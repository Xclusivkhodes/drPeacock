import "../global.css";

import { ClerkProvider } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useSyncExternalStore } from "react";

import { useProfileStore } from "@/store/useProfileStore";

function subscribeToProfileHydration(onStoreChange: () => void) {
  return useProfileStore.persist.onFinishHydration(onStoreChange);
}

function getProfileHydratedSnapshot() {
  return useProfileStore.persist.hasHydrated();
}

SplashScreen.preventAutoHideAsync();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
if (!publishableKey) {
  console.warn(
    "Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY — Clerk auth will not function until it is set in .env.",
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });
  const profileHydrated = useSyncExternalStore(
    subscribeToProfileHydration,
    getProfileHydratedSnapshot,
    () => false,
  );

  // A font load failure should not pin the splash screen forever.
  const ready = (fontsLoaded || fontError != null) && profileHydrated;

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync();
    }
  }, [ready]);

  if (!ready) {
    return null;
  }

  return (
    <ClerkProvider
      publishableKey={publishableKey ?? ""}
      tokenCache={tokenCache}
    >
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="symptom-check" />
        <Stack.Screen
          name="emergency"
          options={{ presentation: "fullScreenModal", gestureEnabled: false }}
        />
        <Stack.Screen name="celebrate" options={{ presentation: "modal" }} />
        <Stack.Screen name="directions" options={{ presentation: "modal" }} />
      </Stack>
    </ClerkProvider>
  );
}
