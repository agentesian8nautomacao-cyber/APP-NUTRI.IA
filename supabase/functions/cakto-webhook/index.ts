import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Variáveis de ambiente da Edge Function
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const CAKTO_WEBHOOK_SECRET = Deno.env.get('CAKTO_WEBHOOK_SECRET')!;

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

type PlanType =
  | 'free'
  | 'monthly'
  | 'annual'
  | 'academy_starter'
  | 'academy_growth'
  | 'personal_team';

type CaktoPayload = {
  event_type: 'subscription_created' | 'subscription_updated' | 'subscription_canceled';
  email: string;
  plan_code: string; // ex: ACADEMY_START
  expires_at?: string; // opcional, se a Cakto já mandar
};

const PLAN_MAPPING: Record<
  string,
  {
    plan_type: PlanType;
    daily_voice_seconds: number;
    upsell_voice_seconds: number;
    duration_days: number;
  }
> = {
  FREE: { plan_type: 'free', daily_voice_seconds: 900, upsell_voice_seconds: 0, duration_days: 0 },
  MONTHLY: { plan_type: 'monthly', daily_voice_seconds: 900, upsell_voice_seconds: 0, duration_days: 30 },
  ANNUAL: { plan_type: 'annual', daily_voice_seconds: 900, upsell_voice_seconds: 0, duration_days: 365 },
  ACADEMY_START: {
    plan_type: 'academy_starter',
    daily_voice_seconds: 1800,
    upsell_voice_seconds: 0,
    duration_days: 365,
  },
  ACADEMY_GROW: {
    plan_type: 'academy_growth',
    daily_voice_seconds: 2700,
    upsell_voice_seconds: 0,
    duration_days: 365,
  },
  PERSONAL_TEAM: {
    plan_type: 'personal_team',
    daily_voice_seconds: 3600,
    upsell_voice_seconds: 0,
    duration_days: 365,
  },
};

Deno.serve(async (req) => {
  // 1) Autenticação do webhook via Bearer token
  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.replace('Bearer ', '').trim();
  if (!token || token !== CAKTO_WEBHOOK_SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const body = (await req.json()) as CaktoPayload;
    const { event_type, email, plan_code } = body;

    if (!email || !plan_code) {
      return new Response('Missing email or plan_code', { status: 400 });
    }

    const plan = PLAN_MAPPING[plan_code];
    if (!plan) {
      console.warn('Plano não mapeado:', plan_code);
      return new Response('Unknown plan_code', { status: 400 });
    }

    // 2) Encontrar ou criar usuário no auth pela Cakto (email)
    const { data: userByEmail, error: getUserErr } =
      await supabaseAdmin.auth.admin.getUserByEmail(email);

    if (getUserErr && getUserErr.message !== 'User not found') {
      console.error('Erro ao buscar usuário por email:', getUserErr);
      throw getUserErr;
    }

    let user = userByEmail?.user ?? null;

    if (!user) {
      const { data: created, error: createErr } =
        await supabaseAdmin.auth.admin.createUser({
          email,
          email_confirm: true,
        });
      if (createErr) {
        console.error('Erro ao criar usuário:', createErr);
        throw createErr;
      }
      user = created.user;
    }

    if (!user) {
      return new Response('User error', { status: 500 });
    }

    // 3) Calcular expiry_date
    let expiry_date: string | null = null;
    if (body.expires_at) {
      expiry_date = body.expires_at;
    } else if (plan.duration_days > 0) {
      const now = new Date();
      now.setDate(now.getDate() + plan.duration_days);
      expiry_date = now.toISOString();
    }

    const subscription_status =
      event_type === 'subscription_canceled' ? 'expired' : 'active';

    // 4) Upsert em user_profiles com plano e limites
    const { error: upsertErr } = await supabaseAdmin
      .from('user_profiles')
      .upsert(
        {
          user_id: user.id,
          name: user.email ?? 'Usuário Nutri.ai',
          age: 30,
          gender: 'Other',
          height: 170,
          weight: 70,
          activity_level: 'Light',
          goal: 'General Health',
          meals_per_day: 3,
          restrictions: '',
          medical_history: '',
          routine_description: '',
          food_preferences: '',
          streak: 0,
          last_active_date: new Date().toISOString(),
          plan_type: plan.plan_type,
          subscription_status,
          expiry_date,
          voice_daily_limit_seconds: plan.daily_voice_seconds,
          voice_balance_upsell: plan.upsell_voice_seconds,
        },
        { onConflict: 'user_id' },
      );

    if (upsertErr) {
      console.error('Erro ao atualizar perfil:', upsertErr);
      throw upsertErr;
    }

    return new Response('OK', { status: 200 });
  } catch (err) {
    console.error('Cakto webhook error:', err);
    return new Response('Internal Server Error', { status: 500 });
  }
});

// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

console.log("Hello from Functions!")

Deno.serve(async (req) => {
  const { name } = await req.json()
  const data = {
    message: `Hello ${name}!`,
  }

  return new Response(
    JSON.stringify(data),
    { headers: { "Content-Type": "application/json" } },
  )
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:0/functions/v1/cakto-webhook' \
    --header 'Authorization: Bearer ' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
