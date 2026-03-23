# Edge Functions & Cakto

## Repositório

- Código versionado: `supabase/functions/cakto-webhook/`
- Deploy: ver `supabase/functions/README.md`

## Secrets (Supabase Dashboard → Edge Functions)

| Secret | Uso |
|--------|-----|
| `CAKTO_WEBHOOK_SECRET` | Opcional; header `X-Cakto-Secret` deve coincidir |
| `CAKTO_PRODUCT_PLAN_MAP` | JSON: `{ "uuid-produto-cakto": "academy_starter" }` |
| `CAKTO_DEFAULT_MAX_USES` | Padrão `50` |
| `CAKTO_DEFAULT_MAX_LINKED` | Padrão = max uses |

`SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` são definidos pelo Supabase na função.

## Migrations

Rodar no projeto (CLI ou SQL Editor):

1. `20250321120000_nutri_profiles.sql` — tabela `nutri_profiles` + RLS
2. `20250321120100_coupons_anon_read_and_signup_trigger.sql` — `anon` SELECT em `coupons` + trigger pós-cadastro

**Segurança:** a política `coupons_anon_select_validate` expõe todas as linhas de `coupons` ao anon. Para produção, prefira RPC `SECURITY DEFINER` que só retorna válido/inválido.

## Outras funções no painel

`bright-processor`, `bright-task`, `hyper-handler`, `super-action`, `super-task`, `swift-action` — baixe o código do dashboard e coloque em `supabase/functions/<nome>/` para versionar.
