import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { AppShell } from "../components/AppShell";
import { GlassCard } from "../components/GlassCard";
import { MetricCard } from "../components/MetricCard";
import { ProgressChart } from "../components/ProgressChart";
import type { DiaryEntry, MealType, ProgressEntry } from "../types";
import { calculateDiaryTotals, calculateWeightDelta, formatDateLabel, getAvailableDiaryDates, getMealTypes, groupDiaryEntriesByMeal } from "../utils/calorie";

type Props = {
  entries: ProgressEntry[];
  progressWeight: string;
  progressNote: string;
  targetWeightContext: number;
  exportNotice: string;
  diaryEntries: DiaryEntry[];
  onProgressWeightChange: (value: string) => void;
  onProgressNoteChange: (value: string) => void;
  onSaveEntry: () => void;
  onExportPdf: (period: "day" | "week") => void;
  onRemoveDiaryEntry: (entryId: string) => void;
  onUpdateDiaryEntry: (entryId: string, updates: { mealType: MealType; quantityGrams: number }) => void;
};

export function ProgressScreen(props: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editMealType, setEditMealType] = useState<MealType>("Закуска");
  const [editQuantity, setEditQuantity] = useState("100");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const latestEntry = props.entries[0];
  const delta = calculateWeightDelta(props.entries);
  const availableDates = getAvailableDiaryDates(props.diaryEntries);
  const activeDate = selectedDate ?? availableDates[0] ?? null;
  const selectedEntries = activeDate
    ? props.diaryEntries.filter((entry) => entry.date === activeDate)
    : [];
  const todayTotals = calculateDiaryTotals(selectedEntries);
  const mealGroups = groupDiaryEntriesByMeal(selectedEntries);
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
          <MetricCard label="Храни за деня" value={`${selectedEntries.length}`} />
        </View>
      </GlassCard>

      <GlassCard>
        <Text style={styles.sectionTitle}>Днешни хранения</Text>
        <View style={styles.dateRow}>
          {availableDates.slice(0, 7).map((date) => {
            const isActive = date === activeDate;
            return (
              <TouchableOpacity
                key={date}
                style={[styles.dateChip, isActive && styles.dateChipActive]}
                onPress={() => setSelectedDate(date)}
              >
                <Text style={[styles.dateChipText, isActive && styles.dateChipTextActive]}>
                  {formatDateLabel(date)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={styles.historyList}>
          {selectedEntries.length ? (
            Object.entries(mealGroups).map(([mealType, entries]) => {
              const totals = calculateDiaryTotals(entries);

              if (!entries.length) {
                return null;
              }

              return (
                <View key={mealType} style={styles.mealGroup}>
                  <View style={styles.mealGroupHeader}>
                    <Text style={styles.sectionSubTitle}>{mealType}</Text>
                    <Text style={styles.sectionSubMeta}>
                      {Math.round(totals.calories)} kcal • П {Math.round(totals.protein)} • В {Math.round(totals.carbs)} • М {Math.round(totals.fats)}
                    </Text>
                  </View>

                  <View style={styles.historyList}>
                    {entries.map((entry) => {
                      const isEditing = editingId === entry.id;
                      return (
                        <View key={entry.id} style={styles.historyItem}>
                          <Text style={styles.historyWeight}>{entry.foodName}</Text>
                          <Text style={styles.historyNote}>
                            {Math.round(entry.calories)} kcal • {entry.serving} • П {Math.round(entry.protein)} г • В {Math.round(entry.carbs)} г • М {Math.round(entry.fats)} г
                          </Text>

                          {isEditing ? (
                            <View style={styles.editWrap}>
                              <TextInput
                                value={editQuantity}
                                onChangeText={setEditQuantity}
                                style={styles.input}
                                keyboardType="numeric"
                                placeholder="Грамаж"
                                placeholderTextColor="#9d937f"
                              />
                              <View style={styles.mealTypeRow}>
                                {getMealTypes().map((mealOption) => {
                                  const isActive = mealOption === editMealType;
                                  return (
                                    <TouchableOpacity
                                      key={mealOption}
                                      style={[styles.mealTypeChip, isActive && styles.mealTypeChipActive]}
                                      onPress={() => setEditMealType(mealOption)}
                                    >
                                      <Text style={[styles.mealTypeText, isActive && styles.mealTypeTextActive]}>
                                        {mealOption}
                                      </Text>
                                    </TouchableOpacity>
                                  );
                                })}
                              </View>
                              <View style={styles.actionRow}>
                                <TouchableOpacity
                                  style={styles.saveEditButton}
                                  onPress={() => {
                                    props.onUpdateDiaryEntry(entry.id, {
                                      mealType: editMealType,
                                      quantityGrams: Number(editQuantity.replace(",", ".")) || entry.quantityGrams,
                                    });
                                    setEditingId(null);
                                  }}
                                >
                                  <Text style={styles.saveEditText}>Запази</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                  style={styles.cancelButton}
                                  onPress={() => setEditingId(null)}
                                >
                                  <Text style={styles.cancelText}>Отказ</Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                          ) : (
                            <View style={styles.actionRow}>
                              <TouchableOpacity
                                style={styles.editButton}
                                onPress={() => {
                                  setEditingId(entry.id);
                                  setEditMealType(entry.mealType);
                                  setEditQuantity(String(entry.quantityGrams));
                                }}
                              >
                                <Text style={styles.editButtonText}>Редактирай</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={styles.removeButton}
                                onPress={() => props.onRemoveDiaryEntry(entry.id)}
                              >
                                <Text style={styles.removeButtonText}>Премахни</Text>
                              </TouchableOpacity>
                            </View>
                          )}
                        </View>
                      );
                    })}
                  </View>
                </View>
              );
            })
          ) : (
            <Text style={styles.emptyState}>Няма добавени храни за избрания ден.</Text>
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
  dateRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  dateChip: {
    backgroundColor: "#efe4d4",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dateChipActive: {
    backgroundColor: "#18382c",
  },
  dateChipText: {
    color: "#4a3c2e",
    fontWeight: "700",
  },
  dateChipTextActive: {
    color: "#fff7eb",
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
  mealGroup: {
    gap: 10,
  },
  mealGroupHeader: {
    gap: 4,
  },
  sectionSubTitle: {
    color: "#2d241a",
    fontWeight: "800",
    fontSize: 18,
  },
  sectionSubMeta: {
    color: "#7a6a58",
    lineHeight: 20,
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
  editWrap: {
    gap: 10,
    marginTop: 8,
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  editButton: {
    alignSelf: "flex-start",
    backgroundColor: "#18382c",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 4,
  },
  editButtonText: {
    color: "#fff7eb",
    fontWeight: "700",
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
  mealTypeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  mealTypeChip: {
    backgroundColor: "#efe4d4",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  mealTypeChipActive: {
    backgroundColor: "#d96d3a",
  },
  mealTypeText: {
    color: "#4d4133",
    fontWeight: "700",
  },
  mealTypeTextActive: {
    color: "#fffaf3",
  },
  saveEditButton: {
    backgroundColor: "#10281f",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  saveEditText: {
    color: "#fff7eb",
    fontWeight: "700",
  },
  cancelButton: {
    backgroundColor: "#efe4d4",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  cancelText: {
    color: "#4a3c2e",
    fontWeight: "700",
  },
});
