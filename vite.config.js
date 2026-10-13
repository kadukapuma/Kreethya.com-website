import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  build: {
    // The robot chunk (three.js's WebGL renderer, ~140 kB gzipped) is loaded on its own
    // while the intro plays, so it never delays the page. Warn only above that size.
    chunkSizeWarningLimit: 600,
  },
})
