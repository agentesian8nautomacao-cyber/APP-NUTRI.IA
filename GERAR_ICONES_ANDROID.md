# 🎨 Como Gerar os Ícones Corretos do App Android

## ⚠️ Problema Identificado

Os ícones `ic_launcher.png` nas pastas `mipmap-*` ainda são genéricos (ícone "V" branco). Eles precisam ser gerados a partir da imagem do logo do Nutri.ai.

## ✅ Solução Rápida: Android Asset Studio (Recomendado)

### Passo 1: Acesse o Android Asset Studio
👉 **https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html**

### Passo 2: Faça Upload da Imagem
- Clique em "Image" 
- Faça upload de: `android/app/src/main/res/1024.png` ou `play_store_512.png`

### Passo 3: Configure as Cores
- **Background Color**: `#1A4D2E` (verde escuro do Nutri.ai)
- **Foreground**: Deixe a imagem do logo como está

### Passo 4: Baixe e Extraia
- Clique no botão **"Download"** (canto superior direito)
- Extraia o arquivo ZIP baixado

### Passo 5: Copie os Ícones
1. Abra a pasta extraída
2. Vá para: `app/src/main/res/`
3. **Copie TODAS as pastas `mipmap-*`** (hdpi, mdpi, xhdpi, xxhdpi, xxxhdpi)
4. **Cole em**: `E:\Nutri.IA\android\app\src\main\res\`
5. **Substitua** as pastas existentes quando solicitado

### Passo 6: Verificar Arquivos
Certifique-se de que cada pasta `mipmap-*` contém:
- ✅ `ic_launcher.png`
- ✅ `ic_launcher_round.png`
- ✅ `ic_launcher_foreground.png`
- ✅ `ic_launcher_adaptive_back.png`
- ✅ `ic_launcher_adaptive_fore.png`

## 🔄 Após Gerar os Ícones

1. **Limpar o build anterior:**
   ```powershell
   cd android
   $env:JAVA_HOME = "C:\Program Files\Java\jdk-21"
   ./gradlew clean
   ```

2. **Fazer novo build:**
   ```powershell
   ./gradlew assembleDebug
   ```

3. **Desinstalar o app do dispositivo** (para limpar cache)

4. **Reinstalar o app** - o ícone correto deve aparecer!

## 📝 Nota

Os arquivos de configuração já estão corretos:
- ✅ `AndroidManifest.xml` - aponta para os ícones corretos
- ✅ `mipmap-anydpi-v26/ic_launcher.xml` - configurado
- ✅ `values/ic_launcher_background.xml` - criado

O único problema é que os arquivos PNG nas pastas `mipmap-*` precisam ser substituídos pelos ícones gerados a partir do logo do Nutri.ai.

