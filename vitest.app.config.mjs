import { defineConfig, mergeConfig } from 'vitest/config'
import path from 'node:path'
import baseConfig from './vite.config.mjs'

export default mergeConfig(baseConfig({ mode: 'test' }), defineConfig({
  test: {
    globals: true,
    environment: 'node',
    pool: 'vmThreads',
    include: ['src/__tests__/AppContent.test.jsx'],
    exclude: ['node_modules'],
    setupFiles: ['src/__tests__/setup.js'],
    alias: {
      'firebase/app':       path.resolve(import.meta.dirname, 'src/__tests__/__mocks__/firebase-app.js'),
      'firebase/auth':      path.resolve(import.meta.dirname, 'src/__tests__/__mocks__/firebase-auth.js'),
      'firebase/firestore': path.resolve(import.meta.dirname, 'src/__tests__/__mocks__/firebase-firestore.js'),
      'firebase/messaging': path.resolve(import.meta.dirname, 'src/__tests__/__mocks__/firebase-messaging.js'),
    },
  },
}))
