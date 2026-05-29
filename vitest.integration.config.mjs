/**
 * Vitest config for integration tests that hit real external services.
 *
 * Key differences from vite.config.mjs test block:
 *  - Firebase is NOT aliased to mocks — real Firestore/Auth SDK runs.
 *  - Loads .env.development with dotenv so VITE_FIREBASE_* vars land in process.env.
 *  - Only includes *.integration.test.js files.
 *  - Longer timeouts for network round-trips.
 *
 * Run:
 *   npx vitest run --config vitest.integration.config.mjs
 *   npx vitest run --config vitest.integration.config.mjs <path/to/test.integration.test.js>
 */

import { defineConfig } from 'vite'
import path from 'node:path'
import dotenv from 'dotenv'

// Load .env.development unconditionally — Vitest mode is 'test', not 'development',
// so loadEnv('test', ...) would miss .env.development. dotenv is more reliable here.
dotenv.config({ path: path.resolve(import.meta.dirname, '.env.development') })

export default defineConfig({
  resolve: {
    alias: [
      {
        find: 'src/',
        replacement: `${path.resolve(import.meta.dirname, 'src')}/`,
      },
    ],
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
  },
  test: {
    globals: true,
    environment: 'node',
    pool: 'forks',
    include: ['src/**/*.integration.test.js'],
    setupFiles: ['src/__tests__/setup.js'],
    testTimeout: 60000,
    hookTimeout: 60000,
    alias: {
      // Stub browser-only Firebase SDKs — Firestore and Auth run real
      'firebase/messaging': path.resolve(import.meta.dirname, 'src/__tests__/__mocks__/firebase-messaging.js'),
      'firebase/database': path.resolve(import.meta.dirname, 'src/__tests__/__mocks__/firebase-database.js'),
    },
  },
})
