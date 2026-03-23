-- ============================================
-- CORRIGIR POLÍTICAS RLS PARA user_profiles
-- ============================================
-- Este script corrige as políticas RLS que podem estar causando erro 406

-- 1. Habilitar RLS (se não estiver habilitado)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 2. Remover políticas antigas (se existirem)
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON user_profiles;

-- 3. Criar políticas corretas

-- Política para SELECT (visualizar próprio perfil)
CREATE POLICY "Users can view own profile" 
ON user_profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Política para INSERT (criar próprio perfil)
CREATE POLICY "Users can insert own profile" 
ON user_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Política para UPDATE (atualizar próprio perfil)
CREATE POLICY "Users can update own profile" 
ON user_profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Política para DELETE (deletar próprio perfil) - opcional
CREATE POLICY "Users can delete own profile" 
ON user_profiles
FOR DELETE
USING (auth.uid() = user_id);

-- 4. Verificar se as políticas foram criadas
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'user_profiles'
ORDER BY policyname;

-- 5. Verificar se RLS está habilitado
SELECT 
  tablename,
  rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE tablename = 'user_profiles';

