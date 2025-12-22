import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug: Log environment variables (apenas em desenvolvimento)
if (import.meta.env.DEV) {
  console.log('🔍 Environment Variables Check:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    urlLength: supabaseUrl?.length || 0,
    keyLength: supabaseAnonKey?.length || 0,
  });
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables:', {
    VITE_SUPABASE_URL: supabaseUrl || 'MISSING',
    VITE_SUPABASE_ANON_KEY: supabaseAnonKey ? '***present***' : 'MISSING',
    allEnvKeys: Object.keys(import.meta.env).filter(key => key.includes('SUPABASE')),
  });
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos TypeScript para o banco de dados
export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          age: number;
          gender: 'Male' | 'Female' | 'Other';
          height: number;
          weight: number;
          activity_level: 'Sedentary' | 'Light' | 'Moderate' | 'Active' | 'Very Active';
          goal: 'Lose Weight' | 'Maintain Weight' | 'Gain Muscle' | 'General Health';
          restrictions: string | null;
          meals_per_day: number;
          medical_history: string | null;
          routine_description: string | null;
          food_preferences: string | null;
          streak: number;
          last_active_date: string;
          avatar: string | null;
          chef_avatar: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['user_profiles']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['user_profiles']['Insert']>;
      };
      daily_plans: {
        Row: {
          id: string;
          user_id: string;
          plan_date: string;
          total_calories: number;
          target_protein: number;
          target_carbs: number;
          target_fats: number;
          nutritional_analysis: string | null;
          behavioral_tips: string[] | null;
          shopping_list: string[] | null;
          hydration_target: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['daily_plans']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['daily_plans']['Insert']>;
      };
      daily_logs: {
        Row: {
          id: string;
          user_id: string;
          meal_item_id: string | null;
          name: string;
          calories: number;
          protein: number;
          carbs: number;
          fats: number;
          description: string | null;
          meal_type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | 'Other';
          image: string | null;
          timestamp: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['daily_logs']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['daily_logs']['Insert']>;
      };
      // Adicione outros tipos conforme necessário
    };
  };
};

