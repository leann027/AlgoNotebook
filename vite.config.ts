import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'icons.svg'],
      manifest: {
        name: 'AlgoNotebook — Vol. IV Engineering Lab',
        short_name: 'AlgoNotebook',
        description: 'Interactive Data Structures & Algorithms visualizer with engineering lab sketchbook aesthetic and C99/Python 3 synchronized code.',
        theme_color: '#FDFBF7',
        background_color: '#FDFBF7',
        display: 'standalone',
        orientation: 'any',
        icons: [
          {
            src: 'favicon.svg',
            sizes: '192x192 512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,txt,woff,woff2,ttf}'],
      },
    }),
  ],
})
