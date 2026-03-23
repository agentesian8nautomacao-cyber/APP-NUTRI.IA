-- ============================================
-- CRON JOB: RENOVAÇÃO AUTOMÁTICA DE PLANOS
-- ============================================
-- Adiciona cron job para executar renovação automática diariamente

-- IMPORTANTE: Execute este script APÓS criar a função auto_renew_subscriptions()

-- Verificar se a extensão pg_cron está habilitada
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Agendar renovação automática (executa diariamente às 02:00 UTC / 23:00 BRT do dia anterior)
-- Verifica planos que expiram nos próximos 3 dias ou já expiraram
SELECT cron.schedule(
    'auto-renew-subscriptions',
    '0 2 * * *', -- 02:00 UTC (23:00 BRT do dia anterior)
    $$
    SELECT auto_renew_subscriptions();
    $$
);

-- Verificar cron jobs ativos
-- SELECT * FROM cron.job WHERE jobname = 'auto-renew-subscriptions';

-- Para remover o cron job (se necessário):
-- SELECT cron.unschedule('auto-renew-subscriptions');

