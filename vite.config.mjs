import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'
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
