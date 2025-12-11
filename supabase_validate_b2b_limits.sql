-- ============================================
-- FUNÇÃO: VALIDAÇÃO DE LIMITES B2B EM TEMPO REAL
-- ============================================
-- Valida se um cupom B2B ainda tem licenças disponíveis antes de permitir ativação

CREATE OR REPLACE FUNCTION validate_b2b_coupon_availability(
  p_coupon_code TEXT
)
RETURNS JSON AS $$
DECLARE
  v_coupon RECORD;
  v_active_licenses INTEGER;
  v_available_licenses INTEGER;
  v_result JSON;
BEGIN
  -- Buscar cupom
  SELECT * INTO v_coupon
  FROM coupons
  WHERE UPPER(TRIM(code)) = UPPER(TRIM(p_coupon_code))
    AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'valid', false,
      'error', 'CUPOM_INEXISTENTE',
      'message', 'Cupom não encontrado ou inativo.'
    );
  END IF;
  
  -- Contar licenças ativas (usuários vinculados a este cupom)
  SELECT COUNT(*) INTO v_active_licenses
  FROM user_coupon_links
  WHERE coupon_id = v_coupon.id;
  
  -- Calcular licenças disponíveis
  v_available_licenses := COALESCE(v_coupon.max_linked_accounts, v_coupon.max_uses, 0) - v_active_licenses;
  
  -- Verificar se há licenças disponíveis
  IF v_available_licenses <= 0 THEN
    RETURN json_build_object(
      'valid', false,
      'error', 'CUPOM_ESGOTADO',
      'message', 'Este código de ativação não possui mais licenças disponíveis.',
      'total_licenses', COALESCE(v_coupon.max_linked_accounts, v_coupon.max_uses, 0),
      'active_licenses', v_active_licenses,
      'available_licenses', 0
    );
  END IF;
  
  -- Cupom válido e com licenças disponíveis
  RETURN json_build_object(
    'valid', true,
    'message', 'Cupom válido e com licenças disponíveis.',
    'total_licenses', COALESCE(v_coupon.max_linked_accounts, v_coupon.max_uses, 0),
    'active_licenses', v_active_licenses,
    'available_licenses', v_available_licenses,
    'plan_type', v_coupon.plan_linked
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentário
COMMENT ON FUNCTION validate_b2b_coupon_availability(TEXT) IS 
'Valida se um cupom B2B tem licenças disponíveis antes de permitir ativação. Retorna informações detalhadas sobre disponibilidade.';

-- Atualizar função de ativação para usar validação
-- (A função activate_coupon_internal já valida quantidade_disponivel, mas podemos melhorar)

