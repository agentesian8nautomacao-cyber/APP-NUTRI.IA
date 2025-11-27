# 🔍 Troubleshooting: "Código de convite inválido"

## 🐛 Problema

Ao tentar usar um código de convite, aparece a mensagem:
> "Código de convite inválido. Verifique e tente novamente."

## ✅ Checklist de Verificação

### 1. Verificar se o Cupom Existe no Banco

Execute esta query no Supabase SQL Editor:

```sql
SELECT 
  code,
  plan_linked,
  max_uses,
  current_uses,
  is_active,
  cakto_customer_id
FROM coupons
WHERE code ILIKE '%TESTE%' OR code ILIKE '%ACADEMIA%' OR code ILIKE '%PERSONAL%'
ORDER BY code;
```

**Resultado esperado:**
- Deve retornar os cupons criados
- `is_active` deve ser `true`
- `current_uses` deve ser menor que `max_uses`

### 2. Verificar se o Cupom Está Ativo

```sql
SELECT code, is_active, current_uses, max_uses
FROM coupons
WHERE code = 'TESTE-FREE';  -- Substitua pelo código que você está testando
```

**Se `is_active = false`:**
- O cupom está desativado
- Ative com: `UPDATE coupons SET is_active = true WHERE code = 'TESTE-FREE';`

### 3. Verificar se o Cupom Não Está Esgotado

```sql
SELECT code, current_uses, max_uses
FROM coupons
WHERE code = 'TESTE-FREE';
```

**Se `current_uses >= max_uses`:**
- O cupom está esgotado
- Reset com: `UPDATE coupons SET current_uses = 0 WHERE code = 'TESTE-FREE';`

### 4. Verificar Conexão com Supabase

Abra o console do navegador (F12) e verifique:

1. **Erros de rede:**
   - Se houver `ERR_NAME_NOT_RESOLVED` → Problema de conexão
   - Verifique as variáveis de ambiente no Vercel

2. **Erros de autenticação:**
   - Se houver `401 Unauthorized` → Problema com a chave anon
   - Verifique `VITE_SUPABASE_ANON_KEY` no Vercel

3. **Erros de permissão:**
   - Se houver `403 Forbidden` → Problema com RLS (Row Level Security)
   - Verifique as políticas RLS da tabela `coupons`

### 5. Verificar RLS (Row Level Security)

A tabela `coupons` deve ter políticas RLS que permitam leitura pública:

```sql
-- Verificar políticas existentes
SELECT * FROM pg_policies 
WHERE tablename = 'coupons';

-- Se não houver política de leitura, crie:
CREATE POLICY "Allow public read access to active coupons"
ON coupons
FOR SELECT
USING (is_active = true);
```

### 6. Testar Query Diretamente

Execute no Supabase SQL Editor:

```sql
-- Teste exato do que o código faz
SELECT *
FROM coupons
WHERE code ILIKE 'TESTE-FREE'  -- Case-insensitive
  AND is_active = true
LIMIT 1;
```

**Se não retornar nada:**
- O cupom não existe ou está inativo
- Crie o cupom com o script `cupons_teste_todos_planos.sql`

## 🔧 Soluções Comuns

### Solução 1: Criar Cupons de Teste

Execute o script completo no Supabase:

```sql
-- Copie e cole todo o conteúdo de cupons_teste_todos_planos.sql
```

### Solução 2: Ativar Cupom Existente

```sql
UPDATE coupons
SET is_active = true
WHERE code = 'TESTE-FREE';
```

### Solução 3: Resetar Uso do Cupom

```sql
UPDATE coupons
SET current_uses = 0
WHERE code = 'TESTE-FREE';
```

### Solução 4: Verificar Variáveis de Ambiente

No Vercel, verifique se as variáveis estão configuradas:

- ✅ `VITE_SUPABASE_URL` - URL correta do projeto
- ✅ `VITE_SUPABASE_ANON_KEY` - Chave anon válida

**URL deve ser:**
```
https://hflwyatppivyncocllnu.supabase.co
```

### Solução 5: Verificar Console do Navegador

Abra o console (F12) e procure por:

1. **Requisições para Supabase:**
   ```
   GET https://hflwyatppivyncocllnu.supabase.co/rest/v1/coupons?...
   ```

2. **Resposta da API:**
   - Status 200: Sucesso
   - Status 401: Problema de autenticação
   - Status 403: Problema de permissão
   - Status 404: Tabela não encontrada

3. **Erros JavaScript:**
   - Verifique se há erros no console
   - Copie a mensagem de erro completa

## 🧪 Teste Rápido

### Passo 1: Criar Cupom de Teste

```sql
INSERT INTO coupons (code, plan_linked, max_uses, is_active)
VALUES ('TESTE-RAPIDO', 'free', 10, true)
ON CONFLICT (code) DO UPDATE 
SET is_active = true, current_uses = 0;
```

### Passo 2: Testar no App

1. Abra o app
2. Digite: `TESTE-RAPIDO`
3. Deve validar com sucesso ✅

### Passo 3: Verificar no Console

Abra o console (F12) e veja a requisição:

```javascript
// Deve aparecer algo como:
GET /rest/v1/coupons?select=*&code=ilike.TESTE-RAPIDO&is_active=eq.true&limit=1
```

## 📝 Cupons de Teste Disponíveis

Após executar `cupons_teste_todos_planos.sql`, você terá:

- ✅ `TESTE-FREE` - Plano free (100 usos)
- ✅ `TESTE-MONTHLY` - Plano monthly (50 usos)
- ✅ `TESTE-ANNUAL` - Plano annual (30 usos)
- ✅ `ACADEMIA-STARTER` - Academy Starter (50 usos, requer pagamento Cakto)
- ✅ `ACADEMIA-GROWTH` - Academy Growth (100 usos, requer pagamento Cakto)
- ✅ `PERSONAL-TEAM` - Personal Team (30 usos, requer pagamento Cakto)

## ⚠️ Cupons que Requerem Pagamento Cakto

Se você tentar usar `ACADEMIA-STARTER`, `ACADEMIA-GROWTH` ou `PERSONAL-TEAM`:

1. **Precisa ter um perfil de pagamento ativo:**
   ```sql
   SELECT * FROM user_profiles
   WHERE cakto_customer_id = 'cakto_customer_academia_starter'
     AND status = 'active'
     AND (expiry_date IS NULL OR expiry_date > now());
   ```

2. **Se não existir, o cupom será bloqueado**

## 🔍 Debug Avançado

Adicione logs temporários no código para debug:

```typescript
// Em services/supabaseService.ts, na função validateCoupon:
console.log('🔍 Validando cupom:', normalized);
console.log('🔍 Query:', { code: normalized, is_active: true });

const { data, error } = await supabase
  .from('coupons')
  .select('*')
  .ilike('code', normalized)
  .eq('is_active', true)
  .limit(1)
  .maybeSingle();

console.log('🔍 Resultado:', { data, error });
```

## 📞 Ainda com Problemas?

1. **Verifique os logs do console do navegador**
2. **Verifique as requisições na aba Network**
3. **Confirme que os cupons foram criados no Supabase**
4. **Verifique as políticas RLS da tabela `coupons`**
5. **Confirme que as variáveis de ambiente estão corretas no Vercel**

