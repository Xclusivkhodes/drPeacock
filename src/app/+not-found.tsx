import { Link, Stack } from "expo-router";
import { Text, View } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Not found" }} />
      <View className="flex-1 items-center justify-center gap-3 bg-bg-page px-6">
        <Text className="font-poppins-semibold text-lg text-primary-dark">
          This screen doesn&apos;t exist.
        </Text>
        <Link href="/(auth)/welcome" className="font-poppins-medium text-primary">
          Go back to Dr. Peacock
        </Link>
      </View>
    </>
  );
}
