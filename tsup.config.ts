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
  format: ['esm', 'cjs'], // Output formats
  dts: true,              // Generate .d.ts files
  splitting: true,        // Enable code splitting
  sourcemap: true,
  target: 'es2018',
  clean: true,
  outDir: 'dist'
}) 