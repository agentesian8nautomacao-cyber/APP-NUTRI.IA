/**
 * Notificações Nutri.ai (Web Notifications API).
 *
 * Funciona enquanto o utilizador tem o site aberto (ou PWA em segundo plano, conforme o SO).
 * Push com app completamente fechado exige FCM/OneSignal + backend (não incluído aqui).
 */

import { supabase } from './supabaseClient';
import { limitsService } from './supabaseService';
import type { WellnessState } from '../types';

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Solicita permissão para notificações do navegador.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

/**
 * Notificação local (sistema), se a permissão foi concedida.
 */
export function showLocalNotification(title: string, options?: NotificationOptions) {
  if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  try {
    new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options,
    });
  } catch (e) {
    console.warn('Falha ao mostrar notificação:', e);
  }
}

function sessionDedupe(key: string): boolean {
  if (sessionStorage.getItem(key)) return true;
  sessionStorage.setItem(key, '1');
  return false;
}

function localDedupe(key: string): boolean {
  if (localStorage.getItem(key)) return true;
  localStorage.setItem(key, '1');
  return false;
}

/**
 * Minutos de voz baixos ou esgotados (máx. um aviso por tipo / dia nesta sessão).
 */
export async function checkAndNotifyVoiceMinutes(userId: string) {
  try {
    const balances = await limitsService.getVoiceBalances(userId);
    if (!balances) return;

    const remainingMinutes = Math.floor(balances.totalSeconds / 60);

    if (remainingMinutes > 0 && remainingMinutes <= 5 && !balances.isVip) {
      const k = `nutri-voice-low-${userId}-${todayISO()}`;
      if (sessionDedupe(k)) return;
      showLocalNotification('⏰ Minutos de voz', {
        body: `Restam cerca de ${remainingMinutes} minuto(s) hoje. Recarregue para continuar sem interrupções.`,
        tag: 'nutri-voice-low',
      });
    }

    if (remainingMinutes === 0 && !balances.isVip) {
      const k = `nutri-voice-out-${userId}-${todayISO()}`;
      if (sessionDedupe(k)) return;
      showLocalNotification('🔒 Limite diário de voz', {
        body: 'Atingiu o limite de minutos de hoje. Veja opções de recarga no app.',
        tag: 'nutri-voice-out',
      });
    }
  } catch (error) {
    console.error('Erro ao verificar minutos de voz:', error);
  }
}

function parseHHMM(s: string | undefined): { h: number; m: number } | null {
  if (!s || typeof s !== 'string') return null;
  const parts = s.trim().split(':');
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1] ?? '0', 10);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return { h, m };
}

/**
 * Lembretes de água / sono / refeição no horário configurado em Configurações (minuto a minuto).
 */
export function tickScheduledWellnessReminders(getWellness: () => WellnessState) {
  if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  const w = getWellness();
  const now = new Date();
  const hm = now.getHours() * 60 + now.getMinutes();

  const fire = (key: 'water' | 'sleep' | 'meals', title: string, body: string, tag: string) => {
    if (!w.notifications[key]) return;
    const parsed = parseHHMM(w.notificationTimes[key]);
    if (!parsed) return;
    if (parsed.h * 60 + parsed.m !== hm) return;
    const dedupe = `nutri-well-${key}-${todayISO()}`;
    if (sessionDedupe(dedupe)) return;
    showLocalNotification(title, { body, tag });
  };

  fire('water', 'Hora de se hidratar! 💧', 'Beba um copo de água agora para manter o foco.', 'nutri-water');
  fire('sleep', 'Hora do descanso 🌙', 'Desacelere e prepare-se para dormir com uma rotina tranquila.', 'nutri-sleep');
  fire('meals', 'Hora de comer! 🥗', 'Reserve um momento para uma refeição saudável.', 'nutri-meals');
}

/**
 * Lembrete único por dia (janela 9h–9h05) para usar os minutos de voz gratuitos.
 */
export function sendDailyVoiceReminderIfNeeded() {
  if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  const now = new Date();
  if (now.getHours() !== 9 || now.getMinutes() > 5) return;

  const k = `nutri-daily-voice-${todayISO()}`;
  if (localDedupe(k)) return;

  showLocalNotification('🌅 Bom dia!', {
    body: 'Tem minutos de consultoria por voz disponíveis hoje. Que tal registar uma refeição ou falar com o Nutri.ai?',
    tag: 'nutri-daily-reminder',
  });
}

