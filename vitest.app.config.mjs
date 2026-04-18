import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react({ babel: { presets: ['@babel/preset-react'] } })],
  resolve: {
    alias: [
      {
        find: 'src/',
        replacement: `${path.resolve(import.meta.dirname, 'src')}/`,
      },
    ],
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.scss'],
  },
  css: false,
  test: {
    globals: true,
    environment: 'jsdom',
    pool: 'forks',
    singleFork: true,
    include: ['src/__tests__/AppContent.test.jsx'],
    exclude: ['node_modules'],
    setupFiles: ['src/__tests__/setup.js'],
    testTimeout: 30000,
    alias: {
      'firebase/app':       path.resolve(import.meta.dirname, 'src/__tests__/__mocks__/firebase-app.js'),
      'firebase/auth':      path.resolve(import.meta.dirname, 'src/__tests__/__mocks__/firebase-auth.js'),
      'firebase/firestore': path.resolve(import.meta.dirname, 'src/__tests__/__mocks__/firebase-firestore.js'),
      'firebase/messaging': path.resolve(import.meta.dirname, 'src/__tests__/__mocks__/firebase-messaging.js'),
      '@coreui/react':      path.resolve(import.meta.dirname, 'src/__tests__/__mocks__/coreui-react.js'),
    },
  },
})
