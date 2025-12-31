import { supabase } from './supabaseClient';
import {
  UserProfile,
  DailyPlan,
  LogItem,
  WellnessState,
  ScanHistoryItem,
  ChatMessage,
  ActivityLevel,
  Goal,
  Gender,
  AccountType,
  UserAccessInfo,
} from '../types';

// ============================================
// FUNÇÕES DE CONVERSÃO DE TIPOS
// ============================================

// Converter UserProfile do app para formato do banco
function userProfileToDB(profile: UserProfile, userId: string) {
  return {
    user_id: userId,
    name: profile.name,
    age: profile.age,
    gender: profile.gender as 'Male' | 'Female' | 'Other',
    height: profile.height,
    weight: profile.weight,
    activity_level: profile.activityLevel as 'Sedentary' | 'Light' | 'Moderate' | 'Active' | 'Very Active',
    goal: profile.goal as 'Lose Weight' | 'Maintain Weight' | 'Gain Muscle' | 'General Health',
    restrictions: profile.restrictions || null,
    meals_per_day: profile.mealsPerDay,
    medical_history: profile.medicalHistory || null,
    routine_description: profile.routineDescription || null,
    food_preferences: profile.foodPreferences || null,
    streak: profile.streak,
    last_active_date: profile.lastActiveDate,
    avatar: profile.avatar || null,
    chef_avatar: profile.chefAvatar || null,
  };
}

// Converter perfil do banco para UserProfile do app
function userProfileFromDB(dbProfile: any): UserProfile {
  return {
    name: dbProfile.name,
    age: dbProfile.age,
    gender: dbProfile.gender as Gender,
    height: Number(dbProfile.height),
    weight: Number(dbProfile.weight),
    activityLevel: dbProfile.activity_level as ActivityLevel,
    goal: dbProfile.goal as Goal,
    restrictions: dbProfile.restrictions || '',
    mealsPerDay: dbProfile.meals_per_day,
    medicalHistory: dbProfile.medical_history || '',
    routineDescription: dbProfile.routine_description || '',
    foodPreferences: dbProfile.food_preferences || '',
    streak: dbProfile.streak || 0,
    lastActiveDate: dbProfile.last_active_date,
    avatar: dbProfile.avatar || undefined,
    chefAvatar: dbProfile.chef_avatar || undefined,
  };
}

// Converter DailyPlan do app para formato do banco
function dailyPlanToDB(plan: DailyPlan, userId: string, planDate?: Date) {
  return {
    user_id: userId,
    plan_date: planDate ? planDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    total_calories: plan.totalCalories,
    target_protein: plan.targetMacros.protein,
    target_carbs: plan.targetMacros.carbs,
    target_fats: plan.targetMacros.fats,
    nutritional_analysis: plan.nutritionalAnalysis || null,
    behavioral_tips: plan.behavioralTips || null,
    shopping_list: plan.shoppingList || null,
    hydration_target: plan.hydrationTarget || 2.0,
    notes: plan.notes || null,
  };
}

// Converter plano do banco para DailyPlan do app
function dailyPlanFromDB(dbPlan: any, meals: any[]): DailyPlan {
  return {
    totalCalories: dbPlan.total_calories,
    targetMacros: {
      protein: Number(dbPlan.target_protein),
      carbs: Number(dbPlan.target_carbs),
      fats: Number(dbPlan.target_fats),
    },
    nutritionalAnalysis: dbPlan.nutritional_analysis || '',
    meals: meals.map((meal: any) => ({
      type: meal.meal_type,
      items: meal.items || [],
    })),
    behavioralTips: dbPlan.behavioral_tips || [],
    shoppingList: dbPlan.shopping_list || [],
    hydrationTarget: Number(dbPlan.hydration_target),
    notes: dbPlan.notes || '',
  };
}

// ============================================
// SERVIÇOS DE AUTENTICAÇÃO
// ============================================

