import { StyleSheet, Text, View } from "react-native";
import { AppShell } from "../components/AppShell";
import { GlassCard } from "../components/GlassCard";
import { recipeDatabase } from "../data/foods";

export function RecipesScreen() {
  return (
    <AppShell
      eyebrow="Recipes"
      title="Идеи за рецепти и хранения"
      subtitle="Тук са първите примерни рецепти, които можем после да вържем към AI и хранителен дневник."
    >
      {recipeDatabase.map((recipe) => (
        <GlassCard key={recipe.id}>
          <Text style={styles.recipeName}>{recipe.name}</Text>
          <Text style={styles.recipeMeta}>
            {recipe.mealType} • {recipe.calories} kcal
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
  badgeText: {
    color: "#47392b",
    fontWeight: "700",
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
});
