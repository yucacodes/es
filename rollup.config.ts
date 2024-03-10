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
    nodeResolve({
      preferBuiltins: true,
      resolveOnly: [
        'tsyringe',
        'pino',
        'express',
        'class-transformer',
        'class-validator',
        'socket.io',
      ],
    }),
    json(),
  ],
  output: {
    dir: 'dist',
    format: 'es',
    preserveModulesRoot: 'src',
  },
  onwarn: function (warning, handler) {
    if (warning.code === 'THIS_IS_UNDEFINED') {
      return
    }
    handler(warning)
  },
}
export default config
