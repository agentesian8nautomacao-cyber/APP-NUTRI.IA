import type { UserProfile, DailyPlan } from '../types';
import supabase from './supabaseClient';

export async function loadNutriState(userId: string): Promise<{
  profile: UserProfile | null;
  dietPlan: DailyPlan | null;
}> {
  const { data, error } = await supabase
    .from('nutri_profiles')
    .select('profile, diet_plan')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.warn('loadNutriState', error.message);
    return { profile: null, dietPlan: null };
  }

  if (!data) return { profile: null, dietPlan: null };

  return {
    profile: (data.profile as UserProfile) ?? null,
    dietPlan: (data.diet_plan as DailyPlan) ?? null,
  };
}

export async function saveNutriState(
  userId: string,
  profile: UserProfile,
  dietPlan: DailyPlan | null,
): Promise<{ error: string | null }> {
  const row = {
    id: userId,
    profile: profile as unknown as Record<string, unknown>,
    diet_plan: dietPlan as unknown as Record<string, unknown> | null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from('nutri_profiles').upsert(row, { onConflict: 'id' });

  if (error) {
    console.warn('saveNutriState', error.message);
    return { error: error.message };
  }
  return { error: null };
}
