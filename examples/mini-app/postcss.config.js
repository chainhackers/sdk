import tailwindcss from "@tailwindcss/postcss"
import autoprefixer from "autoprefixer"

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import postcss from "postcss"
import postcssImport from "postcss-import"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const fontsPath = path.resolve(__dirname, "src", "fonts.css")

const isProd = process.env.NODE_ENV === "production"
let isLayersUnpacked = false

/** @type {import('postcss').ProcessOptions} */
export default {
  plugins: [
    postcssImport,
    tailwindcss,
    autoprefixer,
    ...(isProd
      ? [
          {
            postcssPlugin: "unpack-tailwind-layers",
            OnceExit(root) {
              const layers = ["base", "components", "utilities", "theme", "properties"]
              root.walkAtRules("layer", (rule) => {
                if (layers.includes(rule.params)) {
                  if (Array.isArray(rule.nodes) && rule.nodes.length > 0) {
                    rule.replaceWith(...rule.nodes)
                  } else {
                    rule.remove()
                  }
                }
              })
              isLayersUnpacked = true
            },
          },
          {
            postcssPlugin: "append-fonts",
            OnceExit(root) {
              if (!isLayersUnpacked) {
                return
              }

              const fontsCSS = fs.readFileSync(fontsPath, "utf-8")
              const fontsRoot = postcss.parse(fontsCSS, { from: fontsPath })
              root.append(fontsRoot)
            },
          },
        ]
      : []),
  ],
}
