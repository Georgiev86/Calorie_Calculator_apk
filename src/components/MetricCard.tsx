import { StyleSheet, Text, View } from "react-native";

export function MetricCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.metricBox}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  metricBox: {
    width: "48%",
    backgroundColor: "#f8f1e6",
    borderRadius: 20,
    padding: 14,
  },
  metricLabel: {
    fontSize: 13,
    color: "#7a6b58",
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 19,
    fontWeight: "700",
    color: "#2d241a",
  },
});
