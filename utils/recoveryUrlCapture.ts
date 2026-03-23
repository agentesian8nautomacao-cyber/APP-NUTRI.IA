/**
 * O cliente Supabase (detectSessionInUrl) remove `?code=` muito cedo.
 * Guardamos um flag na sessionStorage no index.html antes do bundle carregar.
 * Valor = timestamp (ms) para ignorar flags velhos (ex.: aba aberta dias depois).
 */
export const RECOVERY_URL_PENDING_KEY = 'nutri.auth.recovery_url_pending';

const MAX_AGE_MS = 15 * 60 * 1000;

export function captureRecoveryRedirectFromWindow(w: Pick<Window, 'location' | 'sessionStorage'>): void {
  try {
    const search = w.location.search || '';
    const hash = (w.location.hash || '').replace(/^#/, '');
    const hasCode = new URLSearchParams(search).has('code');
    const recoveryHash =
      hash.includes('type=recovery') || hash.includes('type%3Drecovery');
    if (hasCode || recoveryHash) {
      w.sessionStorage.setItem(RECOVERY_URL_PENDING_KEY, String(Date.now()));
    }
  } catch {
    /* ignore */
  }
}

export function hasRecoveryUrlPending(): boolean {
  try {
    if (typeof sessionStorage === 'undefined') return false;
    const raw = sessionStorage.getItem(RECOVERY_URL_PENDING_KEY);
    if (raw == null || raw === '') return false;
    const t = Number(raw);
    if (!Number.isFinite(t)) return raw === '1';
    return Date.now() - t < MAX_AGE_MS;
  } catch {
    return false;
  }
}

export function clearRecoveryUrlPending(): void {
  try {
    sessionStorage.removeItem(RECOVERY_URL_PENDING_KEY);
  } catch {
    /* ignore */
  }
}
