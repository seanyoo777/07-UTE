import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    /** 07-UTE fixed dev port (project number); no auto fallback. */
    port: 5107,
    strictPort: true,
  },
})
