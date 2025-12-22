# Como Funcionam os Pagamentos da Cakto no Supabase

## ✅ SIM, Qualquer Pagamento Será Reconhecido

**SIM**, o webhook processa **QUALQUER** pagamento aprovado que vier da Cakto com o evento `purchase_approved`.

## ⚠️ IMPORTANTE: Mapeamento de Planos

O sistema **tenta identificar automaticamente** qual plano liberar baseado no **nome ou ID do produto** na Cakto.

### Planos Suportados e Como Identificar

O sistema procura por estas palavras-chave no **nome** ou **ID** do produto na Cakto:

| Palavra-Chave | Plano Liberado | Duração |
|---------------|----------------|---------|
| `MONTHLY` | `monthly` | 30 dias |
| `ANNUAL` | `annual` | 365 dias |
| `ACADEMY_START` | `academy_starter` | 365 dias |
| `ACADEMY_GROW` | `academy_growth` | 365 dias |
| `ACADEMY_PRO` | `academy_pro` | 365 dias |
| `PERSONAL_TEAM` | `personal_team` | 365 dias |
| (qualquer outro) | `free` | Sem expiração |

### ⚠️ Problema Atual

No teste que você fez, o produto era `"Produto Teste"`, que **não contém** nenhuma das palavras-chave acima. Por isso foi atribuído o plano `free`.

## 🔧 Como Configurar Corretamente na Cakto

### Opção 1: Usar Palavras-Chave no Nome do Produto

Na plataforma Cakto, configure seus produtos com nomes que contenham as palavras-chave:

**Exemplos:**
- `Plano Mensal Nutri.ai` → Será identificado como `monthly` (contém "MONTHLY")
- `Plano Anual Nutri.ai` → Será identificado como `annual` (contém "ANNUAL")
- `Academy Starter Nutri.ai` → Será identificado como `academy_starter` (contém "ACADEMY_START")
- `Academy Growth Nutri.ai` → Será identificado como `academy_growth` (contém "ACADEMY_GROW")
- `Academy Pro Nutri.ai` → Será identificado como `academy_pro` (contém "ACADEMY_PRO")
- `Personal Team Nutri.ai` → Será identificado como `personal_team` (contém "PERSONAL_TEAM")

### Opção 2: Usar Palavras-Chave no ID do Produto

Se preferir, use as palavras-chave no **ID do produto**:
- ID: `MONTHLY_PLAN`
- ID: `ANNUAL_PLAN`
- ID: `ACADEMY_STARTER`
- etc.

## 📋 O Que Acontece Quando um Pagamento é Aprovado

1. ✅ Webhook recebe o evento `purchase_approved`
2. ✅ Valida a assinatura (secret)
3. ✅ Busca ou cria o usuário pelo email
4. ✅ Tenta identificar o plano baseado no produto
5. ✅ Atualiza o `user_profiles` com:
   - `plan_type`: Tipo do plano
   - `subscription_status`: `active`
   - `expiry_date`: Data de expiração (se aplicável)
   - `voice_daily_limit_seconds`: Limite diário de voz
   - `last_payment_date`: Data do último pagamento
6. ✅ Salva histórico em `payment_history`

## 🔍 Verificação nos Logs

Nos logs, você verá:
```
💳 Processando pagamento aprovado: { email: "...", transactionId: "...", amount: 90, ... }
✅ Pagamento aprovado processado: { plan_type: "monthly", ... }
```

Se aparecer `plan_type: "free"` quando não deveria, significa que o produto não foi identificado corretamente.

## 🛠️ Se Precisar Adicionar Novos Planos

Se você precisar adicionar novos planos ou alterar o mapeamento, edite o arquivo:
`supabase/functions/cakto-webhook/index.ts`

Procure por `PLAN_MAPPING` e adicione novas entradas.

## ✅ Resumo

- ✅ **SIM**, qualquer pagamento aprovado será processado
- ✅ **SIM**, o acesso será liberado para o usuário
- ⚠️ **MAS**, configure os produtos na Cakto com os nomes/IDs corretos para mapear o plano desejado
- ⚠️ Se o produto não corresponder a nenhum plano, será atribuído o plano `free`

