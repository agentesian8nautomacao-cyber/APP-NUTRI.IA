# 📋 Checklist Completo - Publicação na Play Store

**Data:** 2025-12-17  
**App:** Nutri.ai  
**Package:** com.nutriai.app

---

## ✅ Correções Implementadas

- [x] Permissão RECORD_AUDIO adicionada no AndroidManifest.xml
- [x] Script para gerar keystore criado
- [x] .gitignore atualizado para proteger keystore
- [x] Guia de criação de keystore criado

---

## 🔧 Antes de Publicar

### 1. Criar Keystore ⚠️ OBRIGATÓRIO

**Opção A: Usar o script (Windows)**
```powershell
cd android
.\gerar-keystore.ps1
```

**Opção B: Manual**
Siga as instruções em `android/COMO_CRIAR_KEYSTORE.md`

**⚠️ CRÍTICO:**
- Guarde o keystore e as senhas em local seguro
- Faça backup imediato
- Sem o keystore, você NÃO poderá atualizar o app

---

### 2. Gerar Build Release

```bash
cd android
./gradlew bundleRelease
```

O arquivo AAB estará em:
`android/app/build/outputs/bundle/release/app-release.aab`

**Nota:** Para APK, use `./gradlew assembleRelease` (mas Play Store prefere AAB)

---

### 3. Testar o Build

- [ ] Instalar o APK/AAB em dispositivo real
- [ ] Testar funcionalidade de voz (Live Conversation)
- [ ] Testar análise de fotos (Plate Analyzer)
- [ ] Testar chat de texto
- [ ] Verificar se permissões são solicitadas corretamente
- [ ] Testar em diferentes versões do Android (se possível)

---

## 📱 Play Store Console - Configurações Obrigatórias

### Informações Básicas do App

- [ ] **Nome do app:** Nutri.ai
- [ ] **Descrição curta** (80 caracteres):
  ```
  App de nutrição com IA: planos personalizados, análise de fotos e chat
  ```
- [ ] **Descrição completa** (4000 caracteres):
  ```
  Nutri.ai é um aplicativo de nutrição inteligente que utiliza inteligência artificial para criar planos alimentares personalizados, analisar fotos de comida e oferecer consultoria nutricional em tempo real.
  
  ✨ Funcionalidades:
  
  🎙️ Conversa por Voz (Live)
  - Consulta nutricional em tempo real
  - Respostas de voz da IA
  - Limite de 15 minutos diários (reset automático)
  
  📸 Visão Inteligente
  - Tire uma foto da sua refeição
  - Identificação automática de alimentos
  - Cálculo de calorias e macros
  
  💬 Chat de Texto
  - Tire dúvidas com nutricionista virtual
  - Histórico de conversas
  - Respostas personalizadas
  
  📊 Dashboard Nutricional
  - Acompanhe seu progresso
  - Planos alimentares diários
  - Gráficos e métricas
  
  🔐 Assinaturas Disponíveis:
  - Plano Básico: Funcionalidades essenciais
  - Plano Premium: Recursos ilimitados
  
  Desenvolvido com tecnologia de ponta em IA para sua saúde e bem-estar.
  ```

### Gráficos e Imagens

- [ ] **Ícone do app:** 512x512 PNG (já existe: `icon-512.png`)
- [ ] **Banner de destaque:** 1024x500 PNG
- [ ] **Screenshots (mínimo 2, recomendado 4-8):**
  - [ ] Tela inicial/Landing
  - [ ] Dashboard
  - [ ] Análise de foto
  - [ ] Chat de voz
  - [ ] Chat de texto
  - [ ] Plano alimentar
  - [ ] Perfil

**Dicas para screenshots:**
- Use dispositivos reais ou emuladores
- Capture telas principais do app
- Adicione textos explicativos se necessário
- Resolução mínima: 320px, máxima: 3840px

### Classificação e Política

