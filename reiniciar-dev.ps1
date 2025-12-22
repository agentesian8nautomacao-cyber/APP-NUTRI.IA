# Script para limpar cache do Vite e reiniciar servidor de desenvolvimento
# Use: .\reiniciar-dev.ps1

Write-Host "🔄 Limpando cache do Vite..." -ForegroundColor Yellow

# Remover cache do Vite
if (Test-Path "node_modules\.vite") {
    Remove-Item -Recurse -Force "node_modules\.vite"
    Write-Host "✅ Cache do Vite removido" -ForegroundColor Green
} else {
    Write-Host "ℹ️  Cache do Vite não encontrado (já está limpo)" -ForegroundColor Cyan
}

# Verificar se .env.local existe
if (Test-Path ".env.local") {
    Write-Host "✅ Arquivo .env.local encontrado" -ForegroundColor Green
    
    # Verificar variáveis do Supabase
    $envContent = Get-Content ".env.local" -Raw
    if ($envContent -match "VITE_SUPABASE_URL" -and $envContent -match "VITE_SUPABASE_ANON_KEY") {
        Write-Host "✅ Variáveis do Supabase encontradas no .env.local" -ForegroundColor Green
    } else {
        Write-Host "⚠️  AVISO: Variáveis do Supabase não encontradas no .env.local" -ForegroundColor Yellow
        Write-Host "   Certifique-se de que o arquivo contém:" -ForegroundColor Yellow
        Write-Host "   VITE_SUPABASE_URL=..." -ForegroundColor Yellow
        Write-Host "   VITE_SUPABASE_ANON_KEY=..." -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ ERRO: Arquivo .env.local não encontrado!" -ForegroundColor Red
    Write-Host "   Crie o arquivo .env.local na raiz do projeto com:" -ForegroundColor Red
    Write-Host "   VITE_SUPABASE_URL=..." -ForegroundColor Red
    Write-Host "   VITE_SUPABASE_ANON_KEY=..." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🚀 Iniciando servidor de desenvolvimento..." -ForegroundColor Cyan
Write-Host "   (Pressione Ctrl+C para parar)" -ForegroundColor Gray
Write-Host ""

# Iniciar servidor
npm run dev

