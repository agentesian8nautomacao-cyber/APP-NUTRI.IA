# 📋 Ordem de Execução dos Scripts SQL

## ⚠️ IMPORTANTE

**Execute apenas arquivos `.sql` no Supabase SQL Editor!**

Arquivos `.md` são documentação e não devem ser executados.

---

## ✅ Ordem Correta de Execução

### 1. **Criar Estrutura Base** (se ainda não executou)

```sql
-- Execute: supabase_activate_coupon_function.sql
```
**O que faz:**
- Cria campo `quantidade_disponivel` na tabela `coupons`
- Cria função `activate_coupon_internal`
- Cria triggers necessários

---

### 2. **Adicionar Coluna account_type** (se ainda não executou)

```sql
-- Execute: adicionar_account_type.sql
```
**O que faz:**
- Cria ENUM `account_type`
- Adiciona coluna `account_type` em `user_profiles`

---

### 3. **Verificar Implementação**

```sql
-- Execute: verificar_ativacao_cupom.sql
```
**O que faz:**
- Verifica se todos os componentes foram criados
- Mostra status de cada componente

**Resultado esperado:** Todos devem mostrar `✅ Criado/Criada`

---

### 4. **Criar Cupom de Teste**

```sql
-- Execute: testar_ativacao_cupom_simples.sql
-- OU execute manualmente:
INSERT INTO coupons (code, plan_linked, max_uses, current_uses, is_active, quantidade_disponivel)
VALUES ('TESTE-ATIVACAO', 'academy_starter', 10, 0, true, 10)
ON CONFLICT (code) DO UPDATE
SET quantidade_disponivel = 10, current_uses = 0;
```

---

### 5. **Ativar Cupom** (escolha uma opção)

#### Opção A: Script Automatizado (Recomendado)

```sql
-- Execute: verificar_e_ativar_cupom.sql
```

#### Opção B: Script Completo com Diagnóstico

```sql
-- Execute: diagnosticar_ativacao_cupom.sql
```

#### Opção C: Manual (se preferir)

```sql
-- 1. Buscar um perfil
SELECT id, name FROM user_profiles LIMIT 1;

-- 2. Ativar (substitua pelo UUID retornado acima)
SELECT activate_coupon_internal('TESTE-ATIVACAO', 'UUID-AQUI'::UUID);

-- 3. Verificar
SELECT code, current_uses, quantidade_disponivel 
FROM coupons 
WHERE code = 'TESTE-ATIVACAO';
```

---

## 📁 Arquivos SQL (Execute estes)

✅ **Execute no Supabase SQL Editor:**
- `supabase_activate_coupon_function.sql`
- `adicionar_account_type.sql`
- `verificar_ativacao_cupom.sql`
- `verificar_e_ativar_cupom.sql`
- `testar_ativacao_cupom_simples.sql`
- `diagnosticar_ativacao_cupom.sql`

❌ **NÃO execute (são documentação):**
- `GUIA_TESTE_ATIVACAO_CUPOM.md`
- `IMPLEMENTACAO_ATIVACAO_CUPOM_INTERNA.md`
- `STATUS_ATIVACAO_CUPOM.md`
- `SOLUCAO_RAPIDA_ATIVAR_CUPOM.md`
- `ORDEM_EXECUCAO_SCRIPTS.md` (este arquivo)

---

## 🚀 Execução Rápida (Mínima)

Se você já executou os scripts de estrutura, execute apenas:

```sql
-- Execute: verificar_e_ativar_cupom.sql
```

Este script faz tudo automaticamente:
- Verifica usuários
- Cria perfil se necessário
- Ativa o cupom
- Mostra resultado

---

## 🔍 Verificar Resultado

Após executar, verifique:

```sql
SELECT 
  code,
  current_uses,
  quantidade_disponivel,
  CASE 
    WHEN current_uses > 0 THEN '✅ ATIVADO'
    ELSE '❌ NÃO ATIVADO'
  END as status
FROM coupons
WHERE code = 'TESTE-ATIVACAO';
```

**Se `current_uses > 0`**: ✅ Funcionou!  
**Se `current_uses = 0`**: ❌ Verifique se há usuários no banco.

---

## ❓ Problemas Comuns

### Erro: "syntax error at or near #"
**Causa:** Tentou executar arquivo `.md`  
**Solução:** Execute apenas arquivos `.sql`

### Erro: "Nenhum usuário encontrado"
**Causa:** `auth.users` está vazio  
**Solução:** Crie um usuário via app ou Supabase Dashboard

### Cupom não ativa
**Causa:** Pode ser vários motivos  
**Solução:** Execute `diagnosticar_ativacao_cupom.sql` para ver detalhes

---

**Lembre-se:** Apenas arquivos `.sql` devem ser executados no Supabase SQL Editor!

