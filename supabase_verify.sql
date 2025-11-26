-- ============================================
-- SCRIPT DE VERIFICAÇÃO DO BANCO DE DADOS
-- ============================================
-- Execute este script para verificar se tudo foi criado corretamente

-- 1. Verificar se todas as tabelas foram criadas
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 2. Verificar se os ENUMs foram criados
SELECT 
    t.typname as enum_name,
    array_agg(e.enumlabel ORDER BY e.enumsortorder) as enum_values
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname IN ('activity_level', 'goal_type', 'gender_type', 'meal_type', 'mood_type', 'challenge_status', 'article_category')
GROUP BY t.typname
ORDER BY t.typname;

-- 3. Verificar se os índices foram criados
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
    AND tablename IN (
        'user_profiles', 'daily_plans', 'daily_plan_meals', 
        'meal_items', 'daily_logs', 'scan_history', 
        'chat_messages', 'wellness_tracking', 'wellness_habits',
        'user_challenges', 'progress_entries'
    )
ORDER BY tablename, indexname;

-- 4. Verificar se as políticas RLS foram criadas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 5. Verificar se os triggers foram criados
SELECT 
    trigger_name,
    event_object_table,
    action_statement,
    action_timing,
    event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- 6. Verificar dados iniciais (seed data)
SELECT 'Challenges' as table_name, COUNT(*) as count FROM challenges
UNION ALL
SELECT 'Articles' as table_name, COUNT(*) as count FROM articles;

-- 7. Verificar estrutura de uma tabela principal (exemplo: user_profiles)
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'user_profiles'
ORDER BY ordinal_position;

