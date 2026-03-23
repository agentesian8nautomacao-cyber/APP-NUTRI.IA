/**
 * Script para gerar ícones do Android a partir do logo
 * 
 * Requer: sharp (npm install sharp)
 * 
 * Uso: node scripts/generate-android-icons.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Tamanhos para cada densidade
const sizes = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192
};

const sourceImage = path.join(__dirname, '../public/logo-Nutri.ai.jpeg');
const resDir = path.join(__dirname, '../android/app/src/main/res');

async function generateIcons() {
  try {
    // Verificar se sharp está instalado
    let sharp;
    try {
      const sharpModule = await import('sharp');
      // sharp pode ser exportado como default ou named export
      sharp = sharpModule.default || sharpModule.sharp || sharpModule;
      if (!sharp) {
        throw new Error('sharp não encontrado no módulo');
      }
    } catch (e) {
      console.error('❌ Erro: sharp não está instalado.');
      console.log('📦 Instale com: npm install sharp --save-dev');
      console.error('Erro detalhado:', e.message);
      console.error('Stack:', e.stack);
      process.exit(1);
    }

    // Verificar se a imagem fonte existe
    if (!fs.existsSync(sourceImage)) {
      console.error(`❌ Imagem não encontrada: ${sourceImage}`);
      process.exit(1);
    }

    console.log('🎨 Gerando ícones do Android...\n');

    // Gerar ícones para cada densidade
    for (const [folder, size] of Object.entries(sizes)) {
      const folderPath = path.join(resDir, folder);
      
      // Criar pasta se não existir
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }

      // Gerar ic_launcher.png
      const outputPath = path.join(folderPath, 'ic_launcher.png');
      await sharp(sourceImage)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 245, g: 241, b: 232, alpha: 1 } // #F5F1E8
        })
        .png()
        .toFile(outputPath);

      // Gerar ic_launcher_round.png (mesmo tamanho, formato redondo será aplicado pelo sistema)
      const roundOutputPath = path.join(folderPath, 'ic_launcher_round.png');
      await sharp(sourceImage)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 245, g: 241, b: 232, alpha: 1 }
        })
        .png()
        .toFile(roundOutputPath);

      // Gerar ícones adaptativos (foreground - apenas o logo)
      const adaptiveForePath = path.join(folderPath, 'ic_launcher_adaptive_fore.png');
      await sharp(sourceImage)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparente
        })
        .png()
        .toFile(adaptiveForePath);

      // Gerar ic_launcher_foreground.png (usado pelos ícones adaptativos)
      const foregroundPath = path.join(folderPath, 'ic_launcher_foreground.png');
      await sharp(sourceImage)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparente
        })
        .png()
        .toFile(foregroundPath);

      // Gerar ícones adaptativos (background - fundo sólido)
      const adaptiveBackPath = path.join(folderPath, 'ic_launcher_adaptive_back.png');
      await sharp({
        create: {
          width: size,
          height: size,
          channels: 4,
          background: { r: 26, g: 77, b: 46, alpha: 1 } // #1A4D2E
        }
      })
        .png()
        .toFile(adaptiveBackPath);

      console.log(`✅ ${folder}: ${size}x${size}px`);
    }

    console.log('\n✨ Ícones gerados com sucesso!');
    console.log('📱 Agora faça o build do app Android para testar.');
    
  } catch (error) {
    console.error('❌ Erro ao gerar ícones:', error);
    process.exit(1);
  }
}

generateIcons();
