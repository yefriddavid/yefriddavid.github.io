import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
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
  return {
    base: './',
    build: {
      outDir: 'build',
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
    plugins: [react(), versionPlugin()],
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
  }
})
