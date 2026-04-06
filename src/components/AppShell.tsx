import { LinearGradient } from "expo-linear-gradient";
import { ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export function AppShell({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <LinearGradient colors={["#153529", "#24483b", "#335d4f"]} style={styles.hero}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </LinearGradient>
      <View style={styles.content}>{children}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 18,
    paddingBottom: 34,
    gap: 18,
  },
  hero: {
    borderRadius: 30,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 7,
  },
  eyebrow: {
    color: "#cadccf",
    textTransform: "uppercase",
    letterSpacing: 2.4,
    fontSize: 12,
    marginBottom: 10,
  },
  title: {
    color: "#fff7eb",
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 36,
    marginBottom: 10,
  },
  subtitle: {
    color: "#d9e0d7",
    lineHeight: 22,
    fontSize: 15,
  },
  content: {
    gap: 16,
  },
});
