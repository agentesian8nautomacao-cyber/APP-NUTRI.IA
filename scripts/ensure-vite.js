// Script para garantir que o vite está instalado
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');
const vitePath = join(projectRoot, 'node_modules', 'vite');

if (!existsSync(vitePath)) {
  console.log('Vite não encontrado. Instalando...');
  try {
    // Tentar múltiplas abordagens
    console.log('Tentativa 1: npm install com --force...');
    execSync('npm install vite@6.2.0 --save-dev --legacy-peer-deps --force', {
      cwd: projectRoot,
      stdio: 'inherit'
    });
    
    if (!existsSync(vitePath)) {
      console.log('Tentativa 2: Removendo node_modules/vite se existir e reinstalando...');
      execSync('npm uninstall vite', { cwd: projectRoot, stdio: 'pipe' });
      execSync('npm install vite@6.2.0 --save-dev --legacy-peer-deps --no-save', {
        cwd: projectRoot,
        stdio: 'inherit'
      });
    }
    
    if (!existsSync(vitePath)) {
      console.error('ERRO: Vite ainda não foi instalado após múltiplas tentativas.');
      console.error('Por favor, execute manualmente: npm install vite@6.2.0 --save-dev');
      process.exit(1);
    }
    
    console.log('Vite instalado com sucesso!');
  } catch (error) {
    console.error('Erro ao instalar vite:', error.message);
    if (!existsSync(vitePath)) {
      console.error('Vite não está instalado. O servidor não funcionará.');
      process.exit(1);
    }
  }
} else {
  console.log('Vite já está instalado.');
}

