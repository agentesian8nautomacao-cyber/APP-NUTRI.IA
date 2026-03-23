-- ============================================
-- ATIVAÇÃO COM USER ID ESPECÍFICO
-- ============================================
-- Usando o User UID: 7191e945-152c-400b-bd91-03c5d7bdeeb2

-- 1. Verificar se o usuário tem perfil
SELECT 
  'Verificação de Perfil' as info,
  up.id as profile_id,
  up.user_id,
  up.name,
  up.account_type,
  up.plan_type,
  CASE 
    WHEN up.id IS NULL THEN '❌ Perfil não existe - será criado'
    ELSE '✅ Perfil existe'
  END as status
FROM auth.users au
LEFT JOIN user_profiles up ON up.user_id = au.id
WHERE au.id = '7191e945-152c-400b-bd91-03c5d7bdeeb2'::UUID;

-- 2. Criar perfil se não existir e ativar cupom
DO $$
DECLARE
  v_auth_user_id UUID := '7191e945-152c-400b-bd91-03c5d7bdeeb2'::UUID;
  v_profile_id UUID;
  v_result JSON;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'ATIVAÇÃO DE CUPOM';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'User ID: %', v_auth_user_id;
  RAISE NOTICE '';
  
  -- Buscar perfil
  SELECT id INTO v_profile_id 
  FROM user_profiles 
  WHERE user_id = v_auth_user_id
  LIMIT 1;
  
  IF v_profile_id IS NULL THEN
    RAISE NOTICE '⚠️ Perfil não existe. Criando...';
    
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
    
    RAISE NOTICE '✅ Perfil criado: %', v_profile_id;
  ELSE
    RAISE NOTICE '✅ Perfil encontrado: %', v_profile_id;
  END IF;
  
  -- Atualizar account_type
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'account_type'
  ) THEN
    UPDATE user_profiles 
    SET account_type = 'USER_GYM' 
    WHERE id = v_profile_id;
    RAISE NOTICE '✅ account_type atualizado para USER_GYM';
  END IF;
  
  -- Estado ANTES
  RAISE NOTICE '';
  RAISE NOTICE '📋 ESTADO ANTES:';
  RAISE NOTICE '   Cupom: TESTE-ATIVACAO';
  RAISE NOTICE '   Profile ID: %', v_profile_id;
  RAISE NOTICE '   Disponível: %', (
    SELECT quantidade_disponivel FROM coupons WHERE code = 'TESTE-ATIVACAO'
  );
  RAISE NOTICE '   Usos: %', (
    SELECT current_uses FROM coupons WHERE code = 'TESTE-ATIVACAO'
  );
  
  -- EXECUTAR ATIVAÇÃO
  RAISE NOTICE '';
  RAISE NOTICE '🔄 Executando activate_coupon_internal...';
  
  BEGIN
    SELECT activate_coupon_internal('TESTE-ATIVACAO', v_profile_id) INTO v_result;
    
    RAISE NOTICE '';
    RAISE NOTICE '📋 RESULTADO COMPLETO:';
    RAISE NOTICE '%', v_result::TEXT;
    RAISE NOTICE '';
    
    IF (v_result->>'success')::BOOLEAN THEN
      RAISE NOTICE '✅✅✅ SUCESSO! CUPOM ATIVADO! ✅✅✅';
      RAISE NOTICE '   Plano: %', v_result->>'plan_type';
      RAISE NOTICE '   Account Type: %', v_result->>'account_type';
    ELSE
      RAISE NOTICE '❌❌❌ FALHOU ❌❌❌';
      RAISE NOTICE '   Erro: %', v_result->>'error';
      RAISE NOTICE '   Mensagem: %', v_result->>'message';
    END IF;
    
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '';
    RAISE NOTICE '❌ ERRO AO EXECUTAR FUNÇÃO:';
    RAISE NOTICE '   %', SQLERRM;
    RAISE NOTICE '   SQLSTATE: %', SQLSTATE;
  END;
  
  -- Estado DEPOIS
  RAISE NOTICE '';
  RAISE NOTICE '📋 ESTADO DEPOIS:';
  RAISE NOTICE '   Disponível: %', (
    SELECT quantidade_disponivel FROM coupons WHERE code = 'TESTE-ATIVACAO'
  );
  RAISE NOTICE '   Usos: %', (
    SELECT current_uses FROM coupons WHERE code = 'TESTE-ATIVACAO'
  );
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  
END $$;

-- 3. Verificar estado final
SELECT 
  'Estado Final' as info,
  code,
  current_uses as "Usos",
  quantidade_disponivel as "Disponível",
  max_uses as "Máximo",
  CASE 
    WHEN current_uses > 0 THEN '✅✅✅ ATIVADO ✅✅✅'
    ELSE '❌ NÃO ATIVADO'
  END as Status
FROM coupons
WHERE code = 'TESTE-ATIVACAO';

-- 4. Verificar perfil atualizado
SELECT 
  'Perfil Atualizado' as info,
  id,
  name,
  account_type,
  plan_type,
  subscription_status
FROM user_profiles
WHERE user_id = '7191e945-152c-400b-bd91-03c5d7bdeeb2'::UUID;

