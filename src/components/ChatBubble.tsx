import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image, Text, View } from "react-native";

import { Mascot } from "@/components/Mascot";
import type { ChatMessage } from "@/data/types";

interface ChatBubbleProps {
  message: ChatMessage;
}

const bubbleShadow = { shadowColor: "#0D47A1", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.07, shadowRadius: 16 };

export function formatSeconds(ms: number): string {
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  if (message.from === "ai") {
    return (
      <View className="flex-row items-end gap-2">
        <Mascot pose="happy" width={42} height={52} />
        <View
          className="max-w-[272px] rounded-tl-[18px] rounded-tr-[18px] rounded-bl-[5px] rounded-br-[18px] bg-bg-card px-4 py-3.5"
          style={bubbleShadow}
        >
          <Text className="font-poppins text-[14.5px] leading-[21px] text-ink">{message.text}</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="items-end gap-1.5">
      {message.audioUri ? (
        <View className="w-[186px] flex-row items-center gap-2 rounded-2xl bg-primary px-4 py-3.5">
          <MaterialCommunityIcons name="microphone" size={16} color="#FFFFFF" />
          <Text className="font-poppins-medium text-[13.5px] text-white">
            Voice message · {formatSeconds(message.audioDurationMs ?? 0)}
          </Text>
        </View>
      ) : null}
      {message.attachmentUri ? (
        <View className="w-[186px] rounded-2xl bg-bg-card p-2.5" style={bubbleShadow}>
          <Image source={{ uri: message.attachmentUri }} className="h-[100px] w-full rounded-[11px]" resizeMode="cover" />
          <Text className="mt-2 font-poppins-medium text-xs text-[rgba(45,55,72,0.6)]">Photo · uploaded</Text>
        </View>
      ) : null}
      {message.text ? (
        <View className="max-w-[270px] rounded-tl-[18px] rounded-tr-[18px] rounded-bl-[18px] rounded-br-[5px] bg-primary px-4 py-3.5">
          <Text className="font-poppins text-[14.5px] leading-[21px] text-white">{message.text}</Text>
        </View>
      ) : null}
    </View>
  );
}
