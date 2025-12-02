-- ============================================
-- NUTRI.IA - Sistema de Roles e Permissões
-- ============================================
-- Este script implementa o sistema de controle de acesso baseado em tipos de conta

-- ============================================
-- ENUM: Tipos de Conta
-- ============================================
CREATE TYPE account_type AS ENUM (
    'USER_B2C',      -- Usuário Comum (paga própria assinatura)
    'USER_GYM',      -- Aluno de Academia (vinculado a conta mãe)
    'USER_PERSONAL'  -- Personal Trainer (conta administrativa)
);

-- ============================================
-- ADICIONAR CAMPO account_type EM user_profiles
-- ============================================
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS account_type account_type DEFAULT 'USER_B2C';

-- ============================================
-- TABELA: Relacionamento Academia-Aluno
-- ============================================
-- Armazena o vínculo entre contas de academia (USER_PERSONAL) e alunos (USER_GYM)

CREATE TABLE IF NOT EXISTS gym_student_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gym_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    student_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(gym_user_id, student_user_id)
);

-- ============================================
-- ÍNDICES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_user_profiles_account_type 
ON user_profiles(account_type);

CREATE INDEX IF NOT EXISTS idx_gym_student_links_gym_user_id 
ON gym_student_links(gym_user_id);

CREATE INDEX IF NOT EXISTS idx_gym_student_links_student_user_id 
ON gym_student_links(student_user_id);

-- ============================================
-- FUNÇÃO: Verificar Status da Academia (Conta Pai)
-- ============================================
-- Retorna o status da academia vinculada ao aluno
-- Se a academia estiver inadimplente, bloqueia acesso

CREATE OR REPLACE FUNCTION check_gym_account_status(
    p_student_user_id UUID
)
RETURNS JSON AS $$
DECLARE
    v_gym_user_id UUID;
    v_gym_status TEXT;
    v_gym_subscription_status TEXT;
    v_result JSON;
BEGIN
    -- Buscar a academia vinculada ao aluno
    SELECT gym_user_id INTO v_gym_user_id
    FROM gym_student_links
    WHERE student_user_id = p_student_user_id
    LIMIT 1;
    
    IF v_gym_user_id IS NULL THEN
        -- Aluno não vinculado a nenhuma academia
        RETURN json_build_object(
            'has_access', true,
            'reason', 'not_linked',
            'message', 'Aluno não vinculado a academia'
        );
    END IF;
    
    -- Buscar status da academia
    SELECT 
        subscription_status,
        plan_type
    INTO v_gym_subscription_status, v_gym_status
    FROM user_profiles
    WHERE user_id = v_gym_user_id;
    
    -- Verificar se academia está ativa
    IF v_gym_subscription_status IS NULL 
       OR v_gym_subscription_status NOT IN ('active', 'PREMIUM_UNLIMITED') THEN
        -- Academia inadimplente ou inativa
        RETURN json_build_object(
            'has_access', false,
            'reason', 'gym_inactive',
            'message', 'Sua academia está com pagamento pendente. Contate sua academia.',
            'gym_user_id', v_gym_user_id
        );
    END IF;
    
    -- Academia está ativa
    RETURN json_build_object(
        'has_access', true,
        'reason', 'gym_active',
        'message', 'Acesso permitido',
        'gym_user_id', v_gym_user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNÇÃO: Obter Informações de Acesso do Usuário
-- ============================================
-- Retorna informações completas sobre permissões e acesso do usuário

CREATE OR REPLACE FUNCTION get_user_access_info(
    p_user_id UUID
)
RETURNS JSON AS $$
DECLARE
    v_profile RECORD;
    v_gym_status JSON;
    v_result JSON;
BEGIN
    -- Buscar perfil do usuário
    SELECT 
        account_type,
        subscription_status,
        plan_type
    INTO v_profile
    FROM user_profiles
    WHERE user_id = p_user_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'error', 'USER_NOT_FOUND'
        );
    END IF;
    
    -- Se for aluno de academia, verificar status da academia
    IF v_profile.account_type = 'USER_GYM' THEN
        SELECT check_gym_account_status(p_user_id) INTO v_gym_status;
        
        -- Se academia estiver inativa, bloquear acesso
        IF (v_gym_status->>'has_access')::boolean = false THEN
            RETURN json_build_object(
                'account_type', v_profile.account_type,
                'has_access', false,
                'block_reason', v_gym_status->>'reason',
                'block_message', v_gym_status->>'message',
                'can_use_voice', false,
                'can_use_chat', false,
                'can_log_meals', false,
                'can_access_progress', false,
                'can_access_dashboard', false,
                'redirect_to', 'blocked'
            );
        END IF;
    END IF;
    
    -- Construir resultado baseado no tipo de conta
    CASE v_profile.account_type
        WHEN 'USER_PERSONAL' THEN
            -- Personal Trainer: sem voz, sem chat, sem logs, sem dashboard, mas com progresso
            RETURN json_build_object(
                'account_type', 'USER_PERSONAL',
                'has_access', true,
                'can_use_voice', false,
                'can_use_chat', false,
                'can_log_meals', false,
                'can_access_progress', true,
                'can_access_dashboard', false,
                'redirect_to', 'progress'
            );
        WHEN 'USER_GYM' THEN
            -- Aluno de Academia: pode usar tudo exceto progresso
            RETURN json_build_object(
                'account_type', 'USER_GYM',
                'has_access', true,
                'can_use_voice', true,
                'can_use_chat', true,
                'can_log_meals', true,
                'can_access_progress', false,
                'can_access_dashboard', true,
                'redirect_to', 'dashboard'
            );
        WHEN 'USER_B2C' THEN
            -- Usuário Comum: pode usar tudo exceto progresso
            RETURN json_build_object(
                'account_type', 'USER_B2C',
                'has_access', true,
                'can_use_voice', true,
                'can_use_chat', true,
                'can_log_meals', true,
                'can_access_progress', false,
                'can_access_dashboard', true,
                'redirect_to', 'dashboard'
            );
        ELSE
            RETURN json_build_object(
                'error', 'INVALID_ACCOUNT_TYPE'
            );
    END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNÇÃO: Vincular Aluno a Academia
