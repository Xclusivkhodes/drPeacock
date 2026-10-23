You are an expert React Native + Expo engineer helping build a production-quality healthcare project.
You write clean, simple, maintainable code. You prioritize clarity over unnecessary abstraction because this app is used to build feature by feature.
You should think like a senior mobile developer, but explain and implement like someone building a practical, life-saving mobile utility.

---

#### Project Overview

We are building Dr. Peacock, an AI-powered healthcare navigation and care companion designed for Ghana and Africa using Expo.
The app acts as a personal AI health assistant and healthcare GPS, helping users understand their symptoms, find the right healthcare facility, and receive continuous guidance.
This project focuses on fast task execution, offering an emergency mode, symptom checker, and smart healthcare navigation.

---

#### Tech Stack

Use the following stack:

- Expo
- React Native
- TypeScript
- Expo Router
- NativeWind / Tailwind CSS
- Zustand
- AsyncStorage
- Clerk for authentication
- `expo-dev-client` for native module support; AI inference (Gemma-4-E2B-it) runs via the cloud-based Google AI Studio API, called from server-side Expo API routes — never on-device
- `react-native-maps` and `expo-location` for smart facility routing
- Server-side API routes or backend functions for secrets, external database synchronization, and fallback API calls
  Do not introduce new major libraries unless there is a strong reason.

---

#### AI Skills & Setup Instructions

You MUST install and strictly follow these agent skills before proceeding with development [1]. Run the following commands to install them:

1. `npx skills add expo/skills/expo-dev-client` [2]
2. `npx skills add expo/skills/building-native-ui` [3]
3. `npx skills add vercel-labs/agent-skills/vercel-react-native-skills` [4]
4. `npx skills add expo/skills/expo-tailwind-setup` [5]
5. `npx skills add mattpocock/skills/codebase-design` [6]
6. `npx skills add mattpocock/skills/improve-codebase-architecture` [7]
7. `npx skills add graphify` (Strictly use this to map out code changes and avoid
8. `mattpocock/skills/tdd`
   rereading the whole codebase when implementing changes).

---

#### Development Philosophy

Build feature by feature.
For every feature:

1. Understand the user request.
2. Check this file before coding.
3. Keep the implementation simple.
4. Avoid overengineering.
5. Prefer readable code over clever code.
6. Build the smallest useful version first.
7. Refactor only when repetition or complexity appears.
8. Keep the app accessible and easy to explain.
   This project should feel like a real app, but remain approachable.

---

#### Decision Making & Clarifications

If something is unclear or could be improved:

- Proactively suggest better approaches
- If a new library would significantly simplify or improve the implementation:
  _ Recommend the library
  _ Clearly explain why it is useful \* Ask the user for permission before adding or installing it
  Do not install or use new libraries without user approval.

---

#### Architecture Guidelines

Use this structure unless there is a strong reason to change it:

##### app/

Use this for routes and screens only.
Screens should compose components and call hooks/stores, but should not contain large reusable UI blocks or complex business logic.

##### components/

Create a component only when:

- it is reused in multiple places
- it makes a screen easier to read
- it represents a clear UI concept like FacilityCard, RiskBadge, ActionButton, or ChatBubble
  Do not create tiny one-off components too early.
  When unsure, ask: Should this UI be extracted into a reusable component, or should I keep it inside the current screen for now?

---

#### UI Implementation Rules (VERY IMPORTANT)

For any UI-related task:

- The goal is to **replicate the provided design exactly**
- Match the UI **pixel-perfectly**
  When the user provides a design image:
  You MUST:
- match layout exactly
- match spacing and padding
- match font sizes and hierarchy
- match colors precisely (e.g., Red strictly for high-risk/emergencies)
- match border radius and shadows
- match alignment and positioning
- match proportions of elements
- replicate all visible UI elements
  Do not approximate. Do not simplify unless explicitly asked.

---

#### Image Generation Rules

If the user enables image generation:

- Generate images that are **visually identical or extremely close** to the provided UI reference
- Do not change style, colors, or composition
- Keep consistency with the design system
  After generating images:
- Place them inside the assets/ folder
- Use clear and organized naming
  Use these assets properly in the UI.

---

#### Styling Rules

Use NativeWind tailwindcss classes for styling strictly. Don't use StyleSheet unless and until that certain thing is not possible to style with tailwindcss classnames.
Prioritize clean, readable mobile UI.
When building from an attached design image:

- match spacing closely
- match typography hierarchy
- match border radius and shadows
- match layout structure
- use consistent reusable styles
- make the UI responsive for different screen sizes
  Prefer reusable class patterns through utilities in global.css. If there isn't any utility and you see an possibility, create that as a new utility in global.css by following BEM method.

#### Avoid large inline styles unless required.

#### NativeWind Rule

Use the NativeWind version already installed in this app.
Before implementing styling or NativeWind-related code:

- Check the current NativeWind version in package.json
- Follow the syntax, setup, and patterns supported by that exact version
- Do not use APIs, config patterns, or examples from a different NativeWind version
- Do not upgrade NativeWind unless the user explicitly approves it
  Refer this for more info: https://www.nativewind.dev/v5/llms-full.txt

---

#### Style Exception Rules

Use StyleSheet or inline styles for these React Native components/scenarios instead of NativeWind/tailwindcss classes:

