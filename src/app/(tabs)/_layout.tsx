import { Tabs } from "expo-router/tabs";

import { CustomTabBar } from "@/components/CustomTabBar";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="care" options={{ title: "Care" }} />
      <Tabs.Screen name="chat" options={{ title: "Dr. P" }} />
      <Tabs.Screen name="profile" options={{ title: "Record" }} />
    </Tabs>
  );
}
