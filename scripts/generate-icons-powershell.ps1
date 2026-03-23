# Script PowerShell para gerar ícones do Android
# Requer: imagem fonte em android/app/src/main/res/1024.png ou play_store_512.png

$sourceImage = "android/app/src/main/res/1024.png"
$resDir = "android/app/src/main/res"

# Tamanhos para cada densidade
$sizes = @{
    'mipmap-mdpi' = 48
    'mipmap-hdpi' = 72
    'mipmap-xhdpi' = 96
    'mipmap-xxhdpi' = 144
    'mipmap-xxxhdpi' = 192
}

# Verificar se a imagem fonte existe
if (-not (Test-Path $sourceImage)) {
    $sourceImage = "android/app/src/main/res/play_store_512.png"
    if (-not (Test-Path $sourceImage)) {
        Write-Host "❌ Erro: Nenhuma imagem fonte encontrada!" -ForegroundColor Red
        Write-Host "   Coloque 1024.png ou play_store_512.png em: $resDir" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host "🎨 Gerando ícones do Android..." -ForegroundColor Cyan
Write-Host "📸 Imagem fonte: $sourceImage" -ForegroundColor Green
Write-Host ""

# Verificar se ImageMagick está disponível
$magickAvailable = $false
try {
    $null = Get-Command magick -ErrorAction Stop
    $magickAvailable = $true
    Write-Host "✅ ImageMagick encontrado - usando para redimensionar" -ForegroundColor Green
} catch {
    Write-Host "⚠️  ImageMagick não encontrado" -ForegroundColor Yellow
    Write-Host "   Instale em: https://imagemagick.org/script/download.php" -ForegroundColor Yellow
    Write-Host "   Ou use o Android Asset Studio: https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html" -ForegroundColor Yellow
    Write-Host ""
}

foreach ($folder in $sizes.Keys) {
    $size = $sizes[$folder]
    $folderPath = Join-Path $resDir $folder
    
    # Criar pasta se não existir
    if (-not (Test-Path $folderPath)) {
        New-Item -ItemType Directory -Path $folderPath -Force | Out-Null
    }
    
    if ($magickAvailable) {
        # Usar ImageMagick para redimensionar
        $outputPath = Join-Path $folderPath "ic_launcher.png"
        $roundPath = Join-Path $folderPath "ic_launcher_round.png"
        $foregroundPath = Join-Path $folderPath "ic_launcher_foreground.png"
        
        # Criar ícone com fundo #F5F1E8
        magick "$sourceImage" -resize "${size}x${size}" -background "#F5F1E8" -gravity center -extent "${size}x${size}" "$outputPath"
        Copy-Item $outputPath $roundPath -Force
        
        # Criar foreground transparente
        magick "$sourceImage" -resize "${size}x${size}" -background "transparent" -gravity center -extent "${size}x${size}" "$foregroundPath"
        
        Write-Host "✅ $folder : ${size}x${size}px (ImageMagick)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  $folder : ${size}x${size}px - ImageMagick necessário" -ForegroundColor Yellow
    }
}

if (-not $magickAvailable) {
    Write-Host ""
    Write-Host "📋 INSTRUÇÕES MANUAIS:" -ForegroundColor Cyan
    Write-Host "1. Acesse: https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html" -ForegroundColor White
    Write-Host "2. Faça upload de: $sourceImage" -ForegroundColor White
    Write-Host "3. Configure Background Color: #1A4D2E" -ForegroundColor White
    Write-Host "4. Clique em 'Download' e extraia o ZIP" -ForegroundColor White
    Write-Host "5. Copie as pastas mipmap-* para: $resDir" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "✨ Ícones gerados com sucesso!" -ForegroundColor Green
    Write-Host "📱 Agora faça o build do app Android para testar." -ForegroundColor Cyan
}

