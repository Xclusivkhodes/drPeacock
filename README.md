# Dr. Peacock

Dr. Peacock is an Expo and React Native healthcare companion for Ghana and Africa. It helps someone describe symptoms, find a nearby facility, and keep a simple health record on the phone. Cloud replies come from Gemma (`gemma-4-e2b-it` on Google AI Studio) through this app's own API routes. The phone never holds the model key.

The app is guidance only and does not replace a doctor.

## Requirements

- Node.js 22 (the version this repo was revived with) and npm 10
- For a phone build: Xcode (iOS) or Android Studio (Android), plus an [Expo development build](https://docs.expo.dev/develop/development-builds/introduction/). Expo Go is not enough — the app uses native modules (maps, audio, location, Clerk).

## Setup

```bash
npm install
cp .env.example .env
```

`.env` is optional for browsing the UI. Fill in the keys you actually need:

| Variable | Required for | Notes |
| --- | --- | --- |
| `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | Sign-in and sign-up | Publishable Clerk key. Safe to ship in the client. |
| `AI_STUDIO_API_KEY` | Symptom chat and health-baseline generation | Google AI Studio key. Server only. Never prefix with `EXPO_PUBLIC_`. |
| `GOOGLE_MAPS_API_KEY` | Map tiles in a native build | Read by `app.config.js` at build time. |
| `GOOGLE_DIRECTIONS_API_KEY` | Turn-by-turn directions | Server only, used by `src/app/api/directions+api.ts`. |
| `EXPO_PUBLIC_API_BASE_URL` | A standalone build calling a deployed API | Leave unset in local development. |

Without `AI_STUDIO_API_KEY`, chat shows a short offline apology and onboarding still builds a local health baseline. Without the Clerk key, the welcome and onboarding screens still open; account screens will not authenticate.

## Run

```bash
npm start          # Metro. Press w for web, a for Android, i for iOS.
npm run web        # Expo web dev server, including API routes
npm run android    # Native Android dev build (needs a device or emulator)
npm run ios        # Native iOS dev build (macOS only)
```

The first screen is Welcome (`Your health, our pride`) until onboarding is finished on that device. Onboarding is stored locally with AsyncStorage.

On the web, the directions screen does not load `react-native-maps` (that native module crashes the web dev server). It keeps the same facility card and opens Google Maps from **Start navigation**. The live map is on Android and iOS.

## Check

```bash
npm run typecheck  # tsc --noEmit
npm run lint       # expo lint
npm test           # jest-expo unit tests for the offline health helpers
npm run doctor     # expo-doctor dependency check
```

A static web bundle, which is what `web.output` is set to in `app.config.js`:

```bash
npx expo export --platform web
```

The export is written to `dist/`. It does **not** include `src/app/api/*`. Those routes run on the Expo dev server (`npm start` / `npm run web`). A production phone build that should call them needs the routes deployed (for example `eas deploy`) and `EXPO_PUBLIC_API_BASE_URL` pointed at that host. Switching `web.output` to `"server"` is required for that deploy, and it also turns on server rendering for every screen — several screens import native-only modules, so that switch needs its own pass. See the comment in `src/app/api/chat+api.ts`.

## Project layout

- `src/app/` — Expo Router screens and the server API routes
- `src/components/` — shared UI (mascot, chat bubble, facility card)
- `src/data/` — typed offline facilities, symptoms, and the fallback health baseline
- `src/store/` — Zustand stores (profile, chat, settings), persisted where it matters offline
- `src/lib/` — API helpers, thinking-block stripping, directions, and record summaries

## Stack

Expo SDK 57, React Native 0.86, Expo Router, TypeScript, NativeWind 5 / Tailwind CSS 4, Zustand, AsyncStorage, and Clerk.
