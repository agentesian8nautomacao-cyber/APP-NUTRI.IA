-- ============================================
-- VERIFICAR IMPLEMENTAÇÃO COMPLETA
-- ============================================

-- 1. Verificar funções criadas
SELECT 
  '✅ Funções criadas' as status,
  routine_name,
  routine_type,
  routine_definition IS NOT NULL as has_definition
FROM information_schema.routines 
WHERE routine_name IN ('auto_renew_subscriptions', 'validate_b2b_coupon_availability')
ORDER BY routine_name;

-- 2. Verificar cron jobs
SELECT 
  '✅ Cron jobs' as status,
  jobid,
  jobname,
  schedule,
  active,
  nodename
FROM cron.job 
WHERE jobname = 'auto-renew-subscriptions';

-- 3. Testar função de validação B2B (com cupom de teste se existir)
SELECT 
  '🧪 Teste validação B2B' as status,
  validate_b2b_coupon_availability('TESTE-ATIVACAO') as resultado;

-- 4. Verificar permissões das funções
SELECT 
  '🔐 Permissões' as status,
  routine_name,
  routine_schema,
  security_type
FROM information_schema.routines 
WHERE routine_name IN ('auto_renew_subscriptions', 'validate_b2b_coupon_availability')
ORDER BY routine_name;

-- 5. Resumo final
SELECT 
  '📊 RESUMO FINAL' as info,
  (SELECT COUNT(*) FROM information_schema.routines 
   WHERE routine_name IN ('auto_renew_subscriptions', 'validate_b2b_coupon_availability')) as funcoes_criadas,
  (SELECT COUNT(*) FROM cron.job 
   WHERE jobname = 'auto-renew-subscriptions') as cron_jobs_ativos;

