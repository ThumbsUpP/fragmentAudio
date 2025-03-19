import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import { terser } from 'rollup-plugin-terser';

// This is important for Rollup to properly handle Node.js built-in modules
const external = [
  'express',
  'cors',
  'dotenv',
  'axios',
  'path',
  'fs',
  'http',
  'https',
  'url',
  'util',
  'stream',
  'zlib',
  'crypto',
  'querystring',
  'buffer',
  'os'
];

export default {
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: 'esm',
    sourcemap: true,
    preserveModules: true,
    preserveModulesRoot: 'src'
  },
  external,
  plugins: [
    resolve({ 
      preferBuiltins: true,
      exportConditions: ['node']
    }),
    commonjs(),
    json(),
    typescript({
      tsconfig: './tsconfig.json',
      sourceMap: true,
      inlineSources: true
    }),
    terser() // Minify the bundle
  ]
};
