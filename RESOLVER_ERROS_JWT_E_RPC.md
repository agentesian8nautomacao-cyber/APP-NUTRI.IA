# 🔧 Resolver Erros de JWT Inválido e RPC

## 📋 Problemas Identificados

### 1. **Erro 403: "User from sub claim in JWT does not exist"**
- **Causa:** O JWT contém um `sub` (subject) que não corresponde a um usuário existente no Supabase Auth
- **Quando ocorre:** Após criar um usuário, mas o token JWT está inválido ou o usuário foi deletado
- **Sintoma:** `Failed to load resource: the server responded with a status of 403 ()`

### 2. **Erro 400 na função RPC `create_user_profile`**
- **Causa:** A função RPC está tentando fazer cast de `subscription_status` para um valor que não está no enum
- **Quando ocorre:** Ao criar perfil de usuário trial ou com cupom
- **Sintoma:** `Failed to load resource: the server responded with a status of 400 ()`

### 3. **Múltiplas chamadas ao `onGetStarted`**
- **Causa:** O evento está sendo disparado múltiplas vezes, causando geração duplicada de plano
- **Sintoma:** `🔄 [DEBUG] Gerando novo plano...` aparecendo múltiplas vezes

### 4. **Enquete aparecendo múltiplas vezes**
- **Causa:** A flag `showSurvey` não está sendo verificada antes de mostrar a enquete
- **Sintoma:** Enquete aparecendo repetidamente

---

## ✅ Soluções Implementadas

### 1. **Melhorar Tratamento de Erro JWT**

**Arquivo:** `services/supabaseService.ts`

```typescript
async getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      // Tratar erros de sessão inválida
      if (error.message?.includes('session') || 
          error.message?.includes('Auth session missing') ||
          error.message?.includes('User from sub claim in JWT does not exist') ||
          error.status === 403) {
        console.warn('⚠️ [DEBUG] Sessão inválida ou usuário não existe no JWT:', error.message);
        // Limpar sessão inválida
        await supabase.auth.signOut();
        return null;
      }
      throw error;
    }
    return user;
  } catch (err: any) {
    console.error('❌ [DEBUG] Erro ao obter usuário:', err);
    // Se for erro de JWT inválido, limpar sessão
    if (err.message?.includes('JWT') || err.message?.includes('sub claim')) {
      await supabase.auth.signOut();
    }
    return null;
  }
}
```

**O que faz:**
- Detecta erros de JWT inválido
- Limpa automaticamente a sessão inválida
- Retorna `null` ao invés de lançar erro, permitindo que o app continue funcionando

---

### 2. **Corrigir Função RPC `create_user_profile`**

**Arquivo:** `criar_perfil_usuario_rpc.sql`

```sql
-- Validação de subscription_status antes do cast
subscription_status = CASE 
  WHEN p_subscription_status::text = 'trial' THEN 'trial'::subscription_status
  WHEN p_subscription_status::text = 'active' THEN 'active'::subscription_status
  WHEN p_subscription_status::text = 'FREE' THEN 'FREE'::subscription_status
  WHEN p_subscription_status::text = 'PREMIUM_UNLIMITED' THEN 'PREMIUM_UNLIMITED'::subscription_status
  WHEN p_subscription_status::text = 'inactive' THEN 'inactive'::subscription_status
  WHEN p_subscription_status::text = 'expired' THEN 'expired'::subscription_status
  ELSE subscription_status -- Manter valor atual se inválido
END
```

**O que faz:**
- Valida o valor de `subscription_status` antes de fazer o cast
- Previne erros de tipo inválido
- Mantém o valor atual se o novo valor for inválido

---

### 3. **Adicionar Flag para Prevenir Múltiplas Chamadas**

**Arquivo:** `App.tsx`

```typescript
const [isProcessingGetStarted, setIsProcessingGetStarted] = useState(false);

onGetStarted={async () => {
  // Prevenir múltiplas chamadas simultâneas
  if (isProcessingGetStarted) {
    console.log('⏸️ [DEBUG] onGetStarted já em processamento, ignorando...');
    return;
  }
  
  setIsProcessingGetStarted(true);
  
  try {
    // ... código de processamento ...
  } finally {
    setIsProcessingGetStarted(false);
  }
}}
```

