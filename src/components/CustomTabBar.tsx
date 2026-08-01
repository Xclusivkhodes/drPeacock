import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import type { BottomTabBarProps } from "expo-router/tabs";
import { Pressable, Text, View } from "react-native";

const TAB_META: Record<string, { label: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }> = {
  index: { label: "Home", icon: "home" },
  care: { label: "Care", icon: "map-marker" },
  chat: { label: "Dr. P", icon: "chat" },
  profile: { label: "Record", icon: "card-account-details" },
};

const ACTIVE_COLOR = "#1565C0";
const INACTIVE_COLOR = "rgba(45,55,72,0.28)";
const INACTIVE_LABEL_COLOR = "rgba(45,55,72,0.4)";

export function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const leftRoutes = state.routes.slice(0, 2);
  const rightRoutes = state.routes.slice(2);

  const renderTab = (route: (typeof state.routes)[number]) => {
    const isFocused = state.index === state.routes.indexOf(route);
    const meta = TAB_META[route.name];
    if (!meta) return null;

    return (
      <Pressable
        key={route.key}
        onPress={() => navigation.navigate(route.name)}
        className="w-16.5 items-center gap-1.25"
      >
        <MaterialCommunityIcons name={meta.icon} size={23} color={isFocused ? ACTIVE_COLOR : INACTIVE_COLOR} />
        <Text
          className="font-poppins text-[10.5px]"
          style={{ color: isFocused ? ACTIVE_COLOR : INACTIVE_LABEL_COLOR, fontWeight: isFocused ? "600" : "500" }}
        >
          {meta.label}
        </Text>
      </Pressable>
    );
  };

  return (
    <View
      className="flex-row items-start justify-around bg-white/95"
      style={{ height: 86, paddingHorizontal: 14, paddingTop: 10, paddingBottom: 22, borderTopWidth: 1, borderTopColor: "#E8EDF5" }}
    >
      {leftRoutes.map(renderTab)}

      <Pressable onPress={() => router.push("/symptom-check/symptoms")} className="-mt-4 w-16.5 items-center gap-1.25">
        <LinearGradient
          colors={["#0D47A1", "#26A69A"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: 52,
            height: 52,
            borderRadius: 17,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#1565C0",
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.35,
            shadowRadius: 20,
          }}
        >
          <MaterialCommunityIcons name="plus" size={24} color="#FFFFFF" />
        </LinearGradient>
        <Text className="font-poppins-semibold text-[10.5px] text-primary-dark">Symptoms</Text>
      </Pressable>

      {rightRoutes.map(renderTab)}
    </View>
  );
}
