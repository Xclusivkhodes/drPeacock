import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface SettingsState {
  language: string;
  /** Whether Dr. Peacock's chat replies are read aloud automatically — an
   * accessibility feature for patients who can't read. Defaults on. */
  autoSpeakReplies: boolean;
}

interface SettingsActions {
  setLanguage: (language: string) => void;
  setAutoSpeakReplies: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  persist(
    (set) => ({
      language: "English",
      autoSpeakReplies: true,
      setLanguage: (language) => set({ language }),
      setAutoSpeakReplies: (autoSpeakReplies) => set({ autoSpeakReplies }),
    }),
    { name: "settings-storage", storage: createJSONStorage(() => AsyncStorage) }
  )
);
