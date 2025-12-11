-- ============================================
-- ADICIONAR COLUNAS plan_type E subscription_status
-- ============================================
-- Execute este script se as colunas não existirem

-- 1. Adicionar coluna plan_type se não existir
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'free';

-- 2. Adicionar coluna subscription_status se não existir
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'FREE';

-- 3. Adicionar comentários
COMMENT ON COLUMN user_profiles.plan_type IS 'Tipo de plano: free, mensal, anual, academy_starter, academy_growth, academy_pro, personal_team_5, personal_team_15';
COMMENT ON COLUMN user_profiles.subscription_status IS 'Status da assinatura: FREE, active, inactive, expired';

-- 4. Verificar se foram criadas
SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'user_profiles'
  AND column_name IN ('plan_type', 'subscription_status')
ORDER BY column_name;

