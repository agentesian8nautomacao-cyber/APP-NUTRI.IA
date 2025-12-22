// Serviço para verificar acesso e consumir tempo de voz
import { supabase } from './supabaseClient';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

interface VoiceAccessResponse {
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
 * Verifica se o usuário tem acesso à funcionalidade de voz
 */
export async function checkVoiceAccess(): Promise<VoiceAccessResponse> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      return {
        success: false,
        hasAccess: false,
        reason: 'NOT_AUTHENTICATED',
      };
    }

    const response = await fetch(`${SUPABASE_URL}/functions/v1/check-voice-access`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        action: 'check',
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data as VoiceAccessResponse;
  } catch (error) {
    console.error('Error checking voice access:', error);
    return {
      success: false,
      hasAccess: false,
      reason: 'ERROR',
    };
  }
}

/**
 * Consome tempo de voz (em segundos)
 */
export async function consumeVoiceTime(seconds: number): Promise<VoiceAccessResponse> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      return {
        success: false,
        hasAccess: false,
        reason: 'NOT_AUTHENTICATED',
      };
    }

    const response = await fetch(`${SUPABASE_URL}/functions/v1/check-voice-access`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        action: 'consume',
        seconds,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data as VoiceAccessResponse;
  } catch (error) {
    console.error('Error consuming voice time:', error);
    return {
      success: false,
      hasAccess: false,
      reason: 'ERROR',
    };
  }
}

