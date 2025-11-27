-- ============================================
-- SCRIPT DE VERIFICAÇÃO DE CUPONS
-- ============================================
-- Execute este script no Supabase SQL Editor para verificar o status dos cupons

-- 1. Listar todos os cupons
SELECT 
  code,
  plan_linked,
  max_uses,
  current_uses,
  is_active,
  cakto_customer_id,
  linked_accounts_count,
  max_linked_accounts,
  created_at
FROM coupons
ORDER BY created_at DESC;

-- 2. Verificar cupons específicos
SELECT 
  code,
  is_active,
  current_uses,
  max_uses,
  CASE 
    WHEN current_uses >= max_uses THEN 'ESGOTADO'
    WHEN is_active = false THEN 'INATIVO'
    ELSE 'DISPONÍVEL'
  END as status
FROM coupons
WHERE code IN ('TESTE-FREE', 'TESTE-MONTHLY', 'TESTE-ANNUAL', 'ACADEMIA-STARTER', 'ACADEMIA-GROWTH', 'PERSONAL-TEAM');

-- 3. Verificar se há cupons ativos
SELECT COUNT(*) as total_ativos
FROM coupons
WHERE is_active = true;

-- 4. Verificar cupons esgotados
SELECT code, current_uses, max_uses
FROM coupons
WHERE current_uses >= max_uses;

-- 5. Verificar cupons inativos
SELECT code, is_active
FROM coupons
WHERE is_active = false;

-- 6. Testar query exata que o código usa
-- (Simula o que o validateCoupon faz)
SELECT *
FROM coupons
WHERE code ILIKE 'TESTE-FREE'  -- Substitua pelo código que está testando
  AND is_active = true
LIMIT 1;

-- 7. Verificar políticas RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'coupons';

-- 8. Criar cupom de teste rápido (se não existir)
-- NOTA: Se der erro de ON CONFLICT, execute primeiro fix_coupons_unique.sql
INSERT INTO coupons (code, plan_linked, max_uses, is_active)
VALUES ('TESTE-RAPIDO', 'free', 10, true)
ON CONFLICT (code) DO UPDATE 
SET is_active = true, current_uses = 0
RETURNING *;

-- Alternativa sem ON CONFLICT (se a constraint não existir):
-- INSERT INTO coupons (code, plan_linked, max_uses, is_active)
-- SELECT 'TESTE-RAPIDO', 'free', 10, true
-- WHERE NOT EXISTS (SELECT 1 FROM coupons WHERE code = 'TESTE-RAPIDO');

-- 9. Ativar todos os cupons de teste
UPDATE coupons
SET is_active = true
WHERE code IN ('TESTE-FREE', 'TESTE-MONTHLY', 'TESTE-ANNUAL', 'ACADEMIA-STARTER', 'ACADEMIA-GROWTH', 'PERSONAL-TEAM');

-- 10. Resetar uso de todos os cupons de teste
UPDATE coupons
SET current_uses = 0
WHERE code IN ('TESTE-FREE', 'TESTE-MONTHLY', 'TESTE-ANNUAL', 'ACADEMIA-STARTER', 'ACADEMIA-GROWTH', 'PERSONAL-TEAM');

