/**
 * Script para gerar ícones do Android a partir do logo usando Jimp
 * 
 * Requer: jimp (npm install jimp)
 * 
 * Uso: node scripts/generate-android-icons-jimp.cjs
 */

const fs = require('fs');
const path = require('path');

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
    // Verificar se jimp está instalado
    let Jimp;
    try {
      Jimp = require('jimp');
    } catch (e) {
      console.error('❌ Erro: jimp não está instalado.');
      console.log('📦 Instale com: npm install jimp --save-dev');
      process.exit(1);
    }

    // Verificar se a imagem fonte existe
    if (!fs.existsSync(sourceImage)) {
      console.error(`❌ Imagem não encontrada: ${sourceImage}`);
      process.exit(1);
    }

    console.log('🎨 Gerando ícones do Android com Jimp...\n');

    // Carregar imagem fonte
    const source = await Jimp.read(sourceImage);

    // Gerar ícones para cada densidade
    for (const [folder, size] of Object.entries(sizes)) {
      const folderPath = path.join(resDir, folder);
      
      // Criar pasta se não existir
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }

      // Criar imagem com fundo #F5F1E8
      const createWithBackground = async (bgColor) => {
        const image = new Jimp(size, size, bgColor);
        const logo = source.clone();
        logo.resize(size * 0.9, size * 0.9, Jimp.RESIZE_CONTAIN);
        const x = (size - logo.bitmap.width) / 2;
        const y = (size - logo.bitmap.height) / 2;
        image.composite(logo, x, y);
        return image;
      };

      // Criar imagem transparente
      const createTransparent = async () => {
        const image = new Jimp(size, size, 0x00000000);
        const logo = source.clone();
        logo.resize(size * 0.9, size * 0.9, Jimp.RESIZE_CONTAIN);
        const x = (size - logo.bitmap.width) / 2;
        const y = (size - logo.bitmap.height) / 2;
        image.composite(logo, x, y);
        return image;
      };

      // Criar fundo sólido #1A4D2E
      const createSolidBackground = async () => {
        return new Jimp(size, size, 0x1A4D2EFF);
      };

      // Gerar ic_launcher.png
      const launcher = await createWithBackground(0xF5F1E8FF);
      await launcher.writeAsync(path.join(folderPath, 'ic_launcher.png'));

      // Gerar ic_launcher_round.png
      const round = await createWithBackground(0xF5F1E8FF);
      await round.writeAsync(path.join(folderPath, 'ic_launcher_round.png'));

      // Gerar ic_launcher_adaptive_fore.png (transparente)
      const adaptiveFore = await createTransparent();
      await adaptiveFore.writeAsync(path.join(folderPath, 'ic_launcher_adaptive_fore.png'));

      // Gerar ic_launcher_foreground.png (transparente)
      const foreground = await createTransparent();
      await foreground.writeAsync(path.join(folderPath, 'ic_launcher_foreground.png'));

      // Gerar ic_launcher_adaptive_back.png (fundo sólido)
      const adaptiveBack = await createSolidBackground();
      await adaptiveBack.writeAsync(path.join(folderPath, 'ic_launcher_adaptive_back.png'));

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


