import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Migration LumenOS vers un bundler. Build statique → compatible Vercel tel quel.
// Le code-splitting (React.lazy) et le hashing des assets sont automatiques.
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    target: 'es2020',
    // Un chunk séparé pour les grosses libs (mises en cache long terme par le navigateur)
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
        },
      },
    },
  },
  server: { port: 4179 },
});
