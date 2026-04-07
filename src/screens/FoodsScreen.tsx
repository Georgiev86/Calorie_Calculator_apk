import { useMemo, useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { AppShell } from "../components/AppShell";
import { GlassCard } from "../components/GlassCard";
import { foodDatabase } from "../data/foods";
import { getMealTypes } from "../utils/calorie";
import type { AppStateShape, FoodItem, MealType } from "../types";

export function FoodsScreen({ app }: { app: AppStateShape }) {
  const [query, setQuery] = useState("");
  const [selectedMealType, setSelectedMealType] = useState<MealType>("Закуска");
  const [quantity, setQuantity] = useState("100");
  const [customName, setCustomName] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [customCalories, setCustomCalories] = useState("");
  const [customProtein, setCustomProtein] = useState("");
  const [customCarbs, setCustomCarbs] = useState("");
  const [customFats, setCustomFats] = useState("");

  const allFoods = useMemo(() => [...app.customFoods, ...foodDatabase], [app.customFoods]);

  const filteredFoods = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return allFoods;
    }

    return allFoods.filter((food) =>
      `${food.name} ${food.category}`.toLowerCase().includes(normalized)
    );
  }, [allFoods, query]);

  const favoriteFoods = useMemo(
    () => allFoods.filter((food) => app.favoriteFoodIds.includes(food.id)),
    [allFoods, app.favoriteFoodIds]
  );

  const recentFoods = useMemo(
    () =>
      app.recentFoodIds
        .map((id) => allFoods.find((food) => food.id === id))
        .filter((food): food is FoodItem => Boolean(food)),
    [allFoods, app.recentFoodIds]
  );

  function renderFoodCard(food: FoodItem) {
    const isFavorite = app.favoriteFoodIds.includes(food.id);

    return (
      <GlassCard key={food.id}>
        <View style={styles.headerRow}>
          <View style={styles.titleWrap}>
            <Text style={styles.foodName}>{food.name}</Text>
            <Text style={styles.foodMeta}>
              {food.category} • {food.serving}
              {food.isCustom ? " • Моя храна" : ""}
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

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() =>
              app.actions.addFoodToDiary(food, selectedMealType, Number(quantity.replace(",", ".")) || 100)
            }
          >
            <Text style={styles.addButtonText}>Добави към {selectedMealType.toLowerCase()}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.favoriteButton, isFavorite && styles.favoriteButtonActive]}
            onPress={() => app.actions.toggleFavoriteFood(food.id)}
          >
            <Text style={[styles.favoriteButtonText, isFavorite && styles.favoriteButtonTextActive]}>
              {isFavorite ? "Любима" : "В любими"}
            </Text>
          </TouchableOpacity>
        </View>
      </GlassCard>
    );
  }

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

      <GlassCard>
        <Text style={styles.sectionTitle}>Моя храна</Text>
        <TextInput value={customName} onChangeText={setCustomName} style={styles.input} placeholder="Име на храната" placeholderTextColor="#9d937f" />
        <TextInput value={customCategory} onChangeText={setCustomCategory} style={styles.input} placeholder="Категория" placeholderTextColor="#9d937f" />
        <View style={styles.customRow}>
          <TextInput value={customCalories} onChangeText={setCustomCalories} style={styles.inputHalf} keyboardType="numeric" placeholder="Kcal" placeholderTextColor="#9d937f" />
          <TextInput value={customProtein} onChangeText={setCustomProtein} style={styles.inputHalf} keyboardType="numeric" placeholder="Протеин" placeholderTextColor="#9d937f" />
        </View>
        <View style={styles.customRow}>
          <TextInput value={customCarbs} onChangeText={setCustomCarbs} style={styles.inputHalf} keyboardType="numeric" placeholder="Въглехидрати" placeholderTextColor="#9d937f" />
          <TextInput value={customFats} onChangeText={setCustomFats} style={styles.inputHalf} keyboardType="numeric" placeholder="Мазнини" placeholderTextColor="#9d937f" />
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={async () => {
            if (!customName.trim()) {
              return;
            }

            await app.actions.addCustomFood({
              name: customName.trim(),
              category: customCategory.trim() || "Моя категория",
              serving: "100 г",
              calories: Number(customCalories.replace(",", ".")) || 0,
              protein: Number(customProtein.replace(",", ".")) || 0,
              carbs: Number(customCarbs.replace(",", ".")) || 0,
              fats: Number(customFats.replace(",", ".")) || 0,
              isCustom: true,
            });

            setCustomName("");
            setCustomCategory("");
            setCustomCalories("");
            setCustomProtein("");
            setCustomCarbs("");
            setCustomFats("");
          }}
        >
          <Text style={styles.addButtonText}>Добави моя храна</Text>
        </TouchableOpacity>
      </GlassCard>

      {favoriteFoods.length ? (
        <GlassCard>
          <Text style={styles.sectionTitle}>Любими</Text>
          <Text style={styles.helper}>Бърз достъп до най-често използваните храни.</Text>
        </GlassCard>
      ) : null}
      {favoriteFoods.map(renderFoodCard)}

      {recentFoods.length ? (
        <GlassCard>
          <Text style={styles.sectionTitle}>Последни</Text>
          <Text style={styles.helper}>Последно добавяните от теб храни.</Text>
        </GlassCard>
      ) : null}
      {recentFoods.map(renderFoodCard)}

      <GlassCard>
        <Text style={styles.sectionTitle}>Всички храни</Text>
        <Text style={styles.helper}>Базови храни плюс твоите custom записи.</Text>
      </GlassCard>
      {filteredFoods.map(renderFoodCard)}
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
  actionRow: {
    gap: 10,
  },
  favoriteButton: {
    backgroundColor: "#efe4d4",
    borderRadius: 18,
    paddingVertical: 12,
    alignItems: "center",
  },
  favoriteButtonActive: {
    backgroundColor: "#d96d3a",
  },
  favoriteButtonText: {
    color: "#4a3c2e",
    fontWeight: "800",
    fontSize: 15,
  },
  favoriteButtonTextActive: {
    color: "#fff7eb",
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
  customRow: {
    flexDirection: "row",
    gap: 10,
  },
  inputHalf: {
    flex: 1,
    backgroundColor: "#f7eddc",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
    color: "#2f261c",
    borderWidth: 1,
    borderColor: "#ead9c0",
  },
});
