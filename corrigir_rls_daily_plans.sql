-- ============================================
-- CORRIGIR POLÍTICAS RLS PARA daily_plans
-- ============================================
-- Este script corrige as políticas RLS da tabela daily_plans
-- para garantir que todas usem auth.uid() corretamente

-- Remover políticas existentes
DROP POLICY IF EXISTS "Users can view own plans" ON daily_plans;
DROP POLICY IF EXISTS "Users can insert own plans" ON daily_plans;
DROP POLICY IF EXISTS "Users can update own plans" ON daily_plans;
DROP POLICY IF EXISTS "Users can delete own plans" ON daily_plans;

-- Criar políticas corretas com auth.uid()

-- SELECT: Usuários podem ver seus próprios planos
CREATE POLICY "Users can view own plans" ON daily_plans
FOR SELECT
USING (auth.uid() = user_id);

-- INSERT: Usuários podem inserir seus próprios planos
CREATE POLICY "Users can insert own plans" ON daily_plans
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE: Usuários podem atualizar seus próprios planos
CREATE POLICY "Users can update own plans" ON daily_plans
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- DELETE: Usuários podem deletar seus próprios planos
CREATE POLICY "Users can delete own plans" ON daily_plans
FOR DELETE
USING (auth.uid() = user_id);

-- Verificar políticas criadas
SELECT 
    tablename,
    policyname,
    cmd,
    CASE 
        WHEN qual::text LIKE '%auth.uid()%' OR with_check::text LIKE '%auth.uid()%' THEN '✅ Usa auth.uid()'
        ELSE '⚠️ Não usa auth.uid()'
    END as verifica_auth
FROM pg_policies 
WHERE tablename = 'daily_plans'
ORDER BY cmd;

