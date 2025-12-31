-- ============================================
-- VERIFICAR USUÁRIO DE TRIAL
-- ============================================
-- Este script verifica se o usuário existe e está configurado corretamente

-- 1. Verificar se o usuário existe em auth.users
SELECT 
  'auth.users' as tabela,
  id,
  email,
  email_confirmed_at,
  created_at,
  CASE 
    WHEN email_confirmed_at IS NULL THEN '❌ Email não confirmado'
    ELSE '✅ Email confirmado'
  END as status_email
FROM auth.users
WHERE email = 'paulhenriquems7054@gmail.com';

-- 2. Verificar se o perfil existe em user_profiles
SELECT 
  'user_profiles' as tabela,
  id,
  user_id,
  name,
  plan_type,
  subscription_status,
  subscription_expiry,
  daily_free_minutes,
  voice_daily_limit_seconds,
  created_at,
  updated_at
FROM user_profiles
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'paulhenriquems7054@gmail.com'
);

-- 3. Verificar se há enquete respondida
SELECT 
  'user_surveys' as tabela,
  id,
  user_id,
  how_did_you_find_us,
  main_goal,
  experience,
  completed_at
FROM user_surveys
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'paulhenriquems7054@gmail.com'
);

-- 4. Verificar políticas RLS para este usuário
SELECT 
  'RLS Policies' as info,
  tablename,
  policyname,
  cmd,
  CASE 
    WHEN qual::text LIKE '%auth.uid()%' THEN '✅ Usa auth.uid()'
    ELSE '⚠️ Não usa auth.uid()'
  END as verifica_auth
FROM pg_policies 
WHERE tablename IN ('user_profiles', 'user_surveys', 'daily_plans')
ORDER BY tablename, cmd;

