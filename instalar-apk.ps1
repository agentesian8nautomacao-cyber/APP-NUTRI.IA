# Script para instalar o APK no dispositivo Android
# Execute este script depois de conectar o dispositivo via USB

Write-Host "🔍 Verificando dispositivos conectados..." -ForegroundColor Cyan

$devices = adb devices | Select-Object -Skip 1 | Where-Object { $_ -match "device$" }

if ($devices.Count -eq 0) {
    Write-Host "❌ Nenhum dispositivo encontrado!" -ForegroundColor Red
    Write-Host "`nPor favor:" -ForegroundColor Yellow
    Write-Host "1. Conecte seu dispositivo Android via USB" -ForegroundColor White
    Write-Host "2. Ative 'Depuração USB' nas Opções do Desenvolvedor" -ForegroundColor White
    Write-Host "3. Autorize este computador quando solicitado no celular" -ForegroundColor White
    Write-Host "`nDepois, execute este script novamente." -ForegroundColor Green
    pause
    exit
}

Write-Host "✅ Dispositivo encontrado!" -ForegroundColor Green
Write-Host $devices -ForegroundColor Cyan

$apkPath = "android\app\build\outputs\apk\release\app-release.apk"

if (-not (Test-Path $apkPath)) {
    Write-Host "❌ APK não encontrado em: $apkPath" -ForegroundColor Red
    Write-Host "Por favor, gere o APK primeiro com: .\gradlew.bat assembleRelease" -ForegroundColor Yellow
    pause
    exit
}

Write-Host "`n📦 Instalando APK no dispositivo..." -ForegroundColor Cyan
Write-Host "Arquivo: $apkPath" -ForegroundColor Gray

$result = adb install -r $apkPath

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Instalação concluída com sucesso!" -ForegroundColor Green
    Write-Host "🎉 O app Nutri.ai foi instalado no seu dispositivo!" -ForegroundColor Green
    Write-Host "`nVocê pode abrir o app agora mesmo!" -ForegroundColor Cyan
} else {
    Write-Host "`n❌ Erro na instalação:" -ForegroundColor Red
    Write-Host $result -ForegroundColor Red
    Write-Host "`nTente:" -ForegroundColor Yellow
    Write-Host "1. Desinstalar versão anterior (se houver)" -ForegroundColor White
    Write-Host "2. Verificar se há espaço suficiente no dispositivo" -ForegroundColor White
    Write-Host "3. Tentar instalar manualmente transferindo o APK" -ForegroundColor White
}

pause

