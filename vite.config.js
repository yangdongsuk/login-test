import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "https://dev.okii.kr",
        changeOrigin: true,
        secure: false,
      },
      "/api/connect": {
        target: "https://dev.okii.kr",
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
  define: {
    global: "globalThis",
  },
});
