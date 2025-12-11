-- ============================================
-- CORRIGIR FUNÇÃO SEM CAST PROBLEMÁTICO
-- ============================================
-- Versão que evita o cast que está causando erro

CREATE OR REPLACE FUNCTION activate_coupon_internal(
  p_coupon_code TEXT,
  p_user_id UUID
)
RETURNS JSON AS $$
DECLARE
  v_coupon RECORD;
  v_user_profile RECORD;
  v_plan_type TEXT;
  v_account_type TEXT;
  v_coupon_id UUID;
  v_plan_enum_value TEXT;
BEGIN
  -- 1. Buscar cupom
  SELECT * INTO v_coupon
  FROM coupons
  WHERE UPPER(TRIM(code)) = UPPER(TRIM(p_coupon_code))
    AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'CUPOM_INEXISTENTE',
      'message', 'Cupom não encontrado ou inativo.'
    );
  END IF;
  
  -- 2. Verificar quantidade disponível
  IF v_coupon.quantidade_disponivel IS NULL THEN
    v_coupon.quantidade_disponivel := GREATEST(0, v_coupon.max_uses - v_coupon.current_uses);
  END IF;
  
  IF v_coupon.quantidade_disponivel <= 0 THEN
    RETURN json_build_object(
      'success', false,
      'error', 'CUPOM_ESGOTADO',
      'message', 'Este cupom não possui mais ativações disponíveis.'
    );
  END IF;
  
  -- 3. Buscar perfil do usuário
  SELECT * INTO v_user_profile
  FROM user_profiles
  WHERE id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'USUARIO_NAO_ENCONTRADO',
      'message', 'Perfil do usuário não encontrado.'
    );
  END IF;
  
  -- 4. Determinar account_type esperado
  IF v_coupon.plan_linked LIKE 'academy%' THEN
    v_account_type := 'USER_GYM';
  ELSIF v_coupon.plan_linked LIKE 'personal%' THEN
    v_account_type := 'USER_GYM';
  ELSE
    v_account_type := NULL;
  END IF;
  
  -- 5. Verificar perfil compatível
  IF v_account_type IS NOT NULL THEN
    IF v_user_profile.account_type IS NOT NULL 
       AND v_user_profile.account_type != v_account_type 
       AND v_user_profile.account_type != 'USER_B2C' THEN
      RETURN json_build_object(
        'success', false,
        'error', 'PERFIL_INCOMPATIVEL',
        'message', 'Este cupom é válido apenas para perfis de Academia ou Personal Trainer.'
      );
    END IF;
  END IF;
  
  -- 6. Decrementar quantidade_disponivel e incrementar current_uses atomicamente
  UPDATE coupons
  SET 
    current_uses = current_uses + 1,
    quantidade_disponivel = GREATEST(0, max_uses - (current_uses + 1))
  WHERE id = v_coupon.id
    AND quantidade_disponivel > 0
  RETURNING id INTO v_coupon_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'CUPOM_ESGOTADO',
      'message', 'Este cupom foi esgotado durante a ativação. Tente novamente.'
    );
  END IF;
  
  -- 7. Atualizar perfil do usuário com o plano
  v_plan_type := v_coupon.plan_linked;
  
  -- CORREÇÃO: Verificar se o valor existe no ENUM e usar diretamente
  -- Mapear plan_linked para valores válidos do ENUM
  CASE v_plan_type
    WHEN 'academy_starter' THEN v_plan_enum_value := 'academy_starter';
    WHEN 'academy_growth' THEN v_plan_enum_value := 'academy_growth';
    WHEN 'personal_team' THEN v_plan_enum_value := 'personal_team';
    WHEN 'monthly' THEN v_plan_enum_value := 'monthly';
    WHEN 'annual' THEN v_plan_enum_value := 'annual';
    ELSE v_plan_enum_value := 'free';
  END CASE;
  
  -- Atualizar usando EXECUTE para evitar problemas de cast
  EXECUTE format('UPDATE user_profiles SET plan_type = %L::plan_type, subscription_status = %L, account_type = %L, updated_at = now() WHERE id = %L',
    v_plan_enum_value,
    'active',
    COALESCE(v_account_type, v_user_profile.account_type, 'USER_B2C'),
    p_user_id
  );
  
  -- 8. Criar vínculo na tabela user_coupon_links (se não existir)
  INSERT INTO user_coupon_links (user_id, coupon_id)
  VALUES (p_user_id, v_coupon.id)
  ON CONFLICT (user_id, coupon_id) DO NOTHING;
  
  -- 9. Retornar sucesso
  RETURN json_build_object(
    'success', true,
    'message', 'Cupom ativado com sucesso!',
    'plan_type', v_plan_enum_value,
    'account_type', COALESCE(v_account_type, v_user_profile.account_type, 'USER_B2C')
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', 'ERRO_INTERNO',
      'message', 'Erro ao ativar cupom: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificar se foi criada
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_name = 'activate_coupon_internal';

