-- ============================================
-- ADICIONAR 'trial' À CONSTRAINT DE subscription_status
-- ============================================
-- Este script adiciona 'trial' como valor válido para subscription_status

-- 1. Remover constraint antiga
ALTER TABLE user_profiles 
DROP CONSTRAINT IF EXISTS user_profiles_subscription_status_check;

-- 2. Adicionar nova constraint incluindo 'trial'
ALTER TABLE user_profiles 
ADD CONSTRAINT user_profiles_subscription_status_check 
CHECK (subscription_status IN ('FREE', 'PREMIUM_UNLIMITED', 'active', 'inactive', 'expired', 'trial'));

-- 3. Verificar se foi aplicada
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'user_profiles'::regclass
  AND conname = 'user_profiles_subscription_status_check';

