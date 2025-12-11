-- ============================================
-- DIAGNÓSTICO COMPLETO FINAL
-- ============================================

-- 1. Verificar cupom
SELECT 
  'Cupom' as info,
  id,
  code,
  plan_linked,
  is_active,
  quantidade_disponivel,
  current_uses
FROM coupons
WHERE code = 'TESTE-ATIVACAO';

-- 2. Verificar perfil ANTES
SELECT 
  'Perfil ANTES' as info,
  id,
  plan_type,
  subscription_status,
  account_type
FROM user_profiles
WHERE id = '4186d746-5ac7-45fe-9c85-c83eaa97535e'::UUID;

-- 3. EXECUTAR FUNÇÃO E MOSTRAR RESULTADO (IMPORTANTE!)
SELECT 
  activate_coupon_internal('TESTE-ATIVACAO', '4186d746-5ac7-45fe-9c85-c83eaa97535e'::UUID) as resultado_json;

-- 4. Análise detalhada do resultado
SELECT 
  (activate_coupon_internal('TESTE-ATIVACAO', '4186d746-5ac7-45fe-9c85-c83eaa97535e'::UUID)->>'success')::BOOLEAN as sucesso,
  activate_coupon_internal('TESTE-ATIVACAO', '4186d746-5ac7-45fe-9c85-c83eaa97535e'::UUID)->>'error' as erro,
  activate_coupon_internal('TESTE-ATIVACAO', '4186d746-5ac7-45fe-9c85-c83eaa97535e'::UUID)->>'message' as mensagem;

-- 5. Verificar cupom DEPOIS
SELECT 
  'Cupom DEPOIS' as info,
  code,
  current_uses,
  quantidade_disponivel
FROM coupons
WHERE code = 'TESTE-ATIVACAO';

-- 6. Verificar perfil DEPOIS
SELECT 
  'Perfil DEPOIS' as info,
  id,
  plan_type,
  subscription_status,
  account_type
FROM user_profiles
WHERE id = '4186d746-5ac7-45fe-9c85-c83eaa97535e'::UUID;

