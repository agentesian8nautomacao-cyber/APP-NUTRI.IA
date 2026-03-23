-- ============================================
-- ADICIONAR CAMPO account_type EM user_profiles
-- ============================================
-- Execute este script se a coluna account_type não existir

-- 1. Criar ENUM se não existir
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'account_type') THEN
    CREATE TYPE account_type AS ENUM (
        'USER_B2C',      -- Usuário Comum (paga própria assinatura)
        'USER_GYM',      -- Aluno de Academia (vinculado a conta mãe)
        'USER_PERSONAL'  -- Personal Trainer (conta administrativa)
    );
  END IF;
END $$;

-- 2. Adicionar coluna account_type se não existir
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS account_type account_type DEFAULT 'USER_B2C';

-- 3. Criar índice se não existir
CREATE INDEX IF NOT EXISTS idx_user_profiles_account_type 
ON user_profiles(account_type);

-- 4. Adicionar comentário
COMMENT ON COLUMN user_profiles.account_type IS 'Tipo de conta: USER_B2C (comum), USER_GYM (aluno academia), USER_PERSONAL (personal trainer)';

-- 5. Verificar se foi criado
SELECT 
  column_name,
  data_type,
  udt_name,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'user_profiles'
  AND column_name = 'account_type';

