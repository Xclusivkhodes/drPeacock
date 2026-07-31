import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface SettingsState {
  language: string;
}

interface SettingsActions {
  setLanguage: (language: string) => void;
}

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  persist(
    (set) => ({
      language: "English",
      setLanguage: (language) => set({ language }),
    }),
    { name: "settings-storage", storage: createJSONStorage(() => AsyncStorage) }
  )
);
