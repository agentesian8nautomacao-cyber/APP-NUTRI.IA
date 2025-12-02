-- ============================================
-- NUTRI.IA - Sistema de Consumo de Voz com Prioridades
-- ============================================
-- Este script adiciona os campos necessários para o sistema de consumo
-- de voz baseado em prioridades (VIP > Gratuito > Boost > Reserva)

-- ============================================
-- ADICIONAR CAMPOS NA TABELA user_profiles
-- ============================================

-- Campos para saldos de voz
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS daily_free_minutes INTEGER DEFAULT 15 CHECK (daily_free_minutes >= 0),
ADD COLUMN IF NOT EXISTS boost_minutes_balance INTEGER DEFAULT 0 CHECK (boost_minutes_balance >= 0),
ADD COLUMN IF NOT EXISTS reserve_bank_balance INTEGER DEFAULT 0 CHECK (reserve_bank_balance >= 0),
ADD COLUMN IF NOT EXISTS boost_expiry TIMESTAMPTZ, -- Data/hora de expiração do boost (24h após compra)
ADD COLUMN IF NOT EXISTS subscription_expiry TIMESTAMPTZ; -- Data/hora de expiração do plano ilimitado

-- Atualizar subscription_status para incluir 'PREMIUM_UNLIMITED'
-- Se já existir um ENUM, precisamos recriar
DO $$ 
BEGIN
    -- Verificar se subscription_status já existe como coluna
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'subscription_status'
    ) THEN
        ALTER TABLE user_profiles 
        ADD COLUMN subscription_status TEXT DEFAULT 'FREE' 
        CHECK (subscription_status IN ('FREE', 'PREMIUM_UNLIMITED'));
    ELSE
        -- Se já existe, atualizar constraint para incluir PREMIUM_UNLIMITED
        ALTER TABLE user_profiles 
        DROP CONSTRAINT IF EXISTS user_profiles_subscription_status_check;
        
        ALTER TABLE user_profiles 
        ADD CONSTRAINT user_profiles_subscription_status_check 
        CHECK (subscription_status IN ('FREE', 'PREMIUM_UNLIMITED', 'active', 'inactive', 'expired'));
    END IF;
END $$;

-- Garantir que plan_type existe (caso não exista)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'plan_type'
    ) THEN
        ALTER TABLE user_profiles 
        ADD COLUMN plan_type TEXT DEFAULT 'free';
    END IF;
END $$;

-- ============================================
-- FUNÇÃO: Reset Diário de Minutos Gratuitos
-- ============================================
-- Esta função será chamada por um cron job diariamente às 00:00

CREATE OR REPLACE FUNCTION reset_daily_free_minutes()
RETURNS void AS $$
BEGIN
    UPDATE user_profiles
    SET daily_free_minutes = 15
    WHERE daily_free_minutes < 15; -- Só reseta se estiver abaixo de 15
    
    -- Log da operação (opcional)
    RAISE NOTICE 'Reset diário de minutos gratuitos executado em %', NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNÇÃO: Expirar Boost (Zerar boost_minutes_balance após 24h)
-- ============================================

CREATE OR REPLACE FUNCTION expire_boost_minutes()
RETURNS void AS $$
BEGIN
    UPDATE user_profiles
    SET boost_minutes_balance = 0,
        boost_expiry = NULL
    WHERE boost_expiry IS NOT NULL 
      AND boost_expiry < NOW()
      AND boost_minutes_balance > 0;
    
    RAISE NOTICE 'Boost minutes expirados executado em %', NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNÇÃO: Verificar e Consumir Tempo de Voz
-- ============================================
-- Esta função implementa a lógica de prioridades:
-- 1. VIP (PREMIUM_UNLIMITED ativo) - não desconta
-- 2. Gratuito (daily_free_minutes) - desconta primeiro
-- 3. Boost (boost_minutes_balance) - desconta segundo
-- 4. Reserva (reserve_bank_balance) - desconta terceiro

CREATE OR REPLACE FUNCTION consume_voice_time(
    p_user_id UUID,
    p_minutes INTEGER
)
RETURNS JSON AS $$
DECLARE
    v_profile RECORD;
    v_minutes_to_consume INTEGER;
    v_consumed_from_free INTEGER := 0;
    v_consumed_from_boost INTEGER := 0;
    v_consumed_from_reserve INTEGER := 0;
    v_result JSON;
