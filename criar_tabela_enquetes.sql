-- ============================================
-- CRIAR TABELA DE ENQUETES
-- ============================================
-- Execute este script no Supabase SQL Editor para criar a tabela de enquetes

-- Criar tabela user_surveys
CREATE TABLE IF NOT EXISTS user_surveys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    how_did_you_find_us TEXT NOT NULL,
    main_goal TEXT NOT NULL,
    experience TEXT NOT NULL,
    feedback TEXT,
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_user_surveys_user_id ON user_surveys(user_id);

-- Adicionar comentários
COMMENT ON TABLE user_surveys IS 'Armazena respostas das enquetes dos usuários';
COMMENT ON COLUMN user_surveys.how_did_you_find_us IS 'Como o usuário conheceu o app (codigo_convite, teste_gratis, indicacao, etc)';
COMMENT ON COLUMN user_surveys.main_goal IS 'Objetivo principal do usuário (perder_peso, ganhar_massa, etc)';
COMMENT ON COLUMN user_surveys.experience IS 'Avaliação da experiência (excelente, muito_boa, boa, regular, ruim)';
COMMENT ON COLUMN user_surveys.feedback IS 'Feedback opcional do usuário';

-- Adicionar colunas de fallback em user_profiles (caso a tabela não seja criada)
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS survey_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS survey_data JSONB;

-- Criar índice para survey_completed
CREATE INDEX IF NOT EXISTS idx_user_profiles_survey_completed ON user_profiles(survey_completed);

-- Verificar se foi criado
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'user_surveys'
ORDER BY column_name;

