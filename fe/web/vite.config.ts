import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import WindiCSS from 'vite-plugin-windicss'
import path from "path";


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), WindiCSS()],
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom", "animejs",]
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
})
