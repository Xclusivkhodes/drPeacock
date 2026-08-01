# Graph Report - src  (2026-07-31)

## Corpus Check
- Corpus is ~11,945 words - fits in a single context window. You may not need a graph.

## Summary
- 172 nodes · 329 edges · 13 communities (10 shown, 3 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Onboarding Wizard
- Symptom Check & Standalone Screens
- Gemma AI Inference Engine
- Care Discovery & Facility Cards
- Dr. P Chat Interface
- Model Download & Consent Flow
- Home Dashboard & Live Facility Search
- Bottom Tab Navigation
- Sign-In Stub
- Sign-Up Stub

## God Nodes (most connected - your core abstractions)
1. `Mascot()` - 15 edges
2. `useProfileStore` - 12 edges
3. `generateHealthBaseline()` - 9 edges
4. `useChatStore` - 9 edges
5. `ChatMessage` - 8 edges
6. `fetchNearbyFacilities()` - 8 edges
7. `SetupScreen()` - 7 edges
8. `buildFallbackBaseline()` - 7 edges
9. `UserProfile` - 7 edges
10. `BaselineCard` - 7 edges

## Surprising Connections (you probably didn't know these)
- `SetupScreen()` --calls--> `generateHealthBaseline()`  [EXTRACTED]
  app/(onboarding)/setup.tsx → lib/gemma.ts
- `ChatScreen()` --calls--> `generateChatReply()`  [EXTRACTED]
  app/(tabs)/chat.tsx → lib/gemma.ts
- `ChatScreen()` --calls--> `useChatStore`  [EXTRACTED]
  app/(tabs)/chat.tsx → store/useChatStore.ts
- `ChatScreen()` --calls--> `useProfileStore`  [EXTRACTED]
  app/(tabs)/chat.tsx → store/useProfileStore.ts
- `ChatScreen()` --calls--> `useSettingsStore`  [EXTRACTED]
  app/(tabs)/chat.tsx → store/useSettingsStore.ts

## Import Cycles
- None detected.

## Communities (13 total, 3 thin omitted)

### Community 0 - "Onboarding Wizard"
Cohesion: 0.10
Nodes (26): RootIndex(), cardShadow, DEFAULT_DRAFT, DraftProfile, getBmiBand(), GroupSpec, LANGUAGES, SetupScreen() (+18 more)

### Community 1 - "Symptom Check & Standalone Screens"
Cohesion: 0.10
Nodes (16): AnalyzingScreen(), EMERGENCY_SYMPTOMS, FollowupScreen(), cardShadow, SymptomsScreen(), Mascot(), MascotProps, Images (+8 more)

### Community 2 - "Gemma AI Inference Engine"
Cohesion: 0.14
Nodes (21): buildChatSystemPrompt(), buildSystemPrompt(), buildUserDataSummary(), downloadModel(), DownloadSpec, formatList(), GEMMA_MMPROJ_URL, GEMMA_MODEL_URL (+13 more)

### Community 3 - "Care Discovery & Facility Cards"
Cohesion: 0.19
Nodes (12): CARE_TYPES, cardShadow, ActionButton(), ActionButtonProps, cardShadow, cardShadow, FacilityCard(), FacilityCardProps (+4 more)

### Community 4 - "Dr. P Chat Interface"
Cohesion: 0.18
Nodes (13): bubbleShadow, ChatScreen(), inputShadow, makeId(), SUGGESTED_PROMPTS, bubbleShadow, ChatBubble(), ChatBubbleProps (+5 more)

### Community 5 - "Model Download & Consent Flow"
Cohesion: 0.22
Nodes (9): ModelSetupScreen(), OnboardingLayout(), ModelDownloadWidget(), cancelModelDownload(), isModelDownloaded(), ModelDownloadActions, ModelDownloadState, ModelDownloadStatus (+1 more)

### Community 6 - "Home Dashboard & Live Facility Search"
Cohesion: 0.23
Nodes (12): HomeScreen(), Coordinates, describeAmenity(), describeStatus(), fetchNearbyFacilities(), formatDistance(), getCurrentCoords(), haversineDistanceKm() (+4 more)

## Knowledge Gaps
- **40 isolated node(s):** `SEX_LABEL_TO_VALUE`, `DraftProfile`, `DEFAULT_DRAFT`, `LANGUAGES`, `StepFields` (+35 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Mascot()` connect `Symptom Check & Standalone Screens` to `Onboarding Wizard`, `Care Discovery & Facility Cards`, `Dr. P Chat Interface`, `Model Download & Consent Flow`?**
  _High betweenness centrality (0.105) - this node is a cross-community bridge._
- **Why does `useProfileStore` connect `Onboarding Wizard` to `Care Discovery & Facility Cards`, `Dr. P Chat Interface`, `Model Download & Consent Flow`, `Home Dashboard & Live Facility Search`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **Why does `ChatMessage` connect `Dr. P Chat Interface` to `Gemma AI Inference Engine`, `Care Discovery & Facility Cards`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **What connects `SEX_LABEL_TO_VALUE`, `DraftProfile`, `DEFAULT_DRAFT` to the rest of the system?**
  _40 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Onboarding Wizard` be split into smaller, more focused modules?**
  _Cohesion score 0.10338680926916222 - nodes in this community are weakly interconnected._
- **Should `Symptom Check & Standalone Screens` be split into smaller, more focused modules?**
  _Cohesion score 0.10037878787878787 - nodes in this community are weakly interconnected._
- **Should `Gemma AI Inference Engine` be split into smaller, more focused modules?**
  _Cohesion score 0.14492753623188406 - nodes in this community are weakly interconnected._