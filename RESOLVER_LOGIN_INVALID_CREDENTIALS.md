# 🔧 Resolver Erro "Invalid login credentials"

## 📋 Problema

Usuários estão recebendo o erro **"Invalid login credentials"** ao tentar fazer login:
- `oluaphms@hotmail.com`
- `paulhenriquems7054@gmail.com`

## 🔍 Causas Possíveis

1. **Usuário não existe no Supabase Auth** (`auth.users`)
2. **Senha incorreta**
3. **Email não confirmado** (se email confirmation estiver ativado)
4. **Usuário foi deletado** mas o perfil ainda existe

---

## ✅ Solução Passo a Passo

### Passo 1: Verificar se os Usuários Existem

Execute o script SQL: `verificar_e_criar_usuarios_login.sql`

**Ou execute manualmente no Supabase SQL Editor:**

```sql
-- Verificar usuário: oluaphms@hotmail.com
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN '✅ Email confirmado'
    ELSE '⚠️ Email NÃO confirmado'
  END as status_email
FROM auth.users
WHERE email = 'oluaphms@hotmail.com';

-- Verificar usuário: paulhenriquems7054@gmail.com
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN '✅ Email confirmado'
    ELSE '⚠️ Email NÃO confirmado'
  END as status_email
FROM auth.users
WHERE email = 'paulhenriquems7054@gmail.com';
```

**Resultado esperado:**
- Se retornar vazio: **Usuário não existe** → Precisa criar
- Se retornar com `email_confirmed_at = NULL`: **Email não confirmado** → Precisa confirmar ou desativar confirmação

---

### Passo 2: Criar Usuários (se não existirem)

#### Opção A: Via Supabase Dashboard (Recomendado)

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em: **Authentication** → **Users**
4. Clique em: **"Add User"** ou **"Create User"**
5. Preencha:
   - **Email:** `oluaphms@hotmail.com`
   - **Password:** (a senha que o usuário quer usar)
   - **Auto Confirm User:** ✅ (marcar esta opção - IMPORTANTE!)
6. Clique em: **"Create User"**
7. Repita para: `paulhenriquems7054@gmail.com`

#### Opção B: Via API do Supabase (Avançado)

```bash
curl -X POST 'https://hflwyatppivyncocllnu.supabase.co/auth/v1/admin/users' \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "oluaphms@hotmail.com",
    "password": "senha_desejada",
    "email_confirm": true
  }'
```

**⚠️ IMPORTANTE:** Substitua `YOUR_SERVICE_ROLE_KEY` pela sua Service Role Key do Supabase.

**Como obter a Service Role Key:**
1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em: **Settings** → **API**
4. Copie a **"service_role"** key (NÃO a "anon" key!)

---

### Passo 3: Confirmar Email (se necessário)

Se o email confirmation estiver ativado e o usuário não estiver confirmado:

#### Opção A: Desativar Email Confirmation (Recomendado)

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em: **Authentication** → **Settings**
4. Desmarque: **"Enable email confirmations"**
5. Salve as alterações

#### Opção B: Confirmar Email Manualmente

Execute no Supabase SQL Editor:

```sql
-- Confirmar email para oluaphms@hotmail.com
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'oluaphms@hotmail.com';

-- Confirmar email para paulhenriquems7054@gmail.com
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'paulhenriquems7054@gmail.com';
```

---

### Passo 4: Criar/Atualizar Perfis

Após criar os usuários, execute o script SQL: `verificar_e_criar_usuarios_login.sql`

**Ou execute manualmente:**

