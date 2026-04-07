import AsyncStorage from "@react-native-async-storage/async-storage";
import type { DiaryEntry, FoodItem, Profile, ProgressEntry, RecipeItem, Session, WaterEntry } from "../types";

const STORAGE_PROFILE_KEY = "calorie_coach_profile";
const STORAGE_PROGRESS_KEY = "calorie_coach_progress";
const STORAGE_SESSION_KEY = "calorie_coach_session";
const STORAGE_OFFLINE_MODE_KEY = "calorie_coach_offline_mode";
const STORAGE_DIARY_KEY = "calorie_coach_diary";
const STORAGE_CUSTOM_FOODS_KEY = "calorie_coach_custom_foods";
const STORAGE_FAVORITES_KEY = "calorie_coach_favorite_food_ids";
const STORAGE_RECENTS_KEY = "calorie_coach_recent_food_ids";
const STORAGE_WATER_KEY = "calorie_coach_water_entries";
const STORAGE_CUSTOM_RECIPES_KEY = "calorie_coach_custom_recipes";

export async function loadProfile() {
  const raw = await AsyncStorage.getItem(STORAGE_PROFILE_KEY);
  return raw ? (JSON.parse(raw) as Profile) : null;
}

export async function loadProgress() {
  const raw = await AsyncStorage.getItem(STORAGE_PROGRESS_KEY);
  return raw ? (JSON.parse(raw) as ProgressEntry[]) : [];
}

export async function loadSession() {
  const raw = await AsyncStorage.getItem(STORAGE_SESSION_KEY);
  return raw ? (JSON.parse(raw) as Session) : null;
}

export async function loadOfflineMode() {
  const raw = await AsyncStorage.getItem(STORAGE_OFFLINE_MODE_KEY);
  return raw === "true";
}

export async function loadDiaryEntries() {
  const raw = await AsyncStorage.getItem(STORAGE_DIARY_KEY);
  return raw ? (JSON.parse(raw) as DiaryEntry[]) : [];
}

export async function loadCustomFoods() {
  const raw = await AsyncStorage.getItem(STORAGE_CUSTOM_FOODS_KEY);
  return raw ? (JSON.parse(raw) as FoodItem[]) : [];
}

export async function loadFavoriteFoodIds() {
  const raw = await AsyncStorage.getItem(STORAGE_FAVORITES_KEY);
  return raw ? (JSON.parse(raw) as string[]) : [];
}

export async function loadRecentFoodIds() {
  const raw = await AsyncStorage.getItem(STORAGE_RECENTS_KEY);
  return raw ? (JSON.parse(raw) as string[]) : [];
}

export async function loadWaterEntries() {
  const raw = await AsyncStorage.getItem(STORAGE_WATER_KEY);
  return raw ? (JSON.parse(raw) as WaterEntry[]) : [];
}

export async function loadCustomRecipes() {
  const raw = await AsyncStorage.getItem(STORAGE_CUSTOM_RECIPES_KEY);
  return raw ? (JSON.parse(raw) as RecipeItem[]) : [];
}

export async function persistProfile(profile: Profile) {
  await AsyncStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(profile));
}

export async function persistProgress(entries: ProgressEntry[]) {
  await AsyncStorage.setItem(STORAGE_PROGRESS_KEY, JSON.stringify(entries));
}

export async function persistSession(session: Session | null) {
  if (!session) {
    await AsyncStorage.removeItem(STORAGE_SESSION_KEY);
    return;
  }

  await AsyncStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(session));
}

export async function persistOfflineMode(isOfflineMode: boolean) {
  await AsyncStorage.setItem(STORAGE_OFFLINE_MODE_KEY, String(isOfflineMode));
}

export async function persistDiaryEntries(entries: DiaryEntry[]) {
  await AsyncStorage.setItem(STORAGE_DIARY_KEY, JSON.stringify(entries));
}

export async function persistCustomFoods(entries: FoodItem[]) {
  await AsyncStorage.setItem(STORAGE_CUSTOM_FOODS_KEY, JSON.stringify(entries));
}

export async function persistFavoriteFoodIds(entries: string[]) {
  await AsyncStorage.setItem(STORAGE_FAVORITES_KEY, JSON.stringify(entries));
}

export async function persistRecentFoodIds(entries: string[]) {
  await AsyncStorage.setItem(STORAGE_RECENTS_KEY, JSON.stringify(entries));
}

export async function persistWaterEntries(entries: WaterEntry[]) {
  await AsyncStorage.setItem(STORAGE_WATER_KEY, JSON.stringify(entries));
}

export async function persistCustomRecipes(entries: RecipeItem[]) {
  await AsyncStorage.setItem(STORAGE_CUSTOM_RECIPES_KEY, JSON.stringify(entries));
}
