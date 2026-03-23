Supabase setup for Nutri.ai
===========================

Variáveis no `.env.local` (veja também `.env.example`):

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
GEMINI_API_KEY=your_gemini_key_here
VITE_INVITE_CODES=opcional,fallback,se,rls,falhar
```

Funcionalidades ligadas ao Supabase:

- **Auth** — login/cadastro (`auth.users`).
- **`public.coupons`** — validação do código de convite na landing (requer RLS ou RPC; ver migrations em `supabase/migrations/`).
- **`public.nutri_profiles`** — JSON `profile` + `diet_plan` por usuário (migrations + `services/nutriPersistence.ts`).
- **Trigger** — após insert em `auth.users`, incrementa `current_uses` / ajusta `quantidade_disponivel` do cupom em `registration_coupon` (metadata).

Edge Function **cakto-webhook**: código em `supabase/functions/cakto-webhook/` — deploy e secrets em `docs/EDGE_FUNCTIONS.md`.

CLI sugerido:

```bash
supabase link --project-ref YOUR_REF
supabase db push
supabase functions deploy cakto-webhook --no-verify-jwt
```

Use a chave **anon** só no front. **Service role** apenas em Edge Functions / backend.

