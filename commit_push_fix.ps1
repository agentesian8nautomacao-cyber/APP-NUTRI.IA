# Script para fazer commit e push das alterações
Set-Location "E:\Nutri.IA"

Write-Host "=== Verificando status do Git ===" -ForegroundColor Cyan
git status

Write-Host "`n=== Adicionando todos os arquivos modificados ===" -ForegroundColor Cyan
git add -A

Write-Host "`n=== Status após adicionar ===" -ForegroundColor Cyan
git status --short

Write-Host "`n=== Fazendo commit ===" -ForegroundColor Cyan
git commit -m "Fix: Considerar perfil completo como enquete respondida - usuarios com name/age/height/weight nao veem mais enquete"

Write-Host "`n=== Último commit ===" -ForegroundColor Cyan
git log --oneline -1

Write-Host "`n=== Enviando para GitHub ===" -ForegroundColor Cyan
git push origin master

Write-Host "`n=== Verificando status final ===" -ForegroundColor Cyan
git status

Write-Host "`n=== Concluído! ===" -ForegroundColor Green