BEGIN
    -- Buscar perfil do usuário
    SELECT 
        id,
        subscription_status,
        subscription_expiry,
        daily_free_minutes,
        boost_minutes_balance,
        boost_expiry,
        reserve_bank_balance
    INTO v_profile
    FROM user_profiles
    WHERE user_id = p_user_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'PROFILE_NOT_FOUND'
        );
    END IF;
    
    -- Verificar VIP (PREMIUM_UNLIMITED ativo)
    IF v_profile.subscription_status = 'PREMIUM_UNLIMITED' 
       AND v_profile.subscription_expiry IS NOT NULL 
       AND v_profile.subscription_expiry > NOW() THEN
        -- Usuário VIP: não desconta nada
        RETURN json_build_object(
            'success', true,
            'consumed_from', 'VIP',
            'remaining_free', v_profile.daily_free_minutes,
            'remaining_boost', v_profile.boost_minutes_balance,
            'remaining_reserve', v_profile.reserve_bank_balance,
            'is_vip', true
        );
    END IF;
    
    -- Reset diário de minutos gratuitos se necessário
    -- (Isso será feito pelo cron, mas verificamos aqui também)
    
    -- Verificar expiração do boost
    IF v_profile.boost_expiry IS NOT NULL 
       AND v_profile.boost_expiry < NOW() 
       AND v_profile.boost_minutes_balance > 0 THEN
        UPDATE user_profiles
        SET boost_minutes_balance = 0,
            boost_expiry = NULL
        WHERE id = v_profile.id;
        v_profile.boost_minutes_balance := 0;
    END IF;
    
    v_minutes_to_consume := p_minutes;
    
    -- 1. Consumir do Gratuito (daily_free_minutes)
    IF v_profile.daily_free_minutes > 0 AND v_minutes_to_consume > 0 THEN
        v_consumed_from_free := LEAST(v_profile.daily_free_minutes, v_minutes_to_consume);
        v_profile.daily_free_minutes := v_profile.daily_free_minutes - v_consumed_from_free;
        v_minutes_to_consume := v_minutes_to_consume - v_consumed_from_free;
    END IF;
    
    -- 2. Consumir do Boost (boost_minutes_balance)
    IF v_profile.boost_minutes_balance > 0 AND v_minutes_to_consume > 0 THEN
        v_consumed_from_boost := LEAST(v_profile.boost_minutes_balance, v_minutes_to_consume);
        v_profile.boost_minutes_balance := v_profile.boost_minutes_balance - v_consumed_from_boost;
        v_minutes_to_consume := v_minutes_to_consume - v_consumed_from_boost;
    END IF;
    
    -- 3. Consumir do Reserva (reserve_bank_balance)
    IF v_profile.reserve_bank_balance > 0 AND v_minutes_to_consume > 0 THEN
        v_consumed_from_reserve := LEAST(v_profile.reserve_bank_balance, v_minutes_to_consume);
        v_profile.reserve_bank_balance := v_profile.reserve_bank_balance - v_consumed_from_reserve;
        v_minutes_to_consume := v_minutes_to_consume - v_consumed_from_reserve;
    END IF;
    
    -- Se ainda falta tempo, bloqueia acesso
    IF v_minutes_to_consume > 0 THEN
        RETURN json_build_object(
            'success', false,
            'error', 'LIMIT_REACHED',
            'remaining_free', v_profile.daily_free_minutes,
            'remaining_boost', v_profile.boost_minutes_balance,
            'remaining_reserve', v_profile.reserve_bank_balance,
            'needed_minutes', v_minutes_to_consume
        );
    END IF;
    
    -- Atualizar saldos no banco
    UPDATE user_profiles
    SET 
        daily_free_minutes = v_profile.daily_free_minutes,
        boost_minutes_balance = v_profile.boost_minutes_balance,
        reserve_bank_balance = v_profile.reserve_bank_balance
    WHERE id = v_profile.id;
    
    -- Retornar resultado
    RETURN json_build_object(
        'success', true,
        'consumed_from_free', v_consumed_from_free,
        'consumed_from_boost', v_consumed_from_boost,
        'consumed_from_reserve', v_consumed_from_reserve,
        'remaining_free', v_profile.daily_free_minutes,
        'remaining_boost', v_profile.boost_minutes_balance,
        'remaining_reserve', v_profile.reserve_bank_balance
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNÇÕES: Atualizar Saldos Após Compra
-- ============================================

-- Adicionar Boost (Ajuda Rápida - R$ 5,00)
CREATE OR REPLACE FUNCTION add_boost_minutes(
    p_user_id UUID,
    p_minutes INTEGER DEFAULT 20
)
RETURNS JSON AS $$
DECLARE
    v_profile RECORD;
BEGIN
    SELECT id, boost_minutes_balance, boost_expiry
    INTO v_profile
    FROM user_profiles
    WHERE user_id = p_user_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'PROFILE_NOT_FOUND');
    END IF;
    
    -- Se já tem boost ativo, adiciona aos minutos restantes
    -- Se não tem ou expirou, cria novo boost com 24h de validade
    IF v_profile.boost_expiry IS NULL OR v_profile.boost_expiry < NOW() THEN
        UPDATE user_profiles
        SET 
            boost_minutes_balance = p_minutes,
            boost_expiry = NOW() + INTERVAL '24 hours'
        WHERE id = v_profile.id;
    ELSE
        UPDATE user_profiles
        SET boost_minutes_balance = boost_minutes_balance + p_minutes
        WHERE id = v_profile.id;
    END IF;
    
    RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Adicionar Minutos de Reserva (R$ 12,90)
