# 🔧 Solução: Erro Java 21 no Build

## ❌ Problema

O build está falhando com:
```
error: invalid source release: 21
```

**Causa**: O Capacitor Android requer Java 21, mas seu sistema tem Java 17.

---

## ✅ SOLUÇÃO 1: Instalar Java 21 (Recomendado)

### Windows

1. **Baixar Java 21**:
   - Acesse: https://adoptium.net/temurin/releases/
   - Escolha: Windows x64, JDK 21, .msi
   - Baixe e instale

2. **Configurar JAVA_HOME**:
   ```powershell
   # Verificar instalação
   java -version
   
   # Se não aparecer Java 21, configure JAVA_HOME
   # Encontre o caminho (geralmente: C:\Program Files\Eclipse Adoptium\jdk-21.x.x)
   [System.Environment]::SetEnvironmentVariable('JAVA_HOME', 'C:\Program Files\Eclipse Adoptium\jdk-21.x.x', 'User')
   ```

3. **Reiniciar o terminal** e tentar novamente:
   ```powershell
   cd android
   .\gradlew.bat bundleRelease
   ```

---

## ✅ SOLUÇÃO 2: Usar APK ao invés de AAB (Temporário)

Se não puder instalar Java 21 agora, pode gerar um APK:

```powershell
cd android
.\gradlew.bat assembleRelease
```

**⚠️ Nota**: AAB é preferível para Play Store, mas APK também funciona.

**Localização do APK**: `android/app/build/outputs/apk/release/app-release.apk`

---

## ✅ SOLUÇÃO 3: Configurar Gradle para Usar Java 21 Específico

Se você tem Java 21 instalado mas não está no PATH:

1. **Encontre o caminho do Java 21**

2. **Configure no gradle.properties**:
   ```properties
   org.gradle.java.home=C:/Program Files/Eclipse Adoptium/jdk-21.x.x
   ```

3. **Tente o build novamente**

---

## 🔍 Verificar Versão do Java

```powershell
java -version
javac -version
```

---

## 📋 Após Instalar Java 21

1. Reinicie o terminal/PowerShell
2. Verifique: `java -version` (deve mostrar 21)
3. Execute: `cd android; .\gradlew.bat bundleRelease`

---

**Recomendação**: Instale Java 21 para ter a melhor compatibilidade com Capacitor.


