import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    reporters: ['junit'],
    outputFile: {
      junit: './junit-report.xml',
    },
    environment: 'node',
    setupFiles: 'dotenv/config',
    coverage: {
      reporter: ['text', 'json', 'html', 'cobertura'],
    },
    env: {
      NODE_ENV: 'test',
    },
    projects: [
      {
        extends: true,
        test: {
          include: ['**/*.spec.ts'],
          name: 'unit',
        },
      },
      {
        extends: true,
        test: {
          include: ['test/**/*.e2e-spec.ts'],
          name: 'e2e',
        },
      },
    ],
  },
})
