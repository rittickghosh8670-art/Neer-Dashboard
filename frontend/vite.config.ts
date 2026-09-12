import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Inside Docker Compose, containers reach each other by service name
// (e.g. "backend"), not "localhost". When running the frontend outside
// Docker (plain `npm run dev` on the host), the backend is reachable at
// localhost instead. BACKEND_URL lets docker-compose.yml override this
// per environment without code changes.
const backendTarget = process.env.BACKEND_URL || 'http://localhost:8080';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: backendTarget,
        changeOrigin: true,
      },
    },
  },
});
