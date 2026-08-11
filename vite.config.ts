import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig(({ mode }) => ({
  base: "./",
  plugins: [react(), ...(mode === "singlefile" ? [viteSingleFile()] : [])],
  build: {
    target: "es2022",
    sourcemap: true,
    chunkSizeWarningLimit: 1000,
  },
}));
