import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'node:path'
import autoprefixer from 'autoprefixer'
import { writeFileSync } from 'node:fs'
import { execSync } from 'node:child_process'

function versionPlugin() {
  return {
    name: 'version-plugin',
    writeBundle() {
      let gitHash = 'dev'
      try {
        gitHash = execSync('git rev-parse --short HEAD').toString().trim()
      } catch {}
      writeFileSync('./build/version.json', JSON.stringify({ version: gitHash }))
    },
  }
}

export default defineConfig(() => {
  let gitHash = 'dev'
  try {
    gitHash = execSync('git rev-parse --short HEAD').toString().trim()
  } catch {}

  return {
    base: './',
    define: {
      __COMMIT_HASH__: JSON.stringify(gitHash),
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
      include: /src\/.*\.jsx?$/,
      exclude: [],
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
      react(),
      legacy({ targets: ['defaults', 'not IE 11'] }),
      VitePWA({
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
          start_url: './',
          scope: './',
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
        workbox: {
          // Cache app shell — exclude heavy reporting/flags bundles (>2MB)
          globPatterns: ['**/*.{js,css,html,ico,svg,woff,woff2}'],
          globIgnores: [
            '**/Reports*',
            '**/Flags*',
            '**/Brands*',
            '**/pdf.worker*',
          ],
          maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
          navigateFallback: 'index.html',
          navigateFallbackDenylist: [/^\/api/],
          runtimeCaching: [
            {
              // Google Fonts
              urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts',
                expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              },
            },
            {
              // Firebase Firestore — always go to network (real-time data)
              urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/i,
              handler: 'NetworkOnly',
            },
            {
              // Google Apps Script API — always go to network
              urlPattern: /^https:\/\/script\.google\.com\/.*/i,
              handler: 'NetworkOnly',
            },
          ],
        },
      }),
      versionPlugin(),
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
      include: ['src/**/*.test.js'],
    },
  }
})
