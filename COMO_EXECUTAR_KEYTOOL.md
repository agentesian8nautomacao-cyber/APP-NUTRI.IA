# 🔐 Como Executar o Comando keytool Corretamente

## ❌ ERRO COMUM

**NÃO faça isso:**
```powershell
keytool -genkey -v -keystore nutri-ai-release.keystore -alias nutri-ai -keyalg RSA -keysize 2048 -validity 10000NUnutriai2025
```

O problema: Você digitou a senha junto com o comando. O keytool não aceita senha na linha de comando por segurança.

---

## ✅ FORMA CORRETA

### Passo 1: Execute o comando (SEM senha)
```powershell
keytool -genkey -v -keystore nutri-ai-release.keystore -alias nutri-ai -keyalg RSA -keysize 2048 -validity 10000
```

### Passo 2: O keytool pedirá informações interativamente

Você verá algo assim:
```
Enter keystore password: 
```

**IMPORTANTE**: 
- A senha **NÃO aparece** na tela quando você digita (por segurança)
- Digite a senha normalmente e pressione Enter
- Use uma senha com pelo menos 6 caracteres

### Passo 3: Confirme a senha
```
Re-enter new password:
```
Digite a mesma senha novamente.

### Passo 4: Preencha as informações
```
What is your first and last name?
  [Unknown]: João Silva

What is the name of your organizational unit?
  [Unknown]: Nutri.ai

What is the name of your organization?
  [Unknown]: Nutri.ai

What is the name of your City or Locality?
  [Unknown]: São Paulo

What is the name of your State or Province?
  [Unknown]: SP

What is the two-letter country code for this unit?
  [Unknown]: BR
```

### Passo 5: Confirme
```
Is CN=João Silva, OU=Nutri.ai, O=Nutri.ai, L=São Paulo, ST=SP, C=BR correct?
  [no]: yes
```

Digite `yes` e pressione Enter.

---

## 📝 Exemplo Completo de Sessão

```powershell
PS E:\Nutri.IA\android> keytool -genkey -v -keystore nutri-ai-release.keystore -alias nutri-ai -keyalg RSA -keysize 2048 -validity 10000

Enter keystore password: ********
Re-enter new password: ********

What is your first and last name?
  [Unknown]: João Silva
What is the name of your organizational unit?
  [Unknown]: Nutri.ai
What is the name of your organization?
  [Unknown]: Nutri.ai
What is the name of your City or Locality?
  [Unknown]: São Paulo
What is the name of your State or Province?
  [Unknown]: SP
What is the two-letter country code for this unit?
  [Unknown]: BR

Is CN=João Silva, OU=Nutri.ai, O=Nutri.ai, L=São Paulo, ST=SP, C=BR correct?
  [no]: yes

Generating 2,048 bit RSA key pair and self-signed certificate (SHA256withRSA) with a validity of 10,000 days
        for: CN=João Silva, OU=Nutri.ai, O=Nutri.ai, L=São Paulo, ST=SP, C=BR
[Storing nutri-ai-release.keystore]
```

**✅ Sucesso!** O keystore foi criado.

---

## 🔑 Dicas Importantes

1. **Senha não aparece**: Quando você digita a senha, nada aparece na tela. Isso é normal e por segurança.

2. **Senha mínima**: Use pelo menos 6 caracteres.

3. **Guarde a senha**: Você precisará dela para gerar builds futuros.

4. **Backup**: Faça backup do arquivo `nutri-ai-release.keystore` após criá-lo.

---

## ⚠️ Se Der Erro

### "Too many failures"
- Aguarde alguns minutos
- Tente novamente

### "Keystore already exists"
- O arquivo já existe
- Delete o arquivo antigo ou use outro nome

### "Command not found"
- O JDK não está instalado ou não está no PATH
- Instale o JDK ou use o caminho completo do keytool

---

**Agora tente novamente executando apenas o comando, sem a senha!** 🚀

