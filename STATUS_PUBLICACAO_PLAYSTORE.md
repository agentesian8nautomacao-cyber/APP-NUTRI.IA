# 📱 Status de Publicação - Play Store

## ✅ O QUE JÁ ESTÁ PRONTO

### Estrutura Android
- ✅ `android/app/build.gradle` - **EXISTE** e configurado
- ✅ `android/app/src/main/AndroidManifest.xml` - **EXISTE** e completo
- ✅ `android/app/src/main/res/` - **EXISTE** com ícones padrão
- ✅ Estrutura Capacitor configurada

### Configurações Atuais
- **Application ID**: `com.example.app` ⚠️ **PRECISA SER ALTERADO**
- **App Name**: `nutri-ai-app` ⚠️ **PRECISA SER ALTERADO**
- **Version Code**: `1`
- **Version Name**: `1.0`
- **Minify**: `false` (pode ser habilitado para release)

---

## ❌ O QUE FALTA PARA PUBLICAR

### 1. 🔴 CRÍTICO - Configuração de Identidade

#### Application ID Único
**Status**: ❌ Usando `com.example.app` (padrão)

**Ação Necessária**:
```gradle
// android/app/build.gradle
applicationId "com.nutriai.app"  // ou "br.com.nutriai" ou seu domínio
```

**Arquivos a alterar**:
- `android/app/build.gradle` (linha 7)
- `capacitor.config.json` (linha 2)
- `android/app/src/main/res/values/strings.xml` (linhas 5-6)

#### Nome do App
**Status**: ❌ Usando `nutri-ai-app` (nome técnico)

**Ação Necessária**:
```xml
<!-- android/app/src/main/res/values/strings.xml -->
<string name="app_name">Nutri.ai</string>
```

---

### 2. 🔴 CRÍTICO - Keystore (Assinatura)

**Status**: ❌ **NÃO EXISTE**

**Ação Necessária**:
```bash
# Gerar keystore (execute no terminal)
keytool -genkey -v -keystore nutri-ai-release.keystore -alias nutri-ai -keyalg RSA -keysize 2048 -validity 10000
```

**Depois criar** `android/keystore.properties`:
```properties
storeFile=nutri-ai-release.keystore
storePassword=SUA_SENHA_AQUI
keyAlias=nutri-ai
keyPassword=SUA_SENHA_AQUI
```

**E atualizar** `android/app/build.gradle` para usar o keystore.

---

### 3. 🟡 IMPORTANTE - Ícones Personalizados

**Status**: ⚠️ Usando ícones padrão do Capacitor

**Ação Necessária**:
- Criar ícone 1024x1024px
- Gerar todos os tamanhos (mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi)
- Substituir em `android/app/src/main/res/mipmap-*/`

