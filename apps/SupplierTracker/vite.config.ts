import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@shared": path.resolve(__dirname, "../shared"),
      "@reduxjs/toolkit": path.resolve(__dirname, "node_modules/@reduxjs/toolkit"),
      "react-redux": path.resolve(__dirname, "node_modules/react-redux"),
      "react": path.resolve(__dirname, "node_modules/react"),
      "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
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
