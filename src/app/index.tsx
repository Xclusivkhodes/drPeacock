import { Redirect } from "expo-router";

import { useProfileStore } from "@/store/useProfileStore";

export default function RootIndex() {
  const hasCompletedOnboarding = useProfileStore((state) => state.hasCompletedOnboarding);
  return <Redirect href={hasCompletedOnboarding ? "/(tabs)" : "/(auth)/welcome"} />;
}