**Ferramentas**:
- [Android Asset Studio](https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html)
- [App Icon Generator](https://www.appicon.co/)

---

### 4. 🟡 IMPORTANTE - Permissões no Manifest

**Status**: ⚠️ Apenas INTERNET declarada

**Verificar se precisa adicionar**:
```xml
<!-- Para câmera (análise de pratos) -->
<uses-permission android:name="android.permission.CAMERA" />
<uses-feature android:name="android.hardware.camera" android:required="false" />

<!-- Para notificações -->
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

<!-- Para armazenamento (se salvar imagens) -->
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="32" />
```

---

### 5. 🟡 IMPORTANTE - Build de Produção

**Status**: ❌ Não configurado

**Ação Necessária**:
1. Configurar signing config no `build.gradle`
2. Gerar build release:
```bash
cd android
./gradlew bundleRelease
# ou
./gradlew assembleRelease
```

**Output**: `android/app/build/outputs/bundle/release/app-release.aab`

---

### 6. 🟢 RECOMENDADO - Otimizações

#### ProGuard/R8
**Status**: ⚠️ `minifyEnabled false`

**Ação** (opcional, mas recomendado):
```gradle
buildTypes {
    release {
        minifyEnabled true
        shrinkResources true
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}
```

#### Versionamento
**Status**: ✅ Configurado (mas precisa incrementar para cada release)

---

### 7. 🔴 CRÍTICO - Assets da Play Store

**Status**: ❌ Não criados

**Necessário**:
- [ ] **Ícone do app**: 512x512px PNG (sem transparência)
- [ ] **Feature Graphic**: 1024x500px (banner da loja)
- [ ] **Screenshots**: Mínimo 2, recomendado 4-8
  - Telefone: 1080x1920px ou 1920x1080px
  - Tablet: 1200x1920px ou 1920x1200px
- [ ] **Vídeo promocional** (opcional): até 30 segundos

---

### 8. 🔴 CRÍTICO - Documentação Legal

**Status**: ❌ Não criada

**Necessário**:
- [ ] **Política de Privacidade** (URL pública obrigatória)
- [ ] **Termos de Serviço**
- [ ] **Email de suporte** (obrigatório)

---

### 9. 🟡 IMPORTANTE - Informações da Loja

**Status**: ❌ Não preenchidas

**Necessário no Google Play Console**:
- [ ] Nome do app (até 50 caracteres)
- [ ] Descrição curta (até 80 caracteres)
- [ ] Descrição completa (até 4000 caracteres)
- [ ] Categoria: Saúde e fitness
- [ ] Classificação de conteúdo
- [ ] Website (se tiver)
- [ ] Contato de suporte

---

## 📋 CHECKLIST DE PUBLICAÇÃO

### Fase 1: Preparação Técnica (1-2 dias)
- [ ] Alterar Application ID para único
- [ ] Alterar nome do app
- [ ] Criar keystore
- [ ] Configurar signing no build.gradle
- [ ] Adicionar permissões necessárias
- [ ] Criar ícones personalizados
- [ ] Testar build local

### Fase 2: Build e Testes (1-2 dias)
- [ ] Gerar build release (AAB)
- [ ] Testar em dispositivos reais
- [ ] Testar todas as funcionalidades
- [ ] Verificar performance
- [ ] Corrigir bugs encontrados

### Fase 3: Assets e Documentação (2-3 dias)
- [ ] Criar ícone 512x512px
- [ ] Criar feature graphic
- [ ] Tirar screenshots
- [ ] Criar política de privacidade
- [ ] Criar termos de serviço
- [ ] Preparar descrições

### Fase 4: Google Play Console (1 dia)
- [ ] Criar conta de desenvolvedor ($25)
- [ ] Preencher informações do app
- [ ] Fazer upload do AAB
- [ ] Adicionar screenshots
- [ ] Adicionar política de privacidade
- [ ] Preencher classificação de conteúdo
- [ ] Enviar para revisão

### Fase 5: Aguardar Aprovação (1-7 dias)
- [ ] Google revisa o app
- [ ] Corrigir problemas se houver
- [ ] App publicado! 🎉

---

## 🚀 PRÓXIMOS PASSOS IMEDIATOS

1. **HOJE**: Alterar Application ID e nome do app
2. **HOJE**: Criar keystore
3. **ESTA SEMANA**: Criar ícones e assets
4. **ESTA SEMANA**: Criar política de privacidade
5. **PRÓXIMA SEMANA**: Gerar build e testar
6. **PRÓXIMA SEMANA**: Criar conta Play Console e publicar

---

## 📝 COMANDOS ÚTEIS

### Gerar Keystore
```bash
keytool -genkey -v -keystore nutri-ai-release.keystore -alias nutri-ai -keyalg RSA -keysize 2048 -validity 10000
```

### Build Release
```bash
cd android
./gradlew bundleRelease
```

### Verificar assinatura do APK/AAB
```bash
jarsigner -verify -verbose -certs app-release.aab
```

### Instalar no dispositivo
```bash
adb install app-release.apk
```

---

## ⚠️ IMPORTANTE

- **NUNCA** compartilhe o keystore ou senhas
- **SEMPRE** faça backup do keystore
- **GUARDE** as senhas do keystore em local seguro
- **TESTE** o app antes de publicar
- **LEIA** as políticas do Google Play antes de publicar

---

**Última atualização**: $(Get-Date -Format "dd/MM/yyyy")

