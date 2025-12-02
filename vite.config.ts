import { fileURLToPath, URL } from 'node:url';
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
          '@': fileURLToPath(new URL('.', import.meta.url)),
        }
      },
      build: {
        rollupOptions: {
          external: (id) => {
            // Externalizar módulos Node.js que não devem estar no bundle
            if (
              id.startsWith('node:') ||
              ['path', 'fs', 'os', 'crypto', 'util', 'stream', 'events', 'buffer', 'url', 'http', 'https', 'net', 'tls', 'zlib', 'querystring'].includes(id) ||
              id.includes('node_modules') && (id.includes('@supabase/functions') || id.includes('edge-runtime'))
            ) {
              return true;
            }
            // Excluir arquivos de teste do build
            if (id.includes('test-') || id.includes('.test.') || id.includes('.spec.')) {
              return true;
            }
            return false;
          },
          output: {
            manualChunks: {
              'supabase': ['@supabase/supabase-js'],
            }
          },
          onwarn(warning, warn) {
            // Suprimir warnings sobre módulos externos e arquivos de teste
            if (
              warning.code === 'UNRESOLVED_IMPORT' || 
              warning.code === 'EXTERNAL' ||
              warning.id?.includes('test-') ||
              warning.id?.includes('.test.') ||
              warning.id?.includes('.spec.')
            ) {
              return;
            }
            warn(warning);
          }
        },
        commonjsOptions: {
          include: [/node_modules/],
          transformMixedEsModules: true
        }
      },
      optimizeDeps: {
        include: ['@supabase/supabase-js']
      }
    };
});