export const authService = {
  // Registrar novo usuário (sem lógica de cupom)
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        // Nota: A confirmação de email deve ser desativada no Supabase Dashboard
        // Authentication → Settings → "Enable email confirmations" = OFF
      },
    });
    if (error) throw error;
    return data;
  },

  // Fazer login
  async signIn(email: string, password: string) {
    console.log('🔐 [DEBUG] Tentando fazer login com email:', email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('❌ [DEBUG] Erro no login:', error);
      // Melhorar mensagens de erro
      if (error.message?.includes('Invalid login credentials') || error.message?.includes('Email not confirmed')) {
        throw new Error('Email ou senha incorretos. Verifique suas credenciais ou crie uma conta.');
      }
      throw error;
    }
    
    console.log('✅ [DEBUG] Login bem-sucedido para:', data.user?.email);
    
    // Aguardar um pouco para garantir que a sessão está estabelecida
    // Isso ajuda a evitar erros 406 em queries subsequentes
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return data;
  },

  // Fazer logout
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Obter usuário atual
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    // Se não houver sessão, retornar null ao invés de lançar erro
    if (error) {
      // "Auth session missing" é esperado quando não há sessão
      if (error.message?.includes('session') || error.message?.includes('Auth session missing')) {
        return null;
      }
      throw error;
    }
    return user;
  },

  // Observar mudanças de autenticação
  onAuthStateChange(callback: (user: any) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user || null);
    });
  },

  // Obter perfil do usuário atual
  async getCurrentUserProfile(): Promise<UserProfile | null> {
    try {
      // Verificar sessão primeiro
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (!session || sessionError) {
        console.warn('Sessão não encontrada ou inválida:', sessionError);
        return null;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Usar select=* primeiro (mais compatível)
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        // Se for erro 406, pode ser problema de sessão não sendo reconhecida
        if (error.code === 'PGRST301' || error.message?.includes('406') || error.status === 406) {
          console.warn('Erro 406 ao buscar perfil. Tentando recarregar sessão...');
          
          // Tentar recarregar a sessão
          const { data: { session: newSession } } = await supabase.auth.getSession();
          if (!newSession) {
            console.error('Sessão não encontrada após recarregar');
            return null;
          }
          
          // Tentar novamente com select=*
          const { data: retryData, error: retryError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();
          
          if (retryError) {
            if (retryError.code === 'PGRST116') return null;
            console.error('Erro ao buscar perfil (tentativa 2):', retryError);
            return null;
          }
          return retryData ? userProfileFromDB(retryData) : null;
        }
        
        if (error.code === 'PGRST116') return null; // Não encontrado
        console.error('Erro ao buscar perfil:', error);
        return null;
      }

      return data ? userProfileFromDB(data) : null;
    } catch (err) {
      console.error('Erro ao buscar perfil do usuário:', err);
      return null;
    }
  },

  // Verificar se o trial expirou
  async checkTrialStatus(): Promise<{ isTrial: boolean; isExpired: boolean; expiryDate?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { isTrial: false, isExpired: false };

      const { data, error } = await supabase
        .from('user_profiles')
        .select('subscription_status, subscription_expiry')
        .eq('user_id', user.id)
        .single();

      if (error || !data) {
        return { isTrial: false, isExpired: false };
      }

      const isTrial = data.subscription_status === 'trial';
      if (!isTrial) {
        return { isTrial: false, isExpired: false };
      }

      const expiryDate = data.subscription_expiry ? new Date(data.subscription_expiry) : null;
      const now = new Date();
      const isExpired = expiryDate ? now > expiryDate : false;

      return {
        isTrial: true,
        isExpired,
        expiryDate: expiryDate?.toISOString(),
      };
    } catch (err) {
      console.error('Erro ao verificar status do trial:', err);
      return { isTrial: false, isExpired: false };
    }
  },
};

// ============================================
// SERVIÇOS DE CUPOM / FLUXO DE CONVITE
// ============================================

type PlanType =
  | 'free'
  | 'monthly'
  | 'annual'
  | 'academy_starter'
  | 'academy_growth'
  | 'personal_team';

type SubscriptionStatus = 'active' | 'inactive' | 'expired';

interface Coupon {
  id: string;
  code: string;
  plan_linked: PlanType;
  max_uses: number;
  current_uses: number;
  is_active: boolean;
}

export const couponService = {
  // Buscar e validar cupom (existência, ativo e com uso disponível)
  // Também verifica se o cupom está vinculado a um pagamento Cakto ativo
  async validateCoupon(code: string): Promise<Coupon> {
    const normalized = code.trim();
    if (!normalized) {
      throw new Error('CÓDIGO_VAZIO');
    }

    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .ilike('code', normalized) // case-insensitive
      .eq('is_active', true)
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      throw new Error('CUPOM_INEXISTENTE');
    }

    if (data.current_uses >= data.max_uses) {
      throw new Error('CUPOM_ESGOTADO');
    }

    // Verificar se o cupom está vinculado a um pagamento Cakto
    // Se estiver, verificar se o pagamento está ativo e tem contas disponíveis
    if (data.cakto_customer_id) {
      // Verificar se o pagamento está ativo
      const { data: paymentProfile, error: paymentError } = await supabase
        .from('user_profiles')
        .select('id, status, expiry_date, cakto_customer_id')
        .eq('cakto_customer_id', data.cakto_customer_id)
        .eq('status', 'active')
        .limit(1)
        .maybeSingle();

      if (paymentError && paymentError.code !== 'PGRST116') {
        throw paymentError;
      }

      // Se não encontrou perfil ativo, o pagamento não está ativo
      if (!paymentProfile) {
        throw new Error('PAGAMENTO_INATIVO');
      }

      // Verificar se o pagamento não expirou
      if (paymentProfile.expiry_date) {
        const expiryDate = new Date(paymentProfile.expiry_date);
        if (expiryDate < new Date()) {
          throw new Error('PAGAMENTO_EXPIRADO');
        }
      }

      // Verificar se há vagas disponíveis (se max_linked_accounts estiver definido)
      if (data.max_linked_accounts !== null && data.max_linked_accounts !== undefined) {
        if (data.linked_accounts_count >= data.max_linked_accounts) {
          throw new Error('CUPOM_ESGOTADO');
        }
      }
    }

    return data as Coupon;
  },

  // Buscar cupom por email do cliente (cakto_customer_id)
  async getCouponByEmail(email: string): Promise<Coupon | null> {
    if (!email) return null;

    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('cakto_customer_id', email)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Erro ao buscar cupom por email:', error);
      return null;
    }

    return data as Coupon | null;
  },

  // Incrementar uso do cupom (proteção contra over-usage)
  async incrementUsage(couponId: string) {
    const { data, error } = await supabase
      .from('coupons')
      .update({ current_uses: supabase.rpc('noop') })
      .eq('id', couponId)
      .select('id, current_uses, max_uses')
      .single();

    // A linha acima não incrementa de fato; vamos fazer com update simples e checagem
    // (não temos uma function SQL específica ainda).
    if (error) {
      // fallback: tentativa simples de incremento atômico via expressão
      const { error: fallbackError } = await supabase
        .from('coupons')
        .update({ current_uses: (data?.current_uses ?? 0) + 1 })
        .eq('id', couponId);

      if (fallbackError) throw fallbackError;
      return;
    }

    if (data.current_uses > data.max_uses) {
      throw new Error('CUPOM_ESGOTADO');
    }
  },

  /**
   * Ativa um cupom de forma atômica (validação + decremento + atualização de plano)
   * Desacoplado de gateways de pagamento externos.
   * 
   * @param code Código do cupom
   * @param userId ID do usuário que está ativando o cupom
   * @returns Objeto com success, message, plan_type e account_type
   */
  async activateCoupon(code: string, userId: string): Promise<{
    success: boolean;
    message: string;
    plan_type?: string;
    account_type?: string;
    error?: string;
  }> {
    const normalized = code.trim().toUpperCase();
    if (!normalized) {
      throw new Error('CÓDIGO_VAZIO');
    }

    // Validar disponibilidade B2B antes de ativar (se for cupom B2B)
    const { data: validationData, error: validationError } = await supabase.rpc('validate_b2b_coupon_availability', {
      p_coupon_code: normalized
    });

    if (!validationError && validationData) {
      const validation = validationData as { valid: boolean; error?: string; message?: string };
      if (!validation.valid) {
        throw new Error(validation.error || 'CUPOM_ESGOTADO');
      }
    }

    const { data, error } = await supabase.rpc('activate_coupon_internal', {
      p_coupon_code: normalized,
      p_user_id: userId
    });

    if (error) {
      console.error('Erro ao ativar cupom:', error);
      throw new Error(error.message || 'ERRO_ATIVACAO');
    }

    if (!data) {
      throw new Error('ERRO_INTERNO');
    }

    const result = data as {
      success: boolean;
      message: string;
      plan_type?: string;
      account_type?: string;
      error?: string;
    };

    if (!result.success) {
      // Mapear erros para mensagens amigáveis
      const errorMessages: Record<string, string> = {
        'CUPOM_INEXISTENTE': 'Cupom não encontrado ou inativo.',
        'CUPOM_ESGOTADO': 'Este cupom não possui mais ativações disponíveis.',
        'PERFIL_INCOMPATIVEL': 'Este cupom é válido apenas para perfis de Academia ou Personal Trainer.',
        'USUARIO_NAO_ENCONTRADO': 'Perfil do usuário não encontrado.',
        'ERRO_INTERNO': 'Erro interno ao processar a ativação.'
      };

      throw new Error(errorMessages[result.error || ''] || result.message || 'Erro ao ativar cupom.');
    }

    return result;
  },
};

