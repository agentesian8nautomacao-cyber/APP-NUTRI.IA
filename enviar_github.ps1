# Script para sempre fazer commit e push após alterações
# Uso: Execute este script após fazer qualquer alteração, implementação ou melhoria

Set-Location "E:\Nutri.IA"

Write-Host "=== Verificando status do Git ===" -ForegroundColor Cyan
git status

Write-Host "`n=== Adicionando TODOS os arquivos modificados ===" -ForegroundColor Yellow
git add -A

Write-Host "`n=== Status após adicionar ===" -ForegroundColor Cyan
git status --short

Write-Host "`n=== Fazendo commit ===" -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$commitMessage = "Update: Alteracoes e melhorias - $timestamp"
git commit -m $commitMessage

Write-Host "`n=== Último commit ===" -ForegroundColor Cyan
git log --oneline -1

Write-Host "`n=== Enviando para GitHub (origin master) ===" -ForegroundColor Yellow
git push origin master

Write-Host "`n=== Verificando status final ===" -ForegroundColor Cyan
git status

Write-Host "`n=== ✅ Concluído! Alterações enviadas para GitHub ===" -ForegroundColor Green
