# Script para simplificar o icone - foco no centro (boneco)
$resPath = "android\app\src\main\res"

# Procurar arquivo do icone (excluir backups)
$iconFile = Get-ChildItem -Path $resPath -Filter "*Nutri*.png" | Where-Object { $_.Name -notlike "*-backup-*" -and $_.Name -notlike "*-temp*" } | Select-Object -First 1

if (-not $iconFile) {
    Write-Host "Arquivo do icone nao encontrado." -ForegroundColor Red
    exit 1
}

$sourceIcon = $iconFile.FullName
$backupIcon = $sourceIcon -replace "\.png$", "-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss').png"

Write-Host "Arquivo fonte: $($iconFile.Name)" -ForegroundColor Green
Write-Host "Criando backup: $backupIcon" -ForegroundColor Yellow

Add-Type -AssemblyName System.Drawing

try {
    # Carregar imagem original
    $originalImage = [System.Drawing.Image]::FromFile((Resolve-Path $sourceIcon).Path)
    Write-Host "Imagem original: $($originalImage.Width)x$($originalImage.Height)px" -ForegroundColor Cyan
    
    # Criar backup
    $originalImage.Save($backupIcon, [System.Drawing.Imaging.ImageFormat]::Png)
    Write-Host "Backup criado com sucesso!" -ForegroundColor Green
    
    # Criar nova imagem (mesmo tamanho)
    $newImage = New-Object System.Drawing.Bitmap($originalImage.Width, $originalImage.Height)
    $graphics = [System.Drawing.Graphics]::FromImage($newImage)
    
    # Configurar qualidade
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    
    # Preencher com cor de fundo (verde #1A4D2E)
    $bgColor = [System.Drawing.Color]::FromArgb(26, 77, 46) # #1A4D2E
    $graphics.Clear($bgColor)
    
    # Calcular area central (crop circular ou retangular centralizado)
    # Vamos fazer um crop circular centralizado - removendo 15% das bordas
    $cropRatio = 0.70  # 70% do tamanho original (remove 15% de cada lado)
    $minSize = [math]::Min($originalImage.Width, $originalImage.Height)
    $cropSize = [int]($minSize * $cropRatio)
    $cropX = [int](($originalImage.Width - $cropSize) / 2)
    $cropY = [int](($originalImage.Height - $cropSize) / 2)
    
    # Criar retangulo de recorte do centro
    $destX = [int](($newImage.Width - $cropSize) / 2)
    $destY = [int](($newImage.Height - $cropSize) / 2)
    $sourceRect = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropSize, $cropSize)
    $destRect = New-Object System.Drawing.Rectangle($destX, $destY, $cropSize, $cropSize)
    
    # Desenhar apenas a parte central da imagem original
    $graphics.DrawImage($originalImage, $destRect, $sourceRect, [System.Drawing.GraphicsUnit]::Pixel)
    
    # Fechar imagem original primeiro
    $originalImage.Dispose()
    
    # Salvar nova imagem em arquivo temporario primeiro
    $tempIcon = $sourceIcon -replace "\.png$", "-temp.png"
    $newImage.Save($tempIcon, [System.Drawing.Imaging.ImageFormat]::Png)
    
    $graphics.Dispose()
    $newImage.Dispose()
    
    # Mover arquivo temporario para o original
    if (Test-Path $tempIcon) {
        Remove-Item $sourceIcon -Force
        Move-Item $tempIcon $sourceIcon -Force
    }
    
    Write-Host "`nIcone simplificado! Foco na area central (70% da imagem original)" -ForegroundColor Green
    Write-Host "Backup salvo em: $backupIcon" -ForegroundColor Gray
    Write-Host "`nNOTA: Este script faz um crop centralizado." -ForegroundColor Yellow
    Write-Host "Se os elementos extras ainda aparecerem, voce precisara editar manualmente usando:" -ForegroundColor Yellow
    Write-Host "- Photopea: https://www.photopea.com/" -ForegroundColor White
    Write-Host "- Ou outra ferramenta de edicao de imagens" -ForegroundColor White
    
} catch {
    Write-Host "Erro ao processar imagem: $_" -ForegroundColor Red
    exit 1
}

