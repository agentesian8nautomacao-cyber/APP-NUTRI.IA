-- ============================================
-- CORRIGIR TODAS AS POLÍTICAS RLS
-- ============================================
-- Este script corrige TODAS as políticas RLS que não usam auth.uid()
-- Execute este script para garantir que todas as políticas estejam corretas

-- ============================================
-- 1. CORRIGIR daily_plans
-- ============================================

-- Remover políticas existentes
DROP POLICY IF EXISTS "Users can view own plans" ON daily_plans;
DROP POLICY IF EXISTS "Users can insert own plans" ON daily_plans;
DROP POLICY IF EXISTS "Users can update own plans" ON daily_plans;
DROP POLICY IF EXISTS "Users can delete own plans" ON daily_plans;

-- Criar políticas corretas
CREATE POLICY "Users can view own plans" ON daily_plans
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own plans" ON daily_plans
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plans" ON daily_plans
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own plans" ON daily_plans
FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- 2. CORRIGIR user_profiles
-- ============================================

-- Remover políticas existentes
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON user_profiles;

-- Criar políticas corretas
CREATE POLICY "Users can view own profile" ON user_profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile" ON user_profiles
FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- 3. CORRIGIR user_surveys
-- ============================================

-- Remover políticas existentes
DROP POLICY IF EXISTS "Users can view own survey" ON user_surveys;
DROP POLICY IF EXISTS "Users can insert own survey" ON user_surveys;
DROP POLICY IF EXISTS "Users can update own survey" ON user_surveys;

-- Criar políticas corretas
CREATE POLICY "Users can view own survey" ON user_surveys
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own survey" ON user_surveys
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own survey" ON user_surveys
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 4. VERIFICAR RESULTADO
-- ============================================

SELECT 
    'Resultado Final' as status,
    tablename,
    policyname,
    cmd,
    CASE 
        WHEN qual::text LIKE '%auth.uid()%' OR with_check::text LIKE '%auth.uid()%' THEN '✅ Usa auth.uid()'
        ELSE '⚠️ Não usa auth.uid()'
    END as verifica_auth
FROM pg_policies 
WHERE tablename IN ('daily_plans', 'user_profiles', 'user_surveys')
ORDER BY tablename, cmd;

