import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AppShell } from "../components/AppShell";
import { GlassCard } from "../components/GlassCard";
import type { AppStateShape } from "../types";
import { hasCloudBackend } from "../services/cloud";

export function ProfileScreen({ app }: { app: AppStateShape }) {
  return (
    <AppShell
      eyebrow="Account"
      title="Акаунт и синхронизация"
      subtitle="Тук виждаш кой е логнат, дали cloud sync е активен и можеш да излезеш от сесията."
    >
      <GlassCard>
        <Text style={styles.sectionTitle}>Потребител</Text>
        <Text style={styles.info}>{app.user?.email ?? "Няма активен потребител"}</Text>
        <Text style={styles.badge}>
          {hasCloudBackend() ? "Cloud backend: свързан" : "Cloud backend: липсва URL"}
        </Text>
        {app.syncNotice ? <Text style={styles.notice}>{app.syncNotice}</Text> : null}
      </GlassCard>

      <GlassCard>
        <Text style={styles.sectionTitle}>Профил</Text>
        {app.parsedProfile ? (
          <>
            <Text style={styles.info}>Възраст: {app.parsedProfile.age}</Text>
            <Text style={styles.info}>Тегло: {app.parsedProfile.weight} кг</Text>
            <Text style={styles.info}>Височина: {app.parsedProfile.height} см</Text>
            <Text style={styles.info}>Хранения: {app.parsedProfile.meals}</Text>
          </>
        ) : (
          <Text style={styles.info}>Профилът все още не е попълнен.</Text>
        )}
      </GlassCard>

      <GlassCard>
        <TouchableOpacity style={styles.logoutButton} onPress={app.actions.logout}>
          <Text style={styles.logoutText}>Изход от акаунта</Text>
        </TouchableOpacity>
      </GlassCard>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1f271f",
  },
  info: {
    color: "#4d4335",
    lineHeight: 22,
  },
  badge: {
    color: "#3e5d51",
    fontWeight: "700",
  },
  notice: {
    color: "#6b5944",
    lineHeight: 22,
  },
  logoutButton: {
    backgroundColor: "#10281f",
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: "center",
  },
  logoutText: {
    color: "#fff7eb",
    fontSize: 16,
    fontWeight: "800",
  },
});
