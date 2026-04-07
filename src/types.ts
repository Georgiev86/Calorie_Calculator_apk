export type Gender = "male" | "female";
export type ActivityLevel = "low" | "medium" | "high" | "athlete";
export type Goal = "lose" | "maintain" | "gain";
export type Tab = "plan" | "coach" | "progress";

export type Profile = {
  gender: Gender;
  age: number;
  weight: number;
  height: number;
  activity: ActivityLevel;
  goal: Goal;
  meals: number;
};

export type ProgressEntry = {
  id: string;
  date: string;
  weight: number;
  note: string;
  createdAt?: string;
};

export type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
};

export type User = {
  id: string;
  email: string;
};

export type Session = {
  token: string;
  user: User;
};

export type AuthPayload = {
  email: string;
  password: string;
};

export type CloudSyncPayload = {
  profile: Profile | null;
  progress: ProgressEntry[];
};

export type FoodItem = {
  id: string;
  name: string;
  category: string;
  serving: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
};

export type RecipeItem = {
  id: string;
  name: string;
  mealType: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  ingredients: string[];
};

export type MealType = "Закуска" | "Обяд" | "Вечеря" | "Междинно";

export type DiaryEntry = {
  id: string;
  foodId: string;
  foodName: string;
  mealType: MealType;
  serving: string;
  quantityGrams: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  date: string;
  createdAt: string;
};

export type CalculatedPlan = {
  bmr: number;
  maintenanceCalories: number;
  targetCalories: number;
  protein: number;
  fats: number;
  carbs: number;
  caloriesPerMeal: number;
  mealPlan: Array<{
    name: string;
    calories: number;
  }>;
};

export type AppStateShape = {
  isLoading: boolean;
  session: Session | null;
  user: User | null;
  isOfflineMode: boolean;
  hasSavedProfile: boolean;
  parsedProfile: Profile | null;
  plan: CalculatedPlan | null;
  progressEntries: ProgressEntry[];
  diaryEntries: DiaryEntry[];
  progressWeight: string;
  progressNote: string;
  chatInput: string;
  chatMessages: ChatMessage[];
  isSending: boolean;
  isAuthLoading: boolean;
  authError: string;
  syncNotice: string;
  exportNotice: string;
  fields: {
    gender: Gender;
    age: string;
    weight: string;
    height: string;
    activity: ActivityLevel;
    goal: Goal;
    meals: string;
  };
  setters: {
    setGender: (value: Gender) => void;
    setAge: (value: string) => void;
    setWeight: (value: string) => void;
    setHeight: (value: string) => void;
    setActivity: (value: ActivityLevel) => void;
    setGoal: (value: Goal) => void;
    setMeals: (value: string) => void;
    setProgressWeight: (value: string) => void;
    setProgressNote: (value: string) => void;
    setChatInput: (value: string) => void;
  };
  actions: {
    saveProfile: () => Promise<void>;
    saveProgressEntry: () => Promise<void>;
    handleCoachSend: (prefilled?: string) => Promise<void>;
    authenticate: (mode: "login" | "register", email: string, password: string) => Promise<boolean>;
    enterOfflineMode: () => Promise<void>;
    logout: () => Promise<void>;
    exportPdfReport: (period: "day" | "week") => Promise<void>;
    addFoodToDiary: (food: FoodItem, mealType: MealType, quantityGrams: number) => Promise<void>;
    removeDiaryEntry: (entryId: string) => Promise<void>;
  };
};
