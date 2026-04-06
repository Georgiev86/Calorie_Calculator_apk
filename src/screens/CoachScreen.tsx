import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { AppShell } from "../components/AppShell";
import { GlassCard } from "../components/GlassCard";
import type { ChatMessage } from "../types";

type Props = {
  chatMessages: ChatMessage[];
  chatInput: string;
  isSending: boolean;
  syncNotice: string;
  onChatInputChange: (value: string) => void;
  onSend: (prefilled?: string) => void;
};

export function CoachScreen(props: Props) {
  return (
    <AppShell
      eyebrow="AI Coach"
      title="Попитай за меню, макроси и адаптация"
      subtitle="AI коучът може да работи чрез backend или с вграден fallback, ако нямаш връзка."
    >
      <GlassCard>
        <Text style={styles.notice}>{props.syncNotice || "AI coach е готов за въпроси."}</Text>
        <View style={styles.quickActions}>
          {[
            "Направи ми примерно меню",
            "Как да си разпределя макросите?",
            "Как да адаптирам калориите при отслабване?",
          ].map((action) => (
            <TouchableOpacity key={action} style={styles.quickAction} onPress={() => props.onSend(action)}>
              <Text style={styles.quickActionText}>{action}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </GlassCard>

      <GlassCard>
        <Text style={styles.sectionTitle}>Чат</Text>
        <View style={styles.chatList}>
          {props.chatMessages.map((message) => {
            const isAssistant = message.role === "assistant";
            return (
              <View
                key={message.id}
                style={[styles.chatBubble, isAssistant ? styles.assistantBubble : styles.userBubble]}
              >
                <Text style={[styles.chatBubbleText, isAssistant && styles.assistantBubbleText]}>
                  {message.text}
                </Text>
              </View>
            );
          })}
        </View>

        <TextInput
          value={props.chatInput}
          onChangeText={props.onChatInputChange}
          style={styles.input}
          placeholder="Попитай за меню, калории, рецепти..."
          placeholderTextColor="#9d937f"
          multiline
        />

        <TouchableOpacity style={styles.primaryButton} onPress={() => props.onSend()} disabled={props.isSending}>
          {props.isSending ? <ActivityIndicator color="#fff7eb" /> : <Text style={styles.primaryButtonText}>Изпрати</Text>}
        </TouchableOpacity>
      </GlassCard>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  notice: {
    color: "#476052",
    lineHeight: 22,
  },
  quickActions: {
    gap: 10,
  },
  quickAction: {
    backgroundColor: "#efe2cf",
    padding: 14,
    borderRadius: 18,
  },
  quickActionText: {
    color: "#47392b",
    fontWeight: "700",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1f271f",
  },
  chatList: {
    gap: 10,
  },
  chatBubble: {
    borderRadius: 18,
    padding: 14,
  },
  assistantBubble: {
    backgroundColor: "#f3eadc",
    alignSelf: "flex-start",
  },
  userBubble: {
    backgroundColor: "#d96d3a",
    alignSelf: "flex-end",
  },
  chatBubbleText: {
    color: "#fff8f2",
    lineHeight: 22,
  },
  assistantBubbleText: {
    color: "#3d3125",
  },
  input: {
    minHeight: 96,
    textAlignVertical: "top",
    backgroundColor: "#f7eddc",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
    color: "#2f261c",
    borderWidth: 1,
    borderColor: "#ead9c0",
  },
  primaryButton: {
    backgroundColor: "#10281f",
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: "center",
    minHeight: 52,
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#fff7eb",
    fontSize: 16,
    fontWeight: "800",
  },
});
