import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { ChatMessage, SymptomCheckDraft } from "@/data/types";

interface ChatState {
  messages: ChatMessage[];
  symptomDraft: SymptomCheckDraft | null;
}

interface ChatActions {
  addMessage: (message: ChatMessage) => void;
  setSymptomDraft: (draft: SymptomCheckDraft | null) => void;
  reset: () => void;
}

export const useChatStore = create<ChatState & ChatActions>()(
  persist(
    (set) => ({
      messages: [],
      symptomDraft: null,
      addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
      setSymptomDraft: (symptomDraft) => set({ symptomDraft }),
      reset: () => set({ messages: [], symptomDraft: null }),
    }),
    { name: "chat-storage", storage: createJSONStorage(() => AsyncStorage) }
  )
);
