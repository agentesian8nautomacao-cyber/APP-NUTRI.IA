-- ============================================
-- VERIFICAR ATIVAÇÃO COMPLETA
-- ============================================

-- 1. Verificar estado do cupom
SELECT 
  'Estado do Cupom' as info,
  code,
  current_uses,
  quantidade_disponivel,
  max_uses,
  is_active,
  plan_linked
FROM coupons
WHERE code = 'TESTE-ATIVACAO';

-- 2. Verificar perfil do usuário
SELECT 
  'Perfil do Usuário' as info,
  up.id as profile_id,
  up.user_id,
  au.email,
  up.name,
  up.plan_type,
  up.subscription_status,
  up.account_type,
  up.updated_at
FROM user_profiles up
LEFT JOIN auth.users au ON au.id = up.user_id
WHERE au.email = 'agentesian8nautomacao@gmail.com';

-- 3. Verificar vínculo cupom-usuário
SELECT 
  'Vínculo Cupom-Usuário' as info,
  ucl.id,
  ucl.user_id,
  ucl.coupon_id,
  c.code as coupon_code,
  ucl.created_at
FROM user_coupon_links ucl
JOIN coupons c ON c.id = ucl.coupon_id
JOIN auth.users au ON au.id = ucl.user_id
WHERE au.email = 'agentesian8nautomacao@gmail.com'
  AND c.code = 'TESTE-ATIVACAO';

