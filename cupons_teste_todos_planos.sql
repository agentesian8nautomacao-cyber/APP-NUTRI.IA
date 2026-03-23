-- ============================================
-- CUPONS DE TESTE PARA TODOS OS PLANOS
-- ============================================
-- Execute este script no Supabase SQL Editor após executar supabase_coupon_payment_link.sql
-- 
-- ⚠️ IMPORTANTE: Execute primeiro fix_coupons_unique.sql para criar a constraint UNIQUE
-- 
-- IMPORTANTE: Use ON CONFLICT para evitar erros se os cupons já existirem

-- ============================================
-- 1. PLANO FREE (Sem vínculo Cakto)
-- ============================================
INSERT INTO coupons (code, plan_linked, max_uses, is_active)
VALUES ('TESTE-FREE', 'free', 100, true)
ON CONFLICT (code) DO UPDATE 
SET plan_linked = EXCLUDED.plan_linked,
    max_uses = EXCLUDED.max_uses,
    is_active = EXCLUDED.is_active;

-- ============================================
-- 2. PLANO MONTHLY (Premium Mensal)
-- ============================================
INSERT INTO coupons (code, plan_linked, max_uses, is_active)
VALUES ('TESTE-MONTHLY', 'monthly', 50, true)
ON CONFLICT (code) DO UPDATE 
SET plan_linked = EXCLUDED.plan_linked,
    max_uses = EXCLUDED.max_uses,
    is_active = EXCLUDED.is_active;

-- ============================================
-- 3. PLANO ANNUAL (Premium Anual)
-- ============================================
INSERT INTO coupons (code, plan_linked, max_uses, is_active)
VALUES ('TESTE-ANNUAL', 'annual', 30, true)
ON CONFLICT (code) DO UPDATE 
SET plan_linked = EXCLUDED.plan_linked,
    max_uses = EXCLUDED.max_uses,
    is_active = EXCLUDED.is_active;

-- ============================================
-- 4. PLANO ACADEMY STARTER (Com vínculo Cakto)
-- ============================================
INSERT INTO coupons (
  code, 
  plan_linked, 
  max_uses, 
  cakto_customer_id, 
  max_linked_accounts, 
  is_active
)
VALUES (
  'ACADEMIA-STARTER', 
  'academy_starter', 
  50, 
  'cakto_customer_academia_starter', 
  50, 
  true
)
ON CONFLICT (code) DO UPDATE 
SET plan_linked = EXCLUDED.plan_linked,
    max_uses = EXCLUDED.max_uses,
    cakto_customer_id = EXCLUDED.cakto_customer_id,
    max_linked_accounts = EXCLUDED.max_linked_accounts,
    is_active = EXCLUDED.is_active;

-- ============================================
-- 5. PLANO ACADEMY GROWTH (Com vínculo Cakto)
-- ============================================
INSERT INTO coupons (
  code, 
  plan_linked, 
  max_uses, 
  cakto_customer_id, 
  max_linked_accounts, 
  is_active
)
VALUES (
  'ACADEMIA-GROWTH', 
  'academy_growth', 
  100, 
  'cakto_customer_academia_growth', 
  100, 
  true
)
ON CONFLICT (code) DO UPDATE 
SET plan_linked = EXCLUDED.plan_linked,
    max_uses = EXCLUDED.max_uses,
    cakto_customer_id = EXCLUDED.cakto_customer_id,
    max_linked_accounts = EXCLUDED.max_linked_accounts,
    is_active = EXCLUDED.is_active;

-- ============================================
-- 6. PLANO PERSONAL TEAM (Com vínculo Cakto)
-- ============================================
INSERT INTO coupons (
  code, 
  plan_linked, 
  max_uses, 
  cakto_customer_id, 
  max_linked_accounts, 
  is_active
)
VALUES (
  'PERSONAL-TEAM', 
  'personal_team', 
  30, 
  'cakto_customer_personal_team', 
  30, 
  true
)
ON CONFLICT (code) DO UPDATE 
SET plan_linked = EXCLUDED.plan_linked,
    max_uses = EXCLUDED.max_uses,
    cakto_customer_id = EXCLUDED.cakto_customer_id,
    max_linked_accounts = EXCLUDED.max_linked_accounts,
    is_active = EXCLUDED.is_active;

-- ============================================
-- 7. CUPONS ADICIONAIS PARA TESTES ESPECÍFICOS
-- ============================================

-- Cupom esgotado (para testar bloqueio)
INSERT INTO coupons (code, plan_linked, max_uses, current_uses, is_active)
VALUES ('TESTE-ESGOTADO', 'free', 5, 5, true)
ON CONFLICT (code) DO UPDATE 
SET current_uses = 5,
    max_uses = 5;

-- Cupom inativo (para testar bloqueio)
INSERT INTO coupons (code, plan_linked, max_uses, is_active)
VALUES ('TESTE-INATIVO', 'free', 10, false)
ON CONFLICT (code) DO UPDATE 
SET is_active = false;

-- Cupom com limite de contas baixo (para testar limite)
INSERT INTO coupons (
  code, 
  plan_linked, 
  max_uses, 
  cakto_customer_id, 
  max_linked_accounts, 
  is_active
)
VALUES (
  'PERSONAL-LIMITADO', 
  'personal_team', 
  10, 
  'cakto_customer_personal_limitado', 
  2,  -- Apenas 2 contas permitidas
  true
)
ON CONFLICT (code) DO UPDATE 
SET max_linked_accounts = 2;

