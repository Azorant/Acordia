import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/**/*.ts'],
  format: ['cjs', 'esm'],
  sourcemap: false,
  clean: true,
  unbundle: true,
  attw: true,
  exports: false,
});