CREATE OR REPLACE FUNCTION add_reserve_minutes(
    p_user_id UUID,
    p_minutes INTEGER DEFAULT 100
)
RETURNS JSON AS $$
DECLARE
    v_profile RECORD;
BEGIN
    SELECT id
    INTO v_profile
    FROM user_profiles
    WHERE user_id = p_user_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'PROFILE_NOT_FOUND');
    END IF;
    
    -- Acumulativo: adiciona aos minutos existentes
    UPDATE user_profiles
    SET reserve_bank_balance = reserve_bank_balance + p_minutes
    WHERE id = v_profile.id;
    
    RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ativar Conversa Ilimitada (R$ 19,90)
CREATE OR REPLACE FUNCTION activate_unlimited_subscription(
    p_user_id UUID,
    p_days INTEGER DEFAULT 30
)
RETURNS JSON AS $$
DECLARE
    v_profile RECORD;
BEGIN
    SELECT id
    INTO v_profile
    FROM user_profiles
    WHERE user_id = p_user_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'PROFILE_NOT_FOUND');
    END IF;
    
    UPDATE user_profiles
    SET 
        subscription_status = 'PREMIUM_UNLIMITED',
        subscription_expiry = NOW() + (p_days || ' days')::INTERVAL
    WHERE id = v_profile.id;
    
    RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_status 
ON user_profiles(subscription_status) 
WHERE subscription_status = 'PREMIUM_UNLIMITED';

CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_expiry 
ON user_profiles(subscription_expiry) 
WHERE subscription_expiry IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_profiles_boost_expiry 
ON user_profiles(boost_expiry) 
WHERE boost_expiry IS NOT NULL;

-- ============================================
-- COMENTÁRIOS
-- ============================================

COMMENT ON COLUMN user_profiles.daily_free_minutes IS 'Minutos gratuitos diários restantes. Resetável diariamente às 00:00.';
COMMENT ON COLUMN user_profiles.boost_minutes_balance IS 'Saldo do plano "Ajuda Rápida" (+20 min). Expira em 24h após compra.';
COMMENT ON COLUMN user_profiles.reserve_bank_balance IS 'Saldo do plano "Minutos de Reserva" (+100 min). Não expira.';
COMMENT ON COLUMN user_profiles.subscription_status IS 'Status da assinatura: FREE ou PREMIUM_UNLIMITED';
COMMENT ON COLUMN user_profiles.subscription_expiry IS 'Data/hora de validade do plano "Conversa Ilimitada"';
COMMENT ON COLUMN user_profiles.boost_expiry IS 'Data/hora de expiração do boost (24h após compra)';

COMMENT ON FUNCTION reset_daily_free_minutes() IS 'Reset diário de minutos gratuitos. Deve ser executado às 00:00 via cron job.';
COMMENT ON FUNCTION expire_boost_minutes() IS 'Expira boost minutes após 24h. Deve ser executado periodicamente.';
COMMENT ON FUNCTION consume_voice_time(UUID, INTEGER) IS 'Consome tempo de voz seguindo prioridades: VIP > Gratuito > Boost > Reserva';
COMMENT ON FUNCTION add_boost_minutes(UUID, INTEGER) IS 'Adiciona minutos de boost (Ajuda Rápida - R$ 5,00)';
COMMENT ON FUNCTION add_reserve_minutes(UUID, INTEGER) IS 'Adiciona minutos de reserva (R$ 12,90)';
COMMENT ON FUNCTION activate_unlimited_subscription(UUID, INTEGER) IS 'Ativa assinatura ilimitada (R$ 19,90)';

