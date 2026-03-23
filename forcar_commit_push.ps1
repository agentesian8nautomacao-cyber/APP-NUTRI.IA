# Script para forçar commit e push
$ErrorActionPreference = "Stop"

Set-Location "E:\Nutri.IA"

Write-Host "=== Status atual ===" -ForegroundColor Yellow
git status

Write-Host "`n=== Adicionando arquivos ===" -ForegroundColor Yellow
git add services/supabaseService.ts
git add App.tsx
git add RESUMO_ALTERACOES_ENQUETE.md
git add CORRIGIR_CONFIGURACAO_URL_SUPABASE.md

Write-Host "`n=== Status após adicionar ===" -ForegroundColor Yellow
git status --short

Write-Host "`n=== Fazendo commit ===" -ForegroundColor Yellow
$commitMessage = "Fix: Considerar perfil completo como enquete respondida - usuarios com dados completos nao veem mais enquete"
git commit -m $commitMessage

Write-Host "`n=== Último commit ===" -ForegroundColor Yellow
git log --oneline -1

Write-Host "`n=== Enviando para GitHub ===" -ForegroundColor Yellow
git push origin master

Write-Host "`n=== Status final ===" -ForegroundColor Yellow
git status

Write-Host "`n=== Concluído! ===" -ForegroundColor Green

