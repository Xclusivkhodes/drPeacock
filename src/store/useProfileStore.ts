import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { UserProfile } from "@/data/types";

interface ProfileState {
  profile: UserProfile | null;
  hasCompletedOnboarding: boolean;
}

interface ProfileActions {
  setProfile: (profile: UserProfile) => void;
  completeOnboarding: () => void;
  reset: () => void;
}

export const useProfileStore = create<ProfileState & ProfileActions>()(
  persist(
    (set) => ({
      profile: null,
      hasCompletedOnboarding: false,
      setProfile: (profile) => set({ profile }),
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      reset: () => set({ profile: null, hasCompletedOnboarding: false }),
    }),
    { name: "profile-storage", storage: createJSONStorage(() => AsyncStorage) }
  )
);
