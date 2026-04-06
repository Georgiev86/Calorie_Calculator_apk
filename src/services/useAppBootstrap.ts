import { useEffect, useMemo, useState } from "react";
import type { ChatMessage, Profile, ProgressEntry, Session, User } from "../types";
import { requestCoachReply } from "./coach";
import { fetchCloudData, hasCloudBackend, loginWithCloud, registerWithCloud, syncCloudData } from "./cloud";
import { loadProfile, loadProgress, loadSession, persistProfile, persistProgress, persistSession } from "./storage";
import { calculatePlan, createDefaultChatMessages, isValidProfileInput, toNumber } from "../utils/calorie";

export function useAppBootstrap() {
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
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
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(createDefaultChatMessages());
  const [isSending, setIsSending] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [syncNotice, setSyncNotice] = useState("");

  useEffect(() => {
    async function bootstrap() {
      try {
        const [storedProfile, storedProgress, storedSession] = await Promise.all([
          loadProfile(),
          loadProgress(),
          loadSession(),
        ]);

        if (storedProfile) {
          hydrateProfile(storedProfile);
          setHasSavedProfile(true);
        }

        setProgressEntries(storedProgress);

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
      await persistSession(nextSession);

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

  async function logout() {
    setSession(null);
    setUser(null);
    await persistSession(null);
    setSyncNotice("Сесията е изчистена. Локалните данни са запазени на устройството.");
  }

  return {
    isLoading,
    session,
    user,
    hasSavedProfile,
    parsedProfile,
    plan,
    progressEntries,
    progressWeight,
    progressNote,
    chatInput,
    chatMessages,
    isSending,
    isAuthLoading,
    authError,
    syncNotice,
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
      logout,
    },
  };
}
