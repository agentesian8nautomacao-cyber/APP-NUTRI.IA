# 🔧 Solução: Configurar Cakto Sem Campo de Autenticação

## 🎯 Problema

A Cakto não mostra o campo "Chave Secreta" no formulário, mas exige credenciais.

---

## ✅ SOLUÇÃO 1: Salvar e Configurar Depois (RECOMENDADO)

### Passo a Passo:

1. **Corrigir a URL primeiro:**
   - Mude de `cakto-webhool` para `cakto-webhook`

2. **Salvar o webhook mesmo com o erro:**
   - Preencha: Nome, URL, Produtos, Eventos
   - Clique em **"Salvar"** (mesmo com o aviso de credenciais)
   - O webhook será criado

3. **Editar o webhook criado:**
   - Encontre o webhook na lista
   - Clique em **"Editar"** ou nos **três pontos (⋮)**
   - Procure por:
     - Campo "Chave Secreta" ou "Secret Key"
     - Seção "Configurações" ou "Autenticação"
     - Aba "Segurança"

4. **Preencher a chave secreta:**
   - Gere uma chave (40 caracteres)
   - Preencha no campo encontrado
   - Salve novamente

---

## ✅ SOLUÇÃO 2: Webhook Sem Autenticação (TEMPORÁRIO)

Se a Cakto realmente não permite configurar autenticação, podemos tornar o webhook opcional temporariamente.

⚠️ **ATENÇÃO:** Isso reduz a segurança. Use apenas para testes!

### Modificar o Webhook:

O webhook atual exige autenticação. Podemos criar uma versão que:
- Aceita requisições sem autenticação (com log de aviso)
- Ou valida via outro método (ex: IP whitelist, signature no corpo)

---

## ✅ SOLUÇÃO 3: Usar API da Cakto para Configurar

A Cakto tem uma API REST. Podemos configurar o webhook via API:

### 1. Obter Token de Acesso

```bash
curl -X POST https://api.cakto.com.br/o/token/ \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=SEU_CLIENT_ID" \
  -d "client_secret=SEU_CLIENT_SECRET" \
  -d "grant_type=client_credentials"
```

### 2. Criar Webhook via API

```bash
curl -X POST https://api.cakto.com.br/api/webhooks/ \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nutri.ai - Supabase Webhook",
    "url": "https://hflwyatppivyncocllnu.supabase.co/functions/v1/cakto-webhook",
    "secret": "SUA_CHAVE_SECRETA_AQUI",
    "events": ["subscription_created", "subscription_updated", "subscription_canceled"]
  }'
```

**Referência:** [Documentação da API Cakto](https://docs.cakto.com.br/api-reference/webhooks/create)

---

## 🚀 SOLUÇÃO RÁPIDA: Tentar Agora

### 1. Corrigir URL
Na Cakto, altere:
```
https://hflwyatppivyncocllnu.supabase.co/functions/v1/cakto-webhool
```
Para:
```
https://hflwyatppivyncocllnu.supabase.co/functions/v1/cakto-webhook
```

### 2. Tentar Salvar
- Clique em **"Salvar"** mesmo com o aviso
- Veja se o webhook é criado

### 3. Se Salvar com Sucesso
- Edite o webhook criado
- Procure por campo de autenticação
- Configure depois

### 4. Se NÃO Salvar
- Tente via API (Solução 3)
- Ou modifique o webhook para aceitar sem autenticação (temporário)

---

## 📝 Próximos Passos

1. **Tente a Solução 1 primeiro** (salvar e editar depois)
2. **Se não funcionar**, me avise e eu:
   - Modifico o webhook para aceitar sem autenticação (temporário)
   - Ou te ajudo a configurar via API

---

**Última atualização**: 2025-01-27



