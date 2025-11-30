import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
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
