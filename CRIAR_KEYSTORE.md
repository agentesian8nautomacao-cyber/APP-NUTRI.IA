# 🔐 Como Criar o Keystore para Assinatura

## ⚠️ IMPORTANTE
- **NUNCA** compartilhe o keystore ou as senhas
- **SEMPRE** faça backup do arquivo `.keystore`
- **GUARDE** as senhas em local seguro
- Se perder o keystore, **NÃO** poderá atualizar o app na Play Store

---

## 📝 Passo a Passo

### 1. Abrir Terminal/PowerShell

Navegue até a pasta `android`:
```bash
cd android
```

### 2. Gerar o Keystore

Execute o comando abaixo (substitua as informações conforme necessário):

```bash
keytool -genkey -v -keystore nutri-ai-release.keystore -alias nutri-ai -keyalg RSA -keysize 2048 -validity 10000
```

**Você será solicitado a informar:**
- **Senha do keystore**: Escolha uma senha forte e guarde-a!
- **Confirmar senha**: Digite a mesma senha
- **Nome e sobrenome**: Seu nome completo
- **Unidade organizacional**: Nome da empresa (ou seu nome)
- **Organização**: Nome da empresa (ou seu nome)
- **Cidade**: Sua cidade
- **Estado**: Seu estado
- **Código do país**: BR (para Brasil)

**Exemplo:**
```
Nome e sobrenome: João Silva
Unidade organizacional: Nutri.ai
Organização: Nutri.ai
Cidade: São Paulo
Estado: SP
Código do país: BR
```

### 3. Criar arquivo keystore.properties

Após criar o keystore, crie o arquivo `android/keystore.properties`:

```properties
storeFile=nutri-ai-release.keystore
storePassword=SUA_SENHA_DO_KEYSTORE
keyAlias=nutri-ai
keyPassword=SUA_SENHA_DO_KEYSTORE
```

**⚠️ IMPORTANTE:**
- Substitua `SUA_SENHA_DO_KEYSTORE` pela senha que você criou
- Normalmente `storePassword` e `keyPassword` são iguais
- **NUNCA** commite este arquivo no git!

### 4. Adicionar ao .gitignore

Certifique-se de que o `.gitignore` contém:
```
android/keystore.properties
android/*.keystore
android/*.jks
```

### 5. Fazer Backup

**CRÍTICO**: Faça backup do arquivo `nutri-ai-release.keystore` em:
- Google Drive
- Dropbox
- Pendrive
- Local seguro

**Se perder este arquivo, você não poderá atualizar o app na Play Store!**

---

## ✅ Verificação

Após criar o keystore, você pode verificar com:

```bash
keytool -list -v -keystore nutri-ai-release.keystore
```

---

## 🚀 Próximos Passos

Após criar o keystore:
1. O arquivo `build.gradle` já está configurado para usar o keystore
2. Quando você gerar o build release, ele será assinado automaticamente
3. Você pode testar gerando um build:

```bash
cd android
./gradlew bundleRelease
```

O arquivo assinado estará em:
`android/app/build/outputs/bundle/release/app-release.aab`

---

## ❓ Problemas Comuns

### "keytool não é reconhecido"
- No Windows, você precisa ter o JDK instalado
- Adicione o JDK ao PATH ou use o caminho completo:
  `"C:\Program Files\Java\jdk-XX\bin\keytool.exe"`

### "Senha incorreta"
- Certifique-se de usar a mesma senha que criou
- A senha é case-sensitive

### "Keystore não encontrado"
- Certifique-se de que o arquivo está na pasta `android/`
- Verifique o caminho no `keystore.properties`

---

**Última atualização**: $(Get-Date -Format "dd/MM/yyyy")

