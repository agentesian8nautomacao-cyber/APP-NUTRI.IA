-- ============================================
-- NUTRI.IA - Adicionar Campos de Pagamento em user_profiles
-- ============================================
-- Este script adiciona os campos necessários para rastreamento de pagamentos Cakto

-- Adicionar campos de pagamento à tabela user_profiles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS cakto_customer_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS last_payment_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_cakto_customer_id ON user_profiles(cakto_customer_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_last_payment_date ON user_profiles(last_payment_date);

-- Comentários para documentação
COMMENT ON COLUMN user_profiles.cakto_customer_id IS 'ID do cliente na plataforma Cakto';
COMMENT ON COLUMN user_profiles.last_payment_date IS 'Data do último pagamento processado';
COMMENT ON COLUMN user_profiles.payment_method IS 'Método de pagamento usado (credit_card, pix, etc)';

