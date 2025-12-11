# 🚀 Guia de Desenvolvimento Android - Nutri.IA

## ✅ Status Atual
- ✅ Capacitor instalado e configurado
- ✅ Projeto Android criado
- ✅ Build do web app concluído
- ✅ Sincronização com Android concluída

## 📋 Próximos Passos

### 1. **Configurar Variáveis de Ambiente**

Crie um arquivo `.env.local` na raiz do projeto com suas credenciais:

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
GEMINI_API_KEY=sua_chave_do_gemini
```

**⚠️ IMPORTANTE:** 
- O arquivo `.env.local` já deve estar no `.gitignore` (não commitar credenciais!)
- Essas variáveis são injetadas no build pelo Vite
- Após criar/atualizar o `.env.local`, execute `npm run build` novamente

### 2. **No Android Studio**

#### Primeira vez:
1. Aguarde o Gradle sincronizar (pode demorar alguns minutos)
2. Se aparecer avisos sobre SDK faltando, clique em "Install missing SDK components"
3. Configure um emulador ou conecte um dispositivo físico

#### Configurar Emulador:
1. Tools → Device Manager
2. Create Device → Escolha um dispositivo (ex: Pixel 5)
3. Download uma imagem do sistema (recomendado: API 33 ou superior)
4. Finish

#### Conectar Dispositivo Físico:
1. Ative "Modo Desenvolvedor" no seu Android
2. Ative "Depuração USB"
3. Conecte via USB
4. Autorize o computador quando solicitado

### 3. **Executar o App**

#### Opção A: Pelo Android Studio
1. Selecione o dispositivo/emulador no topo
2. Clique no botão ▶️ "Run" (ou Shift+F10)
3. Aguarde o build e instalação

#### Opção B: Pelo Terminal
```bash
# Build e instalação direta
npx cap run android
```

### 4. **Workflow de Desenvolvimento**

#### Quando fizer mudanças no código web:
```bash
# 1. Rebuild do web app
npm run build

# 2. Sincronizar com Android
npx cap sync

# 3. Abrir Android Studio (se não estiver aberto)
npx cap open android

# 4. Executar no dispositivo/emulador
```

#### Para desenvolvimento rápido (hot reload):
```bash
# Terminal 1: Servidor de desenvolvimento web
npm run dev

# Terminal 2: Sincronizar mudanças
npx cap sync

# No Android Studio: Executar app
# As mudanças serão refletidas após recarregar o app
```

### 5. **Configurações Importantes**

#### Atualizar Package ID (Opcional)
Se quiser mudar o Package ID de `com.example.app`:

1. Edite `capacitor.config.json`:
```json
{
  "appId": "com.seudominio.nutriai",
  "appName": "Nutri.IA",
  "webDir": "dist"
}
```

2. Edite `android/app/build.gradle`:
```gradle
applicationId "com.seudominio.nutriai"
```

3. Re-sincronize:
```bash
npx cap sync
```

#### Permissões Android
O app pode precisar de permissões (câmera, microfone, etc.). Elas são configuradas em:
- `android/app/src/main/AndroidManifest.xml`

### 6. **Build para Produção**

#### Gerar APK de Debug:
```bash
# No Android Studio: Build → Build Bundle(s) / APK(s) → Build APK(s)
```

#### Gerar AAB (Android App Bundle) para Play Store:
```bash
# No Android Studio: Build → Generate Signed Bundle / APK
# Siga o assistente para criar uma chave de assinatura
```

### 7. **Troubleshooting**

#### Erro: "Missing Supabase environment variables"
- Verifique se o arquivo `.env.local` existe
- Execute `npm run build` novamente após criar/atualizar `.env.local`

#### Erro: "Gradle sync failed"
- Verifique sua conexão com internet
- Tente: File → Invalidate Caches → Invalidate and Restart

#### App não carrega / tela branca
- Verifique o console do Chrome DevTools (chrome://inspect)
- Verifique se as variáveis de ambiente estão corretas
- Execute `npm run build` e `npx cap sync` novamente

#### Erro de permissões
- Verifique `AndroidManifest.xml` para permissões necessárias
- No dispositivo: Configurações → Apps → Nutri.IA → Permissões

### 8. **Plugins Capacitor Úteis**

Para adicionar funcionalidades nativas:

```bash
# Câmera
npm install @capacitor/camera
npx cap sync

# Geolocalização
npm install @capacitor/geolocation
npx cap sync

# Notificações Push
npm install @capacitor/push-notifications
npx cap sync

# Storage local
npm install @capacitor/preferences
npx cap sync
```

### 9. **Debugging**

#### Chrome DevTools (Recomendado):
1. Conecte dispositivo/emulador
2. Abra Chrome → `chrome://inspect`
3. Clique em "inspect" no seu app
4. Console, Network, etc. disponíveis

#### Logcat no Android Studio:
- View → Tool Windows → Logcat
- Filtre por "chromium" ou "WebView" para ver logs do web app

### 10. **Próximas Melhorias**

- [ ] Configurar ícone do app personalizado
- [ ] Configurar splash screen personalizado
- [ ] Adicionar plugins nativos necessários
- [ ] Configurar notificações push
- [ ] Testar em diferentes dispositivos
- [ ] Otimizar performance
- [ ] Preparar para publicação na Play Store

## 📚 Recursos Úteis

- [Documentação Capacitor](https://capacitorjs.com/docs)
- [Documentação Android](https://developer.android.com/)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

## 🎯 Checklist Final

Antes de publicar:
- [ ] Testar em dispositivos reais
- [ ] Verificar todas as funcionalidades
- [ ] Configurar ícone e splash screen
- [ ] Revisar permissões necessárias
- [ ] Testar em diferentes versões do Android
- [ ] Gerar AAB assinado
- [ ] Preparar descrição e screenshots para Play Store

---

**Dúvidas?** Consulte a documentação do Capacitor ou abra uma issue no repositório.


