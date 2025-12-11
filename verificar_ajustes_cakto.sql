-- ============================================
-- VERIFICAÇÃO: Ajustes de Conformidade Cakto
-- ============================================
-- Execute este script para verificar se todas as alterações foram aplicadas corretamente

-- 1. Verificar se a tabela payment_history existe
SELECT 
    'payment_history' as tabela,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'payment_history'
        ) THEN '✅ EXISTE'
        ELSE '❌ NÃO EXISTE'
    END as status;

-- 2. Verificar colunas da tabela payment_history
SELECT 
    'payment_history' as tabela,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'payment_history'
ORDER BY ordinal_position;

-- 3. Verificar se os campos foram adicionados em user_profiles
SELECT 
    'user_profiles' as tabela,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'user_profiles'
    AND column_name IN ('cakto_customer_id', 'last_payment_date', 'payment_method')
ORDER BY column_name;

-- 4. Verificar índices criados
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN ('payment_history', 'user_profiles')
    AND indexname LIKE '%cakto%' 
    OR indexname LIKE '%payment%'
ORDER BY tablename, indexname;

-- 5. Verificar políticas RLS da payment_history
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'payment_history';

-- 6. Resumo final
SELECT 
    'RESUMO' as tipo,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'payment_history') as tabela_payment_history,
    (SELECT COUNT(*) FROM information_schema.columns 
     WHERE table_name = 'user_profiles' 
     AND column_name IN ('cakto_customer_id', 'last_payment_date', 'payment_method')) as campos_user_profiles,
    (SELECT COUNT(*) FROM pg_indexes 
     WHERE tablename IN ('payment_history', 'user_profiles')
     AND (indexname LIKE '%cakto%' OR indexname LIKE '%payment%')) as indices_criados;

