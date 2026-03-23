-- ============================================
-- CUPONS DE TESTE (VERSÃO SIMPLES - SEM ON CONFLICT)
-- ============================================
-- Use este script se ainda não executou fix_coupons_unique.sql
-- Este script verifica se o cupom existe antes de inserir

-- 1. PLANO FREE
INSERT INTO coupons (code, plan_linked, max_uses, is_active)
SELECT 'TESTE-FREE', 'free', 100, true
WHERE NOT EXISTS (SELECT 1 FROM coupons WHERE code = 'TESTE-FREE');

-- 2. PLANO MONTHLY
INSERT INTO coupons (code, plan_linked, max_uses, is_active)
SELECT 'TESTE-MONTHLY', 'monthly', 50, true
WHERE NOT EXISTS (SELECT 1 FROM coupons WHERE code = 'TESTE-MONTHLY');

-- 3. PLANO ANNUAL
INSERT INTO coupons (code, plan_linked, max_uses, is_active)
SELECT 'TESTE-ANNUAL', 'annual', 30, true
WHERE NOT EXISTS (SELECT 1 FROM coupons WHERE code = 'TESTE-ANNUAL');

-- 4. PLANO ACADEMY STARTER
INSERT INTO coupons (code, plan_linked, max_uses, cakto_customer_id, max_linked_accounts, is_active)
SELECT 'ACADEMIA-STARTER', 'academy_starter', 50, 'cakto_customer_academia_starter', 50, true
WHERE NOT EXISTS (SELECT 1 FROM coupons WHERE code = 'ACADEMIA-STARTER');

-- 5. PLANO ACADEMY GROWTH
INSERT INTO coupons (code, plan_linked, max_uses, cakto_customer_id, max_linked_accounts, is_active)
SELECT 'ACADEMIA-GROWTH', 'academy_growth', 100, 'cakto_customer_academia_growth', 100, true
WHERE NOT EXISTS (SELECT 1 FROM coupons WHERE code = 'ACADEMIA-GROWTH');

-- 6. PLANO PERSONAL TEAM
INSERT INTO coupons (code, plan_linked, max_uses, cakto_customer_id, max_linked_accounts, is_active)
SELECT 'PERSONAL-TEAM', 'personal_team', 30, 'cakto_customer_personal_team', 30, true
WHERE NOT EXISTS (SELECT 1 FROM coupons WHERE code = 'PERSONAL-TEAM');

-- 7. Verificar cupons criados
SELECT 
  code,
  plan_linked,
  max_uses,
  current_uses,
  is_active,
  cakto_customer_id
FROM coupons
WHERE code IN ('TESTE-FREE', 'TESTE-MONTHLY', 'TESTE-ANNUAL', 'ACADEMIA-STARTER', 'ACADEMIA-GROWTH', 'PERSONAL-TEAM')
ORDER BY code;

