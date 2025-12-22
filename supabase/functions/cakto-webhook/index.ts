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
  | 'academy_pro'
  | 'personal_team';

// Formato do payload conforme documentação da Cakto
type CaktoCustomer = {
  name: string;
  email: string;
  phone?: string;
  docNumber?: string;
};

type CaktoProduct = {
  id: string;
  name: string;
};

type CaktoTransaction = {
  id: string;
  customer: CaktoCustomer;
  amount: number;
  status: string;
  paymentMethod: string;
  product?: CaktoProduct;
};

type CaktoPayload = {
  data: CaktoTransaction;
  event: 'purchase_approved' | 'refund' | 'subscription_cancelled';
  secret?: string;
};

// Mapeamento de planos (baseado no product.name ou product.id)
const PLAN_MAPPING: Record<
  string,
  {
    plan_type: PlanType;
    daily_voice_seconds: number;
    upsell_voice_seconds: number;
    duration_days: number;
  }
> = {
  // Planos por nome do produto
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
  ACADEMY_PRO: {
    plan_type: 'academy_pro',
    daily_voice_seconds: 3600,
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

/**
 * Valida a assinatura HMAC SHA256 do webhook
 */
async function validateWebhookSignature(
  payload: string | Uint8Array,
  signature: string,
  secret: string
): Promise<boolean> {
  try {
    // Converter payload para string se necessário
    const payloadString = typeof payload === 'string' 
      ? payload 
      : new TextDecoder().decode(payload);

    // Calcular HMAC SHA256 usando Web Crypto API
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(payloadString);

    // Importar chave
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    // Calcular assinatura
    const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
    
    // Converter para hex
    const hashArray = Array.from(new Uint8Array(signatureBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Comparar com assinatura recebida (case-insensitive)
    return hashHex.toLowerCase() === signature.toLowerCase();
  } catch (error) {
    console.error('Erro ao validar assinatura:', error);
    return false;
  }
}

/**
 * Busca usuário por email usando API REST do Supabase Auth
 */
async function getUserByEmail(email: string) {
  try {
    // Usar listUsers com filtro (se disponível) ou buscar todos e filtrar
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();
    
    if (error) {
      console.error('Erro ao listar usuários:', error);
      return null;
    }
    
    if (!data || !data.users) {
      console.warn('Nenhum usuário encontrado na lista');
      return null;
    }
    
    const user = data.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      console.log(`Usuário não encontrado para email: ${email}`);
    }
    
    return user || null;
  } catch (error) {
    console.error('Erro ao buscar usuário por email:', error);
    return null;
  }
}

/**
 * Processa pagamento aprovado
 */
async function processPaymentApproved(webhookData: CaktoPayload) {
  try {
    const { data } = webhookData;
    const customer = data.customer;
    const transaction = data;
    const transactionId = transaction.id;
    const amount = transaction.amount;
    const paymentMethod = transaction.paymentMethod;
    const status = transaction.status;

    console.log('💳 Processando pagamento aprovado:', {
      email: customer.email,
      transactionId,
      amount,
      paymentMethod,
      status,
    });

    // Buscar usuário por email
    let user = await getUserByEmail(customer.email);

    if (!user) {
      const { data: created, error: createErr } =
        await supabaseAdmin.auth.admin.createUser({
          email: customer.email,
          email_confirm: true,
          user_metadata: {
            name: customer.name,
            phone: customer.phone,
          },
        });
      if (createErr) {
        console.error('Erro ao criar usuário:', createErr);
        throw createErr;
      }
      user = created.user;
    }

    if (!user) {
      return {
        success: false,
        message: 'Erro ao criar/buscar usuário',
        transaction_id: transactionId,
      };
    }

    // Verificar se é uma recarga (quick_help, reserve_minutes, unlimited)
    const productId = transaction.product?.id?.toUpperCase().trim() || '';
    const productName = transaction.product?.name?.toUpperCase().trim() || '';
    
    const isRecharge = 
      productId.includes('QUICK_HELP') || productId.includes('RESERVE_MINUTES') || productId.includes('UNLIMITED') ||
      productName.includes('AJUDA RÁPIDA') || productName.includes('RESERVA') || productName.includes('ILIMITADO');

    if (isRecharge) {
      // Processar recarga
      return await processRecharge(webhookData, user.id);
    }

    // Determinar plano baseado no produto
    let plan = PLAN_MAPPING.FREE; // Default
    if (transaction.product) {
      // Tentar encontrar por nome ou ID
      for (const [key, value] of Object.entries(PLAN_MAPPING)) {
        if (productName.includes(key) || productId.includes(key)) {
          plan = value;
          break;
        }
      }
    }

    // Calcular expiry_date
    let expiry_date: string | null = null;
    if (plan.duration_days > 0) {
      const now = new Date();
      now.setDate(now.getDate() + plan.duration_days);
      expiry_date = now.toISOString();
    }

    // Atualizar perfil
    const { error: upsertErr } = await supabaseAdmin
      .from('user_profiles')
      .upsert(
        {
          user_id: user.id,
          name: customer.name || user.email || 'Usuário Nutri.ai',
          age: 30, // Default, pode ser atualizado depois
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
          subscription_status: 'active',
          expiry_date,
          voice_daily_limit_seconds: plan.daily_voice_seconds,
          voice_balance_upsell: plan.upsell_voice_seconds,
          cakto_customer_id: customer.email, // Usar email como ID temporário
          last_payment_date: new Date().toISOString(),
          payment_method: paymentMethod,
        },
        { onConflict: 'user_id' },
      );

    if (upsertErr) {
      console.error('Erro ao atualizar perfil:', upsertErr);
      throw upsertErr;
    }

    // Salvar histórico de pagamento
    const { error: historyError } = await supabaseAdmin
      .from('payment_history')
      .insert({
        user_id: user.id,
        transaction_id: transactionId,
        amount: amount,
        status: 'completed',
        payment_method: paymentMethod,
        cakto_data: webhookData as any,
      });

    if (historyError) {
      console.error('Erro ao salvar histórico:', historyError);
      // Não falhar se histórico não salvar
    }

    console.log('✅ Pagamento aprovado processado:', {
      email: customer.email,
      transaction_id: transactionId,
      plan_type: plan.plan_type,
    });

    return {
      success: true,
      message: 'Pagamento processado com sucesso',
      transaction_id: transactionId,
      amount: amount,
      user_id: user.id,
      plan_type: plan.plan_type,
    };
  } catch (error) {
    console.error('❌ Erro ao processar pagamento aprovado:', error);
    throw error;
  }
}

/**
 * Processa compra de recarga
 */
async function processRecharge(webhookData: CaktoPayload, userId: string) {
  try {
    const { data } = webhookData;
    const transaction = data;
    const transactionId = transaction.id;
    const amount = transaction.amount;
    const productId = transaction.product?.id?.toUpperCase().trim() || '';
    const productName = transaction.product?.name?.toUpperCase().trim() || '';

    console.log('💳 Processando recarga:', {
      transactionId,
      amount,
      productId,
      productName,
    });

    // Determinar tipo de recarga
    let rechargeType: 'quick_help' | 'reserve_minutes' | 'unlimited' = 'quick_help';
    let minutes = 20;
    let validityDays: number | null = 1;

    if (productId.includes('RESERVE') || productName.includes('RESERVA')) {
      rechargeType = 'reserve_minutes';
      minutes = 100;
      validityDays = null; // Não expira
    } else if (productId.includes('UNLIMITED') || productName.includes('ILIMITADO')) {
      rechargeType = 'unlimited';
      minutes = -1; // Ilimitado
      validityDays = 30;
    } else {
      rechargeType = 'quick_help';
      minutes = 20;
      validityDays = 1;
    }

    // Atualizar recarga pendente para completed
    const { error: updateError } = await supabaseAdmin
      .from('recharges')
      .update({
        status: 'completed',
        transaction_id: transactionId,
        cakto_data: webhookData as any,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('recharge_type', rechargeType)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1);

    if (updateError) {
      console.error('Erro ao atualizar recarga:', updateError);
      // Continuar mesmo se não encontrar recarga pendente
    }

    // Aplicar recarga ao usuário usando RPC functions
    if (rechargeType === 'quick_help') {
      const { error: boostError } = await supabaseAdmin.rpc('add_boost_minutes', {
        p_user_id: userId,
        p_minutes: minutes,
      });
      if (boostError) throw boostError;
    } else if (rechargeType === 'reserve_minutes') {
      const { error: reserveError } = await supabaseAdmin.rpc('add_reserve_minutes', {
        p_user_id: userId,
        p_minutes: minutes,
      });
      if (reserveError) throw reserveError;
    } else if (rechargeType === 'unlimited') {
      const { error: unlimitedError } = await supabaseAdmin.rpc('activate_unlimited_subscription', {
        p_user_id: userId,
        p_days: validityDays || 30,
      });
      if (unlimitedError) throw unlimitedError;
    }

    // Salvar histórico de pagamento
    const { error: historyError } = await supabaseAdmin
      .from('payment_history')
      .insert({
        user_id: userId,
        transaction_id: transactionId,
        amount: amount,
        status: 'completed',
        payment_method: transaction.paymentMethod,
        cakto_data: webhookData as any,
      });

    if (historyError) {
      console.error('Erro ao salvar histórico:', historyError);
    }

    console.log('✅ Recarga processada:', {
      user_id: userId,
      recharge_type: rechargeType,
      minutes,
      transaction_id: transactionId,
    });

    return {
      success: true,
      message: 'Recarga processada com sucesso',
      transaction_id: transactionId,
      recharge_type: rechargeType,
      minutes,
    };
  } catch (error) {
    console.error('❌ Erro ao processar recarga:', error);
    throw error;
  }
}

/**
 * Processa reembolso
 */
async function processRefund(webhookData: CaktoPayload) {
  try {
    const { data } = webhookData;
    const customer = data.customer;
    const transaction = data;
    const transactionId = transaction.id;
    const amount = transaction.amount;

    console.log('💸 Processando reembolso:', {
      email: customer.email,
      transactionId,
      amount,
    });

    // Buscar usuário por email
    const user = await getUserByEmail(customer.email);

    if (!user) {
      console.log('❌ Usuário não encontrado para reembolso:', customer.email);
      return {
        success: false,
        message: 'Usuário não encontrado',
        transaction_id: transactionId,
      };
    }

    // Cancelar assinatura (voltar para free)
    const { error: updateError } = await supabaseAdmin
      .from('user_profiles')
      .update({
        plan_type: 'free',
        subscription_status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Erro ao cancelar assinatura:', updateError);
    } else {
      console.log('✅ Assinatura cancelada (voltou para free)');
    }

    // Registrar reembolso no histórico
    const { error: historyError } = await supabaseAdmin
      .from('payment_history')
      .insert({
        user_id: user.id,
        transaction_id: `refund_${transactionId}`,
        amount: -amount, // Valor negativo para reembolso
        status: 'refunded',
        payment_method: 'refund',
        cakto_data: webhookData as any,
      });

    if (historyError) {
      console.error('Erro ao registrar reembolso:', historyError);
    } else {
      console.log('✅ Reembolso registrado no histórico');
    }

    return {
      success: true,
      message: 'Reembolso processado com sucesso',
      transaction_id: transactionId,
      amount: amount,
    };
  } catch (error) {
    console.error('❌ Erro ao processar reembolso:', error);
    throw error;
  }
}

/**
 * Processa cancelamento de assinatura
 */
async function processSubscriptionCancelled(webhookData: CaktoPayload) {
  try {
    const { data } = webhookData;
    const customer = data.customer;
    const transaction = data;
    const transactionId = transaction.id;

    console.log('🚫 Processando cancelamento de assinatura:', {
      email: customer.email,
      transactionId,
    });

    // Buscar usuário por email
    const user = await getUserByEmail(customer.email);

    if (!user) {
      console.log('❌ Usuário não encontrado para cancelamento:', customer.email);
      return {
        success: false,
        message: 'Usuário não encontrado',
        transaction_id: transactionId,
      };
    }

    // Cancelar assinatura (voltar para free)
    const { error: updateError } = await supabaseAdmin
      .from('user_profiles')
      .update({
        plan_type: 'free',
        subscription_status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Erro ao cancelar assinatura:', updateError);
    } else {
      console.log('✅ Assinatura cancelada');
    }

    // Registrar cancelamento no histórico
    const { error: historyError } = await supabaseAdmin
      .from('payment_history')
      .insert({
        user_id: user.id,
        transaction_id: `cancel_${transactionId}`,
        amount: 0,
        status: 'cancelled',
        payment_method: 'cancellation',
        cakto_data: webhookData as any,
      });

    if (historyError) {
      console.error('Erro ao registrar cancelamento:', historyError);
    } else {
      console.log('✅ Cancelamento registrado no histórico');
    }

    return {
      success: true,
      message: 'Cancelamento processado com sucesso',
      transaction_id: transactionId,
    };
  } catch (error) {
    console.error('❌ Erro ao processar cancelamento:', error);
    throw error;
  }
}

Deno.serve(async (req) => {
  // Health check para GET (evita erro 405 quando alguém acessa via navegador)
  if (req.method === 'GET') {
    return new Response(
      JSON.stringify({
        status: 'ok',
        service: 'cakto-webhook',
        supported_methods: ['POST'],
        message: 'Webhook endpoint is active. Use POST method to send webhook events.',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  console.log('\n🔔 Webhook Cakto recebido:', new Date().toISOString());

  // Log de headers recebidos para debug
  const headers = Object.fromEntries(req.headers.entries());
  console.log('📋 Headers recebidos:', {
    authorization: headers.authorization ? '***presente***' : 'ausente',
    'x-cakto-signature': headers['x-cakto-signature'] ? '***presente***' : 'ausente',
    'x-signature': headers['x-signature'] ? '***presente***' : 'ausente',
    'user-agent': headers['user-agent'],
    'content-type': headers['content-type'],
  });

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({
        error: 'Method Not Allowed',
        supported_methods: ['GET', 'POST'],
      }),
      {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    // Ler body como texto para validação HMAC
    const bodyText = await req.text();
    let webhookData: CaktoPayload;

    try {
      webhookData = JSON.parse(bodyText);
    } catch (parseError) {
      console.error('❌ Erro ao parsear JSON:', parseError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid JSON',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    console.log('📋 Dados do webhook parseados:', JSON.stringify(webhookData, null, 2));

    // Validação de assinatura
    let signatureValid = false;
    let validationMethod = '';

    // Método 1: Verificar header x-cakto-signature ou x-signature (HMAC)
    const signature = headers['x-cakto-signature'] || headers['x-signature'];
    if (signature && CAKTO_WEBHOOK_SECRET) {
      console.log('🔐 Tentando validação HMAC por header...');
      // Nota: A validação HMAC assíncrona precisa ser aguardada
      // Por enquanto, vamos usar validação simples e melhorar depois
      signatureValid = await validateWebhookSignature(
        bodyText,
        signature,
        CAKTO_WEBHOOK_SECRET
      );
      validationMethod = 'hmac_header';
    }

    // Método 2: Verificar secret no JSON (fallback)
    if (!signatureValid && webhookData.secret) {
      console.log('🔐 Header não encontrado, tentando validação por secret no JSON...');
      if (webhookData.secret === CAKTO_WEBHOOK_SECRET) {
        signatureValid = true;
        validationMethod = 'json_secret';
      }
    }

    // Método 3: Bearer token (fallback)
    if (!signatureValid) {
      const authHeader = req.headers.get('authorization') || '';
      const token = authHeader.replace('Bearer ', '').trim();
      if (token && token === CAKTO_WEBHOOK_SECRET) {
        signatureValid = true;
        validationMethod = 'bearer_token';
      }
    }

    if (!signatureValid && CAKTO_WEBHOOK_SECRET) {
      console.error('❌ Assinatura do webhook inválida');
      console.log('Secret esperado:', CAKTO_WEBHOOK_SECRET);
      console.log('Secret recebido:', webhookData.secret);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Assinatura inválida',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    if (signatureValid) {
      console.log(`✅ Assinatura validada com sucesso (método: ${validationMethod})`);
    } else if (!CAKTO_WEBHOOK_SECRET) {
      console.warn('⚠️ CAKTO_WEBHOOK_SECRET não configurado - aceitando requisições sem autenticação (NÃO RECOMENDADO PARA PRODUÇÃO)');
    }

    // Validar estrutura do payload
    if (!webhookData.data || !webhookData.data.customer || !webhookData.event) {
      console.error('❌ Payload incompleto:', {
        has_data: !!webhookData.data,
        has_customer: !!webhookData.data?.customer,
        has_event: !!webhookData.event,
        received_body: JSON.stringify(webhookData),
      });
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required fields',
          received: {
            has_data: !!webhookData.data,
            has_customer: !!webhookData.data?.customer,
            has_event: !!webhookData.event,
          },
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    // Processar evento
    // Normalizar nome do evento (suportar variações)
    let event: string = webhookData.event;
    if (event === 'subscription_canceled') {
      event = 'subscription_cancelled'; // Normalizar para versão com dois "ll"
    }
    
    let result;

    switch (event) {
      case 'purchase_approved':
        console.log('💳 Processando pagamento aprovado...');
        result = await processPaymentApproved(webhookData);
        break;

      case 'refund':
        console.log('💸 Processando reembolso...');
        result = await processRefund(webhookData);
        break;

      case 'subscription_cancelled':
        console.log('🚫 Processando cancelamento de assinatura...');
        result = await processSubscriptionCancelled(webhookData);
        break;

      default:
        console.log(`⚠️ Evento não suportado: ${webhookData.event}`);
        return new Response(
          JSON.stringify({
            success: false,
            error: `Evento não suportado: ${webhookData.event}`,
            supported_events: ['purchase_approved', 'refund', 'subscription_cancelled'],
            note: 'subscription_canceled (com um "l") será automaticamente convertido para subscription_cancelled',
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          },
        );
    }

    console.log('✅ Webhook processado com sucesso:', result);

    return new Response(
      JSON.stringify({
        success: true,
        event: event,
        result: result,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (err) {
    console.error('❌ Cakto webhook error:', {
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
      timestamp: new Date().toISOString(),
    });
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal Server Error',
        message: err instanceof Error ? err.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
});

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
