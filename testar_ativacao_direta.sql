-- ============================================
-- TESTAR ATIVAÇÃO DIRETA - VER RESULTADO JSON
-- ============================================

-- Executar função e ver resultado JSON completo
SELECT 
  activate_coupon_internal('TESTE-ATIVACAO', '4186d746-5ac7-45fe-9c85-c83eaa97535e'::UUID) as resultado;

-- Verificar cupom antes
SELECT 
  'ANTES' as momento,
  code,
  current_uses,
  quantidade_disponivel,
  max_uses,
  plan_linked
FROM coupons
WHERE code = 'TESTE-ATIVACAO';

-- Verificar perfil antes
SELECT 
  'ANTES' as momento,
  id,
  plan_type,
  subscription_status,
  account_type
FROM user_profiles
WHERE id = '4186d746-5ac7-45fe-9c85-c83eaa97535e';