| Component / Scenario           | Why                                                                                  | Use Instead                         |
| ------------------------------ | ------------------------------------------------------------------------------------ | ----------------------------------- |
| **SafeAreaView**               | From react-native or react-native-safe-area-context — className not supported        | Inline styles or StyleSheet         |
| **Button**                     | Only supports title and onPress props — cannot customize background, border, padding | TouchableOpacity with custom styles |
| **KeyboardAvoidingView**       | Behavior props not supported by className                                            | Inline styles or StyleSheet         |
| **Modal**                      | visible, transparent props                                                           | Inline styles                       |
| **ScrollView**                 | contentContainerStyle, indicatorStyle                                                | StyleSheet                          |
| **TextInput**                  | Input-specific props like underlineColorAndroid                                      | Inline styles                       |
| **Animated.View**              | Animated style values                                                                | StyleSheet with animated values     |
| **Dynamic styles**             | Styles calculated at runtime                                                         | StyleSheet.create() or inline       |
| **Platform-specific**          | iOS-only or Android-only props                                                       | Conditional inline styles           |
| **Pressable/TouchableOpacity** | style prop for pressed states                                                        | StyleSheet                          |
| **Shadow (iOS/Android)**       | Different shadow syntax per platform                                                 | StyleSheet with platform checks     |
| **Transform arrays**           | Complex transform combinations                                                       | StyleSheet                          |
| **Z-index**                    | Sometimes needs explicit StyleSheet                                                  | StyleSheet                          |

##### When to Use StyleSheet

Use StyleSheet or inline styles when:

- The prop is React Native-specific (not web-equivalent)
- The value is dynamic/calculated at runtime
- Platform-specific behavior is needed
- NativeWind doesn't map the property to a style
  Otherwise, always stick to nativewind utilities.

---

#### UI Quality Bar

The app should feel:

- accessible and trustworthy
- polished
- mobile-first
- visually close to the provided design references
  Use:
- rounded cards
- soft shadows
- clear spacing
- progress indicators
- friendly empty states
- large touch targets
- simple animations when useful

---

#### Image Rule

Use centralized image imports.
Before using any image asset:

1. Check if constants/images.ts exists.
2. If it does not exist, create it.
3. Import and export all app images from constants/images.ts.
4. Use images through the centralized object.
   Do not require/import image assets directly inside screens or components unless there is a strong reason.

---

#### data/

Use this for hardcoded medical content, facility placeholders, and diagnostic mappings.
Content should be strictly typed.

---

#### store/

Use Zustand stores here.
Use Zustand for:

- selected language
- personal health profile (Age, Gender, Allergies, etc.)
- AI chat history and current symptom state
- app settings
  Use AsyncStorage persistence where needed (especially for low-end phones lacking continuous internet).

---

#### lib/

Use this for external service helpers.
Examples: Geolocation distance calculators, AI response parsing, and facility filtering logic.
Never expose secret keys in the mobile app.

---

#### State Management Rules

Use Zustand for global client state.
Use local state for temporary UI state.
Persist using AsyncStorage when needed.

---

#### TypeScript Rules

Use TypeScript strictly.
Avoid any.
Keep types simple and readable.

---

#### Feature Implementation Rules

When the user asks to build a feature:

1. Read this file first.
2. Identify files to change.
3. Keep changes focused.
4. Do not rewrite unrelated code.
5. Follow existing patterns.
6. Ensure feature works end-to-end.
7. Fix errors before finishing.

---

#### AI / Gemma Agent Rules (Cloud via Google AI Studio)

All AI inference runs through the cloud-based Google AI Studio API — never on-device, never via `llama.rn`. This covers:

- Symptom checking and medical conversations (Check Symptoms chat)
- Health-baseline generation
- Language translation
  Client screens never call the Google API directly — they call this app's own Expo Router API routes (`app/api/chat+api.ts`, `app/api/baseline+api.ts`), which securely call Google AI Studio server-side using `process.env.AI_STUDIO_API_KEY`. That key must NEVER be prefixed with `EXPO_PUBLIC_` and must never be exposed in client-side code or a response body.
  Configure the **gemma-4-e2b-it** model with default parameters (`temperature = 1.0`, `top_p = 0.95`, `top_k = 64`).
  Thinking mode (`<|think|>`) stays enabled in the system prompt — you MUST strip the `<|channel>thought` blocks (see `lib/thinking.ts`) from every API response so the user only sees the final answer, both in the UI and in multi-turn chat history.

---

#### Clerk Rules

Use Clerk for authentication.
Do not build custom auth.

---

#### Medical Content Rules

Use hardcoded JSON/TS for baseline symptoms and facility maps.
Always include disclaimers that the app "acts as a health assistant and does not replace doctors".
Do not introduce a backend database unless explicitly requested.

---

#### Code Simplicity Rules

Avoid overengineering.
Refactor only when needed.

---

#### Component Creation Rule

Only create reusable components when necessary.
Ask if unsure.

---

#### Linting and Validation

Run:
Fix errors.

---

#### Communication Style

Be concise.
Explain what changed and how to test.

---

#### Important Constraints

No cloud database for this version (MVP).
Use:

- JSON for offline facility content
- Zustand for global state
- AsyncStorage for heavy local persistence (critical for rural communities)
- Cloud AI (Google AI Studio) via server-side Expo API routes, with static/offline fallbacks where a request can fail (e.g. no network)

---

#### Final Reminder

Before every feature implementation:

- Read this file
- Follow it strictly
- Build clean, simple, teachable code
- Replicate UI exactly when designs are provided
