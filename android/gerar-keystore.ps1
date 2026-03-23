# Script PowerShell para gerar keystore do Nutri.ai
# Execute este script na pasta android/

Write-Host "`n=== 🔐 Gerador de Keystore - Nutri.ai ===" -ForegroundColor Cyan
Write-Host ""

# Verificar se keytool está disponível
try {
    $keytoolTest = Get-Command keytool -ErrorAction Stop
    Write-Host "✅ Java keytool encontrado" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro: Java keytool não encontrado!" -ForegroundColor Red
    Write-Host "   Por favor, instale o Java JDK e adicione ao PATH" -ForegroundColor Yellow
    Write-Host "   Ou use o caminho completo do keytool.exe" -ForegroundColor Yellow
    exit 1
}

# Verificar se já existe keystore
if (Test-Path "nutri-ai-release.keystore") {
    Write-Host "⚠️  ATENÇÃO: Já existe um keystore!" -ForegroundColor Yellow
    $response = Read-Host "Deseja sobrescrever? (S/N)"
    if ($response -ne "S" -and $response -ne "s") {
        Write-Host "Operação cancelada." -ForegroundColor Yellow
        exit 0
    }
}

Write-Host ""
Write-Host "📋 Você será solicitado a preencher as seguintes informações:" -ForegroundColor White
Write-Host "   - Senha do keystore (anote em local seguro!)" -ForegroundColor Gray
Write-Host "   - Nome completo/Organização" -ForegroundColor Gray
Write-Host "   - Cidade, Estado, País" -ForegroundColor Gray
Write-Host "   - Senha da chave (pode ser a mesma do keystore)" -ForegroundColor Gray
Write-Host ""
Write-Host "⚠️  IMPORTANTE: Anote as senhas em local seguro!" -ForegroundColor Red
Write-Host ""

$confirmar = Read-Host "Pressione ENTER para continuar ou Ctrl+C para cancelar"

# Gerar keystore
Write-Host "`n🔄 Gerando keystore..." -ForegroundColor Cyan
Write-Host ""

keytool -genkey -v -keystore nutri-ai-release.keystore -alias nutri-ai -keyalg RSA -keysize 2048 -validity 10000

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Keystore gerado com sucesso!" -ForegroundColor Green
    Write-Host ""
    
    # Perguntar se deseja criar keystore.properties
    $criarProps = Read-Host "Deseja criar o arquivo keystore.properties agora? (S/N)"
    
    if ($criarProps -eq "S" -or $criarProps -eq "s") {
        Write-Host ""
        $storePassword = Read-Host "Digite a senha do keystore" -AsSecureString
        $storePasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($storePassword))
        
        $keyPassword = Read-Host "Digite a senha da chave (ou Enter para usar a mesma)"
        if ([string]::IsNullOrWhiteSpace($keyPassword)) {
            $keyPasswordPlain = $storePasswordPlain
        } else {
            $keyPasswordPlain = $keyPassword
        }
        
        $propsContent = @"
storeFile=nutri-ai-release.keystore
storePassword=$storePasswordPlain
keyAlias=nutri-ai
keyPassword=$keyPasswordPlain
"@
        
        $propsContent | Out-File -FilePath "keystore.properties" -Encoding UTF8 -NoNewline
        Write-Host ""
        Write-Host "✅ Arquivo keystore.properties criado!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "📝 Lembre-se de criar o arquivo keystore.properties manualmente!" -ForegroundColor Yellow
        Write-Host "   Veja o arquivo COMO_CRIAR_KEYSTORE.md para mais detalhes" -ForegroundColor Gray
    }
    
    Write-Host ""
    Write-Host "🔒 IMPORTANTE:" -ForegroundColor Red
    Write-Host "   - Faça backup do arquivo nutri-ai-release.keystore" -ForegroundColor Yellow
    Write-Host "   - Guarde as senhas em local seguro" -ForegroundColor Yellow
    Write-Host "   - NUNCA compartilhe ou commite o keystore no Git" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "✅ Tudo pronto! Você pode agora gerar o build release:" -ForegroundColor Green
    Write-Host "   ./gradlew bundleRelease" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Erro ao gerar keystore. Verifique os erros acima." -ForegroundColor Red
    exit 1
}

