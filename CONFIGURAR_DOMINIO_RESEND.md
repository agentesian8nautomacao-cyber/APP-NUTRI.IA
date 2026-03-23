# 📧 Configurar Domínio no Resend - noreply.nutri.ai

## 📋 Informações do Domínio

- **Domínio**: `noreply.nutri.ai`
- **Região**: São Paulo (sa-east-1)
- **Status**: Aguardando verificação DNS

## 🔧 Registros DNS a Adicionar

Você precisa adicionar os seguintes registros DNS no provedor do domínio `nutri.ai` (onde o domínio está registrado).

### 1. Verificação de Domínio (DKIM)

**Tipo**: TXT  
**Nome**: `resend._domainkey.noreply`  
**Conteúdo**: 
```
p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC4nCGpwZJv+MI2z9qYmlxzSOuTreO8ZbPF+QvHY8uitbPC5WIXyu2j4/rS9GT9kXyxiUj6+O8EQMUQcpsHK6o8r16pXlE1NduOfH9uSD1T3GiW0saXvxirduSL+e9k8UL32rl3pPhId1iqtlXCDVjpyurveE66KP/7i4OChbzszQIDAQAB
```
**TTL**: Auto (ou 3600)

### 2. SPF (Ativar Envio)

#### Registro MX:
**Tipo**: MX  
**Nome**: `send.noreply`  
**Conteúdo**: `feedback-smtp.sa-east-1.amazonses.com`  
**TTL**: Auto  
**Prioridade**: 10

#### Registro TXT:
**Tipo**: TXT  
**Nome**: `send.noreply`  
**Conteúdo**: 
```
v=spf1 include:amazonses.com ~all
```
**TTL**: Auto

### 3. DMARC (Opcional - Recomendado)

**Tipo**: TXT  
**Nome**: `_dmarc`  
**Conteúdo**: 
```
v=DMARC1; p=none;
```
**TTL**: Auto

### 4. MX (Ativar Recebimento - Opcional)

**Tipo**: MX  
**Nome**: `noreply`  
**Conteúdo**: `inbound-smtp.sa-east-1.amazonaws.com`  
**TTL**: Auto  
**Prioridade**: 10

## 📝 Passo a Passo por Provedor

### Cloudflare

1. Acesse [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Selecione o domínio `nutri.ai`
3. Vá em **DNS** → **Records**
4. Clique em **Add record** para cada registro:

   **Registro 1 (DKIM)**:
   - Type: `TXT`
   - Name: `resend._domainkey.noreply`
   - Content: `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC4nCGpwZJv+MI2z9qYmlxzSOuTreO8ZbPF+QvHY8uitbPC5WIXyu2j4/rS9GT9kXyxiUj6+O8EQMUQcpsHK6o8r16pXlE1NduOfH9uSD1T3GiW0saXvxirduSL+e9k8UL32rl3pPhId1iqtlXCDVjpyurveE66KP/7i4OChbzszQIDAQAB`
   - TTL: Auto
   - Save

   **Registro 2 (SPF MX)**:
   - Type: `MX`
   - Name: `send.noreply`
   - Mail server: `feedback-smtp.sa-east-1.amazonses.com`
   - Priority: `10`
   - TTL: Auto
   - Save

   **Registro 3 (SPF TXT)**:
   - Type: `TXT`
   - Name: `send.noreply`
   - Content: `v=spf1 include:amazonses.com ~all`
   - TTL: Auto
   - Save

   **Registro 4 (DMARC)**:
   - Type: `TXT`
   - Name: `_dmarc`
   - Content: `v=DMARC1; p=none;`
   - TTL: Auto
   - Save

   **Registro 5 (MX Recebimento - Opcional)**:
   - Type: `MX`
   - Name: `noreply`
   - Mail server: `inbound-smtp.sa-east-1.amazonaws.com`
   - Priority: `10`
   - TTL: Auto
   - Save

### Registro.br / Outros Provedores

1. Acesse o painel do seu provedor de domínio
2. Vá em **DNS** ou **Zona DNS**
3. Adicione os mesmos registros listados acima

**Importante**: 
- O **Nome** deve ser exatamente como mostrado (com subdomínio)
- Para `resend._domainkey.noreply`, o nome completo será `resend._domainkey.noreply.nutri.ai`
- Para `send.noreply`, o nome completo será `send.noreply.nutri.ai`

## ⏱️ Tempo de Propagação

- **Tempo estimado**: 15 minutos a 72 horas
- **Normalmente**: 1-4 horas
- O Resend verifica automaticamente a cada poucos minutos

## ✅ Verificar Status

1. Acesse [Resend Dashboard](https://resend.com/domains)
2. Vá em **Domains**
3. Clique em `noreply.nutri.ai`
4. Verifique o status:
   - 🟡 **Pending**: Ainda verificando (aguarde)
   - 🟢 **Verified**: Domínio verificado e pronto!
   - 🔴 **Failed**: Verifique os registros DNS

## 🔄 Após Verificação

Quando o domínio estiver verificado:

1. **Atualize a variável de ambiente** no Supabase Edge Function:
   ```
   EMAIL_FROM=Nutri.ai <noreply@noreply.nutri.ai>
   ```

2. **Ou use no código**:
   ```typescript
   const EMAIL_FROM = 'Nutri.ai <noreply@noreply.nutri.ai>';
   ```

## 🧪 Testar Envio

Após verificação, teste enviando um email:

```typescript
await sendInviteCodeEmail(
  'teste@email.com',
  'Nome Teste',
  'TESTE-CODE-123',
  'academy_starter'
);
```

## ⚠️ Importante

1. **Não remova os registros DNS** após verificação
2. **Mantenha os registros ativos** para continuar enviando
3. **DMARC é opcional** mas recomendado para melhor deliverability
4. **MX para recebimento é opcional** (só necessário se quiser receber emails)

## 🔍 Troubleshooting

### Domínio não verifica após 72 horas

1. Verifique se os registros foram adicionados corretamente
2. Use ferramentas de verificação DNS:
   - [MXToolbox](https://mxtoolbox.com/SuperTool.aspx)
   - Digite: `resend._domainkey.noreply.nutri.ai`
3. Verifique se não há espaços extras nos registros
4. Certifique-se de que o TTL não está muito alto (use Auto ou 3600)

### Erro: "Domain not found"

- Verifique se o subdomínio `noreply.nutri.ai` está configurado no DNS principal
- Pode ser necessário criar um registro A ou CNAME para `noreply` apontando para algum lugar

### Status: "Temporary Failure"

- O Resend detectou que os registros existiam mas agora não consegue encontrá-los
- Verifique se os registros ainda estão ativos no DNS
- Aguarde até 72 horas para o Resend re-verificar

## 📚 Referências

- [Documentação Resend - Domains](https://resend.com/docs/dashboard/domains/introduction)
- [Guia DNS do Resend](https://resend.com/docs/dashboard/domains/introduction)

---

**Status Atual**: ⏳ Aguardando configuração DNS  
**Próximo Passo**: Adicionar registros DNS no provedor do domínio

