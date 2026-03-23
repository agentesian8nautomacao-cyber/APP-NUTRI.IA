-- ============================================
-- CRIAR USUÁRIO DE TESTE PARA LOGIN
-- ============================================
-- Este script cria um usuário de teste no Supabase Auth
-- que pode ser usado para testar o login no app

-- ============================================
-- IMPORTANTE: Você precisa criar o usuário via Dashboard ou API
-- ============================================
-- O Supabase não permite criar usuários diretamente via SQL no auth.users
-- Use uma das opções abaixo:

-- ============================================
-- OPÇÃO 1: Via Supabase Dashboard (RECOMENDADO)
-- ============================================
-- 1. Acesse: https://supabase.com/dashboard
-- 2. Vá em: Authentication → Users
-- 3. Clique em: "Add User" ou "Create User"
-- 4. Preencha:
--    - Email: teste@nutriai.com
--    - Password: Teste123456
--    - Auto Confirm User: ✅ (MARCAR ESTA OPÇÃO!)
-- 5. Clique em: "Create User"

-- ============================================
-- OPÇÃO 2: Via API (usando Service Role Key)
-- ============================================
-- Execute este comando no terminal (substitua YOUR_SERVICE_ROLE_KEY):
--
-- curl -X POST 'https://hflwyatppivyncocllnu.supabase.co/auth/v1/admin/users' \
--   -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
--   -H "Content-Type: application/json" \
--   -d '{
--     "email": "teste@nutriai.com",
--     "password": "Teste123456",
--     "email_confirm": true
--   }'

-- ============================================
-- APÓS CRIAR O USUÁRIO, EXECUTE ESTE SCRIPT
-- ============================================

-- 1. Verificar se o usuário foi criado
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN '✅ Email confirmado'
    ELSE '⚠️ Email NÃO confirmado - LOGIN NÃO FUNCIONARÁ!'
  END as status_email
FROM auth.users
WHERE email = 'teste@nutriai.com';

-- 2. Criar/Atualizar perfil do usuário
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Buscar ID do usuário
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'teste@nutriai.com'
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
      'Usuário Teste',
      30,
      'Other',
      170,
      70,
      'Light',
      'General Health',
      3,
      'free',
      'trial',
      (NOW() + INTERVAL '7 days')::TIMESTAMPTZ,
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
    
    RAISE NOTICE '✅ Perfil criado/atualizado para teste@nutriai.com';
  ELSE
    RAISE NOTICE '⚠️ Usuário teste@nutriai.com não encontrado no auth.users. Crie o usuário primeiro via Dashboard!';
  END IF;
END $$;

-- 3. Verificar resultado final
SELECT 
  au.email,
  au.email_confirmed_at,
  CASE 
    WHEN au.email_confirmed_at IS NOT NULL THEN '✅ Email confirmado - LOGIN FUNCIONARÁ'
    ELSE '❌ Email NÃO confirmado - LOGIN NÃO FUNCIONARÁ'
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
WHERE au.email = 'teste@nutriai.com';

-- ============================================
-- CREDENCIAIS DE TESTE
-- ============================================
-- Email: teste@nutriai.com
-- Senha: Teste123456
-- 
-- Use estas credenciais para testar o login no app!

