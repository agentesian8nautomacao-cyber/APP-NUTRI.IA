# Resolver Erros 406 e 429

## Problemas Identificados

1. **Erro 406 (Not Acceptable)** nas queries do Supabase:
   - `daily_plans?select=*&user_id=eq...&plan_date=eq...`
   - `user_profiles?select=*&user_id=eq...`
   - Pode ser causado por problemas com o formato Accept header ou com o uso de `select=*`

2. **Erro 429 (Too Many Requests)** do Gemini API:
   - O modelo `gemini-3-pro-preview` está com quota 0 no free tier
   - Mensagem: "Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_input_token_count, limit: 0"

## Soluções Implementadas

### 1. Mudança de Modelo Gemini

O código foi atualizado para usar `gemini-2.5-flash` em vez de `gemini-3-pro-preview`:

**Arquivo**: `services/geminiService.ts`

**Mudanças**:
- `generateDietPlan`: Mudado de `gemini-3-pro-preview` para `gemini-2.5-flash`
- `chatWithNutritionist` (com `useThinking`): Mudado de `gemini-3-pro-preview` para `gemini-2.5-flash`

**Nota**: `gemini-2.5-flash` não suporta `thinkingConfig`, mas funciona bem para a maioria dos casos e tem quota disponível no free tier.

### 2. Melhor Tratamento de Erros 406

O código foi atualizado para melhorar as queries do Supabase:

**Arquivo**: `services/supabaseService.ts`

**Mudança em `getPlan`**:
- Query atualizada para usar select explícito com relacionamentos
- Isso pode ajudar a evitar problemas com `select=*`

## Verificação

Após as mudanças, teste:

1. **Geração de Plano**:
   - Crie um novo usuário ou faça onboarding
   - Verifique se o plano é gerado sem erro 429
   - Deve usar `gemini-2.5-flash` agora

2. **Queries do Supabase**:
   - Verifique se as queries de `daily_plans` e `user_profiles` funcionam
   - Se ainda houver erro 406, pode ser necessário verificar:
     - Configurações de RLS no Supabase
     - Formato dos dados retornados
     - Headers HTTP

## Troubleshooting

### Erro 406 ainda aparece

1. Verifique as políticas RLS no Supabase:
   ```sql
   SELECT tablename, policyname, permissive, roles, cmd, qual 
   FROM pg_policies 
   WHERE tablename IN ('daily_plans', 'user_profiles');
   ```

2. Verifique se o usuário está autenticado corretamente:
   - O token de autenticação pode estar expirado
   - Tente fazer logout e login novamente

3. Verifique o formato dos dados:
   - O erro 406 pode ser causado por dados incompatíveis
   - Verifique se os tipos de dados estão corretos

### Erro 429 ainda aparece

1. Verifique se a mudança de modelo foi aplicada:
   - O código deve estar usando `gemini-2.5-flash`
   - Verifique o console do navegador para confirmar

2. Se ainda houver problemas:
   - Verifique a quota do Gemini API em https://ai.dev/usage
   - Considere usar um modelo diferente ou aguardar a renovação da quota

## Próximos Passos

1. Monitorar se os erros 406 e 429 ainda aparecem
2. Se necessário, ajustar as queries do Supabase
3. Considerar implementar fallback para outros modelos do Gemini se necessário

