-- ============================================
-- NUTRI.IA - Histórico de Pagamentos Cakto
-- ============================================
-- Este script cria a tabela de histórico de pagamentos conforme o guia

-- Tabela de histórico de pagamentos
CREATE TABLE IF NOT EXISTS payment_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    transaction_id VARCHAR(255) UNIQUE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    payment_method VARCHAR(100),
    cakto_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_transaction_id ON payment_history(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_created_at ON payment_history(created_at DESC);

-- RLS (Row Level Security)
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Users can view own payment history" ON payment_history
    FOR SELECT USING (auth.uid() = user_id);

-- Permissões para service_role (webhook precisa inserir)
CREATE POLICY "Service role can manage payment history" ON payment_history
    FOR ALL USING (auth.role() = 'service_role');

-- Permissões
GRANT SELECT ON payment_history TO anon;
GRANT ALL PRIVILEGES ON payment_history TO authenticated;

-- Comentários para documentação
COMMENT ON TABLE payment_history IS 'Histórico completo de transações de pagamento via Cakto';
COMMENT ON COLUMN payment_history.transaction_id IS 'ID único da transação na Cakto';
COMMENT ON COLUMN payment_history.cakto_data IS 'Dados completos do webhook da Cakto em formato JSON';

