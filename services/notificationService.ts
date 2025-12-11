/**
 * Serviço de Notificações
 * 
 * NOTA: Para implementação completa, é necessário:
 * 1. Configurar Firebase Cloud Messaging (FCM) ou OneSignal
 * 2. Solicitar permissão do usuário
 * 3. Registrar token de dispositivo
 * 4. Enviar notificações via backend
 * 
 * Esta é uma implementação básica que pode ser expandida.
 */

import { supabase } from './supabaseClient';
import { limitsService } from './supabaseService';

/**
 * Solicita permissão para notificações
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('Este navegador não suporta notificações');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    console.warn('Permissão de notificações negada');
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

/**
 * Envia notificação local (browser)
 */
export function showLocalNotification(title: string, options?: NotificationOptions) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  new Notification(title, {
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    ...options,
  });
}

/**
 * Verifica se usuário tem minutos restantes e envia notificação se necessário
 */
export async function checkAndNotifyVoiceMinutes(userId: string) {
  try {
    const balances = await limitsService.getVoiceBalances(userId);
    
    if (!balances) return;

    // Notificar quando restam menos de 5 minutos
    const remainingMinutes = Math.floor(balances.totalSeconds / 60);
    
    if (remainingMinutes > 0 && remainingMinutes <= 5 && !balances.isVip) {
      showLocalNotification('⏰ Minutos de Voz', {
        body: `Você tem apenas ${remainingMinutes} minuto(s) restante(s) hoje. Compre mais tempo para continuar!`,
        tag: 'voice-minutes-low',
      });
    }

    // Notificar quando minutos acabaram
    if (remainingMinutes === 0 && !balances.isVip) {
      showLocalNotification('🔒 Limite Diário Atingido', {
        body: 'Você atingiu o limite de 15 minutos hoje. Compre mais tempo para continuar sua consultoria!',
        tag: 'voice-minutes-exhausted',
      });
    }
  } catch (error) {
    console.error('Erro ao verificar minutos:', error);
  }
}

/**
 * Envia notificação de lembrete diário
 */
export function sendDailyReminder() {
  const now = new Date();
  const hour = now.getHours();

  // Enviar lembrete às 9h da manhã
  if (hour === 9) {
    showLocalNotification('🌅 Bom Dia!', {
      body: 'Você tem 15 minutos gratuitos de consultoria hoje. Que tal começar agora?',
      tag: 'daily-reminder',
    });
  }
}

/**
 * Envia notificação de confirmação de recarga
 */
export function notifyRechargeConfirmed(rechargeType: string, minutes: number) {
  const typeNames: Record<string, string> = {
    quick_help: 'Ajuda Rápida',
    reserve_minutes: 'Minutos de Reserva',
    unlimited: 'Conversa Ilimitada',
  };

  const typeName = typeNames[rechargeType] || 'Recarga';

  showLocalNotification('✅ Recarga Confirmada', {
    body: `${typeName} ativada! ${minutes === -1 ? 'Você tem acesso ilimitado por 30 dias!' : `+${minutes} minutos adicionados ao seu saldo.`}`,
    tag: 'recharge-confirmed',
  });
}

/**
 * Verifica e notifica sobre renovação de assinatura
 */
export async function checkAndNotifySubscriptionRenewal(userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('plan_type, subscription_status, expiry_date, cakto_customer_id')
      .eq('user_id', userId)
      .single();

    if (error || !data) return;

    // Apenas para planos pagos
    if (!['monthly', 'annual', 'academy_starter', 'academy_growth', 'academy_pro', 'personal_team'].includes(data.plan_type)) {
      return;
    }

    if (!data.expiry_date) return;

    const expiryDate = new Date(data.expiry_date);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Notificar 7 dias antes
    if (daysUntilExpiry === 7) {
      showLocalNotification('📅 Renovação de Assinatura', {
        body: `Sua assinatura expira em 7 dias. A renovação será automática se você tiver pagamento recorrente ativo.`,
        tag: 'subscription-renewal-7days',
      });
    }

    // Notificar 3 dias antes
    if (daysUntilExpiry === 3) {
      showLocalNotification('⏰ Renovação Próxima', {
        body: `Sua assinatura expira em 3 dias. Verifique se seu pagamento recorrente está ativo.`,
        tag: 'subscription-renewal-3days',
      });
    }

    // Notificar 1 dia antes
    if (daysUntilExpiry === 1) {
      showLocalNotification('🔔 Renovação Amanhã', {
        body: `Sua assinatura expira amanhã. A renovação será processada automaticamente se houver pagamento ativo.`,
        tag: 'subscription-renewal-1day',
      });
    }

    // Notificar se expirou
    if (daysUntilExpiry <= 0 && data.subscription_status === 'active') {
      showLocalNotification('⚠️ Assinatura Expirada', {
        body: `Sua assinatura expirou. Verifique seu método de pagamento ou entre em contato com o suporte.`,
        tag: 'subscription-expired',
      });
    }
  } catch (error) {
    console.error('Erro ao verificar renovação:', error);
  }
}

/**
 * Inicializa sistema de notificações
 */
export async function initializeNotifications(userId: string) {
  // Solicitar permissão
  await requestNotificationPermission();

  // Verificar minutos periodicamente (a cada 5 minutos)
  setInterval(() => {
    checkAndNotifyVoiceMinutes(userId);
  }, 5 * 60 * 1000);

  // Verificar renovação de assinatura (a cada hora)
  setInterval(() => {
    checkAndNotifySubscriptionRenewal(userId);
  }, 60 * 60 * 1000);

  // Verificar renovação imediatamente ao inicializar
  checkAndNotifySubscriptionRenewal(userId);

  // Lembrete diário
  setInterval(() => {
    sendDailyReminder();
  }, 60 * 60 * 1000); // Verificar a cada hora
}

