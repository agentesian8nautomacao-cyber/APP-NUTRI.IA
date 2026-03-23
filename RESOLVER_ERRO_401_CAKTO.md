# 🔧 Resolver Erro 401 ao Testar Webhook na Cakto

## 🚨 Problema

Ao tentar testar o webhook na Cakto, aparece erro:
```
POST https://api.cakto.com.br/api/app/events/31275/test/?event=pix_gerado 401 (Unauthorized)
```

---

## 🔍 Causa

O erro 401 acontece porque:
1. A Cakto está tentando enviar um evento de teste
2. Mas o webhook está rejeitando porque não recebe o token Bearer correto
3. A Cakto pode não estar enviando o header `Authorization` nos eventos de teste

---

## ✅ Soluções

### **SOLUÇÃO 1: Configurar Chave Secreta na Cakto (RECOMENDADO)**

1. **Gerar chave secreta:**
   - Acesse: https://www.random.org/strings/
   - Configure: 40 caracteres, alfanumérico
   - Gere e copie

2. **Adicionar no Supabase:**
   - Dashboard → Settings → Functions → Secrets
   - Adicione: `CAKTO_WEBHOOK_SECRET` = (sua chave)

3. **Configurar na Cakto:**
   - Edite o webhook criado
   - Procure por campo "Chave Secreta" ou "Secret Key"
   - Preencha com a mesma chave
   - Salve

4. **Testar novamente:**
   - Tente enviar evento de teste novamente
   - Deve funcionar agora

---

### **SOLUÇÃO 2: Verificar se a Cakto Está Enviando o Token**

O webhook foi atualizado para aceitar token de múltiplas formas:
- Header `Authorization: Bearer TOKEN`
- Query parameter `?token=TOKEN` ou `?secret=TOKEN`
- Ou sem autenticação se `CAKTO_WEBHOOK_SECRET` não estiver configurado

**Verificar logs:**
1. Acesse: https://supabase.com/dashboard/project/hflwyatppivyncocllnu/functions/cakto-webhook/logs
2. Procure por:
   - `📋 Headers recebidos:` → Ver o que a Cakto está enviando
   - `❌ Autenticação falhou:` → Ver por que falhou
   - `✅ Autenticação válida` → Funcionou!

---

### **SOLUÇÃO 3: Temporariamente Aceitar Sem Autenticação**

Se você não conseguir configurar a chave secreta na Cakto:

1. **Remover o secret do Supabase temporariamente:**
   - Dashboard → Settings → Functions → Secrets
   - Remova ou deixe vazio o `CAKTO_WEBHOOK_SECRET`

2. **O webhook aceitará requisições sem autenticação:**
   - ⚠️ **ATENÇÃO:** Isso reduz a segurança!
   - Use apenas para testes

3. **Depois, configure a autenticação corretamente**

---

## 📋 Checklist de Verificação

### Supabase:
- [ ] `CAKTO_WEBHOOK_SECRET` configurado?
- [ ] Webhook deployado com código atualizado?
- [ ] Logs aparecendo quando eventos chegam?

### Cakto:
- [ ] Webhook criado?
- [ ] Chave Secreta configurada no webhook?
- [ ] URL correta (`cakto-webhook`, não `webhool`)?
- [ ] Eventos selecionados?

### Teste:
- [ ] Evento de teste enviado?
- [ ] Logs mostram autenticação válida?
- [ ] Erro 401 resolvido?

---

## 🔍 Debug Detalhado

### 1. Verificar Logs do Webhook

Acesse os logs e procure por:

**Se aparecer:**
```
📋 Headers recebidos: { authorization: 'ausente', ... }
❌ Autenticação falhou: { has_token: false, ... }
```

**Significa:** A Cakto não está enviando o token. Configure a chave secreta na Cakto.

**Se aparecer:**
```
📋 Headers recebidos: { authorization: '***presente***', ... }
❌ Autenticação falhou: { has_token: true, token_length: 40, ... }
```

**Significa:** A Cakto está enviando token, mas não confere. Verifique se é o mesmo token no Supabase e na Cakto.

---

## 🚀 Próximos Passos

1. **Verifique os logs** para ver exatamente o que a Cakto está enviando
2. **Configure a chave secreta** na Cakto (se ainda não configurou)
3. **Teste novamente** o evento
4. **Se ainda não funcionar**, me mostre os logs e eu ajudo a resolver

---

**Última atualização**: 2025-01-27



