-- ============================================
-- CORREÇÃO: Ajustar valor padrão de subscription_status
-- ============================================
-- Remove o cast do ENUM antigo do valor padrão

-- Verificar o valor padrão atual
SELECT 
    column_name,
    data_type,
    column_default
FROM information_schema.columns
WHERE table_name = 'user_profiles' 
AND column_name = 'subscription_status';

-- Corrigir o valor padrão removendo o cast do ENUM
ALTER TABLE user_profiles 
ALTER COLUMN subscription_status 
SET DEFAULT 'FREE';

-- Verificar se foi corrigido
SELECT 
    column_name,
    data_type,
    column_default
FROM information_schema.columns
WHERE table_name = 'user_profiles' 
AND column_name = 'subscription_status';

-- Atualizar registros existentes que possam ter valores inválidos
-- Se houver valores que não estão na constraint, atualizar para 'FREE'
UPDATE user_profiles
SET subscription_status = 'FREE'
WHERE subscription_status IS NULL 
   OR subscription_status NOT IN ('FREE', 'PREMIUM_UNLIMITED', 'active', 'inactive', 'expired');

