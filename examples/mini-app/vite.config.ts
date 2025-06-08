import path from "node:path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const assetFileNames = (assetInfo: any) => {
  if (assetInfo.name?.endsWith(".css")) {
    return "index.css"
  }
  return "assets/[name][extname]"
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "ChainhackersUI",
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
