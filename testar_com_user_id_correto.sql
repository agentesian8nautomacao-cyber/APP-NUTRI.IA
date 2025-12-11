-- ============================================
-- TESTAR COM USER_ID CORRETO
-- ============================================

-- 1. Obter user_id de auth.users para o email
DO $$
DECLARE
  v_auth_user_id UUID;
  v_profile_id UUID;
  v_resultado JSON;
BEGIN
  -- Buscar user_id de auth.users
  SELECT id INTO v_auth_user_id
  FROM auth.users
  WHERE email = 'agentesian8nautomacao@gmail.com';
  
  IF v_auth_user_id IS NULL THEN
    RAISE NOTICE 'Usuário não encontrado em auth.users';
    RETURN;
  END IF;
  
  RAISE NOTICE 'User ID (auth.users): %', v_auth_user_id;
  
  -- Buscar profile_id
  SELECT id INTO v_profile_id
  FROM user_profiles
  WHERE user_id = v_auth_user_id;
  
  IF v_profile_id IS NULL THEN
    RAISE NOTICE 'Perfil não encontrado para user_id: %', v_auth_user_id;
    RAISE NOTICE 'Criando perfil...';
    
    -- Criar perfil básico se não existir
    INSERT INTO user_profiles (
      user_id,
      name,
      age,
      gender,
      height,
      weight,
      activity_level,
      goal
    ) VALUES (
      v_auth_user_id,
      'Usuário Teste',
      30,
      'Female',
      170,
      70,
      'Moderate',
      'Lose Weight'
    ) RETURNING id INTO v_profile_id;
    
    RAISE NOTICE 'Perfil criado com ID: %', v_profile_id;
  ELSE
    RAISE NOTICE 'Perfil encontrado com ID: %', v_profile_id;
  END IF;
  
  -- Testar ativação do cupom
  v_resultado := activate_coupon_internal('TESTE-ATIVACAO', v_auth_user_id);
  
  RAISE NOTICE 'Resultado da ativação: %', v_resultado;
  RAISE NOTICE 'Sucesso: %', v_resultado->>'success';
  RAISE NOTICE 'Erro: %', v_resultado->>'error';
  RAISE NOTICE 'Mensagem: %', v_resultado->>'message';
  
END $$;

-- 2. Verificar resultado final
SELECT 
  'Perfil Final' as info,
  up.id as profile_id,
  up.user_id,
  au.email,
  up.plan_type,
  up.subscription_status,
  up.account_type
FROM user_profiles up
LEFT JOIN auth.users au ON au.id = up.user_id
WHERE au.email = 'agentesian8nautomacao@gmail.com';

