import { supabase } from './supabaseClient';
import { limitsService, authService } from './supabaseService';

export type RechargeType = 'quick_help' | 'reserve_minutes' | 'unlimited';

interface RechargeConfig {
  productId: string; // ID do produto na Cakto
  price: number;
  minutes: number;
  validityDays?: number;
}

// Configuração dos produtos de recarga na Cakto
// NOTA: Estes IDs precisam ser configurados na Cakto
const RECHARGE_CONFIGS: Record<RechargeType, RechargeConfig> = {
  quick_help: {
    productId: 'QUICK_HELP', // Substituir pelo ID real na Cakto
    price: 5.00,
    minutes: 20,
    validityDays: 1, // 24 horas
  },
  reserve_minutes: {
    productId: 'RESERVE_MINUTES', // Substituir pelo ID real na Cakto
    price: 12.90,
    minutes: 100,
    validityDays: undefined, // Não expira
  },
  unlimited: {
    productId: 'UNLIMITED_VOICE', // Substituir pelo ID real na Cakto
    price: 19.90,
    minutes: -1, // Ilimitado
    validityDays: 30,
  },
};

/**
 * Gera URL de checkout da Cakto para compra de recarga
 */
export async function generateRechargeCheckoutUrl(
  rechargeType: RechargeType
): Promise<string> {
  const user = await authService.getCurrentUser();
  if (!user) {
    throw new Error('Usuário não autenticado');
  }

  const config = RECHARGE_CONFIGS[rechargeType];
  const userEmail = user.email || '';

  // Criar registro de recarga pendente
  const { data: recharge, error } = await supabase
    .from('recharges')
    .insert({
      user_id: user.id,
      recharge_type: rechargeType,
      amount: config.price,
      minutes_added: config.minutes,
      expires_at: config.validityDays
        ? new Date(Date.now() + config.validityDays * 24 * 60 * 60 * 1000).toISOString()
        : null,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Erro ao criar registro de recarga: ${error.message}`);
  }

  // Gerar URL de checkout da Cakto
  // NOTA: Ajustar conforme a API da Cakto
  const checkoutUrl = `https://pay.cakto.com.br/${config.productId}?email=${encodeURIComponent(userEmail)}&recharge_id=${recharge.id}`;

  return checkoutUrl;
}

/**
 * Processa recarga após confirmação de pagamento (chamado pelo webhook)
 */
export async function processRechargePurchase(
  userId: string,
  rechargeType: RechargeType,
  transactionId: string,
  caktoData?: any
): Promise<void> {
  const config = RECHARGE_CONFIGS[rechargeType];

  // Atualizar recarga para completed
  const { error: updateError } = await supabase
    .from('recharges')
    .update({
      status: 'completed',
      transaction_id: transactionId,
      cakto_data: caktoData,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('recharge_type', rechargeType)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(1);

  if (updateError) {
    throw new Error(`Erro ao atualizar recarga: ${updateError.message}`);
  }

  // Aplicar recarga ao usuário
  switch (rechargeType) {
    case 'quick_help':
      await limitsService.addBoostMinutes(userId, config.minutes);
      break;
    case 'reserve_minutes':
      await limitsService.addReserveMinutes(userId, config.minutes);
      break;
    case 'unlimited':
      await limitsService.activateUnlimitedSubscription(userId, config.validityDays || 30);
      break;
  }
}

/**
 * Obtém histórico de recargas do usuário
 */
export async function getUserRechargeHistory(userId: string) {
  const { data, error } = await supabase
    .from('recharges')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Erro ao buscar histórico: ${error.message}`);
  }

  return data || [];
}

