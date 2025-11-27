-- ============================================
-- CORREÇÃO: Adicionar UNIQUE constraint na coluna code da tabela coupons
-- ============================================
-- Execute este script ANTES de executar cupons_teste_todos_planos.sql

-- 1. Verificar se a constraint já existe
SELECT 
    constraint_name,
    table_name
FROM information_schema.table_constraints
WHERE table_name = 'coupons'
  AND constraint_type = 'UNIQUE';

-- 2. Adicionar UNIQUE constraint na coluna code (se não existir)
-- Isso permite usar ON CONFLICT (code) nos INSERTs
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'coupons_code_key'
          AND conrelid = 'coupons'::regclass
    ) THEN
        ALTER TABLE coupons
        ADD CONSTRAINT coupons_code_key UNIQUE (code);
        
        RAISE NOTICE 'Constraint UNIQUE adicionada na coluna code';
    ELSE
        RAISE NOTICE 'Constraint UNIQUE já existe na coluna code';
    END IF;
END $$;

-- 3. Verificar se foi criada
SELECT 
    constraint_name,
    table_name,
    column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'coupons'
  AND tc.constraint_type = 'UNIQUE'
  AND kcu.column_name = 'code';

