# Guia para Gerar Ícones do Android Manualmente

Como há problemas com a instalação de bibliotecas, você pode gerar os ícones manualmente usando uma das opções abaixo:

## Opção 1: Usar Android Asset Studio (Recomendado)

1. Acesse: https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html
2. Faça upload da imagem: `public/logo-Nutri.ai.jpeg`
3. Configure:
   - Background Color: `#1A4D2E`
   - Foreground: Sua imagem do logo
4. Clique em "Download" para baixar o ZIP
5. Extraia o ZIP e copie as pastas `mipmap-*` para:
   ```
   android/app/src/main/res/
   ```

## Opção 2: Usar Ferramenta Online

1. Acesse: https://www.appicon.co/ ou https://icon.kitchen/
2. Faça upload de: `public/logo-Nutri.ai.jpeg`
3. Selecione "Android" como plataforma
4. Baixe e extraia os ícones
5. Copie as pastas `mipmap-*` para `android/app/src/main/res/`

## Opção 3: Usar Photoshop/GIMP

Redimensione a imagem `public/logo-Nutri.ai.jpeg` para os seguintes tamanhos e salve como PNG:

- `mipmap-mdpi/ic_launcher.png`: 48x48px
- `mipmap-hdpi/ic_launcher.png`: 72x72px
- `mipmap-xhdpi/ic_launcher.png`: 96x96px
- `mipmap-xxhdpi/ic_launcher.png`: 144x144px
- `mipmap-xxxhdpi/ic_launcher.png`: 192x192px

Repita para:
- `ic_launcher_round.png` (mesmos tamanhos)
- `ic_launcher_foreground.png` (mesmos tamanhos, fundo transparente)
- `ic_launcher_adaptive_fore.png` (mesmos tamanhos, fundo transparente)
- `ic_launcher_adaptive_back.png` (mesmos tamanhos, fundo sólido #1A4D2E)

## Arquivos Necessários

Após gerar os ícones, certifique-se de que existem:

1. ✅ `android/app/src/main/res/values/ic_launcher_background.xml` (já criado)
2. ✅ `android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml` (já existe)
3. ✅ `android/app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml` (já existe)
4. ⚠️ Ícones PNG em todas as pastas `mipmap-*` (precisa gerar)

## Após Gerar os Ícones

1. Recompile o app Android:
   ```bash
   npx cap sync android
   ```

2. Faça o build:
   ```bash
   cd android
   ./gradlew assembleDebug
   ```

3. Instale no dispositivo e teste o ícone!


