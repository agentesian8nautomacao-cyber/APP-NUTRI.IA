# Script para gerar ícones Android em todos os tamanhos
# A partir do arquivo Nutri.ai-512x512.png

$resPath = "android\app\src\main\res"

# Buscar arquivo do icone: Nutri.ai-512x512.png (prioridade)
$iconFile = $null
$allFiles = Get-ChildItem -Path $resPath -Filter "*.png"

Add-Type -AssemblyName System.Drawing

# Prioridade 1: Buscar especificamente "Nutri.ai-512x512.png"
foreach ($file in $allFiles) {
    if ($file.Name -eq "Nutri.ai-512x512.png") {
        try {
            $fullPath = (Resolve-Path $file.FullName).Path
            $testImg = [System.Drawing.Image]::FromFile($fullPath)
            if ($testImg.Width -eq 512 -and $testImg.Height -eq 512) {
                $iconFile = $file
                $width = $testImg.Width
                $height = $testImg.Height
                $testImg.Dispose()
                $dims = "$width x $height px"
                Write-Host "Arquivo principal encontrado: $($file.Name) ($dims)" -ForegroundColor Green
                break
            }
            $testImg.Dispose()
        } catch {
            # Continuar procurando
        }
    }
}

# Se não encontrou, buscar qualquer arquivo 512x512px (exceto backups)
if (-not $iconFile) {
    foreach ($file in $allFiles) {
        if ($file.Name -notlike "*-backup-*" -and $file.Name -notlike "*-temp*" -and $file.Name -notlike "*1024x1024*" -and $file.Name -notlike "*feature*") {
            try {
                $fullPath = (Resolve-Path $file.FullName).Path
                $testImg = [System.Drawing.Image]::FromFile($fullPath)
                if ($testImg.Width -eq 512 -and $testImg.Height -eq 512) {
                    $iconFile = $file
                    $width = $testImg.Width
                    $height = $testImg.Height
                    $testImg.Dispose()
                    $dims = "$width x $height px"
                    Write-Host "Arquivo encontrado: $($file.Name) ($dims)" -ForegroundColor Green
                    break
                }
                $testImg.Dispose()
            } catch {
                # Continuar procurando
            }
        }
    }
}

if (-not $iconFile) {
    Write-Host "Arquivo do icone nao encontrado na pasta res." -ForegroundColor Red
    Write-Host "Por favor, verifique se o arquivo Nutri.ai-512x512.png existe." -ForegroundColor Yellow
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

Write-Host "`nGerando icones usando System.Drawing..." -ForegroundColor Cyan

# Carregar imagem fonte
try {
    $sourceImage = [System.Drawing.Image]::FromFile((Resolve-Path $sourceIcon).Path)
    Write-Host "Imagem fonte carregada: $($sourceImage.Width)x$($sourceImage.Height)px" -ForegroundColor Green
} catch {
    Write-Host "Erro ao carregar imagem: $_" -ForegroundColor Red
    exit 1
}

foreach ($folder in $iconSizes.Keys) {
    $size = $iconSizes[$folder]
    $folderPath = Join-Path $resPath $folder
    
    if (-not (Test-Path $folderPath)) {
        Write-Host "Pasta nao encontrada: $folderPath" -ForegroundColor Yellow
        continue
    }
    
    # Criar nova imagem redimensionada
    $newImage = New-Object System.Drawing.Bitmap($size, $size)
    $graphics = [System.Drawing.Graphics]::FromImage($newImage)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    
    # Area segura para icones Android (66% central, deixando ~17% de margem)
    # Aplicar scale de 0.85 para garantir que nada seja cortado
    $safeAreaRatio = 0.85
    $scaledSize = [int]($size * $safeAreaRatio)
    $offset = [int](($size - $scaledSize) / 2)
    
    # Desenhar fundo branco/transparente
    $graphics.Clear([System.Drawing.Color]::Transparent)
    
    # Desenhar imagem centralizada e escalonada para caber na area segura
    $graphics.DrawImage($sourceImage, $offset, $offset, $scaledSize, $scaledSize)
    
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
    
    $sizeStr = "$size x $size"
    Write-Host "Gerado: $folder/ic_launcher.png ($sizeStr) + adaptativos" -ForegroundColor Green
}

$sourceImage.Dispose()
Write-Host "`nTodos os icones foram gerados com sucesso!" -ForegroundColor Green

Write-Host "`nProximos passos:" -ForegroundColor Cyan
Write-Host "1. Verificar se os icones foram gerados nas pastas mipmap-*" -ForegroundColor White
Write-Host "2. Limpar build: cd android; .\gradlew.bat clean" -ForegroundColor White
Write-Host "3. Gerar novo build: .\gradlew.bat assembleRelease" -ForegroundColor White
Write-Host "4. Instalar e verificar o icone no dispositivo" -ForegroundColor White
