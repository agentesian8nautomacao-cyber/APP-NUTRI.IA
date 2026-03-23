-- ============================================
-- VERIFICAR POLÍTICAS RLS
-- ============================================
-- Este script verifica se as políticas RLS estão configuradas corretamente

-- 1. Verificar políticas de user_profiles
SELECT 
  'user_profiles' as tabela,
  policyname,
  cmd as operacao,
  CASE 
    WHEN qual IS NOT NULL THEN 'USING: ' || qual::text
    ELSE 'Sem condição USING'
  END as condicao_using,
  CASE 
    WHEN with_check IS NOT NULL THEN 'WITH CHECK: ' || with_check::text
    ELSE 'Sem condição WITH CHECK'
  END as condicao_with_check
FROM pg_policies 
WHERE tablename = 'user_profiles'
ORDER BY cmd, policyname;

-- 2. Verificar políticas de user_surveys
SELECT 
  'user_surveys' as tabela,
  policyname,
  cmd as operacao,
  CASE 
    WHEN qual IS NOT NULL THEN 'USING: ' || qual::text
    ELSE 'Sem condição USING'
  END as condicao_using,
  CASE 
    WHEN with_check IS NOT NULL THEN 'WITH CHECK: ' || with_check::text
    ELSE 'Sem condição WITH CHECK'
  END as condicao_with_check
FROM pg_policies 
WHERE tablename = 'user_surveys'
ORDER BY cmd, policyname;

-- 3. Verificar se há políticas faltando
SELECT 
  'user_profiles' as tabela,
  'SELECT' as operacao_necessaria,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'user_profiles' AND cmd = 'SELECT'
    ) THEN '✅ Política existe'
    ELSE '❌ FALTA política SELECT'
  END as status
UNION ALL
SELECT 
  'user_profiles',
  'INSERT',
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'user_profiles' AND cmd = 'INSERT'
    ) THEN '✅ Política existe'
    ELSE '❌ FALTA política INSERT'
  END
UNION ALL
SELECT 
  'user_profiles',
  'UPDATE',
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'user_profiles' AND cmd = 'UPDATE'
    ) THEN '✅ Política existe'
    ELSE '❌ FALTA política UPDATE'
  END
UNION ALL
SELECT 
  'user_surveys',
  'SELECT',
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'user_surveys' AND cmd = 'SELECT'
    ) THEN '✅ Política existe'
    ELSE '❌ FALTA política SELECT'
  END
UNION ALL
SELECT 
  'user_surveys',
  'INSERT',
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'user_surveys' AND cmd = 'INSERT'
    ) THEN '✅ Política existe'
    ELSE '❌ FALTA política INSERT'
  END;

-- 4. Verificar se as políticas estão usando auth.uid() corretamente
SELECT 
  tablename,
  policyname,
  cmd,
  CASE 
    WHEN qual::text LIKE '%auth.uid()%' OR with_check::text LIKE '%auth.uid()%' THEN '✅ Usa auth.uid()'
    ELSE '⚠️ NÃO usa auth.uid()'
  END as verifica_auth
FROM pg_policies 
WHERE tablename IN ('user_profiles', 'user_surveys')
ORDER BY tablename, cmd;

