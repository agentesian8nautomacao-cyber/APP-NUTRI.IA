# 🔧 Resolver Problema de Login - Desenvolvedor Breno

## Erro: "Invalid login credentials"

Este erro geralmente ocorre quando:
1. A senha no Supabase não corresponde à senha digitada
2. O usuário não foi criado corretamente no Authentication
3. A senha precisa ser resetada

## ✅ Solução 1: Resetar Senha no Supabase

### Passo a Passo:

1. **Acesse o Supabase Dashboard**
   - Vá em **Authentication** > **Users**
   - Procure pelo email: `19brenobernardes@gmail.com`

2. **Editar Usuário**
   - Clique nos **três pontos (...)** ao lado do usuário
   - Selecione **"Reset Password"** ou **"Edit User"**

3. **Definir Nova Senha**
   - Se houver opção de editar senha diretamente:
     - **Password:** `Centuryfox21!`
     - Clique em **"Update"** ou **"Save"**
   - Se não houver, use **"Reset Password"**:
     - Isso enviará um email de reset (pode não funcionar se o email não estiver verificado)
     - Ou use a opção de definir senha manualmente

4. **Verificar Email Confirmado**
   - Certifique-se de que **"Email Confirmed"** está marcado
   - Se não estiver, clique em **"Confirm Email"** manualmente

## ✅ Solução 2: Recriar Usuário

Se a Solução 1 não funcionar, recrie o usuário:

1. **Deletar Usuário Existente**
   - No Supabase Dashboard > Authentication > Users
   - Encontre `19brenobernardes@gmail.com`
   - Clique nos três pontos (...) > **"Delete User"**
   - Confirme a exclusão

2. **Criar Novo Usuário**
   - Clique em **"Add User"** ou **"Create User"**
   - Preencha:
     - **Email:** `19brenobernardes@gmail.com`
     - **Password:** `Centuryfox21!` (atenção: C maiúsculo e ! no final)
     - **Auto Confirm User:** ✅ (MARCAR ESTA OPÇÃO)
   - Clique em **"Create User"**

3. **Executar Script SQL**
   - Vá em **SQL Editor**
   - Execute o script `criar_desenvolvedor_breno.sql`
   - Verifique se apareceu mensagem de sucesso

4. **Testar Login**
   - Acesse o app
   - Tente fazer login novamente

## ✅ Solução 3: Verificar Credenciais

Certifique-se de que está digitando exatamente:

- **Email:** `19brenobernardes@gmail.com` (sem espaços)
- **Senha:** `Centuryfox21!` 
  - C maiúsculo
  - ! no final
  - Sem espaços antes ou depois

## ✅ Solução 4: Verificar no Supabase

Execute esta query no SQL Editor para verificar o usuário:

```sql
SELECT 
    u.id,
    u.email,
    u.email_confirmed_at,
    u.created_at,
    u.last_sign_in_at,
    up.name,
    up.plan_type,
    up.subscription_status
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.user_id
WHERE u.email = '19brenobernardes@gmail.com';
```

**Verifique:**
- ✅ `email_confirmed_at` não deve ser NULL
- ✅ `up.name` deve ser "Breno Bernardes"
- ✅ `up.plan_type` deve ser "monthly"
- ✅ `up.subscription_status` deve ser "active"

## 🔍 Debug Adicional

Se ainda não funcionar, verifique:

1. **Console do Navegador**
   - Abra o DevTools (F12)
   - Vá na aba **Network**
   - Tente fazer login
   - Veja a requisição para `/auth/v1/token`
   - Verifique o erro retornado

2. **Supabase Logs**
   - No Supabase Dashboard > **Logs** > **Auth Logs**
   - Veja se há tentativas de login registradas
   - Verifique se há erros específicos

3. **Testar com Outro Email**
   - Tente criar um usuário de teste com outro email
   - Se funcionar, o problema é específico deste usuário

## 📝 Notas Importantes

- A senha no Supabase é case-sensitive (diferencia maiúsculas de minúsculas)
- Caracteres especiais como `!` devem ser digitados exatamente
- O email deve estar confirmado para fazer login
- Se usar "Reset Password", o link expira em algumas horas

## 🆘 Se Nada Funcionar

1. Verifique se o projeto Supabase está correto
2. Verifique se as variáveis de ambiente estão configuradas corretamente
3. Tente criar um novo usuário de teste para verificar se o problema é geral ou específico

