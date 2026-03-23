-- ============================================
-- VERIFICAR PERFIL DO USUÁRIO
-- ============================================

-- 1. Verificar qual é o user_id de auth.users para o email fornecido
-- (substitua pelo email do usuário que está testando)
SELECT 
  'auth.users' as tabela,
  id as user_id,
  email
FROM auth.users
WHERE email = 'agentesian8nautomacao@gmail.com';

-- 2. Verificar se existe perfil para esse user_id
SELECT 
  'user_profiles' as tabela,
  id as profile_id,
  user_id,
  name,
  plan_type,
  subscription_status,
  account_type
FROM user_profiles
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'agentesian8nautomacao@gmail.com'
);

-- 3. Verificar todos os perfis (para debug)
SELECT 
  up.id as profile_id,
  up.user_id,
  au.email,
  up.name,
  up.plan_type,
  up.subscription_status,
  up.account_type
FROM user_profiles up
LEFT JOIN auth.users au ON au.id = up.user_id
ORDER BY up.created_at DESC
LIMIT 5;

