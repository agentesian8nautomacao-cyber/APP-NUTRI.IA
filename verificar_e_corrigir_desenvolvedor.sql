-- ============================================
-- VERIFICAR E CORRIGIR DESENVOLVEDOR PAULO
-- ============================================
-- Este script verifica se o usuário existe em auth.users
-- e cria/atualiza se necessário

-- 1. Verificar se o usuário existe em auth.users
SELECT 
  'Verificação em auth.users' as tipo,
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users
WHERE email = 'paulohmorais@hotmail.com';

-- 2. Verificar se o perfil existe
SELECT 
  'Verificação em user_profiles' as tipo,
  up.id,
  up.user_id,
  up.name,
  up.plan_type,
  up.subscription_status
FROM user_profiles up
WHERE up.user_id IN (
  SELECT id FROM auth.users WHERE email = 'paulohmorais@hotmail.com'
);

-- 3. Se o usuário NÃO existir em auth.users, você precisa criá-lo manualmente:
--    Vá em: Supabase Dashboard → Authentication → Users → Add User
--    Email: paulohmorais@hotmail.com
--    Password: phm705412
--    Auto Confirm User: ✅ (marcar)
--    Clique em "Create User"

-- 4. Após criar o usuário, execute este script para garantir que o perfil está correto:
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
    RAISE NOTICE '❌ ERRO: Usuário paulohmorais@hotmail.com NÃO encontrado em auth.users!';
    RAISE NOTICE '';
    RAISE NOTICE 'SOLUÇÃO:';
    RAISE NOTICE '1. Vá em: Supabase Dashboard → Authentication → Users';
    RAISE NOTICE '2. Clique em "Add User" ou "Create User"';
    RAISE NOTICE '3. Preencha:';
    RAISE NOTICE '   - Email: paulohmorais@hotmail.com';
    RAISE NOTICE '   - Password: phm705412';
    RAISE NOTICE '   - Auto Confirm User: ✅ (marcar)';
    RAISE NOTICE '4. Clique em "Create User"';
    RAISE NOTICE '5. Execute este script novamente';
    RETURN;
  END IF;

  RAISE NOTICE '✅ Usuário encontrado em auth.users: %', v_user_id;

  -- Verificar se perfil existe
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

    RAISE NOTICE '✅ Perfil criado: %', v_profile_id;
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

    RAISE NOTICE '✅ Perfil atualizado: %', v_profile_id;
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '✅✅✅ CONFIGURAÇÃO COMPLETA ✅✅✅';
  RAISE NOTICE 'O desenvolvedor Paulo está pronto para fazer login!';
END $$;

-- 5. Verificar resultado final
SELECT 
  u.email,
  u.email_confirmed_at IS NOT NULL as email_confirmado,
  up.name,
  up.plan_type,
  up.subscription_status,
  up.voice_daily_limit_seconds,
  up.daily_free_minutes
FROM auth.users u
LEFT JOIN user_profiles up ON up.user_id = u.id
WHERE u.email = 'paulohmorais@hotmail.com';

