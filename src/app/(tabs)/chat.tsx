import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import * as ImagePicker from "expo-image-picker";
import * as Speech from "expo-speech";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { ChatBubble, formatSeconds } from "@/components/ChatBubble";
import { Mascot } from "@/components/Mascot";
import type { ChatMessage } from "@/data/types";
import { generateChatReply, type ChatImageAttachment } from "@/lib/gemma";
import { useChatStore } from "@/store/useChatStore";
import { useProfileStore } from "@/store/useProfileStore";
import { useSettingsStore } from "@/store/useSettingsStore";

const keyboardAvoidingStyle = { flex: 1, backgroundColor: "#E8EEF6" };

const inputShadow = {
  shadowColor: "#0D47A1",
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.07,
  shadowRadius: 18,
};
const bubbleShadow = {
  shadowColor: "#0D47A1",
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.07,
  shadowRadius: 16,
};

const SUGGESTED_PROMPTS = [
  "Is my fever dangerous?",
  "Prepare questions for my doctor",
  "Explain my lab result",
];

const MAX_RECORDING_SECONDS = 30;

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function TypingIndicator() {
  const dots = useRef([0, 1, 2].map(() => new Animated.Value(0.3))).current;

  useEffect(() => {
    const loops = dots.map((value, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 160),
          Animated.timing(value, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ),
    );
    loops.forEach((loop) => loop.start());
    return () => loops.forEach((loop) => loop.stop());
  }, [dots]);

  const colors = ["#1565C0", "#26A69A", "#FFB300"];

  return (
    <View className="flex-row items-end gap-2">
      <Mascot pose="wink" width={44} height={52} />
      <View
        className="flex-row gap-1.5 rounded-tl-[18px] rounded-tr-[18px] rounded-bl-[5px] rounded-br-[18px] bg-bg-card px-[15px] py-[15px]"
        style={bubbleShadow}
      >
        {dots.map((value, index) => (
          <Animated.View
            key={index}
            style={{
              width: 8,
              height: 8,
              borderRadius: 99,
              backgroundColor: colors[index],
              opacity: value,
            }}
          />
        ))}
      </View>
    </View>
  );
}

function Waveform() {
  const bars = useRef([0, 1, 2, 3, 4].map(() => new Animated.Value(6))).current;

  useEffect(() => {
    const loops = bars.map((value, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 90),
          Animated.timing(value, {
            toValue: 18,
            duration: 260,
            useNativeDriver: false,
          }),
          Animated.timing(value, {
            toValue: 6,
            duration: 260,
            useNativeDriver: false,
          }),
        ]),
      ),
    );
    loops.forEach((loop) => loop.start());
    return () => loops.forEach((loop) => loop.stop());
  }, [bars]);

  return (
    <View className="flex-row items-center gap-[3px]">
      {bars.map((value, index) => (
        <Animated.View
          key={index}
          style={{
            width: 3,
            borderRadius: 2,
            backgroundColor: "#1565C0",
            height: value,
          }}
        />
      ))}
    </View>
  );
}

