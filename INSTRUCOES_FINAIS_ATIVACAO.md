# 🎯 Instruções Finais - Ativar Cupom

## ⚠️ Problema Identificado

O cupom não está sendo ativado. As causas mais prováveis são:

1. **Não há usuários no banco** (`auth.users` está vazio)
2. **A função está retornando erro** mas não está sendo mostrado

---

## ✅ Solução Definitiva

### Passo 1: Verificar se há usuários

Execute esta query primeiro:

```sql
SELECT COUNT(*) as total FROM auth.users;
```

**Se retornar 0**: Você PRECISA criar um usuário primeiro!

### Passo 2: Criar Usuário (se necessário)

#### Opção A: Via App (Mais Fácil)
1. Abra o app Nutri.ai
2. Na tela inicial (Landing Page)
3. Clique em **"Criar conta"** ou **"Já tenho uma conta"**
4. Registre um novo usuário com email e senha
5. Faça login
6. Volte e execute os scripts SQL novamente

#### Opção B: Via Supabase Dashboard
1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em: **Authentication** → **Users**
4. Clique em: **"Add User"** ou **"Create User"**
5. Preencha:
   - Email: `teste@example.com`
   - Password: (qualquer senha)
6. Clique em: **"Create User"**
7. Volte e execute os scripts SQL novamente

### Passo 3: Executar Script de Ativação

Após ter um usuário, execute:

```sql
-- Execute: ativar_cupom_ultra_simples.sql
```

Este script:
- ✅ Verifica se há usuários
- ✅ Mostra o primeiro usuário encontrado
- ✅ Tenta ativar o cupom
- ✅ Mostra o resultado

---

## 🔍 Como Verificar o Resultado

### No Supabase SQL Editor:

1. **Execute o script**
2. **Veja a primeira query** - mostra quantos usuários há
3. **Veja a segunda query** - mostra o primeiro usuário (se houver)
4. **Veja a última query** - mostra o estado final do cupom
5. **Veja a aba "Messages" ou "Logs"** - mostra as mensagens `RAISE NOTICE`

### Resultado Esperado:

Se funcionou:
```
current_uses: 1
quantidade_disponivel: 9
status: ✅ ATIVADO
```

Se não funcionou:
```
current_uses: 0
quantidade_disponivel: 10
status: ❌ NÃO ATIVADO
```

---

## 📋 Checklist Completo

Antes de tentar ativar, verifique:

- [ ] Há pelo menos 1 usuário em `auth.users`?
  ```sql
  SELECT COUNT(*) FROM auth.users;
  ```
- [ ] O cupom `TESTE-ATIVACAO` existe?
  ```sql
  SELECT * FROM coupons WHERE code = 'TESTE-ATIVACAO';
  ```
- [ ] O cupom está ativo (`is_active = true`)?
- [ ] O cupom tem quantidade disponível (`quantidade_disponivel > 0`)?
- [ ] A função `activate_coupon_internal` existe?
  ```sql
  SELECT routine_name FROM information_schema.routines 
  WHERE routine_name = 'activate_coupon_internal';
  ```

---

## 🐛 Se Ainda Não Funcionar

Execute este diagnóstico completo:

```sql
-- 1. Verificar usuários
SELECT 'Usuários' as tipo, COUNT(*) as total FROM auth.users;

-- 2. Verificar perfis
SELECT 'Perfis' as tipo, COUNT(*) as total FROM user_profiles;

-- 3. Verificar cupom
SELECT code, is_active, quantidade_disponivel, current_uses 
FROM coupons 
WHERE code = 'TESTE-ATIVACAO';

-- 4. Tentar ativar manualmente (substitua UUID pelo ID real de um perfil)
-- Primeiro, obtenha um ID:
SELECT id FROM user_profiles LIMIT 1;

-- Depois, use o ID retornado:
SELECT activate_coupon_internal('TESTE-ATIVACAO', 'UUID-AQUI'::UUID);
```

---

## 💡 Dica Final

**O problema mais comum é não haver usuários no banco.**

Se você nunca criou um usuário através do app ou Supabase Dashboard, o banco está vazio e a ativação não pode funcionar.

**Solução**: Crie um usuário primeiro (via app é mais fácil), depois execute os scripts novamente.

---

**Última atualização**: 2025-01-27

