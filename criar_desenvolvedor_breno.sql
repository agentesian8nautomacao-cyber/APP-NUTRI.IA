-- ============================================
-- CRIAR DESENVOLVEDOR 1: BRENO
-- Email: 19brenobernardes@gmail.com
-- Senha: Centuryfox21!
-- ============================================

-- IMPORTANTE: Este script deve ser executado APÓS criar o usuário no Supabase Authentication
-- Passo 1: Criar usuário no Supabase Dashboard > Authentication > Users > Add User
-- Passo 2: Executar este script no SQL Editor

DO $$
DECLARE
    v_user_id UUID;
    v_profile_id UUID;
BEGIN
    -- 1. Buscar o ID do usuário criado no auth.users
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = '19brenobernardes@gmail.com'
    LIMIT 1;

    -- 2. Verificar se o usuário existe
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuário não encontrado em auth.users. Por favor, crie o usuário primeiro no Supabase Dashboard > Authentication > Users > Add User';
    END IF;

    RAISE NOTICE 'Usuário encontrado: %', v_user_id;

    -- 3. Verificar se já existe perfil
    SELECT id INTO v_profile_id
    FROM user_profiles
    WHERE user_id = v_user_id
    LIMIT 1;

    -- 4. Criar ou atualizar perfil do desenvolvedor
    IF v_profile_id IS NULL THEN
        -- Criar novo perfil
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

        RAISE NOTICE '✅ Perfil criado com sucesso: %', v_profile_id;
    ELSE
        -- Atualizar perfil existente
        UPDATE user_profiles
        SET
            name = 'Breno Bernardes',
            plan_type = 'monthly',
            subscription_status = 'active',
            subscription_expiry = (NOW() + INTERVAL '1 year')::TIMESTAMPTZ,
            voice_daily_limit_seconds = 900,
            daily_free_minutes = 15,
            updated_at = NOW()
        WHERE id = v_profile_id;

        RAISE NOTICE '✅ Perfil atualizado com sucesso: %', v_profile_id;
    END IF;

    -- 5. Mensagem de sucesso
    RAISE NOTICE '✅ Desenvolvedor Breno configurado com sucesso!';
    RAISE NOTICE '📧 Email: 19brenobernardes@gmail.com';
    RAISE NOTICE '🔑 Senha: Centuryfox21!';
    RAISE NOTICE '📊 Plano: monthly (active)';
    RAISE NOTICE '⏱️ Limite de voz: 15 minutos diários';

END $$;

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================
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
LEFT JOIN user_profiles up ON u.id = up.user_id
WHERE u.email = '19brenobernardes@gmail.com';