- [ ] **Política de Privacidade:** URL obrigatória
  - Criar página com política de privacidade
  - Incluir informações sobre coleta de dados
  - Explicar uso de câmera, microfone, dados de saúde
  - URL exemplo: `https://nutri.ai/privacy` ou similar

- [ ] **Classificação de conteúdo:**
  - Idade: Para todos (ou conforme necessário)
  - Categoria: Saúde e Fitness
  - Tipo de dados coletados: Nome, email, dados de saúde

### Preços e Distribuição

- [ ] **Gratuito ou pago:** Gratuito (com compras no app)
- [ ] **Países de distribuição:** Selecionar países
- [ ] **Disponibilidade:** Disponível para todos ou apenas para testes

### Assinatura (In-App Purchases)

Se você usar o sistema Cakto:
- [ ] Configurar produtos no Play Console
- [ ] Vincular com backend Cakto
- [ ] Testar compras

---

## 🔍 Verificações Finais

### Código

- [x] Permissões corretas no AndroidManifest.xml
- [x] Version code e version name configurados
- [x] Package name correto
- [x] App icon configurado
- [ ] Keystore criado e configurado
- [ ] Build release testado

### Funcionalidades

- [x] Verificação de assinatura implementada
- [x] Limite de voz sincronizado com backend
- [x] Sistema de recargas funcionando
- [x] Integração com Cakto funcionando
- [ ] Testes em dispositivo real

### Backend

- [x] Edge Functions deployadas
- [x] Schema SQL executado
- [x] Secrets configurados
- [x] Webhooks funcionando

---

## 📤 Processo de Publicação

### 1. Criar App no Play Console

1. Acesse: https://play.google.com/console
2. Clique em "Criar app"
3. Preencha informações básicas
4. Aceite os termos

### 2. Configurar App

1. Vá em "Política, apps e usuários"
2. Complete todas as seções obrigatórias
3. Adicione gráficos e screenshots
4. Configure política de privacidade

### 3. Fazer Upload do AAB

1. Vá em "Versão" > "Produção" (ou "Teste interno" primeiro)
2. Clique em "Criar nova versão"
3. Faça upload do `app-release.aab`
4. Adicione notas da versão

### 4. Revisar e Publicar

1. Revise todas as informações
2. Resolva avisos/erros
3. Envie para revisão
4. Aguarde aprovação (pode levar algumas horas a dias)

---

## ⏱️ Timeline Esperado

- **Revisão inicial:** 1-3 dias
- **Correções (se necessário):** 1-2 dias
- **Publicação:** Imediato após aprovação

---

## 🆘 Problemas Comuns

### "App rejeitado - Política de Privacidade"
- Certifique-se de que a URL está acessível
- Política deve incluir todas as permissões usadas

### "App rejeitado - Ícone/Screenshots"
- Verifique resoluções e formatos
- Use apenas imagens do próprio app

### "Erro ao fazer upload do AAB"
- Verifique se o keystore está correto
- Confirme que o build é release e não debug

### "App não aparece na busca"
- Pode levar até 24-48h após publicação
- Verifique se o app está disponível no país

---

## ✅ Checklist Final Antes de Enviar

- [ ] Keystore criado e configurado
- [ ] Build release gerado e testado
- [ ] Todos os gráficos prontos (ícone, banner, screenshots)
- [ ] Política de privacidade publicada e acessível
- [ ] Descrição do app completa
- [ ] Classificação de conteúdo configurada
- [ ] Testado em dispositivo real
- [ ] Todas as funcionalidades funcionando
- [ ] Backend deployado e funcionando

---

## 🎉 Próximos Passos Após Publicação

1. Monitorar reviews e avaliações
2. Responder feedback dos usuários
3. Monitorar métricas no Play Console
4. Preparar atualizações futuras

---

**Boa sorte com a publicação! 🚀**

Se tiver dúvidas, consulte:
- `android/COMO_CRIAR_KEYSTORE.md` - Para criar keystore
- `SISTEMA_COMPLETO_FUNCIONANDO.md` - Status das funcionalidades

