import { useEffect, useMemo, useState } from "react";
import type { ChatMessage, DiaryEntry, FoodItem, MealType, Profile, ProgressEntry, RecipeItem, Session, User, WaterEntry } from "../types";
import { requestCoachReply } from "./coach";
import { fetchCloudData, hasCloudBackend, loginWithCloud, registerWithCloud, syncCloudData } from "./cloud";
import { exportProgressPdf } from "./pdf";
import { loadCustomFoods, loadCustomRecipes, loadDiaryEntries, loadFavoriteFoodIds, loadOfflineMode, loadProfile, loadProgress, loadRecentFoodIds, loadSession, loadWaterEntries, persistCustomFoods, persistCustomRecipes, persistDiaryEntries, persistFavoriteFoodIds, persistOfflineMode, persistProfile, persistProgress, persistRecentFoodIds, persistSession, persistWaterEntries } from "./storage";
import { calculatePlan, createDefaultChatMessages, getTodayIsoDate, getWaterForDate, isValidProfileInput, scaleFoodToQuantity, toNumber } from "../utils/calorie";

export function useAppBootstrap() {
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [hasSavedProfile, setHasSavedProfile] = useState(false);
  const [gender, setGender] = useState<Profile["gender"]>("male");
  const [age, setAge] = useState("30");
  const [weight, setWeight] = useState("80");
  const [height, setHeight] = useState("180");
  const [activity, setActivity] = useState<Profile["activity"]>("medium");
  const [goal, setGoal] = useState<Profile["goal"]>("maintain");
  const [meals, setMeals] = useState("3");
  const [progressWeight, setProgressWeight] = useState("");
  const [progressNote, setProgressNote] = useState("");
  const [progressEntries, setProgressEntries] = useState<ProgressEntry[]>([]);
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [customFoods, setCustomFoods] = useState<FoodItem[]>([]);
  const [customRecipes, setCustomRecipes] = useState<RecipeItem[]>([]);
  const [favoriteFoodIds, setFavoriteFoodIds] = useState<string[]>([]);
  const [recentFoodIds, setRecentFoodIds] = useState<string[]>([]);
  const [waterEntries, setWaterEntries] = useState<WaterEntry[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(createDefaultChatMessages());
  const [isSending, setIsSending] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [syncNotice, setSyncNotice] = useState("");
  const [exportNotice, setExportNotice] = useState("");

  useEffect(() => {
    async function bootstrap() {
      try {
        const [
          storedProfile,
          storedProgress,
          storedSession,
          storedOfflineMode,
          storedDiaryEntries,
          storedCustomFoods,
          storedFavoriteFoodIds,
          storedRecentFoodIds,
          storedWaterEntries,
          storedCustomRecipes,
        ] = await Promise.all([
          loadProfile(),
          loadProgress(),
          loadSession(),
          loadOfflineMode(),
          loadDiaryEntries(),
          loadCustomFoods(),
          loadFavoriteFoodIds(),
          loadRecentFoodIds(),
          loadWaterEntries(),
          loadCustomRecipes(),
        ]);

        setIsOfflineMode(storedOfflineMode);

        if (storedProfile) {
          hydrateProfile(storedProfile);
          setHasSavedProfile(true);
        }

        setProgressEntries(storedProgress);
        setDiaryEntries(storedDiaryEntries);
        setCustomFoods(storedCustomFoods);
        setFavoriteFoodIds(storedFavoriteFoodIds);
        setRecentFoodIds(storedRecentFoodIds);
        setWaterEntries(storedWaterEntries);
        setCustomRecipes(storedCustomRecipes);

        if (storedSession) {
          setSession(storedSession);
          setUser(storedSession.user);

          if (hasCloudBackend()) {
            try {
              const cloudData = await fetchCloudData(storedSession.token);
              if (cloudData.profile) {
                hydrateProfile(cloudData.profile);
                await persistProfile(cloudData.profile);
                setHasSavedProfile(true);
              }

              if (cloudData.progress) {
                setProgressEntries(cloudData.progress);
                await persistProgress(cloudData.progress);
              }

              setSyncNotice("Cloud профилът е синхронизиран.");
            } catch {
              setSyncNotice("Локалните данни са заредени. Cloud sync ще се опита отново по-късно.");
            }
          }
        }
      } finally {
        setIsLoading(false);
      }
    }

    function hydrateProfile(profile: Profile) {
      setGender(profile.gender);
      setAge(String(profile.age));
      setWeight(String(profile.weight));
      setHeight(String(profile.height));
      setActivity(profile.activity);
      setGoal(profile.goal);
      setMeals(String(profile.meals));
    }

    bootstrap();
  }, []);

  const parsedProfile = useMemo(() => {
    const profile: Profile = {
      gender,
      age: toNumber(age),
      weight: toNumber(weight),
      height: toNumber(height),
      activity,
      goal,
      meals: toNumber(meals),
    };

    return isValidProfileInput(profile) ? profile : null;
  }, [activity, age, gender, goal, height, meals, weight]);

  const plan = useMemo(() => (parsedProfile ? calculatePlan(parsedProfile) : null), [parsedProfile]);

  async function syncIfPossible(profile: Profile | null, entries: ProgressEntry[], tokenOverride?: string) {
    const token = tokenOverride ?? session?.token;
    if (!token || !hasCloudBackend()) {
      return;
    }

    try {
      await syncCloudData(
        {
          profile,
          progress: entries,
        },
        token
      );
      setSyncNotice("Cloud sync е обновен.");
    } catch {
      setSyncNotice("Промените са записани локално. Cloud sync временно не е достъпен.");
    }
  }

  async function saveProfile() {
    if (!parsedProfile) {
      return;
    }

    await persistProfile(parsedProfile);
    setHasSavedProfile(true);
    await syncIfPossible(parsedProfile, progressEntries);
  }

  async function saveProgressEntry() {
    const numericWeight = toNumber(progressWeight);
    if (!numericWeight) {
      return;
    }

    const entry: ProgressEntry = {
      id: `${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      weight: numericWeight,
      note: progressNote.trim(),
      createdAt: new Date().toISOString(),
    };

    const updatedEntries = [entry, ...progressEntries];
    setProgressEntries(updatedEntries);
    setProgressWeight("");
    setProgressNote("");
    await persistProgress(updatedEntries);
    await syncIfPossible(parsedProfile, updatedEntries);
  }

  async function handleCoachSend(prefilled?: string) {
    if (!parsedProfile) {
      return;
    }

    const prompt = (prefilled ?? chatInput).trim();
    if (!prompt || isSending) {
      return;
    }

    const now = Date.now();
    const userMessage: ChatMessage = {
      id: `${now}-user`,
      role: "user",
      text: prompt,
    };

    setChatMessages((current) => [...current, userMessage]);
    setChatInput("");
    setIsSending(true);

    try {
      const replyText = await requestCoachReply({
        message: prompt,
        profile: parsedProfile,
        progress: progressEntries,
      });

      setChatMessages((current) => [
        ...current,
        {
          id: `${now + 1}-assistant`,
          role: "assistant",
          text: replyText,
        },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  async function authenticate(mode: "login" | "register", email: string, password: string) {
    if (!hasCloudBackend()) {
      setAuthError("Липсва backend URL. Добави EXPO_PUBLIC_AI_BACKEND_URL, за да използваш login и cloud sync.");
      return false;
    }

    setIsAuthLoading(true);
    setAuthError("");

    try {
      const payload = { email, password };
      const nextSession =
        mode === "register"
          ? await registerWithCloud(payload)
          : await loginWithCloud(payload);

      setSession(nextSession);
      setUser(nextSession.user);
      setIsOfflineMode(false);
      await persistSession(nextSession);
      await persistOfflineMode(false);

      if (parsedProfile || progressEntries.length > 0) {
        await syncIfPossible(parsedProfile, progressEntries, nextSession.token);
      } else {
        const cloudData = await fetchCloudData(nextSession.token);
        if (cloudData.profile) {
          setGender(cloudData.profile.gender);
          setAge(String(cloudData.profile.age));
          setWeight(String(cloudData.profile.weight));
          setHeight(String(cloudData.profile.height));
          setActivity(cloudData.profile.activity);
          setGoal(cloudData.profile.goal);
          setMeals(String(cloudData.profile.meals));
          await persistProfile(cloudData.profile);
          setHasSavedProfile(true);
        }
        setProgressEntries(cloudData.progress);
        await persistProgress(cloudData.progress);
      }

      setSyncNotice("Влезе успешно. Cloud sync е готов.");
      return true;
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Неуспешен вход.");
      return false;
    } finally {
      setIsAuthLoading(false);
    }
  }

  async function enterOfflineMode() {
    setSession({
      token: "offline-local-session",
      user: {
        id: "local-user",
        email: "offline@local.device",
      },
    });
    setUser({
      id: "local-user",
      email: "offline@local.device",
    });
    setIsOfflineMode(true);
    setAuthError("");
    setSyncNotice("Работиш в локален режим. Данните се пазят на телефона.");
    await persistSession({
      token: "offline-local-session",
      user: {
        id: "local-user",
        email: "offline@local.device",
      },
    });
    await persistOfflineMode(true);
  }

  async function exportPdfReport(period: "day" | "week") {
    if (!parsedProfile) {
      setExportNotice("Първо запази профил, за да изнесем PDF отчет.");
      return;
    }

    try {
      const result = await exportProgressPdf({
        period,
        profile: parsedProfile,
        entries: progressEntries,
      });
      const label = period === "day" ? "дневният" : "седмичният";
      setExportNotice(
        result.filteredEntries.length
          ? `PDF е готов и може да бъде споделен. Изнесен е ${label} отчет.`
          : `PDF е създаден без записи за периода. Можеш да го споделиш или пазиш на телефона.`
      );
    } catch {
      setExportNotice("Не успях да създам PDF отчета в момента.");
    }
  }

  async function addFoodToDiary(food: FoodItem, mealType: MealType, quantityGrams: number) {
    const grams = quantityGrams > 0 ? quantityGrams : 100;

    const entry: DiaryEntry = {
      id: `${Date.now()}-${food.id}`,
      foodId: food.id,
      foodName: food.name,
      mealType,
      serving: `${grams} г`,
      quantityGrams: grams,
      calories: scaleFoodToQuantity(grams, food.calories),
      protein: scaleFoodToQuantity(grams, food.protein),
      carbs: scaleFoodToQuantity(grams, food.carbs),
      fats: scaleFoodToQuantity(grams, food.fats),
      date: getTodayIsoDate(),
      createdAt: new Date().toISOString(),
    };

    const nextEntries = [entry, ...diaryEntries];
    setDiaryEntries(nextEntries);
    await persistDiaryEntries(nextEntries);
    const nextRecentIds = [food.id, ...recentFoodIds.filter((id) => id !== food.id)].slice(0, 12);
    setRecentFoodIds(nextRecentIds);
    await persistRecentFoodIds(nextRecentIds);
    setSyncNotice(`${food.name} е добавена към ${mealType.toLowerCase()} (${grams} г).`);
  }

  async function removeDiaryEntry(entryId: string) {
    const nextEntries = diaryEntries.filter((entry) => entry.id !== entryId);
    setDiaryEntries(nextEntries);
    await persistDiaryEntries(nextEntries);
    setSyncNotice("Записът е премахнат от дневните хранения.");
  }

  async function updateDiaryEntry(
    entryId: string,
    updates: { mealType: MealType; quantityGrams: number }
  ) {
    const grams = updates.quantityGrams > 0 ? updates.quantityGrams : 100;

    const nextEntries = diaryEntries.map((entry) => {
      if (entry.id !== entryId) {
        return entry;
      }

      const scaleRatio = grams / entry.quantityGrams;

      return {
        ...entry,
        mealType: updates.mealType,
        quantityGrams: grams,
        serving: `${grams} г`,
        calories: entry.calories * scaleRatio,
        protein: entry.protein * scaleRatio,
        carbs: entry.carbs * scaleRatio,
        fats: entry.fats * scaleRatio,
      };
    });

    setDiaryEntries(nextEntries);
    await persistDiaryEntries(nextEntries);
    setSyncNotice("Записът е обновен.");
  }

  async function addCustomFood(food: Omit<FoodItem, "id">) {
    const nextFood: FoodItem = {
      ...food,
      id: `custom-${Date.now()}`,
      isCustom: true,
    };

    const nextCustomFoods = [nextFood, ...customFoods];
    setCustomFoods(nextCustomFoods);
    await persistCustomFoods(nextCustomFoods);
    setSyncNotice(`${food.name} е добавена към твоите храни.`);
  }

  async function toggleFavoriteFood(foodId: string) {
    const isFavorite = favoriteFoodIds.includes(foodId);
    const nextFavoriteIds = isFavorite
      ? favoriteFoodIds.filter((id) => id !== foodId)
      : [foodId, ...favoriteFoodIds];

    setFavoriteFoodIds(nextFavoriteIds);
    await persistFavoriteFoodIds(nextFavoriteIds);
    setSyncNotice(isFavorite ? "Храната е махната от любими." : "Храната е добавена в любими.");
  }

  async function incrementWater() {
    const today = getTodayIsoDate();
    const currentGlasses = getWaterForDate(waterEntries, today);
    const nextEntries = upsertWaterEntry(today, currentGlasses + 1);
    setWaterEntries(nextEntries);
    await persistWaterEntries(nextEntries);
    setSyncNotice("Добавена е 1 чаша вода.");
  }

  async function decrementWater() {
    const today = getTodayIsoDate();
    const currentGlasses = getWaterForDate(waterEntries, today);
    const nextEntries = upsertWaterEntry(today, Math.max(currentGlasses - 1, 0));
    setWaterEntries(nextEntries);
    await persistWaterEntries(nextEntries);
    setSyncNotice("Намалена е 1 чаша вода.");
  }

  function upsertWaterEntry(date: string, glasses: number) {
    const hasEntry = waterEntries.some((entry) => entry.date === date);

    if (hasEntry) {
      return waterEntries.map((entry) => (entry.date === date ? { ...entry, glasses } : entry));
    }

    return [{ date, glasses }, ...waterEntries];
  }

  async function addCustomRecipe(recipe: Omit<RecipeItem, "id">) {
    const nextRecipe: RecipeItem = {
      ...recipe,
      id: `custom-recipe-${Date.now()}`,
      isCustom: true,
    };

    const nextRecipes = [nextRecipe, ...customRecipes];
    setCustomRecipes(nextRecipes);
    await persistCustomRecipes(nextRecipes);
    setSyncNotice(`${recipe.name} е добавена към моите рецепти.`);
  }

  async function addRecipeToDiary(recipe: RecipeItem, mealType: MealType) {
    const entry: DiaryEntry = {
      id: `${Date.now()}-${recipe.id}`,
      foodId: recipe.id,
      foodName: recipe.name,
      mealType,
      serving: "1 порция",
      quantityGrams: 100,
      calories: recipe.calories,
      protein: recipe.protein,
      carbs: recipe.carbs,
      fats: recipe.fats,
      date: getTodayIsoDate(),
      createdAt: new Date().toISOString(),
    };

    const nextEntries = [entry, ...diaryEntries];
    setDiaryEntries(nextEntries);
    await persistDiaryEntries(nextEntries);
    setSyncNotice(`${recipe.name} е добавена към ${mealType.toLowerCase()}.`);
  }

  async function logout() {
    setSession(null);
    setUser(null);
    setIsOfflineMode(false);
    await persistSession(null);
    await persistOfflineMode(false);
    setSyncNotice("Сесията е изчистена. Локалните данни са запазени на устройството.");
  }

  return {
    isLoading,
    session,
    user,
    isOfflineMode,
    hasSavedProfile,
    parsedProfile,
    plan,
    progressEntries,
    diaryEntries,
    customFoods,
    customRecipes,
    favoriteFoodIds,
    recentFoodIds,
    waterEntries,
    progressWeight,
    progressNote,
    chatInput,
    chatMessages,
    isSending,
    isAuthLoading,
    authError,
    syncNotice,
    exportNotice,
    fields: {
      gender,
      age,
      weight,
      height,
      activity,
      goal,
      meals,
    },
    setters: {
      setGender,
      setAge,
      setWeight,
      setHeight,
      setActivity,
      setGoal,
      setMeals,
      setProgressWeight,
      setProgressNote,
      setChatInput,
    },
    actions: {
      saveProfile,
      saveProgressEntry,
      handleCoachSend,
      authenticate,
      enterOfflineMode,
      logout,
      exportPdfReport,
      addFoodToDiary,
      removeDiaryEntry,
      updateDiaryEntry,
      addCustomFood,
      toggleFavoriteFood,
      incrementWater,
      decrementWater,
      addCustomRecipe,
      addRecipeToDiary,
    },
  };
}
