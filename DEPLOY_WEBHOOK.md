# Como Fazer Deploy da Edge Function cakto-webhook

## ✅ Correções Aplicadas

Todas as chamadas a `getUserByEmail` foram corrigidas para usar a função helper que utiliza `listUsers()`:

- ✅ `processPaymentApproved` - corrigido
- ✅ `processRefund` - corrigido  
- ✅ `processSubscriptionCancelled` - corrigido

## 🚀 Deploy

### Opção 1: Usando Supabase CLI (Recomendado)

```bash
# Navegue até a pasta do projeto
cd E:\Nutri.IA

# Faça o deploy da função
supabase functions deploy cakto-webhook
```

**Nota:** Se você não tiver o Supabase CLI instalado:
```bash
# Instalar Supabase CLI (se necessário)
npm install -g supabase
```

### Opção 2: Via Supabase Dashboard

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **Edge Functions** → **cakto-webhook**
4. Clique em **Deploy** ou **Redeploy**
5. Faça upload do arquivo `supabase/functions/cakto-webhook/index.ts`

### Opção 3: Usando Supabase CLI Link + Deploy

Se você ainda não vinculou o projeto local ao Supabase:

```bash
# Fazer login no Supabase
supabase login

# Vincular ao projeto (se necessário)
supabase link --project-ref hflwyatppivyncocllnu

# Fazer deploy
supabase functions deploy cakto-webhook
```

## ✅ Verificar Deploy

Após o deploy, você pode verificar se está funcionando:

1. **Teste o health check:**
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

2. **Verifique os logs:**
   - Dashboard → Edge Functions → cakto-webhook → Logs
   - Procure por mensagens de sucesso ou erro

## 🔍 Se Ainda Der Erro

Se após o deploy ainda aparecer o erro `getUserByEmail is not a function`, verifique:

1. ✅ O arquivo foi salvo corretamente
2. ✅ O deploy foi concluído com sucesso
3. ✅ Aguarde alguns segundos para o cache limpar
4. ✅ Teste novamente enviando um evento da Cakto

## 📋 Checklist Pós-Deploy

- [ ] Deploy concluído sem erros
- [ ] Health check retorna status "ok"
- [ ] Secrets configurados corretamente (Cakto e Supabase com mesmo valor)
- [ ] Teste com evento `purchase_approved` funciona
- [ ] Logs não mostram mais erro de `getUserByEmail`

