# 🔧 Corrigir Webhook na Cakto - Passo a Passo

## ⚠️ Problemas Identificados

1. **URL com erro de digitação**: `cakto-webhool` → deve ser `cakto-webhook`
2. **Credenciais não configuradas**: O campo de autenticação não está visível no formulário

---

## ✅ Solução Passo a Passo

### 1. **Corrigir a URL**

Na Cakto, altere a URL de:
```
https://hflwyatppivyncocllnu.supabase.co/functions/v1/cakto-webhool
```

Para:
```
https://hflwyatppivyncocllnu.supabase.co/functions/v1/cakto-webhook
```

⚠️ **Note a diferença**: `webhool` → `webhook` (faltava o "k")

---

### 2. **Configurar Credenciais de Autenticação**

O campo de credenciais pode estar em um destes lugares:

#### **Opção A: Botão "Configurações Avançadas" ou "Autenticação"**

1. Procure por um botão/link no formulário que diga:
   - "Configurações Avançadas"
   - "Autenticação"
   - "Segurança"
   - "Credenciais"
   - Ou um ícone de engrenagem ⚙️

2. Clique nele para expandir os campos de autenticação

3. Preencha:
   - **Tipo**: `Bearer Token` ou `Authorization Header`
   - **Token/Secret**: Cole um token seguro (40 caracteres)

#### **Opção B: Configurar Após Salvar**

Algumas versões da Cakto permitem configurar credenciais **depois** de salvar:

1. Primeiro, **salve o webhook** mesmo com o erro (após corrigir a URL)
2. Depois, procure por:
   - Botão "Editar" ou "Configurar" no webhook criado
   - Seção "Autenticação" ou "Segurança"
   - Aba "Configurações"

#### **Opção C: Campo Oculto/Expandível**

1. Procure por um botão **"+"** ou **"Adicionar"** ou **"Mais opções"**
2. Ou um link **"Configurar autenticação"**
3. Isso pode expandir campos adicionais

---

### 3. **Gerar Token Seguro**

Se ainda não tem um token, gere um de 40 caracteres:

**Opção 1 - Online:**
- Acesse: https://www.random.org/strings/
- Configure: 40 caracteres, letras e números
- Gere e copie

**Opção 2 - Manual:**
Use este exemplo (ou crie um similar):
```
Kx9mP2vQ7nR4tY8wZ1aB3cD5eF6gH7jK8lM9nO0pQ1rS2tU3vW4xY5zA6bC7dE8f
```

---

### 4. **Preencher Credenciais**

Quando encontrar o campo de autenticação, preencha:

- **Tipo de Autenticação**: `Bearer Token` (ou o que estiver disponível)
- **Token/Secret**: Cole o token gerado
- **OU** se for um campo único: Cole o token diretamente

---

### 5. **Adicionar o Mesmo Token no Supabase**

⚠️ **CRÍTICO**: Após configurar na Cakto, você **DEVE** adicionar o **MESMO token** no Supabase:

1. Acesse: https://supabase.com/dashboard/project/hflwyatppivyncocllnu/settings/functions
2. Role até **"Edge Function Secrets"**
3. Clique em **"Add or replace secrets"**
4. Preencha:
   - **Name**: `CAKTO_WEBHOOK_SECRET`
   - **Value**: Cole o **MESMO token** usado na Cakto
5. Clique em **"Save"**

---

## 📋 Checklist Completo

- [ ] URL corrigida: `cakto-webhook` (não `cakto-webhool`)
- [ ] Token gerado (40 caracteres)
- [ ] Campo de autenticação encontrado e preenchido na Cakto
- [ ] Token adicionado no Supabase como `CAKTO_WEBHOOK_SECRET`
- [ ] Tokens são idênticos em ambos os lugares
- [ ] Webhook salvo sem erros
- [ ] Teste realizado com sucesso

---

## 🔍 Se Não Encontrar o Campo de Credenciais

### **Tente estas ações:**

1. **Salvar primeiro e editar depois:**
   - Salve o webhook (com URL corrigida)
   - Depois clique em "Editar" no webhook criado
   - Procure por seção "Autenticação"

2. **Verificar menu lateral:**
   - Pode haver uma aba "Configurações" ou "Segurança"
   - Ou um menu de três pontos (⋮) com opções

3. **Contatar suporte da Cakto:**
   - Se não encontrar nenhuma opção de autenticação
   - Pode ser que a versão da Cakto não suporte Bearer Token
   - Nesse caso, pode ser necessário usar outro método

---

## 🧪 Testar Após Configurar

```bash
curl -X POST 'https://hflwyatppivyncocllnu.supabase.co/functions/v1/cakto-webhook' \
  -H 'Authorization: Bearer SEU_TOKEN_AQUI' \
  -H 'Content-Type: application/json' \
  -d '{
    "event_type": "subscription_created",
    "email": "teste@exemplo.com",
    "plan_code": "MONTHLY"
  }'
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Payment processed successfully",
  ...
}
```

---

**Última atualização**: 2025-01-27

