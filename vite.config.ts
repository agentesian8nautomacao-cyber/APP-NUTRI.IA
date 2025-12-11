import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        rollupOptions: {
          output: {
            manualChunks(id) {
              // Não separar React em chunk separado para evitar problemas
              // Incluir React no bundle principal
              if (id.includes('node_modules')) {
                if (id.includes('@google/genai')) {
                  return 'vendor-google';
                }
                if (id.includes('recharts')) {
                  return 'vendor-charts';
                }
                // Incluir React e outras dependências no vendor principal
                // para evitar problemas de inicialização
                return 'vendor';
              }
            },
          },
          external: [],
        },
        chunkSizeWarningLimit: 1000, // Aumentar limite para 1MB
        commonjsOptions: {
          include: [/lucide-react/, /node_modules/],
        },
        minify: 'esbuild',
        target: 'es2022',
      },
    };
});
