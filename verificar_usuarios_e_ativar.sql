-- ============================================
-- VERIFICAR USUÁRIOS E ATIVAR CUPOM
-- ============================================
-- Este script PRIMEIRO verifica se há usuários
-- Se não houver, PARA e mostra instruções
-- Se houver, ativa o cupom e mostra TUDO

-- ============================================
-- ETAPA 1: VERIFICAÇÃO CRÍTICA
-- ============================================

-- Verificar usuários
DO $$
DECLARE
  v_user_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_user_count FROM auth.users;
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'VERIFICAÇÃO INICIAL';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Total de usuários em auth.users: %', v_user_count;
  RAISE NOTICE '';
  
  IF v_user_count = 0 THEN
    RAISE NOTICE '❌❌❌ PROBLEMA CRÍTICO ❌❌❌';
    RAISE NOTICE '';
    RAISE NOTICE 'NÃO HÁ USUÁRIOS NO BANCO DE DADOS!';
    RAISE NOTICE '';
    RAISE NOTICE 'SOLUÇÃO:';
    RAISE NOTICE '';
    RAISE NOTICE 'OPÇÃO 1 - Via App (Recomendado):';
    RAISE NOTICE '   1. Abra o app Nutri.ai';
    RAISE NOTICE '   2. Na Landing Page, clique em "Criar conta" ou "Já tenho uma conta"';
    RAISE NOTICE '   3. Registre um novo usuário';
    RAISE NOTICE '   4. Faça login';
    RAISE NOTICE '   5. Execute este script novamente';
    RAISE NOTICE '';
    RAISE NOTICE 'OPÇÃO 2 - Via Supabase Dashboard:';
    RAISE NOTICE '   1. Acesse: https://supabase.com/dashboard';
    RAISE NOTICE '   2. Selecione seu projeto';
    RAISE NOTICE '   3. Vá em: Authentication → Users';
    RAISE NOTICE '   4. Clique em: "Add User"';
    RAISE NOTICE '   5. Preencha email e senha';
    RAISE NOTICE '   6. Clique em: "Create User"';
    RAISE NOTICE '   7. Execute este script novamente';
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RETURN;
  END IF;
  
  RAISE NOTICE '✅ Há % usuário(s) no banco', v_user_count;
  RAISE NOTICE '✅ Pode prosseguir com a ativação';
  RAISE NOTICE '';
END $$;

-- ============================================
-- ETAPA 2: ATIVAÇÃO DO CUPOM
-- ============================================

