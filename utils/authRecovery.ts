import type { Session } from '@supabase/supabase-js';

/** Decodifica payload do JWT (sem validar assinatura — só leitura de claims). */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
    const json = atob(padded);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Sessão criada pelo link "redefinir senha" do e-mail.
 * Com PKCE o evento PASSWORD_RECOVERY nem sempre dispara; o JWT inclui amr com method "recovery".
 * @see https://supabase.com/docs/guides/auth/jwt-fields
 */
function amrHasRecoveryMethod(amr: unknown): boolean {
  let list: unknown[] | null = null;
  if (Array.isArray(amr)) list = amr;
  else if (typeof amr === 'string') {
    try {
      const parsed = JSON.parse(amr) as unknown;
      if (Array.isArray(parsed)) list = parsed;
    } catch {
      return false;
    }
  }
  if (!list) return false;
  return list.some((entry: unknown) => {
    if (entry && typeof entry === 'object' && 'method' in entry) {
      return String((entry as { method: string }).method).toLowerCase() === 'recovery';
    }
    return false;
  });
}

export function sessionIsPasswordRecovery(session: Session | null): boolean {
  if (!session?.access_token) return false;
  const payload = decodeJwtPayload(session.access_token);
  if (!payload) return false;
  if (amrHasRecoveryMethod(payload.amr)) return true;
  // Alguns projetos expõem métodos em claim alternativa
  const alt = (payload as { authentication_methods?: unknown }).authentication_methods;
  return amrHasRecoveryMethod(alt);
}
