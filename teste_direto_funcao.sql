-- ============================================
-- TESTE DIRETO DA FUNÇÃO
-- ============================================
-- Este script testa a função passo a passo

-- Profile ID: 4186d746-5ac7-45fe-9c85-c83eaa97535e
-- Cupom: TESTE-ATIVACAO

-- 1. Verificar se o cupom existe e está ativo
SELECT 
  'Verificação do Cupom' as etapa,
  id,
  code,
  plan_linked,
  is_active,
  max_uses,
  current_uses,
  quantidade_disponivel,
  CASE 
    WHEN id IS NULL THEN '❌ Cupom não existe'
    WHEN is_active = false THEN '❌ Cupom inativo'
    WHEN quantidade_disponivel <= 0 THEN '❌ Cupom esgotado'
    ELSE '✅ Cupom válido'
  END as status
FROM coupons
WHERE code = 'TESTE-ATIVACAO';

-- 2. Verificar se o perfil existe
SELECT 
  'Verificação do Perfil' as etapa,
  id,
  user_id,
  name,
  account_type,
  plan_type,
  subscription_status,
  CASE 
    WHEN id IS NULL THEN '❌ Perfil não existe'
    ELSE '✅ Perfil existe'
  END as status
FROM user_profiles
WHERE id = '4186d746-5ac7-45fe-9c85-c83eaa97535e'::UUID;

-- 3. EXECUTAR FUNÇÃO E VER RESULTADO (IMPORTANTE!)
SELECT 
  'Resultado da Função' as info,
  activate_coupon_internal('TESTE-ATIVACAO', '4186d746-5ac7-45fe-9c85-c83eaa97535e'::UUID) as resultado_json;

-- 4. Verificar se o cupom foi atualizado
SELECT 
  'Cupom Após Execução' as info,
  code,
  current_uses,
  quantidade_disponivel,
  CASE 
    WHEN current_uses > 0 THEN '✅ ATIVADO'
    ELSE '❌ NÃO ATIVADO'
  END as status
FROM coupons
WHERE code = 'TESTE-ATIVACAO';

-- 5. Verificar se o perfil foi atualizado
SELECT 
  'Perfil Após Execução' as info,
  id,
  plan_type,
  subscription_status,
  CASE 
    WHEN plan_type = 'academy_starter' THEN '✅ ATUALIZADO'
    WHEN plan_type = 'free' THEN '❌ NÃO ATUALIZADO'
    ELSE '⚠️ ' || plan_type
  END as status
FROM user_profiles
WHERE id = '4186d746-5ac7-45fe-9c85-c83eaa97535e'::UUID;

-- 6. Análise detalhada (mostra tudo)
DO $$
DECLARE
  v_coupon RECORD;
  v_profile RECORD;
  v_result JSON;
  v_success BOOLEAN;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'ANÁLISE COMPLETA';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  
  -- Verificar cupom
  SELECT * INTO v_coupon FROM coupons WHERE code = 'TESTE-ATIVACAO';
  
  IF NOT FOUND THEN
    RAISE NOTICE '❌ CUPOM NÃO ENCONTRADO!';
    RETURN;
  END IF;
  
  RAISE NOTICE '✅ Cupom encontrado:';
  RAISE NOTICE '   ID: %', v_coupon.id;
  RAISE NOTICE '   Code: %', v_coupon.code;
  RAISE NOTICE '   Plan Linked: %', v_coupon.plan_linked;
  RAISE NOTICE '   Is Active: %', v_coupon.is_active;
  RAISE NOTICE '   Quantidade Disponível: %', v_coupon.quantidade_disponivel;
  RAISE NOTICE '   Current Uses: %', v_coupon.current_uses;
  RAISE NOTICE '';
  
  -- Verificar perfil
  SELECT * INTO v_profile FROM user_profiles WHERE id = '4186d746-5ac7-45fe-9c85-c83eaa97535e'::UUID;
  
  IF NOT FOUND THEN
    RAISE NOTICE '❌ PERFIL NÃO ENCONTRADO!';
    RETURN;
  END IF;
  
  RAISE NOTICE '✅ Perfil encontrado:';
  RAISE NOTICE '   ID: %', v_profile.id;
  RAISE NOTICE '   Account Type: %', v_profile.account_type;
  RAISE NOTICE '   Plan Type: %', v_profile.plan_type;
  RAISE NOTICE '';
  
  -- Executar função
  RAISE NOTICE '🔄 Executando função...';
  SELECT activate_coupon_internal('TESTE-ATIVACAO', '4186d746-5ac7-45fe-9c85-c83eaa97535e'::UUID) INTO v_result;
  
  v_success := (v_result->>'success')::BOOLEAN;
  
  RAISE NOTICE '';
  RAISE NOTICE '📋 RESULTADO:';
  RAISE NOTICE '%', v_result::TEXT;
  RAISE NOTICE '';
  
  IF v_success THEN
    RAISE NOTICE '✅ SUCESSO!';
  ELSE
    RAISE NOTICE '❌ FALHOU:';
    RAISE NOTICE '   Erro: %', v_result->>'error';
    RAISE NOTICE '   Mensagem: %', v_result->>'message';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  
END $$;

