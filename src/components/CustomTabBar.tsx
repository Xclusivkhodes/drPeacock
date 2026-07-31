import { router } from "expo-router";
import type { BottomTabBarProps } from "expo-router/tabs";
import { Pressable, Text, View } from "react-native";

const TAB_LABELS: Record<string, string> = {
  index: "Home",
  care: "Care",
  chat: "Dr. P",
  profile: "Record",
};

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const leftRoutes = state.routes.slice(0, 2);
  const rightRoutes = state.routes.slice(2);

  const renderTab = (route: (typeof state.routes)[number], index: number) => {
    const isFocused = state.index === state.routes.indexOf(route);
    const label = TAB_LABELS[route.name] ?? descriptors[route.key]?.options.title ?? route.name;

    return (
      <Pressable
        key={route.key}
        onPress={() => navigation.navigate(route.name)}
        className="flex-1 items-center justify-center py-2"
      >
        <Text
          className={`font-poppins-medium text-xs ${isFocused ? "text-primary" : "text-neutral-400"}`}
        >
          {label}
        </Text>
      </Pressable>
    );
  };

  return (
    <View className="flex-row items-center border-t border-chip-inactive bg-bg-card px-2 pb-6 pt-2">
      {leftRoutes.map(renderTab)}

      <Pressable
        onPress={() => router.push("/symptom-check/symptoms")}
        className="-mt-8 h-16 w-16 items-center justify-center rounded-pill bg-primary"
      >
        <Text className="font-poppins-bold text-2xl text-white">+</Text>
      </Pressable>

      {rightRoutes.map(renderTab)}
    </View>
  );
}
