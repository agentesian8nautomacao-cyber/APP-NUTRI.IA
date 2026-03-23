# Status do Reconhecimento de Pagamentos - Cakto Webhook

## 📊 Resumo

O app **reconhece pagamentos automaticamente** via webhook da Cakto, mas há algumas limitações e melhorias necessárias.

---

## ✅ O que está funcionando

### 1. **Planos Reconhecidos**

O webhook reconhece **6 tipos de planos**:

| Código Cakto | Tipo Interno | Minutos Voz/Dia | Duração | Status |
|--------------|--------------|-----------------|---------|--------|
| `FREE` | `free` | 15 min (900s) | Ilimitado | ✅ Funcionando |
| `MONTHLY` | `monthly` | 15 min (900s) | 30 dias | ✅ Funcionando |
| `ANNUAL` | `annual` | 15 min (900s) | 365 dias | ✅ Funcionando |
| `ACADEMY_START` | `academy_starter` | 30 min (1800s) | 365 dias | ✅ Funcionando |
| `ACADEMY_GROW` | `academy_growth` | 45 min (2700s) | 365 dias | ✅ Funcionando |
| `PERSONAL_TEAM` | `personal_team` | 60 min (3600s) | 365 dias | ✅ Funcionando |

### 2. **Eventos Processados**

O webhook processa **3 tipos de eventos** da Cakto:

- ✅ `subscription_created` → Cria/atualiza perfil com status `active`
- ✅ `subscription_updated` → Atualiza perfil mantendo status `active`
- ✅ `subscription_canceled` → Atualiza perfil com status `expired`

### 3. **Funcionalidades Automáticas**

- ✅ **Criação automática de usuário** se não existir (via email)
- ✅ **Atualização de perfil** com plano, status e data de expiração
- ✅ **Cálculo automático de expiração** se a Cakto não enviar `expires_at`
- ✅ **Autenticação via Bearer token** (segurança)

---

## ⚠️ Limitações Atuais

### 1. **Planos Não Mapeados**

Se a Cakto enviar um `plan_code` que não está na lista acima, o webhook retornará erro `400` e **não processará o pagamento**.

**Solução**: Adicionar novos planos ao `PLAN_MAPPING` em `supabase/functions/cakto-webhook/index.ts`.

### 2. **Eventos Não Tratados**

O webhook só processa 3 tipos de eventos. Se a Cakto enviar outros eventos (ex: `payment_failed`, `refund_processed`), eles serão ignorados.

**Solução**: Adicionar tratamento para eventos adicionais se necessário.

### 3. **Logs Limitados**

Atualmente, os logs são básicos. Não há sistema de rastreamento de:
- Pagamentos rejeitados
- Planos não reconhecidos
- Tentativas de webhook inválidas

**Solução**: Melhorias implementadas no webhook (logs detalhados).

### 4. **Código Duplicado**

O arquivo tinha código duplicado que foi removido.

---

## 🔧 Melhorias Implementadas

### 1. **Logs Detalhados**

Agora o webhook registra:
- ✅ Payload completo recebido
- ✅ Planos não reconhecidos (com lista de planos disponíveis)
- ✅ Erros detalhados com stack trace
- ✅ Sucesso com informações do pagamento processado

### 2. **Normalização de Códigos**

O webhook agora normaliza `plan_code` para maiúsculas, então aceita:
- `FREE`, `free`, `Free` → todos funcionam

### 3. **Respostas JSON Estruturadas**

Todas as respostas agora são JSON com informações detalhadas:
- Sucesso: `{ success: true, user_id, plan_type }`
- Erro: `{ success: false, error, message, details }`

---

## 📝 Como Verificar se um Pagamento Foi Reconhecido

### 1. **Verificar Logs do Supabase**

Acesse: **Supabase Dashboard → Edge Functions → cakto-webhook → Logs**

Procure por:
- ✅ `✅ Pagamento processado:` → Pagamento reconhecido com sucesso
- ❌ `❌ Plano não mapeado:` → Plano não reconhecido
- ❌ `❌ Cakto webhook error:` → Erro no processamento

### 2. **Verificar no Banco de Dados**

```sql
-- Verificar perfil atualizado recentemente
SELECT 
  user_id,
  email,
  plan_type,
  subscription_status,
  expiry_date,
  voice_daily_limit_seconds,
  updated_at
FROM user_profiles
WHERE updated_at > NOW() - INTERVAL '1 hour'
ORDER BY updated_at DESC;
```

### 3. **Testar Manualmente**

```bash
curl -X POST 'https://hflwyatppivyncocllnu.supabase.co/functions/v1/cakto-webhook' \
  -H 'Authorization: Bearer SEU_CAKTO_WEBHOOK_SECRET' \
  -H 'Content-Type: application/json' \
  -d '{
    "event_type": "subscription_created",
    "email": "teste@exemplo.com",
    "plan_code": "MONTHLY",
    "expires_at": "2025-12-31T23:59:59Z"
  }'
```

---

## 🚨 O que Fazer se um Pagamento Não For Reconhecido

### 1. **Verificar o Código do Plano**

Se a Cakto enviar um código diferente dos mapeados, você precisa:

1. Verificar qual código a Cakto está enviando (nos logs)
2. Adicionar o mapeamento em `supabase/functions/cakto-webhook/index.ts`:

```typescript
const PLAN_MAPPING = {
  // ... planos existentes
  NOVO_PLANO_CODE: {
    plan_type: 'novo_tipo',
    daily_voice_seconds: 900,
    upsell_voice_seconds: 0,
    duration_days: 30,
  },
};
```

3. Fazer redeploy da função:
```bash
supabase functions deploy cakto-webhook
```

### 2. **Verificar Autenticação**

Certifique-se de que o `CAKTO_WEBHOOK_SECRET` está configurado corretamente:
- ✅ No Supabase: **Settings → Edge Functions → Secrets**
- ✅ Na Cakto: **Configurações do Webhook → Bearer Token**

### 3. **Verificar Estrutura do Payload**

O webhook espera este formato:

```json
{
  "event_type": "subscription_created" | "subscription_updated" | "subscription_canceled",
  "email": "usuario@exemplo.com",
  "plan_code": "MONTHLY",
  "expires_at": "2025-12-31T23:59:59Z" // opcional
}
```

Se a Cakto enviar campos diferentes, será necessário ajustar o código.

---

## 📋 Checklist de Verificação

- [x] Webhook configurado e deployado
- [x] 6 planos mapeados e funcionando
- [x] 3 tipos de eventos processados
- [x] Logs detalhados implementados
- [x] Normalização de códigos implementada
- [ ] Testes com pagamentos reais da Cakto
- [ ] Monitoramento de planos não reconhecidos
- [ ] Documentação da Cakto sobre formatos de webhook

---

## 🔗 Arquivos Relacionados

- **Webhook**: `supabase/functions/cakto-webhook/index.ts`
- **Cupons de Teste**: `cupons_teste_todos_planos.sql`
- **Schema de Voz**: `supabase_voice_consumption_schema.sql`

---

## 📞 Próximos Passos

1. **Testar com pagamentos reais** da Cakto para validar todos os cenários
2. **Monitorar logs** por 1 semana para identificar planos não mapeados
3. **Adicionar novos planos** conforme necessário
4. **Implementar dashboard** de monitoramento (opcional)

---

**Última atualização**: 2025-01-27
**Status**: ✅ Funcional com melhorias implementadas

