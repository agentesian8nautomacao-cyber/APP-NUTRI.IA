# Instruções para Deploy das Correções Críticas

## 📋 O que foi implementado

1. ✅ **Edge Function `check-voice-access`** - Verifica assinatura e consome tempo de voz
2. ✅ **Serviço Frontend `voiceAccessService.ts`** - Interface para chamar a Edge Function
3. ✅ **Schema SQL `supabase_voice_consumption_schema.sql`** - Estrutura de banco para consumo de voz

## 🚀 Passos para Deploy

### 1. Executar Schema SQL no Supabase

1. Acesse: https://supabase.com/dashboard/project/hflwyatppivyncocllnu/editor
2. Vá em **SQL Editor**
3. Abra o arquivo: `supabase_voice_consumption_schema.sql`
4. Copie TODO o conteúdo
5. Cole no SQL Editor
6. Clique em **Run** ou **Execute**

Isso irá:
- Adicionar colunas necessárias em `user_profiles`
- Criar funções RPC para consumo de voz
- Criar funções para adicionar recargas
- Criar funções para reset diário

### 2. Deploy da Edge Function

```bash
cd E:\Nutri.IA
supabase functions deploy check-voice-access
```

Ou via Dashboard:
1. Dashboard → Edge Functions → Create new function
2. Nome: `check-voice-access`
3. Cole o conteúdo de `supabase/functions/check-voice-access/index.ts`
4. Deploy

### 3. Verificar Secrets da Edge Function

Certifique-se de que a função tem acesso aos secrets:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Estes geralmente já existem, mas verifique em:
- Dashboard → Edge Functions → check-voice-access → Secrets

### 4. Testar a Edge Function

Você pode testar diretamente no Supabase Dashboard:
- Dashboard → Edge Functions → check-voice-access → Invoke

Exemplo de body para testar:
```json
{
  "action": "check"
}
```

## ⚠️ IMPORTANTE: Próximas Ações Necessárias

### Ainda Faltam:

1. **Atualizar `LiveConversation.tsx`** para usar o serviço backend
   - Ver arquivo `CORRECOES_CRITICAS_IMPLEMENTADAS.md` para exemplos de código

2. **Adicionar verificação de acesso** em outros componentes:
   - `PlateAnalyzer.tsx` - Verificar assinatura antes de analisar foto
   - `ChatAssistant.tsx` - Se necessário

3. **Criar tela de upgrade** quando usuário não tem acesso

## 📝 Arquivos Criados

- ✅ `supabase/functions/check-voice-access/index.ts` - Edge Function
- ✅ `services/voiceAccessService.ts` - Serviço frontend
- ✅ `CORRECOES_CRITICAS_IMPLEMENTADAS.md` - Documentação das correções
- ✅ `INSTRUCOES_DEPLOY_CORRECOES.md` - Este arquivo

## ✅ Checklist

- [ ] Schema SQL executado no Supabase
- [ ] Edge Function `check-voice-access` deployada
- [ ] Secrets verificados
- [ ] Edge Function testada
- [ ] `LiveConversation.tsx` atualizado (próximo passo)
- [ ] Outros componentes atualizados (próximo passo)

