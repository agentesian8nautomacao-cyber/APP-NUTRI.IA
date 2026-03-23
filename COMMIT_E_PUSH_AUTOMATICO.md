# 📋 Commit e Push Automático

## 🎯 Objetivo

Sempre que houver **qualquer alteração, implementação ou melhoria** no código, deve-se fazer commit e push para o GitHub.

## 🚀 Como Usar

### Opção 1: Script Automático (Recomendado)

Execute o script PowerShell:

```powershell
.\enviar_github.ps1
```

O script irá:
1. ✅ Verificar status do Git
2. ✅ Adicionar todos os arquivos modificados (`git add -A`)
3. ✅ Fazer commit com mensagem automática
4. ✅ Fazer push para `origin master`
5. ✅ Verificar status final

### Opção 2: Comandos Manuais

Se preferir fazer manualmente:

```powershell
cd E:\Nutri.IA
git add -A
git commit -m "Update: Alterações e melhorias"
git push origin master
```

## ⚠️ Importante

- **SEMPRE** execute `git push origin master` após qualquer alteração
- O script `enviar_github.ps1` faz tudo automaticamente
- Se houver conflitos, resolva antes de fazer push
- Verifique sempre o status com `git status` antes de fazer push

## 📝 Mensagem de Commit

O script usa uma mensagem padrão com timestamp:
```
Update: Alteracoes e melhorias - 2025-01-01 12:00:00
```

Se quiser uma mensagem personalizada, edite o script ou use os comandos manuais.

## 🔄 Fluxo Recomendado

1. Fazer alterações no código
2. Testar localmente
3. Executar `.\enviar_github.ps1`
4. Verificar se o push foi bem-sucedido
5. Verificar no GitHub se as alterações foram enviadas

