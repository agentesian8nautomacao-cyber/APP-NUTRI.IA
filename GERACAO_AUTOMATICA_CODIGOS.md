# 🎫 Geração Automática de Códigos de Convite

## 📋 Visão Geral

O sistema agora gera **automaticamente** códigos de convite quando um pagamento B2B é aprovado via webhook da Cakto. Isso elimina a necessidade de criar códigos manualmente no banco de dados.

## 🔄 Como Funciona

### 1. **Detecção de Plano B2B**

Quando um pagamento é aprovado, o sistema verifica se o plano é B2B:

- ✅ `academy_starter`
- ✅ `academy_growth`
- ✅ `academy_pro`
- ✅ `personal_team`

### 2. **Geração do Código**

Se for um plano B2B, o sistema:

1. **Verifica se já existe cupom** para o `cakto_customer_id`
   - Se existir, retorna o código existente
   - Se não existir, gera um novo código

2. **Gera código único** no formato:
   ```
   PREFIXO-XXXX-XXXX
   ```
   
   Exemplos:
   - `ACADEMIA-STARTER-JOHN-A1B2`
   - `ACADEMIA-GROWTH-MARY-C3D4`
   - `PERSONAL-TEAM-PEDR-X9Y8`

3. **Cria cupom no banco** com:
   - Código único
   - Plano vinculado
   - Limites de uso e contas
   - Vinculado ao `cakto_customer_id`

### 3. **Limites por Plano**

| Plano | Máx. Usos | Máx. Contas |
|-------|-----------|-------------|
| `academy_starter` | 50 | 50 |
| `academy_growth` | 100 | 100 |
| `academy_pro` | 200 | 200 |
| `personal_team` | 30 | 30 |

## 📝 Formato do Código

O código é gerado usando:

1. **Prefixo**: Baseado no tipo de plano
   - `ACADEMIA-STARTER`
   - `ACADEMIA-GROWTH`
   - `ACADEMIA-PRO`
   - `PERSONAL-TEAM`

2. **Hash do Email**: Primeiras 4 letras do email (sem caracteres especiais)
   - `john.doe@email.com` → `JOHN`

3. **Parte Aleatória**: 4 caracteres alfanuméricos aleatórios
   - Ex: `A1B2`, `C3D4`, `X9Y8`

**Resultado Final**: `ACADEMIA-STARTER-JOHN-A1B2`

## 🔍 Verificação de Unicidade

O sistema garante que cada código seja único:

1. Gera código inicial
2. Verifica se já existe no banco
3. Se existir, gera novo código (até 10 tentativas)
4. Se não conseguir após 10 tentativas, retorna erro

## 📊 Logs e Rastreamento

O sistema registra logs detalhados:

```
🎫 Plano B2B detectado, gerando código de convite...
✅ Cupom B2B criado automaticamente: {
  code: "ACADEMIA-STARTER-JOHN-A1B2",
  plan_type: "academy_starter",
  cakto_customer_id: "john@email.com",
  max_uses: 50,
  max_accounts: 50
}
✅ Código de convite gerado com sucesso: ACADEMIA-STARTER-JOHN-A1B2
```

## 🚀 Fluxo Completo

```
1. Cliente faz pagamento B2B na Cakto
   ↓
2. Cakto envia webhook para Supabase
   ↓
3. Webhook processa pagamento
   ↓
4. Sistema detecta plano B2B
   ↓
5. Verifica se cupom já existe
   ├─ SIM → Retorna código existente
   └─ NÃO → Gera novo código
   ↓
6. Cria cupom no banco de dados
   ↓
7. Retorna código na resposta do webhook
   ↓
8. Cliente recebe código (via email/SMS/etc)
   ↓
9. Cliente distribui código para seus alunos/clientes
```

## 📧 Como o Cliente Recebe o Código

**✅ IMPLEMENTADO**: O código é enviado **automaticamente por email** para o cliente quando gerado!

### Envio Automático de Email:

1. **Email Automático**: ✅ Implementado usando Resend
   - Email HTML formatado e profissional
   - Contém código de convite destacado
   - Instruções de como usar o código
   - Enviado automaticamente após geração

2. **Configuração Necessária**:
   - Criar conta no [Resend](https://resend.com)
   - Obter API Key
   - Configurar `RESEND_API_KEY` no Supabase
   - (Opcional) Verificar domínio para melhor deliverability

3. **Documentação Completa**: Ver `CONFIGURAR_ENVIO_EMAIL.md`

### Fallback (Se Email Falhar):

Se o envio de email falhar, o código ainda pode ser:
- Visualizado nos logs do Supabase
- Consultado no banco de dados:
  ```sql
  SELECT code, plan_linked, max_uses, current_uses, cakto_customer_id
  FROM coupons
  WHERE cakto_customer_id = 'email@cliente.com';
  ```
- Enviado manualmente ao cliente via email/SMS

## 🔧 Configuração

A geração automática está **ativada por padrão** e não requer configuração adicional.

### Desabilitar Geração Automática

Se necessário, você pode comentar a seção de geração de código em `supabase/functions/cakto-webhook/index.ts`:

```typescript
// Comentar esta seção para desabilitar
/*
if (isB2BPlan(plan.plan_type)) {
  // ... código de geração
}
*/
```

## 🧪 Testes

### Teste Manual

1. Simular pagamento B2B via webhook
2. Verificar logs do Supabase
3. Consultar tabela `coupons`:
   ```sql
   SELECT * FROM coupons 
   WHERE cakto_customer_id = 'email@teste.com'
   ORDER BY created_at DESC;
   ```

### Verificar Código Gerado

```sql
-- Ver todos os cupons B2B gerados automaticamente
SELECT 
  code,
  plan_linked,
  max_uses,
  current_uses,
  max_linked_accounts,
  linked_accounts_count,
  cakto_customer_id,
  is_active,
  created_at
FROM coupons
WHERE cakto_customer_id IS NOT NULL
ORDER BY created_at DESC;
```

## ⚠️ Observações Importantes

1. **Código Único por Cliente**: Cada `cakto_customer_id` terá apenas **um cupom ativo** por tipo de plano
2. **Reutilização**: Se o cliente fizer novo pagamento do mesmo plano, o sistema retorna o código existente
3. **Não Falha o Processamento**: Se a geração do código falhar, o pagamento ainda é processado (o cupom pode ser criado manualmente depois)
4. **Case-Insensitive**: Os códigos são gerados em maiúsculas, mas a validação no app é case-insensitive

## 📚 Arquivos Modificados

- `supabase/functions/cakto-webhook/index.ts`
  - Adicionada função `isB2BPlan()`
  - Adicionada função `generateInviteCode()`
  - Adicionada função `createB2BCoupon()`
  - Modificada função `processPaymentApproved()`

## 🔄 Próximos Passos (Opcional)

1. ✅ **Envio Automático de Email**: ✅ **IMPLEMENTADO** - Usando Resend
2. **Dashboard de Códigos**: Criar interface para cliente visualizar seus códigos
3. **Estatísticas de Uso**: Mostrar quantos alunos usaram o código
4. **Renovação Automática**: Gerar novo código quando plano for renovado
5. **SMS**: Enviar código também por SMS (opcional)

---

**Data de Implementação**: 2025-01-27  
**Versão**: 1.0

