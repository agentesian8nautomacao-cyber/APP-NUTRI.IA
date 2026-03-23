# 🚀 Solução Rápida: Ativar Cupom

## ❌ Problema Identificado

O cupom não está sendo ativado. As causas mais comuns são:

1. **Não há usuários no banco** (`auth.users` está vazio)
2. **A função retorna erro** mas não está sendo mostrado
3. **O perfil não existe** ou está com dados incorretos

---

## ✅ Solução Passo a Passo

### Passo 1: Verificar se há usuários

```sql
SELECT COUNT(*) as total_usuarios FROM auth.users;
```

**Se retornar 0**: Você precisa criar um usuário primeiro.

**Como criar usuário:**
- Opção A: Registrar no app (Landing Page → Criar conta)
- Opção B: Criar via Supabase Dashboard → Authentication → Add User

### Passo 2: Executar script simplificado

Execute este script que mostra tudo o que acontece:

```sql
-- Execute: verificar_e_ativar_cupom.sql
```

Este script:
- ✅ Verifica se há usuários
- ✅ Cria perfil se necessário
- ✅ Mostra o resultado completo da função
- ✅ Indica se foi sucesso ou erro

### Passo 3: Se ainda não funcionar

Execute este teste direto (substitua o UUID pelo ID real de um perfil):

```sql
-- 1. Buscar um perfil
SELECT id, name, account_type 
FROM user_profiles 
LIMIT 1;

-- 2. Copiar o UUID retornado e usar abaixo
-- Exemplo: SELECT activate_coupon_internal('TESTE-ATIVACAO', '123e4567-e89b-12d3-a456-426614174000'::UUID);
SELECT activate_coupon_internal('TESTE-ATIVACAO', 'COLE-O-UUID-AQUI'::UUID);

-- 3. Verificar resultado
SELECT 
  code,
  current_uses,
  quantidade_disponivel
FROM coupons
WHERE code = 'TESTE-ATIVACAO';
```

---

## 🔍 Verificar Resultado da Função

A função retorna um JSON. Verifique o campo `success`:

```json
{
  "success": true,  // ✅ Se true, funcionou!
  "message": "Cupom ativado com sucesso!",
  "plan_type": "academy_starter",
  "account_type": "USER_GYM"
}
```

Ou se falhou:

```json
{
  "success": false,  // ❌ Se false, deu erro
  "error": "CUPOM_ESGOTADO",
  "message": "Este cupom não possui mais ativações disponíveis."
}
```

---

## 📋 Checklist Rápido

- [ ] Há pelo menos 1 usuário em `auth.users`?
- [ ] Há pelo menos 1 perfil em `user_profiles`?
- [ ] O cupom `TESTE-ATIVACAO` existe e está ativo?
- [ ] A função `activate_coupon_internal` existe?
- [ ] O resultado da função mostra `success: true`?

---

## 🎯 Teste Final no App

Se tudo estiver funcionando no SQL, teste no app:

1. Fazer login
2. Menu → "Inserir Cupom"
3. Digitar: `TESTE-ATIVACAO`
4. Clicar em "Ativar Cupom"
5. Verificar mensagem de sucesso

---

**Dica**: Se não houver usuários, crie um através do app primeiro. O registro/login cria automaticamente o usuário em `auth.users`.

