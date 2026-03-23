/**
 * O Supabase Auth (PKCE) redireciona com ?code=<authorization_code> na URL.
 * Esse `code` NÃO é cupom — evitar confundir com convites Nutri.ai.
 */

const UUID_COUPON = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Cupom no formato UUID (36 caracteres com hífens). */
export function isUuidLikeInviteCode(value: string): boolean {
  return UUID_COUPON.test(value.trim());
}

/**
 * Código na query que provavelmente é OAuth/PKCE do Supabase (recuperação de senha, etc.),
 * não um código de convite do app.
 */
export function isLikelySupabaseOAuthQueryCode(value: string): boolean {
  const v = value.trim();
  if (!v) return false;
  if (isUuidLikeInviteCode(v)) return false;
  // PKCE authorization codes costumam ter bem mais que 36 caracteres
  return v.length >= 38;
}

/** Parâmetros de URL aceitos para cupom/convite (nunca colidirão com PKCE). */
export const INVITE_QUERY_KEYS = ['invite', 'cupom', 'coupon'] as const;

export function getInviteCodeFromSearch(search: string): string | null {
  const params = new URLSearchParams(search);
  for (const key of INVITE_QUERY_KEYS) {
    const raw = params.get(key);
    if (raw?.trim()) return raw.trim();
  }
  const legacy = params.get('code');
  if (!legacy?.trim()) return null;
  if (isLikelySupabaseOAuthQueryCode(legacy)) return null;
  return legacy.trim();
}

export function urlIndicatesPasswordRecoveryHash(hash: string): boolean {
  const h = hash.replace(/^#/, '');
  return h.includes('type=recovery') || h.includes('type%3Drecovery');
}
