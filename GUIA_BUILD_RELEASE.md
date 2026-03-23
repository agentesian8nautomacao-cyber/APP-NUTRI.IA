# 🚀 Guia para Gerar Build Release

## Pré-requisitos

1. ✅ Keystore criado e configurado
2. ✅ `keystore.properties` preenchido
3. ✅ Application ID alterado
4. ✅ Nome do app alterado

---

## Passo a Passo

### 1. Build do Projeto Web

Primeiro, gere o build da aplicação web:

```bash
npm run build
```

Isso criará a pasta `dist/` com os arquivos otimizados.

### 2. Sincronizar com Capacitor

Sincronize os arquivos web com o projeto Android:

```bash
npx cap sync android
```

### 3. Gerar Build Release (AAB)

Navegue até a pasta android e gere o bundle:

```bash
cd android
./gradlew bundleRelease
```

**No Windows (PowerShell):**
```powershell
cd android
.\gradlew.bat bundleRelease
```

### 4. Localizar o Arquivo

O arquivo AAB estará em:
```
android/app/build/outputs/bundle/release/app-release.aab
```

---

## Alternativa: Gerar APK

Se preferir gerar um APK (não recomendado para Play Store, mas útil para testes):

```bash
cd android
./gradlew assembleRelease
```

O APK estará em:
```
android/app/build/outputs/apk/release/app-release.apk
```

---

## Verificar Assinatura

Para verificar se o AAB está corretamente assinado:

```bash
jarsigner -verify -verbose -certs app-release.aab
```

---

## Testar o Build

### Instalar no Dispositivo via ADB

```bash
adb install app-release.apk
```

### Ou transferir manualmente
1. Copie o APK para o dispositivo
2. Abra o arquivo no dispositivo
3. Permita instalação de fontes desconhecidas (se necessário)
4. Instale o app

---

## Tamanho do Arquivo

- **AAB**: Geralmente 20-50MB (otimizado pela Play Store)
- **APK**: Geralmente 30-60MB

A Play Store usa o AAB para gerar APKs otimizados para cada dispositivo.

---

## Troubleshooting

### Erro: "Keystore não encontrado"
- Verifique se o arquivo `keystore.properties` existe
- Verifique se o caminho do keystore está correto

### Erro: "Senha incorreta"
- Verifique as senhas no `keystore.properties`
- Certifique-se de que não há espaços extras

### Erro: "Build failed"
- Limpe o projeto: `./gradlew clean`
- Tente novamente: `./gradlew bundleRelease`

### Build muito grande
- Habilite minify no `build.gradle`:
  ```gradle
  minifyEnabled true
  shrinkResources true
  ```

---

## Próximos Passos

Após gerar o AAB:
1. ✅ Teste em dispositivos reais
2. ✅ Verifique todas as funcionalidades
3. ✅ Faça upload no Google Play Console
4. ✅ Preencha todas as informações
5. ✅ Envie para revisão

---

**Última atualização**: $(Get-Date -Format "dd/MM/yyyy")

