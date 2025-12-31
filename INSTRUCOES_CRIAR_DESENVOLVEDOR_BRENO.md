# 🛠️ Instruções para Criar Desenvolvedor 1: Breno

## 📋 Informações do Desenvolvedor
- **Email:** `19brenobernardes@gmail.com`
- **Senha:** `Centuryfox21!`

## 🚀 Passo a Passo

### **Passo 1: Criar Usuário no Supabase Authentication**

1. Acesse o **Supabase Dashboard**
2. Vá em **Authentication** > **Users**
3. Clique em **"Add User"** ou **"Create User"**
4. Preencha:
   - **Email:** `19brenobernardes@gmail.com`
   - **Password:** `Centuryfox21!`
   - **Auto Confirm User:** ✅ (marque esta opção para não precisar confirmar email)
5. Clique em **"Create User"**

### **Passo 2: Executar Script SQL**

1. No Supabase Dashboard, vá em **SQL Editor**
2. Clique em **"New Query"**
3. Copie e cole o conteúdo do arquivo `criar_desenvolvedor_breno.sql`
4. Clique em **"Run"** ou pressione `Ctrl + Enter`
5. Verifique se apareceu a mensagem de sucesso

### **Passo 3: Verificar Criação**

Execute esta query para verificar se tudo foi criado corretamente:

```sql
SELECT 
    u.email,
    u.email_confirmed_at,
    up.name,
    up.plan_type,
    up.subscription_status,
    up.subscription_expiry,
    up.voice_daily_limit_seconds,
    up.daily_free_minutes
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.user_id
WHERE u.email = '19brenobernardes@gmail.com';
```

**Resultado esperado:**
- ✅ Email: `19brenobernardes@gmail.com`
- ✅ `email_confirmed_at` não deve ser NULL
- ✅ `plan_type`: `monthly`
- ✅ `subscription_status`: `active`
- ✅ `voice_daily_limit_seconds`: `900` (15 minutos)
- ✅ `daily_free_minutes`: `15`

### **Passo 4: Testar Login**

1. Acesse o app
2. Clique em **"Entrar"**
3. Digite:
   - Email: `19brenobernardes@gmail.com`
   - Senha: `Centuryfox21!`
4. Clique em **"Entrar"**

## ⚠️ Problemas Comuns

### **Erro: "Usuário não encontrado em auth.users"**
- **Solução:** Certifique-se de que o usuário foi criado no Passo 1 antes de executar o script SQL

### **Erro: "Email ou senha incorretos"**
- **Solução:** 
  1. Verifique se o email está correto: `19brenobernardes@gmail.com`
  2. Verifique se a senha está correta: `Centuryfox21!` (com maiúscula C e ! no final)
  3. Verifique se o usuário foi criado com "Auto Confirm User" marcado
  4. Tente resetar a senha no Supabase Dashboard se necessário

### **Erro: "Email not confirmed"**
- **Solução:** 
  1. No Supabase Dashboard > Authentication > Users
  2. Encontre o usuário `19brenobernardes@gmail.com`
  3. Clique nos três pontos (...) > **"Send confirmation email"** ou marque **"Confirm email"** manualmente

## 📝 Notas Importantes

- O desenvolvedor terá acesso completo a todas as funcionalidades
- O desenvolvedor verá todas as enquetes e funcionalidades do app
- O desenvolvedor não terá bloqueios de trial ou limites restritivos
- O plano está configurado como `monthly` com status `active` por 1 ano

## 🔗 Arquivos Relacionados

- `criar_desenvolvedor_breno.sql` - Script SQL para criar/atualizar o perfil
- `CRIAR_DESENVOLVEDORES_SUPABASE.md` - Guia completo para desenvolvedores