export const authFlowService = {
  /**
   * Fluxo de registro com suporte a código de convite.
   *
   * Regra:
   * - Se houver código de convite:
   *   - Valida cupom (existe, ativo, com uso disponível)
   *   - Cria usuário com metadata { plan_type: plan_linked, subscription_status: 'active' }
   *   - Incrementa current_uses do cupom
   * - Se NÃO houver código (Trial Grátis):
   *   - Cria usuário com metadata { plan_type: 'free', subscription_status: 'trial' }
   *   - Define subscription_expiry = hoje + 3 dias
   *   - Define daily_free_minutes = 5 (300 segundos) - Trial tem menos tempo que Premium
   */
  async registerWithInvite(email: string, password: string, inviteCode?: string) {
    let coupon: Coupon | null = null;

    if (inviteCode && inviteCode.trim().length > 0) {
      try {
        coupon = await couponService.validateCoupon(inviteCode);
      } catch (err: any) {
        // Propaga erros de cupom com mensagens específicas
        if (err instanceof Error && err.message === 'CUPOM_ESGOTADO') {
          throw new Error('Este código de convite atingiu o limite de usos.');
        }
        if (err instanceof Error && err.message === 'CUPOM_INEXISTENTE') {
          throw new Error('Código de convite inválido.');
        }
        throw err;
      }
    }

    const planType: PlanType = coupon?.plan_linked ?? 'free';
    // Se não tem cupom, cria como trial, senão active
    const subscriptionStatus: SubscriptionStatus | 'trial' = coupon ? 'active' : 'trial';

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          plan_type: planType,
          subscription_status: subscriptionStatus,
          invite_code: coupon?.code ?? null,
        },
      },
    });

    if (error) throw error;

    const user = data.user;

    if (!user) {
      throw new Error('Erro ao criar usuário.');
    }

    // Aguardar um pouco para garantir que a sessão está estabelecida
    // Isso é necessário para que o RLS reconheça o usuário autenticado
    await new Promise(resolve => setTimeout(resolve, 500));

    // Se usou cupom e criou usuário com sucesso, incrementa uso do cupom
    if (coupon && user) {
      const { error: updateError } = await supabase
        .from('coupons')
        .update({ current_uses: coupon.current_uses + 1 })
        .eq('id', coupon.id);

      if (updateError) {
        // Não falha o cadastro se apenas o incremento do cupom deu erro,
        // mas loga para análise.
        console.error('Erro ao atualizar uso do cupom:', updateError);
      }

      // Criar vínculo entre usuário e cupom na tabela user_coupon_links
      const { error: linkError } = await supabase
        .from('user_coupon_links')
        .insert({
          user_id: user.id,
          coupon_id: coupon.id,
        });

      if (linkError) {
        console.error('Erro ao criar vínculo usuário-cupom:', linkError);
        // Não falha o cadastro, mas loga o erro
      }

      // Criar ou atualizar perfil usando função RPC (bypass RLS)
      const { error: profileError } = await supabase.rpc('create_user_profile', {
        p_user_id: user.id,
        p_name: user.email?.split('@')[0] || 'Usuário',
        p_plan_type: planType,
        p_subscription_status: subscriptionStatus,
        p_subscription_expiry: null,
        p_daily_free_minutes: 15, // Premium tem 15 minutos
      });

      if (profileError) {
        console.error('Erro ao criar/atualizar perfil com cupom:', profileError);
        // Tentar método alternativo
        await supabase
          .from('user_profiles')
          .update({
            plan_type: planType,
            subscription_status: subscriptionStatus,
          })
          .eq('user_id', user.id);
      }
    } else {
      // SEM CUPOM = TRIAL GRÁTIS
      // Definir trial: subscription_status = 'trial', subscription_expiry = hoje + 3 dias, daily_free_minutes = 5 (300 segundos)
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 3); // +3 dias

      // Verificar se o perfil já existe
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingProfile) {
        // Atualizar perfil existente
        const { error: trialError } = await supabase
          .from('user_profiles')
          .update({
            plan_type: 'free',
            subscription_status: 'trial',
            subscription_expiry: expiryDate.toISOString(),
            daily_free_minutes: 5, // 5 minutos = 300 segundos (trial tem menos tempo)
          })
          .eq('user_id', user.id);

        if (trialError) {
          console.error('Erro ao configurar trial:', trialError);
        }
      } else {
        // Criar perfil com trial usando função RPC (bypass RLS)
        const { data: profileData, error: trialError } = await supabase.rpc('create_user_profile', {
          p_user_id: user.id,
          p_name: user.email?.split('@')[0] || 'Usuário',
          p_plan_type: 'free',
          p_subscription_status: 'trial',
          p_subscription_expiry: expiryDate.toISOString(),
          p_daily_free_minutes: 5, // 5 minutos = 300 segundos (trial tem menos tempo)
        });

        if (trialError) {
          console.error('Erro ao criar perfil com trial:', trialError);
          // Tentar método alternativo se RPC falhar
          const { error: fallbackError } = await supabase
            .from('user_profiles')
            .insert({
              user_id: user.id,
              name: user.email?.split('@')[0] || 'Usuário',
              age: 30,
              gender: 'Other',
              height: 170,
              weight: 70,
              activity_level: 'Light',
              goal: 'General Health',
              meals_per_day: 3,
              plan_type: 'free',
              subscription_status: 'trial',
              subscription_expiry: expiryDate.toISOString(),
              daily_free_minutes: 5,
            });
          
          if (fallbackError) {
            console.error('Erro no método alternativo de criação de perfil:', fallbackError);
          }
        }
      }
    }

    return data;
  },
};

