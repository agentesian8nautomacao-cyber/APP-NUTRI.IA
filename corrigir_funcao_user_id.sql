-- ============================================
-- CORRIGIR FUNÇÃO - USAR user_id CORRETO
-- ============================================
-- O problema: user_coupon_links referencia auth.users(id),
-- mas a função estava usando o id de user_profiles.
-- Correção: função agora aceita user_id de auth.users e busca o perfil internamente

CREATE OR REPLACE FUNCTION activate_coupon_internal(
  p_coupon_code TEXT,
  p_user_id UUID  -- Este é o user_id de auth.users
)
RETURNS JSON AS $$
DECLARE
  v_coupon RECORD;
  v_user_profile RECORD;
  v_plan_type plan_type; -- Usar ENUM diretamente
  v_account_type account_type; -- Usar ENUM diretamente
  v_coupon_id UUID;
  v_plan_linked_text TEXT;
  v_profile_id UUID; -- ID do user_profiles
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
  
  -- 3. Buscar perfil do usuário usando user_id de auth.users
  SELECT * INTO v_user_profile
  FROM user_profiles
  WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'USUARIO_NAO_ENCONTRADO',
      'message', 'Perfil do usuário não encontrado.'
    );
  END IF;
  
  -- 4. Obter id do user_profiles (necessário para UPDATE)
  v_profile_id := v_user_profile.id;
  
  -- 5. Mapear plan_linked para plan_type ENUM
  v_plan_linked_text := LOWER(COALESCE(v_coupon.plan_linked::TEXT, 'free'));
  
  CASE v_plan_linked_text
    WHEN 'academy_starter' THEN v_plan_type := 'academy_starter'::plan_type;
    WHEN 'academy_growth' THEN v_plan_type := 'academy_growth'::plan_type;
    WHEN 'personal_team' THEN v_plan_type := 'personal_team'::plan_type;
    WHEN 'monthly' THEN v_plan_type := 'monthly'::plan_type;
    WHEN 'annual' THEN v_plan_type := 'annual'::plan_type;
    ELSE v_plan_type := 'free'::plan_type;
  END CASE;
  
  -- 6. Determinar account_type esperado
  IF v_plan_linked_text LIKE 'academy%' OR v_plan_linked_text LIKE 'personal%' THEN
    v_account_type := 'USER_GYM'::account_type;
  ELSE
    v_account_type := COALESCE(v_user_profile.account_type, 'USER_B2C'::account_type);
  END IF;
  
  -- 7. Verificar perfil compatível
  IF v_plan_linked_text LIKE 'academy%' OR v_plan_linked_text LIKE 'personal%' THEN
    IF v_user_profile.account_type IS NOT NULL 
       AND v_user_profile.account_type != 'USER_GYM'::account_type
       AND v_user_profile.account_type != 'USER_B2C'::account_type THEN
      RETURN json_build_object(
        'success', false,
        'error', 'PERFIL_INCOMPATIVEL',
        'message', 'Este cupom é válido apenas para perfis de Academia ou Personal Trainer.'
      );
    END IF;
  END IF;
  
  -- 8. Decrementar quantidade_disponivel e incrementar current_uses atomicamente
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
  
  -- 9. Atualizar perfil do usuário com o plano (usando ENUM diretamente)
  UPDATE user_profiles
  SET 
    plan_type = v_plan_type, -- ENUM direto, sem cast
    subscription_status = 'active',
    account_type = v_account_type, -- ENUM direto
    updated_at = now()
  WHERE id = v_profile_id;
  
  -- 10. Criar vínculo na tabela user_coupon_links
  -- CORREÇÃO: usar p_user_id (user_id de auth.users) diretamente
  INSERT INTO user_coupon_links (user_id, coupon_id)
  VALUES (p_user_id, v_coupon.id)  -- CORRIGIDO: usar p_user_id (auth.users.id)
  ON CONFLICT (user_id, coupon_id) DO NOTHING;
  
  -- 11. Retornar sucesso
  RETURN json_build_object(
    'success', true,
    'message', 'Cupom ativado com sucesso!',
    'plan_type', v_plan_type::TEXT,
    'account_type', v_account_type::TEXT
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', 'ERRO_INTERNO',
      'message', 'Erro ao ativar cupom: ' || SQLERRM || ' (SQLSTATE: ' || SQLSTATE || ')'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificar se foi criada
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_name = 'activate_coupon_internal';

