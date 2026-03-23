# Desativar Confirmação de Email no Supabase

## Problema

O sistema está exigindo confirmação de email antes de permitir login, mas você quer que os usuários possam fazer login imediatamente após o cadastro.

## Solução: Desativar no Supabase Dashboard

### Passo 1: Acessar Configurações de Autenticação

1. Acesse o **Supabase Dashboard**
2. Vá em **Authentication** → **Settings** (ou **Providers** → **Email**)

### Passo 2: Desativar Confirmação de Email

1. Procure pela opção **"Enable email confirmations"** ou **"Confirm email"**
2. **Desative** essa opção (toggle OFF)
3. Salve as alterações

### Passo 3: Verificar Configurações Adicionais

Certifique-se de que:
- **"Enable email signup"** está **ATIVADO** ✅
- **"Enable email confirmations"** está **DESATIVADO** ❌
- **"Secure email change"** pode ficar como preferir

## Alternativa: Auto-Confirmar via Edge Function

Se você quiser manter a confirmação de email ativada mas auto-confirmar programaticamente, você pode criar uma Edge Function que confirma o email automaticamente após o signUp.

**Nota**: Isso requer usar o Admin API (service_role key) e não é recomendado para produção sem medidas de segurança adequadas.

## Resultado Esperado

Após desativar a confirmação de email:
- ✅ Usuários podem fazer login imediatamente após o cadastro
- ✅ Não receberão mais o erro "Email not confirmed"
- ✅ Não precisarão clicar em link de confirmação no email

## Verificação

Após configurar, teste:
1. Crie uma nova conta via "Testar Grátis por 3 dias"
2. Tente fazer login imediatamente após o cadastro
3. Deve funcionar sem necessidade de confirmar email