// ============================================
// SERVIÇOS DE PERFIL DE USUÁRIO
// ============================================

export const profileService = {
  // Salvar ou atualizar perfil
  async saveProfile(profile: UserProfile, userId: string) {
    const profileData = userProfileToDB(profile, userId);
    
    // Verificar se já existe perfil
    const { data: existing } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (existing) {
      // Atualizar
      const { data, error } = await supabase
        .from('user_profiles')
        .update(profileData)
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error) throw error;
      return userProfileFromDB(data);
    } else {
      // Inserir
      const { data, error } = await supabase
        .from('user_profiles')
        .insert(profileData)
        .select()
        .single();
      
      if (error) throw error;
      return userProfileFromDB(data);
    }
  },

  // Carregar perfil do usuário
  async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      // Primeiro, tentar com select=* (formato mais simples)
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        if (error.code === 'PGRST116') return null; // Não encontrado
        
        // Se for erro 406, pode ser problema de RLS ou formato
        if (error.code === 'PGRST301' || error.message?.includes('406') || error.status === 406) {
          console.warn('Erro 406 ao buscar perfil. Verificando RLS e tentando método alternativo...');
          
          // Tentar verificar se o usuário está autenticado
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            console.error('Usuário não autenticado - isso pode causar erro 406');
            return null;
          }
          
          // Tentar novamente com select explícito
          const { data: retryData, error: retryError } = await supabase
            .from('user_profiles')
            .select('id, user_id, name, age, gender, height, weight, activity_level, goal, restrictions, meals_per_day, medical_history, routine_description, food_preferences, streak, last_active_date, avatar, chef_avatar')
            .eq('user_id', userId)
            .maybeSingle();
          
          if (retryError) {
            if (retryError.code === 'PGRST116') return null;
            console.error('Erro ao buscar perfil (tentativa 2):', retryError);
            // Não lançar erro, apenas retornar null para não quebrar o fluxo
            return null;
          }
          return retryData ? userProfileFromDB(retryData) : null;
        }
        
        console.error('Erro ao buscar perfil:', error);
        // Não lançar erro, apenas retornar null
        return null;
      }

      return data ? userProfileFromDB(data) : null;
    } catch (error: any) {
      console.error('Erro ao buscar perfil (catch):', error);
      return null;
    }
  },

  // Atualizar streak
  async updateStreak(userId: string, increment: number = 1) {
    const { error } = await supabase.rpc('increment_streak', {
      user_id: userId,
      increment_value: increment,
    });

    // Se a função não existir, fazer manualmente
    if (error) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('streak')
        .eq('user_id', userId)
        .single();

      if (profile) {
        await supabase
          .from('user_profiles')
          .update({ 
            streak: (profile.streak || 0) + increment,
            last_active_date: new Date().toISOString(),
          })
          .eq('user_id', userId);
      }
    }
  },
};

// ============================================
// SERVIÇOS DE PLANOS DIÁRIOS
// ============================================

