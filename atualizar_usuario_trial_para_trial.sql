-- ============================================
-- ATUALIZAR USUÁRIO TRIAL PARA subscription_status = 'trial'
-- ============================================
-- Este script atualiza usuários que estão com subscription_status = 'FREE'
-- mas deveriam estar com 'trial' (têm subscription_expiry definido)

-- Atualizar usuários FREE com subscription_expiry para 'trial'
UPDATE user_profiles
SET 
    subscription_status = 'trial',
    updated_at = NOW()
WHERE subscription_status = 'FREE'
  AND subscription_expiry IS NOT NULL
  AND subscription_expiry > NOW()
  AND plan_type = 'free';

-- Verificar resultado
SELECT
    'Usuários atualizados para trial' as status,
    COUNT(*) as total_atualizados
FROM user_profiles
WHERE subscription_status = 'trial'
  AND subscription_expiry IS NOT NULL
  AND subscription_expiry > NOW();

-- Mostrar usuários trial
SELECT
    u.email,
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
JOIN user_profiles up ON u.id = up.user_id
WHERE up.subscription_status = 'trial'
ORDER BY up.subscription_expiry DESC;

