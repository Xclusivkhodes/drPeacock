import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { BaselineCard, UserProfile } from "@/data/types";

interface ProfileState {
  profile: UserProfile | null;
  hasCompletedOnboarding: boolean;
  healthBaseline: BaselineCard[] | null;
}

interface ProfileActions {
  setProfile: (profile: UserProfile) => void;
  completeOnboarding: () => void;
  setHealthBaseline: (cards: BaselineCard[]) => void;
  reset: () => void;
}

export const useProfileStore = create<ProfileState & ProfileActions>()(
  persist(
    (set) => ({
      profile: null,
      hasCompletedOnboarding: false,
      healthBaseline: null,
      setProfile: (profile) => set({ profile }),
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      setHealthBaseline: (healthBaseline) => set({ healthBaseline }),
      reset: () => set({ profile: null, hasCompletedOnboarding: false, healthBaseline: null }),
    }),
    { name: "profile-storage", storage: createJSONStorage(() => AsyncStorage) }
  )
);
