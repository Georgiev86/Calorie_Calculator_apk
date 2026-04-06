import { StyleSheet, Text, View } from "react-native";
import { AppShell } from "../components/AppShell";
import { GlassCard } from "../components/GlassCard";
import { MetricCard } from "../components/MetricCard";
import type { CalculatedPlan, Profile } from "../types";
import { activityLabels, formatCalories, goalLabels } from "../utils/calorie";

export function PlanScreen({
  plan,
  profile,
}: {
  plan: CalculatedPlan;
  profile: Profile;
}) {
  return (
    <AppShell
      eyebrow="Nutrition"
      title="Персонален калориен план"
      subtitle="Базирано на профила ти, целта и нивото на активност."
    >
      <GlassCard>
        <Text style={styles.heading}>Дневна калорийна цел</Text>
        <Text style={styles.heroValue}>{formatCalories(plan.targetCalories)}</Text>
        <Text style={styles.caption}>
          {activityLabels[profile.activity]} • {goalLabels[profile.goal]}
        </Text>
      </GlassCard>

      <GlassCard>
        <Text style={styles.sectionTitle}>Макроси и метрики</Text>
        <View style={styles.metricsGrid}>
          <MetricCard label="BMR" value={formatCalories(plan.bmr)} />
          <MetricCard label="Поддържане" value={formatCalories(plan.maintenanceCalories)} />
          <MetricCard label="Протеин" value={`${Math.round(plan.protein)} g`} />
          <MetricCard label="Мазнини" value={`${Math.round(plan.fats)} g`} />
          <MetricCard label="Въглехидрати" value={`${Math.round(plan.carbs)} g`} />
          <MetricCard label="На хранене" value={formatCalories(plan.caloriesPerMeal)} />
        </View>
      </GlassCard>

      <GlassCard>
        <Text style={styles.sectionTitle}>Разпределение по хранения</Text>
        <View style={styles.mealList}>
          {plan.mealPlan.map((meal) => (
            <View key={meal.name} style={styles.mealItem}>
              <Text style={styles.mealName}>{meal.name}</Text>
              <Text style={styles.mealCalories}>{formatCalories(meal.calories)}</Text>
            </View>
          ))}
        </View>
      </GlassCard>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 18,
    color: "#6a5947",
    fontWeight: "700",
  },
  heroValue: {
    fontSize: 40,
    color: "#1f271f",
    fontWeight: "900",
  },
  caption: {
    color: "#6d6559",
    lineHeight: 22,
  },
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
  mealList: {
    gap: 10,
  },
  mealItem: {
    backgroundColor: "#f8efdf",
    borderRadius: 18,
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  mealName: {
    color: "#44372a",
    fontWeight: "700",
  },
  mealCalories: {
    color: "#c15e2d",
    fontWeight: "800",
  },
});