/**
 * Notificação após recarga confirmada (chamar no cliente quando souber que o pagamento foi concluído).
 */
export function notifyRechargeConfirmed(rechargeType: string, minutes: number) {
  const typeNames: Record<string, string> = {
    quick_help: 'Ajuda Rápida',
    reserve_minutes: 'Minutos de Reserva',
    unlimited: 'Conversa Ilimitada',
  };

  const typeName = typeNames[rechargeType] || 'Recarga';

  showLocalNotification('✅ Recarga confirmada', {
    body:
      minutes === -1
        ? `${typeName} ativa. Acesso ilimitado por voz no período contratado.`
        : `${typeName}: +${minutes} minutos adicionados.`,
    tag: 'nutri-recharge',
  });
}

/**
 * Avisos de renovação de assinatura (uma vez por tipo / ciclo de expiração).
 */
export async function checkAndNotifySubscriptionRenewal(userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('plan_type, subscription_status, expiry_date, cakto_customer_id')
      .eq('user_id', userId)
      .single();

    if (error || !data) return;

    if (
      !['monthly', 'annual', 'academy_starter', 'academy_growth', 'academy_pro', 'personal_team'].includes(
        data.plan_type
      )
    ) {
      return;
    }

    if (!data.expiry_date) return;

    const expiryDate = new Date(data.expiry_date);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const expiryKey = expiryDate.toISOString().slice(0, 10);

    const maybeNotify = (days: number, title: string, body: string, tag: string) => {
      if (daysUntilExpiry !== days) return;
      const k = `nutri-sub-${userId}-${tag}-${expiryKey}`;
      if (localDedupe(k)) return;
      showLocalNotification(title, { body, tag });
    };

    maybeNotify(
      7,
      '📅 Renovação da assinatura',
      'A sua assinatura renova ou termina em 7 dias. Confirme o pagamento recorrente na sua conta.',
      'sub-7'
    );

    maybeNotify(
      3,
      '⏰ Renovação próxima',
      'Faltam 3 dias para a data de renovação. Verifique o método de pagamento.',
      'sub-3'
    );

    maybeNotify(
      1,
      '🔔 Renovação amanhã',
      'A renovação da assinatura está prevista para breve. Confirme que o pagamento está ativo.',
      'sub-1'
    );

    if (daysUntilExpiry <= 0 && data.subscription_status === 'active') {
      const k = `nutri-sub-exp-${userId}-${expiryKey}`;
      if (localDedupe(k)) return;
      showLocalNotification('⚠️ Assinatura expirada', {
        body: 'A data de validade passou. Atualize o pagamento ou contacte o suporte.',
        tag: 'nutri-sub-expired',
      });
    }
  } catch (error) {
    console.error('Erro ao verificar renovação da assinatura:', error);
  }
}

export type NutriNotificationStop = () => void;

/**
 * Inicia verificações periódicas. Devolve função para parar (logout / unmount).
 */
export function startNutriNotificationScheduler(
  userId: string,
  getWellness: () => WellnessState
): NutriNotificationStop {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const intervalIds: number[] = [];

  intervalIds.push(
    window.setInterval(() => {
      void checkAndNotifyVoiceMinutes(userId);
    }, 5 * 60 * 1000)
  );

  intervalIds.push(
    window.setInterval(() => {
      void checkAndNotifySubscriptionRenewal(userId);
    }, 60 * 60 * 1000)
  );

  intervalIds.push(
    window.setInterval(() => {
      tickScheduledWellnessReminders(getWellness);
      sendDailyVoiceReminderIfNeeded();
    }, 60 * 1000)
  );

  void requestNotificationPermission();
  void checkAndNotifyVoiceMinutes(userId);
  void checkAndNotifySubscriptionRenewal(userId);
  tickScheduledWellnessReminders(getWellness);
  sendDailyVoiceReminderIfNeeded();

  return () => {
    intervalIds.forEach((id) => window.clearInterval(id));
  };
}
