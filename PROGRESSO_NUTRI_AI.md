## Status Geral do Projeto Nutri.IA

### ✅ O que já foi feito

- **Banco de Dados (Supabase)**
  - Schema completo criado em `supabase_schema.sql`:
    - Tabelas: `user_profiles`, `daily_plans`, `daily_plan_meals`, `meal_items`, `daily_logs`, `scan_history`,
      `chat_messages`, `wellness_tracking`, `wellness_habits`, `challenges`, `user_challenges`, `articles`,
      `recipes`, `progress_entries`.
  - Campos de plano e limites adicionados a `user_profiles`:
    - `plan_type`, `subscription_status`, `expiry_date`
    - `voice_daily_limit_seconds`, `voice_used_today_seconds`, `voice_balance_upsell`, `last_voice_usage_date`
    - `text_msg_count_today`, `last_msg_date`
  - Tabela `coupons` criada para sistema de cupons e convites.
  - RLS configurado + índices + triggers de `updated_at`.

- **Integração Supabase no App**
  - Cliente Supabase em `services/supabaseClient.ts`.
  - Serviços de domínio em `services/supabaseService.ts`:
    - `authService`: login, logout, usuário atual.
    - `authFlowService.registerWithInvite`: cadastro com código de convite (cupom).
    - `couponService`: validação e uso de cupons.
    - `profileService`, `planService`, `logService`, `scanService`, `wellnessService`, `chatService`, `progressService`.
    - `limitsService`: controle de voz, limite de mensagens de texto e deleção de conta.

- **Login via Cupom (Onboarding)**
  - Lógica pronta no backend/app para:
    - Validar cupom (`coupons`).
    - Criar conta com `plan_type = plan_linked` e `subscription_status = 'active'`.
    - Incrementar `current_uses` do cupom.
  - Exemplo de tela de registro documentado em `SUPABASE_INTEGRATION.md`.

- **Limites e Compliance**
  - **Voz (Gemini Live)**:
    - `LiveConversation.tsx` integrado com `limitsService.consumeVoiceSeconds`.
    - Consome primeiro `voice_daily_limit_seconds`, depois `voice_balance_upsell`.
    - Hard cut com mensagem: “Limite diário atingido. Gerencie sua conta em nosso site.”
  - **Texto (Chat)**:
    - `ChatAssistant.tsx` integrado com `limitsService.registerTextMessage`.
    - Bloqueio acima de 600 mensagens/dia com aviso: “Limite de segurança diário atingido.”
  - **Deleção de Conta (Google Play)**
    - Botão “Excluir minha conta” no `ProfileView.tsx`:
      - Confirmação.
      - Limpa dados principais no Supabase.
      - Tenta deletar o usuário em `auth`.
      - Faz logout e recarrega o app.

- **Edge Function – Integração Cakto → Supabase**
  - Função `cakto-webhook` criada em `supabase/functions/cakto-webhook/index.ts`.
  - Deploy feita no projeto `hflwyatppivyncocllnu`:
    - URL: `https://hflwyatppivyncocllnu.functions.supabase.co/cakto-webhook`
  - Fluxo:
    - Recebe webhook da Cakto com `email`, `plan_code`, `event_type`, `expires_at`.
    - Cria ou encontra o usuário em `auth.users`.
    - Atualiza `user_profiles` com plano, status, expiração e limites de voz.

- **Documentação Criada**
  - `SUPABASE_SETUP.md`: como configurar o projeto Supabase.
  - `SUPABASE_INTEGRATION.md`: como integrar Supabase no app React.
  - `CONFIGURACAO_COMPLETA.md` e `README_SQL.md`: visão geral de schema e arquivos SQL.
  - `supabase_verify.sql` e `supabase_test_queries.sql`: scripts de verificação e testes.

---

### ⏭️ O que ainda falta configurar

- **1. Conectar Cakto ao Webhook**
  - No painel da Cakto:
    - Configurar o webhook com:
      - URL: `https://hflwyatppivyncocllnu.functions.supabase.co/cakto-webhook`
      - Método: `POST`
      - Header: `Authorization: Bearer CAKTO_WEBHOOK_SECRET`
      - Body JSON com campos: `event_type`, `email`, `plan_code`, `expires_at` (se disponível).
  - Validar, em ambiente de teste, se ao criar/atualizar assinatura na Cakto o Supabase atualiza `user_profiles`.

- **2. Refinar mapeamento de planos Cakto → Nutri.AI**
  - Ajustar o objeto `PLAN_MAPPING` na função `cakto-webhook` para refletir:
    - Códigos reais dos planos na Cakto (`plan_code`).
    - `plan_type` correspondente no app.
    - `daily_voice_seconds`, `upsell_voice_seconds`, `duration_days` reais por produto.

- **3. Integrar tela de cadastro real ao fluxo de cupom**
  - Conectar a UI de registro (onboarding/login) ao método:
    - `authFlowService.registerWithInvite(email, password, inviteCode?)`.
  - Garantir que:
    - Campo “Possui código de convite?” está visível.
    - Mensagens de erro de cupom (inválido/esgotado) aparecem para o usuário.

- **4. Testes completos em produção de limites**
  - Testar:
    - Limite diário de voz (simular 900s+ em `LiveConversation`).
    - Consumo de `voice_balance_upsell` caso seja configurado.
    - Bloqueio de 600 mensagens de texto/dia.
    - Fluxo completo de “Excluir minha conta” em dispositivos reais (Android / Google Play).

- **5. Segurança e chaves**
  - Garantir que:
    - `SUPABASE_SERVICE_ROLE_KEY` e `CAKTO_WEBHOOK_SECRET` estão apenas no backend (Edge Functions).
    - No app frontend, apenas chaves públicas (`anon key`) são usadas.

---

### ✅ Conclusão

Com o que já foi implementado:

- O **backend** (Supabase + Edge Functions) está pronto para:
  - Receber eventos de venda da Cakto.
  - Gerenciar planos, limites de voz/texto e cupom.
  - Atender às exigências de **compliance** (Google Play – deleção de conta).
- O **app** já possui:
  - Integração Supabase.
  - Lógicas de plano, limites e exclusão implementadas em componentes principais.

Os próximos passos são principalmente **configuração externa (Cakto)**, ajustes finos de mapeamento de planos e **testes ponta-a-ponta**.