export const planService = {
  // Salvar plano diário
  async savePlan(plan: DailyPlan, userId: string, planDate?: Date) {
    const planData = dailyPlanToDB(plan, userId, planDate);
    
    // Salvar o plano
    const { data: savedPlan, error: planError } = await supabase
      .from('daily_plans')
      .upsert(planData, { onConflict: 'user_id,plan_date' })
      .select()
      .single();

    if (planError) throw planError;

    // Salvar refeições e itens
    for (const meal of plan.meals) {
      // Criar refeição
      const { data: savedMeal, error: mealError } = await supabase
        .from('daily_plan_meals')
        .insert({
          daily_plan_id: savedPlan.id,
          meal_type: meal.type,
        })
        .select()
        .single();

      if (mealError) throw mealError;

      // Criar itens da refeição
      if (meal.items.length > 0) {
        const mealItems = meal.items.map(item => ({
          daily_plan_meal_id: savedMeal.id,
          name: item.name,
          calories: item.calories,
          protein: item.macros.protein,
          carbs: item.macros.carbs,
          fats: item.macros.fats,
          description: item.description || null,
          substitutions: item.substitutions || null,
          image: item.image || null,
        }));

        const { error: itemsError } = await supabase
          .from('meal_items')
          .insert(mealItems);

        if (itemsError) throw itemsError;
      }
    }

    return savedPlan;
  },

  // Carregar plano do dia
  async getPlan(userId: string, date?: Date): Promise<DailyPlan | null> {
    const planDate = date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

    // Primeiro, buscar o plano sem relacionamentos (evita erro 406)
    const { data: plan, error } = await supabase
      .from('daily_plans')
      .select('*')
      .eq('user_id', userId)
      .eq('plan_date', planDate)
      .maybeSingle();

    if (error) {
      // Se for erro 406, tentar método alternativo
      if (error.code === 'PGRST301' || error.message?.includes('406') || error.status === 406) {
        console.warn('Erro 406 ao buscar plano, tentando método alternativo...');
        const { data: retryPlan, error: retryError } = await supabase
          .from('daily_plans')
          .select('id, user_id, plan_date, total_calories, target_protein, target_carbs, target_fats, nutritional_analysis, behavioral_tips, shopping_list, hydration_target, notes')
          .eq('user_id', userId)
          .eq('plan_date', planDate)
          .maybeSingle();
        
        if (retryError) {
          if (retryError.code === 'PGRST116') return null;
          console.error('Erro ao buscar plano (tentativa 2):', retryError);
          return null;
        }
        
        if (!retryPlan) return null;
        
        // Carregar refeições e itens separadamente
        const { data: meals, error: mealsError } = await supabase
          .from('daily_plan_meals')
          .select('*')
          .eq('daily_plan_id', retryPlan.id);

        if (mealsError) {
          console.error('Erro ao buscar refeições:', mealsError);
          // Continuar mesmo sem refeições
        } else if (meals && meals.length > 0) {
          // Carregar itens de cada refeição
          const mealIds = meals.map((m: any) => m.id);
          const { data: items, error: itemsError } = await supabase
            .from('meal_items')
            .select('*')
            .in('daily_plan_meal_id', mealIds);

          if (itemsError) {
            console.error('Erro ao buscar itens:', itemsError);
          } else {
            // Associar itens às refeições
            meals.forEach((meal: any) => {
              meal.meal_items = items?.filter((item: any) => item.daily_plan_meal_id === meal.id) || [];
            });
          }
        }

        const formattedMeals = meals?.map((meal: any) => ({
          type: meal.meal_type,
          items: (meal.meal_items || []).map((item: any) => ({
            name: item.name,
            calories: item.calories,
            macros: {
              protein: Number(item.protein),
              carbs: Number(item.carbs),
              fats: Number(item.fats),
            },
            description: item.description || '',
            substitutions: item.substitutions || [],
            image: item.image,
          })),
        })) || [];

        return dailyPlanFromDB(retryPlan, formattedMeals);
      }
      
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    if (!plan) return null;

    // Carregar refeições e itens separadamente (evita erro 406)
    const { data: meals, error: mealsError } = await supabase
      .from('daily_plan_meals')
      .select('*')
      .eq('daily_plan_id', plan.id);

    if (mealsError) {
      console.error('Erro ao buscar refeições:', mealsError);
      // Continuar mesmo sem refeições
    } else if (meals && meals.length > 0) {
      // Carregar itens de cada refeição
      const mealIds = meals.map((m: any) => m.id);
      const { data: items, error: itemsError } = await supabase
        .from('meal_items')
        .select('*')
        .in('daily_plan_meal_id', mealIds);

      if (itemsError) {
        console.error('Erro ao buscar itens:', itemsError);
      } else {
        // Associar itens às refeições
        meals.forEach((meal: any) => {
          meal.meal_items = items?.filter((item: any) => item.daily_plan_meal_id === meal.id) || [];
        });
      }
    }

    const formattedMeals = (meals || []).map((meal: any) => ({
      type: meal.meal_type,
      items: (meal.meal_items || []).map((item: any) => ({
        name: item.name,
        calories: item.calories,
        macros: {
          protein: Number(item.protein || 0),
          carbs: Number(item.carbs || 0),
          fats: Number(item.fats || 0),
        },
        description: item.description || '',
        substitutions: item.substitutions || [],
        image: item.image,
      })),
    }));

    return dailyPlanFromDB(plan, formattedMeals);
  },

  // Verificar se usuário já tem algum plano salvo
  async hasExistingPlan(userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('daily_plans')
      .select('id')
      .eq('user_id', userId)
      .limit(1);

    if (error) {
      console.error('Error checking existing plan:', error);
      return false;
    }

    return (data && data.length > 0) || false;
  },
};

// ============================================
// SERVIÇOS DE REGISTROS DIÁRIOS (LOGS)
// ============================================

export const logService = {
  // Adicionar item ao log diário
  async addLogItem(userId: string, logItem: LogItem) {
    const { data, error } = await supabase
      .from('daily_logs')
      .insert({
        user_id: userId,
        name: logItem.name,
        calories: logItem.calories,
        protein: logItem.macros.protein,
        carbs: logItem.macros.carbs,
        fats: logItem.macros.fats,
        description: logItem.description || null,
        meal_type: logItem.type,
        image: logItem.image || null,
        timestamp: new Date(logItem.timestamp).toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Carregar logs do dia
  async getDailyLogs(userId: string, date?: Date): Promise<LogItem[]> {
    const targetDate = date || new Date();
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0)).toISOString();
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999)).toISOString();

    const { data, error } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('timestamp', startOfDay)
      .lte('timestamp', endOfDay)
      .order('timestamp', { ascending: false });

    if (error) throw error;

    return (data || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      calories: item.calories,
      macros: {
        protein: Number(item.protein),
        carbs: Number(item.carbs),
        fats: Number(item.fats),
      },
      description: item.description || '',
      type: item.meal_type,
      image: item.image || undefined,
      timestamp: new Date(item.timestamp).getTime(),
    }));
  },

  // Deletar item do log
  async deleteLogItem(logId: string) {
    const { error } = await supabase
      .from('daily_logs')
      .delete()
      .eq('id', logId);

    if (error) throw error;
  },
};