DO $$
DECLARE
  v_auth_user_id UUID;
  v_profile_id UUID;
  v_result JSON;
  v_result_success BOOLEAN;
  v_result_error TEXT;
  v_result_message TEXT;
  v_result_plan_type TEXT;
  v_result_account_type TEXT;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'INICIANDO ATIVAÇÃO';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  
  -- Buscar primeiro usuário
  SELECT id INTO v_auth_user_id FROM auth.users LIMIT 1;
  
  IF v_auth_user_id IS NULL THEN
    RAISE NOTICE '❌ Nenhum usuário encontrado. Pare aqui.';
    RETURN;
  END IF;
  
  RAISE NOTICE '✅ Usuário encontrado: %', v_auth_user_id;
  
  -- Buscar ou criar perfil
  SELECT id INTO v_profile_id FROM user_profiles WHERE user_id = v_auth_user_id LIMIT 1;
  
  IF v_profile_id IS NULL THEN
    RAISE NOTICE '⚠️ Criando perfil...';
    INSERT INTO user_profiles (
      user_id, name, age, gender, height, weight, activity_level, goal
    )
    VALUES (
      v_auth_user_id, 'Usuário Teste', 30, 'Female', 170, 70, 'Moderate', 'Lose Weight'
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
    UPDATE user_profiles SET account_type = 'USER_GYM' WHERE id = v_profile_id;
    RAISE NOTICE '✅ account_type = USER_GYM';
  END IF;
  
  -- Estado ANTES
  RAISE NOTICE '';
  RAISE NOTICE '📋 ESTADO ANTES:';
  RAISE NOTICE '   Cupom: TESTE-ATIVACAO';
  RAISE NOTICE '   Disponível: %', (SELECT quantidade_disponivel FROM coupons WHERE code = 'TESTE-ATIVACAO');
  RAISE NOTICE '   Usos: %', (SELECT current_uses FROM coupons WHERE code = 'TESTE-ATIVACAO');
  RAISE NOTICE '   Profile ID: %', v_profile_id;
  
  -- EXECUTAR FUNÇÃO
  RAISE NOTICE '';
  RAISE NOTICE '🔄 Chamando activate_coupon_internal...';
  
  BEGIN
    SELECT activate_coupon_internal('TESTE-ATIVACAO', v_profile_id) INTO v_result;
    
    -- Extrair campos
    v_result_success := (v_result->>'success')::BOOLEAN;
    v_result_error := v_result->>'error';
    v_result_message := v_result->>'message';
    v_result_plan_type := v_result->>'plan_type';
    v_result_account_type := v_result->>'account_type';
    
    -- Mostrar JSON completo
    RAISE NOTICE '';
    RAISE NOTICE '📋 RESULTADO JSON COMPLETO:';
    RAISE NOTICE '%', v_result::TEXT;
    RAISE NOTICE '';
    
    -- Análise do resultado
    IF v_result_success THEN
      RAISE NOTICE '✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅';
      RAISE NOTICE '   SUCESSO! CUPOM ATIVADO COM SUCESSO!';
      RAISE NOTICE '✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅';
      RAISE NOTICE '';
      RAISE NOTICE '   Plano: %', v_result_plan_type;
      RAISE NOTICE '   Account Type: %', v_result_account_type;
    ELSE
      RAISE NOTICE '❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌';
      RAISE NOTICE '   FALHOU!';
      RAISE NOTICE '❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌';
      RAISE NOTICE '';
      RAISE NOTICE '   Erro: %', v_result_error;
      RAISE NOTICE '   Mensagem: %', v_result_message;
      RAISE NOTICE '';
      
      -- Diagnóstico específico
      IF v_result_error = 'CUPOM_INEXISTENTE' THEN
        RAISE NOTICE '   DIAGNÓSTICO: Cupom não existe ou está inativo';
        RAISE NOTICE '   SOLUÇÃO: Verifique se o cupom TESTE-ATIVACAO existe e is_active = true';
      ELSIF v_result_error = 'CUPOM_ESGOTADO' THEN
        RAISE NOTICE '   DIAGNÓSTICO: Cupom esgotado';
        RAISE NOTICE '   SOLUÇÃO: quantidade_disponivel = 0';
      ELSIF v_result_error = 'PERFIL_INCOMPATIVEL' THEN
        RAISE NOTICE '   DIAGNÓSTICO: Perfil incompatível';
        RAISE NOTICE '   SOLUÇÃO: account_type do usuário não é USER_GYM';
      ELSIF v_result_error = 'USUARIO_NAO_ENCONTRADO' THEN
        RAISE NOTICE '   DIAGNÓSTICO: Perfil não encontrado';
        RAISE NOTICE '   SOLUÇÃO: Verifique se o perfil foi criado corretamente';
      ELSE
        RAISE NOTICE '   DIAGNÓSTICO: Erro desconhecido';
      END IF;
    END IF;
    
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '';
    RAISE NOTICE '❌ ERRO AO EXECUTAR FUNÇÃO:';
    RAISE NOTICE '   %', SQLERRM;
    RAISE NOTICE '   SQLSTATE: %', SQLSTATE;
    RETURN;
  END;
  
  -- Estado DEPOIS
  RAISE NOTICE '';
  RAISE NOTICE '📋 ESTADO DEPOIS:';
  RAISE NOTICE '   Disponível: %', (SELECT quantidade_disponivel FROM coupons WHERE code = 'TESTE-ATIVACAO');
  RAISE NOTICE '   Usos: %', (SELECT current_uses FROM coupons WHERE code = 'TESTE-ATIVACAO');
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  
END $$;

-- ============================================
-- ETAPA 3: VERIFICAÇÃO FINAL
-- ============================================

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

