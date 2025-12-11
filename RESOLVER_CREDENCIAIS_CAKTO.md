# 🔐 Resolver "Credenciais Não Fornecidas" na Cakto

## ⚠️ Problema

Ao criar o webhook na Cakto, aparece a mensagem:
> **"As credenciais não foram fornecidas"**

Isso significa que a Cakto está pedindo um token/secret de autenticação.

---

## 🔧 Solução Passo a Passo

### 1. **Gerar um Token Seguro**

Primeiro, você precisa gerar um token seguro. Use um destes métodos:

#### **Opção A: Gerar no PowerShell (Windows)**

Abra o PowerShell e execute:

```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 40 | ForEach-Object {[char]$_})
```

Isso gerará um token aleatório de 40 caracteres. **Copie e guarde este token!**

#### **Opção B: Gerar Online**

Acesse: https://www.random.org/strings/
- Configure: 40 caracteres, letras e números
- Gere e copie o token

#### **Opção C: Usar um Token que Você Já Tem**

Se você já tem um token configurado em outro lugar, pode reutilizá-lo (desde que seja seguro).

---

### 2. **Preencher o Formulário na Cakto**

Quando criar o webhook, você provavelmente verá campos como:

#### **Campos Obrigatórios:**

1. **Nome da Integração:**
   ```
   Nutri.ai - Supabase Webhook
   ```

2. **URL:**
   ```
   https://hflwyatppivyncocllnu.supabase.co/functions/v1/cakto-webhook
   ```

3. **Credenciais/Autenticação** (o que está faltando):
   - **Tipo**: `Bearer Token` ou `Authorization Header` ou `Secret`
   - **Token/Secret**: Cole o token que você gerou no passo 1

   **Exemplo de como preencher:**
   ```
   Tipo: Bearer Token
   Token: AbC123XyZ789... (seu token de 40 caracteres)
   ```

   **OU se for um campo único:**
   ```
   Secret: AbC123XyZ789... (seu token de 40 caracteres)
   ```

---

### 3. **Adicionar o Mesmo Token no Supabase**

Após salvar na Cakto, você **DEVE** adicionar o **MESMO token** no Supabase:

1. Acesse: https://supabase.com/dashboard/project/hflwyatppivyncocllnu/settings/functions
2. Role até **"Edge Function Secrets"**
3. Clique em **"Add or replace secrets"**
4. Preencha:
   - **Name**: `CAKTO_WEBHOOK_SECRET`
   - **Value**: Cole o **MESMO token** que você usou na Cakto
5. Clique em **"Save"**

⚠️ **CRÍTICO:** O token na Cakto e no Supabase **DEVEM SER IDÊNTICOS**!

---

## 📋 Exemplo Completo de Configuração

### **Na Cakto:**

```
Nome: Nutri.ai - Supabase Webhook
URL: https://hflwyatppivyncocllnu.supabase.co/functions/v1/cakto-webhook
Tipo de Autenticação: Bearer Token
Token: Kx9mP2vQ7nR4tY8wZ1aB3cD5eF6gH7jK8lM9nO0pQ1rS2tU3vW4xY5zA6bC7dE8f
```

### **No Supabase (Edge Function Secrets):**

```
Name: CAKTO_WEBHOOK_SECRET
Value: Kx9mP2vQ7nR4tY8wZ1aB3cD5eF6gH7jK8lM9nO0pQ1rS2tU3vW4xY5zA6bC7dE8f
```

*(Use o mesmo token em ambos os lugares!)*

---

## 🔍 Se Não Encontrar o Campo de Credenciais

Algumas versões da Cakto podem ter o campo em lugares diferentes:

1. **Durante a criação do webhook:**
   - Procure por: "Autenticação", "Credenciais", "Bearer Token", "Secret", "Authorization"

2. **Após criar o webhook:**
   - Pode haver uma opção "Editar" ou "Configurar" onde você adiciona as credenciais depois

3. **Na configuração geral:**
   - Verifique se há uma seção "Configurações" ou "Segurança" no webhook

---

## ✅ Verificar se Está Funcionando

### 1. **Teste Manual**

Use este comando (substitua `SEU_TOKEN` pelo token real):

```bash
curl -X POST 'https://hflwyatppivyncocllnu.supabase.co/functions/v1/cakto-webhook' \
  -H 'Authorization: Bearer SEU_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "event_type": "subscription_created",
    "email": "teste@exemplo.com",
    "plan_code": "MONTHLY"
  }'
```

**Se retornar:**
```json
{
  "success": true,
  "message": "Payment processed successfully",
  ...
}
```
✅ **Funcionou!**

**Se retornar:**
```
Unauthorized
```
❌ **Token não confere** - Verifique se é o mesmo na Cakto e no Supabase

---

## 🚨 Troubleshooting

### ❌ "Credenciais não fornecidas" ainda aparece

**Possíveis causas:**
1. Campo de token não foi preenchido
2. Token muito curto (use pelo menos 32 caracteres)
3. Token contém caracteres inválidos (use apenas letras e números)

**Solução:**
- Gere um novo token de 40 caracteres (letras e números)
- Preencha novamente na Cakto
- Adicione o mesmo token no Supabase

### ❌ Webhook criado mas não funciona

**Verificar:**
1. ✅ Token configurado na Cakto?
2. ✅ Token configurado no Supabase?
3. ✅ Tokens são idênticos?
4. ✅ URL está correta?
5. ✅ Função `cakto-webhook` está deployada?

---

## 📝 Checklist Final

- [ ] Token gerado (40 caracteres, letras e números)
- [ ] Token preenchido na Cakto (campo de credenciais)
- [ ] Token adicionado no Supabase como `CAKTO_WEBHOOK_SECRET`
- [ ] Tokens são idênticos em ambos os lugares
- [ ] Webhook salvo na Cakto sem erros
- [ ] Teste manual retornou sucesso

---

**Última atualização**: 2025-01-27

