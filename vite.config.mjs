import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'node:path'
import autoprefixer from 'autoprefixer'
import { writeFileSync, readFileSync } from 'node:fs'
import { execSync } from 'node:child_process'

function versionPlugin(gitHash, commitMessage, buildDate, appVersion) {
  return {
    name: 'version-plugin',
    writeBundle() {
      writeFileSync(
        './build/version.json',
        JSON.stringify({ hash: gitHash, commitMessage, buildDate, appVersion }),
      )
    },
  }
}

export default defineConfig(({ mode }) => {
  const isTest = mode === 'test' || process.env.VITEST
  let gitHash = 'dev'
  let commitMessage = ''
  try {
    gitHash = execSync('git rev-parse --short HEAD').toString().trim()
    commitMessage = execSync('git log -1 --pretty=%s').toString().trim()
  } catch {}
  const buildDate = new Date().toISOString()
  const appVersion = JSON.parse(readFileSync('./package.json', 'utf8')).version

  return {
    base: '/',
    // Vitest bundles Vite 6 which uses oxc instead of esbuild. oxc excludes .js
    // from JSX transform by default — override so src/.js files with JSX work in tests.
    oxc: {
      include: /src\/.*\.[jt]sx?$/,
      exclude: /node_modules/,
      jsx: { runtime: 'automatic' },
    },
    define: {
      __COMMIT_HASH__: JSON.stringify(gitHash),
      __COMMIT_MESSAGE__: JSON.stringify(commitMessage),
      __BUILD_DATE__: JSON.stringify(buildDate),
      __APP_VERSION__: JSON.stringify(appVersion),
    },
    build: {
      outDir: 'build',
      rollupOptions: {
        output: {
          // Only isolate heavy packages with no React peer deps.
          // Do NOT chunk react/react-dom/coreui/devextreme separately — it creates
          // duplicate React instances and breaks __SECRET_INTERNALS at runtime.
          manualChunks: {
            'vendor-firebase': ['firebase/app', 'firebase/firestore'],
            'vendor-pdfjs': ['pdfjs-dist'],
          },
        },
      },
    },
    css: {
      postcss: {
        plugins: [
          autoprefixer({}), // add options if needed
        ],
      },
      preprocessorOptions: {
        scss: {
          quietDeps: true,
          silenceDeprecations: ['import', 'legacy-js-api'],
        },
      },
    },
    esbuild: {
      loader: 'jsx',
      include: /(?:src|cypress)\/.*\.jsx?$/,
      exclude: /src\/views\/BACKUP\//,
    },
    optimizeDeps: {
      force: true,
      esbuildOptions: {
        loader: {
          '.js': 'jsx',
        },
      },
    },
    plugins: [
      react(isTest ? { babel: { presets: ['@babel/preset-react'] } } : {}),
      legacy({ targets: ['defaults', 'not IE 11'] }),
      VitePWA({
        strategies: 'injectManifest',
        srcDir: 'src/sw',
        filename: 'sw.js',
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        includeAssets: ['favicon.ico', 'icons/icon.svg'],
        manifest: {
          name: 'Mi Admin — Gestión de Taxis',
          short_name: 'Mi Admin',
          description: 'Panel de gestión de flota de taxis: liquidaciones, conductores, vehículos y auditoría',
          theme_color: '#1e3a5f',
          background_color: '#ffffff',
          display: 'standalone',
          orientation: 'portrait-primary',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: 'icons/icon.svg',
              sizes: 'any',
              type: 'image/svg+xml',
              purpose: 'any',
            },
            {
              src: 'icons/icon.svg',
              sizes: 'any',
              type: 'image/svg+xml',
              purpose: 'maskable',
            },
          ],
        },
        injectManifest: {
          globPatterns: ['**/*.{js,css,html,ico,svg,woff,woff2}'],
          globIgnores: ['**/Reports*', '**/Flags*', '**/Brands*', '**/pdf.worker*'],
          maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        },
      }),
      versionPlugin(gitHash, commitMessage, buildDate, appVersion),
    ],
    resolve: {
      alias: [
        /*{
          '@': path.resolve(__dirname, 'src'),
        },*/
        {
          find: 'src/',
          replacement: `${path.resolve(__dirname, 'src')}/`,
        },
        {
          find: '@appComponents',
          replacement: path.resolve(__dirname, 'src/components/shared'),
        },
      ],
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.scss'],
    },
    server: {
      port: 3000,
      proxy: {
        // https://vitejs.dev/config/server-options.html
      },
    },
    test: {
      globals: true,
      environment: 'node',
      pool: 'vmThreads',
      include: ['src/**/*.test.js', 'src/**/*.test.jsx'],
      setupFiles: ['src/__tests__/setup.js'],
      exclude: ["node_modules"],
      alias: {
        'firebase/app': path.resolve(__dirname, 'src/__tests__/__mocks__/firebase-app.js'),
        'firebase/auth': path.resolve(__dirname, 'src/__tests__/__mocks__/firebase-auth.js'),
        'firebase/firestore': path.resolve(__dirname, 'src/__tests__/__mocks__/firebase-firestore.js'),
        'firebase/messaging': path.resolve(__dirname, 'src/__tests__/__mocks__/firebase-messaging.js'),
      },
    },
  }
})
