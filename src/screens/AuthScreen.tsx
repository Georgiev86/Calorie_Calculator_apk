import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { AppShell } from "../components/AppShell";
import { GlassCard } from "../components/GlassCard";
import type { AppStateShape } from "../types";
import { hasCloudBackend } from "../services/cloud";

export function AuthScreen({ app }: { app: AppStateShape }) {
  const [mode, setMode] = useState<"login" | "register">("register");
  const [email, setEmail] = useState("demo@coach.bg");
  const [password, setPassword] = useState("password123");

  return (
    <AppShell
      eyebrow="Welcome"
      title="Логин и cloud sync"
      subtitle="Влез в акаунта си, за да синхронизираш профила и прогреса между устройства."
    >
      <GlassCard>
        <Text style={styles.heading}>{mode === "register" ? "Създай акаунт" : "Вход в акаунт"}</Text>
        <Text style={styles.helper}>
          {hasCloudBackend()
            ? "Cloud backend е открит. Можеш да влезеш или да си създадеш профил."
            : "В момента липсва backend URL. UI-то е готово, но login няма да работи, докато не зададеш EXPO_PUBLIC_AI_BACKEND_URL."}
        </Text>

        <View style={styles.switchRow}>
          <TouchableOpacity
            style={[styles.switchChip, mode === "register" && styles.switchChipActive]}
            onPress={() => setMode("register")}
          >
            <Text style={[styles.switchText, mode === "register" && styles.switchTextActive]}>Регистрация</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.switchChip, mode === "login" && styles.switchChipActive]}
            onPress={() => setMode("login")}
          >
            <Text style={[styles.switchText, mode === "login" && styles.switchTextActive]}>Вход</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Имейл</Text>
          <TextInput
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor="#9d937f"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Парола</Text>
          <TextInput
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            placeholder="Минимум 8 символа"
            placeholderTextColor="#9d937f"
          />
        </View>

        {app.authError ? <Text style={styles.error}>{app.authError}</Text> : null}

        <TouchableOpacity
          style={[styles.primaryButton, app.isAuthLoading && styles.buttonDisabled]}
          disabled={app.isAuthLoading}
          onPress={() => app.actions.authenticate(mode, email.trim(), password)}
        >
          <Text style={styles.primaryButtonText}>
            {app.isAuthLoading ? "Моля, изчакай..." : mode === "register" ? "Създай акаунт" : "Влез"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={app.actions.enterOfflineMode}>
          <Text style={styles.secondaryButtonText}>Продължи офлайн и пази данните на телефона</Text>
        </TouchableOpacity>
      </GlassCard>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1f271f",
  },
  helper: {
    color: "#655747",
    lineHeight: 22,
  },
  switchRow: {
    flexDirection: "row",
    gap: 10,
  },
  switchChip: {
    flex: 1,
    backgroundColor: "#efe4d4",
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
  },
  switchChipActive: {
    backgroundColor: "#d96d3a",
  },
  switchText: {
    color: "#4d4133",
    fontWeight: "700",
  },
  switchTextActive: {
    color: "#fffaf3",
  },
  field: {
    gap: 8,
  },
  label: {
    color: "#4d4335",
    fontWeight: "700",
  },
  input: {
    backgroundColor: "#f7eddc",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
    color: "#2f261c",
    borderWidth: 1,
    borderColor: "#ead9c0",
  },
  error: {
    color: "#a6462f",
    lineHeight: 22,
  },
  primaryButton: {
    backgroundColor: "#10281f",
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  primaryButtonText: {
    color: "#fff7eb",
    fontSize: 16,
    fontWeight: "800",
  },
  secondaryButton: {
    backgroundColor: "#efe4d4",
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#3d352b",
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
    paddingHorizontal: 12,
  },
});
