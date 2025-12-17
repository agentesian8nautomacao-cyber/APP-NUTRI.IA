# Script para gerar ícones Android em todos os tamanhos
# A partir do arquivo Ícone-Nutri.ai.png

$resPath = "android\app\src\main\res"

# Procurar arquivo do icone (excluir backups e temporarios)
# Prioridade: Arquivo "Ícone-Nutri.ai.png" com 512x512px
$iconFile = $null
$allFiles = Get-ChildItem -Path $resPath -Filter "*.png"

Add-Type -AssemblyName System.Drawing

# Buscar arquivo com 512x512px que nao seja backup/temp/1024x1024
foreach ($file in $allFiles) {
    if ($file.Name -notlike "*-backup-*" -and $file.Name -notlike "*-temp*" -and $file.Name -notlike "*1024x1024*" -and $file.Name -notlike "*feature*") {
        try {
            $fullPath = (Resolve-Path $file.FullName).Path
            $testImg = [System.Drawing.Image]::FromFile($fullPath)
            if ($testImg.Width -eq 512 -and $testImg.Height -eq 512) {
                $iconFile = $file
                $testImg.Dispose()
                Write-Host "Arquivo encontrado: $($file.Name) ($($testImg.Width)x$($testImg.Height)px)" -ForegroundColor Green
                break
            }
            $testImg.Dispose()
        } catch {
            # Continuar procurando
        }
    }
}

# Se nao encontrou por dimensao, buscar pelo nome aproximado
if (-not $iconFile) {
    $iconFile = $allFiles | Where-Object { 
        $_.Name -notlike "*-backup-*" -and 
        $_.Name -notlike "*-temp*" -and
        $_.Name -notlike "*1024x1024*" -and
        ($_.Name -match "Ícone.*Nutri.*\.ai" -or ($_.Length -ge 250000 -and $_.Length -le 260000))
    } | Select-Object -First 1
}

if (-not $iconFile) {
    Write-Host "Arquivo do icone nao encontrado na pasta res." -ForegroundColor Red
    Write-Host "Por favor, verifique se o arquivo existe." -ForegroundColor Yellow
    exit 1
}

$sourceIcon = $iconFile.FullName
Write-Host "Arquivo fonte encontrado: $($iconFile.Name)" -ForegroundColor Green
Write-Host "Caminho completo: $sourceIcon" -ForegroundColor Gray

# Tamanhos necessarios para cada densidade
$iconSizes = @{
    "mipmap-mdpi" = 48
    "mipmap-hdpi" = 72
    "mipmap-xhdpi" = 96
    "mipmap-xxhdpi" = 144
    "mipmap-xxxhdpi" = 192
}

# Verificar se System.Drawing está disponível
try {
    Add-Type -AssemblyName System.Drawing
    $hasDrawing = $true
} catch {
    $hasDrawing = $false
    Write-Host "⚠️ System.Drawing não disponível. Usando método alternativo..." -ForegroundColor Yellow
}

if ($hasDrawing) {
    Write-Host "`nGerando icones usando System.Drawing..." -ForegroundColor Cyan
    
    # Carregar imagem fonte
    try {
        $sourceImage = [System.Drawing.Image]::FromFile((Resolve-Path $sourceIcon).Path)
        Write-Host "Imagem fonte carregada: $($sourceImage.Width)x$($sourceImage.Height)px" -ForegroundColor Green
    } catch {
        Write-Host "❌ Erro ao carregar imagem: $_" -ForegroundColor Red
        exit 1
    }
    
    foreach ($folder in $iconSizes.Keys) {
        $size = $iconSizes[$folder]
        $folderPath = Join-Path $resPath $folder
        
        if (-not (Test-Path $folderPath)) {
            Write-Host "⚠️ Pasta não encontrada: $folderPath" -ForegroundColor Yellow
            continue
        }
        
        # Criar nova imagem redimensionada
        $newImage = New-Object System.Drawing.Bitmap($size, $size)
        $graphics = [System.Drawing.Graphics]::FromImage($newImage)
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        
        $graphics.DrawImage($sourceImage, 0, 0, $size, $size)
        
        # Salvar ic_launcher.png
        $outputPath = Join-Path $folderPath "ic_launcher.png"
        $newImage.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
        
        # Salvar ic_launcher_round.png (mesmo icone, formato round sera aplicado pelo sistema)
        $roundPath = Join-Path $folderPath "ic_launcher_round.png"
        $newImage.Save($roundPath, [System.Drawing.Imaging.ImageFormat]::Png)
        
        # Salvar ic_launcher_foreground.png (para adaptativos)
        $foregroundPath = Join-Path $folderPath "ic_launcher_foreground.png"
        $newImage.Save($foregroundPath, [System.Drawing.Imaging.ImageFormat]::Png)
        
        # Salvar ic_launcher_adaptive_fore.png (para adaptativos)
        $adaptiveForePath = Join-Path $folderPath "ic_launcher_adaptive_fore.png"
        $newImage.Save($adaptiveForePath, [System.Drawing.Imaging.ImageFormat]::Png)
        
        $graphics.Dispose()
        $newImage.Dispose()
        
        Write-Host "Gerado: $folder/ic_launcher.png ($size x $size) + adaptativos" -ForegroundColor Green
    }
    
    $sourceImage.Dispose()
    Write-Host "`nTodos os icones foram gerados com sucesso!" -ForegroundColor Green
} else {
    Write-Host "`nSystem.Drawing nao esta disponivel." -ForegroundColor Yellow
    Write-Host "Por favor, use uma das seguintes opções:" -ForegroundColor Cyan
    Write-Host "`n1. Android Asset Studio (Recomendado):" -ForegroundColor Yellow
    Write-Host "   https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html" -ForegroundColor White
    Write-Host "   - Faça upload do arquivo: $sourceIcon" -ForegroundColor Gray
    Write-Host "   - Background: #1A4D2E" -ForegroundColor Gray
    Write-Host "   - Baixe o ZIP e copie as pastas mipmap-* para: $resPath" -ForegroundColor Gray
    Write-Host "`n2. Ou instale .NET Framework para usar este script automaticamente" -ForegroundColor Yellow
}

Write-Host "`nProximos passos:" -ForegroundColor Cyan
Write-Host "1. Verificar se os icones foram gerados nas pastas mipmap-*" -ForegroundColor White
Write-Host "2. Limpar build: cd android; .\gradlew.bat clean" -ForegroundColor White
Write-Host "3. Gerar novo build: .\gradlew.bat assembleRelease" -ForegroundColor White
Write-Host "4. Instalar e verificar o icone no dispositivo" -ForegroundColor White

