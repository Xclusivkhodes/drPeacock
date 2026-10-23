// Converted from app.json to app.config.js so the Google Maps SDK key can be
// sourced from process.env instead of being hardcoded into a committed file
// (static JSON can't evaluate env vars). Set GOOGLE_MAPS_API_KEY in .env (see
// .env.example) — no EXPO_PUBLIC_ prefix needed since this file runs in Node
// at config/build time, not inside the client JS bundle.
module.exports = {
  expo: {
    name: "Dr. Peacock",
    slug: "dr-peacock",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "drpeacock",
    userInterfaceStyle: "automatic",
    ios: {
      icon: "./assets/expo.icon",
      config: {
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
      },
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png",
      },
      softwareKeyboardLayoutMode: "pan",
      predictiveBackGestureEnabled: false,
      package: "com.odoijosua.drpeacock",
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          backgroundColor: "#E3EDFB",
          image: "./assets/images/splash-icon.png",
          imageWidth: 76,
        },
      ],
      "@clerk/expo",
      "expo-secure-store",
      [
        "expo-image-picker",
        {
          photosPermission: "Allow Dr. Peacock to access your photos so you can attach a picture of a symptom.",
          cameraPermission: "Allow Dr. Peacock to use your camera so you can photograph a symptom.",
          microphonePermission: false,
        },
      ],
      [
        "expo-audio",
        {
          microphonePermission: "Allow Dr. Peacock to use your microphone so you can describe symptoms by voice.",
        },
      ],
      "expo-asset",
      "expo-image",
      "expo-web-browser",
      [
        "expo-location",
        {
          locationWhenInUsePermission: "Allow Dr. Peacock to use your location to find nearby healthcare facilities.",
        },
      ],
      [
        "react-native-maps",
        {
          androidGoogleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
          iosGoogleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: "d1d96595-b8dd-4253-a67f-19062306edd1",
      },
    },
    owner: "xclusivkhoders-team",
  },
};
