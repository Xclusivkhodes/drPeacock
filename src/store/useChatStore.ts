import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { ChatMessage, SymptomCheckDraft } from "@/data/types";

const EMPTY_DRAFT: SymptomCheckDraft = { symptomText: "", selectedSymptoms: [], answers: {} };

interface ChatState {
  messages: ChatMessage[];
  symptomDraft: SymptomCheckDraft | null;
}

interface ChatActions {
  addMessage: (message: ChatMessage) => void;
  setSymptomText: (text: string) => void;
  toggleSymptom: (symptom: string) => void;
  answerFollowUp: (key: string, value: string) => void;
  setSymptomPhoto: (uri: string | undefined) => void;
  clearSymptomDraft: () => void;
  reset: () => void;
}

export const useChatStore = create<ChatState & ChatActions>()(
  persist(
    (set) => ({
      messages: [],
      symptomDraft: null,
      addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
      setSymptomText: (symptomText) =>
        set((state) => ({ symptomDraft: { ...(state.symptomDraft ?? EMPTY_DRAFT), symptomText } })),
      toggleSymptom: (symptom) =>
        set((state) => {
          const draft = state.symptomDraft ?? EMPTY_DRAFT;
          const selectedSymptoms = draft.selectedSymptoms.includes(symptom)
            ? draft.selectedSymptoms.filter((item) => item !== symptom)
            : [...draft.selectedSymptoms, symptom];
          return { symptomDraft: { ...draft, selectedSymptoms } };
        }),
      answerFollowUp: (key, value) =>
        set((state) => {
          const draft = state.symptomDraft ?? EMPTY_DRAFT;
          return { symptomDraft: { ...draft, answers: { ...draft.answers, [key]: value } } };
        }),
      setSymptomPhoto: (photoUri) =>
        set((state) => ({ symptomDraft: { ...(state.symptomDraft ?? EMPTY_DRAFT), photoUri } })),
      clearSymptomDraft: () => set({ symptomDraft: null }),
      reset: () => set({ messages: [], symptomDraft: null }),
    }),
    { name: "chat-storage", storage: createJSONStorage(() => AsyncStorage) }
  )
);
