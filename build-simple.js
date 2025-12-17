// Build script simples usando esbuild
import * as esbuild from 'esbuild';
import { readFileSync } from 'fs';

try {
  const result = await esbuild.build({
    entryPoints: ['index.tsx'],
    bundle: true,
    outdir: 'dist',
    format: 'esm',
    platform: 'browser',
    target: 'es2020',
    loader: {
      '.tsx': 'tsx',
      '.ts': 'ts',
    },
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(process.env.GEMINI_API_KEY || ''),
    },
  });
  console.log('Build concluído!');
} catch (error) {
  console.error('Erro no build:', error);
  process.exit(1);
}

