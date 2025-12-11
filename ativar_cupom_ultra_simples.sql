-- ============================================
-- ATIVAÇÃO ULTRA SIMPLES
-- ============================================
-- Este script mostra TUDO de forma clara

-- 1. VERIFICAR SE HÁ USUÁRIOS (CRÍTICO!)
SELECT 
  'VERIFICAÇÃO CRÍTICA' as tipo,
  COUNT(*) as total_usuarios,
  CASE 
    WHEN COUNT(*) = 0 THEN '❌ PROBLEMA: Não há usuários! Crie um primeiro.'
    ELSE '✅ OK: Há ' || COUNT(*) || ' usuário(s)'
  END as status
FROM auth.users;

-- 2. Se houver usuários, mostrar o primeiro
SELECT 
  'Primeiro Usuário' as info,
  id as user_id,
  email,
  created_at
FROM auth.users
LIMIT 1;

-- 3. Tentar ativar (só funciona se houver usuário)
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
    RAISE NOTICE 'STOP: Não há usuários. Crie um primeiro via app ou Supabase Dashboard.';
    RETURN;
  END IF;
  
  -- Buscar ou criar perfil
  SELECT id INTO v_profile_id FROM user_profiles WHERE user_id = v_auth_user_id LIMIT 1;
  
  IF v_profile_id IS NULL THEN
    INSERT INTO user_profiles (user_id, name, age, gender, height, weight, activity_level, goal)
    VALUES (v_auth_user_id, 'Teste', 30, 'Female', 170, 70, 'Moderate', 'Lose Weight')
    RETURNING id INTO v_profile_id;
  END IF;
  
  -- Atualizar account_type
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'account_type'
  ) THEN
    UPDATE user_profiles SET account_type = 'USER_GYM' WHERE id = v_profile_id;
  END IF;
  
  -- ATIVAR
  SELECT activate_coupon_internal('TESTE-ATIVACAO', v_profile_id) INTO v_result;
  
  -- Mostrar resultado
  RAISE NOTICE 'RESULTADO: %', v_result::TEXT;
  
  IF (v_result->>'success')::BOOLEAN THEN
    RAISE NOTICE 'SUCESSO!';
  ELSE
    RAISE NOTICE 'FALHOU: %', v_result->>'message';
  END IF;
  
END $$;

-- 4. Verificar estado final
SELECT 
  'RESULTADO FINAL' as info,
  code,
  current_uses,
  quantidade_disponivel,
  CASE 
    WHEN current_uses > 0 THEN '✅ ATIVADO'
    WHEN current_uses = 0 THEN '❌ NÃO ATIVADO - Verifique mensagens acima'
    ELSE '❓ ERRO'
  END as status
FROM coupons
WHERE code = 'TESTE-ATIVACAO';

