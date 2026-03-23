-- ============================================
-- FUNÇÃO DE ATIVAÇÃO INTERNA DE CUPOM
-- ============================================
-- Esta função valida e ativa um cupom de forma atômica,
-- desacoplada de gateways de pagamento externos.
-- 
-- Fluxo:
-- 1. Valida se cupom existe, está ativo e tem quantidade_disponivel > 0
-- 2. Verifica se o cupom é para o perfil correto (Academia ou Personal)
-- 3. Decrementa atomicamente a quantidade_disponivel
-- 4. Atualiza o perfil do usuário com o plano correspondente
-- 5. Cria vínculo na tabela user_coupon_links

-- Adicionar campo quantidade_disponivel se não existir
-- (calculado como max_uses - current_uses, mas armazenado para performance)
ALTER TABLE coupons 
ADD COLUMN IF NOT EXISTS quantidade_disponivel INTEGER;

-- Atualizar quantidade_disponivel para cupons existentes
UPDATE coupons 
SET quantidade_disponivel = GREATEST(0, max_uses - current_uses)
WHERE quantidade_disponivel IS NULL;

-- Criar trigger para manter quantidade_disponivel atualizado
CREATE OR REPLACE FUNCTION update_quantidade_disponivel()
RETURNS TRIGGER AS $$
BEGIN
  NEW.quantidade_disponivel = GREATEST(0, NEW.max_uses - NEW.current_uses);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_quantidade_disponivel ON coupons;
CREATE TRIGGER trigger_update_quantidade_disponivel
  BEFORE INSERT OR UPDATE OF max_uses, current_uses ON coupons
  FOR EACH ROW
  EXECUTE FUNCTION update_quantidade_disponivel();

-- Função principal de ativação de cupom
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
  v_result JSON;
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
  -- Usar quantidade_disponivel se existir, senão calcular
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
  
  -- 4. Determinar account_type esperado baseado no plan_linked do cupom
  -- Planos de Academia: academy_starter, academy_growth, academy_pro
  -- Planos de Personal: personal_team_5, personal_team_15
  IF v_coupon.plan_linked LIKE 'academy%' THEN
    v_account_type := 'USER_GYM';
  ELSIF v_coupon.plan_linked LIKE 'personal%' THEN
    v_account_type := 'USER_GYM'; -- Alunos de Personal também são USER_GYM
  ELSE
    -- Cupons B2C (mensal, anual, free) não precisam validação de perfil
    v_account_type := NULL;
  END IF;
  
  -- 5. Se o cupom é para Academia/Personal, verificar se o usuário tem o account_type correto
  -- OU se o usuário ainda não tem account_type definido (permitir ativação)
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
    AND quantidade_disponivel > 0  -- Condição de race condition
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
  
  -- Fazer cast para o tipo ENUM se necessário
  UPDATE user_profiles
  SET 
    plan_type = v_plan_type::plan_type,  -- Cast explícito para o tipo ENUM
    subscription_status = 'active',
    account_type = COALESCE(v_account_type, account_type, 'USER_B2C'),
    updated_at = now()
  WHERE id = p_user_id;
  
  -- 8. Criar vínculo na tabela user_coupon_links (se não existir)
  INSERT INTO user_coupon_links (user_id, coupon_id)
  VALUES (p_user_id, v_coupon.id)
  ON CONFLICT (user_id, coupon_id) DO NOTHING;
  
  -- 9. Retornar sucesso
  RETURN json_build_object(
    'success', true,
    'message', 'Cupom ativado com sucesso!',
    'plan_type', v_plan_type,
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

-- Comentário da função
COMMENT ON FUNCTION activate_coupon_internal IS 
'Ativa um cupom de forma atômica, validando disponibilidade, perfil do usuário e atualizando o plano. Desacoplada de gateways de pagamento.';

-- Garantir que a função pode ser chamada por usuários autenticados
GRANT EXECUTE ON FUNCTION activate_coupon_internal TO authenticated;

