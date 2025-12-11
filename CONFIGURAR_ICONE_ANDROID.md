# Configuração do Ícone do App Android

## Objetivo

Configurar o logo `logo-Nutri.ai.jpeg` como ícone principal do app Android para aparecer na área de trabalho dos dispositivos.

## ⚠️ IMPORTANTE

O ícone do app Android está localizado em: `E:\Nutri.IA\android\app\src\main\res`

Este é o ícone que aparecerá na área de trabalho dos dispositivos quando o app for instalado.

## Estrutura Atual

O Android usa ícones em diferentes tamanhos para diferentes densidades de tela:
- `mipmap-mdpi/` - 48x48px
- `mipmap-hdpi/` - 72x72px  
- `mipmap-xhdpi/` - 96x96px
- `mipmap-xxhdpi/` - 144x144px
- `mipmap-xxxhdpi/` - 192x192px

E também ícones adaptativos (Android 8.0+):
- `ic_launcher_adaptive_fore.png` - Foreground (primeiro plano)
- `ic_launcher_adaptive_back.png` - Background (fundo)

## Método 1: Usando Android Asset Studio (Recomendado)

### Passo a Passo:

1. **Abrir Android Studio**
   - Abra o projeto Android em Android Studio
   - Vá em: `File` > `New` > `Image Asset`

2. **Configurar o Asset**
   - **Icon Type**: Launcher Icons (Adaptive and Legacy)
   - **Name**: `ic_launcher`
   - **Foreground Layer**:
     - **Source Asset**: Clique em "Path" e selecione `E:\Nutri.IA\public\logo-Nutri.ai.jpeg`
     - **Scaling**: Ajuste para que o logo fique bem centralizado
   - **Background Layer**:
     - **Color**: `#1A4D2E` (verde escuro do app) ou `#F5F1E8` (creme do background)
   - Clique em **Next** e depois **Finish**

3. **Resultado**
   - O Android Studio gerará automaticamente todos os tamanhos necessários
   - Os arquivos serão colocados nas pastas corretas

## Método 2: Usando Ferramenta Online

1. Acesse: https://icon.kitchen/ ou https://romannurik.github.io/AndroidAssetStudio/
2. Faça upload do `logo-Nutri.ai.jpeg`
3. Configure:
   - Background color: `#1A4D2E`
   - Padding: Ajuste conforme necessário
4. Baixe o ZIP gerado
5. Extraia e copie os arquivos para as pastas `mipmap-*` correspondentes

## Método 3: Conversão Manual (Usando ImageMagick ou similar)

Se você tiver ImageMagick instalado, pode usar este script:

```bash
# Converter JPEG para PNG
convert public/logo-Nutri.ai.jpeg -resize 192x192 android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png
convert public/logo-Nutri.ai.jpeg -resize 144x144 android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png
convert public/logo-Nutri.ai.jpeg -resize 96x96 android/app/src/main/res/mipmap-xhdpi/ic_launcher.png
convert public/logo-Nutri.ai.jpeg -resize 72x72 android/app/src/main/res/mipmap-hdpi/ic_launcher.png
convert public/logo-Nutri.ai.jpeg -resize 48x48 android/app/src/main/res/mipmap-mdpi/ic_launcher.png

# Para ícones adaptativos, você precisará criar versões com fundo
# Foreground (sem fundo, apenas o logo)
# Background (fundo sólido ou gradiente)
```

## Verificação

Após configurar os ícones:

1. **Verificar AndroidManifest.xml**
   ```xml
   <application
       android:icon="@mipmap/ic_launcher"
       android:roundIcon="@mipmap/ic_launcher_round"
       ...>
   ```

2. **Build e Teste**
   ```bash
   cd android
   ./gradlew assembleDebug
   ```
   
3. **Instalar no dispositivo**
   - Instale o APK gerado
   - Verifique se o ícone aparece corretamente na área de trabalho

## Notas Importantes

- O AndroidManifest.xml já está configurado corretamente com `@mipmap/ic_launcher`
- Os ícones adaptativos são usados no Android 8.0+ (API 26+)
- Para versões antigas, usa-se os ícones padrão (`ic_launcher.png`)
- Certifique-se de que todos os tamanhos estão presentes para evitar ícones pixelados

## Arquivos que Serão Atualizados

Após gerar os ícones, os seguintes arquivos serão criados/atualizados:

```
android/app/src/main/res/
├── mipmap-mdpi/
│   ├── ic_launcher.png
│   ├── ic_launcher_round.png
│   ├── ic_launcher_adaptive_fore.png
│   └── ic_launcher_adaptive_back.png
├── mipmap-hdpi/
│   └── (mesmos arquivos)
├── mipmap-xhdpi/
│   └── (mesmos arquivos)
├── mipmap-xxhdpi/
│   └── (mesmos arquivos)
└── mipmap-xxxhdpi/
    └── (mesmos arquivos)
```

## Próximos Passos

1. ✅ Gerar os ícones usando um dos métodos acima
2. ✅ Verificar se os arquivos foram criados corretamente
3. ✅ Fazer build do app Android
4. ✅ Testar em dispositivo real ou emulador
5. ✅ Verificar se o ícone aparece na área de trabalho

