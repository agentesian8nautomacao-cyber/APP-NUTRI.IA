-- ============================================
-- CORRIGIR POLÍTICAS RLS PARA user_surveys
-- ============================================
-- Este script corrige as políticas RLS para a tabela de enquetes

-- 1. Habilitar RLS (se não estiver habilitado)
ALTER TABLE user_surveys ENABLE ROW LEVEL SECURITY;

-- 2. Remover políticas antigas (se existirem)
DROP POLICY IF EXISTS "Users can view own survey" ON user_surveys;
DROP POLICY IF EXISTS "Users can insert own survey" ON user_surveys;
DROP POLICY IF EXISTS "Users can update own survey" ON user_surveys;

-- 3. Criar políticas corretas

-- Política para SELECT (visualizar própria enquete)
CREATE POLICY "Users can view own survey" 
ON user_surveys
FOR SELECT
USING (auth.uid() = user_id);

-- Política para INSERT (criar própria enquete)
CREATE POLICY "Users can insert own survey" 
ON user_surveys
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Política para UPDATE (atualizar própria enquete) - opcional
CREATE POLICY "Users can update own survey" 
ON user_surveys
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. Verificar se as políticas foram criadas
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'user_surveys'
ORDER BY policyname;

-- 5. Verificar se RLS está habilitado
SELECT 
  tablename,
  rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE tablename = 'user_surveys';

