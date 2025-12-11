-- ============================================
-- VERIFICAÇÃO E ATIVAÇÃO DE CUPOM
-- ============================================
-- Script simplificado que verifica tudo e ativa o cupom

-- PASSO 1: Verificar pré-requisitos
SELECT 
  'Verificação' as etapa,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ Existem ' || COUNT(*) || ' usuário(s)'
    ELSE '❌ Nenhum usuário encontrado'
  END as status
FROM auth.users;

SELECT 
  'Verificação' as etapa,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ Existem ' || COUNT(*) || ' perfil(is)'
    ELSE '❌ Nenhum perfil encontrado'
  END as status
FROM user_profiles;

-- PASSO 2: Tentar ativar (com tratamento de erro completo)
DO $$
DECLARE
  v_auth_user_id UUID;
  v_profile_id UUID;
  v_result JSON;
  v_result_text TEXT;
BEGIN
  -- Buscar usuário
  SELECT id INTO v_auth_user_id FROM auth.users LIMIT 1;
  
  IF v_auth_user_id IS NULL THEN
    RAISE EXCEPTION 'ERRO: Nenhum usuário encontrado em auth.users. Crie um usuário primeiro através do app ou Supabase Auth.';
  END IF;
  
  -- Buscar ou criar perfil
  SELECT id INTO v_profile_id FROM user_profiles WHERE user_id = v_auth_user_id LIMIT 1;
  
  IF v_profile_id IS NULL THEN
    INSERT INTO user_profiles (user_id, name, age, gender, height, weight, activity_level, goal)
    VALUES (v_auth_user_id, 'Usuário Teste', 30, 'Female', 170, 70, 'Moderate', 'Lose Weight')
    RETURNING id INTO v_profile_id;
  END IF;
  
  -- Atualizar account_type
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'account_type') THEN
    UPDATE user_profiles SET account_type = 'USER_GYM' WHERE id = v_profile_id;
  END IF;
  
  -- Mostrar informações antes
  RAISE NOTICE '========================================';
  RAISE NOTICE 'ATIVANDO CUPOM';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Profile ID: %', v_profile_id;
  RAISE NOTICE 'Cupom: TESTE-ATIVACAO';
  RAISE NOTICE '';
  
  -- Executar ativação
  SELECT activate_coupon_internal('TESTE-ATIVACAO', v_profile_id) INTO v_result;
  
  -- Converter resultado para texto
  v_result_text := v_result::TEXT;
  
  -- Mostrar resultado
  RAISE NOTICE 'RESULTADO:';
  RAISE NOTICE '%', v_result_text;
  RAISE NOTICE '';
  
  -- Verificar sucesso
  IF (v_result->>'success')::BOOLEAN THEN
    RAISE NOTICE '✅ SUCESSO! Cupom ativado.';
  ELSE
    RAISE NOTICE '❌ FALHOU: %', v_result->>'message';
    RAISE NOTICE '   Erro: %', v_result->>'error';
  END IF;
  
  RAISE NOTICE '========================================';
  
END $$;

-- PASSO 3: Verificar estado final
SELECT 
  code,
  current_uses as "Usos Atuais",
  quantidade_disponivel as "Disponível",
  max_uses as "Máximo",
  CASE 
    WHEN current_uses > 0 THEN '✅ ATIVADO'
    ELSE '❌ NÃO ATIVADO'
  END as Status
FROM coupons
WHERE code = 'TESTE-ATIVACAO';

