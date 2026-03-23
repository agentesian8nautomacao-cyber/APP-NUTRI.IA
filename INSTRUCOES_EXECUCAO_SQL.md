# 📋 Instruções para Executar o SQL no Supabase

## ⚠️ IMPORTANTE: Ordem de Execução

**Você DEVE executar o script SQL completo ANTES de tentar inserir dados na tabela `coupons`.**

## 🚀 Passo a Passo

### 1. Acesse o Supabase Dashboard
- Vá para: https://supabase.com/dashboard/project/hflwyatppivyncocllnu
- Clique em **"SQL Editor"** no menu lateral

### 2. Execute o Script Completo
- Copie TODO o conteúdo do arquivo `supabase_coupon_payment_link.sql`
- Cole no SQL Editor
- Clique em **"Run"** ou pressione `Ctrl+Enter`

### 3. Verifique se Funcionou
Execute esta query para verificar se as colunas foram criadas:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'coupons'
  AND column_name IN ('cakto_customer_id', 'linked_accounts_count', 'max_linked_accounts');
```

Você deve ver 3 linhas retornadas.

### 4. Verifique se a Tabela user_coupon_links foi Criada

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'user_coupon_links';
```

Deve retornar 1 linha.

### 5. Agora Pode Inserir Cupons

**SOMENTE DEPOIS** de executar o script, você pode inserir cupons:

```sql
-- Exemplo 1: Cupom SEM vínculo Cakto (funciona normalmente)
INSERT INTO coupons (code, plan_linked, max_uses, is_active)
VALUES ('TESTE-FREE', 'free', 100, true);

-- Exemplo 2: Cupom COM vínculo Cakto
INSERT INTO coupons (code, plan_linked, max_uses, cakto_customer_id, max_linked_accounts, is_active)
VALUES ('ACADEMIA-X', 'academy_starter', 50, 'cakto_customer_123', 50, true);
```

## 🔍 Troubleshooting

### Erro: "column does not exist"
- **Causa**: Você tentou inserir dados antes de executar o script
- **Solução**: Execute o script `supabase_coupon_payment_link.sql` primeiro

### Erro: "relation already exists"
- **Causa**: Você já executou o script antes
- **Solução**: Isso é normal! O script usa `IF NOT EXISTS`, então é seguro executar novamente

### Erro: "permission denied"
- **Causa**: Você não tem permissão para alterar a tabela
- **Solução**: Certifique-se de estar usando a conta de administrador do projeto

## ✅ Checklist

- [ ] Executei o script `supabase_coupon_payment_link.sql` completo
- [ ] Verifiquei que as colunas foram criadas
- [ ] Verifiquei que a tabela `user_coupon_links` foi criada
- [ ] Testei inserir um cupom de exemplo
- [ ] Testei o fluxo no app com o cupom criado

