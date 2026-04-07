import { useMemo, useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { AppShell } from "../components/AppShell";
import { GlassCard } from "../components/GlassCard";
import { foodDatabase } from "../data/foods";
import { getMealTypes } from "../utils/calorie";
import type { AppStateShape, MealType } from "../types";

export function FoodsScreen({ app }: { app: AppStateShape }) {
  const [query, setQuery] = useState("");
  const [selectedMealType, setSelectedMealType] = useState<MealType>("Закуска");
  const [quantity, setQuantity] = useState("100");

  const filteredFoods = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return foodDatabase;
    }

    return foodDatabase.filter((food) =>
      `${food.name} ${food.category}`.toLowerCase().includes(normalized)
    );
  }, [query]);

  return (
    <AppShell
      eyebrow="Foods"
      title="Храни и макронутриенти"
      subtitle="Разглеждай храните по 100 грама и виж калории, протеин, въглехидрати и мазнини."
    >
      <GlassCard>
        <Text style={styles.sectionTitle}>Търси храна</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          style={styles.input}
          placeholder="Например: ориз, яйца, кисело мляко"
          placeholderTextColor="#9d937f"
        />
        <Text style={styles.helper}>
          Показани храни: {filteredFoods.length}
        </Text>
        <TextInput
          value={quantity}
          onChangeText={setQuantity}
          style={styles.input}
          keyboardType="numeric"
          placeholder="Грамаж, например 150"
          placeholderTextColor="#9d937f"
        />
        <View style={styles.mealTypeRow}>
          {getMealTypes().map((mealType) => {
            const isActive = mealType === selectedMealType;
            return (
              <TouchableOpacity
                key={mealType}
                style={[styles.mealTypeChip, isActive && styles.mealTypeChipActive]}
                onPress={() => setSelectedMealType(mealType)}
              >
                <Text style={[styles.mealTypeText, isActive && styles.mealTypeTextActive]}>
                  {mealType}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </GlassCard>

      {filteredFoods.map((food) => (
        <GlassCard key={food.id}>
          <View style={styles.headerRow}>
            <View style={styles.titleWrap}>
              <Text style={styles.foodName}>{food.name}</Text>
              <Text style={styles.foodMeta}>
                {food.category} • {food.serving}
              </Text>
            </View>
            <View style={styles.calorieBadge}>
              <Text style={styles.calorieText}>{food.calories} kcal</Text>
            </View>
          </View>

          <View style={styles.macrosRow}>
            <Macro label="Протеин" value={`${food.protein} г`} />
            <Macro label="Въглехидрати" value={`${food.carbs} г`} />
            <Macro label="Мазнини" value={`${food.fats} г`} />
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() =>
              app.actions.addFoodToDiary(food, selectedMealType, Number(quantity.replace(",", ".")) || 100)
            }
          >
            <Text style={styles.addButtonText}>Добави към {selectedMealType.toLowerCase()}</Text>
          </TouchableOpacity>
        </GlassCard>
      ))}
    </AppShell>
  );
}

function Macro({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.macroBox}>
      <Text style={styles.macroLabel}>{label}</Text>
      <Text style={styles.macroValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1f271f",
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
  helper: {
    color: "#655747",
    lineHeight: 22,
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
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  titleWrap: {
    flex: 1,
    gap: 4,
  },
  foodName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1f271f",
  },
  foodMeta: {
    color: "#6d6559",
    lineHeight: 20,
  },
  calorieBadge: {
    backgroundColor: "#18382c",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    alignSelf: "flex-start",
  },
  calorieText: {
    color: "#fff7eb",
    fontWeight: "800",
  },
  macrosRow: {
    flexDirection: "row",
    gap: 10,
  },
  macroBox: {
    flex: 1,
    backgroundColor: "#f8efdf",
    borderRadius: 18,
    padding: 14,
  },
  macroLabel: {
    color: "#775f48",
    fontSize: 13,
    marginBottom: 6,
  },
  macroValue: {
    color: "#2b231b",
    fontWeight: "800",
    fontSize: 17,
  },
  addButton: {
    backgroundColor: "#10281f",
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff7eb",
    fontWeight: "800",
    fontSize: 15,
  },
});
