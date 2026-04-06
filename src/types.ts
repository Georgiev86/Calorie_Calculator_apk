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
  hasSavedProfile: boolean;
  parsedProfile: Profile | null;
  plan: CalculatedPlan | null;
  progressEntries: ProgressEntry[];
  progressWeight: string;
  progressNote: string;
  chatInput: string;
  chatMessages: ChatMessage[];
  isSending: boolean;
  isAuthLoading: boolean;
  authError: string;
  syncNotice: string;
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
    logout: () => Promise<void>;
  };
};
