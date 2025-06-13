import tailwindcss from '@tailwindcss/postcss'
import autoprefixer from 'autoprefixer'
import cssnano from 'cssnano'
//import postcss from 'postcss'
import postcssImport from 'postcss-import'
/*import fs from 'node:fs'
import path from "node:path"
import { fileURLToPath } from "node:url"*/

/*const __dirname = path.dirname(fileURLToPath(import.meta.url))
const fontsPath = path.resolve(__dirname, './src/fonts.css')
const fontsCSS = fs.readFileSync(fontsPath, 'utf-8')*/

const isProd = process.env.NODE_ENV === 'production'

/** @type {import('postcss').ProcessOptions} */
export default {
  plugins: [
    postcssImport,
    tailwindcss,
    autoprefixer,
    ...(isProd
      ? [
          {
            postcssPlugin: 'unpack-tailwind-layers',
            AtRule: {
              layer(rule) {
                const flatten = ['base', 'components', 'utilities', 'theme', 'properties']
                if (flatten.includes(rule.params)) {
                  if (Array.isArray(rule.nodes)) {
                    rule.replaceWith(...rule.nodes)
                  } else {
                    rule.remove()
                  }
                }
              },
            },
          },
          /*{
            postcssPlugin: 'append-fonts',
            Once(root) {
              console.log('!!!!!')
              const fontRoot = postcss.parse(fontsCSS, { from: fontsPath })
              root.append(fontRoot)
            },
          },*/
          cssnano({ preset: 'default' }),
        ]
      : []),
  ],
}

