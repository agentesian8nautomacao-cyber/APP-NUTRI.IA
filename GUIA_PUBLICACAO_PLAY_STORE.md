# 🚀 Guia Completo: Publicação do Nutri.ai na Google Play Store

## 📋 Índice
1. [Pré-requisitos](#pré-requisitos)
2. [Preparação de Assets](#preparação-de-assets)
3. [Criação da Conta no Play Console](#criação-da-conta-no-play-console)
4. [Criação do App](#criação-do-app)
5. [Upload do AAB](#upload-do-aab)
6. [Preenchimento de Informações](#preenchimento-de-informações)
7. [Política de Privacidade](#política-de-privacidade)
8. [Classificação de Conteúdo](#classificação-de-conteúdo)
9. [Preços e Distribuição](#preços-e-distribuição)
10. [Envio para Revisão](#envio-para-revisão)
11. [Checklist Final](#checklist-final)
12. [Pós-Publicação](#pós-publicação)

---

## 📦 Pré-requisitos

### ✅ O que você já tem pronto:
- ✅ **AAB gerado**: `android/app/build/outputs/bundle/release/app-release.aab` (3.36 MB)
- ✅ **Keystore configurado**: `nutri-ai-release.keystore`
- ✅ **Application ID**: `com.nutriai.app`
- ✅ **Nome do App**: `Nutri.ai`
- ✅ **Política de Privacidade**: Criada e pronta para publicação
- ✅ **Ícones**: Instalados nas pastas `mipmap`

### 🔑 O que você precisa:
1. **Conta Google** (Gmail)
2. **Cartão de crédito/débito** para pagar a taxa única de **$25 USD**
3. **Tempo estimado**: 2-4 horas para configurar tudo
4. **Revisão do Google**: 1-7 dias úteis

---

## 🎨 Preparação de Assets

### 1. Screenshots (Obrigatório)

**Requisitos:**
- **Mínimo**: 2 screenshots
- **Máximo**: 8 screenshots
- **Formato**: PNG ou JPEG
- **Tamanho**: 
  - Telefone: 320px - 3840px (largura ou altura)
  - Tablet (7"): 320px - 3840px
  - Tablet (10"): 320px - 3840px

**Dicas:**
- Capture telas reais do app em funcionamento
- Mostre as principais funcionalidades:
  - Tela inicial (Landing Page)
  - Análise de alimentos
  - Planos alimentares
  - Receitas sugeridas
- Use frames de celular para dar aspecto profissional
- Adicione textos explicativos se necessário

**Ferramentas recomendadas:**
- [Screenshot Builder](https://www.screenshotbuilder.com/)
- [App Mockup](https://app-mockup.com/)
- [Figma](https://www.figma.com/) (gratuito)

### 2. Feature Graphic (Obrigatório)

**Requisitos:**
- **Tamanho**: 1024 x 500 pixels
- **Formato**: PNG ou JPEG (24 bits)
- **Peso máximo**: 15 MB
- **Sem texto pequeno** (não aparece bem em telas pequenas)

**Conteúdo sugerido:**
- Logo do Nutri.ai
- Slogan: "Seu Guia Diário para Comer Bem"
- Elementos visuais relacionados a nutrição
- Cores: Verde (#1A4D2E) e creme (#F5F1E8)

**Ferramentas:**
- Canva (templates prontos)
- Figma
- Photoshop

### 3. Ícone de Alta Resolução

**Requisitos:**
- **Tamanho**: 512 x 512 pixels
- **Formato**: PNG (32 bits com transparência)
- **Fundo**: Transparente ou sólido
- **Sem texto** (o Google adiciona automaticamente)

**Nota**: Você já tem os ícones instalados, mas precisa de uma versão 512x512 para o Play Console.

### 4. Vídeo Promocional (Opcional, mas recomendado)

**Requisitos:**
- **Duração**: 30 segundos a 2 minutos
- **Formato**: YouTube (link)
- **Conteúdo**: Demonstração do app em ação

---

## 🏢 Criação da Conta no Play Console

### Passo 1: Acessar o Play Console

1. Acesse: https://play.google.com/console
2. Faça login com sua conta Google
3. Se for a primeira vez, aceite os termos de serviço

### Passo 2: Pagar a Taxa de Registro

1. Clique em **"Começar"** ou **"Criar app"**
2. Será solicitado o pagamento de **$25 USD** (taxa única, válida para sempre)
3. Preencha os dados do cartão
4. Confirme o pagamento
5. **Aguarde a confirmação** (pode levar alguns minutos)

### Passo 3: Preencher Informações da Conta

1. **Nome do desenvolvedor**: PHBsoluções (ou o nome que preferir)
2. **Email de contato**: Seu email
3. **Telefone**: Seu número
4. **Endereço**: Seu endereço completo
5. **Conta bancária** (para receber pagamentos, se houver apps pagos no futuro)

---

## 📱 Criação do App

### Passo 1: Criar Novo App

1. No Play Console, clique em **"Criar app"**
2. Preencha:
   - **Nome do app**: `Nutri.ai`
   - **Idioma padrão**: Português (Brasil)
   - **Tipo de app**: App
   - **Gratuito ou pago**: Gratuito
3. Marque as declarações obrigatórias:
   - ✅ Declaro que tenho e manterei a Política de Privacidade
   - ✅ Declaro que este app segue todas as políticas do Google Play
4. Clique em **"Criar app"**

### Passo 2: Configurações Básicas

1. Vá em **"Configurações do app"** → **"Identidade do app"**
2. Verifique:
   - **Nome do app**: Nutri.ai
   - **Application ID**: com.nutriai.app (já definido no AAB)

---

## 📤 Upload do AAB

### Passo 1: Acessar Produção

1. No menu lateral, clique em **"Produção"** (ou **"Release"** → **"Produção"**)
2. Se for a primeira vez, clique em **"Criar nova versão"**

### Passo 2: Upload do Arquivo

1. Clique em **"Fazer upload"** ou **"Upload"**
2. Selecione o arquivo: `E:\Nutri.IA\android\app\build\outputs\bundle\release\app-release.aab`
3. Aguarde o upload (pode levar alguns minutos)
4. O Google irá validar o AAB automaticamente

### Passo 3: Notas da Versão

1. Preencha as **"Notas da versão"**:
   ```
   🎉 Primeira versão do Nutri.ai!

   ✨ Funcionalidades:
   - Análise nutricional por IA
   - Leitura de imagens de alimentos
   - Planos alimentares personalizados
   - Sugestões automáticas de receitas
   - Interface moderna e intuitiva
   ```

2. Clique em **"Salvar"**

### Passo 4: Revisar e Publicar

1. Revise todas as informações
2. Clique em **"Revisar versão"**
3. Se tudo estiver OK, clique em **"Iniciar lançamento para produção"**

**⚠️ IMPORTANTE**: Não clique em "Iniciar lançamento" ainda! Primeiro complete todas as seções abaixo.

---

## 📝 Preenchimento de Informações

### 1. Presença na loja

#### 1.1. Título e Descrição

**Título do app** (máx. 50 caracteres):
```
Nutri.ai - Nutrição Inteligente
```

**Descrição curta** (máx. 80 caracteres):
```
Seu guia diário para comer bem com IA
```

**Descrição completa** (máx. 4000 caracteres):
```
🥗 Nutri.ai - Seu Guia Diário para Comer Bem

Transforme sua relação com a alimentação usando inteligência artificial de última geração. O Nutri.ai oferece nutrição 100% personalizada, análise de pratos e receitas inteligentes em um só lugar.

✨ PRINCIPAIS FUNCIONALIDADES:

🧠 Análise Nutricional por IA
Analise instantaneamente qualquer prato usando fotos. Nossa IA identifica ingredientes, calcula valores nutricionais e oferece insights personalizados.

📸 Leitura Inteligente de Imagens
Simplesmente tire uma foto do seu prato e receba uma análise completa em segundos. Tecnologia avançada de reconhecimento de imagens.

📋 Planos Alimentares Personalizados
Receba planos alimentares adaptados ao seu perfil, objetivos e preferências. Crie rotinas saudáveis que se encaixam na sua vida.

🍳 Receitas Sugeridas Automaticamente
Descubra receitas deliciosas e saudáveis baseadas nos ingredientes que você tem em casa ou nos seus objetivos nutricionais.

🎯 POR QUE ESCOLHER O NUTRI.AI?

✅ Interface moderna e intuitiva
✅ Análise instantânea de alimentos
✅ Planos personalizados para seus objetivos
✅ Receitas adaptadas ao seu perfil
✅ Sem complicações - simples e eficiente

🌱 COMECE SUA JORNADA PARA UMA ALIMENTAÇÃO MAIS CONSCIENTE HOJE!

O Nutri.ai foi desenvolvido para ajudar você a fazer escolhas alimentares mais inteligentes, sem complicações. Baixe agora e descubra como é fácil ter uma nutrição personalizada na palma da sua mão.

📱 Compatível com Android 5.0+
🔒 Seus dados são privados e seguros
```

#### 1.2. Gráficos

1. **Ícone do app**: Upload do arquivo 512x512px
2. **Feature graphic**: Upload do arquivo 1024x500px
3. **Screenshots**: Upload de 2-8 screenshots

#### 1.3. Categoria

- **Categoria principal**: Saúde e fitness
- **Categoria secundária**: Estilo de vida (opcional)

#### 1.4. Classificação de conteúdo

Será preenchido na seção específica (veja abaixo).

### 2. Política e programas

#### 2.1. Política de Privacidade

**URL da Política de Privacidade** (obrigatório):

Você precisa publicar a política de privacidade em uma URL pública. Opções:

**Opção 1: GitHub Pages (Gratuito)**
1. Crie um repositório no GitHub
2. Crie um arquivo `index.html` ou `privacy-policy.html`
3. Ative GitHub Pages nas configurações
4. URL será: `https://seu-usuario.github.io/repositorio/privacy-policy.html`

**Opção 2: Netlify/Vercel (Gratuito)**
1. Crie uma conta
2. Faça upload do arquivo HTML
3. Obtenha a URL pública

**Opção 3: Seu próprio site**
- Se você já tem um site, hospede lá

**Conteúdo da política**: Use o arquivo `POLITICA_PRIVACIDADE_NUTRI_AI.md` que já foi criado.

**Exemplo de URL**:
```
https://nutriai.app/politica-de-privacidade
```
ou
```
https://phbsolucoes.github.io/nutri-ai-privacy/politica.html
```

#### 2.2. Declarações

Marque todas as declarações obrigatórias:
- ✅ Declaro que tenho e manterei a Política de Privacidade
- ✅ Declaro que este app segue todas as políticas do Google Play
- ✅ Declaro que não colete dados de crianças sem consentimento dos pais

---

## 🎯 Classificação de Conteúdo

### Passo 1: Questionário de Classificação

1. Acesse **"Política e programas"** → **"Classificação de conteúdo"**
2. Responda o questionário:

**Perguntas principais:**

1. **O app permite compras dentro do app?**
   - ✅ Não (se for totalmente gratuito)
   - ⚠️ Sim (se tiver compras futuras)

2. **O app contém anúncios?**
   - ✅ Não (se não tiver anúncios)
   - ⚠️ Sim (se tiver anúncios)

3. **O app coleta dados pessoais?**
   - ⚠️ Sim (marque quais):
     - ✅ Localização (se usar)
     - ✅ Fotos/imagens (SIM - para análise de alimentos)
     - ✅ Informações de contato (se coletar email)
     - ✅ Outros dados (se coletar)

4. **O app permite compartilhamento de conteúdo?**
   - ✅ Não (ou Sim, se permitir)

5. **O app é direcionado a crianças?**
   - ✅ Não (ou Sim, se for)

### Passo 2: Revisar Classificação

1. Revise a classificação sugerida pelo Google
2. Ajuste se necessário
3. Salve

**Classificação esperada**: PEGI 3 ou "Para todos" (se não tiver conteúdo sensível)

---

## 💰 Preços e Distribuição

### Passo 1: Configurar Distribuição

1. Acesse **"Preços e distribuição"**
2. **Disponibilidade**:
   - ✅ Todos os países (recomendado)
   - ⚠️ Ou selecione países específicos

3. **Preço**:
   - ✅ Gratuito

4. **Dispositivos**:
   - ✅ Telefones
   - ✅ Tablets (opcional)

5. **Programas**:
   - ✅ Google Play for Education (opcional)
   - ✅ Programas para desenvolvedores (opcional)

### Passo 2: Conformidade

1. **Conformidade com conteúdo**:
   - ✅ Declaro que meu app está em conformidade

2. **Exportação dos EUA**:
   - ✅ Declaro que não violo leis de exportação

3. **Conformidade com conteúdo**:
   - ✅ Declaro que meu app não contém conteúdo proibido

---

## ✅ Envio para Revisão

### Checklist Antes de Enviar

Antes de clicar em **"Enviar para revisão"**, verifique:

#### ✅ Informações Básicas
- [ ] Nome do app preenchido
- [ ] Descrição completa preenchida
- [ ] Ícone 512x512px enviado
- [ ] Feature graphic 1024x500px enviado
- [ ] Mínimo 2 screenshots enviados
- [ ] Categoria selecionada

#### ✅ Conteúdo
- [ ] Política de privacidade publicada e URL informada
- [ ] Classificação de conteúdo preenchida
- [ ] Declarações obrigatórias marcadas

#### ✅ Versão
- [ ] AAB enviado e validado
- [ ] Notas da versão preenchidas
- [ ] Versão salva (mas não publicada ainda)

#### ✅ Distribuição
- [ ] Países selecionados
- [ ] Preço configurado (gratuito)
- [ ] Conformidade declarada

### Passo Final: Enviar para Revisão

1. Vá em **"Produção"** → **"Revisar versão"**
2. Revise todos os itens
3. Se tudo estiver OK, clique em **"Enviar para revisão"**
4. **Aguarde a confirmação**

### O que acontece depois?

1. **Status**: "Em revisão" (pode levar 1-7 dias úteis)
2. **Notificações**: Você receberá emails sobre o status
3. **Aprovação**: Se aprovado, o app será publicado automaticamente
4. **Rejeição**: Se rejeitado, você receberá feedback e poderá corrigir

---

## 📋 Checklist Final

Use este checklist para garantir que tudo está completo:

### 🎨 Assets
- [ ] Ícone 512x512px criado e enviado
- [ ] Feature graphic 1024x500px criado e enviado
- [ ] 2-8 screenshots capturados e enviados
- [ ] Vídeo promocional (opcional) preparado

### 📝 Informações
- [ ] Título do app preenchido (máx. 50 caracteres)
- [ ] Descrição curta preenchida (máx. 80 caracteres)
- [ ] Descrição completa preenchida (máx. 4000 caracteres)
- [ ] Categoria selecionada
- [ ] Tags/keywords adicionadas (se disponível)

### 🔒 Política e Conformidade
- [ ] Política de privacidade publicada em URL pública
- [ ] URL da política informada no Play Console
- [ ] Classificação de conteúdo preenchida
- [ ] Todas as declarações obrigatórias marcadas

### 📦 Versão
- [ ] AAB gerado e validado
- [ ] AAB enviado para produção
- [ ] Notas da versão preenchidas
- [ ] Versão salva (não publicada ainda)

### 🌍 Distribuição
- [ ] Países selecionados
- [ ] Preço configurado (gratuito)
- [ ] Dispositivos selecionados
- [ ] Conformidade declarada

### ✅ Finalização
- [ ] Todas as seções revisadas
- [ ] Sem erros ou avisos pendentes
- [ ] Pronto para enviar para revisão

---

## 🎉 Pós-Publicação

### Após Aprovação

1. **Monitoramento**:
   - Acompanhe avaliações e comentários
   - Responda aos usuários
   - Monitore crash reports

2. **Atualizações**:
   - Quando fizer atualizações, gere novo AAB
   - Faça upload da nova versão
   - Preencha as notas da versão

3. **Estatísticas**:
   - Acompanhe downloads
   - Analise retenção de usuários
   - Monitore avaliações

### Manutenção

- **Atualizações regulares**: Mantenha o app atualizado
- **Suporte**: Responda a comentários e avaliações
- **Política de privacidade**: Mantenha atualizada
- **Conformidade**: Siga as políticas do Google Play

---

## 🆘 Problemas Comuns e Soluções

### ❌ "AAB inválido"
- **Solução**: Verifique se o AAB foi gerado corretamente
- Execute: `.\gradlew.bat bundleRelease` novamente

### ❌ "Política de privacidade não encontrada"
- **Solução**: Verifique se a URL está acessível publicamente
- Teste a URL em uma aba anônima

### ❌ "Screenshots inválidos"
- **Solução**: Verifique tamanho e formato
- Use PNG ou JPEG, dentro dos limites de tamanho

### ❌ "App rejeitado"
- **Solução**: Leia o feedback do Google
- Corrija os problemas apontados
- Reenvie para revisão

---

## 📞 Suporte

- **Play Console Help**: https://support.google.com/googleplay/android-developer
- **Documentação**: https://developer.android.com/distribute/googleplay
- **Fórum**: https://support.google.com/googleplay/android-developer/community

---

## 🎯 Resumo Rápido

1. ✅ **Criar conta** no Play Console ($25 USD)
2. ✅ **Criar app** com nome "Nutri.ai"
3. ✅ **Preparar assets** (screenshots, feature graphic, ícone)
4. ✅ **Publicar política** de privacidade em URL pública
5. ✅ **Fazer upload** do AAB
6. ✅ **Preencher** todas as informações
7. ✅ **Classificar** conteúdo
8. ✅ **Configurar** distribuição
9. ✅ **Enviar** para revisão
10. ✅ **Aguardar** aprovação (1-7 dias)

---

**Boa sorte com a publicação! 🚀**

*Última atualização: Janeiro 2025*

