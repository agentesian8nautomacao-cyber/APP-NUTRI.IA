# Script para gerar build release do Nutri.ai
# Execute: .\scripts\build-release.ps1

Write-Host "🚀 Gerando build release do Nutri.ai..." -ForegroundColor Cyan
Write-Host ""

# Verificar se está na pasta raiz
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Erro: Execute este script na pasta raiz do projeto" -ForegroundColor Red
    exit 1
}

# Verificar se keystore existe
if (-not (Test-Path "android/keystore.properties")) {
    Write-Host "⚠️  AVISO: keystore.properties não encontrado!" -ForegroundColor Yellow
    Write-Host "   O build será gerado sem assinatura (não pode ser publicado)" -ForegroundColor Yellow
    Write-Host "   Crie o keystore seguindo o guia em CRIAR_KEYSTORE.md" -ForegroundColor Yellow
    Write-Host ""
    $continue = Read-Host "Deseja continuar mesmo assim? (s/N)"
    if ($continue -ne "s" -and $continue -ne "S") {
        exit 0
    }
}

# Passo 1: Build do projeto web
Write-Host "📦 Passo 1/3: Gerando build do projeto web..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao gerar build do projeto web" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Build web concluído" -ForegroundColor Green
Write-Host ""

# Passo 2: Sincronizar com Capacitor
Write-Host "🔄 Passo 2/3: Sincronizando com Capacitor..." -ForegroundColor Yellow
npx cap sync android
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao sincronizar com Capacitor" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Sincronização concluída" -ForegroundColor Green
Write-Host ""

# Passo 3: Gerar AAB
Write-Host "📱 Passo 3/3: Gerando Android App Bundle (AAB)..." -ForegroundColor Yellow
Set-Location android
.\gradlew.bat bundleRelease
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao gerar AAB" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..

Write-Host ""
Write-Host "✅ Build release gerado com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "📁 Arquivo gerado:" -ForegroundColor Cyan
Write-Host "   android/app/build/outputs/bundle/release/app-release.aab" -ForegroundColor White
Write-Host ""
Write-Host "📋 Próximos passos:" -ForegroundColor Yellow
Write-Host "   1. Teste o AAB em um dispositivo real" -ForegroundColor White
Write-Host "   2. Faça upload no Google Play Console" -ForegroundColor White
Write-Host "   3. Preencha todas as informações" -ForegroundColor White
Write-Host "   4. Envie para revisão" -ForegroundColor White
Write-Host ""