**O que faz:**
- Previne que `onGetStarted` seja chamado múltiplas vezes simultaneamente
- Garante que apenas uma execução ocorra por vez

---

### 4. **Prevenir Enquete Aparecer Múltiplas Vezes**

**Arquivo:** `App.tsx`

```typescript
const hasCompleted = await surveyService.hasCompletedSurvey(user.id);
if (!hasCompleted && !isDeveloper && !showSurvey) {
  console.log('📋 [DEBUG] Mostrando enquete para novo usuário (primeiro acesso)');
  // Prevenir múltiplas chamadas
  if (!showSurvey) {
    setShowSurvey(true);
  }
}
```

**O que faz:**
- Verifica se a enquete já está sendo mostrada antes de mostrar novamente
- Previne que a enquete apareça múltiplas vezes

---

### 5. **Melhorar Tratamento de Erro na Função RPC**

**Arquivo:** `services/supabaseService.ts`

```typescript
try {
  const { error: profileError } = await supabase.rpc('create_user_profile', {
    // ... parâmetros ...
  });
  
  if (profileError) {
    console.error('Erro ao criar/atualizar perfil (RPC):', profileError);
    // Tentar método alternativo
    await supabase
      .from('user_profiles')
      .upsert({
        // ... dados ...
      }, { onConflict: 'user_id' });
  }
} catch (rpcError: any) {
  console.error('Erro ao chamar RPC create_user_profile:', rpcError);
  // Tentar método alternativo direto
  await supabase
    .from('user_profiles')
    .upsert({
      // ... dados ...
    }, { onConflict: 'user_id' });
}
```

**O que faz:**
- Usa `try/catch` para capturar erros da função RPC
- Tenta método alternativo (`upsert` direto) se a RPC falhar
- Garante que o perfil seja criado mesmo se a RPC falhar

---

## 🧪 Como Testar

### 1. **Testar Tratamento de JWT Inválido**
1. Crie um usuário no Supabase
2. Delete o usuário do Supabase Auth (mas mantenha o perfil)
3. Tente fazer login
4. **Esperado:** O app deve limpar a sessão inválida e redirecionar para login

### 2. **Testar Função RPC**
1. Crie um novo usuário sem cupom (trial)
2. Verifique se o perfil foi criado corretamente
3. **Esperado:** Perfil criado com `subscription_status = 'trial'`

### 3. **Testar Prevenção de Múltiplas Chamadas**
1. Faça login rapidamente múltiplas vezes
2. Verifique os logs do console
3. **Esperado:** Apenas uma chamada a `onGetStarted` deve ser processada

### 4. **Testar Enquete**
1. Crie um novo usuário
2. Faça login
3. **Esperado:** A enquete deve aparecer apenas uma vez

---

## 📝 Notas Importantes

1. **JWT Inválido:** Se o erro persistir, pode ser necessário limpar o cache do navegador ou fazer logout manualmente
2. **Função RPC:** Se a função RPC continuar falhando, o sistema tentará usar `upsert` direto como fallback
3. **Múltiplas Chamadas:** A flag `isProcessingGetStarted` garante que apenas uma execução ocorra por vez
4. **Enquete:** A verificação `!showSurvey` previne que a enquete apareça múltiplas vezes

---

## 🔄 Próximos Passos

Se os problemas persistirem:

1. **Verificar logs do Supabase:**
   - Acesse o dashboard do Supabase
   - Verifique os logs de erro da função RPC
   - Verifique se há problemas de RLS

2. **Verificar Sessão:**
   - Limpe o cache do navegador
   - Faça logout e login novamente
   - Verifique se o usuário existe no Supabase Auth

3. **Verificar Função RPC:**
   - Execute a função RPC manualmente no Supabase SQL Editor
   - Verifique se os parâmetros estão corretos
   - Verifique se o enum `subscription_status` está atualizado

---

## ✅ Status

- ✅ Tratamento de erro JWT implementado
- ✅ Função RPC corrigida com validação de `subscription_status`
- ✅ Flag `isProcessingGetStarted` adicionada
- ✅ Prevenção de enquete múltipla implementada
- ✅ Fallback com `upsert` quando RPC falha

**Commit:** `0acaa8a` - "Fix: Melhorar tratamento de erro na funcao RPC create_user_profile"