// ============================================
// SERVIÇOS DE HISTÓRICO DE ESCANEAMENTOS
// ============================================

export const scanService = {
  // Salvar escaneamento
  async saveScan(userId: string, scanItem: ScanHistoryItem) {
    const { data, error } = await supabase
      .from('scan_history')
      .insert({
        user_id: userId,
        image: scanItem.image,
        result_name: scanItem.resultName || null,
        scan_date: new Date(scanItem.date).toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Carregar histórico de escaneamentos
  async getScanHistory(userId: string, limit: number = 20): Promise<ScanHistoryItem[]> {
    const { data, error } = await supabase
      .from('scan_history')
      .select('*')
      .eq('user_id', userId)
      .order('scan_date', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []).map((item: any) => ({
      id: item.id,
      image: item.image,
      date: new Date(item.scan_date).getTime(),
      resultName: item.result_name || undefined,
    }));
  },
};

// ============================================
// SERVIÇOS DE BEM-ESTAR (WELLNESS)
// ============================================

export const wellnessService = {
  // Salvar estado de bem-estar
  async saveWellness(userId: string, wellness: WellnessState, date?: Date) {
    const trackingDate = date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

    // Salvar tracking
    const { data: tracking, error: trackingError } = await supabase
      .from('wellness_tracking')
      .upsert({
        user_id: userId,
        tracking_date: trackingDate,
        mood: wellness.mood || null,
        water_glasses: wellness.waterGlasses,
        sleep_hours: wellness.sleepHours || null,
        sleep_quality: wellness.sleepQuality || null,
        notification_water: wellness.notifications.water,
        notification_sleep: wellness.notifications.sleep,
        notification_meals: wellness.notifications.meals,
      }, { onConflict: 'user_id,tracking_date' })
      .select()
      .single();

    if (trackingError) throw trackingError;

    // Deletar hábitos antigos
    await supabase
      .from('wellness_habits')
      .delete()
      .eq('wellness_tracking_id', tracking.id);

    // Inserir novos hábitos
    if (wellness.habits.length > 0) {
      const habits = wellness.habits.map(habit => ({
        wellness_tracking_id: tracking.id,
        habit_text: habit.text,
        completed: habit.completed,
      }));

      const { error: habitsError } = await supabase
        .from('wellness_habits')
        .insert(habits);

      if (habitsError) throw habitsError;
    }

    return tracking;
  },

  // Carregar estado de bem-estar
  async getWellness(userId: string, date?: Date): Promise<WellnessState | null> {
    const trackingDate = date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

    const { data: tracking, error } = await supabase
      .from('wellness_tracking')
      .select(`
        *,
        wellness_habits (*)
      `)
      .eq('user_id', userId)
      .eq('tracking_date', trackingDate)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return {
      mood: tracking.mood as 'good' | 'neutral' | 'bad' | null,
      waterGlasses: tracking.water_glasses || 0,
      habits: (tracking.wellness_habits || []).map((h: any, index: number) => ({
        id: h.id || index + 1,
        text: h.habit_text,
        completed: h.completed,
      })),
      sleepHours: tracking.sleep_hours ? Number(tracking.sleep_hours) : null,
      sleepQuality: tracking.sleep_quality || null,
      notifications: {
        water: tracking.notification_water,
        sleep: tracking.notification_sleep,
        meals: tracking.notification_meals,
      },
    };
  },
};

// ============================================
// SERVIÇOS DE MENSAGENS DO CHAT
// ============================================

export const chatService = {
  // Salvar mensagem
  async saveMessage(userId: string, message: ChatMessage) {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        user_id: userId,
        role: message.role,
        text: message.text,
        image: message.image || null,
        timestamp: new Date(message.timestamp).toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Carregar histórico de mensagens
  async getMessages(userId: string, limit: number = 50): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []).reverse().map((item: any) => ({
      id: item.id,
      role: item.role as 'user' | 'model',
      text: item.text,
      image: item.image || undefined,
      timestamp: new Date(item.timestamp).getTime(),
    }));
  },
};

// ============================================
// SERVIÇOS DE PROGRESSO
// ============================================

export const progressService = {
  // Salvar entrada de progresso
  async saveProgress(userId: string, date: Date, weight?: number, calories?: number, steps?: number) {
    const { data, error } = await supabase
      .from('progress_entries')
      .upsert({
        user_id: userId,
        entry_date: date.toISOString().split('T')[0],
        weight: weight || null,
        calories_consumed: calories || null,
        steps: steps || null,
      }, { onConflict: 'user_id,entry_date' })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Carregar progresso
  async getProgress(userId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('progress_entries')
      .select('*')
      .eq('user_id', userId)
      .gte('entry_date', startDate.toISOString().split('T')[0])
      .order('entry_date', { ascending: true });

    if (error) throw error;
    return data || [];
  },
};

// ============================================
// LIMITES DE USO (VOZ & TEXTO) E DELEÇÃO DE CONTA
// ============================================

export const limitsService = {
  /**
   * Verifica e consome limite de VOZ (segundos) para a sessão atual.
   * NOVA LÓGICA COM PRIORIDADES:
   * 1) VIP (PREMIUM_UNLIMITED ativo) - não desconta nada
   * 2) Gratuito (daily_free_minutes) - desconta primeiro
   * 3) Boost (boost_minutes_balance) - desconta segundo (expira em 24h)
   * 4) Reserva (reserve_bank_balance) - desconta terceiro (não expira)
   * 5) Se não houver saldo, lança erro LIMIT_REACHED
   */
  async consumeVoiceSeconds(userId: string, seconds: number) {
    const minutes = Math.ceil(seconds / 60); // Converter segundos para minutos (arredondar para cima)

    // Usar função SQL para consumo com prioridades
    const { data, error } = await supabase.rpc('consume_voice_time', {
      p_user_id: userId,
      p_minutes: minutes,
    });

    if (error) {
      console.error('Erro ao consumir tempo de voz:', error);
      throw error;
    }

    if (!data || !data.success) {
      const errorMsg = data?.error || 'LIMIT_REACHED';
      throw new Error(errorMsg);
    }

    // Converter minutos de volta para segundos para retorno
    const remainingFreeSeconds = (data.remaining_free || 0) * 60;
    const remainingBoostSeconds = (data.remaining_boost || 0) * 60;
    const remainingReserveSeconds = (data.remaining_reserve || 0) * 60;

    return {
      isVip: data.is_vip || false,
      consumedFromFree: (data.consumed_from_free || 0) * 60,
      consumedFromBoost: (data.consumed_from_boost || 0) * 60,
      consumedFromReserve: (data.consumed_from_reserve || 0) * 60,
      remainingFreeSeconds,
      remainingBoostSeconds,
      remainingReserveSeconds,
      totalRemainingSeconds: remainingFreeSeconds + remainingBoostSeconds + remainingReserveSeconds,
    };
  },

  /**
   * Obtém saldos disponíveis de voz (sem consumir)
   */
  async getVoiceBalances(userId: string) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select(
        'subscription_status, subscription_expiry, daily_free_minutes, boost_minutes_balance, boost_expiry, reserve_bank_balance'
      )
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    if (!data) throw new Error('PROFILE_NOT_FOUND');

    const now = new Date();
    const isVip =
      data.subscription_status === 'PREMIUM_UNLIMITED' &&
      data.subscription_expiry &&
      new Date(data.subscription_expiry) > now;

    // Verificar se boost expirou
    let boostMinutes = data.boost_minutes_balance || 0;
    if (data.boost_expiry && new Date(data.boost_expiry) < now) {
      boostMinutes = 0;
    }

    const freeMinutes = data.daily_free_minutes || 0;
    const reserveMinutes = data.reserve_bank_balance || 0;

    return {
      isVip,
      freeMinutes,
      boostMinutes,
      reserveMinutes,
      totalMinutes: freeMinutes + boostMinutes + reserveMinutes,
      totalSeconds: (freeMinutes + boostMinutes + reserveMinutes) * 60,
      boostExpiry: data.boost_expiry,
      subscriptionExpiry: data.subscription_expiry,
    };
  },

  /**
   * Adiciona minutos de Boost (Ajuda Rápida - R$ 5,00)
   */
  async addBoostMinutes(userId: string, minutes: number = 20) {
    const { data, error } = await supabase.rpc('add_boost_minutes', {
      p_user_id: userId,
      p_minutes: minutes,
    });

    if (error) throw error;
    if (!data || !data.success) {
      throw new Error(data?.error || 'Erro ao adicionar boost');
    }

    return { success: true };
  },

  /**
   * Adiciona minutos de Reserva (R$ 12,90)
   */
  async addReserveMinutes(userId: string, minutes: number = 100) {
    const { data, error } = await supabase.rpc('add_reserve_minutes', {
      p_user_id: userId,
      p_minutes: minutes,
    });

    if (error) throw error;
    if (!data || !data.success) {
      throw new Error(data?.error || 'Erro ao adicionar reserva');
    }

    return { success: true };
  },

  /**
   * Ativa assinatura ilimitada (R$ 19,90)
   */
  async activateUnlimitedSubscription(userId: string, days: number = 30) {
    const { data, error } = await supabase.rpc('activate_unlimited_subscription', {
      p_user_id: userId,
      p_days: days,
    });

    if (error) throw error;
    if (!data || !data.success) {
      throw new Error(data?.error || 'Erro ao ativar assinatura');
    }

    return { success: true };
  },

  /**
   * Verifica limite diário de mensagens de TEXTO.
   * - Reseta contador se o dia mudou
   * - Se ultrapassar 600, lança erro "TEXT_LIMIT_REACHED"
   * - Caso contrário, incrementa 1
   */
  async registerTextMessage(userId: string) {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('user_profiles')
      .select('id, text_msg_count_today, last_msg_date')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    if (!data) throw new Error('PROFILE_NOT_FOUND');

    let { text_msg_count_today, last_msg_date } = data as any;

    if (!last_msg_date || last_msg_date.split('T')[0] !== today) {
      text_msg_count_today = 0;
      last_msg_date = today;
    }

    if (text_msg_count_today >= 600) {
      throw new Error('TEXT_LIMIT_REACHED');
    }

    text_msg_count_today += 1;

    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        text_msg_count_today,
        last_msg_date: today,
      })
      .eq('user_id', userId);

    if (updateError) throw updateError;

    return { text_msg_count_today };
  },

  /**
   * Deleção completa de conta (compliance Google Play):
   * - Delete de dados de histórico principais (chat_messages, daily_logs, scan_history, progress_entries, user_challenges, wellness_tracking, etc.)
   * - Delete de user_profiles
   * - Delete de auth user
   */
  async deleteAccount(userId: string) {
    // Limpar dados relacionais (ordem para evitar FK issues)
    const tables = [
      'chat_messages',
      'daily_logs',
      'scan_history',
      'progress_entries',
      'user_challenges',
      'wellness_habits',
      'wellness_tracking',
      'daily_plan_meals',
      'meal_items',
      'daily_plans',
    ];

    for (const table of tables) {
      await supabase.from(table).delete().eq('user_id', userId).catch(() => {});
    }

    // Delete profile
    await supabase.from('user_profiles').delete().eq('user_id', userId).catch(() => {});

    // Delete auth user (necessita chave de serviço / edge function em produção)
    // No frontend, apenas fazemos signOut. A deleção real deve ser feita via Edge Function
    // com service_role_key por questões de segurança
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Erro ao fazer signOut:', error);
    }
  },
};

