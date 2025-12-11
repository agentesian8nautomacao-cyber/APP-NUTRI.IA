-- ============================================
-- DIAGNÓSTICO DE ATIVAÇÃO DE CUPOM
-- ============================================
-- Este script verifica todos os pré-requisitos e tenta ativar o cupom

-- 1. Verificar se há usuários no auth.users
SELECT 
  'Usuários em auth.users' as verificação,
  COUNT(*) as total
FROM auth.users;

-- 2. Verificar se há perfis em user_profiles
SELECT 
  'Perfis em user_profiles' as verificação,
  COUNT(*) as total
FROM user_profiles;

-- 3. Verificar estado do cupom
SELECT 
  'Estado do Cupom' as verificação,
  code,
  plan_linked,
  max_uses,
  current_uses,
  quantidade_disponivel,
  is_active,
  CASE 
    WHEN is_active = false THEN '❌ Inativo'
    WHEN quantidade_disponivel <= 0 THEN '❌ Esgotado'
    WHEN quantidade_disponivel > 0 THEN '✅ Disponível'
    ELSE '⚠️ Indefinido'
  END as status
FROM coupons
WHERE code = 'TESTE-ATIVACAO';

-- 4. Verificar se a função existe
SELECT 
  'Função activate_coupon_internal' as verificação,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.routines 
      WHERE routine_name = 'activate_coupon_internal'
    ) THEN '✅ Existe'
    ELSE '❌ Não encontrada'
  END as status;

-- 5. Tentar encontrar ou criar usuário e perfil
DO $$
DECLARE
  v_auth_user_id UUID;
  v_profile_id UUID;
  v_result JSON;
  v_error_text TEXT;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'DIAGNÓSTICO DE ATIVAÇÃO DE CUPOM';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  
  -- Verificar usuários
  SELECT id INTO v_auth_user_id
  FROM auth.users
  LIMIT 1;
  
  IF v_auth_user_id IS NULL THEN
    RAISE NOTICE '❌ PROBLEMA: Nenhum usuário encontrado em auth.users';
    RAISE NOTICE '';
    RAISE NOTICE 'SOLUÇÃO:';
    RAISE NOTICE '   1. Crie um usuário através do app (registro/login)';
    RAISE NOTICE '   2. Ou crie manualmente via Supabase Auth';
    RAISE NOTICE '';
    RETURN;
  END IF;
  
  RAISE NOTICE '✅ Usuário encontrado: %', v_auth_user_id;
  
  -- Verificar perfil
  SELECT id INTO v_profile_id
  FROM user_profiles
  WHERE user_id = v_auth_user_id
  LIMIT 1;
  
  IF v_profile_id IS NULL THEN
    RAISE NOTICE '⚠️ Perfil não encontrado. Criando...';
    
    BEGIN
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
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE '❌ ERRO ao criar perfil: %', SQLERRM;
      RETURN;
    END;
  ELSE
    RAISE NOTICE '✅ Perfil encontrado: %', v_profile_id;
  END IF;
  
  -- Atualizar account_type
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
  
  -- Mostrar estado antes
  RAISE NOTICE '';
  RAISE NOTICE '📋 ESTADO ANTES:';
  RAISE NOTICE '   Cupom: TESTE-ATIVACAO';
  RAISE NOTICE '   Quantidade disponível: %', (
    SELECT quantidade_disponivel FROM coupons WHERE code = 'TESTE-ATIVACAO'
  );
  RAISE NOTICE '   Current uses: %', (
    SELECT current_uses FROM coupons WHERE code = 'TESTE-ATIVACAO'
  );
  RAISE NOTICE '   Profile ID: %', v_profile_id;
  
  -- Tentar ativar
  RAISE NOTICE '';
  RAISE NOTICE '🔄 Tentando ativar cupom...';
  
  BEGIN
    SELECT activate_coupon_internal('TESTE-ATIVACAO', v_profile_id) INTO v_result;
    
    RAISE NOTICE '';
    RAISE NOTICE '📋 RESULTADO:';
    RAISE NOTICE '%', v_result::TEXT;
    
    -- Verificar se foi sucesso
    IF (v_result->>'success')::BOOLEAN = true THEN
      RAISE NOTICE '';
      RAISE NOTICE '✅ ATIVAÇÃO BEM-SUCEDIDA!';
      RAISE NOTICE '   Plano: %', v_result->>'plan_type';
      RAISE NOTICE '   Account Type: %', v_result->>'account_type';
    ELSE
      RAISE NOTICE '';
      RAISE NOTICE '❌ ATIVAÇÃO FALHOU';
      RAISE NOTICE '   Erro: %', v_result->>'error';
      RAISE NOTICE '   Mensagem: %', v_result->>'message';
    END IF;
    
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '';
    RAISE NOTICE '❌ ERRO ao executar função:';
    RAISE NOTICE '   %', SQLERRM;
    RAISE NOTICE '   SQLSTATE: %', SQLSTATE;
  END;
  
  -- Mostrar estado depois
  RAISE NOTICE '';
  RAISE NOTICE '📋 ESTADO DEPOIS:';
  RAISE NOTICE '   Quantidade disponível: %', (
    SELECT quantidade_disponivel FROM coupons WHERE code = 'TESTE-ATIVACAO'
  );
  RAISE NOTICE '   Current uses: %', (
    SELECT current_uses FROM coupons WHERE code = 'TESTE-ATIVACAO'
  );
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'DIAGNÓSTICO CONCLUÍDO';
  RAISE NOTICE '========================================';
  
END $$;

-- 6. Verificar estado final
SELECT 
  'Estado Final do Cupom' as info,
  code,
  current_uses,
  quantidade_disponivel,
  max_uses,
  CASE 
    WHEN current_uses = 0 THEN '❌ Não foi ativado'
    WHEN current_uses > 0 THEN '✅ Foi ativado'
    ELSE '⚠️ Estado desconhecido'
  END as status
FROM coupons
WHERE code = 'TESTE-ATIVACAO';

