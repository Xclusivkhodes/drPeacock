import { useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, Text, TextInput, View } from "react-native";

export interface RecordEditField {
  key: string;
  label: string;
  value: string;
  placeholder?: string;
  keyboardType?: "default" | "numeric";
  multiline?: boolean;
}

interface RecordEditModalProps {
  visible: boolean;
  title: string;
  fields: RecordEditField[];
  onClose: () => void;
  onSave: (values: Record<string, string>) => void;
}

/**
 * Generic bottom-sheet edit form reused by every "Edit" button on the Health
 * Record screen — one or more plain text inputs, no per-section custom UI.
 */
export function RecordEditModal({ visible, title, fields, onClose, onSave }: RecordEditModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      {visible ? (
        <RecordEditForm title={title} fields={fields} onClose={onClose} onSave={onSave} />
      ) : null}
    </Modal>
  );
}

function RecordEditForm({
  title,
  fields,
  onClose,
  onSave,
}: Omit<RecordEditModalProps, "visible">) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((field) => [field.key, field.value])),
  );

  const handleSave = () => {
    onSave(values);
    onClose();
  };

  return (
      <KeyboardAvoidingView className="flex-1 justify-end" behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <Pressable className="absolute inset-0 bg-black/40" onPress={onClose} />
        <View className="gap-4 rounded-tl-[24px] rounded-tr-[24px] bg-bg-page px-5 pb-8 pt-6">
          <Text className="font-poppins-bold text-lg text-primary-dark">{title}</Text>

          {fields.map((field) => (
            <View key={field.key} className="gap-1.5">
              <Text className="font-poppins-semibold text-[11px] uppercase tracking-wide text-faint">{field.label}</Text>
              <TextInput
                value={values[field.key] ?? ""}
                onChangeText={(text) => setValues((prev) => ({ ...prev, [field.key]: text }))}
                placeholder={field.placeholder}
                placeholderTextColor="rgba(45,55,72,0.36)"
                keyboardType={field.keyboardType ?? "default"}
                multiline={field.multiline}
                className="rounded-2xl bg-bg-card px-4 py-3 font-poppins-medium text-[15px] text-ink"
              />
            </View>
          ))}

          <View className="mt-2 flex-row gap-2.5">
            <Pressable onPress={onClose} className="flex-1 items-center rounded-2xl bg-chip-inactive py-3.5">
              <Text className="font-poppins-semibold text-[15px] text-ink">Cancel</Text>
            </Pressable>
            <Pressable onPress={handleSave} className="flex-1 items-center rounded-2xl bg-primary py-3.5">
              <Text className="font-poppins-semibold text-[15px] text-white">Save</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
  );
}
