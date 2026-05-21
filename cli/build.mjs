import * as esbuild from 'esbuild'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const srcRoot = resolve(__dirname, '../src')

await esbuild.build({
  entryPoints: [resolve(__dirname, 'index.js')],
  bundle: true,
  platform: 'node',
  packages: 'external',
  outfile: resolve(__dirname, 'dist/index.js'),
  plugins: [
    {
      name: 'vite-aliases',
      setup(build) {
        // Mirror the Vite alias: 'src/' → <root>/src/
        build.onResolve({ filter: /^src\// }, async (args) => {
          const result = await build.resolve('./' + args.path.slice(4), {
            resolveDir: srcRoot,
            kind: args.kind,
          })
          return result
        })

        // Redirect src/services/firebase/settings to the CLI shim
        build.onResolve({ filter: /\/settings$/ }, (args) => {
          if (args.resolveDir.includes('src/services/firebase')) {
            return { path: resolve(__dirname, 'shims/settings.js') }
          }
        })
      },
    },
  ],
})

console.log('CLI built → cli/dist/index.js')
