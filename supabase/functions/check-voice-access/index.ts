// Edge Function para verificar acesso à voz e consumir tempo
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

interface CheckAccessRequest {
  action: 'check' | 'consume';
  seconds?: number;
}

interface CheckAccessResponse {
  success: boolean;
  hasAccess: boolean;
  reason?: string;
  remaining?: {
    free: number;
    boost: number;
    reserve: number;
    is_vip: boolean;
  };
  consumed?: {
    from_free: number;
    from_boost: number;
    from_reserve: number;
  };
}

/**
 * Verifica e processa recargas pendentes (compras pagas mas não aplicadas)
 * Isso garante que compras feitas no site sejam processadas quando o usuário abre o app
 */
async function checkAndProcessPendingRecharges(userId: string) {
  try {
    // Primeiro, verificar recargas pending que têm transaction_id (foram pagas mas não aplicadas)
    const { data: pendingRechargesWithTx } = await supabaseAdmin
      .from('recharges')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .not('transaction_id', 'is', null)
      .order('created_at', { ascending: false });

    if (pendingRechargesWithTx && pendingRechargesWithTx.length > 0) {
      for (const recharge of pendingRechargesWithTx) {
        await processRechargeFromRecord(recharge);
      }
    }

    // Também verificar pagamentos completados nos últimos 7 dias que podem ser recargas não processadas
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { data: recentPayments, error: paymentsError } = await supabaseAdmin
      .from('payment_history')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: false });

    if (paymentsError || !recentPayments || recentPayments.length === 0) {
      return; // Nenhum pagamento recente
    }

    // Verificar cada pagamento para ver se é uma recarga não processada
    for (const payment of recentPayments) {
      const caktoData = payment.cakto_data as any;
      if (!caktoData || !caktoData.data) continue;

      const productId = caktoData.data.product?.id?.toUpperCase().trim() || '';
      const productName = caktoData.data.product?.name?.toUpperCase().trim() || '';
      
      // Verificar se é uma recarga (quick_help, reserve_minutes, unlimited)
      const isRecharge = 
        productId.includes('QUICK_HELP') || productId.includes('RESERVE_MINUTES') || productId.includes('UNLIMITED') ||
        productName.includes('AJUDA RÁPIDA') || productName.includes('RESERVA') || productName.includes('ILIMITADO');

      if (!isRecharge) continue;

      // Verificar se já existe uma recarga (pending ou completed) para esta transação
      const { data: existingRecharge } = await supabaseAdmin
        .from('recharges')
        .select('*')
        .eq('user_id', userId)
        .eq('transaction_id', payment.transaction_id)
        .single();

      // Se já foi processada (completed), pular
      if (existingRecharge?.status === 'completed') continue;

      // Se existe pending com transaction_id, processar essa
      if (existingRecharge?.status === 'pending') {
        await processRechargeFromRecord(existingRecharge);
        continue;
      }

      // Não existe recarga para esta transação - criar e processar
      console.log('🔄 Processando recarga pendente de pagamento:', {
        transaction_id: payment.transaction_id,
        product_id: productId,
        product_name: productName,
      });

      // Determinar tipo e minutos
      let rechargeType: 'quick_help' | 'reserve_minutes' | 'unlimited' = 'quick_help';
      let minutes = 20;
      let validityDays: number | null = 1;

      if (productId.includes('RESERVE') || productName.includes('RESERVA')) {
        rechargeType = 'reserve_minutes';
        minutes = 100;
        validityDays = null;
      } else if (productId.includes('UNLIMITED') || productName.includes('ILIMITADO')) {
        rechargeType = 'unlimited';
        minutes = -1;
        validityDays = 30;
      } else {
        rechargeType = 'quick_help';
        minutes = 20;
        validityDays = 1;
      }

      // Criar novo registro de recarga
      const { data: newRecharge, error: insertError } = await supabaseAdmin
        .from('recharges')
        .insert({
          user_id: userId,
          recharge_type: rechargeType,
          amount: payment.amount,
          minutes_added: minutes,
          expires_at: validityDays 
            ? new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000).toISOString()
            : null,
          transaction_id: payment.transaction_id,
          cakto_data: caktoData,
          status: 'completed',
        })
        .select()
        .single();

      if (insertError || !newRecharge) {
        console.error('Erro ao criar recarga:', insertError);
        continue;
      }

      // Aplicar minutos ao usuário usando RPC functions
      if (rechargeType === 'quick_help') {
        await supabaseAdmin.rpc('add_boost_minutes', {
          p_user_id: userId,
          p_minutes: minutes,
        });
      } else if (rechargeType === 'reserve_minutes') {
        await supabaseAdmin.rpc('add_reserve_minutes', {
          p_user_id: userId,
          p_minutes: minutes,
        });
      } else if (rechargeType === 'unlimited') {
        await supabaseAdmin.rpc('activate_unlimited_subscription', {
          p_user_id: userId,
          p_days: validityDays || 30,
        });
      }

      console.log('✅ Recarga pendente processada:', {
        transaction_id: payment.transaction_id,
        recharge_type: rechargeType,
        minutes,
      });
    }
  } catch (error) {
    // Não falhar a requisição se houver erro ao processar recargas
    console.error('⚠️ Erro ao verificar recargas pendentes:', error);
  }
}

