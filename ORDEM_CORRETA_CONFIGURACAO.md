# 🎯 Ordem Correta de Configuração - Webhook Cakto

## 📋 Por Onde Começar?

**RESPOSTA:** Comece pelo **Supabase**, depois configure na **Cakto**.

---

## ✅ PASSO 1: Gerar Token Seguro

Primeiro, você precisa de um token seguro. Use um destes métodos:

### **Método 1: Online (Mais Fácil)**
1. Acesse: https://www.random.org/strings/
2. Configure:
   - **Length**: `40`
   - **Character set**: `Alphanumeric (A-Z, a-z, 0-9)`
3. Clique em **"Generate"**
4. **Copie o token gerado** e guarde em local seguro

### **Método 2: PowerShell (Windows)**
Abra o PowerShell e execute:
```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 40 | ForEach-Object {[char]$_})
```

**Exemplo de token gerado:**
```
Kx9mP2vQ7nR4tY8wZ1aB3cD5eF6gH7jK8lM9nO0pQ1rS2tU3vW4xY5zA6bC7dE8f
```

⚠️ **IMPORTANTE:** Guarde este token! Você vai usar ele em 2 lugares.

---

## ✅ PASSO 2: Adicionar Token no Supabase (PRIMEIRO)

### 1. Acessar o Dashboard
1. Abra: https://supabase.com/dashboard/project/hflwyatppivyncocllnu/settings/functions
2. Faça login se necessário

### 2. Adicionar Secret
1. Role a página até a seção **"Edge Function Secrets"**
2. Clique no botão **"Add or replace secrets"** (ou similar)
3. Preencha:
   - **Name**: `CAKTO_WEBHOOK_SECRET`
   - **Value**: Cole o token que você gerou no Passo 1
4. Clique em **"Save"** ou **"Add"**

### 3. Verificar
Você deve ver na lista de secrets:
```
CAKTO_WEBHOOK_SECRET    [hash]    [data atual]
```

✅ **Pronto! Supabase configurado.**

---

## ✅ PASSO 3: Configurar Webhook na Cakto (DEPOIS)

### 1. Acessar a Cakto
1. Faça login no painel da Cakto
2. Vá em **Webhooks** ou **Integrações**

### 2. Criar/Editar Webhook

#### **A. Preencher Campos Básicos:**
- **Nome**: `Nutri.ai - Supabase Webhook`
- **URL**: `https://hflwyatppivyncocllnu.supabase.co/functions/v1/cakto-webhook`
  ⚠️ **ATENÇÃO:** Certifique-se de escrever `webhook` (não `webhool`)

#### **B. Configurar Autenticação:**

**Se houver campo de autenticação visível:**
- **Tipo**: `Bearer Token` ou `Authorization Header`
- **Token/Secret**: Cole o **MESMO token** que você usou no Supabase

**Se NÃO houver campo visível:**
1. Procure por:
   - Botão "Configurações Avançadas"
   - Link "Autenticação" ou "Segurança"
   - Ícone de engrenagem ⚙️
   - Menu de três pontos (⋮)
2. Clique para expandir campos de autenticação
3. Preencha o token

**Se ainda não encontrar:**
1. **Salve o webhook primeiro** (mesmo com o erro)
2. Depois, **edite o webhook criado**
3. Procure por seção "Configurações" ou "Autenticação"

### 3. Selecionar Eventos (se houver opção)
Selecione os eventos que você quer escutar:
- ✅ `subscription_created`
- ✅ `subscription_updated`
- ✅ `subscription_canceled`

### 4. Salvar
Clique em **"Salvar"** ou **"Criar"**

✅ **Pronto! Cakto configurado.**

---

## ✅ PASSO 4: Verificar se Está Funcionando

### 1. Verificar no Supabase
1. Acesse: https://supabase.com/dashboard/project/hflwyatppivyncocllnu/functions/cakto-webhook/logs
2. Os logs devem aparecer quando a Cakto enviar eventos

### 2. Teste Manual (Opcional)

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

**Resposta esperada (sucesso):**
```json
{
  "success": true,
  "message": "Payment processed successfully",
  "user_id": "...",
  "plan_type": "monthly"
}
```

**Se retornar "Unauthorized":**
- ❌ Token não confere entre Cakto e Supabase
- Verifique se usou o **MESMO token** nos dois lugares

---

## 🚨 Troubleshooting

### ❌ "Credenciais não fornecidas" ainda aparece na Cakto

**Possíveis causas:**
1. Campo de token não foi preenchido
2. Token muito curto (use 40 caracteres)
3. Campo de autenticação não foi encontrado

**Soluções:**
1. **Tente salvar primeiro** e depois editar para configurar autenticação
2. **Procure em "Configurações Avançadas"** ou menu de três pontos
3. **Contate suporte da Cakto** se não encontrar nenhuma opção

### ❌ Webhook não funciona (retorna 401)

**Causa:** Tokens diferentes na Cakto e Supabase

**Solução:**
1. Verifique o token no Supabase (Dashboard → Settings → Functions → Secrets)
2. Verifique o token na Cakto (edite o webhook)
3. Certifique-se de que são **IDÊNTICOS**

---

## 📝 Checklist Final

### Supabase:
- [ ] Token gerado (40 caracteres)
- [ ] Secret `CAKTO_WEBHOOK_SECRET` adicionado
- [ ] Token visível na lista de secrets

### Cakto:
- [ ] URL corrigida (`cakto-webhook`, não `webhool`)
- [ ] Campo de autenticação encontrado e preenchido
- [ ] Token preenchido (mesmo do Supabase)
- [ ] Webhook salvo sem erros
- [ ] Eventos selecionados (se aplicável)

### Teste:
- [ ] Teste manual retornou sucesso
- [ ] Logs aparecem no Supabase quando eventos chegam

---

## 🎯 Resumo da Ordem

1. ✅ **Gerar token** (40 caracteres)
2. ✅ **Adicionar no Supabase** primeiro (como `CAKTO_WEBHOOK_SECRET`)
3. ✅ **Configurar na Cakto** depois (mesmo token)
4. ✅ **Testar** e verificar logs

---

**Última atualização**: 2025-01-27

