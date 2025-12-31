-- ============================================
-- CRIAR/ATUALIZAR USUÁRIO TRIAL
-- ============================================
-- Este script cria ou atualiza o perfil do usuário trial
-- IMPORTANTE: O usuário deve existir em auth.users primeiro!
-- Se não existir, crie manualmente no Supabase Dashboard > Authentication > Users

DO $$
DECLARE
    v_user_id UUID;
    v_profile_id UUID;
BEGIN
    -- Buscar ID do usuário
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = 'paulhenriquems7054@gmail.com'
    LIMIT 1;

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuário não encontrado em auth.users. Por favor, crie o usuário primeiro no Supabase Dashboard > Authentication > Users > Add User com:
        - Email: paulhenriquems7054@gmail.com
        - Password: 123456
        - Auto Confirm User: ✅ (marcar)';
    END IF;

    RAISE NOTICE '✅ Usuário encontrado: %', v_user_id;

    -- Verificar se perfil já existe
    SELECT id INTO v_profile_id
    FROM user_profiles
    WHERE user_id = v_user_id
    LIMIT 1;

    IF v_profile_id IS NULL THEN
        -- Criar perfil de trial
        INSERT INTO user_profiles (
            user_id,
            name,
            age,
            gender,
            height,
            weight,
            activity_level,
            goal,
            restrictions,
            meals_per_day,
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
            'Usuário Trial',
            30,
            'Other',
            170.0,
            70.0,
            'Light',
            'General Health',
            '',
            3,
            '',
            '',
            '',
            0,
            NOW(),
            'free',
            'trial', -- Status trial (agora permitido na constraint)
            (NOW() + INTERVAL '3 days')::TIMESTAMPTZ, -- Trial de 3 dias
            300, -- 5 minutos (300 segundos)
            5, -- 5 minutos diários
            0,
            NULL,
            NULL,
            NULL
        )
        RETURNING id INTO v_profile_id;

        RAISE NOTICE '✅ Perfil criado para paulhenriquems7054@gmail.com: %', v_profile_id;
    ELSE
        -- Atualizar perfil existente para trial
        UPDATE user_profiles
        SET
            name = COALESCE(name, 'Usuário Trial'),
            plan_type = 'free',
            subscription_status = 'trial', -- Status trial (agora permitido na constraint)
            subscription_expiry = (NOW() + INTERVAL '3 days')::TIMESTAMPTZ,
            voice_daily_limit_seconds = 300,
            daily_free_minutes = 5,
            updated_at = NOW()
        WHERE id = v_profile_id;

        RAISE NOTICE '✅ Perfil atualizado para paulhenriquems7054@gmail.com: %', v_profile_id;
    END IF;
END $$;

-- Verificar resultado
SELECT
    'Resultado Final' as status,
    u.email,
    u.email_confirmed_at,
    CASE 
        WHEN u.email_confirmed_at IS NULL THEN '❌ Email não confirmado'
        ELSE '✅ Email confirmado'
    END as status_email,
    up.name,
    up.plan_type,
    up.subscription_status,
    up.subscription_expiry,
    up.voice_daily_limit_seconds,
    up.daily_free_minutes,
    CASE 
        WHEN up.subscription_expiry < NOW() THEN '❌ Trial expirado'
        ELSE '✅ Trial ativo'
    END as status_trial
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.user_id
WHERE u.email = 'paulhenriquems7054@gmail.com';

