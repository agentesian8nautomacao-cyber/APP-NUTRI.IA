# 🔧 Resolver Erro de Login no Vercel

## 📋 Problema

Ao tentar fazer login no app hospedado no Vercel, você recebe o erro:
```
❌ [DEBUG] Erro no login: AuthApiError: Invalid login credentials
Failed to load resource: the server responded with a status of 400
```

## 🔍 Causas Possíveis

1. **Usuário não existe no Supabase Auth** - O usuário não foi criado ainda
2. **Senha incorreta** - A senha digitada não corresponde à senha do usuário
3. **Email não confirmado** - Se email confirmation estiver ativado, o usuário precisa confirmar o email
4. **Variáveis de ambiente não configuradas** - As credenciais do Supabase não estão configuradas na Vercel

---

## ✅ Solução Passo a Passo

### Passo 1: Verificar Variáveis de Ambiente na Vercel

1. Acesse: https://vercel.com/dashboard
2. Selecione seu projeto **Nutri.IA**
3. Vá em: **Settings** → **Environment Variables**
4. Verifique se existem as seguintes variáveis:
   - `VITE_SUPABASE_URL` = `https://hflwyatppivyncocllnu.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = (sua chave anon do Supabase)
5. Se não existirem, adicione-as:
   - **Key**: `VITE_SUPABASE_URL`
   - **Value**: `https://hflwyatppivyncocllnu.supabase.co`
   - **Environment**: Production, Preview, Development (todas)
   - Clique em **Save**
   
   - **Key**: `VITE_SUPABASE_ANON_KEY`
   - **Value**: (cole sua chave anon do Supabase)
   - **Environment**: Production, Preview, Development (todas)
   - Clique em **Save**

6. **IMPORTANTE**: Após adicionar as variáveis, faça um **Redeploy**:
   - Vá em **Deployments**
   - Clique nos **3 pontos** (⋯) do deployment mais recente
   - Selecione **Redeploy**

### Passo 2: Verificar Configuração de Email Confirmation no Supabase

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em: **Authentication** → **Settings**
4. Verifique a opção **"Enable email confirmations"**:
   - **Se estiver ATIVADA**: Os usuários precisam confirmar o email antes de fazer login
   - **Se estiver DESATIVADA**: Os usuários podem fazer login imediatamente após criar a conta
5. **Recomendação para desenvolvimento**: Desative para simplificar o fluxo

### Passo 3: Criar Usuário de Teste

#### Opção A: Via Supabase Dashboard (Recomendado)

1. Acesse: https://supabase.com/dashboard
2. Vá em: **Authentication** → **Users**
3. Clique em: **"Add User"** ou **"Create User"**
4. Preencha:
   - **Email**: `teste@nutriai.com` (ou qualquer email válido)
   - **Password**: `Teste123456` (ou qualquer senha com pelo menos 6 caracteres)
   - **Auto Confirm User**: ✅ **MARCAR ESTA OPÇÃO** (importante!)
5. Clique em: **"Create User"**

#### Opção B: Via SQL (após criar o usuário)

Execute o script SQL: `criar_usuario_teste_login.sql` no Supabase SQL Editor para criar o perfil do usuário.

### Passo 4: Testar Login

1. Acesse seu app no Vercel
2. Tente fazer login com as credenciais criadas:
   - **Email**: `teste@nutriai.com`
   - **Senha**: `Teste123456`
3. Se ainda não funcionar, verifique o console do navegador (F12) para ver mensagens de erro mais detalhadas

---

## 🔍 Diagnóstico Avançado

### Verificar se o Usuário Existe

Execute no Supabase SQL Editor:

```sql
-- Verificar se o usuário existe
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
WHERE email = 'teste@nutriai.com';
```

**Se retornar vazio**: O usuário não existe. Crie-o via Dashboard.

**Se retornar com `email_confirmed_at = NULL`**: O email não está confirmado. Confirme manualmente ou desative email confirmation.

### Confirmar Email Manualmente

Se o email não estiver confirmado, execute:

```sql
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'teste@nutriai.com';
```

### Verificar Perfil do Usuário

Execute:

```sql
SELECT 
  au.email,
  au.email_confirmed_at,
  up.name,
  up.subscription_status
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.user_id
WHERE au.email = 'teste@nutriai.com';
```

**Se `up.name` for NULL**: O perfil não foi criado. Execute o script `criar_usuario_teste_login.sql`.

---

## 🆘 Problemas Comuns

### Problema 1: "Invalid login credentials" mesmo com credenciais corretas

**Causa**: Email não confirmado ou usuário não existe

**Solução**:
1. Verifique se o usuário existe no Supabase Dashboard
2. Confirme o email manualmente via SQL (veja acima)
3. Ou desative email confirmation no Supabase Dashboard

### Problema 2: Login funciona localmente mas não no Vercel

**Causa**: Variáveis de ambiente não configuradas na Vercel

**Solução**:
1. Verifique se `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` estão configuradas na Vercel
2. Faça um redeploy após adicionar as variáveis

### Problema 3: Erro 429 (Too Many Requests)

**Causa**: Muitas tentativas de login em pouco tempo

**Solução**:
1. Aguarde alguns minutos
2. Tente novamente

---

## 📝 Checklist de Verificação

Antes de reportar um problema, verifique:

- [ ] Variáveis de ambiente configuradas na Vercel (`VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`)
- [ ] Redeploy feito após adicionar variáveis de ambiente
- [ ] Usuário criado no Supabase Auth
- [ ] Email confirmado (`email_confirmed_at IS NOT NULL`)
- [ ] Perfil criado em `user_profiles`
- [ ] Email confirmation desativado (se não quiser confirmação)
- [ ] Credenciais corretas (email e senha)

---

## 🔗 Arquivos Relacionados

- `criar_usuario_teste_login.sql` - Script para criar usuário de teste
- `RESOLVER_LOGIN_INVALID_CREDENTIALS.md` - Guia geral para resolver problemas de login
- `CONFIGURAR_VARIAVEIS_VERCEL.md` - Guia para configurar variáveis na Vercel

---

## 💡 Dica Final

Para facilitar o desenvolvimento, recomendo:

1. **Desativar email confirmation** no Supabase Dashboard
2. **Criar usuários de teste** via Dashboard com "Auto Confirm User" marcado
3. **Usar senhas simples** para testes (ex: `Teste123456`)
4. **Documentar credenciais de teste** para a equipe

---

**Última atualização**: 2025-01-01

