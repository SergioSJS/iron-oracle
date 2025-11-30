import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'manifest.json'],
      manifest: {
        name: 'Iron Oracle - Ironsworn & Starforged',
        short_name: 'Iron Oracle',
        description: 'Oracle tables for Ironsworn and Starforged RPG games',
        theme_color: '#c9a961',
        background_color: '#0a0806',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/iron-oracle/',
        start_url: '/iron-oracle/',
        icons: [
          {
            src: '/iron-oracle/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          },
          {
            src: '/iron-oracle/favicon.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          },
          {
            src: '/iron-oracle/favicon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,woff,ttf}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-static-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: false // Desabilitar em desenvolvimento para evitar problemas
      }
    }),
    // Plugin para redirecionar URLs sem barra final
    {
      name: 'redirect-no-trailing-slash',
      configureServer(server) {
        // Usar um middleware que roda ANTES do Vite processar
        return () => {
          server.middlewares.use((req, res, next) => {
            const url = req.url || '';
            const base = '/iron-oracle';
            
            // Ignorar tudo que não é relacionado ao base path
            if (!url.startsWith(base)) {
              next();
              return;
            }
            
            // Ignorar arquivos estáticos (com extensão)
            if (url.match(/\.[a-z]+$/i)) {
              next();
              return;
            }
            
            // Ignorar query strings e assets
            if (url.includes('?') || url.startsWith('/assets/')) {
              next();
              return;
            }
            
            // Se a URL é exatamente o base sem barra, redirecionar
            if (url === base) {
              res.writeHead(301, { Location: base + '/' });
              res.end();
              return;
            }
            
            // Se a URL começa com base mas não termina com barra, redirecionar
            if (url.startsWith(base) && !url.endsWith('/')) {
              res.writeHead(301, { Location: url + '/' });
              res.end();
              return;
            }
            
            next();
          });
        };
      },
      configurePreviewServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = req.url || '';
          const base = '/iron-oracle';
          
          // Ignorar tudo que não é relacionado ao base path
          if (!url.startsWith(base)) {
            next();
            return;
          }
          
          // Ignorar arquivos estáticos (com extensão)
          if (url.match(/\.[a-z]+$/i)) {
            next();
            return;
          }
          
          // Ignorar query strings e assets
          if (url.includes('?') || url.startsWith('/assets/')) {
            next();
            return;
          }
          
          // Se a URL é exatamente o base sem barra, redirecionar
          if (url === base) {
            res.writeHead(301, { Location: base + '/' });
            res.end();
            return;
          }
          
          // Se a URL começa com base mas não termina com barra, redirecionar
          if (url.startsWith(base) && !url.endsWith('/')) {
            res.writeHead(301, { Location: url + '/' });
            res.end();
            return;
          }
          
          next();
        });
      },
    },
  ],
  // Base path for GitHub Pages deployment
  // Uncomment and update if deploying to a subdirectory:
  // base: '/iron-oracle/',
  // For root deployment, use:
  base: '/iron-oracle/',
  preview: {
    // Configure preview server
    port: 4173,
    strictPort: false,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate Datasworn data into its own chunk
          'datasworn-starforged': ['@datasworn/starforged/json/starforged.json'],
          'datasworn-ironsworn': ['@datasworn/ironsworn-classic/json/classic.json'],
          // Separate react-icons into its own chunk
          'react-icons': ['react-icons/fa', 'react-icons/gi', 'react-icons/md'],
          // Separate React and ReactDOM
          'react-vendor': ['react', 'react-dom'],
        },
      },
    },
    // Increase chunk size warning limit (the JSON files are large by nature)
    chunkSizeWarningLimit: 1000,
  },
})
