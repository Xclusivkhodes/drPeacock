import { Link } from "expo-router";
import { Text, View } from "react-native";

// TODO: wire real Clerk sign-in flow once an auth method (phone/Google/guest) is decided.
export default function SignInScreen() {
  return (
    <View className="flex-1 items-center justify-center gap-4 bg-bg-page px-6">
      <Text className="font-poppins-semibold text-xl text-primary-dark">Sign in — coming soon</Text>
      <Link
        href="/(tabs)"
        className="rounded-card bg-primary px-6 py-3 font-poppins-semibold text-white"
      >
        Continue as guest
      </Link>
    </View>
  );
}
