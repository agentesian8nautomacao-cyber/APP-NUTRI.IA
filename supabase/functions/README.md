# Edge Functions (Supabase)

## Deploy

```bash
supabase login
supabase link --project-ref hflwyatppivyncocllnu
supabase functions deploy cakto-webhook --no-verify-jwt
```

## `cakto-webhook`

- **URL produção:** `https://hflwyatppivyncocllnu.supabase.co/functions/v1/cakto-webhook`
- Configure essa URL no painel Cakto (Integrações → Webhooks), evento **Compra aprovada** (`purchase_approved`) e, se usar assinatura, os equivalentes.
- **Secrets** no painel Supabase → Edge Functions → Secrets:
  - `CAKTO_WEBHOOK_SECRET` (opcional)
  - `CAKTO_PRODUCT_PLAN_MAP` — JSON mapeando `product.id` do Cakto → `plan_linked` (ex.: `{"uuid-produto":"academy_starter"}`)
  - `CAKTO_DEFAULT_MAX_USES` — padrão `50`
  - `CAKTO_DEFAULT_MAX_LINKED` — padrão igual a max uses

Ajuste `index.ts` se o JSON do Cakto usar outros nomes de campo (veja logs da função).

## Funções ainda só no painel (recuperar código se necessário)

Estas URLs existem no projeto hospedado; o código-fonte **não** estava neste repositório:

| Nome | URL |
|------|-----|
| bright-processor | `/functions/v1/bright-processor` |
| bright-task | `/functions/v1/bright-task` |
| hyper-handler | `/functions/v1/hyper-handler` |
| super-action | `/functions/v1/super-action` |
| super-task | `/functions/v1/super-task` |
| swift-action | `/functions/v1/swift-action` |

Use **Download** ou histórico de deploy no dashboard Supabase para versionar no Git.
