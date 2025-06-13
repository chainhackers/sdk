import path from "node:path"
import { fileURLToPath } from "node:url"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const assetFileNames = (assetInfo: any) => {
  if (assetInfo.name?.endsWith(".css")) {
    return "index.css"
  }
  return "assets/[name][extname]"
}

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    assetsInlineLimit: 0,
    cssCodeSplit: false,

    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "@betswirl/ui",
    },
    rollupOptions: {
      external: (id) => {
        const externalPackages = [
          "react",
          "react-dom",
          "@betswirl/sdk-core",
          "@betswirl/wagmi-provider",
          "@coinbase/onchainkit",
          "@tanstack/react-query",
          "viem",
          "wagmi",
        ]

        return externalPackages.some((pkg) => id === pkg || id.startsWith(`${pkg}/`))
      },
      output: [
        {
          format: "es",
          entryFileNames: "index.mjs",
          chunkFileNames: "chunks/[name].mjs",
          assetFileNames,
        },
        {
          format: "cjs",
          entryFileNames: "index.js",
          chunkFileNames: "chunks/[name].js",
          assetFileNames,
        },
      ],
    },
    emptyOutDir: false,
    copyPublicDir: false, // Disable automatic publicDir copying
  },
})
