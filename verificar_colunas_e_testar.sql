-- ============================================
-- VERIFICAR COLUNAS E TESTAR ATIVAÇÃO
-- ============================================

-- 1. Verificar se as colunas existem
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'user_profiles'
  AND column_name IN ('plan_type', 'subscription_status', 'account_type')
ORDER BY column_name;

-- 2. Verificar cupom
SELECT 
  'Cupom' as info,
  code,
  plan_linked,
  is_active,
  quantidade_disponivel,
  current_uses
FROM coupons
WHERE code = 'TESTE-ATIVACAO';

-- 3. EXECUTAR FUNÇÃO E VER RESULTADO (IMPORTANTE - COMPARTILHE ESTE RESULTADO!)
SELECT 
  activate_coupon_internal('TESTE-ATIVACAO', '4186d746-5ac7-45fe-9c85-c83eaa97535e'::UUID) as resultado;

-- 4. Verificar perfil depois
SELECT 
  id,
  plan_type,
  subscription_status,
  account_type
FROM user_profiles
WHERE id = '4186d746-5ac7-45fe-9c85-c83eaa97535e'::UUID;

-- 5. Verificar cupom depois
SELECT 
  code,
  current_uses,
  quantidade_disponivel
FROM coupons
WHERE code = 'TESTE-ATIVACAO';

