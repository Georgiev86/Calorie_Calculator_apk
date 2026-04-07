import type { CalculatedPlan, ChatMessage, DiaryEntry, MealType, Profile, ProgressEntry, WaterEntry } from "../types";

export const activityMultipliers = {
  low: 1.2,
  medium: 1.375,
  high: 1.55,
  athlete: 1.725,
} as const;

export const activityLabels = {
  low: "Ниска активност",
  medium: "Умерена активност",
  high: "Висока активност",
  athlete: "Много активен",
} as const;

export const goalLabels = {
  lose: "Отслабване",
  maintain: "Поддържане",
  gain: "Покачване",
} as const;

const goalOffsets = {
  lose: -350,
  maintain: 0,
  gain: 300,
} as const;

const mealLabels = ["Закуска", "Обяд", "Вечеря", "Междинно 1", "Междинно 2", "Междинно 3"];

export function toNumber(value: string) {
  return Number(value.replace(",", "."));
}

export function formatCalories(value: number) {
  return `${Math.round(value)} kcal`;
}

export function isValidProfileInput(profile: Profile) {
  return (
    profile.age > 0 &&
    profile.weight > 0 &&
    profile.height > 0 &&
    profile.meals >= 1 &&
    profile.meals <= 6
  );
}

export function calculateBmr(profile: Profile) {
  const base = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age;
  return profile.gender === "male" ? base + 5 : base - 161;
}

export function calculatePlan(profile: Profile): CalculatedPlan {
  const bmr = calculateBmr(profile);
  const maintenanceCalories = bmr * activityMultipliers[profile.activity];
  const targetCalories = maintenanceCalories + goalOffsets[profile.goal];
  const proteinMultiplier =
    profile.goal === "lose" ? 2 : profile.goal === "gain" ? 1.9 : 1.7;
  const protein = profile.weight * proteinMultiplier;
  const fats = profile.weight * 0.9;
  const carbs = Math.max((targetCalories - protein * 4 - fats * 9) / 4, 0);
  const caloriesPerMeal = targetCalories / profile.meals;

  return {
    bmr,
    maintenanceCalories,
    targetCalories,
    protein,
    fats,
    carbs,
    caloriesPerMeal,
    mealPlan: Array.from({ length: profile.meals }, (_, index) => ({
      name: mealLabels[index] ?? `Хранене ${index + 1}`,
      calories: caloriesPerMeal,
    })),
  };
}

export function createDefaultChatMessages(): ChatMessage[] {
  return [
    {
      id: "welcome",
      role: "assistant",
      text: "Аз съм твоят AI хранителен помощник. Попитай ме за меню, макроси, прогрес или как да си разпределиш храненията.",
    },
  ];
}

export function buildLocalCoachReply(
  prompt: string,
  profile: Profile,
  progress: ProgressEntry[]
) {
  const plan = calculatePlan(profile);
  const latestEntry = progress[0];
  const normalizedPrompt = prompt.toLowerCase();
  const weightContext = latestEntry
    ? `Последно записано тегло: ${latestEntry.weight} кг (${latestEntry.date}).`
    : "Все още няма записан прогрес.";

  if (normalizedPrompt.includes("меню") || normalizedPrompt.includes("храна")) {
    return `За ${goalLabels[profile.goal].toLowerCase()} с цел ${formatCalories(
      plan.targetCalories
    )} бих препоръчал ${profile.meals} хранения. Дръж всяко около ${formatCalories(
      plan.caloriesPerMeal
    )}, с акцент върху ${Math.round(plan.protein)} г протеин за деня. Пример: яйца и овес за закуска, ориз с пиле за обяд, кисело мляко или плод между храненията и риба с картофи или салата вечер.`;
  }

  if (
    normalizedPrompt.includes("отслаб") ||
    normalizedPrompt.includes("качв") ||
    normalizedPrompt.includes("цел")
  ) {
    return `Текущата ти цел е ${goalLabels[profile.goal].toLowerCase()}. Това дава ориентир около ${formatCalories(
      plan.targetCalories
    )} на ден при ${activityLabels[profile.activity].toLowerCase()}. Ако се чувстваш гладен или нямаш енергия, корекция от 100 до 150 kcal е по-безопасна от рязка промяна.`;
  }

  if (
    normalizedPrompt.includes("протеин") ||
    normalizedPrompt.includes("макрос") ||
    normalizedPrompt.includes("въгле")
  ) {
    return `Твоят ориентир е ${Math.round(plan.protein)} г протеин, ${Math.round(
      plan.fats
    )} г мазнини и ${Math.round(plan.carbs)} г въглехидрати. Ако имаш тренировки, сложи повече въглехидрати около тях, а протеинът разпредели равномерно през деня.`;
  }

  return `Виждам профил с ${profile.age} г., ${profile.height} см, ${profile.weight} кг и ${activityLabels[
    profile.activity
  ].toLowerCase()}. ${weightContext} Мога да помогна с меню, разпределение на храненията, идеи за рецепти и адаптиране на калориите според прогреса.`;
}

export function calculateWeightDelta(entries: ProgressEntry[]) {
  if (entries.length < 2) {
    return 0;
  }

  return entries[0].weight - entries[entries.length - 1].weight;
}

export function formatDateLabel(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("bg-BG", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function getEntriesForPeriod(entries: ProgressEntry[], period: "day" | "week") {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  if (period === "week") {
    start.setDate(start.getDate() - 6);
  }

  return entries.filter((entry) => {
    const value = new Date(entry.createdAt ?? entry.date);
    return value >= start && value <= now;
  });
}

export function getTodayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export function getDiaryEntriesForDate(entries: DiaryEntry[], date = getTodayIsoDate()) {
  return entries.filter((entry) => entry.date === date);
}

export function calculateDiaryTotals(entries: DiaryEntry[]) {
  return entries.reduce(
    (totals, entry) => ({
      calories: totals.calories + entry.calories,
      protein: totals.protein + entry.protein,
      carbs: totals.carbs + entry.carbs,
      fats: totals.fats + entry.fats,
    }),
    {
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
    }
  );
}

export function getMealTypes(): MealType[] {
  return ["Закуска", "Обяд", "Вечеря", "Междинно"];
}

export function scaleFoodToQuantity(quantityGrams: number, baseValue: number) {
  return (baseValue * quantityGrams) / 100;
}

export function groupDiaryEntriesByMeal(entries: DiaryEntry[]) {
  const groups: Record<MealType, DiaryEntry[]> = {
    "Закуска": [],
    "Обяд": [],
    "Вечеря": [],
    "Междинно": [],
  };

  entries.forEach((entry) => {
    groups[entry.mealType].push(entry);
  });

  return groups;
}

export function getWaterForDate(entries: WaterEntry[], date = getTodayIsoDate()) {
  return entries.find((entry) => entry.date === date)?.glasses ?? 0;
}

export function getAvailableDiaryDates(entries: DiaryEntry[]) {
  return [...new Set(entries.map((entry) => entry.date))].sort((a, b) => b.localeCompare(a));
}
