import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Modal, Pressable, Text, View } from "react-native";

import { useProfileStore } from "@/store/useProfileStore";
import { useSettingsStore } from "@/store/useSettingsStore";

interface DrawerMenuProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Lightweight slide-in menu built from RN's core Modal + Pressable (no
 * navigation-library drawer added, per the "no new libraries" constraint) —
 * holds secondary settings, separate from the bottom tab bar's primary nav.
 */
export function DrawerMenu({ visible, onClose }: DrawerMenuProps) {
  const profile = useProfileStore((state) => state.profile);
  const reset = useProfileStore((state) => state.reset);
  const language = useSettingsStore((state) => state.language);

  const initials =
    (profile?.name ?? "")
      .split(" ")
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";

  const goToProfile = () => {
    onClose();
    router.push("/(tabs)/profile");
  };

  const handleRestartDemo = () => {
    onClose();
    reset();
    router.replace("/(auth)/welcome");
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/40" onPress={onClose}>
        <Pressable
          onPress={(event) => event.stopPropagation()}
          className="h-full w-[78%] bg-bg-page px-5 pt-16"
          style={{ shadowColor: "#000000", shadowOffset: { width: 4, height: 0 }, shadowOpacity: 0.15, shadowRadius: 20 }}
        >
          <View className="flex-row items-center gap-3">
            <View className="h-11 w-11 items-center justify-center rounded-2xl bg-primary-dark">
              <Text className="font-poppins-semibold text-sm text-white">{initials}</Text>
            </View>
            <View>
              <Text className="font-poppins-semibold text-base text-primary-dark">{profile?.name || "Guest"}</Text>
              <Text className="font-poppins text-xs text-muted">{language}</Text>
            </View>
          </View>

          <View className="mt-8 gap-1">
            <Pressable onPress={goToProfile} className="flex-row items-center gap-3 rounded-2xl px-3 py-3.5">
              <MaterialCommunityIcons name="card-account-details-outline" size={20} color="#1565C0" />
              <Text className="font-poppins-medium text-[15px] text-ink">Health record</Text>
            </Pressable>
            <View className="flex-row items-center gap-3 rounded-2xl px-3 py-3.5">
              <MaterialCommunityIcons name="translate" size={20} color="#1565C0" />
              <Text className="font-poppins-medium text-[15px] text-ink">Language — {language}</Text>
            </View>
          </View>

          <View className="flex-1" />

          <Pressable onPress={handleRestartDemo} className="mb-8 flex-row items-center gap-3 rounded-2xl px-3 py-3.5">
            <MaterialCommunityIcons name="logout" size={20} color="#C62828" />
            <Text className="font-poppins-medium text-[15px] text-danger">Restart demo</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
