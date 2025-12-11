-- ============================================
-- TESTE APÓS CORREÇÃO DA FUNÇÃO
-- ============================================

-- Profile ID: 4186d746-5ac7-45fe-9c85-c83eaa97535e
-- Cupom: TESTE-ATIVACAO

-- 1. Estado ANTES
SELECT 
  'Cupom ANTES' as info,
  code,
  current_uses,
  quantidade_disponivel
FROM coupons
WHERE code = 'TESTE-ATIVACAO';

SELECT 
  'Perfil ANTES' as info,
  id,
  plan_type,
  subscription_status,
  account_type
FROM user_profiles
WHERE id = '4186d746-5ac7-45fe-9c85-c83eaa97535e'::UUID;

-- 2. EXECUTAR ATIVAÇÃO
SELECT 
  'Resultado da Função' as info,
  activate_coupon_internal('TESTE-ATIVACAO', '4186d746-5ac7-45fe-9c85-c83eaa97535e'::UUID) as resultado;

-- 3. Estado DEPOIS - Cupom
SELECT 
  'Cupom DEPOIS' as info,
  code,
  current_uses,
  quantidade_disponivel,
  CASE 
    WHEN current_uses > 0 THEN '✅✅✅ ATIVADO ✅✅✅'
    ELSE '❌ NÃO ATIVADO'
  END as status
FROM coupons
WHERE code = 'TESTE-ATIVACAO';

-- 4. Estado DEPOIS - Perfil
SELECT 
  'Perfil DEPOIS' as info,
  id,
  plan_type,
  subscription_status,
  account_type,
  CASE 
    WHEN plan_type = 'academy_starter' THEN '✅✅✅ ATUALIZADO ✅✅✅'
    WHEN plan_type = 'free' THEN '❌ NÃO ATUALIZADO'
    ELSE '⚠️ ' || plan_type::TEXT
  END as status
FROM user_profiles
WHERE id = '4186d746-5ac7-45fe-9c85-c83eaa97535e'::UUID;

