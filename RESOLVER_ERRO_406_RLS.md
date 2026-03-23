# Resolver Erro 406 - Problema de RLS (Row Level Security)

## 🔍 Problema

O erro **406 (Not Acceptable)** nas queries do Supabase geralmente indica um problema com **RLS (Row Level Security)** ou com as **políticas de acesso** da tabela.

## ✅ Solução: Verificar e Corrigir Políticas RLS

### Passo 1: Verificar Políticas Existentes

Execute no **Supabase SQL Editor**:

```sql
-- Verificar políticas da tabela user_profiles
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'user_profiles'
ORDER BY policyname;
```

### Passo 2: Verificar se RLS está Habilitado

```sql
-- Verificar se RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'user_profiles';
```

**Se `rowsecurity = false`**: RLS não está habilitado (isso pode causar problemas)

**Se `rowsecurity = true`**: RLS está habilitado (precisa de políticas)

### Passo 3: Criar/Atualizar Políticas RLS

Se não houver políticas ou se estiverem incorretas, execute:

```sql
-- Habilitar RLS na tabela user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas (se existirem)
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

-- Criar política para SELECT (visualizar próprio perfil)
CREATE POLICY "Users can view own profile" 
ON user_profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Criar política para INSERT (criar próprio perfil)
CREATE POLICY "Users can insert own profile" 
ON user_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Criar política para UPDATE (atualizar próprio perfil)
CREATE POLICY "Users can update own profile" 
ON user_profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

### Passo 4: Verificar Políticas da Tabela user_surveys

Se a tabela `user_surveys` também estiver dando erro 406:

```sql
-- Habilitar RLS na tabela user_surveys
ALTER TABLE user_surveys ENABLE ROW LEVEL SECURITY;

-- Criar políticas para user_surveys
DROP POLICY IF EXISTS "Users can view own survey" ON user_surveys;
DROP POLICY IF EXISTS "Users can insert own survey" ON user_surveys;

CREATE POLICY "Users can view own survey" 
ON user_surveys
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own survey" 
ON user_surveys
FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

### Passo 5: Verificar Autenticação do Usuário

Execute para verificar se o usuário está autenticado:

```sql
-- Verificar usuários autenticados (via service_role)
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users
WHERE email = 'seu-email@exemplo.com';
```

## 🔧 Troubleshooting Adicional

### Se o erro 406 persistir após corrigir RLS:

1. **Verificar se o perfil existe:**
   ```sql
   SELECT * FROM user_profiles 
   WHERE user_id = '6f902de6-ee5e-48cd-ad5d-f0ea818b4cdb';
   ```

2. **Verificar se o usuário está autenticado:**
   - No console do navegador, verifique se há token de autenticação
   - Tente fazer logout e login novamente

3. **Verificar formato da query:**
   - O erro pode ser causado por caracteres especiais na query
   - Tente usar `select=*` em vez de select explícito

4. **Verificar versão do Supabase:**
   - Algumas versões do Supabase podem ter bugs com RLS
   - Verifique se está usando a versão mais recente

## 📝 Nota Importante

O erro 406 geralmente ocorre quando:
- RLS está habilitado mas não há políticas que permitam a operação
- O usuário não está autenticado
- A política RLS está incorreta ou muito restritiva

Após executar os passos acima, o erro 406 deve ser resolvido.