-- Cupom vinculado a pagamento inativo (para testar bloqueio)
INSERT INTO coupons (
  code, 
  plan_linked, 
  max_uses, 
  cakto_customer_id, 
  max_linked_accounts, 
  is_active
)
VALUES (
  'ACADEMIA-INATIVO', 
  'academy_starter', 
  20, 
  'cakto_customer_inativo', 
  20, 
  true
)
ON CONFLICT (code) DO UPDATE 
SET cakto_customer_id = 'cakto_customer_inativo';

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
  is_active,
  created_at
FROM coupons
ORDER BY 
  CASE plan_linked
    WHEN 'free' THEN 1
    WHEN 'monthly' THEN 2
    WHEN 'annual' THEN 3
    WHEN 'academy_starter' THEN 4
    WHEN 'academy_growth' THEN 5
    WHEN 'personal_team' THEN 6
    ELSE 7
  END,
  code;

-- ============================================
-- CRIAR PERFIS DE PAGAMENTO CAKTO PARA TESTES
-- ============================================
-- IMPORTANTE: Execute estas queries APÓS criar os cupons
-- Você precisará criar usuários primeiro e depois os perfis

-- Exemplo de como criar perfil de pagamento ativo:
-- (Substitua 'user-id-aqui' pelo ID real de um usuário criado)

/*
-- 1. Criar usuário de teste (execute no Supabase Auth ou via API)
-- 2. Depois execute:

INSERT INTO user_profiles (
  user_id,
  cakto_customer_id,
  plan_type,
  status,
  expiry_date,
  name,
  email
)
VALUES 
  -- Academia Starter (ativo)
  (
    'user-id-aqui-1',
    'cakto_customer_academia_starter',
    'academy_starter',
    'active',
    '2025-12-31'::date,
    'Academia Teste Starter',
    'academia.starter@teste.com'
  ),
  -- Academia Growth (ativo)
  (
    'user-id-aqui-2',
    'cakto_customer_academia_growth',
    'academy_growth',
    'active',
    '2025-12-31'::date,
    'Academia Teste Growth',
    'academia.growth@teste.com'
  ),
  -- Personal Team (ativo)
  (
    'user-id-aqui-3',
    'cakto_customer_personal_team',
    'personal_team',
    'active',
    '2025-12-31'::date,
    'Personal Teste',
    'personal@teste.com'
  ),
  -- Personal Limitado (ativo)
  (
    'user-id-aqui-4',
    'cakto_customer_personal_limitado',
    'personal_team',
    'active',
    '2025-12-31'::date,
    'Personal Limitado',
    'personal.limitado@teste.com'
  ),
  -- Pagamento Inativo (para teste de bloqueio)
  (
    'user-id-aqui-5',
    'cakto_customer_inativo',
    'academy_starter',
    'expired',  -- Status inativo
    '2024-01-01'::date,  -- Data expirada
    'Academia Inativa',
    'academia.inativa@teste.com'
  )
ON CONFLICT (user_id) DO UPDATE
SET cakto_customer_id = EXCLUDED.cakto_customer_id,
    plan_type = EXCLUDED.plan_type,
    status = EXCLUDED.status,
    expiry_date = EXCLUDED.expiry_date;
*/

-- ============================================
-- RESUMO DOS CUPONS CRIADOS
-- ============================================
/*
CUPONS DISPONÍVEIS PARA TESTE:

1. TESTE-FREE (free)
   - Sem vínculo Cakto
   - 100 usos disponíveis
   - ✅ Use para testes básicos

2. TESTE-MONTHLY (monthly)
   - Sem vínculo Cakto
   - 50 usos disponíveis
   - ✅ Use para testar plano mensal

3. TESTE-ANNUAL (annual)
   - Sem vínculo Cakto
   - 30 usos disponíveis
   - ✅ Use para testar plano anual

4. ACADEMIA-STARTER (academy_starter)
   - Com vínculo Cakto: cakto_customer_academia_starter
   - 50 usos, 50 contas máximas
   - ⚠️ Precisa de perfil de pagamento ativo

5. ACADEMIA-GROWTH (academy_growth)
   - Com vínculo Cakto: cakto_customer_academia_growth
   - 100 usos, 100 contas máximas
   - ⚠️ Precisa de perfil de pagamento ativo

6. PERSONAL-TEAM (personal_team)
   - Com vínculo Cakto: cakto_customer_personal_team
   - 30 usos, 30 contas máximas
   - ⚠️ Precisa de perfil de pagamento ativo

7. TESTE-ESGOTADO (free)
   - Esgotado (5/5 usos)
   - ❌ Use para testar bloqueio de cupom esgotado

8. TESTE-INATIVO (free)
   - Inativo (is_active = false)
   - ❌ Use para testar bloqueio de cupom inativo

9. PERSONAL-LIMITADO (personal_team)
   - Limite de 2 contas
   - ⚠️ Use para testar limite de contas vinculadas

10. ACADEMIA-INATIVO (academy_starter)
    - Vinculado a pagamento inativo
    - ❌ Use para testar bloqueio de pagamento inativo
*/

