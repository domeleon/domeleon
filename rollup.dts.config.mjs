import dts from 'rollup-plugin-dts'

const outputs = [
  // root package
  {
    input: 'dist/types-temp/index.d.ts',
    file: 'dist/index.d.ts'
  },
  // scoped: react
  {
    input: 'dist/types-temp/renderers/react/index.d.ts',
    file: 'dist/renderers/react/index.d.ts'
  },
  // scoped: vue
  {
    input: 'dist/types-temp/renderers/vue/index.d.ts',
    file: 'dist/renderers/vue/index.d.ts'
  },
  // scoped: maskito
  {
    input: 'dist/types-temp/addons/maskito/index.d.ts',
    file: 'dist/addons/maskito/index.d.ts'
  },
  // scoped: unocss
  {
    input: 'dist/types-temp/addons/unocss/index.d.ts',
    file: 'dist/addons/unocss/index.d.ts'
  },
  // scoped: zod
  {
    input: 'dist/types-temp/addons/zod/index.d.ts',
    file: 'dist/addons/zod/index.d.ts'
  },
  // scoped: inspector
  {
    input: 'dist/types-temp/addons/inspector/index.d.ts',
    file: 'dist/addons/inspector/index.d.ts'
  }
]

export default outputs.map(({ input, file }) => ({
  input,
  output: { file, format: 'es' },
  plugins: [dts()]
})) 