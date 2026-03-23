# Como Fazer Deploy da Função cakto-webhook

## 🚨 Situação Atual

A função `cakto-webhook` existe localmente mas **não está deployada** no Supabase. No dashboard você só vê `super-action`.

## ✅ Opção 1: Deploy via Dashboard (Mais Fácil)

### Passo a Passo:

1. **Acesse o Supabase Dashboard:**
   - Vá para: https://supabase.com/dashboard
   - Selecione seu projeto

2. **Navegue até Edge Functions:**
   - Menu lateral: **Edge Functions**
   - Clique em **"Create a new function"** ou **"+ New Function"**

3. **Crie a função:**
   - **Function name:** `cakto-webhook`
   - **Copy code from:** Selecione "Start from scratch" ou "Upload file"

4. **Faça upload do código:**
   - Abra o arquivo: `supabase/functions/cakto-webhook/index.ts`
   - Copie todo o conteúdo e cole no editor do dashboard
   - Ou use a opção de upload de arquivo

5. **Configure os Secrets:**
   - Vá em **Edge Functions** → **cakto-webhook** → **Secrets**
   - Certifique-se de que estes secrets existem:
     - `CAKTO_WEBHOOK_SECRET` = `807b102d-5dff-4a82-97a9-110bf6966f44`
     - `SUPABASE_URL` (já deve existir)
     - `SUPABASE_SERVICE_ROLE_KEY` (já deve existir)

6. **Deploy:**
   - Clique em **Deploy** ou **Save**

## ✅ Opção 2: Deploy via CLI (Precisa Login)

### Passo 1: Fazer Login

```bash
supabase login
```

Isso abrirá o navegador para autenticação.

### Passo 2: Fazer Deploy

```bash
cd E:\Nutri.IA
supabase functions deploy cakto-webhook --project-ref hflwyatppivyncocllnu
```

## 🔍 Verificar se Funcionou

Após o deploy, teste:

```bash
curl https://hflwyatppivyncocllnu.supabase.co/functions/v1/cakto-webhook
```

Deve retornar:
```json
{
  "status": "ok",
  "service": "cakto-webhook",
  "supported_methods": ["POST"]
}
```

## 📋 Checklist

- [ ] Função `cakto-webhook` aparece no dashboard do Supabase
- [ ] Endpoint URL está disponível: `https://hflwyatppivyncocllnu.supabase.co/functions/v1/cakto-webhook`
- [ ] Health check retorna status "ok"
- [ ] Secrets configurados (especialmente `CAKTO_WEBHOOK_SECRET`)
- [ ] Teste com evento da Cakto funciona sem erro `getUserByEmail`

## ⚠️ Importante

Após o deploy, **certifique-se de que o secret `CAKTO_WEBHOOK_SECRET` está configurado** na função:
- Valor: `807b102d-5dff-4a82-97a9-110bf6966f44`
- Deve corresponder ao secret configurado na plataforma Cakto

