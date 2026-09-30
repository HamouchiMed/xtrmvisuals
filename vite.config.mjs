import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  build: {
    outDir: "dist/client",
  },
  optimizeDeps: {
    include: ["react", "react-dom/client"],
  },
  server: {
    host: "0.0.0.0",
    // terminal.local + the common tunnel services, so a client can open the
    // dev/preview server through a tunnel link (a leading dot = any subdomain)
    allowedHosts: ["terminal.local", ".trycloudflare.com", ".ngrok-free.app", ".ngrok.app", ".loca.lt"],
    warmup: {
      clientFiles: ["./src/main.jsx"],
    },
  },
  plugins: [react()],
});