/**
 * Processa uma recarga a partir de um registro existente
 */
async function processRechargeFromRecord(recharge: any) {
  try {
    if (!recharge.transaction_id) return;

    // Atualizar status para completed
    await supabaseAdmin
      .from('recharges')
      .update({
        status: 'completed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', recharge.id);

    // Aplicar minutos ao usuário
    if (recharge.recharge_type === 'quick_help') {
      await supabaseAdmin.rpc('add_boost_minutes', {
        p_user_id: recharge.user_id,
        p_minutes: recharge.minutes_added || 20,
      });
    } else if (recharge.recharge_type === 'reserve_minutes') {
      await supabaseAdmin.rpc('add_reserve_minutes', {
        p_user_id: recharge.user_id,
        p_minutes: recharge.minutes_added || 100,
      });
    } else if (recharge.recharge_type === 'unlimited') {
      const validityDays = recharge.expires_at
        ? Math.ceil((new Date(recharge.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : 30;
      await supabaseAdmin.rpc('activate_unlimited_subscription', {
        p_user_id: recharge.user_id,
        p_days: validityDays,
      });
    }

    console.log('✅ Recarga processada a partir de registro:', {
      recharge_id: recharge.id,
      transaction_id: recharge.transaction_id,
      recharge_type: recharge.recharge_type,
    });
  } catch (error) {
    console.error('⚠️ Erro ao processar recarga do registro:', error);
  }
}

Deno.serve(async (req) => {
  try {
    // CORS headers
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        },
      });
    }

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ success: false, error: 'Method not allowed' }),
        { status: 405, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get user from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing authorization header' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '').trim();
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid token' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body: CheckAccessRequest = await req.json();
    const { action, seconds = 1 } = body;

    // Get user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ success: false, error: 'Profile not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verificar e processar recargas pendentes (compras pagas mas não processadas)
    await checkAndProcessPendingRecharges(user.id);

    // Atualizar perfil após processar recargas (pode ter mudado)
    const { data: updatedProfile } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    const currentProfile = updatedProfile || profile;

    // Check if user has active subscription
    const hasActiveSubscription = 
      (currentProfile.subscription_status === 'active' || currentProfile.subscription_status === 'PREMIUM_UNLIMITED') && 
      (!currentProfile.expiry_date || new Date(currentProfile.expiry_date) > new Date());

    if (!hasActiveSubscription && currentProfile.plan_type === 'free') {
      // User without subscription - can only use if has minutes available
      const totalAvailable = 
        (currentProfile.daily_free_minutes || 0) +
        (currentProfile.boost_minutes_balance || 0) +
        (currentProfile.reserve_bank_balance || 0);

      if (action === 'check') {
        return new Response(
          JSON.stringify({
            success: true,
            hasAccess: totalAvailable > 0,
            reason: totalAvailable === 0 ? 'NO_MINUTES_AVAILABLE' : undefined,
            remaining: {
              free: currentProfile.daily_free_minutes || 0,
              boost: currentProfile.boost_minutes_balance || 0,
              reserve: currentProfile.reserve_bank_balance || 0,
              is_vip: false,
            },
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
        );
      }

      // Consume minutes
      const minutesToConsume = Math.ceil(seconds / 60);
      const { data: consumeResult, error: consumeError } = await supabaseAdmin.rpc(
        'consume_voice_time',
        {
          p_user_id: user.id,
          p_minutes: minutesToConsume,
        }
      );

      if (consumeError || !consumeResult?.success) {
        return new Response(
          JSON.stringify({
            success: false,
            hasAccess: false,
            reason: 'LIMIT_REACHED',
            error: consumeError?.message || 'Failed to consume voice time',
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          hasAccess: true,
          consumed: {
            from_free: consumeResult.consumed_from_free || 0,
            from_boost: consumeResult.consumed_from_boost || 0,
            from_reserve: consumeResult.consumed_from_reserve || 0,
          },
          remaining: {
            free: consumeResult.remaining_free || 0,
            boost: consumeResult.remaining_boost || 0,
            reserve: consumeResult.remaining_reserve || 0,
            is_vip: consumeResult.is_vip || false,
          },
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // User with active subscription - unlimited access
    if (action === 'check') {
      return new Response(
        JSON.stringify({
          success: true,
          hasAccess: true,
          reason: 'ACTIVE_SUBSCRIPTION',
          remaining: {
            free: currentProfile.daily_free_minutes || 0,
            boost: currentProfile.boost_minutes_balance || 0,
            reserve: currentProfile.reserve_bank_balance || 0,
            is_vip: true,
          },
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // For active subscription, check if VIP (unlimited)
    const isVIP = 
      currentProfile.subscription_status === 'PREMIUM_UNLIMITED' &&
      currentProfile.subscription_expiry &&
      new Date(currentProfile.subscription_expiry) > new Date();

    if (isVIP) {
      // VIP users don't consume minutes
      return new Response(
        JSON.stringify({
          success: true,
          hasAccess: true,
          consumed: { from_free: 0, from_boost: 0, from_reserve: 0 },
          remaining: {
            free: currentProfile.daily_free_minutes || 0,
            boost: currentProfile.boost_minutes_balance || 0,
            reserve: currentProfile.reserve_bank_balance || 0,
            is_vip: true,
          },
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Active subscription but not VIP - consume minutes normally
    const minutesToConsume = Math.ceil(seconds / 60);
    const { data: consumeResult, error: consumeError } = await supabaseAdmin.rpc(
      'consume_voice_time',
      {
        p_user_id: user.id,
        p_minutes: minutesToConsume,
      }
    );

    if (consumeError || !consumeResult?.success) {
      return new Response(
        JSON.stringify({
          success: false,
          hasAccess: false,
          reason: 'LIMIT_REACHED',
          error: consumeError?.message || 'Failed to consume voice time',
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        hasAccess: true,
        consumed: {
          from_free: consumeResult.consumed_from_free || 0,
          from_boost: consumeResult.consumed_from_boost || 0,
          from_reserve: consumeResult.consumed_from_reserve || 0,
        },
        remaining: {
          free: consumeResult.remaining_free || 0,
          boost: consumeResult.remaining_boost || 0,
          reserve: consumeResult.remaining_reserve || 0,
          is_vip: consumeResult.is_vip || false,
        },
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});

