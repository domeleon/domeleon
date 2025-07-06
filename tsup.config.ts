import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/renderers/react/index.ts',
    'src/renderers/vue/index.ts',
    'src/addons/maskito/index.ts',
    'src/addons/unocss/index.ts',
    'src/addons/zod/index.ts',
    'src/addons/inspector/index.ts'
  ],
  format: ['esm'],
  dts: false,              // Declarations are generated in a separate ultra-fast pass
  splitting: true,
  sourcemap: true,
  target: 'es2018',
  clean: true,
  outDir: 'dist'
}) 