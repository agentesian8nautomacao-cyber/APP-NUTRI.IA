-- ============================================
-- VÍNCULO ENTRE CUPONS E PAGAMENTOS CAKTO
-- ============================================
-- Este script adiciona suporte para vincular cupons a pagamentos Cakto
-- e verificar se o pagamento tem contas vinculadas antes de permitir acesso

-- 1. Adicionar campo cakto_customer_id na tabela coupons
--    (para vincular o cupom ao pagamento da academia/personal)
ALTER TABLE coupons 
ADD COLUMN IF NOT EXISTS cakto_customer_id TEXT,
ADD COLUMN IF NOT EXISTS linked_accounts_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_linked_accounts INTEGER DEFAULT NULL;

-- 2. Adicionar comentários para documentação
COMMENT ON COLUMN coupons.cakto_customer_id IS 'ID do cliente Cakto vinculado ao cupom (pagamento da academia/personal)';
COMMENT ON COLUMN coupons.linked_accounts_count IS 'Número de contas já vinculadas a este cupom/pagamento';
COMMENT ON COLUMN coupons.max_linked_accounts IS 'Número máximo de contas permitidas para este cupom (NULL = ilimitado baseado em max_uses)';

-- 3. Criar tabela para rastrear quais usuários foram criados via qual cupom
CREATE TABLE IF NOT EXISTS user_coupon_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, coupon_id)
);

-- 4. Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_coupon_links_user_id ON user_coupon_links(user_id);
CREATE INDEX IF NOT EXISTS idx_user_coupon_links_coupon_id ON user_coupon_links(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupons_cakto_customer_id ON coupons(cakto_customer_id);

-- 5. Função para verificar se o pagamento Cakto tem contas vinculadas
--    Retorna TRUE se o cupom está vinculado a um pagamento E se o pagamento tem contas disponíveis
CREATE OR REPLACE FUNCTION check_coupon_payment_access(coupon_code TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  coupon_record RECORD;
  payment_active BOOLEAN;
BEGIN
  -- Buscar o cupom
  SELECT * INTO coupon_record
  FROM coupons
  WHERE code = coupon_code AND is_active = true;
  
  -- Se o cupom não existe ou está inativo, retorna FALSE
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Se o cupom não está vinculado a um pagamento Cakto, permite acesso normal
  -- (cupons sem cakto_customer_id são considerados válidos se passarem nas outras validações)
  IF coupon_record.cakto_customer_id IS NULL THEN
    RETURN TRUE;
  END IF;
  
  -- Verificar se o pagamento está ativo no user_profiles
  -- (assumindo que o webhook Cakto atualiza user_profiles com status 'active')
  SELECT EXISTS(
    SELECT 1
    FROM user_profiles
    WHERE cakto_customer_id = coupon_record.cakto_customer_id
      AND status = 'active'
      AND (expiry_date IS NULL OR expiry_date > now())
  ) INTO payment_active;
  
  -- Se o pagamento não está ativo, retorna FALSE
  IF NOT payment_active THEN
    RETURN FALSE;
  END IF;
  
  -- Verificar se ainda há vagas disponíveis (se max_linked_accounts estiver definido)
  IF coupon_record.max_linked_accounts IS NOT NULL THEN
    IF coupon_record.linked_accounts_count >= coupon_record.max_linked_accounts THEN
      RETURN FALSE;
    END IF;
  END IF;
  
  -- Se chegou aqui, o pagamento está ativo e há vagas disponíveis
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Trigger para atualizar linked_accounts_count quando um usuário é vinculado
CREATE OR REPLACE FUNCTION update_coupon_linked_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE coupons
  SET linked_accounts_count = (
    SELECT COUNT(*)
    FROM user_coupon_links
    WHERE coupon_id = NEW.coupon_id
  )
  WHERE id = NEW.coupon_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_coupon_linked_count ON user_coupon_links;
CREATE TRIGGER trigger_update_coupon_linked_count
  AFTER INSERT OR DELETE ON user_coupon_links
  FOR EACH ROW
  EXECUTE FUNCTION update_coupon_linked_count();

-- 7. RLS para user_coupon_links
ALTER TABLE user_coupon_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own coupon links"
  ON user_coupon_links
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage coupon links"
  ON user_coupon_links
  FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- NOTAS DE USO:
-- ============================================
-- 1. Quando criar um cupom vinculado a um pagamento Cakto:
--    INSERT INTO coupons (code, plan_linked, max_uses, cakto_customer_id, max_linked_accounts)
--    VALUES ('ACADEMIA-X', 'academy_starter', 50, 'cakto_customer_123', 50);
--
-- 2. O webhook Cakto deve atualizar user_profiles com cakto_customer_id
--    quando processar um pagamento
--
-- 3. A função check_coupon_payment_access() verifica:
--    - Se o cupom existe e está ativo
--    - Se está vinculado a um pagamento Cakto
--    - Se o pagamento está ativo (status='active' e não expirado)
--    - Se há vagas disponíveis (linked_accounts_count < max_linked_accounts)

