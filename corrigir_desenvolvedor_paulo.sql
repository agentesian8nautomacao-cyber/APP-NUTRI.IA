-- ============================================
-- CORRIGIR DESENVOLVEDOR PAULO - SCRIPT SIMPLIFICADO
-- ============================================
-- Execute este script APÓS criar o usuário em Authentication → Users

-- Verificar se o usuário existe em auth.users
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users
WHERE email = 'paulohmorais@hotmail.com';

-- Se o resultado acima estiver vazio, você precisa criar o usuário primeiro:
-- 1. Vá em: Supabase Dashboard → Authentication → Users
-- 2. Clique em "Add User"
-- 3. Email: paulohmorais@hotmail.com
-- 4. Password: phm705412
-- 5. Auto Confirm User: ✅ (marcar)
-- 6. Clique em "Create User"
-- 7. Execute este script novamente

-- Criar ou atualizar perfil do desenvolvedor
DO $$
DECLARE
  v_user_id UUID;
  v_profile_id UUID;
BEGIN
  -- Buscar ID do usuário
  SELECT id INTO v_user_id 
  FROM auth.users 
  WHERE email = 'paulohmorais@hotmail.com' 
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE NOTICE 'ERRO: Usuário não encontrado em auth.users!';
    RAISE NOTICE 'Crie o usuário primeiro em Authentication → Users';
    RETURN;
  END IF;

  RAISE NOTICE 'Usuário encontrado: %', v_user_id;

  -- Verificar se perfil existe
  SELECT id INTO v_profile_id 
  FROM user_profiles 
  WHERE user_id = v_user_id 
  LIMIT 1;

  IF v_profile_id IS NULL THEN
    -- Criar perfil
    INSERT INTO user_profiles (
      user_id, name, age, gender, height, weight, activity_level, goal,
      meals_per_day, plan_type, subscription_status, subscription_expiry,
      voice_daily_limit_seconds, daily_free_minutes
    ) VALUES (
      v_user_id, 'Paulo Henrique', 30, 'Other', 175, 75, 'Moderate', 'General Health',
      3, 'monthly', 'active', (NOW() + INTERVAL '1 year')::TIMESTAMPTZ,
      900, 15
    )
    RETURNING id INTO v_profile_id;

    RAISE NOTICE 'Perfil criado: %', v_profile_id;
  ELSE
    -- Atualizar perfil existente
    UPDATE user_profiles
    SET 
      name = 'Paulo Henrique',
      plan_type = 'monthly',
      subscription_status = 'active',
      subscription_expiry = (NOW() + INTERVAL '1 year')::TIMESTAMPTZ,
      voice_daily_limit_seconds = 900,
      daily_free_minutes = 15
    WHERE id = v_profile_id;

    RAISE NOTICE 'Perfil atualizado: %', v_profile_id;
  END IF;

  RAISE NOTICE 'CONFIGURACAO COMPLETA!';
END $$;

-- Verificar resultado
SELECT 
  u.email,
  CASE WHEN u.email_confirmed_at IS NOT NULL THEN 'SIM' ELSE 'NAO' END as email_confirmado,
  up.name,
  up.plan_type,
  up.subscription_status,
  up.voice_daily_limit_seconds,
  up.daily_free_minutes
FROM auth.users u
LEFT JOIN user_profiles up ON up.user_id = u.id
WHERE u.email = 'paulohmorais@hotmail.com';

