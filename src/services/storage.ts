import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Profile, ProgressEntry, Session } from "../types";

const STORAGE_PROFILE_KEY = "calorie_coach_profile";
const STORAGE_PROGRESS_KEY = "calorie_coach_progress";
const STORAGE_SESSION_KEY = "calorie_coach_session";

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
