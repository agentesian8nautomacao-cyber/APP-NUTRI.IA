# 🔐 Dica: Senha do Keystore

## ⚠️ Requisitos da Senha

A senha do keystore **DEVE ter pelo menos 6 caracteres**.

### Recomendações:
- **Mínimo**: 6 caracteres
- **Recomendado**: 12+ caracteres
- **Pode conter**: Letras, números e símbolos
- **Case-sensitive**: Maiúsculas e minúsculas importam

### Exemplos de senhas válidas:
- ✅ `NutriAI2024!` (12 caracteres)
- ✅ `nutriai123456` (12 caracteres)
- ✅ `NUTRI_AI_2024` (12 caracteres)
- ❌ `12345` (muito curta - 5 caracteres)
- ❌ `nutri` (muito curta - 5 caracteres)

---

## 🔄 Como Tentar Novamente

1. **Execute o comando novamente**:
   ```powershell
   keytool -genkey -v -keystore nutri-ai-release.keystore -alias nutri-ai -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Digite uma senha com pelo menos 6 caracteres**

3. **Confirme a senha** (digite a mesma senha novamente)

4. **Preencha as outras informações**:
   - Nome e sobrenome
   - Unidade organizacional
   - Organização
   - Cidade
   - Estado
   - Código do país (BR)

---

## 💡 Dica de Segurança

**Use uma senha forte mas que você consiga lembrar**, pois você precisará dela:
- Para gerar builds de produção
- Para atualizar o app na Play Store
- **Se perder a senha, não poderá atualizar o app!**

**Sugestão**: Use uma senha que combine:
- Nome do app: `NutriAI`
- Ano: `2024`
- Símbolo: `!`
- Resultado: `NutriAI2024!` (12 caracteres, forte e memorável)

---

## 📝 Após Criar o Keystore

Não esqueça de:
1. ✅ Criar o arquivo `android/keystore.properties`
2. ✅ Fazer backup do arquivo `.keystore`
3. ✅ Guardar a senha em local seguro

---

**Tente novamente com uma senha de pelo menos 6 caracteres!** 🔐

