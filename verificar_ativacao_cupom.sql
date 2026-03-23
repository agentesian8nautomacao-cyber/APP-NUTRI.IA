-- ============================================
-- VERIFICAÇÃO DA IMPLEMENTAÇÃO DE ATIVAÇÃO DE CUPOM
-- ============================================
-- Execute este script para verificar se todos os componentes
-- da funcionalidade de ativação de cupom foram criados corretamente

-- 1. Verificar se o campo quantidade_disponivel existe
SELECT 
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'coupons'
  AND column_name = 'quantidade_disponivel';

-- 2. Verificar se a função activate_coupon_internal existe
SELECT 
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'activate_coupon_internal';

-- 3. Verificar se o trigger existe
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name = 'trigger_update_quantidade_disponivel';

-- 4. Verificar se a função do trigger existe
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'update_quantidade_disponivel';

-- 5. Verificar permissões da função (método alternativo)
SELECT 
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as arguments,
  CASE 
    WHEN p.proacl IS NULL THEN 'Default permissions (public)'
    ELSE 'Custom permissions set'
  END as permissions_info
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname = 'activate_coupon_internal';

-- 6. Verificar valores de quantidade_disponivel em cupons existentes
SELECT 
  code,
  max_uses,
  current_uses,
  quantidade_disponivel,
  CASE 
    WHEN quantidade_disponivel IS NULL THEN '❌ NULL (precisa atualizar)'
    WHEN quantidade_disponivel = GREATEST(0, max_uses - current_uses) THEN '✅ Correto'
    ELSE '⚠️ Inconsistente'
  END as status
FROM coupons
ORDER BY code
LIMIT 10;

-- 7. Resumo de verificação
SELECT 
  'Campo quantidade_disponivel' as componente,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'coupons' AND column_name = 'quantidade_disponivel'
    ) THEN '✅ Criado'
    ELSE '❌ Não encontrado'
  END as status
UNION ALL
SELECT 
  'Função activate_coupon_internal' as componente,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.routines 
      WHERE routine_name = 'activate_coupon_internal'
    ) THEN '✅ Criada'
    ELSE '❌ Não encontrada'
  END as status
UNION ALL
SELECT 
  'Trigger trigger_update_quantidade_disponivel' as componente,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.triggers 
      WHERE trigger_name = 'trigger_update_quantidade_disponivel'
    ) THEN '✅ Criado'
    ELSE '❌ Não encontrado'
  END as status
UNION ALL
SELECT 
  'Função update_quantidade_disponivel' as componente,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.routines 
      WHERE routine_name = 'update_quantidade_disponivel'
    ) THEN '✅ Criada'
    ELSE '❌ Não encontrada'
  END as status;

