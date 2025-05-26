import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

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
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "@betswirl/sdk-core",
        "@coinbase/onchainkit",
        "@radix-ui/react-dialog",
        "@radix-ui/react-label",
        "@radix-ui/react-popover",
        "@radix-ui/react-scroll-area",
        "@radix-ui/react-slider",
        "@radix-ui/react-slot",
        "@tailwindcss/vite",
        "@tanstack/react-query",
        "class-variance-authority",
        "clsx",
        "loki",
        "lucide-react",
        "tailwind-merge",
        "tailwindcss",
        "tw-animate-css",
        "viem",
        "wagmi",
      ],
      output: [
        {
          format: "es",
          entryFileNames: "index.mjs",
          chunkFileNames: "chunks/[name].mjs",
          assetFileNames: (assetInfo) => {
            if (assetInfo.name && assetInfo.name.endsWith(".css")) {
              return "index.css";
            }
            return "assets/[name][extname]";
          },
        },
        {
          format: "cjs",
          entryFileNames: "index.js",
          chunkFileNames: "chunks/[name].js",
          assetFileNames: (assetInfo) => {
            if (assetInfo.name && assetInfo.name.endsWith(".css")) {
              return "index.css";
            }
            return "assets/[name][extname]";
          },
        },
      ],
    },
    emptyOutDir: false,
    copyPublicDir: false, // Disable automatic publicDir copying
  },
})
