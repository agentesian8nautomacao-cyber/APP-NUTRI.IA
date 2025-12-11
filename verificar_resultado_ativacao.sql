-- ============================================
-- VERIFICAR RESULTADO DA ATIVAÇÃO
-- ============================================
-- Usando o Profile ID: 4186d746-5ac7-45fe-9c85-c83eaa97535e

-- 1. Verificar estado atual do cupom
SELECT 
  'Estado do Cupom' as info,
  code,
  plan_linked,
  is_active,
  max_uses,
  current_uses,
  quantidade_disponivel,
  CASE 
    WHEN is_active = false THEN '❌ Inativo'
    WHEN quantidade_disponivel <= 0 THEN '❌ Esgotado'
    WHEN quantidade_disponivel > 0 THEN '✅ Disponível'
    ELSE '⚠️ Indefinido'
  END as status
FROM coupons
WHERE code = 'TESTE-ATIVACAO';

-- 2. Verificar perfil atual
SELECT 
  'Perfil Atual' as info,
  id,
  user_id,
  name,
  account_type,
  plan_type,
  subscription_status
FROM user_profiles
WHERE id = '4186d746-5ac7-45fe-9c85-c83eaa97535e'::UUID;

-- 3. EXECUTAR FUNÇÃO E MOSTRAR RESULTADO DIRETAMENTE
SELECT 
  'Resultado da Função' as info,
  activate_coupon_internal('TESTE-ATIVACAO', '4186d746-5ac7-45fe-9c85-c83eaa97535e'::UUID) as resultado_json;

-- 4. Verificar estado do cupom DEPOIS
SELECT 
  'Estado do Cupom DEPOIS' as info,
  code,
  current_uses,
  quantidade_disponivel,
  CASE 
    WHEN current_uses > 0 THEN '✅ ATIVADO'
    ELSE '❌ NÃO ATIVADO'
  END as status
FROM coupons
WHERE code = 'TESTE-ATIVACAO';

-- 5. Verificar perfil DEPOIS
SELECT 
  'Perfil DEPOIS' as info,
  id,
  plan_type,
  subscription_status,
  account_type,
  CASE 
    WHEN plan_type = 'academy_starter' THEN '✅ Plano atualizado'
    WHEN plan_type = 'free' THEN '❌ Plano não foi atualizado'
    ELSE '⚠️ Plano: ' || plan_type
  END as status_plano
FROM user_profiles
WHERE id = '4186d746-5ac7-45fe-9c85-c83eaa97535e'::UUID;

