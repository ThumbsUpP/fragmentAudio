import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import { fileURLToPath } from 'url';
import path from 'path';

// Get the directory name of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: 'es',
    sourcemap: true,
    preserveModules: true,
    preserveModulesRoot: 'src'
  },
  external: [
    // Node.js built-ins
    'fs', 'path', 'url', 'util', 'crypto', 'stream', 'events', 'os', 'http', 'https',
    // External dependencies
    'express', 'cors', 'dotenv', 'pg', 'sqlite3', 'typeorm'
  ],
  plugins: [
    resolve({
      preferBuiltins: true,
      extensions: ['.js', '.ts']
    }),
    commonjs(),
    json(),
    typescript({
      tsconfig: './tsconfig.json',
      sourceMap: true,
      inlineSources: true,
      declaration: true,
      declarationDir: 'dist',
      rootDir: 'src'
    })
  ]
};
