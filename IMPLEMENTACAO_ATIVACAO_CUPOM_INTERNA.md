# 🎫 Implementação de Ativação Interna de Cupons

## 📋 Visão Geral

A lógica de cupons foi implementada como um **recurso de ativação interna de conta**, totalmente **desacoplada de gateways de pagamento ou checkout externo**. O fluxo ocorre em uma tela dedicada dentro do aplicativo ('Inserir Cupom').

---

## 🔄 Fluxo de Ativação

### 1. **Acesso à Tela**
- Usuário autenticado acessa o menu lateral
- Clica em **"Inserir Cupom"**
- É redirecionado para a tela de ativação

### 2. **Validação e Ativação**
Ao clicar no botão **"Ativar Cupom"**:

1. **O App envia uma requisição para o backend** (função SQL `activate_coupon_internal`)
2. **O sistema consulta o banco de dados** para verificar:
   - Se o cupom existe
   - Se está ativo (`is_active = true`)
   - Se `quantidade_disponivel > 0`
   - Se o cupom é para o perfil correto (Academia ou Personal)
3. **Se válido**: 
   - O sistema executa imediatamente um **UPDATE atômico** no banco
   - Decrementa **1 unidade** do estoque (`quantidade_disponivel`)
   - Incrementa `current_uses`
   - Libera o acesso/plano correspondente para o usuário na hora
   - Atualiza `plan_type` e `subscription_status` do usuário
   - Cria vínculo na tabela `user_coupon_links`
4. **Se inválido ou estoque zerado**: 
   - O sistema retorna erro específico
   - Não libera o acesso

### 3. **Controle de Estoque**
- ✅ **Mandatório**: A validação e o decremento ocorrem **no ato do clique** no botão 'Ativar'
- ✅ **Atômico**: A operação é transacional, evitando race conditions
- ✅ **Verificação de Perfil**: Cupons de Academia/Personal só podem ser ativados por usuários com o perfil correto

---

## 📁 Arquivos Criados/Modificados

### 1. **SQL: `supabase_activate_coupon_function.sql`**
Função SQL que implementa a lógica de ativação atômica:

```sql
CREATE OR REPLACE FUNCTION activate_coupon_internal(
  p_coupon_code TEXT,
  p_user_id UUID
)
RETURNS JSON
```

**Funcionalidades:**
- Valida existência e status do cupom
- Verifica `quantidade_disponivel > 0`
- Valida perfil do usuário (Academia/Personal)
- Decrementa atomicamente o estoque
- Atualiza plano do usuário
- Cria vínculo `user_coupon_links`

**Campo `quantidade_disponivel`:**
- Adicionado à tabela `coupons`
- Calculado automaticamente como `max_uses - current_uses`
- Mantido atualizado via trigger

### 2. **Componente: `components/InserirCupom.tsx`**
Tela dedicada para ativação de cupons:

- Interface intuitiva com feedback visual
- Validação em tempo real
- Mensagens de erro/sucesso específicas
- Redirecionamento automático após sucesso

### 3. **Serviço: `services/supabaseService.ts`**
Função `activateCoupon()` adicionada ao `couponService`:

```typescript
async activateCoupon(code: string, userId: string): Promise<{
  success: boolean;
  message: string;
  plan_type?: string;
  account_type?: string;
  error?: string;
}>
```

### 4. **Tipos: `types.ts`**
- Adicionado `'inserir_cupom'` ao tipo `AppView`

### 5. **Navegação: `components/Sidebar.tsx`**
- Adicionado item de menu "Inserir Cupom" com ícone `Ticket`
- Sempre visível para usuários autenticados

### 6. **App Principal: `App.tsx`**
- Importado e integrado componente `InserirCupom`
- Adicionada rota `'inserir_cupom'`
- Callback de sucesso recarrega perfil do usuário

---

## 🔐 Validações Implementadas

### 1. **Validação de Cupom**
- ✅ Cupom existe
- ✅ Cupom está ativo (`is_active = true`)
- ✅ `quantidade_disponivel > 0`
- ✅ Case-insensitive (aceita maiúsculas/minúsculas)

### 2. **Validação de Perfil**
- ✅ Cupons de **Academia** (`academy_starter`, `academy_growth`, `academy_pro`):
  - Apenas para usuários com `account_type = 'USER_GYM'` ou sem `account_type` definido
- ✅ Cupons de **Personal** (`personal_team_5`, `personal_team_15`):
  - Apenas para usuários com `account_type = 'USER_GYM'` ou sem `account_type` definido
- ✅ Cupons **B2C** (`mensal`, `anual`, `free`):
  - Sem restrição de perfil

### 3. **Validação de Usuário**
- ✅ Usuário autenticado
- ✅ Perfil existe no banco

---

## 🚀 Como Executar

### 1. **Executar SQL no Supabase**
```sql
-- Executar o arquivo completo:
-- supabase_activate_coupon_function.sql
```

Isso irá:
- Adicionar campo `quantidade_disponivel` à tabela `coupons`
- Criar trigger para manter `quantidade_disponivel` atualizado
- Criar função `activate_coupon_internal`
- Conceder permissões necessárias

