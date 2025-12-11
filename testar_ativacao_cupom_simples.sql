-- ============================================
-- TESTE SIMPLES DE ATIVAÇÃO DE CUPOM
-- ============================================
-- Este script busca automaticamente um usuário e ativa o cupom

-- 1. Verificar se o cupom existe
SELECT 
  code,
  plan_linked,
  max_uses,
  current_uses,
  quantidade_disponivel,
  is_active
FROM coupons
WHERE code = 'TESTE-ATIVACAO';

-- 2. Buscar um perfil de usuário (ou criar se não existir)
DO $$
DECLARE
  v_profile_id UUID;
  v_auth_user_id UUID;
  v_result JSON;
BEGIN
  -- Buscar um usuário autenticado
  SELECT id INTO v_auth_user_id
  FROM auth.users
  LIMIT 1;
  
  IF v_auth_user_id IS NULL THEN
    RAISE NOTICE '❌ Nenhum usuário encontrado em auth.users.';
    RAISE NOTICE '   Crie um usuário primeiro através do app ou Supabase Auth.';
    RETURN;
  END IF;
  
  RAISE NOTICE '✅ Usuário encontrado (auth.users.id): %', v_auth_user_id;
  
  -- Buscar ou criar perfil
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
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' 
    AND column_name = 'account_type'
  ) THEN
    UPDATE user_profiles
    SET account_type = 'USER_GYM'
    WHERE id = v_profile_id;
    RAISE NOTICE '✅ account_type atualizado para USER_GYM';
  END IF;
  
  -- Mostrar estado ANTES
  RAISE NOTICE '';
  RAISE NOTICE '📋 ESTADO ANTES DA ATIVAÇÃO:';
  RAISE NOTICE '   Cupom: TESTE-ATIVACAO';
  RAISE NOTICE '   Quantidade disponível: %', (
    SELECT quantidade_disponivel FROM coupons WHERE code = 'TESTE-ATIVACAO'
  );
  RAISE NOTICE '   Current uses: %', (
    SELECT current_uses FROM coupons WHERE code = 'TESTE-ATIVACAO'
  );
  RAISE NOTICE '   Plano do usuário: %', (
    SELECT COALESCE(plan_type::TEXT, 'NULL') FROM user_profiles WHERE id = v_profile_id
  );
  
  -- ATIVAR O CUPOM
  RAISE NOTICE '';
  RAISE NOTICE '🔄 Ativando cupom...';
  SELECT activate_coupon_internal('TESTE-ATIVACAO', v_profile_id) INTO v_result;
  
  -- Mostrar resultado
  RAISE NOTICE '';
  RAISE NOTICE '📋 RESULTADO DA ATIVAÇÃO:';
  RAISE NOTICE '%', v_result::TEXT;
  
  -- Mostrar estado DEPOIS
  RAISE NOTICE '';
  RAISE NOTICE '📋 ESTADO DEPOIS DA ATIVAÇÃO:';
  RAISE NOTICE '   Quantidade disponível: %', (
    SELECT quantidade_disponivel FROM coupons WHERE code = 'TESTE-ATIVACAO'
  );
  RAISE NOTICE '   Current uses: %', (
    SELECT current_uses FROM coupons WHERE code = 'TESTE-ATIVACAO'
  );
  RAISE NOTICE '   Plano do usuário: %', (
    SELECT COALESCE(plan_type::TEXT, 'NULL') FROM user_profiles WHERE id = v_profile_id
  );
  RAISE NOTICE '   Status de assinatura: %', (
    SELECT COALESCE(subscription_status::TEXT, 'NULL') FROM user_profiles WHERE id = v_profile_id
  );
  
  -- Verificar vínculo
  IF EXISTS (
    SELECT 1 FROM user_coupon_links 
    WHERE user_id = v_profile_id 
    AND coupon_id = (SELECT id FROM coupons WHERE code = 'TESTE-ATIVACAO')
  ) THEN
    RAISE NOTICE '✅ Vínculo user_coupon_links criado';
  ELSE
    RAISE NOTICE '⚠️ Vínculo user_coupon_links NÃO foi criado';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '✅ Teste concluído!';
  RAISE NOTICE '   Profile ID usado: %', v_profile_id;
  
END $$;

-- 3. Verificar estado final do cupom
SELECT 
  'Estado Final' as info,
  code,
  current_uses,
  quantidade_disponivel,
  max_uses,
  max_uses - current_uses as calculado_manual
FROM coupons
WHERE code = 'TESTE-ATIVACAO';

