# 🔐 Como Criar Keystore para Publicação na Play Store

## ⚠️ IMPORTANTE

**NUNCA perca ou compartilhe seu keystore!** 
- Se você perder o keystore, **NÃO poderá atualizar o app** na Play Store
- Guarde-o em local seguro e faça backup
- NUNCA commite o keystore no Git

---

## 📋 Pré-requisitos

1. Java JDK instalado (necessário para `keytool`)
2. Acesso ao terminal/command prompt

---

## 🚀 Passo a Passo

### 1. Navegar até a pasta android

```bash
cd android
```

### 2. Gerar o Keystore

Execute o comando abaixo e **preencha as informações solicitadas**:

**Windows (PowerShell):**
```powershell
keytool -genkey -v -keystore nutri-ai-release.keystore -alias nutri-ai -keyalg RSA -keysize 2048 -validity 10000
```

**Linux/Mac:**
```bash
keytool -genkey -v -keystore nutri-ai-release.keystore -alias nutri-ai -keyalg RSA -keysize 2048 -validity 10000
```

**O que você será perguntado:**
1. **Senha do keystore:** Escolha uma senha forte e **anote em local seguro**
2. **Confirmar senha:** Digite a mesma senha novamente
3. **Nome completo:** Seu nome ou da empresa
4. **Unidade organizacional:** Departamento (opcional, pode deixar vazio)
5. **Organização:** Nome da organização/empresa
6. **Cidade:** Sua cidade
7. **Estado:** Seu estado/província
8. **Código do país:** BR (para Brasil) ou outro código de 2 letras
9. **Confirmar informações:** Digite "yes" ou "sim"
10. **Senha da chave:** Pode usar a mesma senha do keystore ou uma diferente

**Exemplo de interação:**
```
Enter keystore password: [digite sua senha]
Re-enter new password: [confirme a senha]
What is your first and last name?
  [Unknown]:  Nutri.ai
What is the name of your organizational unit?
  [Unknown]:  
What is the name of your organization?
  [Unknown]:  Nutri.ai
What is the name of your City or Locality?
  [Unknown]:  São Paulo
What is the name of your State or Province?
  [Unknown]:  SP
What is the two-letter country code for this unit?
  [Unknown]:  BR
Is CN=Nutri.ai, OU=Unknown, O=Nutri.ai, L=São Paulo, ST=SP, C=BR correct?
  [no]:  yes

Enter key password for <nutri-ai>
        (RETURN if same as keystore password): [pressione Enter para usar a mesma senha]
```

### 3. Criar arquivo keystore.properties

Crie um arquivo `keystore.properties` na pasta `android/` com o seguinte conteúdo:

```properties
storeFile=nutri-ai-release.keystore
storePassword=SUA_SENHA_DO_KEYSTORE
keyAlias=nutri-ai
keyPassword=SUA_SENHA_DA_CHAVE
```

**Substitua:**
- `SUA_SENHA_DO_KEYSTORE` pela senha que você digitou no passo 2
- `SUA_SENHA_DA_CHAVE` pela senha da chave (ou a mesma se você usou a mesma)

**⚠️ IMPORTANTE:** O arquivo `keystore.properties` já está no `.gitignore` e **NÃO será commitado no Git**.

### 4. Verificar se está tudo certo

O arquivo `nutri-ai-release.keystore` deve estar na pasta `android/` e o `keystore.properties` também.

---

## ✅ Verificação

Após criar o keystore, você pode testar o build:

```bash
cd android
./gradlew bundleRelease
```

Se tudo estiver correto, o build será gerado em:
`android/app/build/outputs/bundle/release/app-release.aab`

---

## 🔒 Backup do Keystore

**FAÇA BACKUP IMEDIATAMENTE:**

1. Copie o arquivo `nutri-ai-release.keystore` para:
   - Um pendrive/externo
   - Um serviço de nuvem seguro (Google Drive, Dropbox com senha)
   - Um local seguro físico

2. Anote as senhas em um gerenciador de senhas (LastPass, 1Password, etc.)

3. **NUNCA** compartilhe o keystore ou as senhas

---

## 🆘 Problemas Comuns

### "keytool não é reconhecido"
- Certifique-se de que o Java JDK está instalado
- Adicione o Java ao PATH do sistema
- No Windows, pode ser necessário usar caminho completo: `"C:\Program Files\Java\jdk-XX\bin\keytool.exe"`

### "keystore.properties não encontrado"
- Certifique-se de que o arquivo está em `android/keystore.properties`
- Verifique se o nome do arquivo está correto (sem espaços extras)

### Build falha com erro de senha
- Verifique se as senhas no `keystore.properties` estão corretas
- Certifique-se de que não há espaços extras nas senhas

---

## 📝 Próximos Passos

Após criar o keystore:

1. ✅ Teste o build release
2. ✅ Teste o APK/AAB em um dispositivo real
3. ✅ Publique na Play Store Console

---

**Boa sorte com a publicação! 🚀**

