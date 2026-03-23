# 🔗 Configurar Webhook na Cakto - Guia Oficial

Baseado na [documentação oficial da Cakto](https://docs.cakto.com.br/introduction)

---

## 📋 Passo a Passo Completo

### ✅ PASSO 1: Gerar Chave Secreta

A Cakto usa uma **"Chave Secreta"** (Secret Key) para validar os webhooks. Gere uma chave segura:

**Opção 1 - Online (Recomendado):**
1. Acesse: https://www.random.org/strings/
2. Configure:
   - **Length**: `40`
   - **Character set**: `Alphanumeric (A-Z, a-z, 0-9)`
3. Gere e copie a chave

**Opção 2 - Manual:**
Crie uma string de 40 caracteres com letras e números.

**Exemplo:**
```
Kx9mP2vQ7nR4tY8wZ1aB3cD5eF6gH7jK8lM9nO0pQ1rS2tU3vW4xY5zA6bC7dE8f
```

⚠️ **GUARDE ESTA CHAVE!** Você vai usar ela em 2 lugares.

---

### ✅ PASSO 2: Adicionar Chave no Supabase (PRIMEIRO)

1. **Acesse o Dashboard:**
   - https://supabase.com/dashboard/project/hflwyatppivyncocllnu/settings/functions

2. **Adicionar Secret:**
   - Role até **"Edge Function Secrets"**
   - Clique em **"Add or replace secrets"**
   - Preencha:
     - **Name**: `CAKTO_WEBHOOK_SECRET`
     - **Value**: Cole a chave secreta gerada
   - Clique em **"Save"**

3. **Verificar:**
   - Você deve ver `CAKTO_WEBHOOK_SECRET` na lista de secrets

✅ **Supabase configurado!**

---

### ✅ PASSO 3: Configurar Webhook na Cakto (DEPOIS)

#### 1. **Acessar a Seção de Webhooks**

1. Faça login no [Painel da Cakto](https://painel.cakto.com.br)
2. Vá em **"Integrações"** → **"Webhooks"**
3. Clique em **"Adicionar Webhook"** ou **"Adicionar"**

#### 2. **Preencher o Formulário**

Preencha os campos conforme a [documentação oficial](https://docs.cakto.com.br/api-reference/webhooks/create):

**Nome:**
```
Nutri.ai - Supabase Webhook
```

**URL:**
```
https://hflwyatppivyncocllnu.supabase.co/functions/v1/cakto-webhook
```
⚠️ **ATENÇÃO:** Certifique-se de escrever `webhook` corretamente (não `webhool`)

**Produtos:**
- Selecione os produtos relevantes (ex: "P50 Academia", "Upsell", etc.)

**Eventos:**
- Selecione os eventos que deseja monitorar:
  - ✅ `Boleto gerado`
  - ✅ `Pix gerado`
  - ✅ `Compra aprovada` (subscription_created)
  - ✅ `Compra recusada` (subscription_canceled)

**Chave Secreta:**
- ⚠️ **ESTE É O CAMPO IMPORTANTE!**
- Cole a **MESMA chave secreta** que você usou no Supabase
- Este campo pode estar:
  - Visível no formulário
  - Em "Configurações Avançadas"
  - Ou aparecer após salvar (editar depois)

#### 3. **Salvar o Webhook**

Clique em **"Salvar"** ou **"Criar"**

✅ **Cakto configurado!**

---

## 🔍 Se o Campo "Chave Secreta" Não Aparecer

### **Opção A: Salvar e Editar Depois**

1. Preencha os campos básicos (Nome, URL, Produtos, Eventos)
2. **Salve o webhook** (mesmo com o aviso de credenciais)
3. Depois, **edite o webhook criado**
4. Procure por:
   - Seção "Configurações"
   - Campo "Chave Secreta" ou "Secret Key"
   - Opção "Autenticação" ou "Segurança"

### **Opção B: Configurações Avançadas**

1. Procure por um botão/link:
   - "Configurações Avançadas"
   - "Mais opções"
   - Ícone de engrenagem ⚙️
   - Menu de três pontos (⋮)
2. Clique para expandir campos adicionais
3. Preencha a "Chave Secreta"

---

## ✅ PASSO 4: Verificar Funcionamento

### 1. **Testar via Painel da Cakto**

1. No painel, vá em **Webhooks**
2. Encontre o webhook criado
3. Clique nos **três pontos (⋮)** ao lado
4. Selecione **"Enviar evento de teste"**
5. Escolha um evento e envie

### 2. **Verificar Logs no Supabase**

1. Acesse: https://supabase.com/dashboard/project/hflwyatppivyncocllnu/functions/cakto-webhook/logs
2. Procure por:
   - `📥 Webhook recebido:` → Webhook chegou
   - `✅ Pagamento processado:` → Processado com sucesso
   - `❌ Plano não mapeado:` → Plano desconhecido

### 3. **Teste Manual (Opcional)**

```bash
curl -X POST 'https://hflwyatppivyncocllnu.supabase.co/functions/v1/cakto-webhook' \
  -H 'Authorization: Bearer SUA_CHAVE_SECRETA_AQUI' \
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
  "user_id": "...",
  "plan_type": "monthly"
}
```

---

## 🚨 Resolver "Credenciais Não Fornecidas"

### **Causa:**
O campo **"Chave Secreta"** não foi preenchido ou não foi encontrado.

### **Solução:**

1. **Se o campo está visível:**
   - Preencha com a chave secreta gerada
   - Use a **MESMA chave** do Supabase

2. **Se o campo NÃO está visível:**
   - Salve o webhook primeiro
   - Depois edite e procure por "Chave Secreta"
   - Ou procure em "Configurações Avançadas"

3. **Verificar se foi salvo:**
   - Edite o webhook criado
   - Verifique se a "Chave Secreta" está preenchida
   - Se não estiver, preencha e salve novamente

---

## 📝 Checklist Final

### Supabase:
- [ ] Chave secreta gerada (40 caracteres)
- [ ] Secret `CAKTO_WEBHOOK_SECRET` adicionado
- [ ] Chave visível na lista de secrets

### Cakto:
- [ ] Nome preenchido
- [ ] URL corrigida (`cakto-webhook`, não `webhool`)
- [ ] Produtos selecionados
- [ ] Eventos selecionados
- [ ] **Chave Secreta preenchida** (mesma do Supabase)
- [ ] Webhook salvo sem erros

### Teste:
- [ ] Evento de teste enviado via painel da Cakto
- [ ] Logs aparecem no Supabase
- [ ] Teste manual retornou sucesso (se aplicável)

---

## 📚 Referências

- [Documentação Oficial da Cakto](https://docs.cakto.com.br/introduction)
- [Criar Webhook - API Reference](https://docs.cakto.com.br/api-reference/webhooks/create)
- [Como Funcionam os Webhooks - Ajuda Cakto](https://ajuda.cakto.com.br/pt/article/como-funcionam-os-webhooks-1l9m78k/)

---

## 🎯 Resumo da Ordem

1. ✅ **Gerar chave secreta** (40 caracteres)
2. ✅ **Adicionar no Supabase** como `CAKTO_WEBHOOK_SECRET`
3. ✅ **Configurar na Cakto** (preencher campo "Chave Secreta")
4. ✅ **Testar** via painel da Cakto

⚠️ **IMPORTANTE:** Use a **MESMA chave secreta** nos dois lugares!

---

**Última atualização**: 2025-01-27
**Baseado em**: [Documentação Oficial da Cakto](https://docs.cakto.com.br/introduction)



