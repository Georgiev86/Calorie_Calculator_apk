import { StyleSheet, Text, View } from "react-native";
import type { ProgressEntry } from "../types";

export function ProgressChart({
  entries,
}: {
  entries: ProgressEntry[];
}) {
  if (!entries.length) {
    return (
      <View style={styles.emptyChart}>
        <Text style={styles.emptyText}>Добави поне едно тегло, за да се покаже графика.</Text>
      </View>
    );
  }

  const chartEntries = [...entries].reverse().slice(-7);
  const weights = chartEntries.map((entry) => entry.weight);
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  const range = Math.max(max - min, 1);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Тегло за последните записи</Text>
      <View style={styles.chart}>
        {chartEntries.map((entry) => {
          const heightPercent = 28 + ((entry.weight - min) / range) * 72;
          return (
            <View key={entry.id} style={styles.columnWrap}>
              <Text style={styles.weightLabel}>{entry.weight}</Text>
              <View style={styles.columnTrack}>
                <View style={[styles.columnFill, { height: `${heightPercent}%` }]} />
              </View>
              <Text style={styles.dateLabel}>{entry.date.slice(5)}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fbf0de",
    borderRadius: 22,
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2d241a",
  },
  chart: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 8,
    minHeight: 210,
  },
  columnWrap: {
    flex: 1,
    alignItems: "center",
    gap: 8,
  },
  weightLabel: {
    color: "#6b5843",
    fontSize: 12,
  },
  columnTrack: {
    width: "100%",
    height: 140,
    backgroundColor: "#ecd6b9",
    borderRadius: 999,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  columnFill: {
    width: "100%",
    backgroundColor: "#c96f3b",
    borderRadius: 999,
  },
  dateLabel: {
    color: "#7e6650",
    fontSize: 12,
  },
  emptyChart: {
    backgroundColor: "#fbf0de",
    borderRadius: 22,
    padding: 18,
  },
  emptyText: {
    color: "#6d5741",
    lineHeight: 22,
  },
});