### 2. **Testar no App**
1. Fazer login no app
2. Abrir menu lateral
3. Clicar em **"Inserir Cupom"**
4. Inserir código do cupom
5. Clicar em **"Ativar Cupom"**
6. Verificar mensagem de sucesso/erro
7. Verificar atualização do plano no perfil

---

## 📊 Estrutura de Dados

### Tabela `coupons`
```sql
- id (UUID)
- code (TEXT, UNIQUE)
- plan_linked (TEXT)
- max_uses (INTEGER)
- current_uses (INTEGER)
- quantidade_disponivel (INTEGER) -- NOVO
- is_active (BOOLEAN)
- cakto_customer_id (TEXT, NULLABLE)
- max_linked_accounts (INTEGER, NULLABLE)
- linked_accounts_count (INTEGER)
```

### Tabela `user_coupon_links`
```sql
- id (UUID)
- user_id (UUID, FK -> auth.users)
- coupon_id (UUID, FK -> coupons)
- created_at (TIMESTAMPTZ)
```

### Tabela `user_profiles`
Campos atualizados pela função:
- `plan_type` → Plano vinculado ao cupom
- `subscription_status` → `'active'`
- `account_type` → Definido baseado no `plan_linked` do cupom

---

## ⚠️ Tratamento de Erros

A função retorna erros específicos:

| Erro | Mensagem | Causa |
|------|----------|-------|
| `CUPOM_INEXISTENTE` | Cupom não encontrado ou inativo | Cupom não existe ou `is_active = false` |
| `CUPOM_ESGOTADO` | Este cupom não possui mais ativações disponíveis | `quantidade_disponivel <= 0` |
| `PERFIL_INCOMPATIVEL` | Este cupom é válido apenas para perfis de Academia ou Personal Trainer | Perfil do usuário não corresponde ao tipo de cupom |
| `USUARIO_NAO_ENCONTRADO` | Perfil do usuário não encontrado | Usuário não tem perfil criado |
| `ERRO_INTERNO` | Erro interno ao processar a ativação | Erro inesperado no banco |

---

## 🔄 Fluxo Completo

```
┌─────────────────┐
│  Usuário Logado │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Menu Lateral   │
│  "Inserir Cupom"│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Tela Inserir    │
│ Cupom           │
└────────┬────────┘
         │
         │ [Usuário digita código]
         │ [Clica "Ativar"]
         │
         ▼
┌─────────────────┐
│ activateCoupon()│
│ (Frontend)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ activate_coupon_ │
│ internal()      │
│ (SQL Function)  │
└────────┬────────┘
         │
         ├─► Valida cupom
         ├─► Verifica estoque
         ├─► Valida perfil
         ├─► Decrementa estoque (ATÔMICO)
         ├─► Atualiza perfil
         └─► Cria vínculo
         │
         ▼
┌─────────────────┐
│  Sucesso/Erro   │
│  (JSON Response)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Feedback UI    │
│  + Redireciona  │
└─────────────────┘
```

---

## ✅ Checklist de Implementação

- [x] Função SQL `activate_coupon_internal` criada
- [x] Campo `quantidade_disponivel` adicionado à tabela `coupons`
- [x] Trigger para manter `quantidade_disponivel` atualizado
- [x] Componente `InserirCupom.tsx` criado
- [x] Função `activateCoupon()` adicionada ao serviço
- [x] Rota `'inserir_cupom'` adicionada ao `AppView`
- [x] Item de menu adicionado ao `Sidebar`
- [x] Integração no `App.tsx` completa
- [x] Validação de perfil implementada
- [x] Tratamento de erros específicos
- [x] Feedback visual (loading, sucesso, erro)
- [x] Redirecionamento após sucesso

---

## 📝 Notas Importantes

1. **Desacoplado de Pagamentos**: Esta implementação não depende de gateways externos. A ativação é puramente interna.

2. **Atômico**: A operação de decremento é atômica, evitando race conditions quando múltiplos usuários tentam ativar o mesmo cupom simultaneamente.

3. **Perfil Dinâmico**: O `account_type` do usuário é definido automaticamente baseado no `plan_linked` do cupom (se aplicável).

4. **Compatibilidade**: A função mantém compatibilidade com cupons existentes que não têm `quantidade_disponivel` definido (calcula dinamicamente).

5. **Segurança**: A função usa `SECURITY DEFINER` para garantir que apenas usuários autenticados possam ativar cupons para seus próprios perfis.

---

## 🧪 Testes Recomendados

1. **Teste de Ativação Bem-Sucedida**:
   - Criar cupom com `quantidade_disponivel > 0`
   - Ativar via app
   - Verificar decremento do estoque
   - Verificar atualização do perfil

2. **Teste de Cupom Esgotado**:
   - Criar cupom com `quantidade_disponivel = 0`
   - Tentar ativar via app
   - Verificar mensagem de erro

3. **Teste de Perfil Incompatível**:
   - Criar cupom de Academia
   - Tentar ativar com usuário B2C
   - Verificar mensagem de erro

4. **Teste de Race Condition**:
   - Criar cupom com `quantidade_disponivel = 1`
   - Tentar ativar simultaneamente com 2 usuários
   - Verificar que apenas 1 consegue ativar

---

**Documento criado em**: 2025-01-27  
**Versão**: 1.0

