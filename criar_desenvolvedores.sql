-- ============================================
-- CRIAR PERFIS DOS DESENVOLVEDORES
-- ============================================
-- Execute este script APÓS criar os usuários no Authentication do Supabase
-- Passo 1: Crie os usuários em Authentication → Users
-- Passo 2: Execute este script no SQL Editor

-- Desenvolvedor 1: 19brenobernardes@gmail.com
DO $$
DECLARE
  v_user_id UUID;
  v_profile_id UUID;
BEGIN
  -- Buscar ID do usuário pelo email
  SELECT id INTO v_user_id 
  FROM auth.users 
  WHERE email = '19brenobernardes@gmail.com' 
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE NOTICE '❌ Usuário 19brenobernardes@gmail.com não encontrado!';
    RAISE NOTICE '   Crie o usuário primeiro em: Authentication → Users → Add User';
    RAISE NOTICE '   Email: 19brenobernardes@gmail.com';
    RAISE NOTICE '   Password: Centuryfox21!';
    RAISE NOTICE '   Auto Confirm User: ✅ (marcar)';
    RETURN;
  END IF;

  RAISE NOTICE '✅ Usuário encontrado: %', v_user_id;

  -- Verificar se perfil já existe
  SELECT id INTO v_profile_id 
  FROM user_profiles 
  WHERE user_id = v_user_id 
  LIMIT 1;

  IF v_profile_id IS NULL THEN
    -- Criar perfil
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
      restrictions,
      medical_history,
      routine_description,
      food_preferences,
      streak,
      last_active_date,
      plan_type,
      subscription_status,
      subscription_expiry,
      voice_daily_limit_seconds,
      daily_free_minutes,
      voice_balance_upsell,
      cakto_customer_id,
      last_payment_date,
      payment_method
    ) VALUES (
      v_user_id,
      'Breno Bernardes',
      30,
      'Other',
      175,
      75,
      'Moderate',
      'General Health',
      3,
      '',
      '',
      '',
      '',
      0,
      NOW(),
      'monthly',
      'active',
      (NOW() + INTERVAL '1 year')::TIMESTAMPTZ,
      900,
      15,
      0,
      NULL,
      NULL,
      NULL
    )
    RETURNING id INTO v_profile_id;

    RAISE NOTICE '✅ Perfil criado para 19brenobernardes@gmail.com: %', v_profile_id;
  ELSE
    -- Atualizar perfil existente
    UPDATE user_profiles
    SET 
      plan_type = 'monthly',
      subscription_status = 'active',
      subscription_expiry = (NOW() + INTERVAL '1 year')::TIMESTAMPTZ,
      voice_daily_limit_seconds = 900,
      daily_free_minutes = 15
    WHERE id = v_profile_id;

    RAISE NOTICE '✅ Perfil atualizado para 19brenobernardes@gmail.com: %', v_profile_id;
  END IF;
END $$;

-- Desenvolvedor 2: paulohmorais@hotmail.com
DO $$
DECLARE
  v_user_id UUID;
  v_profile_id UUID;
BEGIN
  -- Buscar ID do usuário pelo email
  SELECT id INTO v_user_id 
  FROM auth.users 
  WHERE email = 'paulohmorais@hotmail.com' 
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE NOTICE '❌ Usuário paulohmorais@hotmail.com não encontrado!';
    RAISE NOTICE '   Crie o usuário primeiro em: Authentication → Users → Add User';
    RAISE NOTICE '   Email: paulohmorais@hotmail.com';
    RAISE NOTICE '   Password: phm705412';
    RAISE NOTICE '   Auto Confirm User: ✅ (marcar)';
    RETURN;
  END IF;

  RAISE NOTICE '✅ Usuário encontrado: %', v_user_id;

  -- Verificar se perfil já existe
  SELECT id INTO v_profile_id 
  FROM user_profiles 
  WHERE user_id = v_user_id 
  LIMIT 1;

  IF v_profile_id IS NULL THEN
    -- Criar perfil
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
      restrictions,
      medical_history,
      routine_description,
      food_preferences,
      streak,
      last_active_date,
      plan_type,
      subscription_status,
      subscription_expiry,
      voice_daily_limit_seconds,
      daily_free_minutes,
      voice_balance_upsell,
      cakto_customer_id,
      last_payment_date,
      payment_method
    ) VALUES (
      v_user_id,
      'Paulo Henrique',
      30,
      'Other',
      175,
      75,
      'Moderate',
      'General Health',
      3,
      '',
      '',
      '',
      '',
      0,
      NOW(),
      'monthly',
      'active',
      (NOW() + INTERVAL '1 year')::TIMESTAMPTZ,
      900,
      15,
      0,
      NULL,
      NULL,
      NULL
    )
    RETURNING id INTO v_profile_id;

    RAISE NOTICE '✅ Perfil criado para paulohmorais@hotmail.com: %', v_profile_id;
  ELSE
    -- Atualizar perfil existente
    UPDATE user_profiles
    SET 
      plan_type = 'monthly',
      subscription_status = 'active',
      subscription_expiry = (NOW() + INTERVAL '1 year')::TIMESTAMPTZ,
      voice_daily_limit_seconds = 900,
      daily_free_minutes = 15
    WHERE id = v_profile_id;

    RAISE NOTICE '✅ Perfil atualizado para paulohmorais@hotmail.com: %', v_profile_id;
  END IF;
END $$;

-- Verificar resultado
SELECT 
  u.email,
  u.email_confirmed_at,
  up.name,
  up.plan_type,
  up.subscription_status,
  up.subscription_expiry,
  up.voice_daily_limit_seconds,
  up.daily_free_minutes
FROM auth.users u
LEFT JOIN user_profiles up ON up.user_id = u.id
WHERE u.email IN ('19brenobernardes@gmail.com', 'paulohmorais@hotmail.com')
ORDER BY u.email;

