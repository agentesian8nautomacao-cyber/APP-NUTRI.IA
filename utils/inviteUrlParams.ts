/**
 * O Supabase Auth (PKCE) usa sempre `?code=` na URL após redirect.
 * Cupons Nutri.ai devem usar `?invite=`, `?cupom=` ou `?coupon=` — nunca `code`.
 */

/** Parâmetros de URL aceitos para cupom/convite (não colidem com PKCE). */
export const INVITE_QUERY_KEYS = ['invite', 'cupom', 'coupon'] as const;

export function getInviteCodeFromSearch(search: string): string | null {
  const params = new URLSearchParams(search);
  for (const key of INVITE_QUERY_KEYS) {
    const raw = params.get(key);
    if (raw?.trim()) return raw.trim();
  }
  return null;
}

export function urlIndicatesPasswordRecoveryHash(hash: string): boolean {
  const h = hash.replace(/^#/, '');
  return h.includes('type=recovery') || h.includes('type%3Drecovery');
}

/** Indica se a query tem `code` reservado ao Supabase (PKCE / OAuth / magic link). */
export function urlHasSupabaseAuthCode(search: string): boolean {
  return new URLSearchParams(search).has('code');
}
