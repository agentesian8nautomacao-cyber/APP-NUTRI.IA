-- ============================================
-- ATIVAÇÃO DIRETA DE CUPOM
-- ============================================
-- Script que mostra TUDO o que acontece

-- 1. Verificar se há usuários
SELECT 
  'Total de usuários' as info,
  COUNT(*) as valor,
  CASE 
    WHEN COUNT(*) = 0 THEN '❌ PROBLEMA: Não há usuários!'
    ELSE '✅ OK'
  END as status
FROM auth.users;

-- 2. Verificar se há perfis
SELECT 
  'Total de perfis' as info,
  COUNT(*) as valor,
  CASE 
    WHEN COUNT(*) = 0 THEN '⚠️ Será criado automaticamente'
    ELSE '✅ OK'
  END as status
FROM user_profiles;

-- 3. Verificar cupom
SELECT 
  'Estado do cupom' as info,
  code,
  is_active,
  quantidade_disponivel,
  current_uses,
  CASE 
    WHEN is_active = false THEN '❌ Inativo'
    WHEN quantidade_disponivel <= 0 THEN '❌ Esgotado'
    ELSE '✅ Pronto para ativar'
  END as status
FROM coupons
WHERE code = 'TESTE-ATIVACAO';

-- 4. ATIVAR CUPOM (com logs detalhados)
DO $$
DECLARE
  v_auth_user_id UUID;
  v_profile_id UUID;
  v_result JSON;
  v_result_success BOOLEAN;
  v_result_error TEXT;
  v_result_message TEXT;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'INICIANDO ATIVAÇÃO DE CUPOM';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  
  -- Buscar usuário
  SELECT id INTO v_auth_user_id FROM auth.users LIMIT 1;
  
  IF v_auth_user_id IS NULL THEN
    RAISE NOTICE '❌ ERRO CRÍTICO: Nenhum usuário encontrado!';
    RAISE NOTICE '';
    RAISE NOTICE 'SOLUÇÃO:';
    RAISE NOTICE '   1. Abra o app e crie uma conta (registro/login)';
    RAISE NOTICE '   2. OU crie um usuário via Supabase Dashboard';
    RAISE NOTICE '      Dashboard → Authentication → Add User';
    RAISE NOTICE '';
    RETURN;
  END IF;
  
  RAISE NOTICE '✅ Usuário encontrado: %', v_auth_user_id;
  
  -- Buscar ou criar perfil
  SELECT id INTO v_profile_id FROM user_profiles WHERE user_id = v_auth_user_id LIMIT 1;
  
  IF v_profile_id IS NULL THEN
    RAISE NOTICE '⚠️ Perfil não existe. Criando...';
    
    BEGIN
      INSERT INTO user_profiles (
        user_id, name, age, gender, height, weight, activity_level, goal
      )
      VALUES (
        v_auth_user_id, 'Usuário Teste', 30, 'Female', 170, 70, 'Moderate', 'Lose Weight'
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
    WHERE table_name = 'user_profiles' AND column_name = 'account_type'
  ) THEN
    UPDATE user_profiles SET account_type = 'USER_GYM' WHERE id = v_profile_id;
    RAISE NOTICE '✅ account_type atualizado para USER_GYM';
  END IF;
  
  -- Mostrar estado ANTES
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
  
  -- EXECUTAR ATIVAÇÃO
  RAISE NOTICE '';
  RAISE NOTICE '🔄 Executando activate_coupon_internal...';
  
  BEGIN
    SELECT activate_coupon_internal('TESTE-ATIVACAO', v_profile_id) INTO v_result;
    
    -- Extrair campos do resultado
    v_result_success := (v_result->>'success')::BOOLEAN;
    v_result_error := v_result->>'error';
    v_result_message := v_result->>'message';
    
    RAISE NOTICE '';
    RAISE NOTICE '📋 RESULTADO COMPLETO:';
    RAISE NOTICE '%', v_result::TEXT;
    RAISE NOTICE '';
    
    IF v_result_success THEN
      RAISE NOTICE '✅✅✅ SUCESSO! CUPOM ATIVADO! ✅✅✅';
      RAISE NOTICE '   Plano: %', v_result->>'plan_type';
      RAISE NOTICE '   Account Type: %', v_result->>'account_type';
    ELSE
      RAISE NOTICE '❌❌❌ FALHOU! ❌❌❌';
      RAISE NOTICE '   Erro: %', v_result_error;
      RAISE NOTICE '   Mensagem: %', v_result_message;
      RAISE NOTICE '';
      RAISE NOTICE 'POSSÍVEIS CAUSAS:';
      IF v_result_error = 'CUPOM_INEXISTENTE' THEN
        RAISE NOTICE '   - Cupom não existe ou está inativo';
      ELSIF v_result_error = 'CUPOM_ESGOTADO' THEN
        RAISE NOTICE '   - Cupom esgotado (quantidade_disponivel = 0)';
      ELSIF v_result_error = 'PERFIL_INCOMPATIVEL' THEN
        RAISE NOTICE '   - Perfil do usuário não é compatível com o cupom';
      ELSIF v_result_error = 'USUARIO_NAO_ENCONTRADO' THEN
        RAISE NOTICE '   - Perfil do usuário não foi encontrado';
      ELSE
        RAISE NOTICE '   - Erro desconhecido: %', v_result_error;
      END IF;
    END IF;
    
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '';
    RAISE NOTICE '❌❌❌ ERRO AO EXECUTAR FUNÇÃO ❌❌❌';
    RAISE NOTICE '   Erro: %', SQLERRM;
    RAISE NOTICE '   SQLSTATE: %', SQLSTATE;
    RETURN;
  END;
  
  -- Mostrar estado DEPOIS
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
  RAISE NOTICE 'FIM DA ATIVAÇÃO';
  RAISE NOTICE '========================================';
  
END $$;

-- 5. Verificar estado final
SELECT 
  'Estado Final' as info,
  code,
  current_uses as "Usos",
  quantidade_disponivel as "Disponível",
  CASE 
    WHEN current_uses > 0 THEN '✅✅✅ ATIVADO COM SUCESSO ✅✅✅'
    ELSE '❌ NÃO FOI ATIVADO'
  END as Status
FROM coupons
WHERE code = 'TESTE-ATIVACAO';