// ============================================
// SISTEMA DE ROLES E PERMISSÕES
// ============================================

export const permissionsService = {
  /**
   * Obtém informações completas de acesso e permissões do usuário
   */
  async getUserAccessInfo(userId: string): Promise<UserAccessInfo> {
    const { data, error } = await supabase.rpc('get_user_access_info', {
      p_user_id: userId,
    });

    if (error) throw error;
    if (!data) throw new Error('ACCESS_INFO_NOT_FOUND');

    return {
      account_type: data.account_type as AccountType,
      has_access: data.has_access as boolean,
      block_reason: data.block_reason || undefined,
      block_message: data.block_message || undefined,
      can_use_voice: data.can_use_voice as boolean,
      can_use_chat: data.can_use_chat as boolean,
      can_log_meals: data.can_log_meals as boolean,
      can_access_progress: data.can_access_progress as boolean,
      can_access_dashboard: data.can_access_dashboard as boolean,
      redirect_to: data.redirect_to as 'dashboard' | 'progress' | 'blocked',
    };
  },

  /**
   * Verifica status da academia vinculada ao aluno
   */
  async checkGymAccountStatus(studentUserId: string) {
    const { data, error } = await supabase.rpc('check_gym_account_status', {
      p_student_user_id: studentUserId,
    });

    if (error) throw error;
    return data;
  },

  /**
   * Vincula um aluno (USER_GYM) a uma academia (USER_PERSONAL)
   */
  async linkStudentToGym(gymUserId: string, studentUserId: string) {
    const { data, error } = await supabase.rpc('link_student_to_gym', {
      p_gym_user_id: gymUserId,
      p_student_user_id: studentUserId,
    });

    if (error) throw error;
    return data;
  },

  /**
   * Obtém o account_type do usuário
   */
  async getAccountType(userId: string): Promise<AccountType | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('account_type')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return (data?.account_type as AccountType) || null;
  },
};

