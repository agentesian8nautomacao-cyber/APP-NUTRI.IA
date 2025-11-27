-- ============================================
-- EXEMPLOS DE CUPONS PARA TESTE
-- ============================================

-- 1. Cupom SEM vínculo Cakto (para testes gerais)
-- Este cupom funciona normalmente, sem verificação de pagamento
INSERT INTO coupons (code, plan_linked, max_uses, is_active)
VALUES ('TESTE-FREE', 'free', 100, true)
ON CONFLICT (code) DO NOTHING;

-- 2. Cupom COM vínculo Cakto (Academia)
-- Este cupom está vinculado a um pagamento Cakto
-- IMPORTANTE: O cakto_customer_id deve corresponder ao ID real do cliente na Cakto
INSERT INTO coupons (code, plan_linked, max_uses, cakto_customer_id, max_linked_accounts, is_active)
VALUES ('ACADEMIA-X', 'academy_starter', 50, 'cakto_customer_123', 50, true)
ON CONFLICT (code) DO NOTHING;

-- 3. Cupom COM vínculo Cakto (Personal Trainer)
INSERT INTO coupons (code, plan_linked, max_uses, cakto_customer_id, max_linked_accounts, is_active)
VALUES ('PERSONAL-Y', 'personal_team', 30, 'cakto_customer_456', 30, true)
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- VERIFICAR CUPONS CRIADOS
-- ============================================
SELECT 
  code,
  plan_linked,
  max_uses,
  current_uses,
  cakto_customer_id,
  linked_accounts_count,
  max_linked_accounts,
  is_active
FROM coupons
ORDER BY created_at DESC;

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================
-- 1. Para cupons vinculados a Cakto, você precisa:
--    - Ter um user_profiles com o mesmo cakto_customer_id
--    - Esse perfil deve ter status = 'active'
--    - O pagamento não deve estar expirado (expiry_date > now())
--
-- 2. O cakto_customer_id deve ser o ID real do cliente na Cakto
--    (será atualizado pelo webhook quando o pagamento for processado)
--
-- 3. Para testar sem pagamento Cakto, use cupons SEM cakto_customer_id

