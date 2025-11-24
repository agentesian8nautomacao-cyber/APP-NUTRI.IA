
export enum ActivityLevel {
  Sedentary = "Sedentary",
  Light = "Light",
  Moderate = "Moderate",
  Active = "Active",
  VeryActive = "Very Active"
}

export enum Goal {
  LoseWeight = "Lose Weight",
  Maintain = "Maintain Weight",
  GainMuscle = "Gain Muscle",
  ImproveHealth = "General Health"
}

export enum Gender {
  Male = "Male",
  Female = "Female",
  Other = "Other"
}

export interface UserProfile {
  name: string;
  age: number;
  gender: Gender;
  height: number; // cm
  weight: number; // kg
  activityLevel: ActivityLevel;
  goal: Goal;
  restrictions: string;
  mealsPerDay: number;
  medicalHistory: string;
  routineDescription: string;
  foodPreferences: string;
  streak: number;        // Dias consecutivos
  lastActiveDate: string; // Data do último acesso (ISO)
  avatar?: string;        // User's personal photo
  chefAvatar?: string;    // Custom avatar for the AI Chef
}

export interface MacroNutrients {
  protein: number;
  carbs: number;
  fats: number;
}

export interface MealItem {
  name: string;
  calories: number;
  macros: MacroNutrients;
  description: string;
  substitutions?: string[];
  image?: string;
}

export interface LogItem extends MealItem {
  id: string;
  timestamp: number;
  type: "Breakfast" | "Lunch" | "Dinner" | "Snack" | "Other";
}

export interface ScanHistoryItem {
  id: string;
  image: string;
  date: number; // timestamp
  resultName?: string;
}

export interface DailyPlan {
  totalCalories: number;
  targetMacros: MacroNutrients;
  nutritionalAnalysis: string;
  meals: {
    type: "Breakfast" | "Lunch" | "Dinner" | "Snack";
    items: MealItem[];
  }[];
  behavioralTips: string[];
  shoppingList: string[];
  hydrationTarget: number;
  notes: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string;
  timestamp: number;
}

export interface WellnessState {
  mood: 'good' | 'neutral' | 'bad' | null;
  waterGlasses: number;
  habits: { id: number; text: string; completed: boolean }[];
  sleepHours: number;
  sleepQuality: number; // Percentage
  notifications: {
      water: boolean;
      sleep: boolean;
      meals: boolean;
  }
}

export interface Recipe {
  title: string;
  time: string;
  calories: number;
  description: string;
  steps: string[];
  image?: string;
}

export interface Article {
  id: number;
  category: string;
  title: string;
  readTime: string;
  image: string;
}

export type AppView = 
  | 'landing'
  | 'onboarding' 
  | 'generating' 
  | 'diet_plan'
  | 'dashboard' 
  | 'diary'
  | 'analyzer' 
  | 'chat' 
  | 'live'
  | 'smart_meal'
  | 'progress'
  | 'reports'
  | 'wellness'
  | 'challenges'
  | 'library'
  | 'profile'
  | 'security'
  | 'settings';