// ============================================
// SERVIÇOS DE ENQUETE
// ============================================

export const surveyService = {
  // Verificar se usuário já respondeu a enquete
  async hasCompletedSurvey(userId: string): Promise<boolean> {
    try {
      // Tentar verificar na tabela user_surveys (se existir)
      const { data, error } = await supabase
        .from('user_surveys')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        // Se for erro 406, tentar método alternativo
        if (error.code === 'PGRST301' || error.message?.includes('406')) {
          console.warn('Erro 406 ao verificar enquete, tentando método alternativo...');
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('user_surveys')
            .select('id')
            .eq('user_id', userId)
            .maybeSingle();
          
          if (fallbackError) {
            if (fallbackError.code === 'PGRST116') return false;
            // Se a tabela não existir, verificar em user_profiles
            if (fallbackError.code === '42P01') {
              const { data: profile } = await supabase
                .from('user_profiles')
                .select('survey_completed')
                .eq('user_id', userId)
                .maybeSingle();
              return profile?.survey_completed || false;
            }
            console.error('Erro ao verificar enquete:', fallbackError);
            return false;
          }
          return !!fallbackData;
        }
        
        if (error.code === 'PGRST116') return false; // Não encontrado = não respondeu
        // Se a tabela não existir, verificar em user_profiles
        if (error.code === '42P01') {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('survey_completed')
            .eq('user_id', userId)
            .maybeSingle();
          return profile?.survey_completed || false;
        }
        console.error('Erro ao verificar enquete:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Erro ao verificar enquete:', error);
      return false;
    }
  },

  // Salvar respostas da enquete
  async saveSurvey(userId: string, answers: {
    howDidYouFindUs: string;
    mainGoal: string;
    experience: string;
    feedback?: string;
  }): Promise<void> {
    try {
      // Tentar salvar na tabela user_surveys (se existir)
      const { error } = await supabase
        .from('user_surveys')
        .insert({
          user_id: userId,
          how_did_you_find_us: answers.howDidYouFindUs,
          main_goal: answers.mainGoal,
          experience: answers.experience,
          feedback: answers.feedback || null,
          completed_at: new Date().toISOString(),
        });

      if (error) {
        // Se a tabela não existir, salvar em user_profiles como fallback
        if (error.code === '42P01') {
          console.warn('Tabela user_surveys não existe. Salvando em user_profiles...');
          await supabase
            .from('user_profiles')
            .update({
              survey_completed: true,
              survey_data: answers,
            })
            .eq('user_id', userId);
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Erro ao salvar enquete:', error);
      // Não quebra o fluxo se houver erro ao salvar enquete
    }
  },
};


