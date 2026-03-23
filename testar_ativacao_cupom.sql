-- ============================================
-- TESTE DE ATIVAÇÃO DE CUPOM
-- ============================================
-- Este script cria um cupom de teste e simula uma ativação
-- Use para validar que a função está funcionando corretamente

-- 1. Criar um cupom de teste (se não existir)
INSERT INTO coupons (code, plan_linked, max_uses, current_uses, is_active, quantidade_disponivel)
VALUES ('TESTE-ATIVACAO', 'academy_starter', 10, 0, true, 10)
ON CONFLICT (code) DO UPDATE
SET 
  max_uses = 10,
  current_uses = 0,
  is_active = true,
  quantidade_disponivel = 10;

-- 2. Verificar estado inicial do cupom
SELECT 
  code,
  plan_linked,
  max_uses,
  current_uses,
  quantidade_disponivel,
  is_active
FROM coupons
WHERE code = 'TESTE-ATIVACAO';

-- 3. Obter um ID de usuário de teste (substitua pelo ID real de um usuário)
-- NOTA: Você precisa substituir 'SEU_USER_ID_AQUI' pelo UUID real de um usuário de teste
DO $$
DECLARE
  v_auth_user_id UUID;
  v_profile_id UUID;
  v_result JSON;
BEGIN
  -- Buscar um usuário de teste (ou usar um ID específico)
  SELECT id INTO v_auth_user_id
  FROM auth.users
  LIMIT 1;
  
  IF v_auth_user_id IS NULL THEN
    RAISE NOTICE '❌ Nenhum usuário encontrado. Crie um usuário primeiro.';
    RETURN;
  END IF;
  
  RAISE NOTICE '✅ Usuário de teste encontrado (auth.users.id): %', v_auth_user_id;
  
  -- Verificar se o usuário tem perfil
  SELECT id INTO v_profile_id
  FROM user_profiles 
  WHERE user_id = v_auth_user_id
  LIMIT 1;
  
  IF v_profile_id IS NULL THEN
    RAISE NOTICE '⚠️ Criando perfil para o usuário...';
    
      INSERT INTO user_profiles (
        user_id, 
        name, 
        age, 
        gender, 
        height, 
        weight, 
        activity_level, 
        goal
      )
      VALUES (
        v_auth_user_id, 
        'Usuário Teste', 
        30, 
        'Female', 
        170, 
        70, 
        'Moderate', 
        'Lose Weight'
      )
    RETURNING id INTO v_profile_id;
    
    RAISE NOTICE '✅ Perfil criado (user_profiles.id): %', v_profile_id;
  ELSE
    RAISE NOTICE '✅ Perfil encontrado (user_profiles.id): %', v_profile_id;
  END IF;
  
  -- Atualizar account_type para USER_GYM (necessário para cupom de academia)
  -- Verificar se a coluna existe antes de atualizar
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' 
    AND column_name = 'account_type'
  ) THEN
    UPDATE user_profiles
    SET account_type = 'USER_GYM'
    WHERE id = v_profile_id;
    RAISE NOTICE '✅ account_type atualizado para USER_GYM';
  ELSE
    RAISE NOTICE '⚠️ Coluna account_type não existe. Execute adicionar_account_type.sql primeiro.';
  END IF;
  
  RAISE NOTICE '📋 Estado ANTES da ativação:';
  RAISE NOTICE '   Cupom: TESTE-ATIVACAO';
  RAISE NOTICE '   Quantidade disponível: %', (
    SELECT quantidade_disponivel FROM coupons WHERE code = 'TESTE-ATIVACAO'
  );
  RAISE NOTICE '   Plano do usuário: %', (
    SELECT plan_type FROM user_profiles WHERE id = v_profile_id
  );
  
  -- Chamar a função de ativação (usa o id do user_profiles, não o user_id)
  SELECT activate_coupon_internal('TESTE-ATIVACAO', v_profile_id) INTO v_result;
  
  RAISE NOTICE '';
  RAISE NOTICE '📋 Resultado da ativação:';
  RAISE NOTICE '%', v_result::TEXT;
  
  RAISE NOTICE '';
  RAISE NOTICE '📋 Estado DEPOIS da ativação:';
  RAISE NOTICE '   Quantidade disponível: %', (
    SELECT quantidade_disponivel FROM coupons WHERE code = 'TESTE-ATIVACAO'
  );
  RAISE NOTICE '   Current uses: %', (
    SELECT current_uses FROM coupons WHERE code = 'TESTE-ATIVACAO'
  );
  RAISE NOTICE '   Plano do usuário: %', (
    SELECT plan_type FROM user_profiles WHERE id = v_profile_id
  );
  RAISE NOTICE '   Status de assinatura: %', (
    SELECT subscription_status FROM user_profiles WHERE id = v_profile_id
  );
  
  -- Verificar se o vínculo foi criado
  IF EXISTS (
    SELECT 1 FROM user_coupon_links 
    WHERE user_id = v_profile_id 
    AND coupon_id = (SELECT id FROM coupons WHERE code = 'TESTE-ATIVACAO')
  ) THEN
    RAISE NOTICE '✅ Vínculo user_coupon_links criado com sucesso';
  ELSE
    RAISE NOTICE '⚠️ Vínculo user_coupon_links NÃO foi criado';
  END IF;
  
END $$;

-- 4. Verificar estado final
SELECT 
  'Cupom após ativação' as info,
  code,
  current_uses,
  quantidade_disponivel,
  max_uses - current_uses as calculado_manual
FROM coupons
WHERE code = 'TESTE-ATIVACAO';

-- 5. Limpar dados de teste (descomente se quiser remover o cupom de teste)
-- DELETE FROM coupons WHERE code = 'TESTE-ATIVACAO';

