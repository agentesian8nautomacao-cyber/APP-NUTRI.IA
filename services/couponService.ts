import supabase from './supabaseClient';
import { isValidInviteCode } from './inviteCodes';

export type CouponValidationResult =
  | { ok: true; couponId: string; planLinked: string | null; source: 'db' | 'env' }
  | { ok: false; message: string };

/**
 * Valida código na tabela public.coupons (Supabase).
 *
 * Regras:
 * - code igual ao informado (normalizado em maiúsculas)
 * - is_active = true
 * - current_uses < max_uses (quando max_uses é número válido)
 * - quantidade_disponivel > 0 quando a coluna não é null
 *
 * RLS: o papel anon precisa de política de SELECT em coupons (ou RPC).
 * Exemplo mínimo (avaliação de risco no painel Supabase):
 *   CREATE POLICY "anon_read_coupons_validate"
 *   ON public.coupons FOR SELECT TO anon USING (true);
 * Melhor: função SECURITY DEFINER validate_coupon_code(text) que só retorna ok/erro.
 *
 * Se a consulta falhar (rede/RLS) ou não houver linha, usa fallback VITE_INVITE_CODES.
 */
export async function validateCouponForRegistration(raw: string): Promise<CouponValidationResult> {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { ok: false, message: 'Digite o código de convite.' };
  }

  const normalized = trimmed.toUpperCase();

  const { data, error } = await supabase
    .from('coupons')
    .select('id, plan_linked, max_uses, current_uses, is_active, quantidade_disponivel')
    .eq('code', normalized)
    .maybeSingle();

  if (error) {
    console.warn('[coupons]', error.message);
    if (isValidInviteCode(trimmed)) {
      return { ok: true, couponId: '', planLinked: null, source: 'env' };
    }
    return {
      ok: false,
      message: 'Não foi possível validar o código. Verifique a conexão ou tente novamente.',
    };
  }

  if (!data) {
    if (isValidInviteCode(trimmed)) {
      return { ok: true, couponId: '', planLinked: null, source: 'env' };
    }
    return { ok: false, message: 'Código de convite inválido.' };
  }

  if (data.is_active !== true) {
    return { ok: false, message: 'Este convite está inativo.' };
  }

  const maxUses = Number(data.max_uses);
  const currentUses = Number(data.current_uses);
  if (Number.isFinite(maxUses) && Number.isFinite(currentUses) && currentUses >= maxUses) {
    return { ok: false, message: 'Este convite atingiu o limite de usos.' };
  }

  if (data.quantidade_disponivel != null && Number(data.quantidade_disponivel) <= 0) {
    return { ok: false, message: 'Este convite não está mais disponível.' };
  }

  return {
    ok: true,
    couponId: data.id,
    planLinked: data.plan_linked ?? null,
    source: 'db',
  };
}
