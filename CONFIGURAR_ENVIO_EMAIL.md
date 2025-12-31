# 📧 Configuração de Envio Automático de Email

## 📋 Visão Geral

O sistema agora envia **automaticamente** um email com o código de convite para o cliente quando um pagamento B2B é aprovado. O email é enviado usando o serviço **Resend**.

## 🔧 Configuração Necessária

### 1. Criar Conta no Resend

1. Acesse [https://resend.com](https://resend.com)
2. Crie uma conta gratuita (até 3.000 emails/mês no plano gratuito)
3. Verifique seu domínio ou use o domínio de teste do Resend

### 2. Obter API Key

1. No dashboard do Resend, vá em **API Keys**
2. Clique em **Create API Key**
3. Dê um nome (ex: "Nutri.ai Webhook")
4. Copie a chave gerada (ela só aparece uma vez!)

### 3. Configurar no Supabase

1. Acesse o **Supabase Dashboard**
2. Vá em **Project Settings** → **Edge Functions**
3. Clique em **Secrets** ou **Environment Variables**
4. Adicione as seguintes variáveis:

#### Variáveis Obrigatórias:

```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
```

#### Variáveis Opcionais:

```
EMAIL_FROM=Nutri.ai <noreply@nutri.ai>
```

**Nota:** Se `EMAIL_FROM` não for configurado, será usado o padrão: `Nutri.ai <noreply@nutri.ai>`

### 4. Verificar Domínio (Opcional mas Recomendado)

Para usar um domínio personalizado:

1. No Resend, vá em **Domains**
2. Adicione seu domínio (ex: `noreply.nutri.ai`)
3. Configure os registros DNS conforme instruções
4. Aguarde verificação (pode levar algumas horas)
5. Atualize `EMAIL_FROM` para usar seu domínio:
   ```
   EMAIL_FROM=Nutri.ai <noreply@noreply.nutri.ai>
   ```

**Sem domínio verificado:** Você pode usar o domínio de teste do Resend (`onboarding@resend.dev`), mas os emails podem ir para spam.

📖 **Guia completo de configuração de domínio**: Veja `CONFIGURAR_DOMINIO_RESEND.md`

## 📝 Formato do Email

O email enviado contém:

- ✅ **Cabeçalho** com logo e nome do Nutri.ai
- ✅ **Saudação personalizada** com nome do cliente
- ✅ **Código de convite** destacado em caixa verde
- ✅ **Instruções** de como usar o código
- ✅ **Rodapé** com informações de contato

### Exemplo de Email:

```
Assunto: 🎫 Seu Código de Convite - Nutri.ai Academia Starter

Olá, João!

Parabéns! Seu pagamento do plano Academia Starter foi aprovado com sucesso.

Seu código de convite exclusivo foi gerado e está pronto para ser compartilhado:

┌─────────────────────────────┐
│   CÓDIGO DE CONVITE         │
│   ACADEMIA-STARTER-JOHN-A1B2│
└─────────────────────────────┘

Como usar seu código:
1. Compartilhe este código com seus alunos ou clientes
2. Eles devem acessar o app Nutri.ai
3. Na tela de login, clicar em "Tenho um convite"
4. Inserir o código acima
5. Completar o cadastro e começar a usar!
```

## 🚀 Como Funciona

### Fluxo Completo:

```
1. Cliente faz pagamento B2B na Cakto
   ↓
2. Cakto envia webhook para Supabase
   ↓
3. Webhook processa pagamento
   ↓
4. Sistema detecta plano B2B
   ↓
5. Gera código de convite automaticamente
   ↓
6. Cria cupom no banco de dados
   ↓
7. Envia email com código para o cliente
   ↓
8. Cliente recebe email com código
   ↓
9. Cliente distribui código para alunos/clientes
```

## 🧪 Testes

### 1. Teste Manual

1. Fazer um pagamento B2B de teste
2. Verificar logs do Supabase Edge Function
3. Verificar inbox do email do cliente
4. Verificar se código está correto no email

### 2. Verificar Logs

No Supabase Dashboard → Edge Functions → Logs, você verá:

```
✅ Código de convite gerado com sucesso: ACADEMIA-STARTER-JOHN-A1B2
✅ Email com código de convite enviado com sucesso para: cliente@email.com
```

### 3. Testar Sem Resend Configurado

Se `RESEND_API_KEY` não estiver configurado, você verá:

```
⚠️ RESEND_API_KEY não configurada - email não será enviado
```

O código ainda será gerado, mas o email não será enviado.

## ⚠️ Tratamento de Erros

O sistema é **resiliente** a falhas de email:

- ✅ Se o email falhar, o código ainda é gerado
- ✅ O pagamento é processado normalmente
- ✅ O código fica disponível no banco de dados
- ✅ Logs detalhados são registrados

### Erros Comuns:

| Erro | Causa | Solução |
|------|-------|---------|
| `RESEND_API_KEY não configurada` | Variável não configurada | Adicionar `RESEND_API_KEY` nas secrets |
| `401 Unauthorized` | API Key inválida | Verificar se a chave está correta |
| `422 Unprocessable Entity` | Domínio não verificado | Verificar domínio no Resend ou usar domínio de teste |
| `Email não enviado` | Erro na API do Resend | Verificar logs do Resend para mais detalhes |

## 📊 Monitoramento

### Verificar Emails Enviados:

1. Acesse o dashboard do Resend
2. Vá em **Emails** → **Logs**
3. Veja todos os emails enviados, status e erros

### Verificar Códigos Gerados:

```sql
SELECT 
  code,
  plan_linked,
  cakto_customer_id,
  created_at,
  is_active
FROM coupons
WHERE cakto_customer_id IS NOT NULL
ORDER BY created_at DESC;
```

## 🔒 Segurança

- ✅ API Key armazenada como secret no Supabase (não exposta)
- ✅ Emails enviados apenas para emails válidos
- ✅ Códigos únicos e não reutilizáveis
- ✅ Logs não expõem informações sensíveis

## 💰 Custos

### Plano Gratuito do Resend:
- ✅ 3.000 emails/mês
- ✅ 100 emails/dia
- ✅ Domínio de teste incluído

### Planos Pagos:
- **Pro**: $20/mês - 50.000 emails
- **Business**: $80/mês - 200.000 emails

**Nota:** Para a maioria dos casos, o plano gratuito é suficiente.

## 🔄 Alternativas ao Resend

Se preferir usar outro serviço de email, você pode modificar a função `sendInviteCodeEmail()` para usar:

- **SendGrid** (Twilio)
- **Mailgun**
- **Amazon SES**
- **Postmark**
- **SMTP direto** (não recomendado para produção)

## 📚 Arquivos Modificados

- `supabase/functions/cakto-webhook/index.ts`
  - Adicionada função `generateInviteEmailTemplate()`
  - Adicionada função `sendInviteCodeEmail()`
  - Integrado envio de email após geração de código

## ✅ Checklist de Configuração

- [ ] Conta criada no Resend
- [ ] API Key obtida
- [ ] `RESEND_API_KEY` configurada no Supabase
- [ ] `EMAIL_FROM` configurado (opcional)
- [ ] Domínio verificado no Resend (recomendado)
- [ ] Teste realizado com pagamento B2B
- [ ] Email recebido com sucesso
- [ ] Código no email está correto

---

**Data de Implementação**: 2025-01-27  
**Versão**: 1.0  
**Serviço de Email**: Resend

