# 🔧 Solução: "Conta não encontrada" para Desenvolvedor

## ❌ Problema

Ao tentar fazer login com `paulohmorais@hotmail.com` no app Vercel, aparece:
> "Conta não encontrada. Por favor, crie uma conta primeiro usando 'Criar Conta' ou 'Testar Grátis por 3 dias'."

## 🔍 Causa

O usuário existe em `user_profiles`, mas **não existe em `auth.users`** (tabela de autenticação do Supabase).

## ✅ Solução

### Passo 1: Verificar se o usuário existe em auth.users

Execute esta query no **SQL Editor** do Supabase:

```sql
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users
WHERE email = 'paulohmorais@hotmail.com';
```

**Se retornar vazio:** O usuário não existe em `auth.users` → Continue para Passo 2

**Se retornar dados:** O usuário existe → Pule para Passo 3

---

### Passo 2: Criar Usuário no Authentication (IMPORTANTE!)

1. Acesse: [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **Authentication** → **Users**
4. Clique em **"Add User"** ou **"Create User"**
5. Preencha:
   - **Email:** `paulohmorais@hotmail.com`
   - **Password:** `phm705412`
   - **Auto Confirm User:** ✅ **MARCAR ESTA OPÇÃO** (muito importante!)
6. Clique em **"Create User"**

---

### Passo 3: Verificar e Corrigir Perfil

Após criar o usuário no Authentication, execute o script `verificar_e_corrigir_desenvolvedor.sql` no SQL Editor:

```sql
-- Execute o arquivo: verificar_e_corrigir_desenvolvedor.sql
```

Este script:
- ✅ Verifica se o usuário existe em `auth.users`
- ✅ Verifica se o perfil existe em `user_profiles`
- ✅ Cria/atualiza o perfil com as configurações corretas
- ✅ Garante que o desenvolvedor tenha acesso completo

---

### Passo 4: Verificar Resultado Final

Execute esta query para confirmar que tudo está correto:

```sql
SELECT 
  u.email,
  u.email_confirmed_at IS NOT NULL as email_confirmado,
  up.name,
  up.plan_type,
  up.subscription_status,
  up.voice_daily_limit_seconds,
  up.daily_free_minutes
FROM auth.users u
LEFT JOIN user_profiles up ON up.user_id = u.id
WHERE u.email = 'paulohmorais@hotmail.com';
```

**Resultado esperado:**
- ✅ `email_confirmado` = `true`
- ✅ `plan_type` = `monthly`
- ✅ `subscription_status` = `active`
- ✅ `voice_daily_limit_seconds` = `900`
- ✅ `daily_free_minutes` = `15`

---

### Passo 5: Testar Login no App

1. Acesse: https://app-nutri-ia.vercel.app/
2. Clique em **"Já tenho uma conta"** ou **"Entrar"**
3. Digite:
   - **Email:** `paulohmorais@hotmail.com`
   - **Senha:** `phm705412`
4. Clique em **"Entrar"**

**Se funcionar:**
- ✅ O app deve reconhecer automaticamente como desenvolvedor
- ✅ Acesso completo a todas as funcionalidades
- ✅ Sem bloqueios de trial ou limites

**Se ainda não funcionar:**
- Verifique se o email está correto (sem espaços)
- Verifique se a senha está correta
- Aguarde alguns segundos e tente novamente (pode haver delay de sincronização)

---

## 🔄 Para o Desenvolvedor Breno

Repita os mesmos passos para o desenvolvedor Breno:

1. **Email:** `19brenobernardes@gmail.com`
2. **Senha:** `Centuryfox21!`
3. Criar em **Authentication** → **Users** → **Add User**
4. Marcar **Auto Confirm User**
5. Executar script de verificação

---

## 📝 Notas Importantes

- ⚠️ **O usuário DEVE ser criado em `auth.users` primeiro** (via Dashboard)
- ⚠️ **O perfil em `user_profiles` é criado automaticamente ou via script SQL**
- ⚠️ **"Auto Confirm User" é ESSENCIAL** para permitir login imediato
- ✅ O app reconhece desenvolvedores automaticamente pelo email
- ✅ Acesso completo é concedido independente do `plan_type`

---

## 🆘 Se Ainda Não Funcionar

1. Verifique se as variáveis de ambiente do Vercel estão corretas
2. Verifique se o projeto Supabase está conectado corretamente
3. Limpe o cache do navegador e tente novamente
4. Verifique os logs do Supabase em **Authentication** → **Logs**

