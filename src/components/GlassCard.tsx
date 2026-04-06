import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

export function GlassCard({ children }: { children: ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fffaf3",
    borderRadius: 26,
    padding: 18,
    borderWidth: 1,
    borderColor: "#eadfce",
    shadowColor: "#2b261f",
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
    gap: 14,
  },
});
