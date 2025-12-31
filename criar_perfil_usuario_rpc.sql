-- ============================================
-- FUNÇÃO RPC PARA CRIAR PERFIL DE USUÁRIO
-- ============================================
-- Esta função permite criar o perfil do usuário mesmo com RLS ativo
-- porque é executada com as permissões do usuário autenticado

CREATE OR REPLACE FUNCTION create_user_profile(
  p_user_id UUID,
  p_name TEXT,
  p_plan_type TEXT DEFAULT 'free',
  p_subscription_status TEXT DEFAULT 'trial',
  p_subscription_expiry TIMESTAMPTZ DEFAULT NULL,
  p_daily_free_minutes INTEGER DEFAULT 5
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER -- Executa com permissões do criador da função (bypass RLS)
AS $$
DECLARE
  v_profile_id UUID;
BEGIN
  -- Verificar se o perfil já existe
  SELECT id INTO v_profile_id
  FROM user_profiles
  WHERE user_id = p_user_id
  LIMIT 1;

  IF v_profile_id IS NOT NULL THEN
    -- Atualizar perfil existente
    UPDATE user_profiles
    SET
      name = COALESCE(p_name, name),
      plan_type = p_plan_type::plan_type,
      subscription_status = CASE 
        WHEN p_subscription_status::text = 'trial' THEN 'trial'::subscription_status
        WHEN p_subscription_status::text = 'active' THEN 'active'::subscription_status
        WHEN p_subscription_status::text = 'FREE' THEN 'FREE'::subscription_status
        WHEN p_subscription_status::text = 'PREMIUM_UNLIMITED' THEN 'PREMIUM_UNLIMITED'::subscription_status
        WHEN p_subscription_status::text = 'inactive' THEN 'inactive'::subscription_status
        WHEN p_subscription_status::text = 'expired' THEN 'expired'::subscription_status
        ELSE subscription_status -- Manter valor atual se inválido
      END,
      subscription_expiry = COALESCE(p_subscription_expiry, subscription_expiry),
      daily_free_minutes = COALESCE(p_daily_free_minutes, daily_free_minutes),
      updated_at = NOW()
    WHERE id = v_profile_id;
    
    RETURN v_profile_id;
  END IF;

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
    plan_type,
    subscription_status,
    subscription_expiry,
    daily_free_minutes,
    voice_daily_limit_seconds
  ) VALUES (
    p_user_id,
    p_name,
    30, -- Default age
    'Other', -- Default gender
    170, -- Default height
    70, -- Default weight
    'Light', -- Default activity_level
    'General Health', -- Default goal
    3, -- Default meals_per_day
    p_plan_type::plan_type,
    CASE 
      WHEN p_subscription_status::text = 'trial' THEN 'trial'::subscription_status
      WHEN p_subscription_status::text = 'active' THEN 'active'::subscription_status
      WHEN p_subscription_status::text = 'FREE' THEN 'FREE'::subscription_status
      WHEN p_subscription_status::text = 'PREMIUM_UNLIMITED' THEN 'PREMIUM_UNLIMITED'::subscription_status
      WHEN p_subscription_status::text = 'inactive' THEN 'inactive'::subscription_status
      WHEN p_subscription_status::text = 'expired' THEN 'expired'::subscription_status
      ELSE 'trial'::subscription_status -- Default para trial se inválido
    END,
    p_subscription_expiry,
    p_daily_free_minutes,
    CASE 
      WHEN p_subscription_status = 'trial' THEN 300 -- 5 minutos em segundos
      ELSE 900 -- 15 minutos em segundos
    END
  )
  RETURNING id INTO v_profile_id;

  RETURN v_profile_id;
END;
$$;

-- Comentário para documentação
COMMENT ON FUNCTION create_user_profile IS 'Cria ou atualiza o perfil do usuário. Bypassa RLS usando SECURITY DEFINER.';

