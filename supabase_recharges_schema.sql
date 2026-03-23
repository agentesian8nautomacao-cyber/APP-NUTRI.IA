-- ============================================
-- NUTRI.IA - Sistema de Recargas
-- ============================================
-- Este script cria a tabela de histórico de recargas compradas

-- Tabela de recargas
CREATE TABLE IF NOT EXISTS recharges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recharge_type VARCHAR(50) NOT NULL CHECK (recharge_type IN ('quick_help', 'reserve_minutes', 'unlimited')),
    amount DECIMAL(10,2) NOT NULL,
    minutes_added INTEGER NOT NULL,
    expires_at TIMESTAMPTZ,
    transaction_id VARCHAR(255) UNIQUE,
    cakto_data JSONB,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'expired')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_recharges_user_id ON recharges(user_id);
CREATE INDEX IF NOT EXISTS idx_recharges_transaction_id ON recharges(transaction_id);
CREATE INDEX IF NOT EXISTS idx_recharges_status ON recharges(status);
CREATE INDEX IF NOT EXISTS idx_recharges_expires_at ON recharges(expires_at) WHERE expires_at IS NOT NULL;

-- RLS (Row Level Security)
ALTER TABLE recharges ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Users can view own recharges" ON recharges
    FOR SELECT USING (auth.uid() = user_id);

-- Permissões para service_role (webhook precisa inserir/atualizar)
CREATE POLICY "Service role can manage recharges" ON recharges
    FOR ALL USING (auth.role() = 'service_role');

-- Permissões
GRANT SELECT ON recharges TO anon;
GRANT ALL PRIVILEGES ON recharges TO authenticated;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_recharges_updated_at
BEFORE UPDATE ON recharges
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Comentários para documentação
COMMENT ON TABLE recharges IS 'Histórico de recargas de minutos de voz compradas pelos usuários';
COMMENT ON COLUMN recharges.recharge_type IS 'Tipo: quick_help (20min/24h), reserve_minutes (100min/ilimitado), unlimited (ilimitado/30dias)';
COMMENT ON COLUMN recharges.minutes_added IS 'Quantidade de minutos adicionados ao saldo do usuário';
COMMENT ON COLUMN recharges.expires_at IS 'Data de expiração (NULL para reserve_minutes que não expira)';

