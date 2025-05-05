import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      include: ["buffer", "crypto"],
      globals: {
        Buffer: true,
      },
    }),
  ],
  base: "/",
  root: "src",
  build: {
    outDir: "../build",
    emptyOutDir: true,
    target: "esnext",
    rollupOptions: {
      output: {
        entryFileNames: "[name].js",
      },
    },
    sourcemap: false,
    minify: false,
  },
  publicDir: "../public",
});