-- ============================================
CREATE OR REPLACE FUNCTION link_student_to_gym(
    p_gym_user_id UUID,
    p_student_user_id UUID
)
RETURNS JSON AS $$
DECLARE
    v_gym_type account_type;
    v_student_type account_type;
BEGIN
    -- Verificar se gym_user_id é USER_PERSONAL
    SELECT account_type INTO v_gym_type
    FROM user_profiles
    WHERE user_id = p_gym_user_id;
    
    IF v_gym_type != 'USER_PERSONAL' THEN
        RETURN json_build_object(
            'success', false,
            'error', 'INVALID_GYM_ACCOUNT',
            'message', 'O usuário fornecido não é uma conta de Personal Trainer'
        );
    END IF;
    
    -- Verificar se student_user_id é USER_GYM
    SELECT account_type INTO v_student_type
    FROM user_profiles
    WHERE user_id = p_student_user_id;
    
    IF v_student_type != 'USER_GYM' THEN
        RETURN json_build_object(
            'success', false,
            'error', 'INVALID_STUDENT_ACCOUNT',
            'message', 'O usuário fornecido não é uma conta de aluno'
        );
    END IF;
    
    -- Criar vínculo
    INSERT INTO gym_student_links (gym_user_id, student_user_id)
    VALUES (p_gym_user_id, p_student_user_id)
    ON CONFLICT (gym_user_id, student_user_id) DO NOTHING;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Aluno vinculado com sucesso'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGERS
-- ============================================
CREATE TRIGGER update_gym_student_links_updated_at 
BEFORE UPDATE ON gym_student_links
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNÇÃO: Validar Vínculo Academia-Aluno
-- ============================================
-- Valida que gym_user_id é USER_PERSONAL e student_user_id é USER_GYM
-- Esta validação será feita na função link_student_to_gym, não como constraint

-- Trigger para validar antes de inserir/atualizar
CREATE OR REPLACE FUNCTION validate_gym_student_link()
RETURNS TRIGGER AS $$
DECLARE
    v_gym_type account_type;
    v_student_type account_type;
BEGIN
    -- Verificar se gym_user_id é USER_PERSONAL
    SELECT account_type INTO v_gym_type
    FROM user_profiles
    WHERE user_id = NEW.gym_user_id;
    
    IF v_gym_type IS NULL OR v_gym_type != 'USER_PERSONAL' THEN
        RAISE EXCEPTION 'gym_user_id deve ser uma conta USER_PERSONAL. Tipo encontrado: %', COALESCE(v_gym_type::text, 'NULL');
    END IF;
    
    -- Verificar se student_user_id é USER_GYM
    SELECT account_type INTO v_student_type
    FROM user_profiles
    WHERE user_id = NEW.student_user_id;
    
    IF v_student_type IS NULL OR v_student_type != 'USER_GYM' THEN
        RAISE EXCEPTION 'student_user_id deve ser uma conta USER_GYM. Tipo encontrado: %', COALESCE(v_student_type::text, 'NULL');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger
CREATE TRIGGER validate_gym_student_link_trigger
BEFORE INSERT OR UPDATE ON gym_student_links
FOR EACH ROW
EXECUTE FUNCTION validate_gym_student_link();

-- ============================================
-- COMENTÁRIOS
-- ============================================
COMMENT ON COLUMN user_profiles.account_type IS 'Tipo de conta: USER_B2C (comum), USER_GYM (aluno academia), USER_PERSONAL (personal trainer)';
COMMENT ON TABLE gym_student_links IS 'Vínculo entre contas de academia (USER_PERSONAL) e alunos (USER_GYM)';
COMMENT ON FUNCTION check_gym_account_status(UUID) IS 'Verifica se a academia vinculada ao aluno está ativa';
COMMENT ON FUNCTION get_user_access_info(UUID) IS 'Retorna informações completas de permissões e acesso do usuário';
COMMENT ON FUNCTION link_student_to_gym(UUID, UUID) IS 'Vincula um aluno (USER_GYM) a uma academia (USER_PERSONAL)';