export default function ChatScreen() {
  const messages = useChatStore((state) => state.messages);
  const addMessage = useChatStore((state) => state.addMessage);
  const profile = useProfileStore((state) => state.profile);
  const language = useSettingsStore((state) => state.language);
  const autoSpeakReplies = useSettingsStore((state) => state.autoSpeakReplies);
  const setAutoSpeakReplies = useSettingsStore(
    (state) => state.setAutoSpeakReplies,
  );

  const [inputText, setInputText] = useState("");
  const [pendingImageUri, setPendingImageUri] = useState<string | undefined>();
  const [pendingImage, setPendingImage] = useState<ChatImageAttachment | undefined>();
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const seeded = useRef(false);
  const canSend = inputText.trim().length > 0 || Boolean(pendingImageUri);

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 200);
  const recordingFinalizedRef = useRef(true);

  useEffect(() => {
    if (seeded.current || messages.length > 0) return;
    seeded.current = true;
    const firstName = profile?.name?.trim().split(" ")[0] || "there";
    addMessage({
      id: makeId(),
      from: "ai",
      text: `Hello ${firstName} — I am Dr. Peacock. Ask me about symptoms, medicines or what a doctor told you.`,
      createdAt: Date.now(),
    });
  }, [messages.length, profile, addMessage]);

  const submitMessage = async (userMessage: ChatMessage, image?: ChatImageAttachment) => {
    // 1. Calculate explicit history array immediately to prevent state lag
    const updatedHistory = [...messages, userMessage];

    // 2. Add user turn to Zustand store
    addMessage(userMessage);
    setIsThinking(true);

    try {
      // 3. Send accurate updated history to API wrapper
      const { text: reply } = await generateChatReply(
        updatedHistory,
        profile,
        language,
        image,
      );

      addMessage({
        id: makeId(),
        from: "ai",
        text: reply,
        createdAt: Date.now(),
      });

      if (autoSpeakReplies) {
        Speech.stop();
        Speech.speak(reply);
      }
    } catch (error) {
      console.error("Failed to generate AI response:", error);
    } finally {
      setIsThinking(false);
    }
  };

  const send = async (rawText?: string) => {
    const text = (rawText ?? inputText).trim();
    if (!text && !pendingImageUri) return;

    const userMessage: ChatMessage = {
      id: makeId(),
      from: "user",
      text: text || undefined,
      attachmentUri: pendingImageUri,
      createdAt: Date.now(),
    };
    const image = pendingImage;
    setInputText("");
    setPendingImageUri(undefined);
    setPendingImage(undefined);
    await submitMessage(userMessage, image);
  };

  const finalizeRecording = (shouldSend: boolean) => {
    if (recordingFinalizedRef.current) return;
    recordingFinalizedRef.current = true;
    if (shouldSend && recorder.uri) {
      void submitMessage({
        id: makeId(),
        from: "user",
        audioUri: recorder.uri,
        audioDurationMs: recorder.currentTime * 1000,
        createdAt: Date.now(),
      });
    }
  };

  useEffect(() => {
    if (!recorderState.isRecording && !recordingFinalizedRef.current) {
      finalizeRecording(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recorderState.isRecording]);

  const handleMicPress = async () => {
    const { granted } = await requestRecordingPermissionsAsync();
    if (!granted) {
      Alert.alert(
        "Microphone permission needed",
        "Allow microphone access to send a voice message.",
      );
      return;
    }
    try {
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });
      await recorder.prepareToRecordAsync();
      recordingFinalizedRef.current = false;
      recorder.record({ forDuration: MAX_RECORDING_SECONDS });
    } catch (error) {
      console.warn("Failed to start recording:", error);
      Alert.alert("Couldn't start recording", "Please try again.");
    }
  };

  const handleStopAndSend = async () => {
    await recorder.stop();
    finalizeRecording(true);
  };

  const handleCancelRecording = async () => {
    await recorder.stop();
    finalizeRecording(false);
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") return;
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.6,
      allowsEditing: false,
      base64: true,
    });
    const asset = result.canceled ? undefined : result.assets?.[0];
    if (asset?.uri) {
      setPendingImageUri(asset.uri);
      if (asset.base64) setPendingImage({ data: asset.base64, mimeType: asset.mimeType ?? "image/jpeg" });
    }
  };

  const handlePickFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;
    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 0.6,
      allowsEditing: false,
      mediaTypes: ["images"],
      base64: true,
    });
    const asset = result.canceled ? undefined : result.assets?.[0];
    if (asset?.uri) {
      setPendingImageUri(asset.uri);
      if (asset.base64) setPendingImage({ data: asset.base64, mimeType: asset.mimeType ?? "image/jpeg" });
    }
  };

  const handleAttachPress = () => {
    Alert.alert("Attach a photo", undefined, [
      { text: "Take Photo", onPress: handleTakePhoto },
      { text: "Choose from Library", onPress: handlePickFromLibrary },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={keyboardAvoidingStyle}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="flex-1 px-[18px] pt-[56px] pb-[26px]">
        <View className="flex-row items-center gap-2.5">
          <Mascot pose="happy" width={62} height={78} />
          <View className="flex-1">
            <Text className="font-poppins-bold text-[18px] tracking-[-0.3px] text-primary-dark">
              Dr. Peacock
            </Text>
            <View className="mt-0.5 flex-row items-center gap-1.5">
              <View className="h-[7px] w-[7px] rounded-full bg-success" />
              <Text className="font-poppins-medium text-xs text-[rgba(45,55,72,0.5)]">
                Always here · English &amp; Twi
              </Text>
            </View>
          </View>
          <Pressable
            onPress={() => setAutoSpeakReplies(!autoSpeakReplies)}
            className={`h-9 w-9 items-center justify-center rounded-xl ${autoSpeakReplies ? "bg-primary" : "bg-chip-inactive"}`}
          >
            <MaterialCommunityIcons
              name={autoSpeakReplies ? "volume-high" : "volume-off"}
              size={18}
              color={autoSpeakReplies ? "#FFFFFF" : "#0D47A1"}
            />
          </Pressable>
        </View>

        <ScrollView
          ref={scrollRef}
          className="mt-2.5 flex-1"
          contentContainerStyle={{ gap: 11, paddingBottom: 4 }}
          onContentSizeChange={() =>
            scrollRef.current?.scrollToEnd({ animated: true })
          }
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message) => (
            <ChatBubble key={message.id} message={message} />
          ))}
          {isThinking ? <TypingIndicator /> : null}
        </ScrollView>

        <View className="mt-auto">
          {/* Hide prompt chips once the user sends a message */}
          {messages.length <= 1 && (
            <View className="mt-3.5 flex-row flex-wrap gap-2">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <Pressable
                  key={prompt}
                  onPress={() => send(prompt)}
                  className="rounded-xl bg-info-bg px-3.5 py-2.5"
                >
                  <Text className="font-poppins-semibold text-[13px] text-info-text">
                    {prompt}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          {pendingImageUri ? (
            <View
              className="mt-2.5 flex-row items-center gap-2 self-start rounded-2xl bg-bg-card p-1.5"
              style={bubbleShadow}
            >
              <Image
                source={{ uri: pendingImageUri }}
                className="h-11 w-11 rounded-xl"
                resizeMode="cover"
              />
              <Text className="pr-1 font-poppins-medium text-xs text-[rgba(45,55,72,0.6)]">
                Ready to send
              </Text>
              <Pressable
                onPress={() => {
                  setPendingImageUri(undefined);
                  setPendingImage(undefined);
                }}
                className="mr-1 h-6 w-6 items-center justify-center rounded-full bg-chip-inactive"
              >
                <MaterialCommunityIcons
                  name="close"
                  size={14}
                  color="#2D3748"
                />
              </Pressable>
            </View>
          ) : null}

          {recorderState.isRecording ? (
            <View
              className="mt-[11px] flex-row items-center gap-3 rounded-[18px] bg-bg-card px-4 py-3"
              style={inputShadow}
            >
              <View className="h-2.5 w-2.5 rounded-full bg-danger" />
              <Text className="flex-1 font-poppins-medium text-[14.5px] text-ink">
                Listening… {formatSeconds(recorderState.durationMillis)} / 0:
                {MAX_RECORDING_SECONDS}
              </Text>
              <Waveform />
              <Pressable
                onPress={handleCancelRecording}
                className="h-9 w-9 items-center justify-center rounded-xl bg-chip-inactive"
              >
                <MaterialCommunityIcons
                  name="close"
                  size={16}
                  color="#2D3748"
                />
              </Pressable>
              <Pressable
                onPress={handleStopAndSend}
                className="h-11 w-11 items-center justify-center rounded-2xl bg-primary"
              >
                <MaterialCommunityIcons
                  name="check"
                  size={18}
                  color="#FFFFFF"
                />
              </Pressable>
            </View>
          ) : (
            <View className="mt-[11px] flex-row items-end gap-2.5">
              <View
                className="flex-1 flex-row items-center gap-2 rounded-[18px] bg-bg-card px-[11px] py-2.5"
                style={inputShadow}
              >
                <TextInput
                  value={inputText}
                  onChangeText={setInputText}
                  placeholder="Ask anything about your health…"
                  placeholderTextColor="rgba(45,55,72,0.36)"
                  multiline
                  className="flex-1 pl-1 font-poppins text-[14.5px] text-ink"
                />
                <Pressable
                  onPress={handleAttachPress}
                  className="h-9 w-9 items-center justify-center rounded-xl bg-chip-inactive"
                >
                  <MaterialCommunityIcons
                    name="camera-outline"
                    size={17}
                    color="#0D47A1"
                  />
                </Pressable>
              </View>
              {canSend ? (
                <Pressable
                  onPress={() => send()}
                  className="h-16 w-16 items-center justify-center rounded-2xl bg-primary"
                  style={inputShadow}
                >
                  <MaterialCommunityIcons
                    name="send"
                    size={22}
                    color="#FFFFFF"
                  />
                </Pressable>
              ) : (
                <Pressable
                  onPress={handleMicPress}
                  className="h-16 w-16 items-center justify-center rounded-2xl bg-bg-card"
                  style={inputShadow}
                >
                  <MaterialCommunityIcons
                    name="microphone"
                    size={22}
                    color="#0D47A1"
                  />
                </Pressable>
              )}
            </View>
          )}

          <Text className="mt-2.5 text-center font-poppins text-[11px] text-[rgba(45,55,72,0.4)]">
            Follow your doctor's instructions over anything said here.
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
