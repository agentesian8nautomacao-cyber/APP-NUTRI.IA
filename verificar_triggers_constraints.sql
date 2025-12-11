-- ============================================
-- VERIFICAR TRIGGERS E CONSTRAINTS
-- ============================================

-- 1. Verificar triggers na tabela user_profiles
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'user_profiles'
ORDER BY trigger_name;

-- 2. Verificar constraints na tabela user_profiles
SELECT
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'user_profiles'::regclass
ORDER BY conname;

-- 3. Verificar se há funções de trigger que usam plan_type
SELECT 
  p.proname as function_name,
  pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND pg_get_functiondef(p.oid) LIKE '%plan_type%'
  AND pg_get_functiondef(p.oid) LIKE '%~~%';

