import { useMemo, useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { AppShell } from "../components/AppShell";
import { GlassCard } from "../components/GlassCard";
import { recipeDatabase } from "../data/foods";
import { foodDatabase } from "../data/foods";
import type { AppStateShape, FoodItem, MealType, RecipeItem } from "../types";
import { getMealTypes } from "../utils/calorie";

export function RecipesScreen({ app }: { app: AppStateShape }) {
  const [recipeName, setRecipeName] = useState("");
  const [recipeMealType, setRecipeMealType] = useState<MealType>("Обяд");
  const [selectedFoodIds, setSelectedFoodIds] = useState<string[]>([]);

  const allFoods = useMemo(() => [...app.customFoods, ...foodDatabase], [app.customFoods]);
  const allRecipes: RecipeItem[] = useMemo(
    () => [...app.customRecipes, ...recipeDatabase],
    [app.customRecipes]
  );

  function toggleFood(foodId: string) {
    setSelectedFoodIds((current) =>
      current.includes(foodId) ? current.filter((id) => id !== foodId) : [...current, foodId]
    );
  }

  function buildRecipeFromSelection() {
    const selectedFoods = allFoods.filter((food) => selectedFoodIds.includes(food.id));
    return {
      calories: selectedFoods.reduce((sum, food) => sum + food.calories, 0),
      protein: selectedFoods.reduce((sum, food) => sum + food.protein, 0),
      carbs: selectedFoods.reduce((sum, food) => sum + food.carbs, 0),
      fats: selectedFoods.reduce((sum, food) => sum + food.fats, 0),
      ingredients: selectedFoods.map((food) => food.name),
    };
  }

  return (
    <AppShell
      eyebrow="Recipes"
      title="Рецепти и собствени комбинации"
      subtitle="Използвай готовите рецепти или си създай свои от базовите и custom храни."
    >
      <GlassCard>
        <Text style={styles.recipeName}>Моя рецепта</Text>
        <TextInput
          value={recipeName}
          onChangeText={setRecipeName}
          style={styles.input}
          placeholder="Например: Закуска с овес и кисело мляко"
          placeholderTextColor="#9d937f"
        />
        <View style={styles.macroRow}>
          {getMealTypes().map((meal) => {
            const isActive = meal === recipeMealType;
            return (
              <TouchableOpacity
                key={meal}
                style={[styles.badge, isActive && styles.badgeActive]}
                onPress={() => setRecipeMealType(meal)}
              >
                <Text style={[styles.badgeText, isActive && styles.badgeTextActive]}>{meal}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <Text style={styles.ingredientsTitle}>Избери продукти</Text>
        <View style={styles.foodPickWrap}>
          {allFoods.slice(0, 16).map((food: FoodItem) => {
            const isSelected = selectedFoodIds.includes(food.id);
            return (
              <TouchableOpacity
                key={food.id}
                style={[styles.foodChip, isSelected && styles.foodChipActive]}
                onPress={() => toggleFood(food.id)}
              >
                <Text style={[styles.foodChipText, isSelected && styles.foodChipTextActive]}>
                  {food.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={async () => {
            if (!recipeName.trim() || !selectedFoodIds.length) {
              return;
            }

            const recipeStats = buildRecipeFromSelection();

            await app.actions.addCustomRecipe({
              name: recipeName.trim(),
              mealType: recipeMealType,
              calories: Math.round(recipeStats.calories),
              protein: Math.round(recipeStats.protein),
              carbs: Math.round(recipeStats.carbs),
              fats: Math.round(recipeStats.fats),
              ingredients: recipeStats.ingredients,
              isCustom: true,
            });

            setRecipeName("");
            setSelectedFoodIds([]);
          }}
        >
          <Text style={styles.primaryButtonText}>Запази рецепта</Text>
        </TouchableOpacity>
      </GlassCard>

      {allRecipes.map((recipe) => (
        <GlassCard key={recipe.id}>
          <Text style={styles.recipeName}>{recipe.name}</Text>
          <Text style={styles.recipeMeta}>
            {recipe.mealType} • {recipe.calories} kcal
            {recipe.isCustom ? " • Моя рецепта" : ""}
          </Text>
          <View style={styles.macroRow}>
            <Badge text={`П: ${recipe.protein} г`} />
            <Badge text={`В: ${recipe.carbs} г`} />
            <Badge text={`М: ${recipe.fats} г`} />
          </View>
          <Text style={styles.ingredientsTitle}>Съставки</Text>
          {recipe.ingredients.map((item) => (
            <Text key={item} style={styles.ingredient}>
              • {item}
            </Text>
          ))}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => app.actions.addRecipeToDiary(recipe, recipe.mealType as MealType)}
          >
            <Text style={styles.primaryButtonText}>Добави към дневника</Text>
          </TouchableOpacity>
        </GlassCard>
      ))}
    </AppShell>
  );
}

function Badge({ text }: { text: string }) {
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  recipeName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1f271f",
  },
  recipeMeta: {
    color: "#6d6559",
    lineHeight: 22,
  },
  macroRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  badge: {
    backgroundColor: "#efe2cf",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  badgeActive: {
    backgroundColor: "#d96d3a",
  },
  badgeText: {
    color: "#47392b",
    fontWeight: "700",
  },
  badgeTextActive: {
    color: "#fff7eb",
  },
  ingredientsTitle: {
    fontWeight: "800",
    color: "#342b22",
    marginTop: 4,
  },
  ingredient: {
    color: "#5a4b3b",
    lineHeight: 22,
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
  foodPickWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  foodChip: {
    backgroundColor: "#f4eadb",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  foodChipActive: {
    backgroundColor: "#18382c",
  },
  foodChipText: {
    color: "#47392b",
    fontWeight: "700",
  },
  foodChipTextActive: {
    color: "#fff7eb",
  },
  primaryButton: {
    backgroundColor: "#10281f",
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#fff7eb",
    fontWeight: "800",
    fontSize: 15,
  },
});
