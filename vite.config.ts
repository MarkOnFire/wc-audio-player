import { defineConfig } from 'vite';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, existsSync } from 'fs';
import dts from 'vite-plugin-dts';

// Plugin to copy additional CSS files after build
const copyThemes = () => ({
  name: 'copy-themes',
  closeBundle() {
    const themesDir = resolve(__dirname, 'dist/themes');
    if (!existsSync(themesDir)) {
      mkdirSync(themesDir, { recursive: true });
    }
    // Copy minimal and variables CSS
    copyFileSync(
      resolve(__dirname, 'src/themes/minimal.css'),
      resolve(themesDir, 'minimal.css')
    );
    copyFileSync(
      resolve(__dirname, 'src/themes/variables.css'),
      resolve(themesDir, 'variables.css')
    );
    console.log('Copied additional theme files to dist/themes/');
  },
});

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      outDir: 'dist/types',
    }),
    copyThemes(),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'WCAudioPlayer',
      formats: ['es', 'umd'],
      fileName: (format) => `wc-audio-player.${format}.js`,
    },
    rollupOptions: {
      external: ['wavesurfer.js'],
      output: {
        globals: {
          'wavesurfer.js': 'WaveSurfer',
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') {
            return 'themes/default.css';
          }
          return assetInfo.name || 'assets/[name][extname]';
        },
      },
    },
    sourcemap: true,
    minify: 'esbuild', // Use esbuild instead of terser (built-in)
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