```sql
-- Para oluaphms@hotmail.com
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'oluaphms@hotmail.com'
  LIMIT 1;
  
  IF v_user_id IS NOT NULL THEN
    INSERT INTO user_profiles (
      user_id,
      name,
      plan_type,
      subscription_status,
      subscription_expiry,
      daily_free_minutes,
      voice_daily_limit_seconds
    ) VALUES (
      v_user_id,
      'Olua',
      'free',
      'trial',
      (NOW() + INTERVAL '3 days')::TIMESTAMPTZ,
      5,
      300
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET
      name = EXCLUDED.name,
      plan_type = EXCLUDED.plan_type,
      subscription_status = EXCLUDED.subscription_status,
      subscription_expiry = EXCLUDED.subscription_expiry,
      daily_free_minutes = EXCLUDED.daily_free_minutes,
      voice_daily_limit_seconds = EXCLUDED.voice_daily_limit_seconds,
      updated_at = NOW();
  END IF;
END $$;

-- Para paulhenriquems7054@gmail.com
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'paulhenriquems7054@gmail.com'
  LIMIT 1;
  
  IF v_user_id IS NOT NULL THEN
    INSERT INTO user_profiles (
      user_id,
      name,
      plan_type,
      subscription_status,
      subscription_expiry,
      daily_free_minutes,
      voice_daily_limit_seconds
    ) VALUES (
      v_user_id,
      'Paulo',
      'free',
      'trial',
      (NOW() + INTERVAL '3 days')::TIMESTAMPTZ,
      5,
      300
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET
      name = EXCLUDED.name,
      plan_type = EXCLUDED.plan_type,
      subscription_status = EXCLUDED.subscription_status,
      subscription_expiry = EXCLUDED.subscription_expiry,
      daily_free_minutes = EXCLUDED.daily_free_minutes,
      voice_daily_limit_seconds = EXCLUDED.voice_daily_limit_seconds,
      updated_at = NOW();
  END IF;
END $$;
```

---

### Passo 5: Verificar Resultado

Execute esta query para verificar se tudo está correto:

```sql
SELECT 
  au.email,
  au.email_confirmed_at,
  CASE 
    WHEN au.email_confirmed_at IS NOT NULL THEN '✅ Email confirmado'
    ELSE '⚠️ Email NÃO confirmado'
  END as status_email,
  up.name,
  up.plan_type,
  up.subscription_status,
  up.subscription_expiry,
  CASE 
    WHEN up.subscription_status = 'trial' AND up.subscription_expiry > NOW() THEN '✅ Trial ativo'
    WHEN up.subscription_status = 'trial' AND up.subscription_expiry <= NOW() THEN '❌ Trial expirado'
    ELSE '✅ Status: ' || up.subscription_status
  END as status_trial
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.user_id
WHERE au.email IN ('oluaphms@hotmail.com', 'paulhenriquems7054@gmail.com')
ORDER BY au.email;
```

**Resultado esperado:**
- ✅ Email confirmado
- ✅ Trial ativo
- ✅ Perfil criado

---

## 🔄 Redefinir Senha (se necessário)

Se o usuário esqueceu a senha ou precisa redefinir:

### Via Supabase Dashboard:

1. Acesse: **Authentication** → **Users**
2. Encontre o usuário
3. Clique nos **3 pontos** (menu)
4. Selecione: **"Reset Password"**
5. O usuário receberá um email para redefinir a senha

### Via SQL (Avançado):

```sql
-- Isso não redefine a senha diretamente, mas você pode deletar e recriar o usuário
-- OU usar a API do Supabase para redefinir senha
```

---

## 📝 Checklist Final

- [ ] Usuários criados no `auth.users`
- [ ] Emails confirmados (`email_confirmed_at IS NOT NULL`)
- [ ] Perfis criados em `user_profiles`
- [ ] Senhas definidas corretamente
- [ ] Email confirmation desativado (se não quiser confirmação)

---

## ⚠️ Notas Importantes

1. **Não é possível criar usuários diretamente via SQL** no Supabase Auth. Você precisa usar o Dashboard ou a API.

2. **Service Role Key:** Use apenas para operações administrativas. Nunca exponha no frontend!

3. **Email Confirmation:** Se estiver ativado, o usuário precisa confirmar o email antes de fazer login. Recomendamos desativar para simplificar o fluxo.

4. **Senhas:** Se o usuário esqueceu a senha, use a funcionalidade "Reset Password" do Supabase.

---

## 🆘 Se o Problema Persistir

1. **Verifique os logs do Supabase:**
   - Acesse: **Logs** → **Auth Logs**
   - Veja se há erros relacionados aos usuários

2. **Teste com outro email:**
   - Crie um novo usuário de teste
   - Tente fazer login
   - Se funcionar, o problema é específico desses usuários

3. **Verifique se o email está correto:**
   - Pode haver diferença entre maiúsculas/minúsculas
   - Pode haver espaços extras
   - Verifique se o email está exatamente como foi cadastrado

4. **Limpe o cache do navegador:**
   - O navegador pode estar usando uma sessão antiga
   - Limpe o cache e tente novamente

---

**Arquivos relacionados:**
- `verificar_e_criar_usuarios_login.sql` - Script SQL para verificar e criar usuários
- `RESOLVER_LOGIN_TRIAL.md` - Guia para resolver problemas de login de usuários trial

