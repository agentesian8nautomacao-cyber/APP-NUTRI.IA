import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');

    return {
      server: {
        port: 3003,
        host: true,
        strictPort: false,
        hmr: {
          host: 'localhost',
          port: 3003,
          clientPort: 3003,
          // Desabilitar HMR se não conseguir conectar (evita erros de conexão)
          overlay: true,
        },
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      },
      resolve: {
        dedupe: ['react', 'react-dom'],
        alias: {
          '@': path.resolve(__dirname, '.'),
        },
      },
      build: {
        chunkSizeWarningLimit: 700,
        rollupOptions: {
          output: {
            // Não isolar react/react-dom nem um "vendor" genérico: isso quebra runtime
            // (useState undefined) por ordem de chunks / múltiplas cópias implícitas.
            manualChunks(id) {
              if (!id.includes('node_modules')) return;
              if (id.includes('@supabase')) return 'supabase';
              if (id.includes('@google')) return 'google-genai';
              if (id.includes('lucide-react')) return 'lucide';
              if (id.includes('recharts')) return 'recharts';
            },
          },
        },
      },
    };
});