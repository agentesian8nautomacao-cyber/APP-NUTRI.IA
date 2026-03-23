-- ============================================
-- NUTRI.IA - Cron Jobs para Reset Diário e Expiração
-- ============================================
-- Este script configura os cron jobs no Supabase para:
-- 1. Reset diário de minutos gratuitos (00:00)
-- 2. Expiração de boost minutes (verificação periódica)

-- IMPORTANTE: Para executar cron jobs no Supabase, você precisa:
-- 1. Habilitar a extensão pg_cron no seu projeto
-- 2. Executar estes comandos com permissões de superuser ou service_role

-- ============================================
-- HABILITAR EXTENSÃO pg_cron
-- ============================================
-- Execute este comando primeiro (pode precisar de permissões especiais)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ============================================
-- CRON JOB 1: Reset Diário de Minutos Gratuitos
-- ============================================
-- Executa todos os dias às 00:00 (horário UTC)
-- Para ajustar o horário, modifique o schedule:
-- - '0 0 * * *' = 00:00 UTC diariamente
-- - '0 3 * * *' = 03:00 UTC (00:00 BRT)
-- - '0 0 * * 0' = 00:00 UTC todo domingo

SELECT cron.schedule(
    'reset-daily-free-minutes',
    '0 3 * * *', -- 00:00 BRT (03:00 UTC)
    $$
    SELECT reset_daily_free_minutes();
    $$
);

-- ============================================
-- CRON JOB 2: Expirar Boost Minutes
-- ============================================
-- Executa a cada hora para verificar e expirar boost minutes
-- Isso garante que boosts expirados sejam removidos rapidamente

SELECT cron.schedule(
    'expire-boost-minutes',
    '0 * * * *', -- A cada hora
    $$
    SELECT expire_boost_minutes();
    $$
);

-- ============================================
-- VERIFICAR CRON JOBS ATIVOS
-- ============================================
-- Execute esta query para ver todos os cron jobs agendados:
-- SELECT * FROM cron.job;

-- ============================================
-- REMOVER CRON JOBS (se necessário)
-- ============================================
-- Para remover um cron job específico:
-- SELECT cron.unschedule('reset-daily-free-minutes');
-- SELECT cron.unschedule('expire-boost-minutes');

-- ============================================
-- NOTA SOBRE HORÁRIOS
-- ============================================
-- O Supabase usa UTC por padrão. Se você quiser que o reset
-- aconteça à meia-noite no horário local (BRT), use:
-- '0 3 * * *' (03:00 UTC = 00:00 BRT)
--
-- Para outros fusos horários:
-- - EST (UTC-5): '0 5 * * *'
-- - PST (UTC-8): '0 8 * * *'
-- - CET (UTC+1): '0 23 * * *' (dia anterior)

