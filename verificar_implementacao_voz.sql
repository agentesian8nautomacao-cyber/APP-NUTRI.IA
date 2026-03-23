-- ============================================
-- VERIFICAÇÃO: Sistema de Consumo de Voz
-- ============================================
-- Este script verifica se todos os componentes foram criados corretamente

-- 1. Verificar campos na tabela user_profiles
SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'user_profiles' 
AND column_name IN (
    'daily_free_minutes',
    'boost_minutes_balance',
    'reserve_bank_balance',
    'boost_expiry',
    'subscription_expiry',
    'subscription_status'
)
ORDER BY column_name;

-- 2. Verificar funções SQL criadas
SELECT 
    routine_name,
    routine_type,
    data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
    'consume_voice_time',
    'reset_daily_free_minutes',
    'expire_boost_minutes',
    'add_boost_minutes',
    'add_reserve_minutes',
    'activate_unlimited_subscription'
)
ORDER BY routine_name;

-- 3. Verificar constraints
SELECT 
    constraint_name,
    constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'user_profiles'
AND constraint_name LIKE '%subscription_status%'
OR constraint_name LIKE '%voice%'
OR constraint_name LIKE '%boost%'
OR constraint_name LIKE '%reserve%'
OR constraint_name LIKE '%free%';

-- 4. Verificar índices
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'user_profiles'
AND (
    indexname LIKE '%subscription%'
    OR indexname LIKE '%boost%'
    OR indexname LIKE '%voice%'
);

-- 5. Testar função de consumo (substitua 'seu-user-id' por um ID real)
-- SELECT consume_voice_time('seu-user-id'::uuid, 1);

-- 6. Verificar dados de exemplo (se houver)
SELECT 
    user_id,
    daily_free_minutes,
    boost_minutes_balance,
    reserve_bank_balance,
    subscription_status,
    boost_expiry,
    subscription_expiry
FROM user_profiles
LIMIT 5;

