import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()],
  assetsInclude: ['**/*.yaml'],
  test: {
    // Unit tests live next to source. tests/**/*.spec.ts are Playwright e2e specs
    // and must not be collected by vitest.
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: ['tests/**', 'node_modules/**', '.next/**'],
  },
});
