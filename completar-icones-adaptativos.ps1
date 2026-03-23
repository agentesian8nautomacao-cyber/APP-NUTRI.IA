# Script para completar os icones adaptativos que faltam
$resPath = "android\app\src\main\res"

# Procurar arquivo do icone
$iconFile = Get-ChildItem -Path $resPath -Filter "*Nutri*.png" | Select-Object -First 1

if (-not $iconFile) {
    Write-Host "Arquivo do icone nao encontrado." -ForegroundColor Red
    exit 1
}

$sourceIcon = $iconFile.FullName
Write-Host "Usando arquivo fonte: $($iconFile.Name)" -ForegroundColor Green

Add-Type -AssemblyName System.Drawing

$sourceImage = [System.Drawing.Image]::FromFile((Resolve-Path $sourceIcon).Path)

$iconSizes = @{
    "mipmap-mdpi" = 48
    "mipmap-hdpi" = 72
    "mipmap-xhdpi" = 96
    "mipmap-xxhdpi" = 144
    "mipmap-xxxhdpi" = 192
}

foreach ($folder in $iconSizes.Keys) {
    $size = $iconSizes[$folder]
    $folderPath = Join-Path $resPath $folder
    
    if (-not (Test-Path $folderPath)) {
        continue
    }
    
    # Criar nova imagem
    $newImage = New-Object System.Drawing.Bitmap($size, $size)
    $graphics = [System.Drawing.Graphics]::FromImage($newImage)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    
    $graphics.DrawImage($sourceImage, 0, 0, $size, $size)
    
    # Gerar ic_launcher_foreground.png (se nao existir)
    $foregroundPath = Join-Path $folderPath "ic_launcher_foreground.png"
    if (-not (Test-Path $foregroundPath)) {
        $newImage.Save($foregroundPath, [System.Drawing.Imaging.ImageFormat]::Png)
        Write-Host "Gerado: $folder/ic_launcher_foreground.png" -ForegroundColor Green
    }
    
    # Gerar ic_launcher_adaptive_fore.png (se nao existir)
    $adaptiveForePath = Join-Path $folderPath "ic_launcher_adaptive_fore.png"
    if (-not (Test-Path $adaptiveForePath)) {
        $newImage.Save($adaptiveForePath, [System.Drawing.Imaging.ImageFormat]::Png)
        Write-Host "Gerado: $folder/ic_launcher_adaptive_fore.png" -ForegroundColor Green
    }
    
    # Gerar ic_launcher_round.png (se nao existir)
    $roundPath = Join-Path $folderPath "ic_launcher_round.png"
    if (-not (Test-Path $roundPath)) {
        $newImage.Save($roundPath, [System.Drawing.Imaging.ImageFormat]::Png)
        Write-Host "Gerado: $folder/ic_launcher_round.png" -ForegroundColor Green
    }
    
    $graphics.Dispose()
    $newImage.Dispose()
}

$sourceImage.Dispose()
Write-Host "`nProcesso concluido!" -ForegroundColor Green

