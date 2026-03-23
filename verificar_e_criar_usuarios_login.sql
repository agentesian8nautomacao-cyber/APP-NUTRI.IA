-- ============================================
-- VERIFICAR E CRIAR USUÁRIOS COM PROBLEMA DE LOGIN
-- ============================================
-- Este script verifica se os usuários existem no Supabase Auth
-- e cria/atualiza os perfis se necessário

-- ============================================
-- 1. VERIFICAR SE OS USUÁRIOS EXISTEM NO AUTH
-- ============================================

-- Verificar usuário: oluaphms@hotmail.com
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN '✅ Email confirmado'
    ELSE '⚠️ Email NÃO confirmado'
  END as status_email
FROM auth.users
WHERE email = 'oluaphms@hotmail.com';

-- Verificar usuário: paulhenriquems7054@gmail.com
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN '✅ Email confirmado'
    ELSE '⚠️ Email NÃO confirmado'
  END as status_email
FROM auth.users
WHERE email = 'paulhenriquems7054@gmail.com';

-- ============================================
-- 2. VERIFICAR PERFIS DOS USUÁRIOS
-- ============================================

-- Verificar perfil de oluaphms@hotmail.com
SELECT 
  up.id,
  up.user_id,
  up.name,
  up.plan_type,
  up.subscription_status,
  au.email,
  au.email_confirmed_at
FROM user_profiles up
LEFT JOIN auth.users au ON up.user_id = au.id
WHERE au.email = 'oluaphms@hotmail.com';

-- Verificar perfil de paulhenriquems7054@gmail.com
SELECT 
  up.id,
  up.user_id,
  up.name,
  up.plan_type,
  up.subscription_status,
  au.email,
  au.email_confirmed_at
FROM user_profiles up
LEFT JOIN auth.users au ON up.user_id = au.id
WHERE au.email = 'paulhenriquems7054@gmail.com';

-- ============================================
-- 3. CRIAR/ATUALIZAR USUÁRIOS (SE NÃO EXISTIREM)
-- ============================================
-- NOTA: Você precisa criar os usuários manualmente no Supabase Dashboard
-- porque não podemos criar usuários diretamente via SQL no Supabase Auth
--
-- INSTRUÇÕES:
-- 1. Acesse: https://supabase.com/dashboard
-- 2. Vá em: Authentication → Users
-- 3. Clique em: "Add User" ou "Create User"
-- 4. Preencha:
--    - Email: oluaphms@hotmail.com
--    - Password: (a senha que o usuário quer usar)
--    - Auto Confirm User: ✅ (marcar esta opção)
-- 5. Repita para: paulhenriquems7054@gmail.com
--
-- OU use a API do Supabase para criar:
-- POST https://hflwyatppivyncocllnu.supabase.co/auth/v1/admin/users
-- Headers: {
--   "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY",
--   "Content-Type": "application/json"
-- }
-- Body: {
--   "email": "oluaphms@hotmail.com",
--   "password": "senha_desejada",
--   "email_confirm": true
-- }

-- ============================================
-- 4. ATUALIZAR PERFIS (APÓS CRIAR OS USUÁRIOS)
-- ============================================

-- Após criar os usuários no Supabase Auth, execute estas queries
-- para criar/atualizar os perfis:

-- Para oluaphms@hotmail.com
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Buscar ID do usuário
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'oluaphms@hotmail.com'
  LIMIT 1;
  
  IF v_user_id IS NOT NULL THEN
    -- Criar ou atualizar perfil
    INSERT INTO user_profiles (
      user_id,
      name,
      age,
      gender,
      height,
      weight,
      activity_level,
      goal,
      meals_per_day,
      plan_type,
      subscription_status,
      subscription_expiry,
      daily_free_minutes,
      voice_daily_limit_seconds
    ) VALUES (
      v_user_id,
      'Olua',
      30,
      'Other',
      170,
      70,
      'Light',
      'General Health',
      3,
      'free',
      'trial',
      (NOW() + INTERVAL '3 days')::TIMESTAMPTZ,
      5,
      300
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET
      name = EXCLUDED.name,
      plan_type = EXCLUDED.plan_type,
      subscription_status = EXCLUDED.subscription_status,
      subscription_expiry = EXCLUDED.subscription_expiry,
      daily_free_minutes = EXCLUDED.daily_free_minutes,
      voice_daily_limit_seconds = EXCLUDED.voice_daily_limit_seconds,
      updated_at = NOW();
    
    RAISE NOTICE '✅ Perfil criado/atualizado para oluaphms@hotmail.com';
  ELSE
    RAISE NOTICE '⚠️ Usuário oluaphms@hotmail.com não encontrado no auth.users. Crie o usuário primeiro!';
  END IF;
END $$;

-- Para paulhenriquems7054@gmail.com
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Buscar ID do usuário
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'paulhenriquems7054@gmail.com'
  LIMIT 1;
  
  IF v_user_id IS NOT NULL THEN
    -- Criar ou atualizar perfil
    INSERT INTO user_profiles (
      user_id,
      name,
      age,
      gender,
      height,
      weight,
      activity_level,
      goal,
      meals_per_day,
      plan_type,
      subscription_status,
      subscription_expiry,
      daily_free_minutes,
      voice_daily_limit_seconds
    ) VALUES (
      v_user_id,
      'Paulo',
      30,
      'Other',
      170,
      70,
      'Light',
      'General Health',
      3,
      'free',
      'trial',
      (NOW() + INTERVAL '3 days')::TIMESTAMPTZ,
      5,
      300
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET
      name = EXCLUDED.name,
      plan_type = EXCLUDED.plan_type,
      subscription_status = EXCLUDED.subscription_status,
      subscription_expiry = EXCLUDED.subscription_expiry,
      daily_free_minutes = EXCLUDED.daily_free_minutes,
      voice_daily_limit_seconds = EXCLUDED.voice_daily_limit_seconds,
      updated_at = NOW();
    
    RAISE NOTICE '✅ Perfil criado/atualizado para paulhenriquems7054@gmail.com';
  ELSE
    RAISE NOTICE '⚠️ Usuário paulhenriquems7054@gmail.com não encontrado no auth.users. Crie o usuário primeiro!';
  END IF;
END $$;

-- ============================================
-- 5. VERIFICAR RESULTADO FINAL
-- ============================================

SELECT 
  au.email,
  au.email_confirmed_at,
  CASE 
    WHEN au.email_confirmed_at IS NOT NULL THEN '✅ Email confirmado'
    ELSE '⚠️ Email NÃO confirmado'
  END as status_email,
  up.name,
  up.plan_type,
  up.subscription_status,
  up.subscription_expiry,
  CASE 
    WHEN up.subscription_status = 'trial' AND up.subscription_expiry > NOW() THEN '✅ Trial ativo'
    WHEN up.subscription_status = 'trial' AND up.subscription_expiry <= NOW() THEN '❌ Trial expirado'
    ELSE '✅ Status: ' || up.subscription_status
  END as status_trial
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.user_id
WHERE au.email IN ('oluaphms@hotmail.com', 'paulhenriquems7054@gmail.com')
ORDER BY au.email;

