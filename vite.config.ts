import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      pwaAssets: {
        preset: 'minimal-2023',
        image: 'public/logo512x512.png',
      },
      manifest: {
        name: 'Podify — Gestão para Podólogos',
        short_name: 'Podify',
        description: 'Sistema completo de gestão para clínicas de podologia',
        lang: 'pt-BR',
        theme_color: '#2f9d84',
        background_color: '#eef3f1',
        display: 'standalone',
        start_url: '/login',
        orientation: 'portrait',
      },
      workbox: {
        // Só cacheia assets estáticos (JS/CSS/fontes). Chamadas ao Supabase
        // (REST/Auth/Storage) nunca passam por nenhum urlPattern abaixo, logo
        // seguem sempre direto pra rede, sem cache.
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets',
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
  },
})
