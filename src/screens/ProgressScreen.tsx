import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { AppShell } from "../components/AppShell";
import { GlassCard } from "../components/GlassCard";
import { MetricCard } from "../components/MetricCard";
import { ProgressChart } from "../components/ProgressChart";
import type { ProgressEntry } from "../types";
import { calculateWeightDelta } from "../utils/calorie";

type Props = {
  entries: ProgressEntry[];
  progressWeight: string;
  progressNote: string;
  targetWeightContext: number;
  onProgressWeightChange: (value: string) => void;
  onProgressNoteChange: (value: string) => void;
  onSaveEntry: () => void;
};

export function ProgressScreen(props: Props) {
  const latestEntry = props.entries[0];
  const delta = calculateWeightDelta(props.entries);
  const averageWeight =
    props.entries.length > 0
      ? props.entries.reduce((sum, entry) => sum + entry.weight, 0) / props.entries.length
      : props.targetWeightContext;

  return (
    <AppShell
      eyebrow="Progress"
      title="Следи теглото и навиците си"
      subtitle="Записвай промени, виж тренда и пази историята си в cloud."
    >
      <GlassCard>
        <Text style={styles.sectionTitle}>Dashboard</Text>
        <View style={styles.metricsGrid}>
          <MetricCard label="Последно тегло" value={`${latestEntry?.weight ?? props.targetWeightContext} кг`} />
          <MetricCard label="Средно тегло" value={`${averageWeight.toFixed(1)} кг`} />
          <MetricCard label="Промяна" value={`${delta > 0 ? "+" : ""}${delta.toFixed(1)} кг`} />
          <MetricCard label="Записи" value={`${props.entries.length}`} />
        </View>
      </GlassCard>

      <ProgressChart entries={props.entries} />

      <GlassCard>
        <Text style={styles.sectionTitle}>Нов запис</Text>
        <View style={styles.field}>
          <Text style={styles.label}>Тегло</Text>
          <TextInput
            keyboardType="numeric"
            value={props.progressWeight}
            onChangeText={props.onProgressWeightChange}
            style={styles.input}
            placeholder="Пример: 78.4"
            placeholderTextColor="#9d937f"
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Бележка</Text>
          <TextInput
            value={props.progressNote}
            onChangeText={props.onProgressNoteChange}
            style={[styles.input, styles.noteInput]}
            placeholder="Напр. повече енергия, по-леко храносмилане, силна тренировка"
            placeholderTextColor="#9d937f"
            multiline
          />
        </View>
        <TouchableOpacity
          style={[styles.primaryButton, !props.progressWeight && styles.buttonDisabled]}
          disabled={!props.progressWeight}
          onPress={props.onSaveEntry}
        >
          <Text style={styles.primaryButtonText}>Запази прогрес</Text>
        </TouchableOpacity>
      </GlassCard>

      <GlassCard>
        <Text style={styles.sectionTitle}>История</Text>
        <View style={styles.historyList}>
          {props.entries.length ? (
            props.entries.map((entry) => (
              <View key={entry.id} style={styles.historyItem}>
                <Text style={styles.historyDate}>{entry.date}</Text>
                <Text style={styles.historyWeight}>{entry.weight} кг</Text>
                {entry.note ? <Text style={styles.historyNote}>{entry.note}</Text> : null}
              </View>
            ))
          ) : (
            <Text style={styles.emptyState}>Все още няма записан прогрес.</Text>
          )}
        </View>
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
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
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
  noteInput: {
    minHeight: 88,
    textAlignVertical: "top",
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
  historyList: {
    gap: 10,
  },
  historyItem: {
    backgroundColor: "#fbf0de",
    borderRadius: 18,
    padding: 14,
    gap: 4,
  },
  historyDate: {
    color: "#8b6f54",
    fontSize: 13,
  },
  historyWeight: {
    color: "#2d241a",
    fontSize: 19,
    fontWeight: "700",
  },
  historyNote: {
    color: "#5c4d3d",
    lineHeight: 20,
  },
  emptyState: {
    color: "#675747",
    lineHeight: 22,
  },
});
