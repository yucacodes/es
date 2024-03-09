import type { RollupOptions } from 'rollup'
import tsc from '@rollup/plugin-typescript'
import alias from '@rollup/plugin-alias'
import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import json from '@rollup/plugin-json'

const config: RollupOptions = {
  input: 'src/index.ts',
  plugins: [
    tsc(),
    alias(),
    commonjs(),
    nodeResolve({ preferBuiltins: true }),
    json(),
  ],
  output: {
    preserveModules: true,
    dir: 'dist',
    format: 'es',
  },
  external: ['crypto', 'http', 'inspector'],
}
export default config
