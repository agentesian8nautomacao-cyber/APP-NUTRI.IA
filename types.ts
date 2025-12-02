
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

export enum AccountType {
  USER_B2C = "USER_B2C",      // Usuário Comum (paga própria assinatura)
  USER_GYM = "USER_GYM",      // Aluno de Academia (vinculado a conta mãe)
  USER_PERSONAL = "USER_PERSONAL"  // Personal Trainer (conta administrativa)
}

export interface UserAccessInfo {
  account_type: AccountType;
  has_access: boolean;
  block_reason?: string;
  block_message?: string;
  can_use_voice: boolean;
  can_use_chat: boolean;
  can_log_meals: boolean;
  can_access_progress: boolean;
  can_access_dashboard: boolean;
  redirect_to: 'dashboard' | 'progress' | 'blocked';
}

export interface PantryItem {
  id: string;
  name: string;
  quantity?: string;
  expiryDate?: string;
}

export interface KnowledgeBase {
  name: string;
  mimeType: string;
  data: string; // Base64
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
  pantryItems?: PantryItem[]; // Itens cadastrados na despensa
  customChatInstructions?: string; // Prompt personalizado para o chat
  aiVoice?: string; // 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'
  knowledgeBase?: KnowledgeBase; // Arquivo de contexto (PDF/TXT/IMG)
  accountType?: AccountType; // Tipo de conta (USER_B2C, USER_GYM, USER_PERSONAL)
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
  emoji?: string; // New field for Emoji representation
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
  isSystemEvent?: boolean; // Para mensagens de log enviadas automaticamente
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
  };
  notificationTimes: {
      water: string;
      sleep: string;
      meals: string;
  };
}

export interface Recipe {
  title: string;
  time: string;
  calories: number;
  description: string;
  steps: string[];
  image?: string;
  emoji?: string;
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
  | 'wellness'
  | 'challenges'
  | 'library'
  | 'profile'
  | 'security'
  | 'settings'
  | 'personal_chat';
