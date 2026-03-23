/**
 * Códigos de convite válidos vêm de VITE_INVITE_CODES (Vite / Vercel),
 * lista separada por vírgula, sem depender de texto livre.
 * Ex.: VITE_INVITE_CODES=NUTRI2025,VIP-ABC
 */
export function isValidInviteCode(raw: string): boolean {
  const env = (import.meta.env.VITE_INVITE_CODES as string | undefined) || '';
  const allowed = env
    .split(',')
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);
  if (allowed.length === 0) return false;
  const code = raw.trim().toUpperCase();
  return allowed.includes(code);
}
