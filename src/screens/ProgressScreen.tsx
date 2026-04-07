import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { AppShell } from "../components/AppShell";
import { GlassCard } from "../components/GlassCard";
import { MetricCard } from "../components/MetricCard";
import { ProgressChart } from "../components/ProgressChart";
import type { DiaryEntry, ProgressEntry } from "../types";
import { calculateDiaryTotals, calculateWeightDelta } from "../utils/calorie";

type Props = {
  entries: ProgressEntry[];
  progressWeight: string;
  progressNote: string;
  targetWeightContext: number;
  exportNotice: string;
  todayEntries: DiaryEntry[];
  onProgressWeightChange: (value: string) => void;
  onProgressNoteChange: (value: string) => void;
  onSaveEntry: () => void;
  onExportPdf: (period: "day" | "week") => void;
  onRemoveDiaryEntry: (entryId: string) => void;
};

export function ProgressScreen(props: Props) {
  const latestEntry = props.entries[0];
  const delta = calculateWeightDelta(props.entries);
  const todayTotals = calculateDiaryTotals(props.todayEntries);
  const averageWeight =
    props.entries.length > 0
      ? props.entries.reduce((sum, entry) => sum + entry.weight, 0) / props.entries.length
      : props.targetWeightContext;

  return (
    <AppShell
      eyebrow="History"
      title="История и проследяване"
      subtitle="Записвай промени, виж тренда и пази историята си локално или в cloud."
    >
      <GlassCard>
        <Text style={styles.sectionTitle}>Dashboard</Text>
        <View style={styles.metricsGrid}>
          <MetricCard label="Последно тегло" value={`${latestEntry?.weight ?? props.targetWeightContext} кг`} />
          <MetricCard label="Средно тегло" value={`${averageWeight.toFixed(1)} кг`} />
          <MetricCard label="Промяна" value={`${delta > 0 ? "+" : ""}${delta.toFixed(1)} кг`} />
          <MetricCard label="Записи" value={`${props.entries.length}`} />
          <MetricCard label="Изядени kcal" value={`${Math.round(todayTotals.calories)} kcal`} />
          <MetricCard label="Храни днес" value={`${props.todayEntries.length}`} />
        </View>
      </GlassCard>

      <GlassCard>
        <Text style={styles.sectionTitle}>Днешни хранения</Text>
        <View style={styles.historyList}>
          {props.todayEntries.length ? (
            props.todayEntries.map((entry) => (
              <View key={entry.id} style={styles.historyItem}>
                <Text style={styles.historyDate}>{entry.mealType}</Text>
                <Text style={styles.historyWeight}>{entry.foodName}</Text>
                <Text style={styles.historyNote}>
                  {Math.round(entry.calories)} kcal • {entry.serving} • П {Math.round(entry.protein)} г • В {Math.round(entry.carbs)} г • М {Math.round(entry.fats)} г
                </Text>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => props.onRemoveDiaryEntry(entry.id)}
                >
                  <Text style={styles.removeButtonText}>Премахни</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={styles.emptyState}>Все още няма добавени храни за днес.</Text>
          )}
        </View>
      </GlassCard>

      <ProgressChart entries={props.entries} />

      <GlassCard>
        <Text style={styles.sectionTitle}>PDF отчет</Text>
        <Text style={styles.helper}>
          Можеш да свалиш отчет с данните си за ден или за последните 7 дни като PDF файл.
        </Text>
        <View style={styles.exportRow}>
          <TouchableOpacity style={styles.exportButton} onPress={() => props.onExportPdf("day")}>
            <Text style={styles.exportButtonText}>PDF за ден</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.exportButtonSecondary}
            onPress={() => props.onExportPdf("week")}
          >
            <Text style={styles.exportButtonSecondaryText}>PDF за седмица</Text>
          </TouchableOpacity>
        </View>
        {props.exportNotice ? <Text style={styles.exportNotice}>{props.exportNotice}</Text> : null}
      </GlassCard>

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
  helper: {
    color: "#655747",
    lineHeight: 22,
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
  exportRow: {
    flexDirection: "row",
    gap: 10,
  },
  exportButton: {
    flex: 1,
    backgroundColor: "#10281f",
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: "center",
  },
  exportButtonText: {
    color: "#fff7eb",
    fontSize: 15,
    fontWeight: "800",
  },
  exportButtonSecondary: {
    flex: 1,
    backgroundColor: "#efe4d4",
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: "center",
  },
  exportButtonSecondaryText: {
    color: "#42362c",
    fontSize: 15,
    fontWeight: "800",
  },
  exportNotice: {
    color: "#476052",
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
  removeButton: {
    alignSelf: "flex-start",
    backgroundColor: "#efe4d4",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 4,
  },
  removeButtonText: {
    color: "#4a3c2e",
    fontWeight: "700",
  },
});
