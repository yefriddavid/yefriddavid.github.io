import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  esbuild: {
    loader: 'jsx',
    include: /(?:src|cypress)\/.*\.jsx?$/,
    exclude: /src\/views\/BACKUP\//,
  },
  optimizeDeps: {
    force: true,
    esbuildOptions: { loader: { '.js': 'jsx' } },
  },
  resolve: {
    alias: [
      { find: 'src/', replacement: `${path.resolve(__dirname, 'src')}/` },
      {
        find: '@appComponents',
        replacement: path.resolve(__dirname, 'src/components/shared'),
      },
    ],
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.scss'],
  },
})
