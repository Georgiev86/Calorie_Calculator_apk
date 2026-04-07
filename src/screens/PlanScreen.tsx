import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AppShell } from "../components/AppShell";
import { GlassCard } from "../components/GlassCard";
import { MetricCard } from "../components/MetricCard";
import { foodDatabase } from "../data/foods";
import type { AppStateShape, CalculatedPlan, DiaryEntry, Profile } from "../types";
import { activityLabels, calculateDiaryTotals, formatCalories, getWaterForDate, goalLabels, groupDiaryEntriesByMeal } from "../utils/calorie";

export function PlanScreen({
  plan,
  profile,
  todayEntries,
  app,
}: {
  plan: CalculatedPlan;
  profile: Profile;
  todayEntries: DiaryEntry[];
  app: AppStateShape;
}) {
  const consumed = calculateDiaryTotals(todayEntries);
  const remainingCalories = Math.max(plan.targetCalories - consumed.calories, 0);
  const mealGroups = groupDiaryEntriesByMeal(todayEntries);
  const todayWater = getWaterForDate(app.waterEntries);
  const favoriteFoods = [...app.customFoods, ...foodDatabase].filter((food) =>
    app.favoriteFoodIds.includes(food.id)
  );

  return (
    <AppShell
      eyebrow="Home"
      title="Начало и дневен калориен план"
      subtitle="Виж основната си дневна цел, макросите и разпределението по хранения."
    >
      <GlassCard>
        <Text style={styles.heading}>Дневна калорийна цел</Text>
        <Text style={styles.heroValue}>{formatCalories(plan.targetCalories)}</Text>
        <Text style={styles.caption}>
          {activityLabels[profile.activity]} • {goalLabels[profile.goal]}
        </Text>
      </GlassCard>

      <GlassCard>
        <Text style={styles.sectionTitle}>Изядено днес</Text>
        <View style={styles.metricsGrid}>
          <MetricCard label="Калории" value={formatCalories(consumed.calories)} />
          <MetricCard label="Остават" value={formatCalories(remainingCalories)} />
          <MetricCard label="Протеин" value={`${Math.round(consumed.protein)} g`} />
          <MetricCard label="Въглехидрати" value={`${Math.round(consumed.carbs)} g`} />
          <MetricCard label="Мазнини" value={`${Math.round(consumed.fats)} g`} />
          <MetricCard label="Храни" value={`${todayEntries.length}`} />
        </View>
      </GlassCard>

      <GlassCard>
        <Text style={styles.sectionTitle}>Вода и навици</Text>
        <View style={styles.waterRow}>
          <View>
            <Text style={styles.waterValue}>{todayWater} чаши</Text>
            <Text style={styles.mealMeta}>Цел: 8 чаши за деня</Text>
          </View>
          <View style={styles.waterButtons}>
            <TouchableOpacity style={styles.waterButtonSecondary} onPress={app.actions.decrementWater}>
              <Text style={styles.waterButtonSecondaryText}>-1</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.waterButton} onPress={app.actions.incrementWater}>
              <Text style={styles.waterButtonText}>+1 чаша</Text>
            </TouchableOpacity>
          </View>
        </View>
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

      <GlassCard>
        <Text style={styles.sectionTitle}>Дневен статус по хранения</Text>
        <View style={styles.mealList}>
          {Object.entries(mealGroups).map(([mealType, entries]) => {
            const totals = calculateDiaryTotals(entries);
            return (
              <View key={mealType} style={styles.mealItem}>
                <View>
                  <Text style={styles.mealName}>{mealType}</Text>
                  <Text style={styles.mealMeta}>{entries.length} храни</Text>
                </View>
                <View>
                  <Text style={styles.mealCalories}>{Math.round(totals.calories)} kcal</Text>
                  <Text style={styles.mealMeta}>
                    П {Math.round(totals.protein)} • В {Math.round(totals.carbs)} • М {Math.round(totals.fats)}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </GlassCard>

      {favoriteFoods.length ? (
        <GlassCard>
          <Text style={styles.sectionTitle}>Любими храни за бързо добавяне</Text>
          <View style={styles.quickFoodsWrap}>
            {favoriteFoods.slice(0, 6).map((food) => (
              <TouchableOpacity
                key={food.id}
                style={styles.quickFoodChip}
                onPress={() => app.actions.addFoodToDiary(food, "Междинно", 100)}
              >
                <Text style={styles.quickFoodTitle}>{food.name}</Text>
                <Text style={styles.quickFoodMeta}>{food.calories} kcal</Text>
              </TouchableOpacity>
            ))}
          </View>
        </GlassCard>
      ) : null}
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
  mealMeta: {
    color: "#7a6a58",
    fontSize: 13,
    marginTop: 4,
  },
  waterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  waterValue: {
    color: "#17372b",
    fontSize: 30,
    fontWeight: "900",
  },
  waterButtons: {
    flexDirection: "row",
    gap: 8,
  },
  waterButton: {
    backgroundColor: "#10281f",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  waterButtonText: {
    color: "#fff7eb",
    fontWeight: "800",
  },
  waterButtonSecondary: {
    backgroundColor: "#efe4d4",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  waterButtonSecondaryText: {
    color: "#43372b",
    fontWeight: "800",
  },
  quickFoodsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  quickFoodChip: {
    width: "48%",
    backgroundColor: "#f8efdf",
    borderRadius: 18,
    padding: 14,
  },
  quickFoodTitle: {
    color: "#392f25",
    fontWeight: "800",
    marginBottom: 4,
  },
  quickFoodMeta: {
    color: "#7a6a58",
    fontSize: 13,
  },
});
