import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@shared": path.resolve(__dirname, "../shared"),
    },
  },
  build: {
    sourcemap: true,
    minify: false,
  },
  define: {
    "process.env.NODE_ENV": '"development"',
  },
});
