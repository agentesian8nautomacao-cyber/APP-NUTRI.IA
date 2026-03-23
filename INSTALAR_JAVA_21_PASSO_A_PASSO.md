# 📥 Como Instalar Java 21 - Passo a Passo

## ⚠️ IMPORTANTE

O Capacitor Android **REQUER** Java 21 para gerar o build. Java 17 não funciona.

---

## 🔽 Passo a Passo - Instalação

### 1. Baixar Java 21

1. **Acesse**: https://adoptium.net/temurin/releases/
2. **Selecione**:
   - **Version**: 21 (LTS)
   - **Operating System**: Windows
   - **Architecture**: x64
   - **Package Type**: JDK
   - **Formato**: .msi (Installer)
3. **Clique em "Latest Release"** para baixar

### 2. Instalar

1. **Execute o arquivo .msi** baixado
2. **Siga o assistente de instalação**
3. **Deixe todas as opções padrão** (incluindo "Set JAVA_HOME")
4. **Conclua a instalação**

### 3. Verificar Instalação

**Abra um NOVO terminal/PowerShell** (importante: feche e abra novamente):

```powershell
java -version
```

**Deve mostrar**: `openjdk version "21.x.x"` ou similar

### 4. Se Ainda Mostrar Java 17

**Opção A: Configurar JAVA_HOME manualmente**

1. Encontre onde Java 21 foi instalado:
   - Geralmente: `C:\Program Files\Eclipse Adoptium\jdk-21.x.x`
   - Ou: `C:\Program Files\Java\jdk-21`

2. Configure JAVA_HOME:
   ```powershell
   [System.Environment]::SetEnvironmentVariable('JAVA_HOME', 'C:\Program Files\Eclipse Adoptium\jdk-21.0.1', 'User')
   ```

3. **Reinicie o terminal** e verifique:
   ```powershell
   java -version
   ```

**Opção B: Configurar no gradle.properties**

1. Encontre o caminho do Java 21
2. Edite `android/gradle.properties`:
   ```properties
   org.gradle.java.home=C:/Program Files/Eclipse Adoptium/jdk-21.0.1
   ```
   (Ajuste o caminho conforme sua instalação)

---

## ✅ Após Instalar Java 21

1. **Feche e abra um NOVO terminal**
2. **Verifique**: `java -version` (deve mostrar 21)
3. **Navegue até o projeto**: `cd E:\Nutri.IA`
4. **Gere o build**:
   ```powershell
   cd android
   .\gradlew.bat bundleRelease
   ```

---

## 🔗 Links Diretos

- **Windows x64 JDK 21**: https://adoptium.net/temurin/releases/?version=21&os=windows&arch=x64&package=jdk
- **Ver todas as versões**: https://adoptium.net/temurin/releases/

---

## ⚠️ Problemas Comuns

### "Java ainda mostra versão 17"
- Feche e abra um NOVO terminal
- Verifique JAVA_HOME: `echo $env:JAVA_HOME`
- Configure manualmente se necessário

### "Não encontro onde Java 21 foi instalado"
- Procure em: `C:\Program Files\Eclipse Adoptium\`
- Ou: `C:\Program Files\Java\`
- Ou use: `Get-ChildItem "C:\Program Files" -Recurse -Filter "java.exe" | Where-Object { (Get-Command $_.FullName).Version.Major -eq 21 }`

### "Build ainda falha"
- Certifique-se de que está usando um terminal NOVO
- Verifique: `java -version` mostra 21
- Limpe o build: `.\gradlew.bat clean`
- Tente novamente: `.\gradlew.bat bundleRelease`

---

**Após instalar Java 21, tente o build novamente!** 🚀


